import React, { useState } from "react";
import { Monitor, Home, Users, X, CheckSquare, Calendar, Clock, Info } from "lucide-react";

const sessionTypes = [
  {
    id: "online-integrated",
    name: "Online session",
    subtitle: "(integrated tool)",
    icon: Monitor,
    badge: "Online",
    color: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    id: "in-person",
    name: "In-person session",
    icon: Home,
    badge: "In-person",
    color: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    id: "online-external",
    name: "Online session",
    subtitle: "(external tools)",
    icon: Users,
    badge: "Online",
    color: "bg-purple-100",
    iconColor: "text-purple-600",
  },
];

interface SessionSettings {
  id: string;
  name: string;
  type: string;
  completionTrigger: string;
  duration: number;
  durationUnit: "minutes" | "hours";
  date: string;
  startTime: string;
  instructor: string;
  capacity?: string;
  location?: string;
  description: string;
}

function IltUnitContent() {
  const [sessions, setSessions] = useState<SessionSettings[]>([]);
  const [activeSessionModal, setActiveSessionModal] = useState<string | null>(null);
  const [showUnitOptionsModal, setShowUnitOptionsModal] = useState(false);
  const [showAddSessionForm, setShowAddSessionForm] = useState<string | null>(null);
  const [unitCompletionTrigger, setUnitCompletionTrigger] = useState("when-all-sessions-completed");

  const [formData, setFormData] = useState<Partial<SessionSettings>>({
    name: "",
    date: "06/10/2025",
    startTime: "07:30",
    instructor: "y. yak",
    duration: 30,
    durationUnit: "minutes",
    capacity: "",
    location: "",
    description: "",
    completionTrigger: "when-instructor-provides-feedback",
  });

  const addSession = (type: typeof sessionTypes[0]) => {
    setFormData({
      name: "",
      type: type.id,
      date: "06/10/2025",
      startTime: "07:30",
      instructor: "y. yak",
      duration: 30,
      durationUnit: "minutes",
      capacity: "",
      location: "",
      description: "",
      completionTrigger: "when-instructor-provides-feedback",
    });
    setShowAddSessionForm(type.id);
  };

  const saveNewSession = () => {
    if (!formData.name || !formData.type) return;

    const newSession: SessionSettings = {
      id: `${formData.type}-${Date.now()}`,
      name: formData.name,
      type: formData.type,
      completionTrigger: formData.completionTrigger || "when-instructor-provides-feedback",
      duration: formData.duration || 30,
      durationUnit: formData.durationUnit || "minutes",
      date: formData.date || "06/10/2025",
      startTime: formData.startTime || "07:30",
      instructor: formData.instructor || "y. yak",
      capacity: formData.capacity,
      location: formData.location,
      description: formData.description || "",
    };

    setSessions((prev) => [...prev, newSession]);
    setShowAddSessionForm(null);
    setFormData({});
  };

  const updateSession = (sessionId: string, updated: Partial<SessionSettings>) => {
    setSessions((prev) => prev.map((s) => (s.id === sessionId ? { ...s, ...updated } : s)));
  };

  const deleteSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  const getSessionType = (typeId: string) => sessionTypes.find((t) => t.id === typeId);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ILT Unit Content</h1>
          <p className="text-gray-600 text-lg">
            Add sessions to create your ILT unit.
          </p>
          <p className="text-gray-500 text-sm mt-1">
            Click a session type below to add it.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {sessionTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => addSession(type)}
              className="p-6 border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col items-center gap-3 bg-white w-full"
            >
              <div className={`p-4 rounded-full ${type.color} flex items-center justify-center`}>
                <type.icon className={`w-6 h-6 ${type.iconColor}`} />
              </div>
              <h3 className="font-medium text-gray-900 text-center">{type.name}</h3>
              {type.subtitle && <p className="text-sm text-gray-500 text-center">{type.subtitle}</p>}
            </button>
          ))}
        </div>

        {sessions.length > 0 && (
          <div className="space-y-4 mb-8">
            {sessions.map((session) => {
              const type = getSessionType(session.type);
              const Icon = type?.icon || Monitor;
              const badge = type?.badge || "Online";

              return (
                <div
                  key={session.id}
                  className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg shadow-sm hover:shadow-md hover:bg-blue-50 transition-all bg-white"
                >
                  <div className="flex items-start md:items-center gap-3 w-full md:w-auto">
                    <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
                      <Icon className="w-6 h-6 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{session.name}</h3>
                      <p className="text-sm text-gray-500 flex flex-wrap items-center gap-2 mt-1">
                        <span className="px-2 py-1 bg-gray-200 rounded-full text-xs">{badge}</span>
                        {session.date} • {session.startTime} • {session.duration} {session.durationUnit}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2 md:mt-0">
                    <button
                      onClick={() => setActiveSessionModal(session.id)}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteSession(session.id)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-center md:justify-start">
          <button
            onClick={() => setShowUnitOptionsModal(true)}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            ILT Options
          </button>
        </div>

        {showAddSessionForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-semibold">
                    Add {showAddSessionForm === "in-person" ? "in-person" : "online"} session
                  </h2>
                  <Info className="w-5 h-5 text-blue-500" />
                </div>
                <button onClick={() => setShowAddSessionForm(null)} className="p-1 hover:bg-gray-100 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Name</label>
                  <input
                    type="text"
                    placeholder="Type a session name"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-blue-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Date</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.date || ""}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 pr-10"
                      />
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Start time</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.startTime || ""}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 pr-10"
                      />
                      <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Instructor</label>
                    <select
                      value={formData.instructor || ""}
                      onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50"
                    >
                      <option value="y. yak">y. yak</option>
                    </select>
                  </div>

                  {showAddSessionForm !== "online-external" && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Capacity</label>
                      <input
                        type="text"
                        placeholder="Type the session's capacity"
                        value={formData.capacity || ""}
                        onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                </div>

                {showAddSessionForm === "in-person" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Location</label>
                    <input
                      type="text"
                      placeholder="Type the location for the in-person session"
                      value={formData.location || ""}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Duration</label>
                  <div className="space-y-4">
                    <input
                      type="range"
                      min="1"
                      max="480"
                      value={formData.duration || 30}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex items-center gap-6">
                      <div className="text-2xl font-semibold text-gray-900">{formData.duration || 30}</div>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="durationUnit"
                            value="minutes"
                            checked={formData.durationUnit === "minutes"}
                            onChange={(e) => setFormData({ ...formData, durationUnit: "minutes" })}
                            className="w-5 h-5 text-blue-600"
                          />
                          <span className="text-gray-700">Minutes</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="durationUnit"
                            value="hours"
                            checked={formData.durationUnit === "hours"}
                            onChange={(e) => setFormData({ ...formData, durationUnit: "hours" })}
                            className="w-5 h-5 text-blue-600"
                          />
                          <span className="text-gray-700">Hours</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Description</label>
                  <textarea
                    placeholder={
                      showAddSessionForm === "online-external"
                        ? "Specify meeting URL"
                        : "Type a description"
                    }
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex gap-3 justify-start">
                <button
                  onClick={saveNewSession}
                  disabled={!formData.name}
                  className="px-6 py-2 bg-gray-300 text-gray-500 rounded-lg hover:bg-gray-400 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowAddSessionForm(null)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {activeSessionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md md:max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  {sessions.find((s) => s.id === activeSessionModal)?.name} options
                </h2>
                <button onClick={() => setActiveSessionModal(null)} className="p-1 hover:bg-gray-100 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-gray-600" />
                    <h3 className="font-medium text-gray-900">Complete session</h3>
                  </div>
                  <div className="ml-0 md:ml-7">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Completion trigger</label>
                    <select
                      value={sessions.find((s) => s.id === activeSessionModal)?.completionTrigger}
                      onChange={(e) => updateSession(activeSessionModal, { completionTrigger: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="when-instructor-provides-feedback">when instructor provides feedback</option>
                      <option value="when-session-ends">when session ends</option>
                      <option value="manual-completion">manual completion</option>
                    </select>
                  </div>
                  <div className="ml-0 md:ml-7">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                    <input
                      type="number"
                      min="1"
                      value={sessions.find((s) => s.id === activeSessionModal)?.duration || ""}
                      onChange={(e) => updateSession(activeSessionModal, { duration: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
                <button
                  onClick={() => setActiveSessionModal(null)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save
                </button>
                <button
                  onClick={() => setActiveSessionModal(null)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {showUnitOptionsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md md:max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold">ILT Unit Options</h2>
                <button onClick={() => setShowUnitOptionsModal(false)} className="p-1 hover:bg-gray-100 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-gray-600" />
                    <h3 className="font-medium text-gray-900">Complete unit</h3>
                  </div>
                  <p className="text-sm text-gray-600 ml-7">
                    Define the conditions required for the ILT to be marked as completed.
                  </p>
                  <div className="ml-7">
                    <label className="block text-sm font-medium text-gray-700 mb-2">ILT unit is completed</label>
                    <select
                      value={unitCompletionTrigger}
                      onChange={(e) => setUnitCompletionTrigger(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="when-all-sessions-completed">When all sessions completed</option>
                      <option value="manual-completion">Manual completion</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
                <button
                  onClick={() => setShowUnitOptionsModal(false)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowUnitOptionsModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
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

export default IltUnitContent;
