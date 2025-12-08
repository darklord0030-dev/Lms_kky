import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Course } from "../lib/supabase"; // keeping the type only
import CourseCard from "./StudentCourseViewer";

export default function HomePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  // ---------------------- MOCK API (REPLACES SUPABASE) ----------------------
  const fetchCourses = async () => {
    try {
      await new Promise((res) => setTimeout(res, 300)); // simulate delay

      const mockCourses: Course[] = [
        {
          id: "1",
          title: "JavaScript for Beginners",
          description: "Learn fundamentals of modern JavaScript.",
          image_url: "",
          status: "pending",
          progress: 0,
          created_at: new Date().toISOString(),
        },
        {
          id: "2",
          title: "React Mastery",
          description: "Hooks, components, context and more.",
          image_url: "",
          status: "in_progress",
          progress: 40,
          created_at: new Date().toISOString(),
        },
        {
          id: "3",
          title: "Backend with Node.js",
          description: "Build API, authentication & databases.",
          image_url: "",
          status: "pending",
          progress: 0,
          created_at: new Date().toISOString(),
        },
      ];

      setCourses(mockCourses);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartCourse = async (courseId: string) => {
    setCourses((prev) =>
      prev.map((course) =>
        course.id === courseId
          ? { ...course, status: "in_progress", progress: 1 }
          : course
      )
    );
  };

  // -------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading courses...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-4">Welcome, Aaron!</h1>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <span>View</span>
            <ChevronDown size={16} />
          </button>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-gray-600">Sort by</span>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <span>Date</span>
              <ChevronDown size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} onStart={handleStartCourse} />
        ))}
      </div>
    </div>
  );
}
