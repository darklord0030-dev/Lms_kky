import React, { useState } from "react";
import { X, Clock, Users, Filter, ChevronDown } from "lucide-react";

interface AddNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (notification: {
    id: string;
    name: string;
    event: string;
    recipient: string;
  }) => void;
    initialData?: Notification | null; // ✅ add this line
};  

export default function AddNotificationModal({
  isOpen,
  onClose,
  onSave,
}: AddNotificationModalProps) {
  const [name, setName] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(
    "X hours after user signup"
  );
  const [isEventDropdownOpen, setIsEventDropdownOpen] = useState(false);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  const eventOptions = [
    "X hours after user signup",
    "User completes course",
    "User fails assessment",
    "Course enrollment",
    "Certificate earned",
  ];

  const handleSave = () => {
    if (name.trim()) {
      onSave({
        id: Date.now().toString(),
        name: name.trim(),
        event: selectedEvent,
        recipient: "Related user",
      });
      setName("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Add notification
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Type a notification name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-sm placeholder-gray-500"
            />
          </div>

          {/* Event Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event
            </label>
            <div className="relative">
              <button
                onClick={() => setIsEventDropdownOpen(!isEventDropdownOpen)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-left text-sm text-gray-700 flex items-center justify-between hover:bg-gray-100 transition-colors"
              >
                <span>{selectedEvent}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {isEventDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                  {eventOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setSelectedEvent(option);
                        setIsEventDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Ruleset Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Ruleset
            </label>

            {/* Time Rule */}
            <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-gray-200">
                  <Clock className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                    TIME
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    X hours after
                  </div>
                </div>
              </div>
            </div>

            {/* When Rule */}
            <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-gray-200">
                  <Users className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                    WHEN
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    User self registers
                  </div>
                </div>
              </div>
            </div>

            {/* Filter By Section */}
            <div className="border border-gray-200 rounded-lg">
              <button
                onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Filter className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">
                    Filter by
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    isFilterExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isFilterExpanded && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <p className="text-sm text-gray-600">
                    Additional filter options would appear here
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
