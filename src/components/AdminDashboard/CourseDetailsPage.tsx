import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Filter,
  Eye,
  UserPlus,
  RotateCcw,
  FileCheck,
  UserMinus,
  Download,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import emptyIllustration from "../assets/group.png";
import emptyFilesIllustration from "../assets/files.png";
import noresultIllustration from "../assets/noresult.png";

interface User {
  id: string;
  name: string;
  role: string;
  progress: number;
  enrollmentDate: string;
  completionDate: string;
  expirationDate: string;
}

const mockUsers: User[] = [
  {
    id: "1",
    name: "John Doe",
    role: "Learner",
    progress: 20,
    enrollmentDate: "2025-09-11",
    completionDate: "-",
    expirationDate: "-",
  },
  {
    id: "2",
    name: "Alice Smith",
    role: "Instructor",
    progress: 100,
    enrollmentDate: "2025-08-27",
    completionDate: "2025-09-05",
    expirationDate: "-",
  },
];

/**
 * Placeholder modal components so this file builds standalone.
 * Replace these with your real modal components (and remove these placeholders)
 * if you have them elsewhere in the project.
 */
const EnrollToCourseModal: React.FC<{ onClose: () => void; onEnroll: () => void }> = ({
  onClose,
  onEnroll,
}) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded shadow w-96">
      <h3 className="text-lg font-semibold mb-4">Enroll (placeholder)</h3>
      <div className="flex justify-end gap-2">
        <button className="px-3 py-1 border rounded" onClick={onClose}>
          Close
        </button>
        <button
          className="px-3 py-1 bg-blue-600 text-white rounded"
          onClick={() => {
            onEnroll();
            onClose();
          }}
        >
          Enroll
        </button>
      </div>
    </div>
  </div>
);

const AddGroupModal: React.FC<{ onClose: () => void; onAddToGroup: () => void }> = ({
  onClose,
  onAddToGroup,
}) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded shadow w-96">
      <h3 className="text-lg font-semibold mb-4">Add Group (placeholder)</h3>
      <div className="flex justify-end gap-2">
        <button className="px-3 py-1 border rounded" onClick={onClose}>
          Close
        </button>
        <button
          className="px-3 py-1 bg-blue-600 text-white rounded"
          onClick={() => {
            onAddToGroup();
            onClose();
          }}
        >
          Add
        </button>
      </div>
    </div>
  </div>
);

const UploadFilesModal: React.FC<{ onClose: () => void; onUpload: () => void }> = ({
  onClose,
  onUpload,
}) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded shadow w-96">
      <h3 className="text-lg font-semibold mb-4">Upload Files (placeholder)</h3>
      <div className="flex justify-end gap-2">
        <button className="px-3 py-1 border rounded" onClick={onClose}>
          Close
        </button>
        <button
          className="px-3 py-1 bg-blue-600 text-white rounded"
          onClick={() => {
            onUpload();
            onClose();
          }}
        >
          Upload
        </button>
      </div>
    </div>
  </div>
);

const CourseDetailsPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [activeTab, setActiveTab] = useState("Users");
  const [selected, setSelected] = useState<string[]>([]);
  const [showMassAction, setShowMassAction] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [completionDate, setCompletionDate] = useState("");
  const [roleSort, setRoleSort] = useState<"asc" | "desc" | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all");
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const navigate = useNavigate();
  const massActionRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  const tabs = ["Users", "Groups", "Branches", "Files"];

  // --- Select logic ---
  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selected.length === users.length) {
      setSelected([]);
    } else {
      setSelected(users.map((u) => u.id));
    }
  };

  // --- Mass actions ---
  const applyMassAction = (action: string) => {
    if (action === "Unenroll") {
      setUsers((prev) => prev.filter((u) => !selected.includes(u.id)));
    } else if (action === "Reset") {
      setUsers((prev) =>
        prev.map((u) =>
          selected.includes(u.id) ? { ...u, progress: 0, completionDate: "-" } : u
        )
      );
    } else if (action === "Complete") {
      const today = new Date().toISOString().split("T")[0];
      setUsers((prev) =>
        prev.map((u) =>
          selected.includes(u.id)
            ? { ...u, progress: 100, completionDate: today }
            : u
        )
      );
    }
    setSelected([]);
    setShowMassAction(false);
  };

  // --- Row actions ---
  const handleRowAction = (id: string, action: string) => {
    if (action === "Unenroll") {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } else if (action === "Reset") {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, progress: 0, completionDate: "-" } : u
        )
      );
    } else if (action === "Complete") {
      const user = users.find((u) => u.id === id);
      if (user) {
        setActiveUser(user);
        setCompletionDate(new Date().toISOString().split("T")[0]);
        setShowCompleteModal(true);
      }
    } else if (action === "Preview") {
      alert(`Previewing user: ${users.find((u) => u.id === id)?.name}`);
    }
  };

  const saveCompletion = () => {
    if (!activeUser) return;
    setUsers((prev) =>
      prev.map((u) =>
        u.id === activeUser.id ? { ...u, progress: 100, completionDate } : u
      )
    );
    setShowCompleteModal(false);
    setActiveUser(null);
  };

  const handleFilterSelect = (status: string) => {
    console.log("Selected filter:", status);
    // map provided status to local activeFilter value if needed
    const s = status.toLowerCase();
    if (s === "active") setActiveFilter("active");
    else if (s === "inactive") setActiveFilter("inactive");
    else setActiveFilter("all");
    setFilterOpen(false);
  };

  // --- Close dropdowns when clicking outside ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        massActionRef.current &&
        !massActionRef.current.contains(event.target as Node)
      ) {
        setShowMassAction(false);
      }
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Sort users ---
  const sortedUsers = [...users].sort((a, b) => {
    if (!roleSort) return 0;
    if (roleSort === "asc") return a.role.localeCompare(b.role);
    return b.role.localeCompare(a.role);
  });

  const showNoResults = sortedUsers.length === 0;
  // used in the Download button condition in your original snippet
  const showEmptyUsers = users.length === 0;

  // --- Download handler (CSV) ---
  const handleDownload = () => {
    if (users.length === 0) {
      alert("No users to download.");
      return;
    }

    const headers = ["id", "name", "role", "progress", "enrollmentDate", "completionDate", "expirationDate"];
    const rows = users.map((u) =>
      [u.id, u.name, u.role, `${u.progress}`, u.enrollmentDate, u.completionDate, u.expirationDate]
    );

    const csvContent =
      [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "users.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // --- Empty state renderer ---
  const renderEmptyState = (
    type: "courses" | "groups" | "branches" | "files",
    onAction?: () => void
  ) => {
    const config = {
      courses: {
        title: "No courses available",
        subtitle: "Enroll users to a course to get started",
        buttonText: "Enroll user",
        img: emptyIllustration,
      },
      groups: {
        title: "No groups available",
        subtitle: "Add this user to a group to get started",
        buttonText: "Add to group",
        img: emptyIllustration,
      },
      branches: {
        title: "No branches available",
        subtitle: "Branches will appear here when added",
        buttonText: "Add branch",
        img: emptyIllustration,
      },
      files: {
        title: "No files available",
        subtitle: "Upload files for this user to get started",
        buttonText: "Upload files",
        img: emptyFilesIllustration,
      },
    };

    const { title, subtitle, buttonText, img } = config[type];

    return (
      <div className="flex flex-col items-center justify-center ">
        <img src={img} alt={title} className="w-80 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500 mb-6">{subtitle}</p>
        {onAction && (
          <button
            onClick={onAction}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors duration-200"
          >
            {buttonText}
          </button>
        )}
      </div>
    );
  };

  // Dummy modal handlers for now
  const handleEnroll = () => setIsEnrollModalOpen(false);
  const handleAddToGroup = () => setIsGroupModalOpen(false);
  const handleUpload = () => setIsUploadModalOpen(false);

  return (
    <div className="min-h-screen bg-white p-1">
      <div className="p-1 text-sl font-medium">
        <button
          onClick={() => navigate("/courses")}
          className="text-blue-600 hover:underline"
        >
          Courses
        </button>
      </div>
      <h1 className="text-2xl font-semibold p-2 mb-4">Cyber</h1>

      {/* Tabs */}
      <div className="border-b flex gap-6 mb-3">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 ${
              activeTab === tab
                ? "border-b-2 border-blue-500 text-blue-600 font-medium"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Search & Actions */}
      <div className="flex justify-between items-center mb-3 relative">
        <div className="flex gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              className="border rounded-md pl-4 pr-8 py-2.5 text-sm w-64"
            />
            <Search className="absolute right-3 top-2 h-5 w-4 text-gray-700" />
          </div>

          {/* Filter */}
          <div className="relative inline-block text-left" ref={filterRef}>
            <button
              onClick={() => setFilterOpen((prev) => !prev)}
              className="rounded-md px-3 py-3 flex items-center text-gray-600 hover:bg-blue-200"
            >
              <Filter className="w-4 h-4" />
            </button>
            {filterOpen && (
              <ul className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                <li>
                  <button
                    onClick={() => handleFilterSelect("Active")}
                    className="flex w-full items-center px-3 py-2 text-sm hover:bg-blue-50"
                  >
                    👤 Active
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleFilterSelect("Inactive")}
                    className="flex w-full items-center px-3 py-2 text-sm hover:bg-blue-50"
                  >
                    👤 Inactive
                  </button>
                </li>
              </ul>
            )}
          </div>
        </div>

        <div className="flex gap-3 items-center">
          {activeTab === "Users" && selected.length > 0 && (
            <div className="relative" ref={massActionRef}>
              <button
                onClick={() => setShowMassAction(!showMassAction)}
                className="flex items-center bg-blue-600 text-white px-4 py-2 rounded shadow"
              >
                Mass Action ▼
              </button>

              {showMassAction && (
                <div className="absolute right-0 mt-2 w-44 bg-white border rounded shadow-md z-10">
                  <button
                    onClick={() => applyMassAction("Unenroll")}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-blue-200"
                  >
                    Unenroll
                  </button>
                  <button
                    onClick={() => applyMassAction("Reset")}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-blue-200"
                  >
                    Reset Progress
                  </button>
                  <button
                    onClick={() => applyMassAction("Complete")}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-blue-200"
                  >
                    Mark Complete
                  </button>
                </div>
              )}
            </div>
          )}
          <button
            onClick={() => setIsEnrollModalOpen(true)}
            className="text-blue-600 text-sm flex items-center gap-1 hover:underline"
          >
            <UserPlus className="h-4 w-4" /> Enroll to course
          </button>
        </div>
      </div>

      {/* Tab content */}
      {activeTab === "Users" ? (
        showNoResults ? 
        (
          renderEmptyState("courses", () => setIsEnrollModalOpen(true))
        ) : (
          <div className="overflow-x-auto border rounded-md">
            <table className="w-full text-sm">
              <thead className="bg-gray-200 text-left text-gray-900">
                <tr>
                  <th className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={selected.length === users.length && users.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-4 py-2">User</th>
                  <th
                    className="px-4 py-2 cursor-pointer select-none"
                    onClick={() =>
                      setRoleSort((prev) => (prev === "asc" ? "desc" : "asc"))
                    }
                  >
                    Role
                    <span className="inline-block ml-1">
                      {roleSort === "asc" ? "▲" : roleSort === "desc" ? "▼" : "▲"}
                    </span>
                  </th>
                  <th className="px-4 py-2">Progress status</th>
                  <th className="px-4 py-2">Enrollment date</th>
                  <th className="px-4 py-2">Completion date</th>
                  <th className="px-4 py-2">Expiration date</th>
                  <th className="px-4 py-2 text-right"></th>
                </tr>
              </thead>
              <tbody>
                {sortedUsers.map((u) => (
                  <tr key={u.id} className="border-t hover:bg-blue-50 transition group">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.includes(u.id)}
                        onChange={() => toggleSelect(u.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td
                      className="px-4 py-3 cursor-pointer"
                      onClick={() => navigate(`/users/${u.id}`)}
                    >
                      {u.name}
                    </td>
                    <td className="px-4 py-3 cursor-pointer">{u.role}</td>
                    <td className="px-4 py-3 cursor-pointer">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${u.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">{u.progress}%</span>
                    </td>
                    <td className="px-4 py-3">{u.enrollmentDate}</td>
                    <td className="px-4 py-3">{u.completionDate}</td>
                    <td className="px-4 py-3">{u.expirationDate}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-4 justify-end opacity-0 group-hover:opacity-100 transition">
                        <Eye
                          className="h-5 w-5 cursor-pointer text-gray-900 hover:text-blue-700"
                          onClick={() => navigate(`/userdetails/user/${u.id}`)}
                        />
                        <UserMinus
                          className="h-5 w-5 cursor-pointer text-gray-900 hover:text-blue-700"
                          onClick={() => handleRowAction(u.id, "Unenroll")}
                        />
                        <RotateCcw
                          className="h-5 w-5 cursor-pointer text-gray-900 hover:text-blue-700"
                          onClick={() => handleRowAction(u.id, "Reset")}
                        />
                        <FileCheck
                          className="h-5 w-5 cursor-pointer text-gray-900 hover:text-blue-700"
                          onClick={() => handleRowAction(u.id, "Complete")}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : activeTab === "Groups" ? (
        renderEmptyState("groups")
      ) : activeTab === "Branches" ? (
        renderEmptyState("branches")
      ) : (
        renderEmptyState("files")
      )}

      {/* ✅ Show Download button only when tab = "Users" AND not empty/no results */}
      {activeTab === "Users" && !showNoResults && !showEmptyUsers && (
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-3 py-2 bg-white text-black  rounded hover:bg-blue-100 mt-3"
        >
          <Download className="w-4 h-4" />
          
        </button>
      )}

      {/* ✅ Complete Course Modal */}
      {showCompleteModal && activeUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-96 rounded shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Complete Course</h2>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Enrollment date</label>
              <input
                type="text"
                value={activeUser.enrollmentDate}
                readOnly
                className="w-full border rounded px-3 py-2 bg-gray-100"
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Completion date</label>
              <input
                type="date"
                value={completionDate}
                onChange={(e) => setCompletionDate(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowCompleteModal(false)}
                className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={saveCompletion}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals placeholders */}
      {isEnrollModalOpen && (
        <EnrollToCourseModal onClose={() => setIsEnrollModalOpen(false)} onEnroll={handleEnroll} />
      )}
      {isGroupModalOpen && (
        <AddGroupModal onClose={() => setIsGroupModalOpen(false)} onAddToGroup={handleAddToGroup} />
      )}
      {isUploadModalOpen && (
        <UploadFilesModal onClose={() => setIsUploadModalOpen(false)} onUpload={handleUpload} />
      )}
    </div>
  );
};

export default CourseDetailsPage;
