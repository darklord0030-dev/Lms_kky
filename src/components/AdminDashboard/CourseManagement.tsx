import { useState, useEffect } from "react";
import CourseManager from "./CourseManager";

// Dummy Components (✅ replace these with your real ones)
const CourseNameDialog = ({ onContinue, onCancel }: any) => (
  <div>
    <h2>Enter Course Name</h2>
    <button onClick={() => onContinue("New Course")}>Continue</button>
    <button onClick={onCancel}>Cancel</button>
  </div>
);

const ChapterCreation = ({ chapter, onUpdateChapter, onSave, onPublish }: any) => (
  <div>
    <h2>Edit Chapter: {chapter.title}</h2>
    <button onClick={onSave}>Save</button>
    <button onClick={onPublish}>Publish</button>
  </div>
);

const CourseSetup = ({
  course,
  chapters,
  attachments,
  onUpdateCourse,
  onAddChapter,
  onAddAttachment,
  onPublish,
}: any) => (
  <div>
    <h2>Setup Course: {course.title}</h2>
    <button onClick={onAddChapter}>Add Chapter</button>
    <button onClick={onPublish}>Publish</button>
  </div>
);

/* -------------------------------------------------------------------------- */
/*                                  TYPES                                     */
/* -------------------------------------------------------------------------- */

interface Course {
  id: number;
  title: string;
  description?: string;
  image_url?: string;
}

interface Chapter {
  id: number;
  course_id: number;
  title: string;
  order: number;
}

interface Attachment {
  id: number;
  course_id: number;
  file_name: string;
  file_url: string;
}

type View = "name" | "setup" | "chapter";

/* -------------------------------------------------------------------------- */
/*                            MAIN COMPONENT                                  */
/* -------------------------------------------------------------------------- */

function CourseManagement() { // ✅ fixed name
  const [view, setView] = useState<View>("name");
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);

  useEffect(() => {
    if (currentCourse) {
      loadChapters();
      loadAttachments();
    }
  }, [currentCourse]);

  /* --------------------------- MOCK DATA HANDLERS --------------------------- */

  const loadChapters = async () => {
    if (!currentCourse) return;
    // mock chapters
    setChapters([
      { id: 1, course_id: currentCourse.id, title: "Intro", order: 0 },
      { id: 2, course_id: currentCourse.id, title: "Basics", order: 1 },
    ]);
  };

  const loadAttachments = async () => {
    if (!currentCourse) return;
    // mock attachments
    setAttachments([
      {
        id: 1,
        course_id: currentCourse.id,
        file_name: "sample.pdf",
        file_url: "https://example.com/sample.pdf",
      },
    ]);
  };

  const handleCreateCourse = async (title: string) => {
    const newCourse: Course = {
      id: Date.now(),
      title,
    };
    setCurrentCourse(newCourse);
    setView("setup");
  };

  const handleUpdateCourse = async (updates: Partial<Course>) => {
    if (!currentCourse) return;
    setCurrentCourse({ ...currentCourse, ...updates });
  };

  const handleAddChapter = async () => {
    if (!currentCourse) return;
    const newChapter: Chapter = {
      id: Date.now(),
      course_id: currentCourse.id,
      title: "New Chapter",
      order: chapters.length,
    };
    setChapters([...chapters, newChapter]);
    setCurrentChapter(newChapter);
    setView("chapter");
  };

  const handleUpdateChapter = async (updates: Partial<Chapter>) => {
    if (!currentChapter) return;
    setCurrentChapter({ ...currentChapter, ...updates });
    setChapters((prev) =>
      prev.map((c) => (c.id === currentChapter.id ? { ...c, ...updates } : c))
    );
  };

  const handleAddAttachment = async (file: File) => {
    if (!currentCourse) return;

    const newAttachment: Attachment = {
      id: Date.now(),
      course_id: currentCourse.id,
      file_name: file.name,
      file_url: URL.createObjectURL(file),
    };
    setAttachments((prev) => [...prev, newAttachment]);
  };

  const handlePublish = () => {
    alert("Course published successfully!");
  };

  const handleChapterSave = () => {
    setView("setup");
  };

  /* ------------------------------- RENDER VIEW ------------------------------ */

  if (view === "name") {
    return (
      <CourseNameDialog onContinue={handleCreateCourse} onCancel={() => {}} />
    );
  }

  if (view === "chapter" && currentChapter) {
    return (
      <ChapterCreation
        chapter={currentChapter}
        onUpdateChapter={handleUpdateChapter}
        onSave={handleChapterSave}
        onPublish={handlePublish}
      />
    );
  }

  if (view === "setup" && currentCourse) {
    return (
      <CourseSetup
        course={currentCourse}
        chapters={chapters}
        attachments={attachments}
        onUpdateCourse={handleUpdateCourse}
        onAddChapter={handleAddChapter}
        onAddAttachment={handleAddAttachment}
        onPublish={handlePublish}
      />
    );
  }

  return null;
}

export default CourseManagement;
