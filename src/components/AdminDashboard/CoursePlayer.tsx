import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Play, Pause, ChevronDown, ChevronRight, Check, CheckCircle } from "lucide-react";


// Tailwind + React + Framer Motion + Axios
// Save file as CoursePlayerApp.tsx in a Vite/CRA project with Tailwind configured.

/* -------------------------------------------------------------------------- */
/*                                  NOTE                                      */
/*  - This file is intentionally self-contained but split into components.
    - Replace API_BASE with your backend endpoints if available.
    - Install dependencies: axios, framer-motion, lucide-react
    - Tailwind must be configured in the project
/* -------------------------------------------------------------------------- */

const API_BASE = "/api"; // example base — replace with real backend if available

/* ----------------------------- Sample Data -------------------------------- */
const SAMPLE_CHAPTERS = [
  {
    id: "ch1",
    title: "1: Chapter No. 1",
    lessons: [
      { id: "l1-1", title: "Introduction To Course", duration: "8:24", videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" },
      { id: "l1-2", title: "Prerequisites", duration: "6:12", videoUrl: null },
    ],
  },
  {
    id: "ch2",
    title: "2: Chapter No.2",
    lessons: [
      { id: "l2-1", title: "Getting Started", duration: "7:01", videoUrl: null },
      { id: "l2-2", title: "Project Setup", duration: "5:21", videoUrl: null },
    ],
  },
];

/* ------------------------------- Types ------------------------------------ */
type Lesson = { id: string; title: string; duration?: string; videoUrl?: string | null };
type Chapter = { id: string; title: string; lessons: Lesson[] };

/* ------------------------- Utilities: Local Storage ------------------------ */
const LS_COMPLETED = "course_player_completed_v2";
const LS_LAST_LESSON = "course_player_last_lesson_v2";
const LS_POS_KEY = (lessonId: string) => `lesson_pos_v2:${lessonId}`;

/* ---------------------------- API helpers (example) ----------------------- */
async function apiSaveProgress(userId: string, lessonId: string, posSec: number) {
  // Example: send user's resume position to server
  try {
    await axios.post(`${API_BASE}/progress`, { userId, lessonId, position: posSec });
  } catch (e) {
    // ignore; localStorage fallback works offline
  }
}

async function apiGetProgress(userId: string) {
  try {
    const res = await axios.get(`${API_BASE}/progress?userId=${encodeURIComponent(userId)}`);
    return res.data; // expected { lessonId: pos }
  } catch (e) {
    return {};
  }
}

/* -------------------------------------------------------------------------- */
/*                               Sidebar Component                            */
/* -------------------------------------------------------------------------- */
function Sidebar({
  chapters,
  expanded,
  onToggleChapter,
  onSelectLesson,
  currentLessonId,
  completed,
  onMarkAllComplete,
}: {
  chapters: Chapter[];
  expanded: Record<string, boolean>;
  onToggleChapter: (id: string) => void;
  onSelectLesson: (id: string) => void;
  currentLessonId: string | null;
  completed: Record<string, boolean>;
  onMarkAllComplete: () => void;
}) {
  const total = chapters.reduce((s, c) => s + c.lessons.length, 0);
  const done = Object.values(completed).filter(Boolean).length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <aside className="w-[320px] flex-shrink-0 rounded-lg overflow-hidden shadow-lg bg-slate-800 border border-slate-700">
      <div className="px-5 py-4 border-b border-slate-700">
        <h3 className="text-lg font-semibold">Ultimate Guide to File Uploads</h3>
        <p className="text-sm text-slate-400 mt-1">Development</p>

        <div className="mt-3">
          <div className="flex items-center justify-between text-sm text-slate-300">
            <div>
              <div className="text-xs text-slate-400">Progress</div>
              <div className="text-sm font-medium">{done}/{total} lessons</div>
            </div>
            <div className="text-xs text-slate-400">{percent}%</div>
          </div>

          <div className="w-full bg-slate-700 rounded-full h-2 mt-2 overflow-hidden">
            <div className="h-2 bg-emerald-500 transition-all" style={{ width: `${percent}%` }} />
          </div>
        </div>
      </div>

      <div className="px-3 py-4">
        {chapters.map((ch) => (
          <div key={ch.id} className="mb-3">
            <button
              onClick={() => onToggleChapter(ch.id)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-slate-700 transition"
            >
              <div className="flex items-center gap-3">
                <div className="text-slate-300 font-medium">{ch.title}</div>
                <div className="text-xs text-slate-500 ml-1">{ch.lessons.length} lessons</div>
              </div>
              <div className="text-slate-400">{expanded[ch.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</div>
            </button>

            {expanded[ch.id] && (
              <div className="mt-2 space-y-2">
                {ch.lessons.map((l, idx) => {
                  const watching = l.id === currentLessonId;
                  const doneFlag = !!completed[l.id];
                  return (
                    <button
                      key={l.id}
                      onClick={() => onSelectLesson(l.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition ${
                        watching ? "bg-rose-600/10 ring-1 ring-rose-500" : "hover:bg-slate-700"
                      }`}
                    >
                      <div className="w-3 flex-shrink-0">{doneFlag ? <Check size={16} className="text-emerald-400" /> : <div className="w-3 h-3 rounded-full bg-slate-600" />}</div>
                      <div className="flex-1">
                        <div className={`text-sm font-medium ${watching ? "text-rose-200" : "text-slate-200"}`}>{l.title}</div>
                        <div className="text-xs text-slate-500">{l.duration || ""}</div>
                      </div>
                      <div className="text-xs text-slate-400">{idx + 1}</div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        <div className="mt-4">
          <button onClick={onMarkAllComplete} className="mt-2 w-full px-3 py-2 rounded bg-rose-600 text-white text-sm">Mark all as complete</button>
        </div>
      </div>
    </aside>
  );
}

/* -------------------------------------------------------------------------- */
/*                               Player Controls                              */
/* -------------------------------------------------------------------------- */
function PlayerControls({
  isPlaying,
  onTogglePlay,
  speed,
  setSpeed,
}: {
  isPlaying: boolean;
  onTogglePlay: () => void;
  speed: number;
  setSpeed: (s: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <button onClick={onTogglePlay} aria-label={isPlaying ? "Pause" : "Play"} className="px-3 py-2 bg-slate-700 rounded">
        {isPlaying ? <Pause size={18} /> : <Play size={18} />}
      </button>
      <label className="text-sm text-slate-300">Speed</label>
      <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="bg-slate-700 p-1 rounded text-sm">
        <option value={0.5}>0.5x</option>
        <option value={0.75}>0.75x</option>
        <option value={1}>1x</option>
        <option value={1.5}>1.5x</option>
        <option value={2}>2x</option>
      </select>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Transcript UI                                */
/* -------------------------------------------------------------------------- */
function Transcript({ transcript, onJumpTo }: { transcript: string[]; onJumpTo: (time: number) => void }) {
  return (
    <div className="bg-slate-900 border border-slate-700 rounded p-4 text-slate-300 max-h-[220px] overflow-auto">
      <div className="text-sm font-medium mb-2">Transcript</div>
      {transcript.length === 0 ? (
        <div className="text-xs text-slate-500">No transcript available</div>
      ) : (
        transcript.map((line, i) => (
          <div key={i} className="mb-2 text-sm">
            <button onClick={() => onJumpTo(i * 10)} className="text-emerald-400 mr-2 text-xs">[{i * 10}s]</button>
            <span>{line}</span>
          </div>
        ))
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Main Player                                  */
/* -------------------------------------------------------------------------- */
export function CoursePlayer({ userId = "user_anon" }: { userId?: string }) {
  const [chapters, setChapters] = useState<Chapter[]>(SAMPLE_CHAPTERS);
  const defaultLesson = chapters[0]?.lessons?.[0]?.id ?? null;
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(LS_LAST_LESSON) || defaultLesson;
    } catch {
      return defaultLesson;
    }
  });

  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => Object.fromEntries(chapters.map((c, i) => [c.id, i === 0])));
  const [completed, setCompleted] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem(LS_COMPLETED);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(() => Number(localStorage.getItem("player_speed_v2") || 1));
  const [transcript, setTranscript] = useState<string[]>([]);

  // load remote progress (best-effort)
  useEffect(() => {
    apiGetProgress(userId).then((remote) => {
      // remote is expected { lessonId: seconds }
      // apply only if we have no local marker
      try {
        const last = localStorage.getItem(LS_LAST_LESSON);
        if (!last && remote) {
          const keys = Object.keys(remote);
          if (keys.length) setCurrentLessonId(keys[0]);
        }
      } catch {}
    });
  }, [userId]);

  useEffect(() => {
    try { localStorage.setItem(LS_COMPLETED, JSON.stringify(completed)); } catch {}
  }, [completed]);

  useEffect(() => {
    try { if (currentLessonId) localStorage.setItem(LS_LAST_LESSON, currentLessonId); } catch {}
  }, [currentLessonId]);

  useEffect(() => {
    localStorage.setItem("player_speed_v2", String(speed));
    if (videoRef.current) videoRef.current.playbackRate = speed;
  }, [speed]);

  const lessonMap = useMemo(() => {
    const m = new Map<string, Lesson>();
    chapters.forEach((ch) => ch.lessons.forEach((l) => m.set(l.id, l)));
    return m;
  }, [chapters]);

  const currentLesson = currentLessonId ? lessonMap.get(currentLessonId) ?? null : null;

  // keyboard shortcuts: space toggle play, <- -5s, -> +5s
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT" || (e.target as HTMLElement)?.tagName === "TEXTAREA") return;
      if (e.code === "Space") {
        e.preventDefault();
        if (videoRef.current) {
          if (videoRef.current.paused) videoRef.current.play(); else videoRef.current.pause();
        }
      }
      if (e.key === "ArrowLeft") {
        if (videoRef.current) videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5);
      }
      if (e.key === "ArrowRight") {
        if (videoRef.current) videoRef.current.currentTime = Math.min((videoRef.current?.duration || 0), (videoRef.current?.currentTime || 0) + 5);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // resume from stored position
  useEffect(() => {
    if (!currentLessonId) return;
    const key = LS_POS_KEY(currentLessonId);
    const posStr = localStorage.getItem(key);
    const pos = posStr ? Number(posStr) : 0;
    const onLoaded = () => {
      const v = videoRef.current;
      if (!v) return;
      if (pos > 0 && v.duration > pos + 1) v.currentTime = pos;
    };
    const v = videoRef.current;
    if (v) {
      v.addEventListener("loadedmetadata", onLoaded);
      return () => v.removeEventListener("loadedmetadata", onLoaded);
    }
  }, [currentLessonId]);

  // save position periodically
  useEffect(() => {
    const iv = setInterval(() => {
      const v = videoRef.current;
      if (!v || !currentLessonId) return;
      try {
        localStorage.setItem(LS_POS_KEY(currentLessonId), String(Math.floor(v.currentTime)));
        apiSaveProgress(userId, currentLessonId, Math.floor(v.currentTime));
      } catch {}
    }, 5000);
    return () => clearInterval(iv);
  }, [currentLessonId, userId]);

  // load transcript if available (mock: build from title)
  useEffect(() => {
    if (!currentLesson) return;
    // In production, fetch a VTT or transcript file. Here we fake it.
    setTranscript([`Intro: ${currentLesson.title}`, "Key concept 1", "Key concept 2", "Summary"]);
  }, [currentLesson]);

  const toggleChapter = (id: string) => setExpanded((s) => ({ ...s, [id]: !s[id] }));
  const selectLesson = (id: string) => {
    setCurrentLessonId(id);
    // when selecting lesson, autopause and reset play state
    setIsPlaying(false);
    const v = videoRef.current; if (v) v.pause();
  };

  const toggleComplete = (id: string) => setCompleted((p) => ({ ...p, [id]: !p[id] }));
  const markAll = () => {
    const allIds = chapters.flatMap((c) => c.lessons.map((l) => l.id));
    const next: Record<string, boolean> = {};
    allIds.forEach((id) => (next[id] = true));
    setCompleted(next);
  };

  const handlePlayToggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play(); else v.pause();
  };

  // attach play/pause listeners to toggle UI state
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    return () => {
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
    };
  }, []);

  // jump helper for transcript timestamps (simple mapping)
  const jumpTo = (seconds: number) => {
    const v = videoRef.current; if (v) v.currentTime = seconds; v?.play();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
      <div className="max-w-[1200px] w-full mx-auto flex flex-1 gap-6 p-6">
        <Sidebar
          chapters={chapters}
          expanded={expanded}
          onToggleChapter={toggleChapter}
          onSelectLesson={selectLesson}
          currentLessonId={currentLessonId}
          completed={completed}
          onMarkAllComplete={markAll}
        />

        <main className="flex-1 rounded-lg overflow-hidden bg-slate-800 border border-slate-700 shadow-lg">
          {/* Video area */}
          <div className="bg-black relative">
            {currentLesson && currentLesson.videoUrl ? (
              <video
                ref={videoRef}
                key={currentLesson.id}
                controls
                className="w-full max-h-[560px] object-cover bg-black"
                src={currentLesson.videoUrl}
                crossOrigin="anonymous"
              />
            ) : (
              <div className="w-full h-[420px] flex items-center justify-center bg-gradient-to-b from-slate-800 to-slate-900">
                <div className="text-center px-6">
                  <div className="inline-flex items-center gap-3 bg-slate-700/40 px-4 py-2 rounded">
                    <Play size={22} />
                    <div>
                      <div className="text-lg font-semibold">{currentLesson?.title || "No video available"}</div>
                      <div className="text-sm text-slate-400 mt-1">This lesson has no video. You can still read the lesson content.</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* overlay controls */}
            <div className="absolute left-4 bottom-4 right-4 flex items-center justify-between bg-gradient-to-r from-black/60 to-black/40 rounded-md p-3">
              <div className="text-slate-100">
                <div className="text-sm text-slate-300">Now playing</div>
                <div className="font-semibold">{currentLesson?.title ?? "Select a lesson"}</div>
              </div>

              <div className="flex items-center gap-3">
                <PlayerControls isPlaying={isPlaying} onTogglePlay={handlePlayToggle} speed={speed} setSpeed={setSpeed} />

                <button
                  onClick={() => { if (currentLessonId) toggleComplete(currentLessonId); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium ${currentLessonId && completed[currentLessonId] ? "bg-emerald-600" : "bg-rose-600"}`}
                >
                  <CheckCircle size={16} />
                  {currentLessonId && completed[currentLessonId] ? "Completed" : "Mark as Complete"}
                </button>
              </div>
            </div>
          </div>

          {/* Content area */}
          <div className="p-6">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-2xl font-semibold text-slate-100">{currentLesson?.title ?? "Select a lesson"}</h1>
                <p className="mt-2 text-sm text-slate-400 max-w-2xl">{currentLesson ? "This lesson covers the topic in-depth. Use the video player above to watch. After watching mark the lesson as complete." : "Choose a lesson on the left to begin."}</p>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-900 border border-slate-700 rounded p-4 text-slate-300">
                    <div className="text-sm font-medium mb-2">Notes / Resources</div>
                    <p className="text-sm text-slate-400">Use this area to show lesson transcript, links, attachments, or quick quizzes.</p>
                  </div>

                  <div>
                    <Transcript transcript={transcript} onJumpTo={jumpTo} />
                  </div>
                </div>
              </div>

              <div className="w-56 hidden md:block">
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 border border-slate-700 rounded p-4">
                  <div className="text-xs text-slate-400">Lesson progress</div>
                  <div className="text-lg font-semibold mt-2">{Math.round((Object.values(completed).filter(Boolean).length / (chapters.flatMap(c => c.lessons).length || 1)) * 100)}% complete</div>
                  <div className="mt-3 w-full bg-slate-800 rounded-full h-2">
                    <div className="h-2 bg-emerald-500" style={{ width: `${Math.round((Object.values(completed).filter(Boolean).length / (chapters.flatMap(c => c.lessons).length || 1)) * 100)}%` }} />
                  </div>

                  <button onClick={markAll} className="mt-2 w-full px-3 py-2 rounded bg-rose-600 text-white text-sm">Mark all as complete</button>
                </motion.div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                             Export default (for demo)                      */
/* -------------------------------------------------------------------------- */
export default CoursePlayer;
