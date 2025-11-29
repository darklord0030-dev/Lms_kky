import React, { useEffect, useRef, useState } from "react";
import {
  Edit2,
  Upload,
  List,
  FileText,
  Video,
  Eye,
  GripVertical,
  Plus,
  BookOpen,
  Grid,
  X,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";

type TestType = "mcq" | "ordering" | "match";

interface BaseTest {
  id: number;
  type: TestType;
  question: string;
}

interface MCQTest extends BaseTest {
  type: "mcq";
  options: string[]; // length >= 2
  answerIndex: number; // index into options
}

interface OrderingTest extends BaseTest {
  type: "ordering";
  steps: string[]; // ordered steps
}

interface MatchPair {
  left: string;
  right: string;
}

interface MatchTest extends BaseTest {
  type: "match";
  pairs: MatchPair[]; // array of pairs
}

type TestQuestion = MCQTest | OrderingTest | MatchTest;

interface AssignmentItem {
  id: number;
  title: string;
  description?: string;
  file?: string; // object URL
}

export interface Chapter {
  id: number;
  title: string;
  description?: string;
  video_url?: string;
  is_free_preview?: boolean;
  status?: "free" | "published" | "draft";
  tests?: TestQuestion[];
  assignments?: AssignmentItem[];
}

export interface Attachment {
  id: number;
  name: string;
  url?: string;
  size?: number;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  image_url?: string;
  category?: string;
  price: number;
  status?: "Draft" | "Published" | "Archived";
}

const LS_KEY = "cm:course_state_v1";

function saveToStorage(payload: { course: Course; chapters: Chapter[]; attachments: Attachment[] }) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(payload));
  } catch (e) {
    // ignore
  }
}

