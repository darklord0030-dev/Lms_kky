import React, { useState } from "react";
import {
  Plus,
  Users,
  Copy,
  Settings,
  FileText,
  Cloud,
  Play,
  Volume2,
  Monitor,
  Code,
  X,
  Menu,
  Trash2,
  DollarSign,
  Lock,

  UserCheck,
  Share,
  Clock,
  GraduationCap,
  BarChart3,
} from "lucide-react";

interface ContentItem {
  id: number;
  type: string;
  title: string;
}

export default function CourseBuilder() {
  // Sidebar
  const [sidebarOpen, setSidebarOpen] = useState(true);
  // Settings panel
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("info");

  // Tabs & description
  const [activeTab, setActiveTab] = useState("content");
  const [description, setDescription] = useState("");

  // Course contents
  const [courseContents, setCourseContents] = useState<ContentItem[]>([]);
  const [nextId, setNextId] = useState(1);

  const contentItems = [
    { icon: FileText, label: "Content" },
    { icon: Cloud, label: "Web content" },
    { icon: Play, label: "Video" },
    { icon: Volume2, label: "Audio" },
    { icon: Monitor, label: "Presentation | Document" },
    { icon: Code, label: "iFrame" },
  ];

  const addContentItem = (label: string) => {
    setCourseContents([
      ...courseContents,
      { id: nextId, type: label, title: `${label} #${nextId}` },
    ]);
    setNextId(nextId + 1);
  };

  const removeContentItem = (id: number) => {
    setCourseContents(courseContents.filter((c) => c.id !== id));
  };

  // Settings panel states
  const [activateStatus, setActivateStatus] = useState(false);
  const [activateCoach, setActivateCoach] = useState(false);
  const [videoType, setVideoType] = useState("youtube");
  const [videoURL, setVideoURL] = useState("");
  const [price, setPrice] = useState("");
  const [contentLock, setContentLock] = useState(false);

  const [capacity, setCapacity] = useState("");
  const [publicSharing, setPublicSharing] = useState(false);
  const [enrollmentRequest, setEnrollmentRequest] = useState(false);

  const [timeType, setTimeType] = useState("time-limit");
  const [timeDays, setTimeDays] = useState("");
  const [accessRetention, setAccessRetention] = useState(false);

  const [unitsOrdering, setUnitsOrdering] = useState("sequential");
  const [completionRule, setCompletionRule] = useState("all-units");

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`fixed lg:static z-30 h-full bg-white border-r border-gray-200 w-80 transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top bar */}
        <div className="bg-blue-900 text-white p-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 hover:bg-blue-800 rounded"
          >
            <Menu className="w-5 h-5" />
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-sm font-medium transition-colors"
          >
            Publish
          </button>
        </div>

        {/* Actions */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">New course</h2>
          <div className="flex gap-2">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" /> Add
            </button>
            <button className="border border-gray-300 px-3 py-2 rounded hover:bg-gray-50">
              <Users className="w-4 h-4" />
            </button>
            <button className="border border-gray-300 px-3 py-2 rounded hover:bg-gray-50">
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSettingsOpen(true)}
              className="border border-gray-300 px-3 py-2 rounded hover:bg-gray-50"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Add Content */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">Add Content</h3>
          <div className="space-y-1 ml-2">
            {contentItems.map((item, idx) => (
              <button
                key={idx}
                onClick={() => addContentItem(item.label)}
                className="w-full flex items-center gap-2 p-2 rounded hover:bg-gray-50 text-sm text-gray-700"
              >
                <item.icon className="w-4 h-4 text-gray-500" />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 text-center text-sm text-gray-600">
          Drag and drop files here, or click <strong>Add</strong> to build your
          course.
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="relative h-64 bg-gradient-to-r from-blue-900 via-blue-800 to-orange-500 flex items-center justify-center">
          <h1 className="text-4xl font-bold text-white">New course</h1>
          <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
            <div className="w-24 h-24 border-4 border-white rounded-full flex items-center justify-center">
              <div className="w-16 h-8 border-b-4 border-white rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Description + Tabs */}
        <div className="flex-1 bg-gray-50 p-6">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a course description up to 5000 characters"
            className="w-full h-24 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-6"
            maxLength={5000}
          />

          {/* Tabs */}
          <div className="bg-white rounded-lg border border-gray-200 min-h-96">
            <div className="border-b border-gray-200 flex items-center justify-between">
              <div className="flex">
                <button
                  onClick={() => setActiveTab("content")}
                  className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === "content"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Content
                </button>
                <button
                  onClick={() => setActiveTab("files")}
                  className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === "files"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Files
                </button>
              </div>
              <div className="px-6 py-3 text-sm text-gray-600">
                All units must be completed
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-8">
              {activeTab === "content" && courseContents.length === 0 && (
                <div className="text-center py-16 text-gray-600">
                  <FileText className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-blue-600 mb-2">
                    This course is empty
                  </h3>
                  <p>
                    Drag and drop files here, or click the Add button to the left,
                    to build your course.
                  </p>
                </div>
              )}

              {activeTab === "content" &&
                courseContents.map((content) => (
                  <div
                    key={content.id}
                    className="bg-white rounded-lg shadow p-4 flex justify-between items-center mb-2"
                  >
                    <span className="text-gray-800 font-medium">{content.title}</span>
                    <button
                      onClick={() => removeContentItem(content.id)}
                      className="p-1 rounded hover:bg-gray-100 text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

              {activeTab === "files" && (
                <div className="text-center py-16 text-gray-600">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    No files uploaded
                  </h3>
                  <p>Upload files to make them available in your course content.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {settingsOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setSettingsOpen(false)}
          />
          <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-lg z-50 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">Course Options</h2>
              <button
                onClick={() => setSettingsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200">
              <div className="flex">
                {["info", "availability", "limits", "completion"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveSection(tab)}
                    className={`px-4 py-3 text-sm font-medium border-b-2 ${
                      activeSection === tab
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Settings Content */}
            <div className="flex-1 overflow-y-auto p-6 text-gray-600 space-y-6">
              {/* Info Section */}
              {activeSection === "info" && (
                <div className="space-y-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={activateStatus}
                      onChange={(e) => setActivateStatus(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    Activate course
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={activateCoach}
                      onChange={(e) => setActivateCoach(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    Assign coach
                  </label>

                  <div>
                    <label className="block mb-1">Intro Video Type</label>
                    <select
                      value={videoType}
                      onChange={(e) => setVideoType(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    >
                      <option value="youtube">YouTube</option>
                      <option value="vimeo">Vimeo</option>
                      <option value="self">Self-hosted</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1">Video URL</label>
                    <input
                      type="text"
                      value={videoURL}
                      onChange={(e) => setVideoURL(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <label className="block mb-1">Price ($)</label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      placeholder="0"
                    />
                  </div>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={contentLock}
                      onChange={(e) => setContentLock(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    Lock content until previous unit is completed
                  </label>
                </div>
              )}

              {/* Availability Section */}
              {activeSection === "availability" && (
                <div className="space-y-4">
                  <div>
                    <label className="block mb-1">Course Capacity</label>
                    <input
                      type="number"
                      value={capacity}
                      onChange={(e) => setCapacity(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      placeholder="Unlimited"
                    />
                  </div>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={publicSharing}
                      onChange={(e) => setPublicSharing(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    Public sharing
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={enrollmentRequest}
                      onChange={(e) => setEnrollmentRequest(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    Require enrollment approval
                  </label>
                </div>
              )}

              {/* Limits Section */}
              {activeSection === "limits" && (
                <div className="space-y-4">
                  <div>
                    <label className="block mb-1">Access Duration Type</label>
                    <select
                      value={timeType}
                      onChange={(e) => setTimeType(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    >
                      <option value="time-limit">Time limit</option>
                      <option value="always">Always available</option>
                    </select>
                  </div>

                  {timeType === "time-limit" && (
                    <div>
                      <label className="block mb-1">Days of access</label>
                      <input
                        type="number"
                        value={timeDays}
                        onChange={(e) => setTimeDays(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        placeholder="30"
                      />
                    </div>
                  )}

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={accessRetention}
                      onChange={(e) => setAccessRetention(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    Retain access after completion
                  </label>
                </div>
              )}

              {/* Completion Section */}
              {activeSection === "completion" && (
                <div className="space-y-4">
                  <div>
                    <label className="block mb-1">Units ordering</label>
                    <select
                      value={unitsOrdering}
                      onChange={(e) => setUnitsOrdering(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    >
                      <option value="sequential">Sequential</option>
                      <option value="any">Any order</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1">Completion rule</label>
                    <select
                      value={completionRule}
                      onChange={(e) => setCompletionRule(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    >
                      <option value="all-units">All units must be completed</option>
                      <option value="percentage">Percentage of units completed</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium transition-colors">
                Save
              </button>
              <button
                onClick={() => setSettingsOpen(false)}
                className="text-gray-600 hover:text-gray-800 px-6 py-2 font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
