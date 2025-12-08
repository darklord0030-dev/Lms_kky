import React, { useEffect, useState, useRef } from "react";
import { Search, Filter, ChevronUp, ChevronRight, Eye, Download } from "lucide-react";
import { useLocation, useParams } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";
import StatCard from "./StatCard";
import { useNavigate } from "react-router-dom";

type User = {
  id: string | number;
  firstName: string;
  lastName: string;
  email: string;
  type: string;
  lastLogin?: string;
};

interface BreadcrumbItem {
  label: string;
  href?: string;
}

const UserReport: React.FC = () => {
  const { id } = useParams();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(location.state?.user || null);

  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Report", href: "/reports" },
    { label: "Users", href: "/users" },
  ];

  // 🚀 Fetch user + stats from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;

        const userRes = await fetch(`/api/users/${id}`);
        const statsRes = await fetch(`/api/users/${id}/report`);

        const userData = await userRes.json();
        const statsData = await statsRes.json();

        setUser({
          id: userData.id,
          firstName: userData.firstname,
          lastName: userData.lastname,
          email: userData.email,
          type: userData.type ?? "Learner",
          lastLogin: userData.lastLogin,
        });

        setStats(statsData);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Convert API stats → StatCard format
  const statCards = stats
    ? [
        { label: "Completion rate", value: `${stats.completionRate.toFixed(1)}%` },
        { label: "Completed courses", value: String(stats.completedCourses) },
        { label: "Courses in progress", value: String(stats.coursesInProgress) },
        { label: "Courses not passed", value: String(stats.coursesNotPassed) ?? "0" },
        { label: "Courses not started", value: String(stats.coursesNotStarted) },
        { label: "Training time", value: `${stats.trainingTimeHours}h ${stats.trainingTimeMinutes}m` },
      ]
    : [];

  // 🟩 Export Excel
  const exportToExcel = () => {
    if (!user || !stats) return;

    const userData = [
      {
        Name: `${user.firstName} ${user.lastName}`,
        Email: user.email,
        Type: user.type,
        LastLogin: user.lastLogin || "-",
        AssignedCourses: stats.assignedCourses?.length ?? 0,
        CompletedCourses: stats.completedCourses,
        Points: stats.points ?? 0,
        Badges: stats.badges ?? 0,
        Level: stats.level ?? 1,
      },
    ];

    const statsData = statCards.map((s) => ({
      Metric: s.label,
      Value: s.value,
    }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(userData), "User Info");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(statsData), "Stats");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `UserReport_${user.firstName}_${user.lastName}.xlsx`);
  };

  // 🟩 Export PDF
  const exportToPDF = () => {
    if (!user || !stats) return;

    const doc = new jsPDF();
    doc.text(`User Report for ${user.firstName} ${user.lastName}`, 14, 20);

    (doc as any).autoTable({
      startY: 30,
      head: [["Name", "Email", "Type", "Last Login", "Assigned", "Completed", "Points", "Badges", "Level"]],
      body: [[
        `${user.firstName} ${user.lastName}`,
        user.email,
        user.type,
        user.lastLogin || "-",
        stats.assignedCourses?.length ?? 0,
        stats.completedCourses,
        stats.points ?? 0,
        stats.badges ?? 0,
        stats.level ?? 1,
      ]],
    });

    (doc as any).autoTable({
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [["Metric", "Value"]],
      body: statCards.map((s) => [s.label, s.value]),
    });

    doc.save(`UserReport_${user.firstName}_${user.lastName}.pdf`);
  };

  return (
    <div className="min-h-screen w-full bg-white">
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

        <h1 className="mb-6 text-3xl font-semibold tracking-tight text-zinc-900">
          {loading ? "Loading..." : `User report for ${user?.firstName} ${user?.lastName}`}
        </h1>
        {/* Stats Section */}
        <div className="grid grid-cols-1 gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {!loading && statCards.map((s) => <StatCard key={s.label} value={s.value} label={s.label} />)}
        </div>

        {/* Search + Filter */}
        <div className="mt-6 flex items-center gap-3">
          <div className="relative w-full max-w-md">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
              <Search className="h-5 w-5 text-zinc-400" />
            </span>
            <input
              type="text"
              placeholder="Search"
              className="w-full rounded-2xl border border-zinc-200 bg-white py-2 pl-10 pr-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-zinc-900/5"
            />
          </div>
          <button className="inline-flex items-center justify-center rounded-2xl border border-zinc-200 bg-white p-2 shadow-sm hover:bg-zinc-50">
            <Filter className="h-5 w-5 text-zinc-700" />
          </button>
        </div>

        {/* Table */}
        <div className="mt-4 overflow-hidden rounded-2xl bg-white shadow-sm">
          <table className="min-w-full table-fixed">
            <thead>
              <tr className="border-b text-left text-sm text-zinc-600">
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">User type</th>
                <th className="px-6 py-4 font-medium">Last login</th>
                <th className="px-6 py-4 font-medium flex items-center gap-2">
                  Assigned courses <ChevronUp className="h-4 w-4" />
                </th>
                <th className="px-6 py-4 font-medium">Completed courses</th>
                <th className="px-6 py-4 font-medium">Points</th>
                <th className="px-6 py-4 font-medium">Badges</th>
                <th className="px-6 py-4 font-medium">Level</th>
                <th className="w-16 px-6 py-4"></th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-100 text-sm">
              {user && stats ? (
                <tr className="bg-blue-50">
                  <td className="px-6 py-4">{user.firstName} {user.lastName}</td>
                  <td className="px-6 py-4">{user.type}</td>
                  <td className="px-6 py-4">{user.lastLogin || "-"}</td>
                  <td className="px-6 py-4">{stats.assignedCourses?.length ?? "-"}</td>
                  <td className="px-6 py-4">{stats.completedCourses}</td>
                  <td className="px-6 py-4">{stats.points ?? 0}</td>
                  <td className="px-6 py-4">{stats.badges ?? 0}</td>
                  <td className="px-6 py-4">{stats.level ?? 1}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end">
                      <button
                        onClick={() => navigate(`/reports/learning/${id}`)}
                        className="rounded-full p-2 hover:bg-blue-100"
                      >
                        <Eye className="h-5 w-5 text-zinc-700" />
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr><td colSpan={10} className="px-6 py-6 text-center text-zinc-500">Loading...</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Download Buttons */}
      <div className="fixed bottom-6 left-6" ref={dropdownRef}>
        <div className="relative">
          <button
            onClick={() => setOpen((prev) => !prev)}
            className="rounded-full border bg-white p-3 shadow-sm"
          >
            <Download className="h-5 w-5 text-zinc-800" />
          </button>

          {open && (
            <div className="absolute left-0 mt-2 w-44 rounded-lg border bg-white shadow-lg">
              <button onClick={() => { exportToExcel(); setOpen(false); }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-100">
                Download Excel
              </button>

              <button onClick={() => { exportToPDF(); setOpen(false); }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-100">
                Download PDF
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserReport;
