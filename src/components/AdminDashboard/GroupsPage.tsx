import React, { useState, useEffect, useRef } from "react";
import { Search, Eye, Edit, Trash2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AddGroupForm from "./AddGroupForm";
import emptyIllustration from "../assets/group.png";
import noresultIllustration from "../assets/noresult.png";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";

interface Group {
  id: number;
  name: string;
  description?: string;
  branch?: string;
  date?: Date; // string for consistency with backend
  autoEnroll?: boolean;
  groupKey?: string;
}

const GroupsPage: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editGroup, setEditGroup] = useState<Group | undefined>(undefined);
  const [deleteGroup, setDeleteGroup] = useState<Group | null>(null);
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
  const [massActionOpen, setMassActionOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showMassDeleteModal, setShowMassDeleteModal] = useState(false);

  const massActionRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

 const fetchGroups = async () => {
  try {
    setLoading(true);
    const res = await axios.get("http://localhost:3000/api/group");
    const data: Group[] = res.data.map((g: any) => ({
      ...g,
      date: g.date ? new Date(g.date) : undefined, // convert to Date
    }));
    setGroups(data);
  } catch (err) {
    console.error("Fetch groups error:", err);
    toast.error("Failed to load groups");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (massActionRef.current && !massActionRef.current.contains(e.target as Node)) {
        setMassActionOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleSelectGroup = (id: number) => {
    setSelectedGroups(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleDelete = (group: Group) => setDeleteGroup(group);

  const confirmDelete = async () => {
    if (!deleteGroup) return;
    try {
      await axios.delete(`http://localhost:3000/api/group/${deleteGroup.id}`);
      toast.success("Group deleted successfully");
      fetchGroups();
      setSelectedGroups(prev => prev.filter(id => id !== deleteGroup.id));
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete group");
    } finally {
      setDeleteGroup(null);
    }
  };

  const handleMassDelete = () => {
    if (selectedGroups.length === 0) return toast.error("No groups selected");
    setShowMassDeleteModal(true);
  };

  const confirmMassDelete = async () => {
    try {
      await axios.post("http://localhost:3000/api/group/deleteMany", { ids: selectedGroups });
      toast.success("Selected groups deleted");
      fetchGroups();
      setSelectedGroups([]);
    } catch (err) {
      console.error("Mass delete error:", err);
      toast.error("Failed to delete selected groups");
    } finally {
      setShowMassDeleteModal(false);
    }
  };

  const filteredGroups = groups.filter(g =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (showAddForm) {
    return (
      <>
        <AddGroupForm
          onBack={async () => {
            setShowAddForm(false);
            setEditGroup(undefined);
            await fetchGroups();
          }}
          groups={groups}
          setGroups={setGroups}
          editGroup={editGroup}
        />
        <Toaster position="top-right" />
      </>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center justify-start px-6 py-10 relative">
      <Toaster position="top-right" />
      <div className="w-full max-w-6xl">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">Groups</h1>

        {loading ? (
          <div className="flex items-center justify-center mt-10 text-gray-600">
            Loading groups...
          </div>
        ) : groups.length === 0 ? (
          <div className="flex flex-col items-center text-center space-y-6 max-w-md mx-auto mt-10">
            <img src={emptyIllustration} alt="No groups" className="w-80 mb-4" />
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900">There are no groups yet!</h2>
            <p className="text-gray-600 text-base md:text-lg">
              Groups allow you to assign sets of courses to several users at once.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md font-medium transition-colors duration-200"
            >
              Add group
            </button>
          </div>
        ) : (
          <>
            {/* Controls */}
            <div className="flex items-center justify-between mb-3">
              <div className="relative w-64">
                <Search className="absolute right-3 top-2.5 text-black w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full border border-blue-800 rounded-md px-4 py-2 pl-5 text-sm focus:ring-2 focus:ring-blue-800 focus:border-blue-800"
                />
              </div>

              <div className="flex items-center space-x-3">
                <div className="relative" ref={massActionRef}>
                  <button
                    onClick={() => setMassActionOpen(prev => !prev)}
                    className="border border-blue-500 text-blue-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-50 flex items-center"
                  >
                    Mass actions <span className="ml-2">▼</span>
                  </button>
                  {massActionOpen && (
                    <div className="absolute top-full right-0 bg-white border border-gray-300 rounded-md shadow-lg mt-1 w-44 z-10">
                      <button onClick={handleMassDelete} className="w-full px-4 py-2 text-left hover:bg-gray-100">Delete selected</button>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Add group
                </button>
              </div>
            </div>

            {/* Table */}
            {filteredGroups.length > 0 ? (
              <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200 text-left">
                    <tr>
                      <th className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedGroups.length === filteredGroups.length && filteredGroups.length > 0}
                          onChange={() => setSelectedGroups(
                            selectedGroups.length === filteredGroups.length ? [] : filteredGroups.map(g => g.id)
                          )}
                          className="w-4 h-4"
                        />
                      </th>
                      <th className="px-6 py-3">Group</th>
                      <th className="px-6 py-3">Description</th>
                      <th className="px-6 py-3">Created on</th>
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGroups.map((group, idx) => (
                      <tr
                        key={group.id}
                        className={`${idx % 2 === 0 ? "bg-blue-50" : "bg-white"} hover:bg-gray-100 transition`}
                      >
                        {/* Checkbox */}
                        <td className="px-6 py-3" onClick={e => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedGroups.includes(group.id)}
                            onChange={e => {
                              e.stopPropagation();
                              toggleSelectGroup(group.id);
                            }}
                            className="w-4 h-4"
                          />
                        </td>

                        {/* Group Name */}
                        <td
                          className="px-6 py-3 cursor-pointer"
                          onClick={() => navigate(`/groupsmainpage`)}
                        >
                          {group.name}
                        </td>

                        {/* Description */}
                        <td
                          className="px-6 py-3 cursor-pointer"
                          onClick={() => navigate(`/groupsmainpage`)}
                        >
                          {group.description || "-"}
                        </td>

                        {/* Created on */}
                        <td
                          className="px-6 py-3 cursor-pointer"
                          onClick={() => navigate(`/groupsmainpage/${group.id}`)}
                        >
                          {group.date ? new Date(group.date).toLocaleDateString() : "-"}
                        </td>

                        {/* Action Buttons */}
                        <td className="px-6 py-3 flex items-center space-x-3" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => navigate(`/groupsmainpage`)}
                            className="text-gray-600 hover:text-blue-600"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditGroup(group);
                              setShowAddForm(true);
                            }}
                            className="text-gray-600 hover:text-blue-600"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(group)}
                            className="text-gray-600 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center mt-10">
                <img src={noresultIllustration} alt="No results" className="w-80 mb-4" />
                <h1 className="text-2xl font-bold">No results found</h1>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Modal */}
      {deleteGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-md shadow-lg p-6 w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Confirm Delete</h2>
              <button onClick={() => setDeleteGroup(null)}>
                <X className="w-5 h-5 text-gray-600 hover:text-red-600" />
              </button>
            </div>
            <p className="mb-6">Are you sure you want to delete "{deleteGroup.name}"?</p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setDeleteGroup(null)} className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Mass Delete Modal */}
      {showMassDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-md shadow-lg p-6 w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Confirm Mass Delete</h2>
              <button onClick={() => setShowMassDeleteModal(false)}>
                <X className="w-5 h-5 text-gray-600 hover:text-red-600" />
              </button>
            </div>
            <p className="mb-6">Are you sure you want to delete {selectedGroups.length} selected group(s)?</p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowMassDeleteModal(false)} className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300">Cancel</button>
              <button onClick={confirmMassDelete} className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupsPage;
