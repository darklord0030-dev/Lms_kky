import React, { useEffect, useState } from "react";

type Course = {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  published?: boolean;
  chapters: { lessons: { id: string }[] }[];
};

type EnrollmentMap = Record<string, string[]>;

const LS_PREFIX = "lms_local_v2";
const lsKey = (k: string) => `${LS_PREFIX}::${k}`;
const readFromLS = <T,>(key: string, fallback: T): T => {
  try {
    const r = localStorage.getItem(lsKey(key));
    return r ? (JSON.parse(r) as T) : fallback;
  } catch {
    return fallback;
  }
};

export default function CourseCard({ userId }: { userId?: string }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolled, setEnrolled] = useState<string[]>([]);
  const [finalUserId, setFinalUserId] = useState("");

  const [progressMap, setProgressMap] = useState<Record<string, any>>({});
  const [xpMap, setXpMap] = useState<Record<string, number>>({});
  const [badgesMap, setBadgesMap] = useState<Record<string, string[]>>({});

  // Auto-detect user if not passed
  useEffect(() => {
    if (!userId) {
      const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
      if (user.id) setFinalUserId(user.id);
    } else {
      setFinalUserId(userId);
    }
  }, [userId]);

  useEffect(() => {
    if (!finalUserId) return;

    setCourses(readFromLS("courses", []));
    const enrollments: EnrollmentMap = readFromLS("enrollments", {});
    setEnrolled(enrollments[finalUserId] || []);

    setProgressMap(readFromLS("progress", {}));
    setXpMap(readFromLS("xp", {}));
    setBadgesMap(readFromLS("badges", {}));
  }, [finalUserId]);

  const enrolledCourses = courses.filter((c) => enrolled.includes(c.id));

  const getCourseProgress = (course: Course) => {
    const lessonIds = course.chapters.flatMap((ch) => ch.lessons.map((l) => l.id));
    const total = lessonIds.length;
    const completed = lessonIds.filter((id) => progressMap[id]?.completed).length;
    const percent = Math.round((completed / Math.max(1, total)) * 100);
    return { completed, total, percent };
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-black">My Courses</h1>

      {!finalUserId ? (
        <div className="text-red-500 text-lg">No learner logged in.</div>
      ) : enrolledCourses.length === 0 ? (
        <div className="text-gray-500 text-lg">No enrolled courses yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {enrolledCourses.map((course) => {
            const { completed, total, percent } = getCourseProgress(course);
            const xp = xpMap[course.id] || 0;
            const badges = badgesMap[course.id] || [];
            const completedBadge =
              badges.find((b) => b.includes("Course Completed")) || null;

            return (
              <div
                key={course.id}
                className="bg-white border border-gray-300 rounded-xl overflow-hidden shadow hover:shadow-lg transition"
              >
                {/* Thumbnail */}
                <div className="h-40 bg-gray-200 overflow-hidden relative">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Thumbnail
                    </div>
                  )}

                  {completedBadge && (
                    <div className="absolute top-2 right-2 bg-yellow-400 px-3 py-1 rounded-full text-xs font-bold">
                      ⭐ Certificate Earned
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-xl font-bold text-black">{course.title}</h3>

                  <p className="text-sm mt-1 text-gray-600 line-clamp-2">
                    {course.description}
                  </p>

                  {/* XP */}
                  <div className="text-xs text-green-600 font-semibold mt-2">
                    XP: {xp}
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 h-2 rounded-full">
                      <div
                        className="h-2 rounded-full bg-emerald-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="text-xs text-gray-500 mt-1">
                      {percent}% complete • {completed}/{total} lessons
                    </div>
                  </div>

                  <button className="mt-4 w-full py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                    {percent === 100 ? "View Certificate" : "Continue Course"}
                  </button>
                </div>
              </div>
            );
          })}

        </div>
      )}
    </div>
  );
}
