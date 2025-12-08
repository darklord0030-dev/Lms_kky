import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  Settings,
  User,
  ChevronDown,
  MessageSquareTextIcon,
  Calendar,
  LogOut,
  Sidebar as SidebarIcon,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import SearchResults from "./SearchResults";
import axios from "axios";

type HeaderProps = {
  sidebarCollapsed?: boolean;
  toggleSidebar?: () => void;
};
 
type ViewMode = "signup" | "login" | "view"; 

interface UserInfo {
  firstname?: string;
  lastname?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  usertype?: string;
}

export const Header: React.FC<HeaderProps> = ({ sidebarCollapsed, toggleSidebar }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  // Load user info + normalize uppercase to lowercase
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedToken = localStorage.getItem("token");
        if (!storedToken) return;

        const parsed = JSON.parse(storedToken);
        const userId = parsed?.data?.userId || parsed?.userId;

        if (!userId) return;

        const response = await axios.get(`http://localhost:3000/api/user/${userId}`);
        const userData = response.data;

        // Normalize usertype to lowercase
        const normalizedType =
          (userData.usertype || userData.userType || "User").toLowerCase();

        const normalizedUser = {
          firstname: userData.firstname || userData.firstName || "",
          lastname: userData.lastname || userData.lastName || "",
          email: userData.email || "",
          usertype: normalizedType, // store lowercase
        };

        setUser(normalizedUser);

      } catch (error) {
        toast.error("Failed to load user info");
      }
    };

    loadUser();
  }, []);

  const fullname = user
    ? [user.firstname, user.lastname].filter(Boolean).join(" ").trim() || "Guest User"
    : "Guest User";

  const handleSearch = async (value: string) => {
    setQuery(value);
    if (!value.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:3000/api/search?query=${value}`);
      setResults(res.data || []);
    } catch {
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:3000/api/auth/logout",
        {},
        { headers: { Authorization: token ? `Bearer ${token}` : "" } }
      );

      localStorage.removeItem("user");
      localStorage.removeItem("token");

      toast.success("Logged out successfully");
      navigate("/login");
    } catch {
      toast.error("Logout failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.trim()) handleSearch(query);
      else setResults([]);
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
      ${isScrolled ? "h-14 bg-white dark:bg-gray-950 shadow-md" : "h-20 bg-white dark:bg-gray-950"}
      flex items-center justify-between px-4 md:px-8 lg:px-16`}
    >
      <Toaster position="top-right" />

      {/* Left Section */}
      <div className="flex items-center space-x-3">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <SidebarIcon className="w-6 h-6 text-gray-700 dark:text-gray-200" />
        </button>
        <h1 className="font-bold text-gray-700 dark:text-gray-100">MyLMS</h1>
      </div>

      {/* Search Bar */}
      <div className="absolute left-1/2 transform -translate-x-1/2 w-80 md:w-96">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search courses, users, or content..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 dark:bg-gray-800 dark:border-gray-700 dark:placeholder-gray-400 dark:text-white"
          />
          {query && (
            <div className="absolute top-12 left-0 right-0 bg-white dark:bg-gray-900 rounded-lg border dark:border-gray-800 shadow-lg z-50">
              {loading ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  Searching...
                </div>
              ) : (
                <SearchResults query={query} results={results} />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Section - SAME FOR ALL USERS */}
      <div className="flex items-center space-x-4">

        {/* Calendar */}
        <button
          onClick={() => navigate("/calendar")}
          className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800"
        >
          <Calendar className="w-5 h-5" />
        </button>

        {/* Messages */}
        <button
          onClick={() => navigate("/messages")}
          className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800"
        >
          <MessageSquareTextIcon className="w-5 h-5" />
          
        </button>

        {/* Notifications */}
        <button
          onClick={() => navigate("/notification")}
          className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800"
        >
          <Bell className="w-5 h-5" />
          
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-300 dark:bg-gray-700" />

        {/* User Dropdown */}
        <div className="relative" ref={menuRef}>
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>

            <div className="hidden md:block">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                {fullname}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user?.usertype}
              </p>
            </div>

            <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </div>

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-lg shadow-lg z-50 overflow-hidden">
              <div className="p-4 border-b dark:border-gray-800">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                      {fullname}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user?.email}
                    </p>
                    <p className="text-xs text-blue-500 dark:text-blue-400 font-medium mt-0.5">
                      {user?.usertype}
                    </p>
                  </div>
                </div>
              </div>

              <div className="py-2">

                {/* Profile */}
                <button
                  onClick={() => navigate("/adduser", { state: { user } })}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <User className="w-4 h-4 mr-2" /> Profile
                </button>

                {/* Settings */}
                <button
                  onClick={() => navigate("/settings")}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Settings className="w-4 h-4 mr-2" /> Settings
                </button>
              </div>

              <div className="border-t dark:border-gray-800" />

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
