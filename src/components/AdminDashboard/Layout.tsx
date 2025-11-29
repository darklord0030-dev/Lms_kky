// Layout.tsx
import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

type LayoutProps = {
  children: React.ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed((prev) => !prev);
  };

  // Layout.tsx (sidebar navigation section)
const getNavigationItems = (userType: string) => {
  if (userType === 'learner') {
    return [
      { name: 'Dashboard', path: '/dashboard', icon: 'Home' },
      { name: 'My Courses', path: '/my-courses', icon: 'BookOpen' },
      { name: 'Skills', path: '/skills', icon: 'Award' },
      { name: 'Calendar', path: '/calendar', icon: 'Calendar' },
      { name: 'Messages', path: '/messages', icon: 'MessageSquare' },
      { name: 'Settings', path: '/settings', icon: 'Settings' },
      { name: 'Help', path: '/help', icon: 'HelpCircle' },
    ];
  }

  if (userType === 'teacher') {
    return [
      { name: 'Dashboard', path: '/dashboard', icon: 'Home' },
      { name: 'Courses', path: '/courses', icon: 'BookOpen' },
      { name: 'Course Builder', path: '/course-builder', icon: 'PlusCircle' },
      { name: 'Students', path: '/users', icon: 'Users' },
      { name: 'Groups', path: '/groups', icon: 'UsersIcon' },
      { name: 'Reports', path: '/reports', icon: 'BarChart' },
      { name: 'Messages', path: '/messages', icon: 'MessageSquare' },
      { name: 'Calendar', path: '/calendar', icon: 'Calendar' },
      { name: 'Settings', path: '/settings', icon: 'Settings' },
      { name: 'Help', path: '/help', icon: 'HelpCircle' },
    ];
  }

  // Admin - full access
  return [
    { name: 'Dashboard', path: '/dashboard', icon: 'Home' },
    { name: 'Users', path: '/users', icon: 'Users' },
    { name: 'Courses', path: '/courses', icon: 'BookOpen' },
    { name: 'Groups', path: '/groups', icon: 'UsersIcon' },
    { name: 'Course Builder', path: '/course-builder', icon: 'PlusCircle' },
    { name: 'Reports', path: '/reports', icon: 'BarChart' },
    { name: 'Workflow', path: '/workflow', icon: 'GitBranch' },
    { name: 'Messages', path: '/messages', icon: 'MessageSquare' },
    { name: 'Calendar', path: '/calendar', icon: 'Calendar' },
    { name: 'Settings', path: '/settings', icon: 'Settings' },
    { name: 'Help', path: '/help', icon: 'HelpCircle' },
  ];
};
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Content */}
      <div
        className={`flex flex-col flex-1 transition-all duration-300 ${
          collapsed ? "ml-20" : "ml-64"
        }`}
      >
        <Header sidebarCollapsed={collapsed} toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-y-auto p-10 md:p-20">
          <div className="mx-auto max-w-8xl">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
