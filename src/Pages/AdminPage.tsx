// AdminPage.tsx
import React from "react";

export default function AdminPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-2xl w-full text-center">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">Admin Dashboard</h1>
        <p className="text-gray-600 mb-6">
          Welcome, <span className="font-semibold">Admin</span> 🎉
        </p>
      </div>
    </div>
  );
}
