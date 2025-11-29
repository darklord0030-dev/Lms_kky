import React, { useState } from "react";
import {
  ChevronDown,
  FileText,
  Settings,
  X,
  CheckSquare,
  Calendar,
  Clock,
  Info,
} from "lucide-react";

export default function AssignmentUnit() {
  const [showOptions, setShowOptions] = useState(false);

  // Form state
  const [completionTrigger, setCompletionTrigger] = useState("instructor-accepts");
  const [replyMethods, setReplyMethods] = useState({
    text: true,
    upload: true,
    recordVideo: true,
    recordAudio: true,
  });
  const [dueDate, setDueDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [duration, setDuration] = useState("");

  // Saved config (after clicking Save)
  const [savedOptions, setSavedOptions] = useState<any | null>(null);

  const handleReplyMethodChange = (method: keyof typeof replyMethods) => {
    setReplyMethods((prev) => ({
      ...prev,
      [method]: !prev[method],
    }));
  };

  const handleSave = () => {
    const options = {
      completionTrigger,
      replyMethods,
      dueDate,
      endTime,
      duration,
    };

    setSavedOptions(options);
    setShowOptions(false);

    console.log("Assignment options saved:", options);
    // 👉 Later you can send `options` to API here
  };

  return (
    <div className="mt-6">
      {/* Assignment content area */}
      <div className="min-h-96 bg-white border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="mb-2">Assignment content area</p>
          <p className="text-sm">
            Add your assignment instructions and materials here
          </p>
        </div>
      </div>

      {/* Footer actions */}
      <div className="mt-6 flex justify-between items-center">
        <div className="flex items-center">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <span>Submissions</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowOptions(true)}
            className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
          >
            <FileText className="w-5 h-5 text-blue-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Options modal */}
      {showOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Assignment options</h2>
                <button
                  onClick={() => setShowOptions(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Complete unit section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-gray-600" />
                  <h3 className="font-medium text-gray-900">Complete unit</h3>
                </div>
                <div className="ml-7">
                  <select
                    value={completionTrigger}
                    onChange={(e) => setCompletionTrigger(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="instructor-accepts">
                      When instructor accepts the answer
                    </option>
                    <option value="student-submits">When student submits</option>
                    <option value="due-date">On due date</option>
                  </select>
                </div>
              </div>

              {/* Details section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <h3 className="font-medium text-gray-900">Details</h3>
                </div>

                <div className="ml-7 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      Due date
                      <Info className="w-4 h-4 text-gray-400" />
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        placeholder="DD/MM/YYYY"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                      />
                      <Calendar className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      End time
                      <Info className="w-4 h-4 text-gray-400" />
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        placeholder="HH:MM"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                      />
                      <Clock className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
                    </div>
                  </div>
                </div>

                <div className="ml-7">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    Duration
                    <Info className="w-4 h-4 text-gray-400" />
                  </label>
                  <div className="max-w-xs">
                    <input
                      type="text"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="Minutes"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Reply method section */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Reply method</h3>

                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={replyMethods.text}
                      onChange={() => handleReplyMethodChange("text")}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-700">Text</span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={replyMethods.upload}
                      onChange={() => handleReplyMethodChange("upload")}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-700">Upload a file</span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={replyMethods.recordVideo}
                      onChange={() => handleReplyMethodChange("recordVideo")}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-700">Record video</span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={replyMethods.recordAudio}
                      onChange={() => handleReplyMethodChange("recordAudio")}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-700">Record audio</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => setShowOptions(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Show saved options preview */}
      {savedOptions && (
        <div className="mt-6 p-4 border rounded-lg bg-gray-50 text-sm text-gray-700">
          <h4 className="font-semibold mb-2">Saved Assignment Options:</h4>
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(savedOptions, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