function loadFromStorage(): { course?: Course; chapters?: Chapter[]; attachments?: Attachment[] } {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

export default function CourseManager(): JSX.Element {
  const stored = loadFromStorage();

  const [course, setCourse] = useState<Course>(
    stored.course || { id: 1, title: "", description: "", image_url: "", category: "", price: 0 }
  );

  const [chapters, setChapters] = useState<Chapter[]>(stored.chapters || []);
  const [attachments, setAttachments] = useState<Attachment[]>(stored.attachments || []);
  const [showSetup, setShowSetup] = useState<boolean>(false);
  const [activeChapterId, setActiveChapterId] = useState<number | null>(null);
  const [isPublished, setIsPublished] = useState<boolean>(false);

  const [chapterToDelete, setChapterToDelete] = useState<Chapter | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  useEffect(() => {
    saveToStorage({ course, chapters, attachments });
  }, [course, chapters, attachments]);

  const handleCourseNameContinue = (title: string) => {
    setCourse((c) => ({ ...c, title }));
    setShowSetup(true);
  };

  const handleCourseNameCancel = () => {
    setCourse((c) => ({ ...c, title: "" }));
  };

  const handleUpdateCourse = (updates: Partial<Course>) => setCourse((c) => ({ ...c, ...updates }));

  const handleAddChapter = () => {
    const newChapter: Chapter = {
      id: Date.now(),
      title: `Chapter ${chapters.length + 1}`,
      description: "",
      is_free_preview: false,
      status: "draft",
      tests: [],
      assignments: [],
    };
    setChapters((prev) => [...prev, newChapter]);
    setActiveChapterId(newChapter.id);
  };

  const handleUpdateChapter = (id: number, updates: Partial<Chapter>) =>
    setChapters((prev) => prev.map((ch) => (ch.id === id ? { ...ch, ...updates } : ch)));

  const handleAddAttachment = (file: File) => {
    const newAttachment: Attachment = {
      id: Date.now(),
      name: file.name,
      url: URL.createObjectURL(file),
      size: file.size,
    };
    setAttachments((prev) => [...prev, newAttachment]);
  };

  const handlePublishCourse = () => {
    setIsPublished((p) => !p);
    setShowSetup((s) => !s);
    confetti({ spread: 70, particleCount: 200, origin: { y: 0.6 } });
  };

  const [draggedId, setDraggedId] = useState<number | null>(null);
  const handleDragStart = (id: number) => setDraggedId(id);
  const handleDropChapter = (targetId: number) => {
    if (draggedId === null) return;
    const srcIndex = chapters.findIndex((c) => c.id === draggedId);
    const dstIndex = chapters.findIndex((c) => c.id === targetId);
    if (srcIndex === -1 || dstIndex === -1) {
      setDraggedId(null);
      return;
    }
    const copy = [...chapters];
    const [item] = copy.splice(srcIndex, 1);
    copy.splice(dstIndex, 0, item);
    setChapters(copy);
    setDraggedId(null);
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "free":
        return "bg-gray-900 text-white";
      case "published":
        return "bg-blue-600 text-white";
      case "draft":
        return "bg-gray-600 text-white";
      default:
        return "bg-gray-600 text-white";
    }
  };

  const activeChapter = chapters.find((c) => c.id === activeChapterId) ?? null;

  const requestDeleteChapter = (ch: Chapter) => {
    setChapterToDelete(ch);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteChapter = () => {
    if (!chapterToDelete) return;
    setChapters((prev) => prev.filter((c) => c.id !== chapterToDelete.id));
    if (activeChapterId === chapterToDelete.id) setActiveChapterId(null);
    setShowDeleteConfirm(false);
    setChapterToDelete(null);
  };

  const cancelDeleteChapter = () => {
    setShowDeleteConfirm(false);
    setChapterToDelete(null);
  };

  if (isPublished) {
    return (
      <>
        <PublishedCourseCard course={course} chapters={chapters} />
        <div className="fixed bottom-6 right-6">
          <button
            onClick={() => setIsPublished(false)}
            className="px-4 py-2 rounded-lg bg-white shadow text-gray-800 border"
          >
            Unpublish
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      {!showSetup ? (
        <CourseNameDialog onContinue={handleCourseNameContinue} onCancel={handleCourseNameCancel} />
      ) : activeChapter ? (
        <ChapterCreation
          chapter={activeChapter}
          onUpdateChapter={(updates) => handleUpdateChapter(activeChapter.id, updates)}
          onSave={() => setActiveChapterId(null)}
          onPublish={() => {
            const isNowPublished = activeChapter.status !== "published";
            handleUpdateChapter(activeChapter.id, { status: isNowPublished ? "published" : "draft" });
            alert(isNowPublished ? "✅ Chapter published" : "✅ Chapter unpublished");
          }}
        />
      ) : (
        <CourseSetup
          course={course}
          chapters={chapters}
          attachments={attachments}
          onUpdateCourse={handleUpdateCourse}
          onAddChapter={handleAddChapter}
          onAddAttachment={handleAddAttachment}
          onPublish={handlePublishCourse}
          onEditChapter={(ch) => setActiveChapterId(ch.id)}
          onDeleteChapter={(ch) => requestDeleteChapter(ch)}
          isPublished={isPublished}
          handleDragStart={(id: number) => handleDragStart(id)}
          handleDragOver={(e: React.DragEvent) => e.preventDefault()}
          handleDrop={(id: number) => handleDropChapter(id)}
          draggedId={draggedId}
          getStatusColor={getStatusColor}
        />
      )}

      {showDeleteConfirm && chapterToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-2">Delete chapter</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete "{chapterToDelete.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={cancelDeleteChapter} className="px-4 py-2 rounded-lg border">
                Cancel
              </button>
              <button onClick={confirmDeleteChapter} className="px-4 py-2 rounded-lg bg-red-600 text-white">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function CourseNameDialog({ onContinue, onCancel }: { onContinue: (t: string) => void; onCancel: () => void }) {
  const [title, setTitle] = useState("");
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">Name your course</h1>
        <p className="text-gray-500 mb-8">
          What would you like to name your course? You can change this later.
        </p>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Advanced Web Development"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex gap-3">
          <button onClick={onCancel} className="px-6 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-lg">
            Cancel
          </button>
          <button
            onClick={() => title.trim() && onContinue(title.trim())}
            disabled={!title.trim()}
            className="px-6 py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}



function PublishedCourseCard({ course, chapters }: { course: Course; chapters: Chapter[] }) {
  const totalChapters = chapters.length;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();


    // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getStatusClasses = (status: string) => {
    switch (status) {
      case "Published":
        return "bg-green-100 text-green-800";
      case "Draft":
        return "bg-yellow-100 text-yellow-800";
      case "Archived":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const handleMenuToggle = () => setMenuOpen(!menuOpen);
  const handleMenuAction = (action: string) => {
    setMenuOpen(false); // Close dropdown after action
    if (action === "Edit") {
      // Navigate to course setup page, pass course id
      navigate(`/course-setup/${course.title}`);
    } else if (action === "Preview") {
      alert("Preview Course"); // Replace with actual preview
    } else if (action === "Delete") {
      alert("Delete Course"); // Replace with actual delete
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden max-w-md w-full relative">
        {course.image_url ? (
          <img src={course.image_url} alt={course.title} className="w-full h-48 object-cover" />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
            No Image
          </div>
        )}

        {/* Top-right status + menu */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          {course.status && (
            <span
              className={`text-sm font-medium px-3 py-1 rounded-full ${getStatusClasses(
                course.status
              )}`}
            >
              {course.status} {/* Will display "Published" if course.status = "Published" */}
            </span>
          )}

          {/* Three dots menu */}
          <button
            className="p-1 rounded-full hover:bg-gray-200"
            onClick={handleMenuToggle}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v.01M12 12v.01M12 18v.01"
              />
            </svg>
          </button>

          {/* Dropdown menu */}
          {menuOpen && (
            <div className="absolute top-full right-0 mt-2 w-32 bg-white border rounded-lg shadow-lg z-10">
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                onClick={() => handleMenuAction("Edit")}
              >
                <Edit2 size={16} /> Edit
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                onClick={() => handleMenuAction("Preview")}
              >
                <Eye size={16} /> Preview
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                onClick={() => handleMenuAction("Delete")}
              >
                <Trash2 size={16} /> Delete
              </button>
            </div>
          )}
        </div>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {course.title || "Untitled Course"}
          </h2>
          <p className="text-gray-600 mb-4">{course.description || "No description provided."}</p>

          <div className="mb-4 text-gray-700">
            <span className="font-medium">Chapters: </span>
            <span>{totalChapters}</span>
          </div>

          <button
            onClick={() => navigate(`/Setup/${course.title}`)}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
          >
            Edit Course
          </button>
        </div>
      </div>
    </div>
  );
}

function CourseSetup(props: {
  course: Course;
  chapters: Chapter[];
  attachments: Attachment[];
  onUpdateCourse: (u: Partial<Course>) => void;
  onAddChapter: () => void;
  onAddAttachment: (f: File) => void;
  onPublish: () => void;
  onEditChapter: (ch: Chapter) => void;
  onDeleteChapter: (ch: Chapter) => void;
  isPublished: boolean;
  handleDragStart: (id: number) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (id: number) => void;
  draggedId: number | null;
  getStatusColor: (s?: string) => string;
}) {
  const {
    course,
    chapters,
    attachments,
    onUpdateCourse,
    onAddChapter,
    onAddAttachment,
    onPublish,
    onEditChapter,
    onDeleteChapter,
    draggedId,
    getStatusColor,
  } = props;

  const [courseTitle, setCourseTitle] = useState(course.title || "");
  const [courseDescription, setCourseDescription] = useState(course.description || "");
  const [courseImage, setCourseImage] = useState<string | null>(course.image_url || null);
  const [localAttachments, setLocalAttachments] = useState<Attachment[]>(attachments || []);

  useEffect(() => setCourseTitle(course.title || ""), [course.title]);
  useEffect(() => setCourseDescription(course.description || ""), [course.description]);
  useEffect(() => setCourseImage(course.image_url || null), [course.image_url]);
  useEffect(() => setLocalAttachments(attachments || []), [attachments]);

  const completedFields = [courseTitle, courseDescription, courseImage, chapters.length > 0].filter(Boolean).length;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setCourseImage(reader.result as string);
      onUpdateCourse({ image_url: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((f) => onAddAttachment(f));
  };

  const addChapter = () => onAddChapter();

  const removeAttachment = (id: number) => setLocalAttachments((s) => s.filter((a) => a.id !== id));

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Course setup</h1>
          <p className="text-gray-500 mt-1">Complete all fields ({completedFields}/4)</p>
        </div>
        <button
          onClick={onPublish}
          className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all ${
            completedFields === 4
              ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          disabled={completedFields !== 4}
        >
          Publish
          <Upload size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Grid className="text-blue-600" size={24} />
              <h2 className="text-xl font-semibold text-gray-900">Customize your course</h2>
            </div>

            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <label className="font-medium text-gray-900">Course title</label>
                  <button
                    onClick={() => {
                      setCourseTitle(course.title || "");
                    }}
                    className="text-gray-600 hover:text-blue-600"
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
                <input
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  onBlur={() => onUpdateCourse({ title: courseTitle })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <label className="font-medium text-gray-900">Course description</label>
                  <button
                    onClick={() => setCourseDescription(course.description || "")}
                    className="text-gray-600 hover:text-blue-600"
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
                <textarea
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                  onBlur={() => onUpdateCourse({ description: courseDescription })}
                  className="w-full px-3 py-2 border rounded-md resize-none"
                  rows={4}
                />
              </div>

              <div>
                <label className="font-medium text-gray-900 block mb-3">Course image</label>
                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-400 transition-colors">
                  {courseImage ? (
                    <div className="relative">
                      <img src={courseImage} alt="Course" className="w-full h-48 object-cover rounded-lg" />
                      <button
                        onClick={() => {
                          setCourseImage(null);
                          onUpdateCourse({ image_url: "" });
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center cursor-pointer">
                      <Upload className="text-gray-400 mb-2" size={40} />
                      <span className="text-blue-600 font-medium">Add image</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <List className="text-blue-600" size={24} />
                <h2 className="text-xl font-semibold text-gray-900">Course Chapters</h2>
              </div>
              <button onClick={addChapter} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
                <Plus size={20} />
                Add a chapter
              </button>
            </div>

            {chapters.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 italic mb-2">No chapters yet</p>
                <p className="text-gray-400 text-sm">Drag and drop to reorder chapters</p>
              </div>
            ) : (
              <div className="space-y-3">
                {chapters.map((chapter) => (
                  <div
                    key={chapter.id}
                    draggable
                    onDragStart={() => props.handleDragStart(chapter.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => props.handleDrop(chapter.id)}
                    className={`flex items-center gap-3 p-4 rounded-lg border ${
                      props.draggedId === chapter.id
                        ? "border-blue-300 shadow-sm bg-blue-50"
                        : "border-gray-200 bg-gray-50"
                    } hover:border-blue-300 cursor-move transition-all`}
                  >
                    <GripVertical className="text-gray-400" size={20} />
                    <span className="flex-1 font-medium text-gray-900">{chapter.title}</span>
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(chapter.status)}`}>
                      {chapter.status || "draft"}
                    </span>
                    <button onClick={() => onEditChapter(chapter)} className="text-gray-600 hover:text-blue-600 ml-2">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => onDeleteChapter(chapter)} className="text-gray-600 hover:text-red-600 ml-2">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="text-blue-600" size={24} />
              <h2 className="text-xl font-semibold text-gray-900">Attachments</h2>
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-3">
                <label className="font-medium text-gray-900">Course attachments</label>
                <label className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium cursor-pointer">
                  <Plus size={20} />
                  Add a file
                  <input type="file" multiple onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              {localAttachments.length === 0 ? (
                <p className="text-gray-500 italic text-center py-6">No attachments yet</p>
              ) : (
                <div className="space-y-2">
                  {localAttachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <FileText className="text-blue-600" size={20} />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">{attachment.name}</p>
                        <p className="text-gray-500 text-xs">{formatFileSize(attachment.size)}</p>
                      </div>
                      <button onClick={() => removeAttachment(attachment.id)} className="text-gray-400 hover:text-red-500">
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChapterCreation({
  chapter,
  onUpdateChapter,
  onSave,
  onPublish,
}: {
  chapter: Chapter;
  onUpdateChapter: (u: Partial<Chapter>) => void;
  onSave: () => void;
  onPublish: () => void;
}) {
  const [chapterTitle, setChapterTitle] = useState(chapter.title || "Chapter 1");
  const [chapterDescription, setChapterDescription] = useState(chapter.description || "");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isPaid, setIsPaid] = useState(!chapter.is_free_preview);
  const [isDragging, setIsDragging] = useState(false);
  const [showTestBuilder, setShowTestBuilder] = useState(false);
  const [localTests, setLocalTests] = useState<TestQuestion[]>(chapter.tests || []);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setChapterTitle(chapter.title || "Chapter 1");
    setChapterDescription(chapter.description || "");
    setIsPaid(!chapter.is_free_preview);
    setLocalTests(chapter.tests || []);
  }, [chapter]);

  useEffect(() => {
    onUpdateChapter({ tests: localTests });
  }, [localTests]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onUpdateChapter({ video_url: url });
    }
  };
  const handleSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onUpdateChapter({ video_url: url });
    }
  };

  const saveAndBack = () => {
    onUpdateChapter({
      title: chapterTitle,
      description: chapterDescription,
      is_free_preview: !isPaid,
      tests: localTests,
    });
    onSave();
  };

  const togglePublish = () => {
    const newStatus = chapter.status === "published" ? "draft" : "published";
    onUpdateChapter({ status: newStatus });
    onPublish();
  };

  const handleAddTest = (test: TestQuestion) => {
    setLocalTests((s) => [...s, test]);
    setShowTestBuilder(false);
  };

  return showTestBuilder ? (
    <TestBuilder
      onBack={() => setShowTestBuilder(false)}
      onSave={(t) => handleAddTest(t)}
    />
  ) : (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-7 h-7 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Chapter creation</h1>
          </div>
          <div className="flex gap-3">
            <button onClick={saveAndBack} className="px-6 py-2.5 bg-white border text-gray-700 rounded-lg">
              Save
            </button>

            <button
              onClick={togglePublish}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-md flex items-center gap-2 ${
                chapter.status === "published" ? "bg-red-600 text-white" : "bg-blue-600 text-white"
              }`}
            >
              <Upload className="w-4 h-4" />
              {chapter.status === "published" ? "Unpublish" : "Publish"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-600 uppercase">Chapter title</h2>
                {!isEditingTitle ? (
                  <button onClick={() => setIsEditingTitle(true)} className="flex items-center gap-1.5 text-blue-600">
                    <Edit2 className="w-4 h-4" /> Edit
                  </button>
                ) : (
                  <button onClick={() => setIsEditingTitle(false)} className="text-green-600">
                    Done
                  </button>
                )}
              </div>
              {isEditingTitle ? (
                <input
                  value={chapterTitle}
                  onChange={(e) => setChapterTitle(e.target.value)}
                  onBlur={() => onUpdateChapter({ title: chapterTitle })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              ) : (
                <p className="text-gray-900 font-medium text-lg">{chapterTitle}</p>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-600 uppercase">Chapter description</h2>
                {!isEditingDescription ? (
                  <button onClick={() => setIsEditingDescription(true)} className="flex items-center gap-1.5 text-blue-600">
                    <Edit2 className="w-4 h-4" /> Edit
                  </button>
                ) : (
                  <button onClick={() => setIsEditingDescription(false)} className="text-green-600">
                    Done
                  </button>
                )}
              </div>
              {isEditingDescription ? (
                <textarea
                  value={chapterDescription}
                  onChange={(e) => setChapterDescription(e.target.value)}
                  onBlur={() => onUpdateChapter({ description: chapterDescription })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              ) : (
                <p className="text-gray-500 italic">{chapterDescription || "No description"}</p>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-5 h-5" />
                <h2 className="text-sm font-semibold text-gray-600 uppercase">Access Settings</h2>
              </div>
              <p className="text-gray-600 mb-4">
                This chapter is {isPaid ? <b>paid</b> : <b>free</b>}.
              </p>
              <button
                onClick={() => {
                  setIsPaid(!isPaid);
                  onUpdateChapter({ is_free_preview: isPaid });
                }}
                className="px-5 py-2.5 bg-gray-900 text-white rounded-lg"
              >
                Toggle Free Preview
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center gap-2 mb-6">
                <Video className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Add a video</h2>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700">Chapter video</h3>
                  <div className="flex items-center gap-2">
                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 text-blue-600">
                      <Plus className="w-4 h-4" /> Add a video
                    </button>
                    <input ref={fileInputRef} type="file" accept="video/*" onChange={handleSelectFile} className="hidden" />
                  </div>
                </div>

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-12 text-center ${
                    isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50"
                  }`}
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-blue-600 font-medium mb-1">Choose files or Drag and Drop</p>
                  <p className="text-sm text-gray-500">Upload your video file here</p>

                  {chapter.video_url ? (
                    <div className="mt-4">
                      <video src={chapter.video_url} controls className="mx-auto max-w-full rounded" />
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center gap-2 mb-6">
                <FileText className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Tests & Assignments</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700">Chapter Test</h3>
                    <button onClick={() => setShowTestBuilder(true)} className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium">
                      <Plus className="w-4 h-4" /> Add Test
                    </button>
                  </div>

                  <div className="border-2 border-dashed rounded-lg p-6 text-gray-500 text-sm bg-gray-50">
                    {localTests.length > 0 ? (
                      <div className="space-y-3">
                        {localTests.map((t) => (
                          <div key={t.id} className="p-3 border rounded">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-gray-900">{t.question}</p>
                                <p className="text-xs text-gray-600">Type: {t.type}</p>
                                {t.type === "mcq" && (
                                  <div className="text-sm text-gray-700 mt-1">
                                    Options: {(t as MCQTest).options.join(" | ")}
                                  </div>
                                )}
                                {t.type === "ordering" && (
                                  <div className="text-sm text-gray-700 mt-1">
                                    Steps: {(t as OrderingTest).steps.join(" → ")}
                                  </div>
                                )}
                                {t.type === "match" && (
                                  <div className="text-sm text-gray-700 mt-1">
                                    Pairs: {(t as MatchTest).pairs
                                      .map((p) => `${p.left}↔${p.right}`)
                                      .join(", ")}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      "No tests added yet"
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700">Assignments</h3>
                    <button
                      onClick={() => {
                        const newA: AssignmentItem = { id: Date.now(), title: "New assignment" };
                        onUpdateChapter({ assignments: [...(chapter.assignments || []), newA] });
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium"
                    >
                      <Plus className="w-4 h-4" /> Add Assignment
                    </button>
                  </div>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center text-gray-500 text-sm bg-gray-50">
                    {chapter.assignments && chapter.assignments.length > 0 ? (
                      <div className="space-y-2">
                        {chapter.assignments.map((a) => (
                          <div key={a.id} className="text-left">
                            <p className="font-medium text-gray-900">{a.title}</p>
                            <p className="text-xs text-gray-500">{a.description || ""}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      "No assignments added yet"
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function TestBuilder({ onBack, onSave }: { onBack: () => void; onSave: (t: TestQuestion) => void }) {
  const [selectedType, setSelectedType] = useState<TestType>("mcq");

  // MCQ
  const [mcqQuestion, setMcqQuestion] = useState("");
  const [mcqOptions, setMcqOptions] = useState(["", "", "", ""]);
  const [mcqAnswer, setMcqAnswer] = useState<number>(0);

  // Ordering
  const [ordQuestion, setOrdQuestion] = useState("");
  const [ordSteps, setOrdSteps] = useState<string[]>(["", "", ""]);

  // Match
  const [matchQuestion, setMatchQuestion] = useState("");
  const [pairs, setPairs] = useState<MatchPair[]>([
    { left: "", right: "" },
    { left: "", right: "" },
    { left: "", right: "" },
  ]);

  const resetAll = () => {
    setMcqQuestion("");
    setMcqOptions(["", "", "", ""]);
    setMcqAnswer(0);
    setOrdQuestion("");
    setOrdSteps(["", "", "", ""]);
    setMatchQuestion("");
    setPairs([
      { left: "", right: "" },
      { left: "", right: "" },
      { left: "", right: "" },
    ]);
  };

  const handleSaveMCQ = () => {
    if (!mcqQuestion.trim()) return alert("Enter question");
    const test: MCQTest = {
      id: Date.now(),
      type: "mcq",
      question: mcqQuestion,
      options: mcqOptions.map((s) => s || "(empty)"),
      answerIndex: mcqAnswer,
    };
    onSave(test);
    resetAll();
  };

  const handleSaveOrdering = () => {
    if (!ordQuestion.trim()) return alert("Enter question");
    const cleaned = ordSteps.filter(Boolean);
    if (cleaned.length < 2) return alert("Add at least 2 steps");
    const test: OrderingTest = {
      id: Date.now(),
      type: "ordering",
      question: ordQuestion,
      steps: cleaned,
    };
    onSave(test);
    resetAll();
  };

  const handleSaveMatch = () => {
    if (!matchQuestion.trim()) return alert("Enter question");
    const cleaned = pairs.filter((p) => p.left || p.right);
    if (cleaned.length < 1) return alert("Add at least 1 pair");
    const test: MatchTest = {
      id: Date.now(),
      type: "match",
      question: matchQuestion,
      pairs: cleaned,
    };
    onSave(test);
    resetAll();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow rounded-xl p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Create Test</h1>
          <div className="flex items-center gap-2">
            <button onClick={onBack} className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700">
              Back
            </button>
          </div>
        </div>

        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700">Select Question Type</label>
          <select value={selectedType} onChange={(e) => setSelectedType(e.target.value as TestType)} className="w-full mt-2 p-3 border rounded-lg">
            <option value="mcq">MCQ</option>
            <option value="ordering">Ordering</option>
            <option value="match">Match the Pairs</option>
          </select>
        </div>

        {/* MCQ */}
        {selectedType === "mcq" && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">MCQ Question</h2>
            <input
              className="w-full p-3 border rounded-lg"
              placeholder="Enter question"
              value={mcqQuestion}
              onChange={(e) => setMcqQuestion(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              {mcqOptions.map((opt, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    className="flex-1 p-3 border rounded-lg"
                    placeholder={`Option ${i + 1}`}
                    value={opt}
                    onChange={(e) =>
                      setMcqOptions((s) => s.map((v, idx) => (idx === i ? e.target.value : v)))
                    }
                  />
                  <label className="text-xs">
                    Answer
                    <input type="radio" name="mcqAnswer" checked={mcqAnswer === i} onChange={() => setMcqAnswer(i)} className="ml-2" />
                  </label>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={handleSaveMCQ} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                Save MCQ
              </button>
            </div>
          </div>
        )}

        {/* ORDERING */}
        {selectedType === "ordering" && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Ordering Question</h2>
            <input
              className="w-full p-3 border rounded-lg"
              placeholder="Enter question"
              value={ordQuestion}
              onChange={(e) => setOrdQuestion(e.target.value)}
            />
            {[0, 1, 2, 3].map((i) => (
              <input
                key={i}
                className="w-full p-3 border rounded-lg"
                placeholder={`Step ${i + 1}`}
                value={ordSteps[i] || ""}
                onChange={(e) => {
                  const copy = [...ordSteps];
                  copy[i] = e.target.value;
                  setOrdSteps(copy);
                }}
              />
            ))}
            <div className="flex gap-2">
              <button onClick={handleSaveOrdering} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                Save Ordering
              </button>
            </div>
          </div>
        )}

        {/* MATCH */}
        {selectedType === "match" && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Match the Pairs</h2>
            <input
              className="w-full p-3 border rounded-lg"
              placeholder="Enter question"
              value={matchQuestion}
              onChange={(e) => setMatchQuestion(e.target.value)}
            />
            {pairs.map((p, i) => (
              <div key={i} className="grid grid-cols-2 gap-3">
                <input
                  className="p-3 border rounded-lg"
                  placeholder={`Left ${i + 1}`}
                  value={p.left}
                  onChange={(e) => {
                    const updated = [...pairs];
                    updated[i] = { ...updated[i], left: e.target.value };
                    setPairs(updated);
                  }}
                />
                <input
                  className="p-3 border rounded-lg"
                  placeholder={`Right ${i + 1}`}
                  value={p.right}
                  onChange={(e) => {
                    const updated = [...pairs];
                    updated[i] = { ...updated[i], right: e.target.value };
                    setPairs(updated);
                  }}
                />
              </div>
            ))}
            <div className="flex gap-2">
              <button onClick={handleSaveMatch} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                Save Pairs
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
