import React from "react";
import { FileText } from "lucide-react";
import { Outlet } from "react-router-dom";

export default function Reports() {
  return (
    <div className="flex min-h-screen bg-zinc-50">
      {/* Sidebar (only title, no menu) */}
      
        <div className="flex items-center rounded-lg px-3 py-2 text-sm font-medium text-zinc-700">
          
        
        </div>
  

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
