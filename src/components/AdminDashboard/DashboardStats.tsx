import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Users,
  BookOpen,
  TrendingUp,
  Award,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import toast from "react-hot-toast";

export const DashboardStats: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch stats from backend
  const fetchStats = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/dashboard/stats");
      setStats(res.data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      toast.error("Failed to load dashboard stats");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch initially and refresh every 30 seconds
  useEffect(() => {
    fetchStats();

    const interval = setInterval(() => {
      fetchStats();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "bg-blue-50 text-blue-600",
      green: "bg-green-50 text-green-600",
      purple: "bg-purple-50 text-purple-600",
      orange: "bg-orange-50 text-orange-600",
    };
    return colors[color as keyof typeof colors];
  };

  if (loading) {
    return (
      <div className="text-center text-gray-500 py-10">
        Loading dashboard stats...
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center text-red-500 py-10">
        Failed to load stats.
      </div>
    );
  }

  // ✅ Define cards using API data
  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      change: stats.changes.totalUsers,
      trend: stats.changes.totalUsers.startsWith("+") ? "up" : "down",
      icon: Users,
      color: "blue",
    },
    {
      title: "Active Courses",
      value: stats.activeCourses,
      change: stats.changes.activeCourses,
      trend: stats.changes.activeCourses.startsWith("+") ? "up" : "down",
      icon: BookOpen,
      color: "green",
    },
    {
      title: "Completion Rate",
      value: `${stats.completionRate}%`, // ✅ fixed template string
      change: stats.changes.completionRate,
      trend: stats.changes.completionRate.startsWith("+") ? "up" : "down",
      icon: TrendingUp,
      color: "purple",
    },
    {
      title: "Certificates Issued",
      value: stats.certificatesIssued,
      change: stats.changes.certificatesIssued,
      trend: stats.changes.certificatesIssued.startsWith("+") ? "up" : "down",
      icon: Award,
      color: "orange",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        const TrendIcon = stat.trend === "up" ? ArrowUp : ArrowDown;

        return (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center justify-between">
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center ${getColorClasses(
                  stat.color
                )}`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <div
                className={`flex items-center space-x-1 text-sm ${
                  stat.trend === "up" ? "text-green-600" : "text-red-600"
                }`}
              >
                <TrendIcon className="w-4 h-4" />
                <span className="font-medium">{stat.change}</span>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold text-gray-900">
                {stat.value}
              </h3>
              <p className="text-sm text-gray-600 mt-1">{stat.title}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
