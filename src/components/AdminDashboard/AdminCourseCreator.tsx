import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  Eye,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Copy,
  Settings,
  BookOpen,
  Video,
  FileText,
  HelpCircle,
  CheckCircle,
  Play,
  Award,
  Clock,
  Search,
  ChevronLeft,
} from "lucide-react";

/**
 * AdminCourseCreator.tsx
 *
 * Single-file admin course editor + preview.
 * - LocalStorage backed
 * - Thumbnail upload (base64)
 * - Video upload (object URL preview)
 * - Publish toggle (list + editor)
 * - Delete (course/chapter/lesson) with confirm
 *
 * Paste into your project and import where needed.
 */

// ------------------ Types ------------------
type Attachment = { id: string; name: string; dataUrl: string };

type Lesson = {
  id: string;
  title: string;
  content?: string;
  videoUrl?: string;
  duration?: string;
  attachments?: Attachment[];
  quiz?: {
    id: string;
    question: string;
    options: string[];
    answerIndex: number;
  } | null;
};

type Chapter = { id: string; title: string; lessons: Lesson[] };

type Course = {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string; // base64 or external URL
  certificateAvailable?: boolean;
  published?: boolean;
  chapters: Chapter[];
};

// ------------------ LocalStorage helpers ------------------
const LS_PREFIX = "lms_local_v2";
function lsKey(key: string) {
  return `${LS_PREFIX}::${key}`;
}
function saveToLS<T>(key: string, value: T) {
  try {
    localStorage.setItem(lsKey(key), JSON.stringify(value));
  } catch (e) {
    console.warn("Failed to write to localStorage", e);
  }
}
function readFromLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(lsKey(key));
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.warn("Failed to read from localStorage", e);
    return fallback;
  }
}

