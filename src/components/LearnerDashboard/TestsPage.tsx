import React, { useState } from "react";
import confetti from "canvas-confetti";
import {
  Play,
  CheckCircle,
  LogOut,
  Download,
  FileText,
  Award,
  BookOpen,
  Clock,
  ChevronRight,
  Menu,
  X
} from "lucide-react";

// Types
type Attachment = { id: string; name: string; dataUrl: string };
type Quiz = { question: string; options: string[]; answer: number; explanation?: string };
type Lesson = { id: string; title: string; content?: string; videoUrl?: string; attachments?: Attachment[]; duration?: string; quiz?: Quiz };
type Chapter = { id: string; title: string; lessons: Lesson[] };
type Course = { id: string; title: string; description?: string; chapters: Chapter[]; thumbnail?: string };
type Student = { id: string; name: string; xp: number; level: number; badge?: string };

// Mock Courses
const mockCourses: Course[] = [
  {
    id: "1",
    title: "React Fundamentals",
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop",
    chapters: [
      {
        id: "c1",
        title: "Getting Started",
        lessons: [
          {
            id: "l1",
            title: "Introduction to React",
            content: "<h3>Welcome to React!</h3><p>Learn core React concepts.</p>",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            duration: "12:45",
            quiz: {
              question: "What is React?",
              options: ["A library", "A framework", "A language", "A database"],
              answer: 0,
              explanation: "React is a JavaScript library for building user interfaces."
            }
          }
        ]
      }
    ]
  }
];

// Students Mock Data
const mockStudents: Student[] = [
  { id: "s1", name: "Alice", xp: 150, level: 2 },
  { id: "s2", name: "Bob", xp: 90, level: 1 },
  { id: "s3", name: "Charlie", xp: 250, level: 3 },
  { id: "s4", name: "You", xp: parseInt(localStorage.getItem("xp") || "0", 10), level: Math.floor(parseInt(localStorage.getItem("xp") || "0", 10)/100)+1 }
];

const LEVEL_XP = 100; // XP per level

