import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Play,
  CheckCircle,
  FileText,
  Award,
  BookOpen,
  Clock,
  Search,
  Download,
  X,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
} from "lucide-react";

/**
 * StudentView v2 — Interactive LMS (LocalStorage backend)
 * Features included:
 * - Left merged course outline with search/filter
 * - Video player with auto-play next lesson on end
 * - Auto-complete lesson at 90% watched
 * - Per-course XP & badges (stored in localStorage)
 * - Certificate full-screen preview (Gold / Tech hybrid)
 * - Simple quiz component under lesson
 * - Lightweight analytics (minutes watched derived from stored seconds)
 * - Progress persisted locally (localStorage)
 *
 * Drop-in component (Tailwind CSS assumed). This is a single-file demo designed
 * for local use; connect to your auth & backend as needed.
 */

// ------------------ Types ------------------

type Attachment = { id: string; name: string; dataUrl: string };

type Lesson = {
  id: string;
  title: string;
  content?: string;
  videoUrl?: string;
  duration?: string; // display only
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
  chapters: Chapter[];
};

// ------------------ Mock Data ------------------

const MOCK_COURSES: Course[] = [
  {
    id: "course-react",
    title: "React Fundamentals",
    description: "Learn the fundamentals of React.",
    thumbnail:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&h=700&fit=crop",
    certificateAvailable: true,
    chapters: [
      {
        id: "ch-1",
        title: "Getting Started",
        lessons: [
          {
            id: "l-1",
            title: "Introduction to React",
            videoUrl:
              "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            duration: "12:45",
            content: "<p>Welcome to React! This lesson covers core ideas.</p>",
            quiz: {
              id: "q-1",
              question: "What is React mainly used for?",
              options: ["Styling websites", "Building UIs", "Database management", "OS development"],
              answerIndex: 1,
            },
          },
          {
            id: "l-2",
            title: "Environment Setup",
            duration: "08:30",
            content: "<p>Install Node, npm, and create-react-app or Vite.</p>",
            attachments: [
              { id: "att-1", name: "setup-guide.pdf", dataUrl: "data:application/pdf;base64,JVBERi0xLjQK" },
            ],
            quiz: null,
          },
        ],
      },
      {
        id: "ch-2",
        title: "Components",
        lessons: [
          {
            id: "l-3",
            title: "Functional Components",
            duration: "15:20",
            content: "<p>Learn functional components and hooks.</p>",
            quiz: {
              id: "q-2",
              question: "Which hook is used for state in functional components?",
              options: ["useEffect", "useState", "useRef", "useMemo"],
              answerIndex: 1,
            },
          },
        ],
      },
    ],
  },
];

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

// ------------------ Component ------------------

