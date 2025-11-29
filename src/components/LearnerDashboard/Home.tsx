import React from "react";
import {
  Play,
  ChevronRight,
  Trophy,
  Clock,
  Maximize2,
  Bookmark,
  Check,
  Bell,
  MoreVertical,
  Plus,
  Pin,
} from "lucide-react";

export default function StudentDashboard() {
  const courses = [
    {
      id: "1",
      title: "Time Management Mastery For Busy Professionals",
      thumbnail:
        "https://images.pexels.com/photos/1178498/pexels-photo-1178498.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop",
      duration: "4h 30m",
      progress: 70,
    },
    {
      id: "2",
      title: "Data Analytics Basics: Unlock The Power Of Data",
      thumbnail:
        "https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop",
      duration: "1h 30m",
      progress: 10,
    },
    {
      id: "3",
      title: "Master The Blueprint To Financial Freedom",
      thumbnail:
        "https://images.pexels.com/photos/6772076/pexels-photo-6772076.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop",
      duration: "2h 15m",
      progress: 40,
    },
  ];

  const taskList = [
    {
      id: "1",
      title: "Create a Mind Map For Business",
      icon: "📝",
      dueDate: "15 Feb",
      completed: false,
      bookmarked: true,
    },
    {
      id: "2",
      title: "Case Study: Trends In Financial Markets",
      icon: "📝",
      dueDate: "20 Feb",
      completed: false,
      bookmarked: false,
    },
    {
      id: "3",
      title: "Reflective Journal: What I Learned This Month",
      icon: "📌",
      dueDate: "28 Feb",
      completed: false,
      bookmarked: false,
      priority: "high",
    },
  ];

  const noteCategories = [
    {
      category: "Personal",
      notes: [
        {
          id: "1",
          title: "Personal",
          description: "My Quick Revision Notes",
          date: "22 Jan",
          pinned: true,
        },
      ],
    },
    {
      category: "Study",
      notes: [
        {
          id: "2",
          title: "Highlights",
          description: "Important Points To Remember",
          date: "15 Jan",
        },
        {
          id: "3",
          title: "Brainstorm",
          description: "Ideas To Explore Later",
          date: "8 Jan",
        },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          Good Morning, Akash 👋
        </h2>
        <p className="text-gray-700">
          You're on fire! Only{" "}
          <span className="font-semibold text-blue-600">2 courses</span> away
          from your next badge 🔥
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6">
        {/* Achievements */}
        <div className="bg-white rounded-xl p-6 border hover:shadow-lg transition">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-600">Achievements</p>
              <p className="text-3xl font-bold text-gray-900">
                8<span className="text-gray-400">/12</span>
              </p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <Trophy size={22} className="text-green-600" />
            </div>
          </div>
          <div className="mt-3 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-green-500" style={{ width: "70%" }}></div>
          </div>
        </div>

        {/* Learning Time */}
        <div className="bg-white rounded-xl p-6 border hover:shadow-lg transition">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-600">Learning Time</p>
              <p className="text-3xl font-bold text-gray-900">84</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Clock size={22} className="text-blue-600" />
            </div>
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="bg-white rounded-xl p-6 border hover:shadow-lg transition">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Tasks</p>
              <p className="text-3xl font-bold text-gray-900">12</p>
            </div>
            <div className="p-2 bg-orange-50 rounded-lg">
              <Maximize2 size={22} className="text-orange-600" />
            </div>
          </div>
        </div>

        {/* Points */}
        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-xl p-6 hover:shadow-lg transition">
          <p className="text-sm font-semibold">2400 Points</p>
          <p className="text-xs mb-4 opacity-90">
            Complete a course & get 400 pts
          </p>
          <div className="bg-white/30 rounded-full h-1.5 overflow-hidden">
            <div className="h-full bg-white" style={{ width: "60%" }}></div>
          </div>
        </div>
      </div>

      {/* Continue Learning */}
      <div>
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Continue Learning</h2>
          <ChevronRight className="text-gray-500" />
        </div>

        <div className="grid grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-xl border hover:shadow-lg transition overflow-hidden group"
            >
              <div className="relative">
                <img src={course.thumbnail} className="w-full h-44 object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex justify-center items-center transition">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
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
                  <button className="text-xs px-3 py-1 bg-blue-600 text-white rounded-md">
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
      </div>

      {/* Tasks & Notes - Side by Side */}
      <div className="grid grid-cols-2 gap-6">
        {/* Tasks */}
        <div className="bg-white rounded-xl p-6 border">
          <div className="flex justify-between mb-4">
            <h3 className="font-bold">Tasks & Assignments</h3>
            <Plus className="text-gray-500" />
          </div>

          <div className="space-y-3">
            {taskList.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 border p-3 rounded-lg hover:bg-gray-50 transition"
              >
                <span className="text-xl">{task.icon}</span>

                <div className="flex-1">
                  <p className="font-medium text-sm">{task.title}</p>
                  <p className="text-xs text-gray-500">{task.dueDate}</p>
                </div>

                <div className="flex gap-2">
                  <Bookmark
                    size={16}
                    className={task.bookmarked ? "text-yellow-500" : "text-gray-400"}
                  />
                  <Check size={16} className="text-gray-400" />
                  <Bell
                    size={16}
                    className={
                      task.priority === "high"
                        ? "text-yellow-500"
                        : "text-gray-400"
                    }
                  />
                  <MoreVertical size={16} className="text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-xl p-6 border">
          <div className="flex justify-between mb-3">
            <h3 className="font-bold">Notes</h3>
            <ChevronRight size={20} className="text-gray-500" />
          </div>

          <button className="w-full border-dashed border-2 border-gray-300 rounded-lg py-6 mb-4">
            <Plus className="text-gray-600 mx-auto" />
            <p className="text-sm text-gray-500">Add New</p>
          </button>

          <div className="space-y-4">
            {noteCategories.map((cat) => (
              <div key={cat.category}>
                <div className="grid grid-cols-2 gap-3">
                  {cat.notes.map((note) => (
                    <div
                      key={note.id}
                      className="bg-gray-50 border p-3 rounded-lg relative"
                    >
                      {note.pinned && (
                        <Pin
                          size={14}
                          className="absolute right-2 top-2 text-gray-500"
                        />
                      )}
                      <p className="font-medium text-sm">{note.title}</p>
                      <p className="text-xs text-gray-500">{note.description}</p>
                      <p className="text-xs text-gray-400">{note.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
