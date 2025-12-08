import React, { useEffect, useState } from "react";
import {
  Play,
  ChevronRight,
  Trophy,
  Clock,
  Maximize2,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

interface LearnerInfo {
  firstname?: string;
  lastname?: string;
  email?: string;
  usertype?: string;
}

interface EnrolledCourse {
  courseId: string;
  title: string;
  thumbnail: string;
  duration: string;
  progress: number;
}

export default function StudentDashboard() {
  const [learner, setLearner] = useState<LearnerInfo | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);

  // Stats
  const [achievementCompleted, setAchievementCompleted] = useState(0);
  const [achievementTotal, setAchievementTotal] = useState(0);
  const [learningMinutes, setLearningMinutes] = useState(0);
  const [pendingTasks, setPendingTasks] = useState(0);

  useEffect(() => {
    const loadLearner = async () => {
      try {
        const storedToken = localStorage.getItem("token");
        if (!storedToken) return toast.error("No token found");

        const parsed = JSON.parse(storedToken);
        const learnerId = parsed?.data?.userId || parsed?.userId;

        if (!learnerId) return toast.error("Invalid token");

        const res = await axios.get(`http://localhost:3000/api/user/${learnerId}`);
        const data = res.data;

        setLearner({
          firstname: data.firstname,
          lastname: data.lastname,
          email: data.email,
          usertype: data.usertype,
        });

        // Load Stats
        loadStats(learnerId);

        // Load Courses
        loadEnrolledCourses(learnerId);

      } catch (err) {
        toast.error("Failed to load learner details");
      }
    };

    loadLearner();
  }, []);

  /* ----------------------
        LOAD STATS
  -----------------------*/
  const loadStats = async (learnerId: string) => {
    try {
      // Achievements
      const a = await axios.get(
        `http://localhost:3000/api/learner/${learnerId}/achievements`
      );
      setAchievementCompleted(a.data.completed);
      setAchievementTotal(a.data.total);

      // Learning Time
      const lt = await axios.get(
        `http://localhost:3000/api/learner/${learnerId}/learning`
      );
      setLearningMinutes(lt.data.minutes);

      // Pending Tasks
      const pt = await axios.get(
        `http://localhost:3000/api/learner/${learnerId}/pending`
      );
      setPendingTasks(pt.data.count);

    } catch (err) {
      console.error(err);
    
    }
  };

  /* ----------------------
     LOAD ENROLLED COURSES
  ------------------------*/
  const loadEnrolledCourses = async (learnerId: string) => {
    try {
      const res = await axios.get(
        `http://localhost:3000/api/user/${learnerId}/enrolled-courses`
      );
      setEnrolledCourses(res.data || []);
    } catch (err) {
      console.error(err);
    
    }
  };

  /* ----------------------
     UPDATE PROGRESS
  ------------------------*/
  const handleStartOrResume = async (course: EnrolledCourse) => {
    try {
      const storedToken = localStorage.getItem("token");
      if (!storedToken) return;

      const parsed = JSON.parse(storedToken);
      const learnerId = parsed?.data?.userId || parsed?.userId;

      await axios.patch(`http://localhost:3000/api/learner/progress`, {
        userId: learnerId,
        courseId: course.courseId,
        progress: course.progress || 1,
      });

      toast.success("Progress updated");

      loadEnrolledCourses(learnerId);

    } catch (err) {
      console.error(err);
      toast.error("Failed to update progress");
    }
  };

  const fullname = learner
    ? `${learner.firstname || ""} ${learner.lastname || ""}`.trim()
    : "Learner";

  return (
    <div className="space-y-8">

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          🎉 Welcome back, {fullname} 👋
        </h2>
        <p className="text-gray-700">Let's Get Started! 🔥</p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-4 gap-6">

        {/* Achievements */}
        <div className="bg-white rounded-xl p-6 border">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-600">Achievements</p>
              <p className="text-3xl font-bold text-gray-900">
                {achievementCompleted}
                <span className="text-gray-400">/{achievementTotal}</span>
              </p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <Trophy size={22} className="text-green-600" />
            </div>
          </div>
          <div className="mt-3 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500"
              style={{
                width:
                  achievementTotal > 0
                    ? `${(achievementCompleted / achievementTotal) * 100}%`
                    : "0%",
              }}
            ></div>
          </div>
        </div>

        {/* Learning Time */}
        <div className="bg-white rounded-xl p-6 border">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-600">Learning Time</p>
              <p className="text-3xl font-bold text-gray-900">{learningMinutes}</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Clock size={22} className="text-blue-600" />
            </div>
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="bg-white rounded-xl p-6 border">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Tasks</p>
              <p className="text-3xl font-bold text-gray-900">{pendingTasks}</p>
            </div>
            <div className="p-2 bg-orange-50 rounded-lg">
              <Maximize2 size={22} className="text-orange-600" />
            </div>
          </div>
        </div>

        {/* Points Card (remains static unless you want dynamic API) */}
        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-xl p-6">
          <p className="text-sm font-semibold"> Points</p>
          <p className="text-xs mb-4 opacity-90">
            Complete a course & get 400 pts
          </p>
          <div className="bg-white/30 rounded-full h-1.5 overflow-hidden">
            <div className="h-full bg-white" style={{ width: "0%" }}></div>
          </div>
        </div>
      </div>

      {/* Continue Learning */}
      <div>
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Continue Learning</h2>
          <ChevronRight className="text-gray-500" />
        </div>

        {enrolledCourses.length === 0 ? (
          <p className="text-gray-600">No courses started yet.</p>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {enrolledCourses.map((course) => (
              <div
                key={course.courseId}
                className="bg-white rounded-xl border hover:shadow-lg overflow-hidden group"
              >
                <div className="relative">
                  <img
                    src={course.thumbnail}
                    className="w-full h-44 object-cover"
                  />

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex justify-center items-center transition">
                    <div
                      className="w-12 h-12 bg-white rounded-full flex items-center justify-center cursor-pointer"
                      onClick={() => handleStartOrResume(course)}
                    >
                      <Play size={22} />
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <p className="font-semibold line-clamp-2">{course.title}</p>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">
                      {course.progress}% complete
                    </span>
                    <button
                      onClick={() => handleStartOrResume(course)}
                      className="text-xs px-3 py-1 bg-blue-600 text-white rounded-md"
                    >
                      Resume
                    </button>
                  </div>

                  <div className="h-1.5 bg-gray-200 rounded-full">
                    <div
                      className="h-full bg-green-500"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
