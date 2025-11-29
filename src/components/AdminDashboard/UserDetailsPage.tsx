import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Filter,
  Eye,
  UserMinus,
  Plus,
  ChevronDown,
} from "lucide-react";
import EnrollToCourseModal from "./EnrollToCourseModal";
import AddGroupModal from "./AddGroupModal";
import UploadFilesModal from "./UploadFilesModal";
import emptyCoursesIllustration from "../assets/addcourse.png";
import emptyIllustration from "../assets/group.png";
import emptyFilesIllustration from "../assets/files.png";
import noresultIllustration from "../assets/noresult.png";
import { useNavigate, useParams } from "react-router-dom";
import AddUserForm from "./AddUser";
import axios from "axios";

type User = {
  firstName: string;
  lastName: string;
};

type Course = {
  id: string;
  title: string;
  code: string;
  role: string;
  enrolled: string;
  completed: string;
  isActive: boolean;
};

type Group = {
  id: string;
  name : string;
  courses: Course[];
};

type Tab = "Courses" | "Groups" | "Files" | "Info";

export default function UserDetailsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Courses");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [massOpen, setMassOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [roleSort, setRoleSort] = useState<"asc" | "desc" | null>(null);
  const [activeFilter, setActiveFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  

  const dropdownRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const tabs: Tab[] = ["Courses", "Groups", "Files", "Info"];

  const [courses, setCourses] = useState<Course[]>([
    {
      id: "1",
      title: "[Edit me] Guide for Learners",
      code: "001",
      role: "Learner",
      enrolled: "1 minute ago",
      completed: "-",
      isActive: true,
    },
    {
      id: "2",
      title: "What is TalentLibrary?",
      code: "002",
      role: "Learner",
      enrolled: "1 hour ago",
      completed: "-",
      isActive: true,
    },
  ]);

  const [groups, setGroups] = useState<Group[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

  // Fetch user from API
  useEffect(() => {
  const fetchUser = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/api/user/${id}`);
      setUser(res.data);
    } catch (err) {
      console.error("Error fetching user:", err);
      setError("Failed to load user data.");
    } finally {
      setLoading(false);
    }
  };
  if (id) fetchUser();
}, [id]);

  // Toggle selection functions
  const toggleSelectCourse = (id: string) => {
    setSelectedCourses((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  const toggleAllCourses = () => {
    setSelectedCourses(
      selectedCourses.length === courses.length
        ? []
        : courses.map((c) => c.id)
    );
  };
  const toggleSelectGroup = (id: string) => {
    setSelectedGroups((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  const toggleAllGroups = () => {
    setSelectedGroups(
      selectedGroups.length === groups.length ? [] : groups.map((g) => g.id)
    );
  };

  const handleUnroll = (id: string) => {
    setCourses((prev) => prev.filter((course) => course.id !== id));
    setSelectedCourses((prev) => prev.filter((sid) => sid !== id));
  };

  const handleEnroll = (course: Course) => {
    if (!courses.some((c) => c.id === course.id))
      setCourses([...courses, course]);
    setIsEnrollModalOpen(false);
  };

  const handleAddToGroup = (group: { id: string; name: string }) => {
    console.log("Added to group:", group);
    setIsGroupModalOpen(false);
  };

  const handleUpload = (files: File[]) => {
    console.log("Uploaded files:", files);
    setIsUploadModalOpen(false);
  };

  const handleMassAction = (action: string) => {
    if (activeTab === "Courses") {
      console.log(`Mass action on courses: ${action}`, selectedCourses);
      if (action === "Delete") {
        setCourses((prev) => prev.filter((c) => !selectedCourses.includes(c.id)));
        setSelectedCourses([]);
      }
    } else if (activeTab === "Groups") {
      console.log(`Mass action on groups: ${action}`, selectedGroups);
      if (action === "Delete") {
        setGroups((prev) => prev.filter((g) => !selectedGroups.includes(g.id)));
        setSelectedGroups([]);
      }
    }
    setMassOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setMassOpen(false);
      if (filterRef.current && !filterRef.current.contains(e.target as Node))
        setFilterOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const sortedCourses = [...courses]
    .filter((c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((c) =>
      activeFilter === "active"
        ? c.isActive
        : activeFilter === "inactive"
        ? !c.isActive
        : true
    )
    .sort((a, b) => {
      if (!roleSort) return 0;
      return roleSort === "asc"
        ? a.role.localeCompare(b.role)
        : b.role.localeCompare(a.role);
    });

  const sortedGroups = [...groups].filter((g) =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const showNoResults = sortedCourses.length === 0;

  const renderEmptyState = (
    type: "courses" | "groups" | "files",
    onAction?: () => void
  ) => {
    const config = {
      courses: {
        title: "No courses available",
        subtitle: "Enroll this user to a course to get started",
        buttonText: "Enroll to course",
        img: emptyCoursesIllustration,
      },
      groups: {
        title: "No groups available",
        subtitle: "Add this user to a group to get started",
        buttonText: "Add to group",
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
      <div className="flex flex-col items-center justify-center py-8">
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

  if (loading)
    return <div className="p-6 text-gray-600">Loading user details...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!user) return <div className="p-6 text-gray-600">No user found.</div>;

  return (
    <div className="p-6 bg-white min-h-screen">
      <button className="text-blue-500" onClick={() => navigate(`/users`)}>
        Users
      </button>
      <div className="flex justify-between items-start mb-6">
        <h1 className="text-2xl font-semibold">
          {user?.firstname || "First"} {user?.lastname || "Last"}
        </h1>
        <button
          onClick={() => {
            setEditingUser(user);
            setIsEditingUser(true);
            setActiveTab("Info");
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Edit user
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b mb-6 flex space-x-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-medium transition ${
              activeTab === tab
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-blue-600"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ==================== Courses Tab ==================== */}
      {activeTab === "Courses" && (
        <div>
          {courses.length > 0 && (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search"
                    className="pl-4 pr-10 py-2 border rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="relative" ref={filterRef}>
                  <button
                    onClick={() => setFilterOpen(prev => !prev)}
                    className="flex items-center gap-2 px-3 py-2 rounded bg-white hover:bg-blue-50 transition"
                  >
                    <Filter className="w-4 h-4" />
                  </button>
                  {filterOpen && (
                    <ul className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                      {["all", "active", "inactive"].map(f => (
                        <li key={f}>
                          <button
                            onClick={() => { setActiveFilter(f as any); setFilterOpen(false); }}
                            className={`flex w-full items-center px-3 py-2 text-sm hover:bg-blue-50 ${activeFilter === f ? "bg-blue-50 text-blue-600 font-medium" : ""}`}
                          >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <button onClick={() => setIsEnrollModalOpen(true)} className="ml-auto flex items-center text-blue-600 font-medium hover:text-blue-700 transition">
                  <Plus className="w-4 h-4 mr-1" /> Enroll to course
                </button>
              </div>

              {selectedCourses.length > 0 && (
                <div className="relative inline-block mb-4" ref={dropdownRef}>
                  <button onClick={() => setMassOpen(!massOpen)} className="flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                    Mass actions
                    <span className="ml-2 bg-white text-blue-600 text-xs font-medium px-2 py-0.5 rounded-full">{selectedCourses.length}</span>
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </button>
                  {massOpen && (
                    <div className="absolute mt-2 bg-white border rounded shadow-lg w-56 z-10">
                      <ul className="text-sm">
                        {["Activate","Deactivate","Delete","Add to branch","Remove from branch","Add to group","Remove from group","Send message"].map(action => (
                          <li key={action} className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => handleMassAction(action)}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {showNoResults && courses.length > 0 ? (
            <div className="flex flex-col items-center justify-center py-5">
              <img src={noresultIllustration} alt="No results" className="w-80 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{activeFilter === "inactive" ? "No inactive courses found" : "No results found"}</h3>
              <p className="text-gray-500">{activeFilter === "inactive" ? "There are no inactive courses for this user" : "Try adjusting your search or filter"}</p>
            </div>
          ) : courses.length === 0 ? (
            renderEmptyState("courses", () => setIsEnrollModalOpen(true))
          ) : (
            <div className="border rounded-lg overflow-hidden bg-white">
              <table className="w-full text-sm">
                <thead className="bg-gray-200 text-left text-gray-900">
                  <tr>
                    <th className="p-3 w-10">
                      <input type="checkbox" checked={selectedCourses.length === courses.length} onChange={toggleAllCourses} />
                    </th>
                    <th className="p-3 text-left">Course</th>
                    <th className="p-3 text-left">Code</th>
                    <th className="p-3 text-left cursor-pointer select-none" onClick={() => setRoleSort(prev => prev === "asc" ? "desc" : "asc")}>
                      Role <span className="inline-block ml-1">{roleSort === "asc" ? "▲" : roleSort === "desc" ? "▼" : "▲"}</span>
                    </th>
                    <th className="p-3 text-left">Enrolled date</th>
                    <th className="p-3 text-left">Completion date</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {sortedCourses.map(course => (
                    <tr key={course.id} className={`border-t hover:bg-blue-50 transition ${selectedCourses.includes(course.id) ? "bg-blue-50" : ""}`} onClick={() => navigate(`/coursedetails/${course.id}`)}>
                      <td className="p-3">
                        <input type="checkbox" checked={selectedCourses.includes(course.id)} onChange={(e) => { e.stopPropagation(); toggleSelectCourse(course.id); }} />
                      </td>
                      <td className="p-3">{course.title}</td>
                      <td className="p-3">{course.code}</td>
                      <td className="p-3">{course.role}</td>
                      <td className="p-3">{course.enrolled}</td>
                      <td className="p-3">{course.completed}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="relative group/icon">
                            <button className="p-2 rounded-md hover:bg-blue-50 transition-colors duration-200" onClick={(e) => { e.stopPropagation(); navigate(`/coursedetails/${course.id}`); }}>
                              <Eye className="h-5 w-5 text-gray-700 group-hover/icon:text-blue-600 transition-colors duration-200" />
                            </button>
                          </div>
                          <div className="relative group/icon">
                            <button onClick={(e) => { e.stopPropagation(); handleUnroll(course.id); }} className="p-2 rounded-md hover:bg-blue-50 transition-colors duration-200">
                              <UserMinus className="h-5 w-5 text-gray-700 group-hover/icon:text-red-600 transition-colors duration-200" />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ==================== Groups Tab ==================== */}
      {activeTab === "Groups" && (
        <div>
          {sortedGroups.length === 0 ? renderEmptyState("groups", () => setIsGroupModalOpen(true)) : (
            <div className="border rounded-lg overflow-hidden bg-white">
              <table className="w-full text-sm">
                <thead className="bg-gray-200 text-left text-gray-900">
                  <tr>
                    <th className="p-3 w-10">
                      <input type="checkbox" checked={selectedGroups.length === groups.length} onChange={toggleAllGroups} />
                    </th>
                    <th className="p-3 text-left">Group</th>
                    <th className="p-3 text-left">Group Courses</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {sortedGroups.map(group => (
                    <tr key={group.id} className="border-t hover:bg-blue-50 transition">
                      <td className="p-3">
                        <input type="checkbox" checked={selectedGroups.includes(group.id)} onChange={(e) => { e.stopPropagation(); toggleSelectGroup(group.id); }} />
                      </td>
                      <td className="p-3">{group.name}</td>
                      <td className="p-3">{group.courses?.length || 0}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="relative group/icon">
                            <button className="p-2 rounded-md hover:bg-blue-50 transition-colors duration-200" onClick={(e) => { e.stopPropagation(); navigate(`/groupsmainpage/${group.id}`); }}>
                              <Eye className="h-5 w-5 text-gray-700 group-hover/icon:text-blue-600 transition-colors duration-200" />
                            </button>
                          </div>
                          <div className="relative group/icon">
                            <button onClick={(e) => e.stopPropagation()} className="p-2 rounded-md hover:bg-blue-50 transition-colors duration-200">
                              <UserMinus className="h-5 w-5 text-gray-700 group-hover/icon:text-red-600 transition-colors duration-200" />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ==================== Files Tab ==================== */}
      {activeTab === "Files" && renderEmptyState("files", () => setIsUploadModalOpen(true))}
      

      {/* ==================== Info Tab ==================== */}
      {activeTab === "Info" && (
        <div className="p-6">
          {!isEditingUser ? (
            <>
              <p className="text-gray-600 mb-4">User information will be displayed here.</p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition" onClick={() => { setEditingUser(user); setIsEditingUser(true); }}>Edit user</button>
            </>
          ) : (
            <AddUserForm
              user={editingUser}
              onCancel={() => setIsEditingUser(false)}
              onSave={(updatedUser: User) => { console.log("Updated user:", updatedUser); setIsEditingUser(false); }}
            />
          )}
        </div>
      )}

       {isEnrollModalOpen && (
        <EnrollToCourseModal
          onClose={() => setIsEnrollModalOpen(false)}
          onEnroll={handleEnroll}
        />
      )}
      {isGroupModalOpen && (
        <AddGroupModal
          onClose={() => setIsGroupModalOpen(false)}
          onAddToGroup={handleAddToGroup}
        />
      )}
      {isUploadModalOpen && (
        <UploadFilesModal
          onClose={() => setIsUploadModalOpen(false)}
          onUpload={handleUpload}
        />
      )}
    </div>
  );
}

