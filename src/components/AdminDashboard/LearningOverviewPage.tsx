import React, { useState, useEffect } from "react";
import {
  ChevronRight,
  Search,
  Filter,
  Lock,
  CheckCircle2,
  Circle,
  CircleDashed,
  XCircle,
  Clock,
  TrendingUp,
  Award,
  LogIn,
  BookOpen,
  Star,
} from "lucide-react";

/* -------------------- Types -------------------- */
export interface User {
  id?: string;
  fullName: string;
  email: string;
  role: string;
}

export interface Course {
  id: string;
  name: string;
  description: string;
  status: "not_started" | "in_progress" | "completed";
}

export interface LearningActivity {
  id: string;
  courseId?: string;
  name: string;
  type: string;
  courseName: string;
  progressStatus: string;
  score?: number;
  trainingTime?: string;
  completionDate?: string;
}

export interface OverviewStats {
  completionRate: number;
  trainingTime: string;
  completedActivities: number;
  activitiesInProgress: number;
  activitiesNotPassed: number;
  activitiesNotStarted: number;
}

export interface Achievement {
  points: number;
  badges: number;
  level: number;
}

export interface ActivityEvent {
  id: string;
  type: "login" | "activity_start" | "activity_complete" | "badge_earned" | "course_completion";
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface TimelineData {
  date: string;
  logins: number;
  courseCompletions: number;
}

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface Tab {
  id: string;
  label: string;
}

interface LearningOverviewPageProps {
  user: User;
  breadcrumbs: BreadcrumbItem[];
  activities: LearningActivity[];
  stats: OverviewStats;
  achievements: Achievement;
  timelineData: TimelineData[];
  activityPeriod: string;
  onPeriodChange: (period: string) => void;
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

/* -------------------- Mock Data -------------------- */
export const mockUser: User = {
  id: "1",
  email: "kru@ymail.com",
  fullName: "krunk krunk",
  role: "superadmin",
};

export const mockCourses: Course[] = [
  {
    id: "1",
    name: "What is TalentLibrary?",
    description: "Introduction to TalentLibrary platform",
    status: "not_started",
  },
];

export const mockLearningActivities: LearningActivity[] = [
  {
    id: "1",
    courseId: "1",
    name: "What is TalentLibrary?",
    type: "SCORM",
    courseName: "What is TalentLibrary?",
    completionDate: undefined,
    progressStatus: "Not attempted",
    score: undefined,
    trainingTime: undefined,
  },
];

export const mockAchievements: Achievement = {
  points: 50,
  badges: 0,
  level: 1,
};

export const mockOverviewStats: OverviewStats = {
  completionRate: 0.0,
  completedActivities: 0,
  activitiesInProgress: 0,
  activitiesNotPassed: 0,
  activitiesNotStarted: 1,
  trainingTime: "0h 0m",
};

export const generateTimelineData = (events: ActivityEvent[]): TimelineData[] => {
  const dataMap = new Map<string, TimelineData>();
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateKey = d.toISOString().split("T")[0];
    dataMap.set(dateKey, { logins: 0, courseCompletions: 0, date: dateKey });
  }

  events.forEach((event) => {
    const dateKey = event.timestamp.toISOString().split("T")[0];
    const existing = dataMap.get(dateKey);
    if (existing) {
      if (event.type === "login") existing.logins++;
      else if (event.type === "course_completion") existing.courseCompletions++;
    }
  });

