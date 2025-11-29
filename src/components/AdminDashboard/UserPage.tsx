import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  ChevronDown,
  Download,
  Eye,
  Edit,
  LogInIcon,
  Trash2,
  PieChartIcon,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import noresultIllustration from "../assets/noresult.png";

interface User {
  id: string;
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  usertype: string;
  created_at: string;
  last_login: string;
}

interface PendingUserAction {
  action: "add" | "edit" | "delete";
  user: User | null;
  id: string;
}

export default function UsersPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const newOrEditedUser: User | null = location.state?.user || null;

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem("users");
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("All");
  const [showFilter, setShowFilter] = useState(false);

  // ✅ Modal state for delete confirmation
  const [confirmDeleteUserId, setConfirmDeleteUserId] = useState<string | null>(null);

    const fetchUsers = async (highlightAfterUpdate = false, updatedUserId?: string) => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:3000/api/user/all");
        if (!Array.isArray(res.data)) throw new Error("Invalid data format");

        const sorted = res.data
          .filter((u: any) => u && u.id)
          .map((u: User) => ({
            ...u,
            id: u.id.toString(),
            last_login: u.last_login || "",
          }))
          .sort(
            (a: User, b: User) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );

        setUsers(sorted);
        localStorage.setItem("users", JSON.stringify(sorted));

        if (highlightAfterUpdate && updatedUserId) {
          setHighlightId(updatedUserId);
          setTimeout(() => setHighlightId(null), 3000);
        }
      } catch (err) {
        console.error("❌ Failed to fetch users:", err);
        const localData = localStorage.getItem("users");
        if (!localData || JSON.parse(localData).length === 0) {
          toast.error("Failed to load users");
        } else {
          setUsers(JSON.parse(localData));
        }
      } finally {
        setLoading(false);
      }
    };

 const handleDeleteUser = async (userId: string, username?: string) => {
  try {
    await axios.delete(`http://localhost:3000/api/user/${userId}`);
    toast.success(`User ${username || userId} deleted successfully`);
  } catch (err: any) {
    console.warn("❌ Failed to delete user from server, removing locally:", err);
    const pendingSync: PendingUserAction[] = JSON.parse(localStorage.getItem("pendingSync") || "[]");
    pendingSync.push({ action: "delete", user: null, id: userId });
    localStorage.setItem("pendingSync", JSON.stringify(pendingSync));
    toast("🕓 User deletion queued (offline mode)", { icon: "📦" });
  } finally {
    // ✅ Always remove from local state
    setUsers((prev) => {
      const updated = prev.filter((u) => u.id !== userId);
      localStorage.setItem("users", JSON.stringify(updated));
      return updated;
    });

    setConfirmDeleteUserId(null);
  }
};


  const syncLocalToServer = async () => {
    const pending: PendingUserAction[] = JSON.parse(localStorage.getItem("pendingSync") || "[]");
    if (pending.length === 0) return;

    for (const item of pending) {
      try {
        if (item.action === "delete") {
          await axios.delete(`http://localhost:3000/api/user/${item.id}`);
        } else if (item.action === "edit") {
          await axios.put(`http://localhost:3000/api/user/${item.id}`, item.user);
        } else if (item.action === "add") {
          await axios.post("http://localhost:3000/api/user", item.user);
        }
      } catch (err) {
        console.error("⚠️ Sync failed for", item, err);
        if (item.user?.id) {
          const name = item.user?.username || item.id;
          toast.error(`Sync failed for ${item.action} user ${name}`);
        }
        continue;
      }
    }

    localStorage.removeItem("pendingSync");
    toast.success("✅ Local changes synced to server");
    fetchUsers();
  };

  // ✅ Handle add/update user from navigation state
  useEffect(() => {
    if (newOrEditedUser) {
      const userId = newOrEditedUser.id.toString();

      setUsers((prev) => {
        const exists = prev.find((u) => u.id === userId);
        const updated = exists
          ? prev.map((u) => (u.id === userId ? newOrEditedUser : u))
          : [newOrEditedUser, ...prev];
        localStorage.setItem("users", JSON.stringify(updated));
        return updated;
      });

      const pendingSync: PendingUserAction[] = JSON.parse(localStorage.getItem("pendingSync") || "[]");
      if (!navigator.onLine) {
        const exists = users.some((u) => u.id === userId);
        pendingSync.push({ action: exists ? "edit" : "add", user: newOrEditedUser, id: userId });
        localStorage.setItem("pendingSync", JSON.stringify(pendingSync));
        toast("Offline mode: will sync later", { icon: "📡" });
      } else {
        syncLocalToServer();
      }

      fetchUsers(true, userId);
      window.history.replaceState({}, document.title);
    }
  }, [newOrEditedUser]);

  // ✅ Initial fetch + auto-sync
  useEffect(() => {
    const init = async () => {
      await fetchUsers();
      if (navigator.onLine) await syncLocalToServer();
    };
    init();
  }, []);

  // ✅ Auto-sync when network restored
  useEffect(() => {
    window.addEventListener("online", syncLocalToServer);
    return () => window.removeEventListener("online", syncLocalToServer);
  }, []);

  // ✅ Auto-refresh on tab focus
  useEffect(() => {
    const handleFocus = () => fetchUsers();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const formatTimeAgo = (dateString: string | null | undefined) => {
  if (!dateString || dateString === "null" || dateString === "undefined") return "Never";

  // Handle possible server date formats (ISO, timestamp, etc.)
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Never";

  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} minute${mins > 1 ? "s" : ""} ago`;
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  return `${days} day${days > 1 ? "s" : ""} ago`;
};

  // ✅ Filters
  const filteredUsers = users.filter((user) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = [user.username, user.email, user.firstname, user.lastname].some(
      (field) => field?.toLowerCase().includes(term)
    );
    const matchesType =
      filterType === "All" || user.usertype.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesType;
  });

  // ✅ Handlers
  const handleAddUser = () => navigate("/adduser");
  const handleEditUser = (user: User) => navigate("/adduser", { state: { user } });
  const handleRowClick = (userId: string) => navigate(`/userdetails/user/${userId}`);

  // ✅ Download CSV
  const handleDownloadCSV = () => {
    if (filteredUsers.length === 0) return toast.error("No users to download");
    const headers = ["ID", "Username", "Email", "Type", "First Name", "Last Name", "Created At", "Last Login"];
    const csvRows = [
      headers.join(","),
      ...filteredUsers.map((u) =>
        [u.id, u.username, u.email, u.usertype, u.firstname, u.lastname, u.created_at, u.last_login ?? ""]
          .map((field) => `"${field}"`)
          .join(",")
      ),
    ];
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "users.csv";
    link.click();
    toast.success("Download started!");
  };

  
  // ✅ UI
  return (
    <div className="min-h-screen bg-white">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="max-w-full px-8 py-7">
        <h1 className="text-2xl font-medium mb-4">Users</h1>

        {/* Search & Filter */}
        <div className="flex items-center gap-3 mb-4 relative">
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-4 pr-10 py-2 border rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>

          <div className="relative">
            <button
              className="p-3 bg-white rounded-md hover:bg-blue-100 transition-colors flex items-center gap-1"
              onClick={() => setShowFilter(!showFilter)}
            >
              <Filter className="w-5 h-5 text-gray-600" />
              <ChevronDown className="w-4 h-4 text-gray-600" />
            </button>
            {showFilter && (
              <div className="absolute left-0 mt-2 w-40 bg-white border rounded-lg shadow-md z-10">
                {["All", "ADMIN", "SUPERADMIN", "USER"].map((type) => (
                  <div
                    key={type}
                    className={`px-4 py-2 text-sm cursor-pointer hover:bg-blue-50 ${
                      filterType === type ? "bg-blue-100 font-medium" : ""
                    }`}
                    onClick={() => {
                      setFilterType(type);
                      setShowFilter(false);
                    }}
                  >
                    {type}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1" />

          <div className="flex">
            <button
              onClick={handleAddUser}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-l-md hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              Add user
            </button>
            <button className="px-4 py-3 bg-blue-600 text-white border-l border-blue-500 rounded-r-md hover:bg-blue-700 transition-colors">
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg overflow-hidden">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading users...</div>
          ) : filteredUsers.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">User</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Registration</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Last login</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className={`group border-b border-gray-200 hover:bg-blue-50 transition-colors cursor-pointer ${
                      highlightId === user.id ? "bg-yellow-100" : ""
                    }`}
                    onClick={() => handleRowClick(user.id)}
                  >
                    <td className="px-6 py-4">{user.username}</td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">{user.usertype}</td>
                    <td className="px-6 py-4">{formatTimeAgo(user.created_at)}</td>
                    <td className="px-6 py-4">{formatTimeAgo(user.last_login)}</td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-4 justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Eye
                          className="h-5 w-5 cursor-pointer text-gray-900 hover:text-blue-700"
                          onClick={() => navigate(`/userdetails/user/${user.id}`)}
                        />
                        <Edit
                          className="h-5 w-5 cursor-pointer text-gray-900 hover:text-blue-700"
                          onClick={() => handleEditUser(user)}
                        />
                        <LogInIcon
                          className="h-5 w-5 cursor-pointer text-gray-900 hover:text-blue-700"
                          onClick={() => navigate(`/groupsmainpage`)}
                        />
                        <PieChartIcon
                          className="h-5 w-5 cursor-pointer text-gray-900 hover:text-blue-700"
                          onClick={() => navigate(`/reports/user/${user.id}`)}
                        />
                        <Trash2
                            className="h-5 w-5 cursor-pointer text-red-600 hover:text-red-800"
                            onClick={() => setConfirmDeleteUserId(user.id)}
                         />
                         </div>
                         
         {/* Delete Confirmation Modal */}
                      {confirmDeleteUserId === user.id && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
                          <div className="bg-white rounded-lg p-6 w-80 shadow-lg">
                            <h2 className="text-center font-semibold mb-6">Confirm Delete</h2>
                            <p className="mb-2 text-center">
                              Are you sure you want to delete <b>{user.username}</b>
                            </p>
                            <div className="flex justify-end gap-3">
                              <button
                                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                                onClick={() => setConfirmDeleteUserId(null)}
                              >
                                Cancel
                              </button>
                              <button
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                onClick={() => handleDeleteUser(user.id, user.username)}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <img src={noresultIllustration} alt="No results" className="w-80 mb-4" />
              <p className="text-gray-500 text-lg">No users found</p>
            </div>
          )}
        </div>

        {/* Download CSV */}
        {filteredUsers.length > 0 && !loading && (
          <div className="mt-6">
            <button
              onClick={handleDownloadCSV}
              className="p-2 hover:bg-gray-100 rounded transition-colors flex items-center gap-2"
            >
              <Download className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-700">Download CSV</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
