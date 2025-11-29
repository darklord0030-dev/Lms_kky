import React, { useState } from "react";
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Download,
  ChevronUp,
  Info,
  ChevronDown,
  X,
} from "lucide-react";
import emptyIllustration from "../assets/empty-automation.png";

interface Automation {
  id: string;
  name: string;
  description: string;
  status: "Active" | "Inactive";
  isSelected?: boolean;
}

export default function Workflow() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Inactive">("All");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [selected, setSelected] = useState<string>("Select an automation");
  const [newName, setNewName] = useState("");
  const [showInfo, setShowInfo] = useState(false);

  // Edit modal
  const [editingAutomation, setEditingAutomation] = useState<Automation | null>(null);

  const options = ["When user completes a course", "When user enrolls", "When course is inactive"];

  const handleRowClick = (id: string) => {
    setAutomations((prev) =>
      prev.map((a) => ({
        ...a,
        isSelected: a.id === id,
      }))
    );
  };

  const toggleStatus = (id: string) => {
    setAutomations((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: a.status === "Active" ? "Inactive" : "Active" } : a
      )
    );
  };

  const handleDeleteAutomation = (id: string) => {
    setAutomations((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSaveEdit = (updated: Automation) => {
    setAutomations((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    setEditingAutomation(null);
  };

  const handleAddAutomation = () => {
    if (!newName.trim() || selected === "Select an automation") return;
    const newAutomation: Automation = {
      id: Date.now().toString(),
      name: newName,
      description: selected,
      status: "Active",
    };
    setAutomations((prev) => [...prev, newAutomation]);
    setShowModal(false);
    setNewName("");
    setSelected("Select an automation");
  };

  const filteredAutomations = automations.filter((a) => {
    const matchesSearch =
      (a.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.description || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" ? true : a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-h-screen bg-white p-6">
      <div className="w-full max-w-7xl mx-auto bg-white p-6">
        <h1 className="text-2xl font-semibold text-black mb-6">Workflows</h1>

        {filteredAutomations.length > 0 && (
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-5 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
              </div>

              <div className="relative">
                <button
                  onClick={() => setFilterOpen(!filterOpen)}
                  className="p-3 rounded-md hover:bg-blue-100 flex items-center gap-2"
                >
                  <Filter className="w-5 h-5 text-gray-600" />
                </button>

                {filterOpen && (
                  <div className="absolute mt-1 w-32 bg-white border rounded shadow-lg z-10">
                    {["All", "Active", "Inactive"].map((status) => (
                      <div
                        key={status}
                        className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 ${
                          statusFilter === status ? "bg-blue-50 font-medium" : ""
                        }`}
                        onClick={() => {
                          setStatusFilter(status as "All" | "Active" | "Inactive");
                          setFilterOpen(false);
                        }}
                      >
                        {status}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add automation
            </button>
          </div>
        )}

        {filteredAutomations.length === 0 ? (
          <div className="flex flex-col items-center text-center space-y-4 max-w-md mx-auto mt-10">
            <img src={emptyIllustration} alt="No automations" className="w-80 mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              There are no automations yet!
            </h2>
            <p className="text-gray-600 mb-2">
              Manage your users and assign courses automatically, without hassle.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add automation
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-200 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 font-medium text-gray-700">Name</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-700">Workflows</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-700">Status</th>
                    <th className="w-16"></th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAutomations.map((a) => (
                    <tr
                      key={a.id}
                      className={`border-b border-gray-100 cursor-pointer ${
                        a.isSelected ? "bg-blue-50" : "hover:bg-gray-50"
                      }`}
                      onClick={() => handleRowClick(a.id)}
                    >
                      <td className="py-4 px-6 text-black">{a.name}</td>
                      <td className="py-4 px-6 text-gray-600">{a.description}</td>
                      <td className="py-4 px-6">
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStatus(a.id);
                          }}
                          className={`px-2 py-1 text-xs font-medium rounded cursor-pointer ${
                            a.status === "Active"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {a.isSelected && (
                          <div className="flex items-center gap-2">
                            <Edit
                              className="h-5 w-5 text-gray-600 cursor-pointer hover:text-blue-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingAutomation(a);
                              }}
                            />
                            <Trash2
                              className="h-5 w-5 text-red-600 cursor-pointer hover:text-blue-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteAutomation(a.id);
                              }}
                            />
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        )}

        {/* Add Automation Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
              <button
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                onClick={() => setShowModal(false)}
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-semibold mb-6">Add automation</h2>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Name{" "}
                  <button type="button" onClick={() => setShowInfo(!showInfo)} className="inline-flex">
                    <Info className="w-4 h-4 text-blue-600 ml-1" />
                  </button>
                </label>
                {showInfo && (
                  <div className="mb-3 bg-gray-100 border border-gray-300 text-gray-700 text-sm rounded p-3">
                    Enter a descriptive name for this automation. Example: "Reassign course on expiry".
                  </div>
                )}
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Type an automation name"
                  className="w-full border rounded px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="mb-10 relative">
                <label className="block text-sm font-medium mb-2">Automation</label>
                <div
                  className="w-full border rounded px-3 py-2 text-sm bg-gray-50 cursor-pointer flex items-center justify-between"
                  onClick={() => setOpenDropdown(!openDropdown)}
                >
                  <span className={selected === "Select an automation" ? "text-gray-400" : ""}>
                    {selected}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                </div>

                {openDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg">
                    {options.map((opt) => (
                      <div
                        key={opt}
                        className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setSelected(opt);
                          setOpenDropdown(false);
                        }}
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-start gap-3 border-t pt-4">
                <button
                  onClick={handleAddAutomation}
                  className="bg-blue-600 text-white px-6 py-2 rounded text-sm font-medium hover:bg-blue-700"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-gray-100 text-gray-800 px-6 py-2 rounded text-sm font-medium hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Automation Modal */}
        {editingAutomation && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
              <button
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                onClick={() => setEditingAutomation(null)}
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-semibold mb-6">Edit automation</h2>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={editingAutomation.name}
                  onChange={(e) =>
                    setEditingAutomation({ ...editingAutomation, name: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Description</label>
                <input
                  type="text"
                  value={editingAutomation.description}
                  onChange={(e) =>
                    setEditingAutomation({ ...editingAutomation, description: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-start gap-3 border-t pt-4">
                <button
                  onClick={() => handleSaveEdit(editingAutomation)}
                  className="bg-blue-600 text-white px-6 py-2 rounded text-sm font-medium hover:bg-blue-700"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingAutomation(null)}
                  className="bg-gray-100 text-gray-800 px-6 py-2 rounded text-sm font-medium hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