// ------------------ Student Preview ------------------
function StudentPreview({ courses }: { courses: Course[] }) {
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id ?? "");
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(() => {
    const course = courses[0];
    return course?.chapters?.[0]?.lessons?.[0]?.id ?? null;
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCertificate, setShowCertificate] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [progressMap, setProgressMap] = useState<Record<string, { completed: boolean; completedAt?: string }>>(
    () => readFromLS("progress", {})
  );
  const [xpMap, setXpMap] = useState<Record<string, number>>(() => readFromLS("xp", {}));
  const [badgesMap, setBadgesMap] = useState<Record<string, string[]>>(() => readFromLS("badges", {}));
  const [quizState, setQuizState] = useState<Record<string, { answeredIndex: number | null; correct?: boolean }>>({});

  useEffect(() => saveToLS("progress", progressMap), [progressMap]);
  useEffect(() => saveToLS("xp", xpMap), [xpMap]);
  useEffect(() => saveToLS("badges", badgesMap), [badgesMap]);

  const selectedCourse = useMemo(() => courses.find((c) => c.id === selectedCourseId) ?? courses[0] ?? null, [
    courses,
    selectedCourseId,
  ]);
  if (!selectedCourse) return <div className="p-8 text-center text-slate-400">No courses available</div>;

  const allLessons = useMemo(() => selectedCourse.chapters.flatMap((ch) => ch.lessons), [selectedCourse]);
  const selectedLesson = useMemo(
    () => allLessons.find((l) => l.id === selectedLessonId) ?? allLessons[0] ?? null,
    [allLessons, selectedLessonId]
  );

  const filteredChapters = useMemo(() => {
    if (!searchQuery.trim()) return selectedCourse.chapters;
    const q = searchQuery.toLowerCase();
    return selectedCourse.chapters
      .map((ch) => ({ ...ch, lessons: ch.lessons.filter((l) => l.title.toLowerCase().includes(q)) }))
      .filter((ch) => ch.lessons.length > 0);
  }, [searchQuery, selectedCourse]);

  const lessonCompleted = (lessonId?: string) => !!(lessonId && progressMap[lessonId]?.completed);
  const totalLessons = selectedCourse.chapters.reduce((acc, ch) => acc + ch.lessons.length, 0);
  const completedCount = selectedCourse.chapters.reduce((acc, ch) => acc + ch.lessons.filter((l) => lessonCompleted(l.id)).length, 0);
  const coursePercent = Math.round((completedCount / Math.max(1, totalLessons)) * 100);

  const grantXp = (courseId: string, xp = 10) => {
    setXpMap((prev) => ({ ...prev, [courseId]: (prev[courseId] || 0) + xp }));
  };

  const awardBadge = (courseId: string, badgeName: string) => {
    setBadgesMap((prev) => {
      const list = prev[courseId] || [];
      if (list.includes(badgeName)) return prev;
      return { ...prev, [courseId]: [...list, badgeName] };
    });
  };

  const markComplete = (lessonId: string) => {
    if (progressMap[lessonId]?.completed) return;
    setProgressMap((prev) => ({ ...prev, [lessonId]: { completed: true, completedAt: new Date().toISOString() } }));
    grantXp(selectedCourse.id, 15);
    const newCompletedCount = completedCount + 1;
    if (newCompletedCount === totalLessons) {
      awardBadge(selectedCourse.id, "Course Completed — Gold Seal");
      grantXp(selectedCourse.id, 100);
    }
  };

  const goToNextLesson = (currentId?: string) => {
    const flat = allLessons;
    const idx = flat.findIndex((x) => x.id === currentId);
    if (idx >= 0 && idx < flat.length - 1) {
      setSelectedLessonId(flat[idx + 1].id);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTime = () => {
      if (selectedLesson && video.duration) {
        const pct = (video.currentTime / video.duration) * 100;
        if (pct >= 90 && !progressMap[selectedLesson.id]?.completed) {
          markComplete(selectedLesson.id);
        }
      }
    };

    const onEnded = () => {
      if (selectedLesson) goToNextLesson(selectedLesson.id);
    };

    video.addEventListener("timeupdate", onTime);
    video.addEventListener("ended", onEnded);
    return () => {
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("ended", onEnded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLesson, videoRef.current]);

  const submitQuiz = (quizId: string, selectedIndex: number, lessonQuiz: Lesson["quiz"]) => {
    const correct = lessonQuiz ? selectedIndex === lessonQuiz.answerIndex : false;
    setQuizState((p) => ({ ...p, [quizId]: { answeredIndex: selectedIndex, correct } }));
    if (correct) {
      grantXp(selectedCourse.id, 25);
      awardBadge(selectedCourse.id, "Quiz Master");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100">
      <div className="sticky top-0 bg-slate-900/60 backdrop-blur-sm border-b border-slate-700 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-md hover:bg-slate-800">
              {sidebarOpen ? <ChevronLeft /> : <ChevronRight />}
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-sky-500 rounded-lg flex items-center justify-center">
                <BookOpen />
              </div>
              <div>
                <div className="text-lg font-semibold">{selectedCourse.title}</div>
                <div className="text-xs text-slate-300">Preview Mode</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-300">
            <div className="flex items-center gap-2"><Clock /> <span>{completedCount} / {totalLessons} done</span></div>
            <div className="flex items-center gap-2"><Award /> <span>{xpMap[selectedCourse.id] || 0} XP</span></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        <aside className={`${sidebarOpen ? "w-80" : "w-16"} transition-all duration-300 bg-slate-800/40 border border-slate-700 rounded-xl p-4 overflow-y-auto max-h-[calc(100vh-140px)]`}>
          {sidebarOpen && (
            <>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1">
                  <div className="text-xs text-slate-400">Course Outline</div>
                  <div className="font-semibold truncate">{selectedCourse.title}</div>
                </div>
                <button onClick={() => setShowCertificate(true)} title="Certificate" className="p-2 rounded-md hover:bg-slate-700">
                  <FileText />
                </button>
              </div>

              <div className="mb-3 relative">
                <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search lessons..." className="w-full bg-slate-900/50 px-3 py-2 rounded-md placeholder-slate-400 text-sm" />
                <div className="absolute right-2 top-2 text-slate-400"><Search size={16} /></div>
              </div>

              <div className="mb-4">
                <div className="text-xs text-slate-400 mb-2">Progress</div>
                <div className="w-full bg-slate-700 rounded-full h-2 mb-3 overflow-hidden">
                  <div className="h-2 bg-amber-400" style={{ width: `${coursePercent}%` }} />
                </div>
                <div className="text-xs text-slate-300">{coursePercent}% complete • {completedCount}/{totalLessons} lessons</div>
              </div>

              <div className="space-y-4">
                {filteredChapters.map((ch) => (
                  <div key={ch.id}>
                    <div className="text-sm font-semibold text-slate-100 mb-2">{ch.title}</div>
                    <div className="space-y-1">
                      {ch.lessons.map((l) => (
                        <button key={l.id} onClick={() => { setSelectedLessonId(l.id); setShowCertificate(false); }} className={`w-full text-left p-2 rounded-md flex items-center justify-between hover:bg-slate-900/40 ${selectedLessonId === l.id ? "bg-slate-900/60" : ""}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-md flex items-center justify-center ${lessonCompleted(l.id) ? "bg-emerald-500 text-black" : "bg-slate-700"}`}>
                              {lessonCompleted(l.id) ? <CheckCircle size={18} /> : <Play size={18} />}
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm truncate">{l.title}</div>
                              <div className="text-xs text-slate-400">{l.duration ?? "-"}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 border-t border-slate-700 pt-4">
                <div className="text-xs text-slate-400 mb-2">Badges</div>
                <div className="flex flex-wrap gap-2">
                  {(badgesMap[selectedCourse.id] || []).length === 0 ? (
                    <div className="text-xs text-slate-400">No badges yet</div>
                  ) : (
                    (badgesMap[selectedCourse.id] || []).map((b) => (
                      <div key={b} className="bg-yellow-400 text-black px-2 py-1 rounded-md text-xs font-semibold">{b}</div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </aside>

        <main className="flex-1">
          {showCertificate ? (
            <div className="w-full h-[70vh] bg-slate-800/60 rounded-xl p-8 flex flex-col items-center justify-center">
              <div className="w-[900px] bg-white rounded-xl p-8 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">Certificate of Completion</div>
                    <div className="text-sm text-gray-500 mt-2">Awarded to</div>
                    <div className="text-3xl font-extrabold mt-4">Student Name</div>
                    <div className="mt-3 text-gray-600">For successfully completing the course</div>
                    <div className="font-semibold text-gray-900 mt-1">{selectedCourse.title}</div>
                  </div>
                  <div className="text-right">
                    <div className="px-4 py-2 bg-gradient-to-br from-amber-400 to-amber-500 rounded-md font-bold text-black">Gold • Tech</div>
                    <div className="text-xs text-slate-400 mt-4">Issued: {new Date().toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="mt-8 border-t pt-6 flex items-center justify-between">
                  <div className="text-sm text-slate-600">XP: {xpMap[selectedCourse.id] || 0}</div>
                  <div className="text-sm text-slate-600">Badges: {(badgesMap[selectedCourse.id] || []).join(", ") || "—"}</div>
                </div>
              </div>
              <button onClick={() => setShowCertificate(false)} className="mt-6 text-sm text-slate-300 hover:text-white">Close</button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-black rounded-xl overflow-hidden">
                {selectedLesson?.videoUrl ? (
                  <video ref={videoRef} src={selectedLesson.videoUrl} controls className="w-full aspect-video bg-black" />
                ) : (
                  <div className="aspect-video bg-slate-900 flex items-center justify-center text-slate-400">No video</div>
                )}
              </div>

              <div className="bg-slate-900/60 p-6 rounded-xl">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedLesson?.title ?? "Select a lesson"}</h2>
                    <div className="text-sm text-slate-400 mt-1">{selectedCourse.title} • {selectedLesson?.duration ?? "-"}</div>
                  </div>
                  <button onClick={() => selectedLesson && markComplete(selectedLesson.id)} className="px-4 py-2 rounded-md bg-emerald-500 text-slate-900 font-semibold">Mark Complete</button>
                </div>
                <div className="prose prose-invert" dangerouslySetInnerHTML={{ __html: selectedLesson?.content ?? "<p>No content</p>" }} />

                {selectedLesson?.quiz && (
                  <div className="mt-6 bg-slate-800/40 p-4 rounded-md border border-slate-700">
                    <div className="font-semibold">Quiz</div>
                    <div className="mt-2">{selectedLesson.quiz.question}</div>
                    <div className="mt-3 grid gap-2">
                      {selectedLesson.quiz.options.map((opt, i) => {
                        const state = quizState[selectedLesson.quiz!.id];
                        const selectedIndex = state?.answeredIndex ?? null;
                        const correct = state?.correct === true && selectedIndex === i;
                        const wrong = selectedIndex === i && state?.correct === false;
                        return (
                          <button key={i} onClick={() => submitQuiz(selectedLesson.quiz!.id, i, selectedLesson.quiz)} disabled={selectedIndex !== null} className={`text-left px-3 py-2 rounded-md ${correct ? "bg-emerald-600 text-black" : wrong ? "bg-red-600 text-white" : "bg-slate-800 hover:bg-slate-700"}`}>
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// ------------------ Admin Panel (main) ------------------
export default function AdminCourseCreator() {
  const [view, setView] = useState<"list" | "edit" | "preview">("list");
  const [courses, setCourses] = useState<Course[]>(() => readFromLS("courses", [] as Course[]));
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const thumbInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  // persist courses
  useEffect(() => {
    saveToLS("courses", courses);
  }, [courses]);

  const notify = (msg: string, type: "success" | "error" = "success") => {
    setNotification({ message: msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // create new course
  const createNewCourse = () => {
    const ts = Date.now();
    const newCourse: Course = {
      id: `course-${ts}`,
      title: "New Course",
      description: "Course description",
      thumbnail: "",
      certificateAvailable: true,
      published: false,
      chapters: [
        {
          id: `ch-${ts}`,
          title: "Chapter 1",
          lessons: [
            {
              id: `l-${ts}`,
              title: "Lesson 1",
              content: "<p>Lesson content goes here...</p>",
              duration: "10:00",
              videoUrl: "",
              quiz: null,
            },
          ],
        },
      ],
    };
    setEditingCourse(newCourse);
    setView("edit");
  };

  // edit existing course - deep copy to avoid accidental mutation
  const editCourse = (course: Course) => {
    setEditingCourse(JSON.parse(JSON.stringify(course)));
    setView("edit");
  };

  // save
  const saveCourse = () => {
    if (!editingCourse) return;
    const exists = courses.some((c) => c.id === editingCourse.id);
    if (exists) {
      setCourses((prev) => prev.map((c) => (c.id === editingCourse.id ? editingCourse : c)));
      notify("Course updated successfully!");
    } else {
      setCourses((prev) => [...prev, editingCourse]);
      notify("Course created successfully!");
    }
    setView("list");
    setEditingCourse(null);
  };

  // publish toggle (in list & editor) - toggles published boolean
  const togglePublish = (courseId: string) => {
    setCourses((prev) => prev.map((c) => (c.id === courseId ? { ...c, published: !c.published } : c)));
    // if editing this course, sync
    if (editingCourse?.id === courseId) {
      setEditingCourse({ ...editingCourse, published: !editingCourse.published });
    }
  };

  // delete course
  const deleteCourse = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this course? This cannot be undone.")) return;
    setCourses((prev) => prev.filter((c) => c.id !== id));
    if (editingCourse?.id === id) {
      setEditingCourse(null);
      setView("list");
    }
    notify("Course deleted");
  };

  // duplicate course
  const duplicateCourse = (course: Course) => {
    const copy = JSON.parse(JSON.stringify(course)) as Course;
    copy.id = `course-${Date.now()}`;
    copy.title = `${course.title} (Copy)`;
    setCourses((prev) => [...prev, copy]);
    notify("Course duplicated");
  };

  // editing helpers that auto-sync to saved courses if course already exists
  const syncEditingToCourses = (updated: Course) => {
    setEditingCourse(updated);
    setCourses((prev) => prev.some((c) => c.id === updated.id) ? prev.map((c) => (c.id === updated.id ? updated : c)) : prev);
  };

  const addChapter = () => {
    if (!editingCourse) return;
    const newChapter: Chapter = { id: `ch-${Date.now()}`, title: `Chapter ${editingCourse.chapters.length + 1}`, lessons: [] };
    const updated = { ...editingCourse, chapters: [...editingCourse.chapters, newChapter] };
    syncEditingToCourses(updated);
  };

  const updateChapter = (chapterId: string, updates: Partial<Chapter>) => {
    if (!editingCourse) return;
    const updated = { ...editingCourse, chapters: editingCourse.chapters.map((ch) => (ch.id === chapterId ? { ...ch, ...updates } : ch)) };
    syncEditingToCourses(updated);
  };

  const deleteChapter = (chapterId: string) => {
    if (!editingCourse) return;
    if (!window.confirm("Delete this chapter and all its lessons?")) return;
    const updated = { ...editingCourse, chapters: editingCourse.chapters.filter((ch) => ch.id !== chapterId) };
    syncEditingToCourses(updated);
    notify("Chapter deleted");
  };

  const addLesson = (chapterId: string) => {
    if (!editingCourse) return;
    const newLesson: Lesson = { id: `l-${Date.now()}`, title: "New Lesson", content: "<p>Lesson content...</p>", duration: "10:00", videoUrl: "", quiz: null };
    const updated = { ...editingCourse, chapters: editingCourse.chapters.map((ch) => (ch.id === chapterId ? { ...ch, lessons: [...ch.lessons, newLesson] } : ch)) };
    syncEditingToCourses(updated);
  };

  const updateLesson = (chapterId: string, lessonId: string, updates: Partial<Lesson>) => {
    if (!editingCourse) return;
    const updated = {
      ...editingCourse,
      chapters: editingCourse.chapters.map((ch) =>
        ch.id === chapterId ? { ...ch, lessons: ch.lessons.map((l) => (l.id === lessonId ? { ...l, ...updates } : l)) } : ch
      ),
    };
    syncEditingToCourses(updated);
  };

  const deleteLesson = (chapterId: string, lessonId: string) => {
    if (!editingCourse) return;
    if (!window.confirm("Delete this lesson?")) return;
    const updated = {
      ...editingCourse,
      chapters: editingCourse.chapters.map((ch) => (ch.id === chapterId ? { ...ch, lessons: ch.lessons.filter((l) => l.id !== lessonId) } : ch)),
    };
    syncEditingToCourses(updated);
    notify("Lesson deleted");
  };

  const addQuiz = (chapterId: string, lessonId: string) => {
    const quiz = { id: `q-${Date.now()}`, question: "Question text?", options: ["Option 1", "Option 2", "Option 3", "Option 4"], answerIndex: 0 };
    updateLesson(chapterId, lessonId, { quiz });
  };

  const toggleChapter = (chapterId: string) => setExpandedChapters((p) => ({ ...p, [chapterId]: !p[chapterId] }));

  // -------------- Uploads --------------
  // Thumbnail: base64 stored in course.thumbnail
  const handleThumbnailUpload = (file: File, targetCourseId?: string) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = String(reader.result || "");
      if (targetCourseId && editingCourse?.id === targetCourseId) {
        const updated = { ...editingCourse, thumbnail: base64 };
        syncEditingToCourses(updated);
      } else if (targetCourseId) {
        setCourses((prev) => prev.map((c) => (c.id === targetCourseId ? { ...c, thumbnail: base64 } : c)));
      }
      notify("Thumbnail uploaded");
    };
    reader.readAsDataURL(file);
  };

  // Video: store object URL in lesson.videoUrl
  const handleVideoUpload = (file: File, chapterId: string, lessonId: string) => {
    const url = URL.createObjectURL(file);
    updateLesson(chapterId, lessonId, { videoUrl: url });
    notify("Video ready for preview (local only)");
  };

  const triggerThumbnailInput = (courseId?: string) => {
    if (!thumbInputRef.current) return;
    const input = thumbInputRef.current;
    input.onchange = (e) => {
      const f = (e.target as HTMLInputElement).files?.[0];
      if (f) handleThumbnailUpload(f, courseId);
      input.value = "";
    };
    input.click();
  };
  const triggerVideoInput = (chapterId: string, lessonId: string) => {
    if (!videoInputRef.current) return;
    const input = videoInputRef.current;
    input.onchange = (e) => {
      const f = (e.target as HTMLInputElement).files?.[0];
      if (f) handleVideoUpload(f, chapterId, lessonId);
      input.value = "";
    };
    input.click();
  };

  // ---------- RENDER ----------

  // LIST VIEW
  if (view === "list") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-slate-100">
        {notification && (
          <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${notification.type === "success" ? "bg-emerald-500" : "bg-red-500"} text-white font-semibold`}>
            {notification.message}
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Course Management</h1>
              <p className="text-slate-300">Create, edit, and manage your courses</p>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={createNewCourse} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg font-semibold hover:from-emerald-600 hover:to-teal-600 transition">
                <Plus size={20} /> Create New Course
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="bg-slate-800/60 backdrop-blur-sm rounded-xl overflow-hidden border border-slate-700 hover:border-slate-600 transition group">
                <div className="h-48 bg-slate-700 overflow-hidden relative">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800">
                      <BookOpen size={48} className="text-slate-500" />
                    </div>
                  )}
                  <button onClick={() => triggerThumbnailInput(course.id)} className="absolute top-2 right-2 bg-slate-900/60 px-3 py-1 rounded-md text-sm">Upload</button>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2 flex items-center gap-3">
                        {course.title}
                        {/* Publish badge (Style A) */}
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${course.published ? "bg-emerald-100 text-emerald-700" : "bg-yellow-100 text-yellow-700"}`}>
                          {course.published ? "Published" : "Unpublished"}
                        </span>
                      </h3>
                      <p className="text-sm text-slate-400 mb-4 line-clamp-2">{course.description}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
                        <span>{course.chapters.length} chapters</span>
                        <span>•</span>
                        <span>{course.chapters.reduce((acc, ch) => acc + ch.lessons.length, 0)} lessons</span>
                        {course.certificateAvailable && (
                          <>
                            <span>•</span>
                            <Award size={14} />
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <button onClick={() => togglePublish(course.id)} className={`px-3 py-1 rounded ${course.published ? "bg-emerald-500 text-black" : "bg-yellow-400 text-black"}`}>
                        {course.published ? "Unpublish" : "Publish"}
                      </button>
                      <div className="flex gap-2">
                        <button onClick={() => editCourse(course)} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded transition flex items-center gap-2">
                          <Edit2 size={16} /> Edit
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button onClick={() => { setEditingCourse(course); setView("preview"); }} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition">
                      <Eye size={16} />
                    </button>
                    <button onClick={() => duplicateCourse(course)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition">
                      <Copy size={16} />
                    </button>
                    <button onClick={() => deleteCourse(course.id)} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {courses.length === 0 && (
            <div className="text-center py-20">
              <BookOpen size={64} className="mx-auto text-slate-600 mb-4" />
              <h3 className="text-2xl font-bold mb-2">No courses yet</h3>
              <p className="text-slate-400 mb-6">Create your first course to get started</p>
              <button onClick={createNewCourse} className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg font-semibold hover:from-emerald-600 hover:to-teal-600 transition">
                Create Course
              </button>
            </div>
          )}

          {/* hidden file inputs */}
          <input ref={thumbInputRef} type="file" accept="image/*" className="hidden" />
          <input ref={videoInputRef} type="file" accept="video/*" className="hidden" />
        </div>
      </div>
    );
  }

  // PREVIEW VIEW
  if (view === "preview" && editingCourse) {
    return (
      <div className="min-h-screen bg-slate-900">
        <div className="bg-indigo-900 border-b border-indigo-800 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setView("edit")} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition">
                <ArrowLeft size={18} /> Back to Editor
              </button>
              <div className="text-sm">
                <div className="font-semibold">Preview Mode</div>
                <div className="text-slate-300">See how students will view this course</div>
              </div>
            </div>
          </div>
        </div>
        <StudentPreview courses={[editingCourse]} />
      </div>
    );
  }

  // EDIT VIEW
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-slate-100">
      {notification && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${notification.type === "success" ? "bg-emerald-500" : "bg-red-500"} text-white font-semibold`}>
          {notification.message}
        </div>
      )}

      <div className="sticky top-0 bg-indigo-900/90 backdrop-blur-sm border-b border-indigo-800 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => { setView("list"); setEditingCourse(null); }} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition">
              <ArrowLeft size={18} /> Back
            </button>
            <div>
              <div className="font-semibold">Course Editor</div>
              <div className="text-xs text-slate-300">{editingCourse?.title}</div>
            </div>
          </div>

          <div className="flex gap-3 items-center">
            {/* Publish toggle in editor */}
            {editingCourse && (
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${editingCourse.published ? "bg-emerald-100 text-emerald-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {editingCourse.published ? "Published" : "Unpublished"}
                </span>
                <button onClick={() => {
                  if (!editingCourse) return;
                  const updated = { ...editingCourse, published: !editingCourse.published };
                  syncEditingToCourses(updated);
                  notify(updated.published ? "Course published" : "Course unpublished");
                }} className={`px-3 py-1 rounded ${editingCourse.published ? "bg-emerald-500 text-black" : "bg-yellow-400 text-black"}`}>
                  {editingCourse.published ? "Unpublish" : "Publish"}
                </button>
              </div>
            )}

            <button onClick={() => setView("preview")} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition">
              <Eye size={18} /> Preview
            </button>
            <button onClick={saveCourse} className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg font-semibold hover:from-emerald-600 hover:to-teal-600 transition">
              <Save size={18} /> Save Course
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {editingCourse && (
          <div className="space-y-6">
            {/* Course Details */}
            <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Settings size={24} /> Course Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Course Title</label>
                  <input type="text" value={editingCourse.title} onChange={(e) => syncEditingToCourses({ ...editingCourse, title: e.target.value })} className="w-full px-4 py-2 bg-slate-900/50 rounded-lg border border-slate-700 focus:border-blue-500 focus:outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Thumbnail</label>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-20 bg-slate-900 rounded overflow-hidden flex items-center justify-center">
                      {editingCourse.thumbnail ? (
                        <img src={editingCourse.thumbnail} alt="thumb" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-slate-500 text-xs">No thumbnail</div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <button onClick={() => triggerThumbnailInput(editingCourse.id)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded">Upload Thumbnail</button>
                      <button onClick={() => syncEditingToCourses({ ...editingCourse, thumbnail: "" })} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded">Remove</button>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2">Description</label>
                  <textarea value={editingCourse.description ?? ""} onChange={(e) => syncEditingToCourses({ ...editingCourse, description: e.target.value })} rows={3} className="w-full px-4 py-2 bg-slate-900/50 rounded-lg border border-slate-700 focus:border-blue-500 focus:outline-none" />
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={!!editingCourse.certificateAvailable} onChange={(e) => syncEditingToCourses({ ...editingCourse, certificateAvailable: e.target.checked })} className="w-5 h-5" />
                    <span className="font-semibold">Certificate Available</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Chapters & Lessons */}
            <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <BookOpen size={24} /> Chapters & Lessons
                </h2>
                <button onClick={addChapter} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition">
                  <Plus size={18} /> Add Chapter
                </button>
              </div>

              <div className="space-y-4">
                {editingCourse.chapters.map((chapter) => (
                  <div key={chapter.id} className="bg-slate-900/50 rounded-lg border border-slate-700">
                    <div className="p-4 flex items-center justify-between border-b border-slate-700">
                      <div className="flex items-center gap-3 flex-1">
                        <button onClick={() => toggleChapter(chapter.id)} className="text-slate-400 hover:text-slate-200">
                          {expandedChapters[chapter.id] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                        </button>
                        <input type="text" value={chapter.title} onChange={(e) => updateChapter(chapter.id, { title: e.target.value })} className="flex-1 px-3 py-2 bg-slate-800 rounded border border-slate-600 focus:border-blue-500 focus:outline-none font-semibold" />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => addLesson(chapter.id)} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded transition flex items-center gap-2">
                          <Plus size={16} /> Lesson
                        </button>
                        <button onClick={() => deleteChapter(chapter.id)} className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded transition">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {expandedChapters[chapter.id] && (
                      <div className="p-4 space-y-3">
                        {chapter.lessons.map((lesson) => (
                          <div key={lesson.id} className="bg-slate-800/60 rounded-lg p-4 border border-slate-600">
                            <div className="flex items-start justify-between mb-3">
                              <input type="text" value={lesson.title} onChange={(e) => updateLesson(chapter.id, lesson.id, { title: e.target.value })} className="flex-1 px-3 py-2 bg-slate-900 rounded border border-slate-600 focus:border-blue-500 focus:outline-none font-semibold" />
                              <button onClick={() => deleteLesson(chapter.id, lesson.id)} className="ml-3 px-3 py-2 bg-red-600 hover:bg-red-700 rounded transition">
                                <Trash2 size={16} />
                              </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-3">
                              <div>
                                <label className="block text-xs text-slate-400 mb-1">Video</label>
                                <div className="flex items-center gap-3">
                                  <div className="w-48 h-28 bg-black rounded overflow-hidden flex items-center justify-center">
                                    {lesson.videoUrl ? (
                                      <video src={lesson.videoUrl} controls className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="text-slate-400 text-xs">No video</div>
                                    )}
                                  </div>
                                  <div className="flex flex-col gap-2">
                                    <button onClick={() => triggerVideoInput(chapter.id, lesson.id)} className="px-3 py-2 rounded bg-slate-700 hover:bg-slate-600">Upload Video</button>
                                    <button onClick={() => updateLesson(chapter.id, lesson.id, { videoUrl: "" })} className="px-3 py-2 rounded bg-red-600 hover:bg-red-700">Remove</button>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <label className="block text-xs text-slate-400 mb-1">Duration</label>
                                <input type="text" value={lesson.duration ?? ""} onChange={(e) => updateLesson(chapter.id, lesson.id, { duration: e.target.value })} placeholder="10:30" className="w-full px-3 py-2 bg-slate-900 rounded border border-slate-600 focus:border-blue-500 focus:outline-none text-sm" />
                              </div>
                            </div>

                            <div className="mb-3">
                              <label className="block text-xs text-slate-400 mb-1">Lesson Content (HTML)</label>
                              <textarea value={lesson.content ?? ""} onChange={(e) => updateLesson(chapter.id, lesson.id, { content: e.target.value })} rows={3} className="w-full px-3 py-2 bg-slate-900 rounded border border-slate-600 focus:border-blue-500 focus:outline-none text-sm font-mono" />
                            </div>

                            <div className="border-t border-slate-700 pt-3">
                              {lesson.quiz ? (
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                                      <HelpCircle size={16} /> Quiz Attached
                                    </span>
                                    <button onClick={() => updateLesson(chapter.id, lesson.id, { quiz: null })} className="text-xs px-2 py-1 bg-red-600 hover:bg-red-700 rounded">
                                      Remove Quiz
                                    </button>
                                  </div>
                                  <input type="text" value={lesson.quiz.question} onChange={(e) => updateLesson(chapter.id, lesson.id, { quiz: { ...lesson.quiz!, question: e.target.value } })} placeholder="Quiz question" className="w-full px-3 py-2 bg-slate-900 rounded border border-slate-600 focus:border-blue-500 focus:outline-none text-sm" />
                                  <div className="space-y-2">
                                    {lesson.quiz.options.map((opt, optIdx) => (
                                      <div key={optIdx} className="flex gap-2">
                                        <input type="radio" name={`quiz-${lesson.id}`} checked={lesson.quiz!.answerIndex === optIdx} onChange={() => updateLesson(chapter.id, lesson.id, { quiz: { ...lesson.quiz!, answerIndex: optIdx } })} className="mt-1" />
                                        <input type="text" value={opt} onChange={(e) => {
                                          const newOptions = [...lesson.quiz!.options];
                                          newOptions[optIdx] = e.target.value;
                                          updateLesson(chapter.id, lesson.id, { quiz: { ...lesson.quiz!, options: newOptions } });
                                        }} className="flex-1 px-3 py-2 bg-slate-900 rounded border border-slate-600 focus:border-blue-500 focus:outline-none text-sm" />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <button onClick={() => addQuiz(chapter.id, lesson.id)} className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded transition text-sm">
                                  <Plus size={14} /> Add Quiz
                                </button>
                              )}
                            </div>
                          </div>
                        ))}

                        {chapter.lessons.length === 0 && (
                          <div className="text-center py-8 text-slate-400">
                            <Video size={32} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No lessons yet. Click "Add Lesson" to create one.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* hidden file inputs */}
        <input ref={thumbInputRef} type="file" accept="image/*" className="hidden" />
        <input ref={videoInputRef} type="file" accept="video/*" className="hidden" />
      </div>
    </div>
  );
}
