// Layout.tsx
import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

type LayoutProps = {
  children: React.ReactNode;
  userType: "admin" | "teacher" | "learner"; // ⬅ REQUIRED for role-based sidebar
};

const Layout: React.FC<LayoutProps> = ({ children, userType }) => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed((prev) => !prev);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        userType={userType} // ⬅ pass to sidebar
      />

      {/* Main Content */}
      <div
        className={`flex flex-col flex-1 transition-all duration-300 ${
          collapsed ? "ml-20" : "ml-64"
        }`}
      >
        {/* Header */}
        <Header sidebarCollapsed={collapsed} toggleSidebar={toggleSidebar} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-10 md:p-20">
          <div className="mx-auto max-w-8xl">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
