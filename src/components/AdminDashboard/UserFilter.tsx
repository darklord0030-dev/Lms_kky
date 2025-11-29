import React, { useState } from "react";
import { Filter } from "lucide-react";

type UserFilterProps = {
  statusFilter: string;
  typeFilter: string;
  onChangeStatus: (value: string) => void;
  onChangeType: (value: string) => void;
  onClear: () => void;
};

export default function UserFilter({
  statusFilter,
  typeFilter,
  onChangeStatus,
  onChangeType,
  onClear,
}: UserFilterProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        className="p-2 border rounded-md hover:bg-gray-100 flex items-center gap-1"
        onClick={() => setOpen(!open)}
      >
        <Filter className="h-4 w-4 text-gray-600" />
        <span className="text-sm">Filter</span>
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-56 bg-white border rounded-lg shadow-lg z-10 p-2 space-y-3">
          {/* Status Filter */}
          <div>
            <p className="px-2 text-xs text-gray-500">Status</p>
            {["Active", "Inactive", "All"].map((status) => (
              <button
                key={status}
                onClick={() => {
                  onChangeStatus(status === "All" ? "" : status);
                  setOpen(false);
                }}
                className={`block w-full text-left px-4 py-2 text-sm rounded-md hover:bg-gray-100 ${
                  statusFilter === status ? "bg-gray-200 font-medium" : ""
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Type Filter */}
          <div>
            <p className="px-2 text-xs text-gray-500">Type</p>
            {["Learner-Type", "Admin", "Manager", "All"].map((type) => (
              <button
                key={type}
                onClick={() => {
                  onChangeType(type === "All" ? "" : type);
                  setOpen(false);
                }}
                className={`block w-full text-left px-4 py-2 text-sm rounded-md hover:bg-gray-100 ${
                  typeFilter === type ? "bg-gray-200 font-medium" : ""
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Reset */}
          <div className="border-t pt-2">
            <button
              className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-md"
              onClick={() => {
                onClear();
                setOpen(false);
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
