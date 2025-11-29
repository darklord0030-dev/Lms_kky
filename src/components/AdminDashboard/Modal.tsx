import React, { useState } from "react";
import { Search, X, UserPlus, ChevronUp, ChevronDown } from "lucide-react";
import type { Course } from "../types/Course";



type Course = {
  id: string;
  name: string;
};

type EnrollModalProps = {
  onClose: () => void;
  onEnroll: (course: Course) => void;
};

const mockCourses: Course[] = [
  { id: "1", name: "cyber" },
  { id: "2", name: "[Edit me] Guide for Learners" },
];

export default function EnrollToCourseModal({ onClose, onEnroll }: EnrollModalProps) {
  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(true);

  // Filter + sort
  const filteredCourses = mockCourses
    .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) =>
      sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    );

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg shadow-lg w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Enroll to course</h2>
          <button onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="flex items-center border rounded px-2 py-1">
            <Search className="w-4 h-4 text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full outline-none text-sm"
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th
                  className="p-3 cursor-pointer flex items-center gap-1"
                  onClick={() => setSortAsc(!sortAsc)}
                >
                  Course {sortAsc ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map((course) => (
                <tr
                  key={course.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="p-3">{course.name}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => onEnroll(course)}
                      className="text-gray-700 hover:text-blue-600"
                    >
                      <UserPlus className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredCourses.length === 0 && (
                <tr>
                  <td className="p-3 text-gray-500 text-sm" colSpan={2}>
                    No courses found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
