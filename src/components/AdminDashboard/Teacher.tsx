// src/pages/TeacherView.tsx
import React, { useEffect, useState } from "react";
import {
  Plus,
  Users,
  Edit,
  Save,
  X,
  Moon,
  SunMedium,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";

// --- Types ---
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
  lessons?: Lesson[];
};

type Course = {
  id: string;
  title: string;
  published: boolean;
  thumbnail_url?: string | null;
  chapters?: Chapter[];
  students?: { name: string }[];
};

// --- Component ---
export default function TeacherView() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  const [activePreviewCourse, setActivePreviewCourse] = useState<Course | null>(null);
  const [studentView, setStudentView] = useState(false);

  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [studentEmail, setStudentEmail] = useState("");

  useEffect(() => {
    setCourses([
      {
        id: "1",
        title: "React Crash Course",
        published: true,
        chapters: [
          {
            id: "c1",
            course_id: "1",
            title: "Introduction",
            lessons: [
              {
                id: "l1",
                chapter_id: "c1",
                title: "What is React?",
                content: "React is a JavaScript library...",
              },
              {
                id: "l2",
                chapter_id: "c1",
                title: "JSX Explained",
                content: "JSX lets you write HTML in JS...",
              },
            ],
          },
        ],
        students: [{ name: "A" }, { name: "B" }],
      },
    ]);
  }, []);

  const sortedCourses = [...courses].sort((a, b) =>
    Number(b.published) - Number(a.published)
  );

  const saveLessonChanges = () => {
    if (!selectedCourse || !editingLesson) return;

    const updated = courses.map((course) => {
      if (course.id !== selectedCourse.id) return course;
      return {
        ...course,
        chapters: course.chapters?.map((ch) => ({
          ...ch,
          lessons: ch.lessons?.map((ls) =>
            ls.id === editingLesson.id ? editingLesson : ls
          ),
        })),
      };
    });

    setCourses(updated);
    setEditingLesson(null);
    toast.success("Lesson updated ✨");
  };

  const togglePublishCourse = (courseId: string) => {
    setCourses((prev) =>
      prev.map((course) =>
        course.id === courseId
          ? { ...course, published: !course.published }
          : course
      )
    );
    toast.success("Publish status updated 🎉");
  };

  const onDragEnd = (_: DropResult) => {
    toast.success("Order updated 📌");
  };

  return (
    <div className={`${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"} min-h-screen`}>
      <Toaster />

      {/* Navbar */}
      <div className="flex justify-between items-center p-4 shadow bg-white dark:bg-gray-800">
        <h1 className="text-xl font-bold">Teacher Dashboard</h1>
        <button
          onClick={() => setDarkMode((prev) => !prev)}
          className="rounded-full p-2 hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          {darkMode ? <SunMedium /> : <Moon />}
        </button>
      </div>

      {/* Course Grid */}
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {sortedCourses.map((course) => (
          <div
            key={course.id}
            onClick={() => setSelectedCourse(course)}
            className="relative bg-white dark:bg-gray-800 rounded-xl p-4 shadow hover:shadow-lg transition cursor-pointer"
          >
            {/* Publish Status */}
            <div className="absolute top-2 right-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePublishCourse(course.id);
                }}
                className={`text-xs px-2 py-1 rounded-full shadow transition ${
                  course.published
                    ? "bg-green-200 text-green-800 scale-105"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {course.published ? "Published" : "Draft"}
              </button>
            </div>

            <h2 className="font-semibold text-lg">{course.title}</h2>

            {/* Student avatars */}
            <div className="flex mt-3 -space-x-2">
              {course.students?.map((s, i) => (
                <div
                  key={i}
                  className="w-7 h-7 bg-blue-500 rounded-full text-white flex items-center justify-center border-2 border-white text-xs"
                >
                  {s.name[0]}
                </div>
              ))}
            </div>

            {/* Preview */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActivePreviewCourse(course);
                setStudentView(true);
              }}
              className="text-xs mt-3 px-3 py-1 rounded border hover:bg-gray-200"
            >
              Preview Student
            </button>
          </div>
        ))}
      </div>

      {/* Sidebar — Lessons & Editing */}
      {selectedCourse && (
        <div className="fixed top-0 right-0 bg-white dark:bg-gray-800 w-96 h-full shadow-lg p-4 overflow-y-auto">
          <div className="flex justify-between">
            <h2 className="font-bold text-lg">{selectedCourse.title}</h2>
            <button onClick={() => setSelectedCourse(null)}>
              <X />
            </button>
          </div>

          <DragDropContext onDragEnd={onDragEnd}>
            {selectedCourse.chapters?.map((chapter) => (
              <Droppable droppableId={chapter.id} key={chapter.id}>
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    <h3 className="font-semibold mt-4">{chapter.title}</h3>
                    {chapter.lessons?.map((lesson, index) => (
                      <Draggable draggableId={lesson.id} index={index} key={lesson.id}>
                        {(draggable) => (
                          <div
                            ref={draggable.innerRef}
                            {...draggable.draggableProps}
                            className="bg-gray-200 dark:bg-gray-700 p-3 mt-2 rounded flex justify-between"
                          >
                            <span {...draggable.dragHandleProps} className="cursor-grab">
                              ::
                            </span>

                            <span onClick={() => setEditingLesson(lesson)}>
                              {lesson.title}
                            </span>

                            <Edit onClick={() => setEditingLesson(lesson)} className="cursor-pointer ml-2" />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </DragDropContext>

          {/* LESSON EDIT UI */}
          {editingLesson && (
            <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 p-5 border-t shadow-xl">
              <h3 className="font-semibold mb-2">Edit Lesson</h3>
              <input
                className="w-full p-2 border mb-2"
                value={editingLesson.title}
                onChange={(e) =>
                  setEditingLesson({ ...editingLesson, title: e.target.value })
                }
              />
              <textarea
                rows={3}
                className="w-full p-2 border mb-2"
                value={editingLesson.content}
                onChange={(e) =>
                  setEditingLesson({ ...editingLesson, content: e.target.value })
                }
              />

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setEditingLesson(null)}
                  className="px-3 bg-gray-400 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={saveLessonChanges}
                  className="px-3 bg-blue-600 text-white rounded flex gap-1 items-center"
                >
                  <Save size={16} /> Save
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Student Preview Modal */}
      {studentView && activePreviewCourse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-4xl shadow-2xl overflow-y-auto max-h-[85vh]">
            <div className="flex justify-between mb-4">
              <h2 className="font-semibold text-xl">{activePreviewCourse.title}</h2>
              <button
                onClick={() => setStudentView(false)}
                className="px-4 py-1 bg-gray-300 rounded hover:bg-gray-400"
              >
                Close
              </button>
            </div>

            {activePreviewCourse.chapters?.map((ch) => (
              <div key={ch.id} className="border rounded p-3 mb-3">
                <h3 className="font-semibold">{ch.title}</h3>
                {ch.lessons?.map((ls) => (
                  <div key={ls.id} className="mt-2">
                    <p className="font-medium">{ls.title}</p>
                    <p className="text-sm opacity-75">{ls.content}</p>

                    <div className="mt-2 h-1 bg-gray-200 rounded">
                      <div className="h-1 bg-blue-500 rounded w-[40%]" />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enroll Modal */}
      {enrollModalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white p-5 rounded-xl w-80 shadow-xl">
            <h3 className="font-bold text-lg mb-3">Enroll Student</h3>
            <input
              type="email"
              className="w-full px-3 py-2 border rounded mb-4"
              placeholder="Student email"
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEnrollModalOpen(false)}
                className="px-3 py-1 bg-gray-200 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  toast.success("Student enrolled 🎓");
                  setStudentEmail("");
                  setEnrollModalOpen(false);
                }}
                className="px-3 py-1 bg-blue-600 text-white rounded"
              >
                Enroll
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
