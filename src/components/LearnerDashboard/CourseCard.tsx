import { Play } from 'lucide-react';

// Local Course type since Supabase is removed
export type Course = {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  progress: number;
};

type CourseCardProps = {
  course: Course;
  onStart: (courseId: string) => void;
};

export default function CourseCard({ course, onStart }: CourseCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-40 overflow-hidden">
        <img
          src={course.image_url}
          alt={course.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <div className="text-xs text-gray-500 uppercase mb-1">Course</div>
        <h3 className="font-semibold text-gray-900 mb-2">{course.title}</h3>

        {course.description && (
          <p className="text-sm text-gray-600 mb-3">{course.description}</p>
        )}

        {course.progress > 0 ? (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-600 rounded-full"
                  style={{ width: `${course.progress}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-gray-700">
                {course.progress}%
              </span>
            </div>
          </div>
        ) : (
          <button
            onClick={() => onStart(course.id)}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Play size={16} />
            <span>Start</span>
          </button>
        )}
      </div>
    </div>
  );
}
