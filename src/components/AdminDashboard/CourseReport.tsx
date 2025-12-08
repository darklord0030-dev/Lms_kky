import React, { useEffect, useState } from "react";
import { Search, Filter, ChevronUp, ChevronRight, Eye, Download } from "lucide-react";
import StatCard from "./StatCard";
import { useNavigate } from "react-router-dom";

//
// =========================
// MERGED API CODE (TOP LEVEL)
// =========================
//

export interface CourseReport {
  id: string;
  name: string;
  category: string;
  enrolled: number;
  completed: number;
  inProgress: number;
  status: "Active" | "Inactive";
}

export async function getCourseReports(): Promise<CourseReport[]> {
  const res = await fetch("/api/course-reports");

  if (!res.ok) {
    throw new Error("Failed to load course report data");
  }

  return res.json();
}

//
// =========================
// COMPONENT STARTS HERE
// =========================
//

interface BreadcrumbItem {
  label: string;
  href?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
  { label: "Report", href: "/reports" },
  { label: "Course", href: "/courses" },
];

export default function CourseReportPage() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState<CourseReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    getCourseReports()
      .then((data) => setCourses(data))
      .catch(() => setError("Unable to load course reports"))
      .finally(() => setLoading(false));
  }, []);

  const filteredCourses = courses.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen w-full bg-zinc-50">
      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 font-medium text-sl mb-4">
          {breadcrumbs.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
              {item.href ? (
                <a href={item.href} className="text-blue-600 hover:underline">
                  {item.label}
                </a>
              ) : (
                <span className="text-gray-600">{item.label}</span>
              )}
            </div>
          ))}
        </nav>

        {/* Title */}
        <h1 className="mb-6 text-3xl font-semibold tracking-tight text-zinc-900">
          Course reports
        </h1>

        {/* KPI Strip */}
        <div className="grid grid-cols-1 gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard value={courses.length.toString()} label="Total courses" />
          <StatCard value={courses.filter(c => c.status === "Active").length.toString()} label="Active courses" />
          <StatCard value={courses.filter(c => c.status === "Inactive").length.toString()} label="Inactive courses" />
          <StatCard value={courses.reduce((sum, c) => sum + c.enrolled, 0).toString()} label="Enrollments" />
          <StatCard value={courses.reduce((sum, c) => sum + c.completed, 0).toString()} label="Completed enrollments" />
          <StatCard value={courses.reduce((sum, c) => sum + c.inProgress, 0).toString()} label="In progress" />
        </div>

        {/* Search + Filter */}
        <div className="mt-6 flex items-center gap-3">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
            <input
              placeholder="Search courses"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-zinc-200 bg-white py-2 pl-10 pr-3 text-sm outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-zinc-900/5"
            />
          </div>

          <button className="inline-flex items-center justify-center rounded-2xl border border-zinc-200 bg-white p-2 shadow-sm hover:bg-zinc-50">
            <Filter className="h-5 w-5 text-zinc-700" />
          </button>
        </div>

        {/* Table */}
        <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          {loading ? (
            <p className="p-6 text-zinc-500">Loading...</p>
          ) : error ? (
            <p className="p-6 text-red-500">{error}</p>
          ) : (
            <table className="min-w-full table-fixed">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/60 text-left text-sm text-zinc-600">
                  <th className="px-6 py-4 font-medium">Course</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">
                    <div className="flex items-center gap-2">
                      <span>Enrolled users</span>
                      <ChevronUp className="h-4 w-4" />
                    </div>
                  </th>
                  <th className="px-6 py-4 font-medium">Completed</th>
                  <th className="px-6 py-4 font-medium">In progress</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="w-16 px-6 py-4 text-right"></th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-100 text-sm">
                {filteredCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-zinc-50">
                    <td className="px-6 py-4">{course.name}</td>
                    <td className="px-6 py-4 text-zinc-600">{course.category}</td>
                    <td className="px-6 py-4 text-zinc-600">{course.enrolled}</td>
                    <td className="px-6 py-4 text-zinc-600">{course.completed}</td>
                    <td className="px-6 py-4 text-zinc-600">{course.inProgress}</td>
                    <td
                      className={`px-6 py-4 ${
                        course.status === "Active" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {course.status}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end">
                        <button
                          className="rounded-full p-2 hover:bg-zinc-100"
                          onClick={() => navigate(`/reports/learning/${course.id}`)}
                        >
                          <Eye className="h-5 w-5 text-zinc-700" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          )}
        </div>
      </div>

      {/* Download Button */}
      <button className="fixed bottom-6 left-6 inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white p-3 shadow-sm hover:bg-zinc-50">
        <Download className="h-5 w-5 text-zinc-800" />
      </button>
    </div>
  );
}