export default function StudentView() {
  const [courses] = useState<Course[]>(mockCourses);
  const [selectedCourse, setSelectedCourse] = useState<Course>(mockCourses[0]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson>(mockCourses[0].chapters[0].lessons[0]);
  const [progress, setProgress] = useState<Record<string, { completed: boolean; completedAt?: string }>>({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({ c1: true });
  const [quizState, setQuizState] = useState({ selected: null as number | null, showExplanation: false });
  const [students, setStudents] = useState<Student[]>(mockStudents);

  const [xp, setXp] = useState<number>(students.find(s => s.id === "s4")?.xp || 0);
  const [level, setLevel] = useState<number>(Math.floor(xp / LEVEL_XP) + 1);

  const awardXP = (amount: number) => {
    setXp(prev => {
      const newXP = prev + amount;
      localStorage.setItem("xp", newXP.toString());
      const newLevel = Math.floor(newXP / LEVEL_XP) + 1;
      if (newLevel > level) {
        setLevel(newLevel);
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 }, colors: ["#FFD700","#FFAA00","#FFA500","#FFF700"] });
      }
      // Update leaderboard
      setStudents(prevStudents => prevStudents.map(s => s.id === "s4" ? { ...s, xp: newXP, level: newLevel } : s));
      return newXP;
    });
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ["#FFD700","#FFAA00","#FFA500","#FFF700"] });
  };

  const toggleChapter = (chapterId: string) => setExpandedChapters(prev => ({ ...prev, [chapterId]: !prev[chapterId] }));
  const markAsComplete = (lessonId: string) => {
    if (progress[lessonId]?.completed) return;
    setProgress(prev => ({ ...prev, [lessonId]: { completed: true, completedAt: new Date().toISOString() } }));
    awardXP(20);
  };

  const handleOptionSelect = (index: number, correctIndex: number) => {
    if (quizState.selected !== null) return;
    const isCorrect = index === correctIndex;
    if (isCorrect) awardXP(10);
    setQuizState({ selected: index, showExplanation: !isCorrect });
  };
  const resetQuiz = () => setQuizState({ selected: null, showExplanation: false });

  const getCourseProgress = (course: Course) => {
    const total = course.chapters.reduce((acc, ch) => acc + ch.lessons.length, 0);
    const done = course.chapters.reduce((acc, ch) => acc + ch.lessons.filter(l => progress[l.id]?.completed).length, 0);
    return { done, total, percent: total > 0 ? Math.round((done / total) * 100) : 0 };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-40 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-700 rounded-lg lg:hidden">{sidebarOpen ? <X size={20}/> : <Menu size={20}/>}</button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center"><BookOpen size={20} className="text-white"/></div>
            <div>
              <h1 className="text-xl font-bold text-white">My LMS</h1>
              <p className="text-xs text-slate-400">Level {level} — XP: {xp}</p>
              <div className="mt-1 w-40 h-3 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-3 bg-yellow-400 transition-all duration-500" style={{ width: `${(xp % LEVEL_XP) / LEVEL_XP * 100}%` }}/>
              </div>
            </div>
          </div>
        </div>
        <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-300"><LogOut size={20}/></button>
      </div>

      <div className="flex flex-1">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'w-96' : 'w-0'} transition-all duration-300 bg-slate-800/50 backdrop-blur-sm border-r border-slate-700 flex flex-col overflow-hidden`}>
          <div className="flex-1 overflow-y-auto p-6">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Leaderboard</h2>
            <div className="space-y-2">
              {students.sort((a,b)=>b.xp-a.xp).map((s,i)=>(
                <div key={s.id} className={`flex items-center justify-between p-3 rounded-lg ${s.id === "s4" ? "bg-blue-800" : "bg-slate-900/50"}`}>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white">{i+1}.</span>
                    <span className="text-white">{s.name}</span>
                  </div>
                  <div className="text-slate-300">{s.level}L | {s.xp} XP</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden p-8">
          <h2 className="text-2xl font-bold text-white mb-6">{selectedCourse.title}</h2>
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
            <h3 className="text-xl font-semibold text-white mb-4">{selectedLesson.title}</h3>
            <div className="prose prose-invert text-slate-300" dangerouslySetInnerHTML={{ __html: selectedLesson.content || "<p>No content</p>" }}/>
            {selectedLesson.quiz && (
              <div className="mt-6 p-4 bg-slate-900/60 border border-slate-700 rounded-xl">
                <h4 className="text-white font-semibold mb-3">{selectedLesson.quiz.question}</h4>
                <div className="space-y-2">
                  {selectedLesson.quiz.options.map((opt, idx)=> {
                    let cls = "w-full text-left px-4 py-2 rounded-lg transition-all ";
                    if (quizState.selected === null) cls += "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700";
                    else if (idx === selectedLesson.quiz.answer) cls += "bg-green-600 text-white border border-green-500";
                    else if (idx === quizState.selected) cls += "bg-red-600 text-white border border-red-500";
                    else cls += "bg-slate-700 text-slate-400 border border-slate-600 opacity-50 cursor-not-allowed";
                    return <button key={idx} className={cls} disabled={quizState.selected !== null} onClick={()=>handleOptionSelect(idx, selectedLesson.quiz!.answer)}>{opt}</button>
                  })}
                </div>
                {quizState.showExplanation && selectedLesson.quiz.explanation && <div className="mt-3 text-slate-300 border border-slate-600 p-3 rounded-lg">Explanation: {selectedLesson.quiz.explanation}</div>}
                {quizState.selected !== null && <button onClick={resetQuiz} className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-all">Next</button>}
              </div>
            )}
            <button onClick={()=>markAsComplete(selectedLesson.id)} className={`mt-6 flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${progress[selectedLesson.id]?.completed ? 'bg-green-600 text-white cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg'}`} disabled={progress[selectedLesson.id]?.completed}><CheckCircle size={20}/>{progress[selectedLesson.id]?.completed ? " Completed" : " Mark Complete"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
