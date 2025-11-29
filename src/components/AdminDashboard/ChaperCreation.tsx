import React, { useEffect, useRef, useState } from "react";
import confettiDefault from "canvas-confetti"; // optional; fallback provided if missing
import {
  BookOpen,
  Upload,
  Edit2,
  Plus,
  X,
  Video,
  FileText,
  CheckCircle,
  Download,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

interface Course {
  id?: number;
  title?: string;
  description?: string;
  image_url?: string;
}

interface Lesson {
  id: number;
  title: string;
  description?: string;
  video_url?: string;
  completed?: boolean;
}

type TestType = "mcq" | "ordering" | "match" | "fill";

interface TestBase {
  id: number;
  type: TestType;
  question: string;
}

interface MCQTest extends TestBase {
  type: "mcq";
  options: string[];
  answerIndex: number;
}

interface OrderingTest extends TestBase {
  type: "ordering";
  steps: string[];
}

interface MatchPair {
  left: string;
  right: string;
}

interface MatchTest extends TestBase {
  type: "match";
  pairs: MatchPair[];
}

interface FillTest extends TestBase {
  type: "fill";
  template: string;
  blanks: string[];
}

type TestQuestion = MCQTest | OrderingTest | MatchTest | FillTest;

interface Chapter {
  id: number;
  title?: string;
  description?: string;
  video_url?: string;
  lessons?: Lesson[];
  tests?: TestQuestion[];
  assignments?: { id: number; title: string; description?: string }[];
  status?: "draft" | "published";
}

/* -------------------------------------------------------------------------- */
/*                         HELPER / UTIL FUNCTIONS                             */
/* -------------------------------------------------------------------------- */

/** small safe wrapper to run confetti (tries canvas-confetti, else fallback) */
function runConfetti(container?: HTMLElement | null) {
  try {
    const confetti = (confettiDefault as any) ?? (window as any).confetti;
    if (typeof confetti === "function") {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });
      return;
    }
  } catch {
    // ignore, fallback below
  }
  // fallback simple canvas burst (non-library)
  if (!container) return;
  const canvas = document.createElement("canvas");
  const rect = container.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
  canvas.style.position = "absolute";
  canvas.style.left = "0";
  canvas.style.top = "0";
  canvas.style.pointerEvents = "none";
  container.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const particles: any[] = [];
  for (let i = 0; i < 25; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 3,
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 1.5) * 8,
      r: Math.random() * 6 + 3,
      color: ["#60A5FA", "#34D399", "#F97316", "#F43F5E", "#A78BFA"][Math.floor(Math.random() * 5)],
      life: 80,
    });
  }
  let frame = 0;
  const id = setInterval(() => {
    frame++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.2;
      p.life--;
      ctx.beginPath();
      ctx.globalAlpha = Math.max(0, p.life / 80);
      ctx.fillStyle = p.color;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    if (frame > 90) {
      clearInterval(id);
      canvas.remove();
    }
  }, 16);
}

