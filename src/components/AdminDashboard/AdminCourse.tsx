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
  UserPlus,
} from "lucide-react";

/**
 * Course Management System with Enrollment
 * 
 * Mock API endpoints (replace with real backend):
 * GET    /api/courses - fetch all courses
 * POST   /api/courses - create course
 * PUT    /api/courses/:id - update course
 * DELETE /api/courses/:id - delete course
 * GET    /api/user/all - fetch all users
 * POST   /api/enroll - enroll users in course
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
  thumbnail?: string;
  certificateAvailable?: boolean;
  published?: boolean;
  chapters: Chapter[];
};

type Learner = {
  id: string | number;
  name?: string;
  email: string;
  avatar?: string | null;
};

// ------------------ Mock API Helper ------------------
const mockApi = {
  courses: [] as Course[],
  users: [
    { id: 1, name: "John Doe", email: "john@example.com", avatar: null },
    { id: 2, name: "Jane Smith", email: "jane@example.com", avatar: null },
    { id: 3, name: "Bob Johnson", email: "bob@example.com", avatar: null },
    { id: 4, name: "Alice Williams", email: "alice@example.com", avatar: null },
    { id: 5, name: "Charlie Brown", email: "charlie@example.com", avatar: null },
  ] as Learner[],
  
  getCourses: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...mockApi.courses];
  },
  
  createCourse: async (data: any) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const course = { ...data, id: data.id || `course-${Date.now()}` };
    mockApi.courses.push(course);
    return course;
  },
  
  updateCourse: async (id: string, data: any) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockApi.courses.findIndex(c => c.id === id);
    if (index >= 0) {
      mockApi.courses[index] = { ...mockApi.courses[index], ...data };
      return mockApi.courses[index];
    }
    throw new Error("Course not found");
  },
  
  deleteCourse: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    mockApi.courses = mockApi.courses.filter(c => c.id !== id);
    return { success: true };
  },
  
  getUsers: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...mockApi.users];
  },
  
  enrollUsers: async (courseId: string, learners: any[]) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log(`Enrolled ${learners.length} users to course ${courseId}`);
    return { success: true, enrolled: learners.length };
  }
};

// ------------------ StudentPreview Component ------------------
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

  const [progressMap, setProgressMap] = useState<Record<string, { completed: boolean; completedAt?: string }>>({});
  const [xpMap, setXpMap] = useState<Record<string, number>>({});
  const [badgesMap, setBadgesMap] = useState<Record<string, string[]>>({});
  const [quizState, setQuizState] = useState<Record<string, { answeredIndex: number | null; correct?: boolean }>>({});

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
  }, [selectedLesson, progressMap]);

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
              <div className="w-full max-w-4xl bg-white rounded-xl p-8 shadow-2xl">
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
                <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: selectedLesson?.content ?? "<p>No content</p>" }} />

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

// ------------------ Main Admin Component ------------------
export default function AdminCourse() {
  const [view, setView] = useState<"list" | "edit" | "preview">("list");
  const [courses, setCourses] = useState<Course[]>([]);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const thumbInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  // Enrollment Drawer State
  const [showEnrollDrawer, setShowEnrollDrawer] = useState(false);
  const [enrollTargetCourse, setEnrollTargetCourse] = useState<Course | null>(null);
  const [learners, setLearners] = useState<Learner[]>([]);
  const [learnersLoading, setLearnersLoading] = useState(false);
  const [learnersError, setLearnersError] = useState<string | null>(null);
  const [enrollInput, setEnrollInput] = useState("");
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [selectedLearners, setSelectedLearners] = useState<Learner[]>([]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const notify = (msg: string, type: "success" | "error" = "success") => {
    setNotification({ message: msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  async function fetchCourses() {
    try {
      const data = await mockApi.getCourses();
      setCourses(data || []);
    } catch (err) {
      console.error("Failed to load courses", err);
      setCourses([]);
      notify("Failed to load courses", "error");
    }
  }

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
    setExpandedChapters({ [`ch-${ts}`]: true });
    setView("edit");
  };

  const editCourse = (course: Course) => {
    setEditingCourse(JSON.parse(JSON.stringify(course)));
    setView("edit");
  };

  const saveCourse = async () => {
    try {
      if (!editingCourse) {
        notify("No course to save", "error");
        return;
      }

      const existsOnServer = courses.some((c) => c.id === editingCourse.id);

      if (!existsOnServer) {
        await mockApi.createCourse(editingCourse);
        notify("Course created successfully!", "success");
      } else {
        await mockApi.updateCourse(editingCourse.id, editingCourse);
        notify("Course updated successfully!", "success");
      }

      await fetchCourses();
      setView("list");
      setEditingCourse(null);
    } catch (err: any) {
      console.error(err);
      notify("Error saving course", "error");
    }
  };

  const togglePublish = async (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    if (!course) return;
    try {
      const updated = { ...course, published: !course.published };
      await mockApi.updateCourse(courseId, updated);
      await fetchCourses();
      notify(updated.published ? "Course published" : "Course unpublished");
    } catch (err) {
      console.error("Failed to toggle publish", err);
      notify("Failed to toggle publish", "error");
    }
  };

  const deleteCourse = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this course? This cannot be undone.")) return;
    try {
      await mockApi.deleteCourse(id);
      await fetchCourses();
      if (editingCourse?.id === id) {
        setEditingCourse(null);
        setView("list");
      }
      notify("Course deleted");
    } catch (err) {
      console.error("Delete failed", err);
      notify("Failed to delete course", "error");
    }
  };

  const duplicateCourse = async (course: Course) => {
    const copy = JSON.parse(JSON.stringify(course)) as Course;
    copy.id = `course-${Date.now()}`;
    copy.title = `${course.title} (Copy)`;
    copy.published = false;
    
    try {
      await mockApi.createCourse(copy);
      await fetchCourses();
      notify("Course duplicated successfully");
    } catch (err) {
      notify("Failed to duplicate course", "error");
    }
  };

  const syncEditingToCourses = (updated: Course) => {
    setEditingCourse(updated);
  };

  const addChapter = () => {
    if (!editingCourse) return;
    const newChapter: Chapter = { 
      id: `ch-${Date.now()}`, 
      title: `Chapter ${editingCourse.chapters.length + 1}`, 
      lessons: [] 
    };
    const updated = { ...editingCourse, chapters: [...editingCourse.chapters, newChapter] };
    setExpandedChapters(prev => ({ ...prev, [newChapter.id]: true }));
    syncEditingToCourses(updated);
  };

  const updateChapter = (chapterId: string, updates: Partial<Chapter>) => {
    if (!editingCourse) return;
    const updated = { 
      ...editingCourse, 
      chapters: editingCourse.chapters.map((ch) => (ch.id === chapterId ? { ...ch, ...updates } : ch)) 
    };
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
    const newLesson: Lesson = { 
      id: `l-${Date.now()}`, 
      title: "New Lesson", 
      content: "<p>Lesson content goes here...</p>", 
      duration: "10:00", 
      videoUrl: "", 
      quiz: null 
    };
    const updated = { 
      ...editingCourse, 
      chapters: editingCourse.chapters.map((ch) => 
        ch.id === chapterId ? { ...ch, lessons: [...ch.lessons, newLesson] } : ch
      ) 
    };
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
      chapters: editingCourse.chapters.map((ch) => 
        ch.id === chapterId ? { ...ch, lessons: ch.lessons.filter((l) => l.id !== lessonId) } : ch
      ),
    };
    syncEditingToCourses(updated);
    notify("Lesson deleted");
  };

  const addQuiz = (chapterId: string, lessonId: string) => {
    const quiz = { 
      id: `q-${Date.now()}`, 
      question: "What is the correct answer?", 
      options: ["Option 1", "Option 2", "Option 3", "Option 4"], 
      answerIndex: 0 
    };
    updateLesson(chapterId, lessonId, { quiz });
  };

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((p) => ({ ...p, [chapterId]: !p[chapterId] }));
  };

  const handleThumbnailUpload = (file: File, targetCourseId?: string) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = String(reader.result || "");
      if (editingCourse && targetCourseId === editingCourse.id) {
        const updated = { ...editingCourse, thumbnail: base64 };
        syncEditingToCourses(updated);
      }
      notify("Thumbnail uploaded");
    };
    reader.readAsDataURL(file);
  };

  const handleVideoUpload = (file: File, chapterId: string, lessonId: string) => {
    const url = URL.createObjectURL(file);
    updateLesson(chapterId, lessonId, { videoUrl: url });
    notify("Video uploaded (preview only)");
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

  const openEnrollDrawer = (course: Course) => {
    setEnrollTargetCourse(course);
    setEnrollInput("");
    setSelectedLearners([]);
    setSuggestionsOpen(false);
    setShowEnrollDrawer(true);
    fetchLearners();
  };

  const fetchLearners = async () => {
    setLearnersLoading(true);
    setLearnersError(null);
    try {
      const data = await mockApi.getUsers();
      setLearners(data || []);
    } catch (err: any) {
      console.error("Failed to fetch learners", err);
      setLearnersError("Failed to load learners");
      setLearners([]);
    } finally {
      setLearnersLoading(false);
    }
  };

  const suggestions = useMemo(() => {
    const q = enrollInput.trim().toLowerCase();
    if (!q) return learners.slice(0, 8);
    return learners
      .filter((l) => (l.name || "").toLowerCase().includes(q) || l.email.toLowerCase().includes(q))
      .slice(0, 8);
  }, [learners, enrollInput]);

  const addLearnerToSelection = (learner: Learner) => {
    if (selectedLearners.some((s) => String(s.id) === String(learner.id) || s.email === learner.email)) return;
    setSelectedLearners((p) => [...p, learner]);
    setEnrollInput("");
    setSuggestionsOpen(false);
  };

  const removeSelectedLearner = (idOrEmail: string) => {
    setSelectedLearners((p) => p.filter((l) => String(l.id) !== idOrEmail && l.email !== idOrEmail));
  };

  const addAdHocLearner = () => {
    const text = enrollInput.trim();
    if (!text) return;
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);
    const generated: Learner = {
      id: `adhoc-${Date.now()}`,
      name: isEmail ? undefined : text,
      email: isEmail ? text : `${text.toLowerCase().replace(/\s+/g, ".")}@example.com`,
      avatar: null,
    };
    addLearnerToSelection(generated);
  };

  const submitEnrollment = async () => {
    if (!enrollTargetCourse) return;

    const toEnroll: Array<any> = selectedLearners.length > 0 ? [...selectedLearners] : [];

    if (toEnroll.length === 0 && enrollInput.trim()) {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enrollInput.trim());
      const adhoc: Learner = {
        id: `adhoc-${Date.now()}`,
        name: isEmail ? undefined : enrollInput.trim(),
        email: enrollInput.trim(),
        avatar: null,
      };
      toEnroll.push(adhoc);
    }

    if (toEnroll.length === 0) {
      notify("Please select or enter at least one learner", "error");
      return;
    }

    try {
      await mockApi.enrollUsers(enrollTargetCourse.id, toEnroll);
      notify(`Enrolled ${toEnroll.length} learner(s) to "${enrollTargetCourse.title}"`);
      setShowEnrollDrawer(false);
      setEnrollInput("");
      setSelectedLearners([]);
    } catch (err) {
      console.error("Enrollment failed", err);
      notify("Failed to enroll learners", "error");
    }
  };

  const handleEnrollInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (suggestions.length > 0 && enrollInput.trim()) {
        const exact = suggestions.find(
          (s) => s.email.toLowerCase() === enrollInput.trim().toLowerCase() || 
                 (s.name || "").toLowerCase() === enrollInput.trim().toLowerCase()
        );
        if (exact) {
          addLearnerToSelection(exact);
          return;
        }
      }
      addAdHocLearner();
    }
    if (e.key === "ArrowDown") {
      setSuggestionsOpen(true);
    }
  };

  // ---------- RENDER ----------
  if (view === "list") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {notification && (
          <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${notification.type === "success" ? "bg-emerald-500" : "bg-red-500"} text-white font-semibold`}>
            {notification.message}
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Course Management</h1>
              <p className="text-slate-600">Create, edit, and manage your courses</p>
            </div>
            <button onClick={createNewCourse} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-semibold hover:from-emerald-600 hover:to-teal-600 transition shadow-lg">
              <Plus size={20} /> Create New Course
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-xl overflow-hidden border border-slate-200 hover:border-slate-300 hover:shadow-xl transition group">
                <div className="h-48 bg-slate-100 overflow-hidden relative">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen size={48} className="text-slate-300" />
                    </div>
                  )}
                  <button onClick={() => triggerThumbnailInput(course.id)} className="absolute top-2 right-2 bg-white/90 hover:bg-white px-3 py-1 rounded-md text-sm text-slate-700 font-medium shadow">
                    Upload
                  </button>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-3">
                        {course.title}
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${course.published ? "bg-emerald-100 text-emerald-700" : "bg-yellow-100 text-yellow-700"}`}>
                          {course.published ? "Published" : "Draft"}
                        </span>
                      </h3>
                      <p className="text-sm text-slate-600 mb-4 line-clamp-2">{course.description}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
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
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => editCourse(course)} className="flex-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition flex items-center justify-center gap-2">
                      <Edit2 size={16} /> Edit
                    </button>
                    <button onClick={() => { setEditingCourse(course); setView("preview"); }} className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg transition">
                      <Eye size={16} />
                    </button>
                    <button onClick={() => duplicateCourse(course)} className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg transition">
                      <Copy size={16} />
                    </button>
                    <button onClick={() => deleteCourse(course.id)} className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition">
                      <Trash2 size={16} />
                    </button>
                    <button onClick={() => openEnrollDrawer(course)} className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition">
                      <UserPlus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {courses.length === 0 && (
            <div className="text-center py-20">
              <BookOpen size={64} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-2xl text-slate-900 font-bold mb-2">No courses yet</h3>
              <p className="text-slate-600 mb-6">Create your first course to get started</p>
              <button onClick={createNewCourse} className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-semibold hover:from-emerald-600 hover:to-teal-600 transition shadow-lg">
                Create Course
              </button>
            </div>
          )}

          {/* ENROLLMENT DRAWER */}
          <div className={`fixed inset-0 z-50 transition ${showEnrollDrawer ? "visible" : "invisible"}`}>
            <div className={`absolute inset-0 bg-black/50 transition-opacity ${showEnrollDrawer ? "opacity-100" : "opacity-0"}`} onClick={() => setShowEnrollDrawer(false)} />

            <div className={`absolute top-0 right-0 h-full w-96 bg-white text-slate-900 border-l border-slate-200 p-6 shadow-xl transform transition-transform ${showEnrollDrawer ? "translate-x-0" : "translate-x-full"}`} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1 text-slate-900">Enroll Learners</h2>
                  <p className="text-sm text-slate-600">Course: <strong>{enrollTargetCourse?.title}</strong></p>
                </div>
                <button onClick={() => setShowEnrollDrawer(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2 text-slate-700">Search learners</label>
                <div className="relative">
                  <input type="text" value={enrollInput} onChange={(e) => { setEnrollInput(e.target.value); setSuggestionsOpen(true); }} onKeyDown={handleEnrollInputKey} placeholder="Type name or email..." className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-500" />

                  {suggestionsOpen && (enrollInput.trim() !== "" || learners.length > 0) && (
                    <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-auto z-40">
                      {learnersLoading ? (
                        <div className="p-3 text-sm text-slate-600">Loading...</div>
                      ) : learnersError ? (
                        <div className="p-3 text-sm text-red-600">{learnersError}</div>
                      ) : suggestions.length === 0 ? (
                        <div className="p-3 text-sm text-slate-600">No matches — press Enter to add</div>
                      ) : (
                        suggestions.map((s) => (
                          <button key={String(s.id)} onClick={() => addLearnerToSelection(s)} className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-3">
                            <img src={s.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name || s.email)}&background=random`} alt={s.name || s.email} className="w-8 h-8 rounded-full object-cover" />
                            <div className="flex-1">
                              <div className="text-sm font-semibold text-slate-900">{s.name || s.email}</div>
                              <div className="text-xs text-slate-500">{s.email}</div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2 text-slate-700">Selected learners</label>
                <div className="flex flex-wrap gap-2 min-h-[60px] p-3 bg-slate-50 rounded-lg border border-slate-200">
                  {selectedLearners.length === 0 ? (
                    <div className="text-sm text-slate-400">No learners selected yet</div>
                  ) : (
                    selectedLearners.map((l) => (
                      <div key={String(l.id)} className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                        <img src={l.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(l.name || l.email)}&background=random`} alt={l.name || l.email} className="w-6 h-6 rounded-full object-cover" />
                        <div className="text-sm text-slate-700">{l.name || l.email}</div>
                        <button onClick={() => removeSelectedLearner(String(l.id))} className="ml-1 text-slate-400 hover:text-slate-600">✕</button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex gap-2 mb-6">
                <button onClick={() => { addAdHocLearner(); setSuggestionsOpen(false); }} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-medium">
                  Add Typed
                </button>
                <button onClick={() => { setSelectedLearners([]); setEnrollInput(""); setSuggestionsOpen(false); }} className="px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-600">
                  Clear
                </button>
              </div>

              <div className="border-t border-slate-200 pt-4 flex justify-end gap-3">
                <button onClick={() => setShowEnrollDrawer(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-medium">
                  Cancel
                </button>
                <button onClick={submitEnrollment} className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg shadow-md">
                  Enroll Selected
                </button>
              </div>
            </div>
          </div>

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
        <div className="bg-white border-b border-indigo-800 px-4 py-3">
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
    <div className="min-h-screen text-slate-100">
      {notification && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${notification.type === "success" ? "bg-emerald-500" : "bg-red-500"} text-white font-semibold`}> {notification.message } </div>
      )}

      <div className="sticky top-0 bg-white backdrop-blur-sm border-b border-black z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => { setView("list"); setEditingCourse(null); }} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition">
              <ArrowLeft size={18} /> Back
            </button>
            <div>
              <div className="font-semibold text-black">Course Editor</div>
              <div className="text-xs text-black">{editingCourse?.title}</div>
            </div>
          </div>

          <div className="flex gap-3 items-center">
            {editingCourse && (
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${editingCourse.published ? "bg-emerald-100 text-emerald-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {editingCourse.published ? "Published" : "Unpublished"}
                </span>
                <button onClick={() => {
                  if (!editingCourse) return;
                  const updated = { ...editingCourse, published: !editingCourse.published };
                  syncEditingToCourses(updated);
                  notify(updated.published ? "Course published (local)" : "Course unpublished (local)");
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
            <div className="bg-white backdrop-blur-sm rounded-xl p-6 border border-slate-700">
              <h2 className="text-2xl font-bold mb-6  text-black flex items-center gap-2">
                <Settings size={24} /> Course Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">Course Title</label>
                  <input type="text"
                    value={editingCourse.title} onChange={(e) => syncEditingToCourses({ ...editingCourse, title: e.target.value })} className="w-full px-4 py-2 bg-white rounded-lg border border-black focus:border-black focus:outline-none text-black"
                    placeholder={editingCourse.title ? "Course Title" : "Title"}
                  />
                </div>

                <div>
                  <label className="block text-sm text-black font-semibold mb-2">Thumbnail</label>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-20 bg-white rounded border borber-black overflow-hidden flex items-center justify-center">
                      {editingCourse.thumbnail ? (
                        <img src={editingCourse.thumbnail} alt="thumb" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-black text-xs">No thumbnail</div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <button onClick={() => triggerThumbnailInput(editingCourse.id)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded">Upload Thumbnail</button>
                      <button onClick={() => syncEditingToCourses({ ...editingCourse, thumbnail: "" })} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded">Remove</button>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-black  font-semibold mb-2">Description</label>
                  <textarea value={editingCourse.description ?? ""} onChange={(e) => syncEditingToCourses({ ...editingCourse, description: e.target.value })} rows={3} className="w-full px-4 py-2 bg-white rounded-lg border border-black focus:border-black focus:outline-none text-black"
                    placeholder={editingCourse.title ? "Course Description" : "Description"}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={!!editingCourse.certificateAvailable} onChange={(e) => syncEditingToCourses({ ...editingCourse, certificateAvailable: e.target.checked })} className="w-5 h-5" />
                    <span className="font-semibold text-black">Certificate Available</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Chapters & Lessons (same structure as original) */}
            <div className="bg-white backdrop-blur-sm rounded-xl p-6 border border-black">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl text-black font-bold flex items-center gap-2">
                  <BookOpen size={24} /> Chapters & Lessons
                </h2>
                <button onClick={addChapter} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition">
                  <Plus size={18} /> Add Chapter
                </button>
              </div>

              <div className="space-y-4">
                {editingCourse.chapters.map((chapter) => (
                  <div key={chapter.id} className="bg-white rounded-lg border border-black">
                    <div className="p-4 flex items-center justify-between border-b border-black">
                      <div className="flex items-center gap-3 flex-1">
                        <button onClick={() => toggleChapter(chapter.id)} className="text-black hover:text-slate-200">
                          {expandedChapters[chapter.id] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                        </button>
                        <input type="text" value={chapter.title} onChange={(e) => updateChapter(chapter.id, { title: e.target.value })} className="flex-1 px-3 py-2 text-black bg-white rounded border border-white focus:border-black focus:outline-none font-semibold" />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => addLesson(chapter.id)} className="px-2 py-2 bg-blue-600 hover:bg-blue-700 rounded transition flex items-center gap-2">
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
                          <div key={lesson.id} className="bg-white rounded-lg p-4 border border-black">
                            <div className="flex items-start justify-between mb-3">
                              <input type="text" value={lesson.title} onChange={(e) => updateLesson(chapter.id, lesson.id, { title: e.target.value })} className="flex-1 px-3 py-2 bg-white rounded border border-black focus:border-black focus:outline-none font-semibold text-black " />
                              <button onClick={() => deleteLesson(chapter.id, lesson.id)} className="ml-3 px-3 py-2 bg-red-600 hover:bg-red-700 rounded transition">
                                <Trash2 size={16} />
                              </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-3">
                              <div>
                                <label className="block text-xs text-black mb-3">Video</label>

                                <div className="flex items-center gap-3">
                                  <div className="w-48 h-28 bg-white rounded overflow-hidden flex items-center justify-center">
                                    {lesson.videoUrl ? (
                                      <video src={lesson.videoUrl} controls className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="text-black text-xs">No video</div>
                                    )}
                                  </div>
                                  <div className="flex flex-col gap-2">
                                    <button onClick={() => triggerVideoInput(chapter.id, lesson.id)} className="px-3 py-2 rounded bg-slate-700 hover:bg-slate-600">Upload Video</button>
                                    <button onClick={() => updateLesson(chapter.id, lesson.id, { videoUrl: "" })} className="px-3 py-2 rounded bg-red-600 hover:bg-red-700">Remove</button>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <label className="block text-xs text-black mb-1">Duration</label>
                                <input type="text" value={lesson.duration ?? ""} onChange={(e) => updateLesson(chapter.id, lesson.id, { duration: e.target.value })} placeholder="10:30" className="w-full px-3 py-2 bg-white rounded border border-black focus:border-blue-500 focus:outline-none text-black text-sm" />
                              </div>
                            </div>

                            <div className="mb-3">
                              <label className="block text-xs text-black mb-1">Lesson Content</label>
                              <textarea value={lesson.content ?? ""} onChange={(e) => updateLesson(chapter.id, lesson.id, { content: e.target.value })} rows={3} className="w-full px-3 py-2 bg-white rounded border border-black focus:border-black-500 focus:outline-none text-sm font-mono text-black" />
                            </div>

                            <div className="border-t border-black pt-3">
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
                                  <input type="text" value={lesson.quiz.question} onChange={(e) => updateLesson(chapter.id, lesson.id, { quiz: { ...lesson.quiz!, question: e.target.value } })} placeholder="Quiz question" className="w-full px-3 py-2 bg-white rounded border border-black focus:border-blue-500 focus:outline-none text-sm text-black" />
                                  <div className="space-y-2">
                                    {lesson.quiz.options.map((opt, optIdx) => (
                                      <div key={optIdx} className="flex gap-2">
                                        <input type="radio" name={`quiz-${lesson.id}`} checked={lesson.quiz!.answerIndex === optIdx} onChange={() => updateLesson(chapter.id, lesson.id, { quiz: { ...lesson.quiz!, answerIndex: optIdx } })} className="mt-1" />
                                        <input type="text" value={opt} onChange={(e) => {
                                          const newOptions = [...lesson.quiz!.options];
                                          newOptions[optIdx] = e.target.value;
                                          updateLesson(chapter.id, lesson.id, { quiz: { ...lesson.quiz!, options: newOptions } });
                                        }} className="flex-1 px-3 py-2 bg-white rounded border border-black focus:border-black focus:outline-none text-sm text-black" />
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
