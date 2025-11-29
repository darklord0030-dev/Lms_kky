/* -------------------------------------------------------------------------- */
/*                        Published Course Card (Student View)                */
/* -------------------------------------------------------------------------- */

import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

function PublishedCourseCard({ course, chapters }: { course: Course; chapters: Chapter[] }) {
  const navigate = useNavigate();

  const completedChapters = chapters.filter((c) => c.video_url).length;
  const totalChapters = chapters.length;
  const progress = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

  const goToCourse = () => {
    navigate(`/student/course/${course.id}`);
  };

  const downloadCertificate = () => {
    alert("🎉 Certificate will be generated here!");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-md w-full border border-gray-200">
        
        {/* Course Image */}
        {course.image_url ? (
          <img
            src={course.image_url}
            alt={course.title}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
            No Image
          </div>
        )}

        <div className="p-6">
          
          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {course.title || "Untitled Course"}
          </h2>

          {/* Description */}
          <p className="text-gray-600 mb-4">
            {course.description || "No description provided."}
          </p>

          {/* Chapter + Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-700 mb-1">
              <span>
                Chapters: <strong>{completedChapters}</strong>/<strong>{totalChapters}</strong>
              </span>
              <span>{progress}%</span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-3">

            {/* Resume / View Course */}
            <button
              onClick={goToCourse}
              className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
            >
              {progress === 0 ? "Start Course" : progress < 100 ? "Resume Course" : "View Course"}
            </button>

            {/* Certificate */}
            {progress === 100 && (
              <button
                onClick={downloadCertificate}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 transition"
              >
                <CheckCircle size={18} />
                Download Certificate
              </button>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default PublishedCourseCard;
