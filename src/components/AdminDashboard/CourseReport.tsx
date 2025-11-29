import React from "react";
import { Search, Filter, ChevronUp, ChevronRight, Eye, Download } from "lucide-react";
import StatCard from "./StatCard";
import { useNavigate } from "react-router-dom";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
  { label: "Report", href: "/reports" },
  { label: "Course", href: "/courses" },
];

export default function CourseReport() {
  const navigate = useNavigate();

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

        {/* KPI strip */}
        <div className="grid grid-cols-1 gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard value="5" label="Total courses" />
          <StatCard value="2" label="Active courses" />
          <StatCard value="3" label="Inactive courses" />
          <StatCard value="10" label="Enrollments" />
          <StatCard value="4" label="Completed enrollments" />
          <StatCard value="6" label="In progress" />
        </div>

        {/* Controls */}
        <div className="mt-6 flex items-center gap-3">
          <div className="relative w-full max-w-md">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
              <Search className="h-5 w-5 text-zinc-400" />
            </span>
            <input
              placeholder="Search courses"
              className="w-full rounded-2xl border border-zinc-200 bg-white py-2 pl-10 pr-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-zinc-900/5"
            />
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-2xl border border-zinc-200 bg-white p-2 shadow-sm transition hover:bg-zinc-50"
            aria-label="Filter"
          >
            <Filter className="h-5 w-5 text-zinc-700" />
          </button>
        </div>

        {/* Table */}
        <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
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
                <th className="w-16 px-6 py-4 text-right font-medium">&nbsp;</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-sm">
              <tr className="bg-blue-50">
                <td className="px-6 py-4 text-zinc-900">React Basics</td>
                <td className="px-6 py-4 text-zinc-600">Web Development</td>
                <td className="px-6 py-4 text-zinc-600">20</td>
                <td className="px-6 py-4 text-zinc-600">10</td>
                <td className="px-6 py-4 text-zinc-600">5</td>
                <td className="px-6 py-4 text-green-600">Active</td>
                <td className="px-6 py-4">
                  <div className="flex justify-end">
                    <button
                      className="inline-flex items-center justify-center rounded-full p-2 hover:bg-zinc-100"
                      aria-label="View course"
                    >
                      <Eye className="h-5 w-5 text-zinc-700" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr className="hover:bg-zinc-50/60">
                <td className="px-6 py-4 text-zinc-900">Node.js Fundamentals</td>
                <td className="px-6 py-4 text-zinc-600">Backend</td>
                <td className="px-6 py-4 text-zinc-600">15</td>
                <td className="px-6 py-4 text-zinc-600">6</td>
                <td className="px-6 py-4 text-zinc-600">4</td>
                <td className="px-6 py-4 text-red-600">Inactive</td>
                <td className="px-6 py-4">
                  <div className="flex justify-end">
                    <button
                      className="inline-flex items-center justify-center rounded-full p-2 hover:bg-zinc-100"
                      aria-label="View course"
                      onClick={() => navigate("/reports/learning")}
                    >
                      <Eye className="h-5 w-5 text-zinc-700" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom-left download */}
      <button
        className="fixed bottom-6 left-6 inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white p-3 shadow-sm hover:bg-zinc-50"
        aria-label="Download report"
      >
        <Download className="h-5 w-5 text-zinc-800" />
      </button>
    </div>
  );
}