  return Array.from(dataMap.values()).sort((a, b) => a.date.localeCompare(b.date));
};

/* -------------------- Main Component -------------------- */
export default function LearningOverviewPage({
  user,
  breadcrumbs,
  activities,
  stats,
  achievements,
  timelineData,
  activityPeriod,
  onPeriodChange,
  tabs,
  activeTab,
  onTabChange,
}: LearningOverviewPageProps) {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");

  const maxValue = Math.max(...timelineData.map((d) => Math.max(d.logins, d.courseCompletions)), 1);

  useEffect(() => {
    setEvents([]); // placeholder, can be updated with real events
  }, []);

  const filteredActivities = activities.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen">
      <UserHeader user={user} />

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm mb-4">
        {breadcrumbs.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
            {item.href ? (
              <a href={item.href} className="text-blue-600 hover:underline">{item.label}</a>
            ) : (
              <span className="text-gray-600">{item.label}</span>
            )}
          </div>
        ))}
      </nav>

      <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />

      {/* Stats + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-6">Overview</h3>
          <div className="space-y-4">
            <OverviewStat icon={<TrendingUp className="w-5 h-5 text-gray-400" />} label="Completion rate" value={`${stats.completionRate.toFixed(1)}%`} />
            <OverviewStat icon={<CheckCircle2 className="w-5 h-5 text-gray-400" />} label="Completed courses" value={stats.completedActivities} />
            <OverviewStat icon={<CircleDashed className="w-5 h-5 text-gray-400" />} label="Courses in progress" value={stats.activitiesInProgress} />
            <OverviewStat icon={<XCircle className="w-5 h-5 text-gray-400" />} label="Courses not passed" value={stats.activitiesNotPassed} />
            <OverviewStat icon={<Circle className="w-5 h-5 text-gray-400" />} label="Courses not started" value={stats.activitiesNotStarted} />
            <OverviewStat icon={<Clock className="w-5 h-5 text-gray-400" />} label="Training time" value={stats.trainingTime} />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Activity</h3>
            <select
              value={activityPeriod}
              onChange={(e) => onPeriodChange(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="week">Week</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
            </select>
          </div>
          <div className="h-64 flex items-end justify-between gap-1">
            {timelineData.map((data, i) => {
              const height = (data.logins / maxValue) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end">
                  <div className="w-full bg-blue-600 rounded-t" style={{ height: `${height}%` }} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Activities Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {filteredActivities.length === 0 ? (
          <div className="flex flex-col items-center py-12">
            <p className="text-gray-500 text-sm">No activities found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Learning activity","Type","Course name","Completion date","Progress status","Score","Training time",""].map((h, i) => (
                  <th key={i} className="px-6 py-3 text-left font-medium text-gray-700 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredActivities.map((a) => (
                <tr key={a.id} className="hover:bg-blue-50">
                  <td className="px-6 py-4">{a.name}</td>
                  <td className="px-6 py-4 flex items-center gap-2"><Lock className="w-4 h-4" /> {a.type}</td>
                  <td className="px-6 py-4">{a.courseName}</td>
                  <td className="px-6 py-4">{a.completionDate || "-"}</td>
                  <td className="px-6 py-4">{a.progressStatus}</td>
                  <td className="px-6 py-4">{a.score ?? "-"}</td>
                  <td className="px-6 py-4">{a.trainingTime || "-"}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="px-4 py-1.5 border border-gray-300 rounded hover:bg-gray-50">Complete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Achievements */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-6">Achievements</h3>
        <AchievementStat label="Points" value={achievements.points} />
        <AchievementStat label="Badges" value={achievements.badges} />
        <AchievementStat label="Level" value={achievements.level} />
      </div>
    </div>
  );
}

/* -------------------- Sub Components -------------------- */
function UserHeader({ user }: { user: User }) {
  const initials = user.fullName.split(" ").map((n) => n[0]).join("").toUpperCase();
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <div className="w-24 h-24 rounded-full bg-blue-700 flex items-center justify-center text-white text-3xl font-semibold">{initials}</div>
        <div>
          <div className="text-xs text-blue-600 font-semibold uppercase mb-1">{user.role}</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">{user.fullName}</h2>
          <div className="text-sm text-gray-600">{user.email}</div>
        </div>
      </div>
    </div>
  );
}

function OverviewStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">{icon}<span className="text-sm text-gray-700">{label}</span></div>
      <span className="text-lg font-semibold">{value}</span>
    </div>
  );
}

function AchievementStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-gray-700">{label}</span>
      <span className="text-lg font-semibold">{value}</span>
    </div>
  );
}

function TabNavigation({ tabs, activeTab, onTabChange }: { tabs: Tab[]; activeTab: string; onTabChange: (tabId: string) => void }) {
  return (
    <div className="flex gap-2 mb-6 border-b border-gray-200">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`py-2 px-4 text-sm font-medium ${activeTab === tab.id ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
