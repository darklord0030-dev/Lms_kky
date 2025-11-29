import React from "react";
import {
  Users,
  UserX,
  BookOpen,
  CheckCircle,
  List,
  GitBranch,
  
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// Dummy data for activity
const activityData = [
  { date: "28/07", logins: 0, completions: 0 },
  { date: "17/08", logins: 2, completions: 0 },
  { date: "18/08", logins: 1, completions: 0 },
  { date: "21/08", logins: 4, completions: 0 },
  { date: "22/08", logins: 6, completions: 0 },
  { date: "23/08", logins: 3, completions: 0 },
  { date: "27/08", logins: 1, completions: 0 },
];

// Dummy data for course progress (gauge)
const courseData = [
  { name: "Completed", value: 2, color: "#22c55e" },
  { name: "In progress", value: 1, color: "#f97316" },
  { name: "Not started", value: 5, color: "#9ca3af" },
  { name: "Not passed", value: 0, color: "#ef4444" },
];

export default function ReportsLandingPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Top Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Overview */}
        <div className="border rounded-lg p-4 shadow-sm bg-white">
          <h2 className="font-semibold text-lg mb-4">Overview</h2>
          <ul className="space-y-3">
            <li className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-600" /> Active users
              </span>
              <span className="font-medium">2</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <UserX className="w-5 h-5 text-gray-600" /> Never logged in
              </span>
              <span className="font-medium">1</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-gray-600" /> Assigned courses
              </span>
              <span className="font-medium">2</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-gray-600" /> Completed courses
              </span>
              <span className="font-medium">0</span>
            </li>
          </ul>
        </div>

        {/* Learning Structure */}
        <div className="border rounded-lg p-4 shadow-sm bg-white">
          <h2 className="font-semibold text-lg mb-4">Learning Structure</h2>
          <ul className="space-y-3">
            <li className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-gray-600" /> Courses
              </span>
              <span className="font-medium">12</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <List className="w-5 h-5 text-gray-600" /> Categories
              </span>
              <span className="font-medium">1</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-gray-600" /> Branches
              </span>
              <span className="font-medium">0</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-600" /> Groups
              </span>
              <span className="font-medium">0</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Activity */}
        <div className="border rounded-lg p-4 shadow-sm bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Activity</h2>
            <select className="border rounded px-2 py-1 text-sm">
              <option>Month</option>
              <option>Week</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="logins" fill="#3b82f6" />
              <Bar dataKey="completions" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 text-sm mt-2">
            <span className="flex items-center gap-1 text-blue-600 font-medium">
              ● 19 Logins
            </span>
            <span className="flex items-center gap-1 text-green-600 font-medium">
              ● 0 Course completions
            </span>
          </div>
        </div>

        {/* Courses Progress (Gauge) */}
        <div className="border rounded-lg p-4 shadow-sm bg-white">
          <h2 className="font-semibold text-lg mb-4">Courses</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={courseData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="100%"
                startAngle={180}
                endAngle={0}
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
              >
                {courseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Legend layout="horizontal" verticalAlign="bottom" align="center" />
            </PieChart>
          </ResponsiveContainer>
          <div className="text-center font-medium text-xl">2 Courses</div>
        </div>
      </div>
    </div>
  );
}
