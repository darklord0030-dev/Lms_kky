import React, { useEffect, useState } from "react";
import {
  Edit2,
  Upload,
  List,
  FileText,
  Grid,
  X,
  Plus,
  Trash2,
  GripVertical
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*                                TYPE DEFINITIONS                            */
/* -------------------------------------------------------------------------- */

interface Course {
  id: number;
  title: string;
  description: string;
  image_url?: string | null;
  status?: string;
}

interface Chapter {
  id: number;
  title: string;
  status?: string;
}

interface Attachment {
  id: numb
  name: string;
  size?: number;
  url?: string;
}

/* -------------------------------------------------------------------------- */
/*                            Course Setup Component                           */
/* -------------------------------------------------------------------------- */

function CourseSetup({
  course,
  chapters,
  attachments,
  onUpdateCourse,
  onAddChapter,
  onAddAttachment,
  onPublish,
  onEditChapter,
  onDeleteChapter,
  isPublished,
  handleDragStart,
  handleDragOver,
  handleDrop,
  draggedId,
  getStatusColor,
}: {
  course: Course;
  chapters: Chapter[];
  attachments: Attachment[];
  onUpdateCourse: (u: Partial<Course>) => void;
  onAddChapter: () => void;
  onAddAttachment: (f: File) => void;
  onPublish: () => void;
  onEditChapter: (c: Chapter) => void;
  onDeleteChapter: (c: Chapter) => void;
  isPublished: boolean;
  handleDragStart: (id: number) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (id: number) => void;
  draggedId: number | null;
  getStatusColor: (s?: string) => string;
}) {
  const [courseTitle, setCourseTitle] = useState(course.title || "");
  const [courseDescription, setCourseDescription] = useState(course.description || "");
  const [courseImage, setCourseImage] = useState<string | null>(course.image_url || null);
  const [localAttachments, setLocalAttachments] = useState<Attachment[]>(attachments || []);

  useEffect(() => setCourseTitle(course.title || ""), [course.title]);
  useEffect(() => setCourseDescription(course.description || ""), [course.description]);
  useEffect(() => setCourseImage(course.image_url || null), [course.image_url]);
  useEffect(() => setLocalAttachments(attachments || []), [attachments]);

  const completedFields = [courseTitle, courseDescription, courseImage, chapters.length > 0].filter(Boolean).length;

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onloadend = () => onUpdateCourse({ image_url: reader.result as string });
    reader.readAsDataURL(f);
  };

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((f) => onAddAttachment(f));
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

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
        {/* Left */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-6">
              <Grid className="text-blue-600" size={24} />
              <h2 className="text-xl font-semibold text-gray-900">Customize your course</h2>
            </div>

            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <label className="font-medium text-gray-900">Course title</label>
                  <button onClick={() => setCourseTitle(course.title || "")} className="text-gray-600 hover:text-blue-600">
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
                      <button onClick={() => onUpdateCourse({ image_url: "" })} className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full">
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center cursor-pointer">
                      <Upload className="text-gray-400 mb-2" size={40} />
                      <span className="text-blue-600 font-medium">Add image</span>
                      <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <List className="text-blue-600" size={24} />
                <h2 className="text-xl font-semibold text-gray-900">Course Chapters</h2>
              </div>
              <button onClick={onAddChapter} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
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
                {chapters.map((ch) => (
                  <div
                    key={ch.id}
                    draggable
                    onDragStart={() => handleDragStart(ch.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(ch.id)}
                    className={`flex items-center gap-3 p-4 rounded-lg border ${
                      draggedId === ch.id ? "border-blue-300 bg-blue-50 shadow-sm" : "border-gray-200 bg-gray-50"
                    } hover:border-blue-300 cursor-move`}
                  >
                    <GripVertical className="text-gray-400" size={20} />
                    <span className="flex-1 font-medium text-gray-900">{ch.title}</span>
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(ch.status)}`}>{ch.status || "draft"}</span>

                    <button onClick={() => onEditChapter(ch)} className="text-gray-600 hover:text-blue-600 ml-2">
                      <Edit2 size={16} />
                    </button>

                    <button onClick={() => onDeleteChapter(ch)} className="text-gray-600 hover:text-blue-600 ml-2">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
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
                  <input type="file" multiple onChange={handleFiles} className="hidden" />
                </label>
              </div>

              {attachments.length === 0 ? (
                <p className="text-gray-500 italic text-center py-6">No attachments yet</p>
              ) : (
                <div className="space-y-2">
                  {attachments.map((a) => (
                    <div key={a.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <FileText className="text-blue-600" size={20} />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">{a.name}</p>
                        <p className="text-gray-500 text-xs">{formatFileSize(a.size)}</p>
                      </div>
                      <button className="text-gray-400 hover:text-red-500">
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

export default CourseSetup;
