import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AddUserType from "./AddUserType";

interface RoleRow {
  id: string;
  name: string;
  administrator: boolean;
  instructor: boolean;
  learner: boolean;
}

const DEFAULT_ROLES: RoleRow[] = [
  { id: "1", name: "SuperAdmin", administrator: true, instructor: true, learner: true },
  { id: "2", name: "Admin-Type", administrator: true, instructor: true, learner: true },
  { id: "3", name: "Trainer-Type", administrator: false, instructor: true, learner: true },
  { id: "4", name: "Learner-Type", administrator: false, instructor: false, learner: true },
];

export default function UserTypesTab() {
  const [roles, setRoles] = useState<RoleRow[]>(DEFAULT_ROLES);
  const [hovered, setHovered] = useState<string | null>(null);

  const [drawer, setDrawer] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"add" | "edit">("add");
  const [editData, setEditData] = useState<RoleRow | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  // renamed "toast" to "toastMsg" to avoid name conflicts
  const [toastMsg, setToastMsg] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 2500);
  };

  const loadSaved = () => {
    const stored = JSON.parse(localStorage.getItem("createdUserTypes") || "[]");

    const mapped = stored.map((item: any, i: number) => ({
      id: "C" + i,
      name: item.name,
      administrator: item.roles.includes("Administrator"),
      instructor: item.roles.includes("Instructor"),
      learner: item.roles.includes("Learner"),
    }));

    setRoles([...DEFAULT_ROLES, ...mapped]);
  };

  useEffect(() => loadSaved(), []);

  const deleteRole = () => {
    if (!deleteId) return;

    const updated = roles.filter((r) => r.id !== deleteId);

    const saved = JSON.parse(localStorage.getItem("createdUserTypes") || "[]");
    const filteredSaved = saved.filter((item: any) => "C" + saved.indexOf(item) !== deleteId);

    localStorage.setItem("createdUserTypes", JSON.stringify(filteredSaved));

    setRoles(updated);
    showToast("User Type Deleted!", "success");
    setDeleteId(null);
  };

  return (
    <>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-gray-900">USER TYPES</h2>

          <button
            onClick={() => {
              setDrawerMode("add");
              setEditData(null);
              setDrawer(true);
            }}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add User Type
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-6 py-4 text-sm font-medium">Name</th>
                <th className="px-6 py-4 text-sm font-medium">Administrator</th>
                <th className="px-6 py-4 text-sm font-medium">Instructor</th>
                <th className="px-6 py-4 text-sm font-medium">Learner</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {roles.map((r) => (
                <tr
                  key={r.id}
                  onMouseEnter={() => setHovered(r.id)}
                  onMouseLeave={() => setHovered(null)}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="px-6 py-4">{r.name}</td>
                  <td className="px-6 py-4">{r.administrator ? <Check /> : "-"}</td>
                  <td className="px-6 py-4">{r.instructor ? <Check /> : "-"}</td>
                  <td className="px-6 py-4">{r.learner ? <Check /> : "-"}</td>

                  <td className="px-6 py-4 text-right">
                    {hovered === r.id && (
                      <div className="flex gap-3 justify-end">
                        {/* EDIT */}
                        <button
                          onClick={() => {
                            setDrawerMode("edit");
                            setEditData(r);
                            setDrawer(true);
                          }}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* DELETE */}
                        <button
                          onClick={() => setDeleteId(r.id)}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* DRAWER */}
        <AnimatePresence>
          {drawer && (
            <>
              <motion.div
                className="fixed inset-0 bg-black/40 z-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setDrawer(false)}
              />

              <motion.div
                className="fixed top-0 right-0 w-[380px] h-full bg-white shadow-xl z-50 p-6"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
              >
                <AddUserType
                  mode={drawerMode}
                  editData={editData}
                  onCancel={() => setDrawer(false)}
                  onSave={() => {
                    loadSaved();
                    showToast(
                      drawerMode === "add"
                        ? "User Type Created!"
                        : "User Type Updated!",
                      "success"
                    );
                    setDrawer(false);
                  }}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* DELETE CONFIRM MODAL */}
        <AnimatePresence>
          {deleteId && (
            <>
              <motion.div
                className="fixed inset-0 bg-black/30 z-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setDeleteId(null)}
              />

              <motion.div
                className="fixed top-1/2 left-1/2 bg-white p-6 rounded-lg shadow-xl z-50 w-[360px] -translate-x-1/2 -translate-y-1/2"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this user type?
                </p>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setDeleteId(null)}
                    className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={deleteRole}
                    className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* TOAST */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-6 right-6 px-4 py-3 rounded-md shadow-lg text-white z-[9999]
            ${toastMsg.type === "success" ? "bg-green-600" : "bg-red-600"}`}
          >
            {toastMsg.message}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
