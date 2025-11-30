import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  BookOpen,
  Workflow,
  Award,
  BarChart3,
  Calendar,
  MessageSquare,
  Bell,
  Settings,
  HelpCircle,
  Group,
  HomeIcon,
} from "lucide-react";

type SidebarProps = {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
  userType: string; // backend sends uppercase, so allow string
};

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, userType }) => {
  const location = useLocation();

  // Normalize backend uppercase into lowercase for comparison
  const normalizedType = userType?.toLowerCase();

  // -----------------------------
  // ROLE-BASED MENU CONFIG
  // -----------------------------
  const adminMenu = [
    { id: "dashboard", label: "Dashboard", icon: Home, path: "/dashboard" },
    { id: "users", label: "Users", icon: Users, path: "/users" },
    { id: "courses", label: "Courses", icon: BookOpen, path: "/courses" },
    { id: "skills", label: "Skills", icon: Workflow, path: "/skills" },
    { id: "groups", label: "Groups", icon: Group, path: "/groups" },
    { id: "reports", label: "Reports", icon: BarChart3, path: "/reports" },
    { id: "calendar", label: "Calendar", icon: Calendar, path: "/calendar" },
    { id: "messages", label: "Messages", icon: MessageSquare, path: "/messages" },
    { id: "notification", label: "Notification", icon: Bell, path: "/notification" },
    { id: "workflow", label: "Workflow", icon: Workflow, path: "/workflow" },
    { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
    { id: "help", label: "Help", icon: HelpCircle, path: "/help" },
  ];

  const learnerMenu = [
    { id: "home", label: "Home", icon: HomeIcon, path: "/home" },
    { id: "myCourses", label: "My Courses", icon: BookOpen, path: "/card" },
    { id: "certificates", label: "Certificates", icon: Award, path: "/certificates" },
    { id: "messages", label: "Messages", icon: MessageSquare, path: "/messages" },
    { id: "notification", label: "Notification", icon: Bell, path: "/notification" },
    { id: "help", label: "Help", icon: HelpCircle, path: "/help" },
  ];

  // Select menu based on normalized type
  const menuItems = normalizedType === "admin" ? adminMenu : learnerMenu;

  return (
    <div
      className={`fixed left-0 top-[64px] dark:bg-gray-950 shadow-lg flex flex-col transition-all duration-300 z-40 ${
        collapsed ? "w-15" : "w-64"
      }`}
      style={{ height: "calc(100vh - 64px)" }}
    >
      {/* Menu */}
      <nav className="flex-1 pt-4 overflow-y-auto">
        <ul className="space-y-1 px-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);

            return (
              <li key={item.id}>
                <Link
                  to={item.path}
                  className={`flex items-center px-2 py-2 transition-all duration-200 ${
                    isActive
                      ? "bg-gray-200 dark:bg-gray-800 text-blue-700 dark:text-blue-400 shadow-sm"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      isActive
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-400"
                    }`}
                  />
                  {!collapsed && (
                    <span className="ml-2 font-medium">{item.label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-6 py-8 flex items-center justify-between">
        {!collapsed && (
          <span className="text-xm text-gray-700">© 2025 MyLMS</span>
        )}
      </div>
    </div>
  );
};
