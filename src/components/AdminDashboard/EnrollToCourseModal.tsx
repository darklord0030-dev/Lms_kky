import React, { useState } from "react";
import { Search, X, UserPlus, ChevronDown } from "lucide-react";
import { Course } from "../types/course";


type Course = {
  id: string;
  title: string;
  code: string;
  role: string;
  enrolled: string;
  completed: string;
};

interface EnrollToCourseModalProps {
  onClose: () => void;
  onEnroll: (course: Course) => void;
}

export default function EnrollToCourseModal({
  onClose,
  onEnroll,
}: EnrollToCourseModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  React.useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const availableCourses: Course[] = [
    {
      id: "c1",
      title: "What is TalentLibrary?",
      code: "TL101",
      role: "Learner",
      enrolled: "-",
      completed: "-",
    },
    {
      id: "c2",
      title: "[Edit me] Guide for Learners",
      code: "TL102",
      role: "Learner",
      enrolled: "-",
      completed: "-",
    },
  ];

  const filteredCourses = availableCourses.filter((course) =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 bg-black z-50 transition-opacity duration-300"
      style={{ backgroundColor: `rgba(0, 0, 0, ${isVisible ? '0.5' : '0'})` }}
      onClick={handleClose}
    >
      <div
        className={`fixed right-0 top-0 h-full bg-white w-full max-w-2xl shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          isVisible ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Enroll to course</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
          </div>

          <div className="border rounded-lg overflow-hidden">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition"
            >
              <span className="font-medium">Course</span>
              <ChevronDown
                className={`w-5 h-5 transition-transform ${
                  isExpanded ? "transform rotate-180" : ""
                }`}
              />
            </button>

            {isExpanded && (
              <div className="divide-y">
                {filteredCourses.map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 transition"
                  >
                    <span className="text-gray-900">{course.title}</span>
                    <button
                      onClick={() => onEnroll(course)}
                      className="p-2 hover:bg-blue-50 rounded transition"
                    >
                      <UserPlus className="w-5 h-5 text-gray-700" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