/** open printable certificate HTML in a new window and call print (user can Save as PDF) */
function openPrintableCertificate(params: {
  username: string;
  courseTitle: string;
  chapterTitle: string;
  completionPct: number;
}) {
  const { username, courseTitle, chapterTitle, completionPct } = params;
  const html = `
  <html>
    <head>
      <meta charset="utf-8"/>
      <title>Certificate - ${chapterTitle}</title>
      <style>
        body { font-family: Arial, Helvetica, sans-serif; margin:0; padding:40px; background:white; color:#111827; }
        .wrap { border:10px solid #111827; padding:40px; text-align:center; }
        h1 { font-size:36px; margin:0; }
        h2 { margin-top:16px; color:#374151; font-size:20px; }
        .big { font-size:28px; margin-top:24px; color:#059669; }
        .muted { color:#6b7280; margin-top:12px; }
        .footer { margin-top:60px; display:flex; justify-content:space-between; align-items:center; }
      </style>
    </head>
    <body>
      <div class="wrap">
        <h1>Certificate of Completion</h1>
        <h2>This certifies that</h2>
        <div class="big"><strong>${escapeHtml(username)}</strong></div>
        <div class="muted">has completed the chapter</div>
        <h2>${escapeHtml(chapterTitle)}</h2>
        <div class="muted">as part of the course</div>
        <h2>${escapeHtml(courseTitle)}</h2>
        <div style="margin-top:24px; font-size:20px; color:#059669;">
          Completion: ${Math.round(completionPct)}%
        </div>
        <div class="footer">
          <div>__________________<br/>Instructor</div>
          <div>${new Date().toLocaleDateString()}</div>
        </div>
      </div>
      <script>
        // try auto-print (browser may block); user can also manually print/save-as-pdf
        setTimeout(() => { window.print(); }, 300);
      </script>
    </body>
  </html>
  `;
  const w = window.open("", "_blank", "noopener,noreferrer");
  if (!w) {
    alert("Unable to open new window. Please allow popups to download certificate.");
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
}

/** simple HTML-escape for user-supplied strings */
function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/* -------------------------------------------------------------------------- */
/*                        ChapterCreation Component                            */
/* -------------------------------------------------------------------------- */

export default function ChapterCreation({
  course,
  chapter,
  onUpdateChapter,
  onSave,
  onPublish,
  mode: modeProp,
}: {
  course?: Course | null;
  chapter: Chapter;
  onUpdateChapter: (u: Partial<Chapter>) => void;
  onSave: () => void;
  onPublish: () => void;
  /** optional mode override; if omitted we try to detect from URL */
  mode?: "creator" | "student";
}) {
  const navigate = useNavigate ? useNavigate() : undefined;
  const location = useLocation ? useLocation() : { pathname: typeof window !== "undefined" ? window.location.pathname : "" };
  // determine mode: prop > URL contains '/student' => student mode > default creator
  const detectedMode = modeProp ?? (String(location.pathname).includes("/student") ? "student" : "creator");
  const isStudent = detectedMode === "student";

  // local UI state
  const [title, setTitle] = useState(chapter.title || "Chapter");
  const [description, setDescription] = useState(chapter.description || "");
  const [lessons, setLessons] = useState<Lesson[]>(chapter.lessons || []);
  const [tests, setTests] = useState<TestQuestion[]>(chapter.tests || []);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const confettiContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setTitle(chapter.title || "Chapter");
    setDescription(chapter.description || "");
    setLessons(chapter.lessons || []);
    setTests(chapter.tests || []);
  }, [chapter]);

  // persist changes upward
  useEffect(() => {
    onUpdateChapter({ title, description, lessons, tests });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, lessons, tests]);

  /* -------------------------- helper operations -------------------------- */

  const addLesson = () => {
    const l: Lesson = { id: Date.now(), title: `Lesson ${lessons.length + 1}`, description: "", video_url: "", completed: false };
    setLessons((s) => [...s, l]);
  };

  const updateLesson = (id: number, patch: Partial<Lesson>) => {
    setLessons((s) => s.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  };

  const removeLesson = (id: number) => setLessons((s) => s.filter((l) => l.id !== id));

  const addTest = (t: TestQuestion) => setTests((s) => [...s, t]);

  const removeTest = (id: number) => setTests((s) => s.filter((t) => t.id !== id));

  const togglePublish = () => {
    const next = chapter.status === "published" ? "draft" : "published";
    onUpdateChapter({ status: next });
    onPublish();
  };

  /* ---------------------- drag & drop / upload ---------------------- */

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer?.files?.[0];
    if (!f) return;
    // we will treat as chapter-level video
    const url = URL.createObjectURL(f);
    onUpdateChapter({ video_url: url });
  };
  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    onUpdateChapter({ video_url: url });
  };

  /* ---------------------- completion & certificate ---------------------- */

  const lessonsCompletedCount = lessons.filter((l) => !!l.completed).length;
  const lessonsTotal = lessons.length;
  const progressPct = lessonsTotal === 0 ? 0 : Math.round((lessonsCompletedCount / lessonsTotal) * 100);
  const allLessonsHaveVideo = lessonsTotal > 0 && lessons.every((l) => !!l.video_url && l.video_url.trim() !== "");
  const hasAtLeastOneTest = tests.length > 0;
  // Certificate available when: all lessons have videos & at least one test exists AND progress >= 100 (lessons marked complete)
  const certificateAvailable = allLessonsHaveVideo && hasAtLeastOneTest && lessonsCompletedCount === lessonsTotal && lessonsTotal > 0;

  const confettiAndNotify = (username?: string) => {
    runConfetti(confettiContainerRef.current);
    // extra UX: small browser notification (if allowed)
    try {
      if ("Notification" in window && (Notification as any).permission === "granted") {
        new Notification("Certificate unlocked 🎉", { body: `${username ?? "Student"} earned a certificate!` });
      }
    } catch {}
  };

  const handleGenerateCertificatePDF = () => {
    if (!certificateAvailable) {
      alert("Certificate is available only when every lesson has a video, at least one test exists, and all lessons are marked complete.");
      return;
    }
    const username = prompt("Enter student name for certificate (e.g. Jane Doe):");
    if (!username || !username.trim()) return;
    // run confetti
    confettiAndNotify(username.trim());
    // open printable certificate (students can Save as PDF)
    openPrintableCertificate({
      username: username.trim(),
      courseTitle: course?.title ?? "Course",
      chapterTitle: title || "Chapter",
      completionPct: progressPct,
    });
  };

  const handleDownloadCertificatePNG = () => {
    if (!certificateAvailable) {
      alert("Certificate not available yet.");
      return;
    }
    const username = prompt("Enter student name for PNG certificate:");
    if (!username || !username.trim()) return;
    // create a simple canvas certificate and download as PNG
    const width = 1200;
    const height = 800;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    // header bar
    ctx.fillStyle = "#111827";
    ctx.fillRect(0, 0, width, 120);
    // title
    ctx.fillStyle = "#111827";
    ctx.font = "44px Georgia";
    ctx.textAlign = "center";
    ctx.fillText("Certificate of Completion", width / 2, 180);
    // name
    ctx.font = "36px Georgia";
    ctx.fillText(username.trim(), width / 2, 260);
    // chapter
    ctx.font = "20px Georgia";
    ctx.fillStyle = "#374151";
    ctx.fillText(`has completed the chapter: ${title}`, width / 2, 320);
    // course
    ctx.font = "18px Georgia";
    ctx.fillText(`Course: ${course?.title ?? "Course"}`, width / 2, 360);
    // completion pct
    ctx.fillStyle = "#059669";
    ctx.font = "24px Georgia";
    ctx.fillText(`Completion: ${progressPct}%`, width / 2, 420);
    // date & signature line
    ctx.strokeStyle = "#111827";
    ctx.beginPath();
    ctx.moveTo(width / 2 - 160, 600);
    ctx.lineTo(width / 2 + 160, 600);
    ctx.stroke();
    ctx.font = "14px Georgia";
    ctx.fillStyle = "#111827";
    ctx.fillText("Instructor", width / 2, 640);
    // trigger download
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `${(course?.title ?? "course").replace(/\s+/g, "_")}_${title.replace(/\s+/g, "_")}_${username.replace(/\s+/g, "_")}_certificate.png`;
    a.click();
    confettiAndNotify(username.trim());
  };

  /* ---------------------- student interactions ---------------------- */

  const studentToggleLessonComplete = (lessonId: number) => {
    // student toggles completion locally and notify parent
    setLessons((s) =>
      s.map((l) => (l.id === lessonId ? { ...l, completed: !l.completed } : l))
    );
  };

  /* ---------------------- UI render ---------------------- */

  // Student view: simplified reading UI. Creator view: full editor.
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative" ref={confettiContainerRef}>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-7 h-7 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              <p className="text-sm text-gray-500">{description}</p>
            </div>
          </div>

          <div className="flex gap-3 items-center">
            <div className="text-xs text-gray-500 mr-2">Mode: <strong>{isStudent ? "Student" : "Creator"}</strong></div>
            {!isStudent && (
              <>
                <button onClick={() => { onUpdateChapter({ title, description }); onSave(); }} className="px-4 py-2 bg-white border rounded-lg text-gray-700">Save</button>
                <button onClick={togglePublish} className={`px-4 py-2 rounded-lg font-medium ${chapter.status === "published" ? "bg-red-600 text-white" : "bg-blue-600 text-white"}`}>
                  {chapter.status === "published" ? "Unpublish" : "Publish"}
                </button>
              </>
            )}
            {isStudent && (
              <button onClick={() => { if (navigate) navigate(`/student/course/${course?.id ?? ""}`); else window.location.href = `/student/course/${course?.id ?? ""}`; }} className="px-4 py-2 bg-gray-900 text-white rounded-lg">Open Course</button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left/Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lessons */}
          <section className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Lessons</h2>
              {!isStudent && <button onClick={addLesson} className="flex items-center gap-2 text-blue-600"><Plus /> Add Lesson</button>}
            </div>

            {lessons.length === 0 ? (
              <p className="text-gray-500 italic">No lessons yet.</p>
            ) : (
              <div className="space-y-4">
                {lessons.map((l) => (
                  <article key={l.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium text-gray-900">{l.title}</h3>
                          {l.completed && <span className="text-sm text-green-600 flex items-center gap-1"><CheckCircle size={16} /> Completed</span>}
                        </div>
                        <p className="text-sm text-gray-600 mt-2">{l.description}</p>
                        <div className="mt-3 flex gap-2 items-center">
                          {l.video_url ? (
                            <video src={l.video_url} controls className="max-w-full rounded" style={{ maxHeight: 280 }} />
                          ) : (
                            <div className="text-sm text-gray-400">No video for this lesson</div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 items-end">
                        {isStudent ? (
                          <>
                            <button onClick={() => studentToggleLessonComplete(l.id)} className={`px-3 py-1 rounded ${l.completed ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700"}`}>
                              {l.completed ? "Mark Incomplete" : "Mark Complete"}
                            </button>
                          </>
                        ) : (
                          <>
                            <div className="flex flex-col gap-2">
                              <button onClick={() => { fileRef.current?.click(); }} className="px-3 py-1 bg-gray-900 text-white rounded text-sm">Upload/Set Video</button>
                              <button onClick={() => updateLesson(l.id, { video_url: "" })} className="px-3 py-1 bg-red-100 text-red-600 rounded text-sm">Remove Video</button>
                              <button onClick={() => removeLesson(l.id)} className="text-red-500"><X /></button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* Tests */}
          <section className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Tests</h2>
              {!isStudent && <button onClick={() => {/* open test builder elsewhere */}} className="flex items-center gap-2 text-blue-600"><Plus /> Add Test</button>}
            </div>

            {tests.length === 0 ? (
              <p className="text-gray-500 italic">No tests yet.</p>
            ) : (
              <div className="space-y-3">
                {tests.map((t) => (
                  <div key={t.id} className="p-3 border rounded bg-gray-50 flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{t.question}</p>
                      <p className="text-xs text-gray-500">Type: {t.type}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      {isStudent ? (
                        <button onClick={() => { /* launch test taker flow (assume TestTaker exists) */ alert("Open test taking UI"); }} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Take Test</button>
                      ) : (
                        <button onClick={() => removeTest(t.id)} className="px-3 py-1 bg-red-100 text-red-600 rounded text-sm">Delete</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right column: progress + video + certificate */}
        <aside className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-sm font-semibold text-gray-600">Progress</h3>
            <div className="mt-3">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Lessons</span>
                <span>{lessonsCompletedCount}/{lessonsTotal}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-blue-600 h-3 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
              </div>
              <div className="text-xs text-gray-500 mt-2">Chapter completion: {progressPct}%</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-sm font-semibold text-gray-600">Chapter Video</h3>
            <div className="mt-3">
              <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} className={`border-2 border-dashed rounded-xl p-6 text-center ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50"}`}>
                <Upload className="mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-2">Drag & drop a file or click below</p>
                <div className="flex gap-2 justify-center">
                  {!isStudent && <button onClick={() => fileRef.current?.click()} className="px-3 py-2 bg-gray-900 text-white rounded">Upload</button>}
                  {chapter.video_url ? <a href={chapter.video_url} target="_blank" rel="noreferrer" className="px-3 py-2 bg-gray-100 rounded">Open</a> : null}
                </div>
                <input ref={fileRef} type="file" accept="video/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; onUpdateChapter({ video_url: URL.createObjectURL(f) }); }} />
                {chapter.video_url ? <video src={chapter.video_url} controls className="mt-4 w-full rounded" /> : null}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-600">Certificate</h3>
              {certificateAvailable ? <span className="text-green-600 font-medium flex items-center gap-2"><CheckCircle size={16} /> Available</span> : <span className="text-gray-400 text-xs">Locked</span>}
            </div>

            <div className="mt-4 space-y-3">
              <button onClick={handleGenerateCertificatePDF} disabled={!certificateAvailable} className={`w-full px-4 py-2 rounded ${certificateAvailable ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-500 cursor-not-allowed"}`}>
                <Download size={16} /> Download as PDF
              </button>
              <button onClick={handleDownloadCertificatePNG} disabled={!certificateAvailable} className={`w-full px-4 py-2 rounded ${certificateAvailable ? "bg-green-600 text-white" : "bg-gray-200 text-gray-500 cursor-not-allowed"}`}>
                Download PNG
              </button>
              <p className="text-xs text-gray-500">Certificates require all lessons to have videos, at least one test, and lessons marked complete.</p>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