export default function StudentViewV2() {
  const courses = MOCK_COURSES;
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0].id);

  // selected lesson is identified by id
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(() => {
    const course = courses[0];
    return course.chapters?.[0]?.lessons?.[0]?.id ?? null;
  });

  // UI
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCertificate, setShowCertificate] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // persistent state in localStorage: progress map, xp per course, watchSeconds
  const [progressMap, setProgressMap] = useState<Record<string, { completed: boolean; completedAt?: string }>>(() =>
    readFromLS("progress", {})
  );
  const [xpMap, setXpMap] = useState<Record<string, number>>(() => readFromLS("xp", {}));
  const [watchSecondsMap, setWatchSecondsMap] = useState<Record<string, number>>(() => readFromLS("watchSeconds", {}));

  // simple badges storage
  const [badgesMap, setBadgesMap] = useState<Record<string, string[]>>(() => readFromLS("badges", {}));

  // analytics derived
  const selectedCourse = courses.find((c) => c.id === selectedCourseId)!;

  const allLessons = useMemo(() => selectedCourse.chapters.flatMap((ch) => ch.lessons), [selectedCourse]);

  const selectedLesson = useMemo(() => allLessons.find((l) => l.id === selectedLessonId) ?? null, [allLessons, selectedLessonId]);

  // Save derived state to LS whenever maps change
  useEffect(() => saveToLS("progress", progressMap), [progressMap]);
  useEffect(() => saveToLS("xp", xpMap), [xpMap]);
  useEffect(() => saveToLS("watchSeconds", watchSecondsMap), [watchSecondsMap]);
  useEffect(() => saveToLS("badges", badgesMap), [badgesMap]);

  // search filter
  const filteredChapters = useMemo(() => {
    if (!searchQuery.trim()) return selectedCourse.chapters;
    const q = searchQuery.toLowerCase();
    return selectedCourse.chapters
      .map((ch) => ({ ...ch, lessons: ch.lessons.filter((l) => l.title.toLowerCase().includes(q)) }))
      .filter((ch) => ch.lessons.length > 0);
  }, [searchQuery, selectedCourse]);

  // Quick helpers
  const lessonCompleted = (lessonId?: string) => !!(lessonId && progressMap[lessonId]?.completed);

  const totalLessons = selectedCourse.chapters.reduce((acc, ch) => acc + ch.lessons.length, 0);
  const completedCount = selectedCourse.chapters.reduce((acc, ch) => acc + ch.lessons.filter((l) => lessonCompleted(l.id)).length, 0);
  const coursePercent = Math.round((completedCount / Math.max(1, totalLessons)) * 100);

  // XP logic: grant XP for completing lessons (per-course)
  const grantXp = (courseId: string, xp = 10) => {
    setXpMap((prev) => {
      const next = { ...prev, [courseId]: (prev[courseId] || 0) + xp };
      return next;
    });
  };

  // Award badge helper
  const awardBadge = (courseId: string, badgeName: string) => {
    setBadgesMap((prev) => {
      const list = prev[courseId] || [];
      if (list.includes(badgeName)) return prev;
      const next = { ...prev, [courseId]: [...list, badgeName] };
      return next;
    });
  };

  // Mark lesson complete (also grant XP & badge when course completes)
  const markComplete = (lessonId: string) => {
    if (progressMap[lessonId]?.completed) return;
    const doneAt = new Date().toISOString();
    setProgressMap((prev) => ({ ...prev, [lessonId]: { completed: true, completedAt: doneAt } }));

    // xp for lesson
    grantXp(selectedCourse.id, 15);

    // if course completed grant badge
    const newCompletedCount = completedCount + 1;
    if (newCompletedCount === totalLessons) {
      awardBadge(selectedCourse.id, "Course Completed — Gold Seal");
      grantXp(selectedCourse.id, 100);
    }
  };

  // Auto-advance to next lesson
  const goToNextLesson = (currentId?: string) => {
    const flat = allLessons;
    const idx = flat.findIndex((x) => x.id === currentId);
    if (idx >= 0 && idx < flat.length - 1) {
      const next = flat[idx + 1];
      setSelectedLessonId(next.id);
    }
  };

  // Video time tracking and auto-complete at 90%
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let lastStoredSec = 0;

    const onTime = () => {
      const current = Math.floor(video.currentTime);
      // persist watch seconds per lesson
      if (selectedLesson) {
        setWatchSecondsMap((prev) => ({ ...prev, [selectedLesson.id]: Math.max(prev[selectedLesson.id] || 0, current) }));
      }

      // if 90% watched, mark as complete automatically
      if (video.duration && selectedLesson) {
        const pct = (video.currentTime / video.duration) * 100;
        if (pct >= 90 && !progressMap[selectedLesson.id]?.completed) {
          markComplete(selectedLesson.id);
        }
      }

      // throttle LS writes slightly
      if (current - lastStoredSec >= 5 && selectedLesson) {
        lastStoredSec = current;
        saveToLS("watchSeconds", { ...watchSecondsMap, [selectedLesson.id]: current });
      }
    };

    const onEnded = () => {
      // auto-play next lesson when current ends
      if (selectedLesson) {
        goToNextLesson(selectedLesson.id);
      }
    };

    video.addEventListener("timeupdate", onTime);
    video.addEventListener("ended", onEnded);

    return () => {
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("ended", onEnded);
    };
    // we intentionally omit progressMap/watchSecondsMap from deps to avoid rebind.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoRef.current, selectedLesson]);

  // Ensure selectedLessonId exists for course change
  useEffect(() => {
    const first = selectedCourse.chapters?.[0]?.lessons?.[0];
    if (first) setSelectedLessonId(first.id);
    setShowCertificate(false);
  }, [selectedCourseId]);

  // Simple quiz attempt handling (in-memory, not persisted for brevity)
  const [quizState, setQuizState] = useState<Record<string, { answeredIndex: number | null; correct?: boolean }>>({});

  const submitQuiz = (quizId: string, selectedIndex: number, lessonId: string, lessonQuiz: Lesson["quiz"]) => {
    const correct = lessonQuiz ? selectedIndex === lessonQuiz.answerIndex : false;
    setQuizState((p) => ({ ...p, [quizId]: { answeredIndex: selectedIndex, correct } }));
    if (correct) {
      // grant XP for correct quiz
      grantXp(selectedCourse.id, 25);
      awardBadge(selectedCourse.id, "Quiz Master");
    }
  };

  // Certificate print: open printable window with styled HTML
  const openCertificatePrint = () => {
    const name = "Student Name"; // replace with auth when available
    const date = new Date().toLocaleDateString();
    const xp = xpMap[selectedCourse.id] || 0;
    const badges = badgesMap[selectedCourse.id] || [];

    // Gold/Tech hybrid styling
    const html = `
      <html>
        <head>
          <title>Certificate - ${selectedCourse.title}</title>
          <style>
            body{margin:0;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial}
            .wrap{width:1000px;height:700px;padding:40px;box-sizing:border-box;margin:40px auto;border-radius:16px;background:linear-gradient(135deg,#0f172a 0%,#081124 100%);display:flex;align-items:center;justify-content:center}
            .card{background:white;width:920px;height:620px;border-radius:12px;padding:36px;box-sizing:border-box;border:8px solid #f6d365;box-shadow:0 20px 60px rgba(2,6,23,0.6)}
            .title{color:#111827;font-size:28px;font-weight:700}
            .subtitle{color:#4b5563;margin-top:6px}
            .name{font-size:34px;font-weight:800;margin-top:18px;color:#111827}
            .meta{display:flex;justify-content:space-between;color:#6b7280;margin-top:40px}
            .seal{background:linear-gradient(180deg,#7c3aed,#09f);color:white;padding:14px;border-radius:10px;font-weight:700}
            .qr{float:right}
          </style>
        </head>
        <body>
          <div class="wrap">
            <div class="card">
              <div style="display:flex;justify-content:space-between;align-items:center">
                <div>
                  <div class="title">Certificate of Completion</div>
                  <div class="subtitle">This certifies that</div>
                  <div class="name">${name}</div>
                  <div style="margin-top:10px;color:#374151">Has successfully completed the course</div>
                  <div style="font-weight:700;font-size:20px;margin-top:8px">${selectedCourse.title}</div>
                </div>
                <div style="text-align:right">
                  <div class="seal">Gold • Tech</div>
                  <div style="margin-top:18px;color:#6b7280">XP: ${xp}</div>
                </div>
              </div>
              <div class="meta">
                <div>Issued: ${date}</div>
                <div>Signature: _____________________</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const w = window.open("", "_blank", "noopener,noreferrer");
    if (!w) return alert("Pop-up blocked. Allow pop-ups to print certificate.");
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 600);
  };

  // Utility to format watch seconds into minutes
  const watchedMinutes = (lessonId: string) => Math.round((watchSecondsMap[lessonId] || 0) / 60);

  // Sidebar collapsed responsive toggles
  const toggleSidebar = () => setSidebarOpen((s) => !s);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100">
      {/* Header */}
      <div className="sticky top-0 bg-slate-900/60 backdrop-blur-sm border-b border-slate-700 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={toggleSidebar} className="p-2 rounded-md hover:bg-slate-800">
              {sidebarOpen ? <ChevronLeft /> : <ChevronRight />}
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-sky-500 rounded-lg flex items-center justify-center">
                <BookOpen />
              </div>
              <div>
                <div className="text-lg font-semibold">{selectedCourse.title}</div>
                <div className="text-xs text-slate-300">Interactive Learning • Local progress</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4 text-sm text-slate-300">
              <div className="flex items-center gap-2"><Clock /> <span>{completedCount} / {totalLessons} done</span></div>
              <div className="flex items-center gap-2"><Award /> <span>{(xpMap[selectedCourse.id] || 0)} XP</span></div>
            </div>
            <div className="text-sm text-slate-300">LocalStorage mode</div>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        {/* LEFT: Outline + Search */}
        <aside className={`${sidebarOpen ? "w-80" : "w-16"} transition-all duration-300 bg-slate-800/40 border border-slate-700 rounded-xl p-4 overflow-y-auto`}>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1">
              <div className="text-xs text-slate-400">Course Outline</div>
              <div className="font-semibold truncate">{selectedCourse.title}</div>
            </div>
            <div>
              <button onClick={() => setShowCertificate(true)} title="Certificate" className="p-2 rounded-md hover:bg-slate-700">
                <FileText />
              </button>
            </div>
          </div>

          <div className="mb-3">
            <div className="relative">
              <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search lessons..." className="w-full bg-slate-900/50 px-3 py-2 rounded-md placeholder-slate-400 text-sm" />
              <div className="absolute right-2 top-2 text-slate-400"><Search size={16} /></div>
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-400 mb-2">Progress</div>
            <div className="w-full bg-slate-700 rounded-full h-2 mb-3 overflow-hidden"><div className="h-2 bg-amber-400" style={{ width: `${coursePercent}%` }} /></div>
            <div className="text-xs text-slate-300 mb-4">{coursePercent}% complete • {completedCount}/{totalLessons} lessons</div>
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
                          {lessonCompleted(l.id) ? <CheckCircle /> : <Play />}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm truncate">{l.title}</div>
                          <div className="text-xs text-slate-400">{l.duration ?? "-"}</div>
                        </div>
                      </div>
                      <div className="text-xs text-slate-400">{watchedMinutes(l.id)}m</div>
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
            <div className="mt-3">
              <div className="text-xs text-slate-400">XP</div>
              <div className="font-semibold">{xpMap[selectedCourse.id] || 0} XP</div>
            </div>
          </div>
        </aside>

        {/* CENTER: Player & Content */}
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
                    <div className="mt-6">
                      <button onClick={openCertificatePrint} className="px-3 py-2 bg-slate-900 text-white rounded-md">Print / Download</button>
                    </div>
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
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedLesson?.title ?? "Select a lesson"}</h2>
                    <div className="text-sm text-slate-400 mt-1">{selectedCourse.title} • {selectedLesson?.duration ?? "-"}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button onClick={() => selectedLesson && markComplete(selectedLesson.id)} className="px-4 py-2 rounded-md bg-emerald-500 text-slate-900 font-semibold">Mark Complete</button>
                    <button onClick={() => selectedLesson && selectedLesson.attachments?.length && window.open(selectedLesson.attachments![0].dataUrl, "_blank")} className="px-3 py-2 rounded-md bg-slate-800 border">Open Material</button>
                  </div>
                </div>

                <div className="mt-4 prose prose-invert" dangerouslySetInnerHTML={{ __html: selectedLesson?.content ?? "<p>No content</p>" }} />

                {/* Quiz block */}
                {selectedLesson?.quiz && (
                  <div className="mt-6 bg-slate-800/40 p-4 rounded-md border border-slate-700">
                    <div className="font-semibold">Quiz</div>
                    <div className="mt-2">{selectedLesson.quiz.question}</div>
                    <div className="mt-3 grid gap-2">
                      {selectedLesson.quiz.options.map((opt, i) => {
                        const state = quizState[selectedLesson.quiz!.id];
                        const selectedIndex = state?.answeredIndex ?? null;
                        const disabled = selectedIndex !== null;
                        const correct = state?.correct === true && selectedIndex === i;
                        const wrong = selectedIndex === i && state?.correct === false;
                        return (
                          <button
                            key={i}
                            onClick={() => submitQuiz(selectedLesson.quiz!.id, i, selectedLesson.id, selectedLesson.quiz)}
                            disabled={disabled}
                            className={`text-left px-3 py-2 rounded-md ${correct ? "bg-emerald-600 text-black" : wrong ? "bg-red-600 text-white" : "bg-slate-800 hover:bg-slate-700"}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-3 text-xs text-slate-400">Correct answer will grant +25 XP</div>
                  </div>
                )}

                <div className="mt-6 text-xs text-slate-400">Watched: {selectedLesson ? `${watchedMinutes(selectedLesson.id)} minutes` : "—"}</div>
              </div>

              {/* Analytics / summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900/60 p-4 rounded-md">
                  <div className="text-sm text-slate-400">Total Lessons</div>
                  <div className="text-2xl font-bold">{totalLessons}</div>
                </div>
                <div className="bg-slate-900/60 p-4 rounded-md">
                  <div className="text-sm text-slate-400">Completed</div>
                  <div className="text-2xl font-bold">{completedCount}</div>
                </div>
                <div className="bg-slate-900/60 p-4 rounded-md">
                  <div className="text-sm text-slate-400">Total XP</div>
                  <div className="text-2xl font-bold">{xpMap[selectedCourse.id] || 0}</div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
