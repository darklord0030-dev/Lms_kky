import React, { useState } from "react";
import { Trash2, Edit, Plus, Search } from "lucide-react";
import AddNotificationModal from "./AddNotificationModal";
import emptyIllustration from "../assets/notification.png";
import noresultIllustration from "../assets/noresult.png"; // new illustration for search no results

// Notification type (local to this file)
export type NotificationItem = {
  id: string;
  name: string;
  event: string;
  recipient: string;
};

const initialSystem: NotificationItem[] = [
  { id: "1", name: "New User Signup", event: "User created", recipient: "Admin" },
  { id: "2", name: "Course Completion", event: "Course finished", recipient: "Learner" },
];

export default function Notification() {
  const [activeTab, setActiveTab] = useState("System notifications");
  const [system, setSystem] = useState<NotificationItem[]>(initialSystem);
  const [search, setSearch] = useState("");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState<NotificationItem | null>(null);

  // Handle add notification
  const handleAddNotification = (notification: NotificationItem) => {
    setSystem((prev) => [...prev, notification]);
  };

  // Handle update notification
  const handleUpdateNotification = (updated: NotificationItem) => {
    setSystem((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
  };

  // Handle delete notification
  const handleDeleteNotification = (id: string) => {
    setSystem((prev) => prev.filter((n) => n.id !== id));
  };

  // Open modal for add
  const openAddModal = () => {
    setEditingNotification(null);
    setIsModalOpen(true);
  };

  // Open modal for edit
  const openEditModal = (notification: NotificationItem) => {
    setEditingNotification(notification);
    setIsModalOpen(true);
  };

  // empty messages per tab
  const emptyMessages: Record<string, string> = {
    Overview: "No overview notifications found",
    History: "No history notifications found",
    Pending: "No pending notifications found",
    "System notifications": "No system notifications found",
  };

  // filtered list based on search
  const filteredNotifications = system.filter((n) =>
    [n.name, n.event, n.recipient].join(" ").toLowerCase().includes(search.toLowerCase())
  );

  // cast modal to any to avoid TS prop mismatch
  const Modal = AddNotificationModal as any;

  return (
    <div className="p-6 bg-white min-h-screen w-full">
      {/* Header with button */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Notifications</h1>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Notification
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-300 text-sm font-medium mb-4">
        {["Overview", "History", "Pending", "System notifications"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 ${
              activeTab === tab ? "border-b-2 border-blue-700 text-blue-700" : "text-gray-600 hover:text-blue-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative w-full max-w-sm">
          <input
            type="text"
            placeholder="Search notifications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className=" border border-gray-300 rounded-md pl-8 pr-5 py-2 focus:outline-none focus:ring-2 focus:ring-gray-50 focus:border-gray-100"
          />
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Empty or Table */}
      <div>
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <img
              src={search ? noresultIllustration : emptyIllustration} // dynamic illustration
              alt="No notifications"
              className="w-80 mb-4"
            />
            <p className="text-black text-xl">
              {search
                ? "No notifications match your search"
                : emptyMessages[activeTab] || "No notifications found"}
            </p>
          </div>
        ) : (
          <table className="w-full border-gray-200 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Event</th>
                <th className="p-2 text-left">Recipient</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredNotifications.map((n) => (
                <tr key={n.id} className="group hover:bg-blue-50 transition">
                  <td className="p-2">{n.name}</td>
                  <td className="p-2 text-left">{n.event}</td>
                  <td className="p-2 text-left">{n.recipient}</td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="relative group/icon inline-flex">
                        <button onClick={() => openEditModal(n)} className="p-1 rounded">
                          <Edit className="h-5 w-5 cursor-pointer text-gray-900 hover:text-blue-700" />
                        </button>
                        <span className="absolute -top-9 left-1/2 -translate-x-1/2 bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover/icon:opacity-100 transition">
                          Edit
                          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black rotate-45"></span>
                        </span>
                      </div>
                      <div className="relative group/icon inline-flex">
                        <button onClick={() => handleDeleteNotification(n.id)} className="p-1 rounded">
                          <Trash2 className="h-5 w-5 cursor-pointer text-gray-900 hover:text-blue-700" />
                        </button>
                        <span className="absolute -top-9 left-1/2 -translate-x-1/2 bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover/icon:opacity-100 transition">
                          Delete
                          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black rotate-45"></span>
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal for Add/Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(data: NotificationItem) => {
          if (editingNotification) handleUpdateNotification(data as NotificationItem);
          else handleAddNotification(data as NotificationItem);
          setIsModalOpen(false);
        }}
        initialData={editingNotification}
      />
    </div>
  );
}
