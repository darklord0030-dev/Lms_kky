// TeacherView.tsx
import React, { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Play,
  Eye,
  ArrowLeft,
  Edit,
  Save,
  UserPlus,
  Edit2,
} from "lucide-react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DroppableProvided,
  DraggableProvided,
} from "react-beautiful-dnd";
import toast, { Toaster } from "react-hot-toast";

type Lesson = {
  id: string;
  chapter_id: string;
  title: string;
  content: string;
  video_url?: string | null;
};

type Chapter = {
  id: string;
  course_id: string;
  title: string;
  lessons: Lesson[];
};

type Course = {
  id: string;
  title: string;
  description: string;
  chapters: Chapter[];
  thumbnail_url?: string | null;
  published: boolean;
};


export default function TeacherView() {
  // courses + selection
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
const [editingLessonData, setEditingLessonData] = useState<{ title: string; content: string; video_file: File | null }>({
  title: "",
  content: "",
  video_file: null,
});


  // new course form (includes thumbnail file and published flag)
  const [newCourse, setNewCourse] = useState<any>({
    title: "",
    description: "",
    thumbnail_file: null as File | null,
    published: false,
  });

  // chapter + lesson forms
  const [newChapter, setNewChapter] = useState({ title: "" });
  const [newLesson, setNewLesson] = useState<{
    title: string;
    content: string;
    video_file: File | null;
  }>({ title: "", content: "", video_file: null });

  // UI state
  const [showNewCourseForm, setShowNewCourseForm] = useState(false);
  const [showNewChapterForm, setShowNewChapterForm] = useState(false);
  const [showNewLessonForm, setShowNewLessonForm] = useState<string | null>(
    null
  );
  const [previewMode, setPreviewMode] = useState(false); // student preview

  // init
  useEffect(() => {
    const saved = localStorage.getItem("courses_v2");
    if (saved) setCourses(JSON.parse(saved));
  }, []);

  const saveLocal = (updated: Course[]) => {
    setCourses(updated);
    localStorage.setItem("courses_v2", JSON.stringify(updated));
    // if the selected course was changed, refresh it
    if (selectedCourse) {
      const fresh = updated.find((c) => c.id === selectedCourse.id) ?? null;
      setSelectedCourse(fresh);
    }
  };

  // -------------------------
  // Course CRUD + thumbnails
  // -------------------------
  const createCourse = () => {
    const thumbnailURL = newCourse.thumbnail_file
      ? URL.createObjectURL(newCourse.thumbnail_file)
      : null;

    const course: Course = {
      id: crypto.randomUUID(),
      title: newCourse.title || "Untitled course",
      description: newCourse.description || "",
      chapters: [],
      thumbnail_url: thumbnailURL,
      published: !!newCourse.published,
    };

    const updated = [course, ...courses];
    saveLocal(updated);
    setNewCourse({ title: "", description: "", thumbnail_file: null, published: true });
    setShowNewCourseForm(false);
    // auto-open the created course
    setSelectedCourse(course);
  };

  const deleteCourse = (courseId: string) => {
    if (!confirm("Delete course?")) return;
    const updated = courses.filter((c) => c.id !== courseId);
    saveLocal(updated);
    if (selectedCourse?.id === courseId) setSelectedCourse(null);
  };

  const togglePublishCourse = (courseId: string) => {
    const updated = courses.map((c) =>
      c.id === courseId ? { ...c, published: !c.published } : c
    );
    saveLocal(updated);
  };

  // -------------------------
  // Chapters
  // -------------------------
  const createChapter = () => {
    if (!selectedCourse) return;
    const chapter: Chapter = {
      id: crypto.randomUUID(),
      course_id: selectedCourse.id,
      title: newChapter.title || "Untitled chapter",
      lessons: [],
    };
    const updated = courses.map((c) =>
      c.id === selectedCourse.id ? { ...c, chapters: [...c.chapters, chapter] } : c
    );
    saveLocal(updated);
    setNewChapter({ title: "" });
    setShowNewChapterForm(false);
  };

  const deleteChapter = (chapterId: string) => {
    if (!selectedCourse) return;
    if (!confirm("Delete chapter and its lessons?")) return;
    const updated = courses.map((c) =>
      c.id === selectedCourse.id
        ? { ...c, chapters: c.chapters.filter((ch) => ch.id !== chapterId) }
        : c
    );
    saveLocal(updated);
  };

  // -------------------------
  // Lessons
  // -------------------------
  const createLesson = (chapterId: string) => {
    if (!selectedCourse) return;
    const chapter = selectedCourse.chapters.find((c) => c.id === chapterId);
    if (!chapter) return;

    const videoURL = newLesson.video_file
      ? URL.createObjectURL(newLesson.video_file)
      : null;

      

    const lesson: Lesson = {
      id: crypto.randomUUID(),
      chapter_id: chapterId,
      title: newLesson.title || "Untitled lesson",
      content: newLesson.content || "",
      video_url: videoURL,
    
    };

    const updated = courses.map((c) =>
      c.id === selectedCourse.id
        ? {
            ...c,
            chapters: c.chapters.map((ch) =>
              ch.id === chapterId ? { ...ch, lessons: [...ch.lessons, lesson] } : ch
            ),
          }
        : c
    );
    saveLocal(updated);
    setShowNewLessonForm(null);
    setNewLesson({ title: "", content: "", video_file: null });
  };

  const deleteLesson = (chapterId: string, lessonId: string) => {
    if (!selectedCourse) return;
    if (!confirm("Delete this lesson?")) return;
    const updated = courses.map((c) =>
      c.id === selectedCourse.id
        ? {
            ...c,
            chapters: c.chapters.map((ch) =>
              ch.id === chapterId ? { ...ch, lessons: ch.lessons.filter((l) => l.id !== lessonId) } : ch
            ),
          }
        : c
    );
    saveLocal(updated);
  };

 const editLesson = (chapterId: string, lessonId: string, updatedFields: Partial<Lesson>) => {
  if (!selectedCourse) return;

  
  const updatedCourses = courses.map((course) =>
    course.id === selectedCourse.id
      ? {
          ...course,
          chapters: course.chapters.map((chapter) =>
            chapter.id === chapterId
              ? {
                  ...chapter,
                  lessons: chapter.lessons.map((lesson) =>
                    lesson.id === lessonId
                      ? {
                          ...lesson,
                          ...updatedFields,
                          video_url: updatedFields.video_file
                            ? URL.createObjectURL(updatedFields.video_file)
                            : lesson.video_url,
                        }
                      : lesson
                  ),
                }
              : chapter
          ),
        }
      : course
  );

  saveLocal(updatedCourses);
  setEditingLessonId(null);
  toast.success("Lesson updated ✨");
};

     
  // };
  // -------------------------
  // Drag & Drop handlers
  // Supports:
  // - Reordering chapters (droppableId = "chapters")
  // - Reordering lessons within same chapter or moving lessons between chapters
  //   (droppableId = `lessons:${chapterId}`)
  // -------------------------
  const handleDragEnd = (result: DropResult) => {
    if (!selectedCourse) return;
    const { source, destination, type } = result;
    if (!destination) return;

    // Reorder Chapters
    if (type === "chapter") {
      const newChapters = Array.from(selectedCourse.chapters);
      const [moved] = newChapters.splice(source.index, 1);
      newChapters.splice(destination.index, 0, moved);

      const updated = courses.map((c) =>
        c.id === selectedCourse.id ? { ...c, chapters: newChapters } : c
      );
      saveLocal(updated);
      return;
    }

    // Lessons drag (type === "lesson")
    if (type === "lesson") {
      const srcDroppable = source.droppableId; // lessons:<chapterId>
      const destDroppable = destination.droppableId;

      const srcChapterId = srcDroppable.split(":")[1];
      const destChapterId = destDroppable.split(":")[1];

      // find shallow copies
      const srcChapter = selectedCourse.chapters.find((c) => c.id === srcChapterId);
      const destChapter = selectedCourse.chapters.find((c) => c.id === destChapterId);
      if (!srcChapter || !destChapter) return;

      const srcLessons = Array.from(srcChapter.lessons);
      const [movedLesson] = srcLessons.splice(source.index, 1);

      // if moving to same chapter
      if (srcChapterId === destChapterId) {
        srcLessons.splice(destination.index, 0, movedLesson);
        const updatedChapters = selectedCourse.chapters.map((ch) =>
          ch.id === srcChapterId ? { ...ch, lessons: srcLessons } : ch
        );
        const updated = courses.map((c) =>
          c.id === selectedCourse.id ? { ...c, chapters: updatedChapters } : c
        );
        saveLocal(updated);
        return;
      }

      // moving across chapters
      const destLessons = Array.from(destChapter.lessons);
      destLessons.splice(destination.index, 0, { ...movedLesson, chapter_id: destChapterId });
      const updatedChapters = selectedCourse.chapters.map((ch) => {
        if (ch.id === srcChapterId) return { ...ch, lessons: srcLessons };
        if (ch.id === destChapterId) return { ...ch, lessons: destLessons };
        return ch;
      });

      const updated = courses.map((c) =>
        c.id === selectedCourse.id ? { ...c, chapters: updatedChapters } : c
      );
      saveLocal(updated);
      return;
    }
  };

  // -------------------------
  // Small helpers
  // -------------------------
  const openCourseEditor = (course: Course) => {
    setSelectedCourse(course);
    setPreviewMode(false);
  };

  const toggleCoursePublishedInEditor = (val?: boolean) => {
    if (!selectedCourse) return;
    const updated = courses.map((c) =>
      c.id === selectedCourse.id ? { ...c, published: typeof val === "boolean" ? val : !c.published } : c
    );
    saveLocal(updated);
  };

  // -------------------------
  // Render
  // -------------------------
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-blue-100 text-slate-900 p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <aside className="col-span-12 lg:col-span-3 bg-slate-200 text-black rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-extrabold">Admin Studio</h1>
            <button
              className="bg-slate-200 p-2 rounded-full"
              title="Preview mode"
              onClick={() => setPreviewMode((s) => !s)}
            >
              <Eye size={16} />
            </button>
          </div>

          <button
            onClick={() => {
              setShowNewCourseForm(true);
              setSelectedCourse(null);
            }}
            className="w-full flex items-center gap-2 justify-center bg-gradient-to-br from-purple-500 to-blue-500 py-2 rounded-xl text-white font-semibold shadow"
          >
            <Plus size={16} /> New Course
          </button>

          <div className="mt-2">
            <div className="text-xs text-slate-black mb-2">Courses</div>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
              {courses.map((course) => (
                <div
                  key={course.id}
                  onClick={() => openCourseEditor(course)}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition ${
                    selectedCourse?.id === course.id ? "bg-slate-700/60" : "hover:bg-slate-300"
                  }`}
                >
                  <img
                    src={course.thumbnail_url ?? `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='44'></svg>`}
                    alt="thumb"
                    className="w-12 h-8 object-cover rounded-md"
                  />
                  <div className="flex-2">
                    <div className="text-sl  font-medium truncate ">{course.title}</div>
                    
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePublishCourse(course.id);
                    }}
                    
                  >
                    
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-700/30">
            <div className="text-xs text-slate-black">Tips</div>
            <ul className="text-sm text-slate-black mt-2 space-y-1">
              <li>• Click a course card to edit</li>
              <li>• Use Preview to see student view</li>
              <li>• Drag chapters or lessons to reorder</li>
            </ul>
          </div>
        </aside>

        {/* Main */}
        <main className="col-span-12 lg:col-span-9">
          {/* New Course Form */}
          {showNewCourseForm && !selectedCourse && (
            <div className="bg-white rounded-2xl p-6 mb-6 shadow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Create Course</h2>
                <div className="flex gap-2 items-center">
                  <label className="text-sm">Publish</label>
                  <input
                    type="checkbox"
                    checked={!!newCourse.published}
                    onChange={(e) => setNewCourse({ ...newCourse, published: e.target.checked })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-3">
                  <input
                    className="w-full rounded-lg border px-3 py-2"
                    placeholder="Course title"
                    value={newCourse.title}
                    onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  />
                  <textarea
                    className="w-full rounded-lg border px-3 py-2"
                    placeholder="Short description"
                    value={newCourse.description}
                    onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Thumbnail</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, thumbnail_file: e.target.files?.[0] ?? null })
                    }
                  />
                  {newCourse.thumbnail_file && (
                    <img
                      src={URL.createObjectURL(newCourse.thumbnail_file)}
                      alt="preview"
                      className="w-full h-28 object-cover rounded-md"
                    />
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={createCourse}
                      className="flex-1 bg-purple-600 text-white py-2 rounded-xl font-semibold"
                    >
                      Create & Open
                    </button>
                    <button
                      onClick={() => {
                        setShowNewCourseForm(false);
                        setNewCourse({ title: "", description: "", thumbnail_file: null, published: false });
                      }}
                      className="flex-0 px-4 py-2 bg-slate-200 rounded-xl"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* If no course selected, show published/draft cards */}
          {!selectedCourse && !showNewCourseForm && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">COURSES</h2>
                <div className="text-sm text-slate-600">{courses.length} total</div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-2xl p-4 shadow-lg hover:shadow-2xl transition cursor-pointer relative"
                    onClick={() => openCourseEditor(course)}
                  >
                    {course.thumbnail_url ? (
                      <img src={course.thumbnail_url} alt="" className="w-full h-36 object-cover rounded-xl mb-3" />
                    ) : (
                      <div className="w-full h-36 rounded-xl bg-slate-100 mb-3 flex items-center justify-center text-slate-400">No thumbnail</div>
                    )}

                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <h3 className="text-lg font-bold">{course.title}</h3>
                        <p className="text-sm text-slate-600 mt-1 line-clamp-2">{course.description}</p>
                      </div>
                         
                         <div className = "flex  justify-end mb-1">
                          <button
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePublishCourse(course.id);
                          }}
                          className={`text-xs px-2 py-1 rounded-full ${course.published ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                        >
                          {course.published ? "Published" : "Draft"}
                        </button>

                       </div>

                      <div className="flex  items-end gap-2">
                        

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteCourse(course.id);
                          }}
                          className="text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                         <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            // enrollCourse(course.id);
                          }}
                          className="text-red-500"
                        >
                          <UserPlus size={16} />
                        </button>

                      </div>
                    </div>
                  </div>
                ))}

                {/* Add card */}
                <button
                  onClick={() => {
                    setShowNewCourseForm(true);
                    setSelectedCourse(null);
                  }}
                  className="rounded-2xl p-6 flex flex-col items-center justify-center bg-gradient-to-br from-purple-500 to-blue-500 text-white hover:brightness-110"
                >
                  <Plus size={28} />
                  <div className="mt-2 font-bold">Create Course</div>
                </button>
              </div>
            </div>
          )}

          {/* Course editor / preview */}
          {selectedCourse && !previewMode && (
            <div className="mt-6">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setSelectedCourse(null)}
                    className="rounded-full p-2 bg-white shadow"
                  >
                    <ArrowLeft size={18} />
                  </button>

                  <div>
                    <h2 className="text-3xl font-extrabold">{selectedCourse.title}</h2>
                    <p className="text-sm text-slate-500">{selectedCourse.description}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <button
                        onClick={() => toggleCoursePublishedInEditor()}
                        className={`px-3 py-1 rounded-full text-sm ${selectedCourse.published ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                      >
                        {selectedCourse.published ? "Published" : "Draft"}
                      </button>

                      <button
                        onClick={() => setPreviewMode(true)}
                        className="px-3 py-1 rounded-full bg-indigo-600 text-white text-sm flex items-center gap-2"
                      >
                        <Eye size={14} /> Preview as Student
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    className="px-3 py-2 rounded-xl bg-indigo-50 text-indigo-700"
                    onClick={() => {
                      // quick save (already autosaves but keep for UI)
                      saveLocal(courses);
                    }}
                  >
                    <Save size={14} /> Save
                  </button>
                  <button
                    className="px-3 py-2 rounded-xl bg-red-50 text-red-600"
                    onClick={() => deleteCourse(selectedCourse.id)}
                  >
                    <Trash2 size={14} /> Delete Course
                  </button>
                </div>
              </div>

              {/* Drag & Drop for Chapters + Lessons */}
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="chapters" type="chapter">
                  {(provided: DroppableProvided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-6">
                      {selectedCourse.chapters.map((ch, chIndex) => (
                        <Draggable key={ch.id} draggableId={ch.id} index={chIndex}>
                          {(drProvided: DraggableProvided) => (
                            <div
                              ref={drProvided.innerRef}
                              {...drProvided.draggableProps}
                              className="bg-white rounded-2xl shadow p-5 border border-slate-200"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                  <div {...drProvided.dragHandleProps} className="p-2 bg-slate-100 rounded-full cursor-grab">
                                    ☰
                                  </div>
                                  <div>
                                    <h3 className="font-semibold text-lg">{ch.title}</h3>
                                    <p className="text-xs text-slate-400">{ch.lessons.length} lessons</p>
                                  </div>
                                </div>

                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setShowNewLessonForm(ch.id)}
                                    className="bg-indigo-100 text-indigo-700 p-2 rounded-full"
                                  >
                                    <Plus size={14} />
                                  </button>
                                  <button
                                    onClick={() => deleteChapter(ch.id)}
                                    className="bg-red-100 text-red-700 p-2 rounded-full"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>

                              {/* Lessons droppable for this chapter */}
                              <Droppable droppableId={`lessons:${ch.id}`} type="lesson">
                                {(lessonsProvided) => (
                                  <div ref={lessonsProvided.innerRef} {...lessonsProvided.droppableProps} className="mt-4 space-y-3">
                                   {ch.lessons.map((lesson, li) => (
                                      <Draggable key={lesson.id} draggableId={lesson.id} index={li}>
                                        {(lProvided: DraggableProvided) => (
                                          <div
                                            ref={lProvided.innerRef}
                                            {...lProvided.draggableProps}
                                            {...lProvided.dragHandleProps}
                                            className="flex flex-col gap-3 bg-slate-50 rounded-lg p-3 border"
                                          >
                                            {/* Edit Mode */}
                                            {editingLessonId === lesson.id ? (
                                              <div className="space-y-2 w-full">
                                                <input
                                                  className="w-full rounded border px-2 py-1"
                                                  value={editingLessonData.title}
                                                  onChange={(e) =>
                                                    setEditingLessonData((prev) => ({
                                                      ...prev,
                                                      title: e.target.value,
                                                    }))
                                                  }
                                                  placeholder="Lesson title"
                                                />

                                                <textarea
                                                  className="w-full rounded border px-2 py-1"
                                                  value={editingLessonData.content}
                                                  onChange={(e) =>
                                                    setEditingLessonData((prev) => ({
                                                      ...prev,
                                                      content: e.target.value,
                                                    }))
                                                  }
                                                  placeholder="Lesson content"
                                                />

                                                <input
                                                  type="file"
                                                  accept="video/*"
                                                  onChange={(e) =>
                                                    setEditingLessonData((prev) => ({
                                                      ...prev,
                                                      video_file: e.target.files?.[0] ?? null,
                                                    }))
                                                  }
                                                />

                                                {/* Preview video if exists */}
                                                {lesson?.video_url && (
                                                  <video controls className="w-full h-32 rounded bg-black">
                                                    <source src={lesson.video_url} />
                                                  </video>
                                                )}

                                                <div className="flex gap-2">
                                                  <button
                                                    onClick={() => {
                                                      editLesson(ch.id, lesson.id, editingLessonData);
                                                    }}
                                                    className="bg-green-600 text-white px-3 py-1 rounded-lg flex items-center gap-1"
                                                  >
                                                    <Save size={14} /> Save
                                                  </button>

                                                  <button
                                                    onClick={() => setEditingLessonId(null)}
                                                    className="bg-slate-200 text-slate-700 px-3 py-1 rounded-lg"
                                                  >
                                                    Cancel
                                                  </button>
                                                </div>
                                              </div>
                                            ) : (
                                              /* View Mode */
                                              <div className="flex justify-between items-start w-full">
                                                <div className="flex-1 space-y-1">
                                                  <h4 className="font-medium text-slate-800">{lesson.title}</h4>
                                                  <p className="text-sm text-slate-600 line-clamp-2">
                                                    {lesson.content}
                                                  </p>
                                                </div>

                                                <div className="flex gap-2">
                                                  <button
                                                    className="text-indigo-600"
                                                    onClick={() => {
                                                      setEditingLessonId(lesson.id);
                                                      setEditingLessonData({
                                                        title: lesson.title,
                                                        content: lesson.content,
                                                        video_file: null,
                                                      });
                                                    }}
                                                  >
                                                    <Edit2 size={16} />
                                                  </button>
                                                  <button
                                                    className="text-red-500"
                                                    onClick={() => deleteLesson(ch.id, lesson.id)}
                                                  >
                                                    <Trash2 size={16} />
                                                  </button>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </Draggable>
                                    ))}


                                    {lessonsProvided.placeholder}
                                  </div>
                                )}
                              </Droppable>

                              {/* New lesson form inline */}
                              {showNewLessonForm === ch.id && (
                                <div className="mt-4 bg-slate-50 p-3 rounded-lg border">
                                  <input
                                    className="w-full rounded-lg border px-3 py-2 mb-2"
                                    placeholder="Lesson title"
                                    value={newLesson.title}
                                    onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                                  />
                                  <textarea
                                    className="w-full rounded-lg border px-3 py-2 mb-2"
                                    placeholder="Lesson content"
                                    value={newLesson.content}
                                    onChange={(e) => setNewLesson({ ...newLesson, content: e.target.value })}
                                  />
                                  <input
                                    type="file"
                                    accept="video/*"
                                    onChange={(e) => setNewLesson({ ...newLesson, video_file: e.target.files?.[0] ?? null })}
                                  />
                                  <div className="flex gap-2 mt-3">
                                    <button onClick={() => createLesson(ch.id)} className="bg-indigo-600 text-white px-3 py-2 rounded-xl">
                                      Add Lesson
                                    </button>
                                    <button onClick={() => { setShowNewLessonForm(null); setNewLesson({ title: "", content: "", video_file: null }); }} className="px-3 py-2 rounded-xl bg-slate-200">
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}

                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>

              {/* Add chapter CTA */}
              <div className="mt-6">
                {!showNewChapterForm ? (
                  <button onClick={() => setShowNewChapterForm(true)} className="bg-purple-600 text-white px-4 py-2 rounded-xl">
                    <Plus size={14} /> Add Chapter
                  </button>
                ) : (
                  <div className="mt-3 flex gap-2">
                    <input className="flex-1 rounded-lg border px-3 py-2" placeholder="Chapter title" value={newChapter.title} onChange={(e) => setNewChapter({ title: e.target.value })} />
                    <button onClick={createChapter} className="bg-indigo-600 text-white px-4 py-2 rounded-xl">Create</button>
                    <button onClick={() => { setShowNewChapterForm(false); setNewChapter({ title: "" }); }} className="px-4 py-2 rounded-xl bg-slate-200">Cancel</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Student preview */}
          {selectedCourse && previewMode && (
            <div className="mt-6 bg-white p-6 rounded-2xl shadow">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-4">
                    <button className="rounded-full p-2 bg-slate-100" onClick={() => setPreviewMode(false)}>
                      <ArrowLeft size={16} />
                    </button>
                    <h2 className="text-2xl font-bold">{selectedCourse.title} (Student View)</h2>
                  </div>
                  <p className="text-sm text-slate-500 mt-2">{selectedCourse.description}</p>
                </div>

                <div>
                  <div className={`text-sm px-3 py-1 rounded-full ${selectedCourse.published ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {selectedCourse.published ? "Published" : "Draft"}
                  </div>
                </div>
              </div>

              <div className="mt-6 grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  {selectedCourse.chapters.map((ch) => (
                    <div key={ch.id} className="mb-6">
                      <h3 className="font-semibold text-lg mb-2">{ch.title}</h3>
                      <div className="space-y-3">
                        {ch.lessons.map((l) => (
                          <div key={l.id} className="p-4 rounded-lg border bg-slate-50">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium">{l.title}</div>
                                <div className="text-sm text-slate-500 mt-1">{l.content}</div>
                                {l.video_url && <video src={l.video_url} controls className="mt-3 w-full rounded" />}
                              </div>
                              <div className="text-xs text-slate-400">Preview</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <aside className="bg-white rounded-xl p-4 shadow">
                  <h4 className="font-bold text-sm mb-2">Course Info</h4>
                  <div className="text-sm text-slate-600">Chapters: {selectedCourse.chapters.length}</div>
                  <div className="text-sm text-slate-600">Lessons: {selectedCourse.chapters.reduce((acc, ch) => acc + ch.lessons.length, 0)}</div>
                  {selectedCourse.thumbnail_url && <img src={selectedCourse.thumbnail_url} alt="thumb" className="w-full mt-4 rounded-md object-cover" />}
                </aside>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
