import React, { useState, useEffect } from "react";
import { Search, X, UserPlus, ChevronDown } from "lucide-react";
import axios from "axios";
import UserDetailsPage from "./UserDetailsPage";
import toast from "react-hot-toast";

type Group = {
  id: string;
  name: string;
};

interface AddToGroupModalProps {
  onClose: () => void;
  onAddToGroup: (group: Group) => void;
  refreshGroups?: () => void; // optional refresh callback
}

export default function AddGroupModal({
  onClose,
  onAddToGroup,
}: AddToGroupModalProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [adding, setAdding] = useState<string | null>(null);

  // ✅ Animate modal on mount
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // ✅ Fetch all groups from backend
  useEffect(() => {
    const fetchGroups = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await axios.get("http://localhost:3000/api/group");
      console.log("✅ API Response:", res.data);

      // Ensure we have a valid array
      const groupsArray = Array.isArray(res.data) ? res.data : [];
      console.log("✅ groupsArray:", groupsArray);

      // Normalize and map the group data
      const groupData: Group[] = groupsArray.map((item: any) => {
        const groupObj = item.group || item;

        return {
          id: String(groupObj.id || item._id || ""),
          name:String(
            groupObj.name ||
            groupObj.groupName ||
            item.name ||
            item.groupName ||
            "Unnamed Group"),
        };
      });

      // Update state
      setAllGroups(groupData);
      setGroups(groupData);

      console.log("📦 Mapped Groups:", groupData);
    } catch (err) {
      console.error("❌ Error fetching groups:", err);
      setError("Failed to fetch groups. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

    fetchGroups();
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  // ✅ Handle adding user to group
  
const handleAddToGroup = async (group: Group) => {
  try {
    setAdding(group.id);

    // ✅ Retrieve user ID safely
    const groupId = localStorage.getItem("groupId");
    if (!groupId) {
      toast.error("group ID not found. Please log in again.");
      return;
    }

    // ✅ Send API request
    const response = await axios.post("http://localhost:3000/api/group", {
      
      groupId,
    });
      

    // ✅ Call parent callback
    if (onAddToGroup) {
      onAddToGroup(group);
    }

    toast.success(`User successfully added to "${group.name}"!`);
  } catch (error: any) {
    console.error("Error adding user to group:", error);
    const message =
      error.response?.data?.message || "Failed to add user to group. Please try again.";
    toast.error(message);
  } finally {
    setAdding(null);
  }
};
  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 bg-black z-50 transition-opacity duration-300"
      style={{ backgroundColor: `rgba(0, 0, 0, ${isVisible ? "0.5" : "0"})` }}
      onClick={handleClose}
    >
      <div
        className={`fixed right-0 top-0 h-full bg-white w-full max-w-2xl shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          isVisible ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Add to group</h2>
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
              <span className="font-medium">Groups</span>
              <ChevronDown
                className={`w-5 h-5 transition-transform ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />
            </button>

            {isExpanded && (
              <div className="divide-y">
                {loading && (
                  <p className="p-4 text-gray-500">Loading groups...</p>
                )}
                {error && <p className="p-4 text-red-500">{error}</p>}
                {!loading && !error && filteredGroups.length === 0 && (
                  <p className="p-4 text-gray-500">No groups found</p>
                )}
                {!loading &&
                  !error &&
                  filteredGroups.map((group) => (
                    <div
                      key={group.id}
                      className="flex items-center justify-between p-4 hover:bg-gray-50 transition"
                    >
                      <span className="text-gray-900">{group.name}</span>
                      <button
                        onClick={() => handleAddToGroup(group)}
                        disabled={adding === group.id}
                        className={`p-2 rounded transition ${
                          adding === group.id
                            ? "bg-blue-100 cursor-not-allowed"
                            : "hover:bg-blue-50"
                        }`}
                      >
                        <UserPlus
                          className={`w-5 h-5 ${
                            adding === group.id
                              ? "text-blue-400 animate-pulse"
                              : "text-gray-700"
                          }`}
                        />
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


