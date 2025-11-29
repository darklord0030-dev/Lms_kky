import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, Clock, Users, X } from "lucide-react";
import axios from "axios";

type EventType = "webinar" | "deadline" | "assessment" | "training" | "workshop";

interface Event {
  id: number;
  title: string;
  date: Date;
  type: EventType;
  description?: string;
  duration?: string;
  instructor?: string;
  attendees?: number;
  course?: string;
}

export const CalendarDays: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "error" } | null>(null);

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // ----------- Calendar Utilities -------------
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));
    return days;
  };

  const getWeekDays = (date: Date) => {
    const dayOfWeek = date.getDay();
    const start = new Date(date);
    start.setDate(date.getDate() - dayOfWeek);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  };

  const getEventsForDate = (date: Date | null) => {
    if (!date) return [];
    return events.filter(
      (e) =>
        e.date.getDate() === date.getDate() &&
        e.date.getMonth() === date.getMonth() &&
        e.date.getFullYear() === date.getFullYear()
    );
  };

  const getEventColor = (type: EventType) => {
    switch (type) {
      case "webinar":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "deadline":
        return "bg-red-100 text-red-800 border-red-200";
      case "assessment":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "training":
        return "bg-green-100 text-green-800 border-green-200";
      case "workshop":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const navigate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (view === "month")
      newDate.setMonth(currentDate.getMonth() + (direction === "next" ? 1 : -1));
    else if (view === "week")
      newDate.setDate(currentDate.getDate() + (direction === "next" ? 7 : -7));
    else newDate.setDate(currentDate.getDate() + (direction === "next" ? 1 : -1));
    setCurrentDate(newDate);
  };

  // ----------- EVENT HANDLERS -------------

  const handleSaveEvent = async (data: any) => {
    try {
      const dateString = data.date as string;
      const timeString = data.time as string;
      const finalDate = new Date(`${dateString}T${timeString || "00:00"}`);

      const newEvent: Event = {
        id: selectedEvent ? selectedEvent.id : Date.now(),
        title: data.title as string,
        date: finalDate,
        type: data.type as EventType,
        description: data.description as string,
        duration: data.duration as string,
        instructor: data.instructor as string,
        course: data.course as string,
      };

      setEvents((prev) => {
        if (selectedEvent) {
          // update
          return prev.map((ev) => (ev.id === selectedEvent.id ? newEvent : ev));
        }
        // add
        return [...prev, newEvent];
      });

      setToast({
        message: selectedEvent ? "Event updated successfully" : "Event added successfully",
        type: "success",
      });
      setShowModal(false);
      setSelectedEvent(null);
    } catch (err) {
      console.error(err);
      setToast({ message: "Failed to save event", type: "error" });
    }
  };

  const handleDeleteEvent = (id: number) => {
    setEvents((prev) => prev.filter((ev) => ev.id !== id));
    setToast({ message: "Event deleted", type: "info" });
    setShowModal(false);
    setSelectedEvent(null);
  };

  // ----------- RENDER CALENDAR (same as your version) -----------
  const renderCalendar = () => {
    if (view === "month") {
      return (
        <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
          {daysOfWeek.map((day) => (
            <div key={day} className="bg-gray-50 p-3 text-center text-sm font-medium text-gray-900">
              {day}
            </div>
          ))}
          {getDaysInMonth(currentDate).map((date, idx) => {
            const dayEvents = getEventsForDate(date);
            const today = new Date();
            const isToday =
              date &&
              date.getDate() === today.getDate() &&
              date.getMonth() === today.getMonth() &&
              date.getFullYear() === today.getFullYear();
            return (
              <div
                key={idx}
                className={`bg-white p-2 min-h-[80px] border-r border-b border-gray-100 ${
                  !date ? "bg-gray-50" : ""
                }`}
              >
                {date && (
                  <>
                    <div
                      className={`text-sm font-medium mb-1 ${
                        isToday
                          ? "bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center"
                          : "text-gray-900"
                      }`}
                    >
                      {date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((ev) => (
                        <div
                          key={ev.id}
                          className={`text-xs p-1 rounded border ${getEventColor(ev.type)} truncate cursor-pointer`}
                          onClick={() => {
                            setSelectedEvent(ev);
                            setShowModal(true);
                          }}
                        >
                          {ev.title}{" "}
                          {ev.date.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      );
    }

    if (view === "week") {
      const weekDays = getWeekDays(currentDate);
      return (
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((date, idx) => {
            const dayEvents = getEventsForDate(date);
            return (
              <div key={idx} className="bg-white p-2 rounded-lg border border-gray-200">
                <div className="text-sm font-medium text-gray-900 mb-2">
                  {daysOfWeek[date.getDay()]} {date.getDate()}
                </div>
                <div className="space-y-1">
                  {dayEvents.length ? (
                    dayEvents.map((ev) => (
                      <div
                        key={ev.id}
                        className={`text-xs p-1 rounded border ${getEventColor(ev.type)} cursor-pointer`}
                        onClick={() => {
                          setSelectedEvent(ev);
                          setShowModal(true);
                        }}
                      >
                        {ev.title}{" "}
                        {ev.date.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-gray-400">No events</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    if (view === "day") {
      const dayEvents = getEventsForDate(currentDate);
      return (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">
            {daysOfWeek[currentDate.getDay()]}, {months[currentDate.getMonth()]}{" "}
            {currentDate.getDate()}, {currentDate.getFullYear()}
          </h3>
          <div className="space-y-3">
            {dayEvents.length ? (
              dayEvents.map((ev) => (
                <div
                  key={ev.id}
                  className={`p-3 rounded border ${getEventColor(ev.type)} cursor-pointer`}
                  onClick={() => {
                    setSelectedEvent(ev);
                    setShowModal(true);
                  }}
                >
                  <h4 className="font-medium">{ev.title}</h4>
                  <p className="text-sm">
                    {ev.date.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-gray-500">No events for today</div>
            )}
          </div>
        </div>
      );
    }
  };

  // ----------- RETURN UI -----------
  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600">Manage your learning schedule</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(["month", "week", "day"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1 rounded-md text-sm font-medium capitalize transition-colors ${
                  view === v
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            onClick={() => setShowModal(true)}
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Calendar + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {months[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigate("prev")}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Today
              </button>
              <button
                onClick={() => navigate("next")}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          {renderCalendar()}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-semibold mb-3">Upcoming Events</h3>
            <div className="space-y-3">
              {events
                .sort((a, b) => a.date.getTime() - b.date.getTime())
                .slice(0, 5)
                .map((ev) => (
                  <div
                    key={ev.id}
                    className="border-l-4 border-blue-600 pl-3 cursor-pointer"
                    onClick={() => {
                      setSelectedEvent(ev);
                      setShowModal(true);
                    }}
                  >
                    <h4 className="font-medium text-gray-900">{ev.title}</h4>
                    <div className="text-sm text-gray-600 mt-1 flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>
                        {ev.date.toLocaleDateString()}{" "}
                        {ev.date.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {ev.instructor && (
                      <div className="text-sm text-gray-600 flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{ev.instructor}</span>
                      </div>
                    )}
                  </div>
                ))}
              {events.length === 0 && (
                <div className="text-gray-400">No upcoming events</div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-semibold mb-3">This Month</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Events</span>
                <span className="font-medium">{events.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Deadlines</span>
                <span className="font-medium text-red-600">
                  {events.filter((e) => e.type === "deadline").length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Webinars</span>
                <span className="font-medium text-blue-600">
                  {events.filter((e) => e.type === "webinar").length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Assessments</span>
                <span className="font-medium text-yellow-600">
                  {events.filter((e) => e.type === "assessment").length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Trainings</span>
                <span className="font-medium text-green-600">
                  {events.filter((e) => e.type === "training").length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Workshops</span>
                <span className="font-medium text-purple-600">
                  {events.filter((e) => e.type === "workshop").length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white w-96 rounded-lg p-6 shadow-lg relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={() => {
                setShowModal(false);
                setSelectedEvent(null);
              }}
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold mb-4">
              {selectedEvent ? "Edit Event" : "Add Event"}
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const data = Object.fromEntries(formData.entries());
                handleSaveEvent({ ...selectedEvent, ...data });
              }}
              className="space-y-3"
            >
              <input
                type="text"
                name="title"
                defaultValue={selectedEvent?.title}
                placeholder="Title"
                required
                className="w-full border px-3 py-2 rounded"
              />
              <input
                type="date"
                name="date"
                defaultValue={
                  selectedEvent
                    ? selectedEvent.date.toISOString().split("T")[0]
                    : ""
                }
                required
                className="w-full border px-3 py-2 rounded"
              />
              <input
                type="time"
                name="time"
                defaultValue={
                  selectedEvent
                    ? selectedEvent.date.toTimeString().split(" ")[0].slice(0, 5)
                    : ""
                }
                className="w-full border px-3 py-2 rounded"
              />
              <select
                name="type"
                defaultValue={selectedEvent?.type || "training"}
                className="w-full border px-3 py-2 rounded"
              >
                <option value="training">Training</option>
                <option value="webinar">Webinar</option>
                <option value="workshop">Workshop</option>
                <option value="deadline">Deadline</option>
                <option value="assessment">Assessment</option>
              </select>
              <textarea
                name="description"
                defaultValue={selectedEvent?.description}
                placeholder="Description"
                className="w-full border px-3 py-2 rounded"
              />
              <input
                type="text"
                name="duration"
                defaultValue={selectedEvent?.duration}
                placeholder="Duration"
                className="w-full border px-3 py-2 rounded"
              />
              <input
                type="text"
                name="instructor"
                defaultValue={selectedEvent?.instructor}
                placeholder="Instructor"
                className="w-full border px-3 py-2 rounded"
              />
              <input
                type="text"
                name="course"
                defaultValue={selectedEvent?.course}
                placeholder="Course"
                className="w-full border px-3 py-2 rounded"
              />
              <div className="flex justify-between mt-4">
                {selectedEvent && (
                  <button
                    type="button"
                    onClick={() => handleDeleteEvent(selectedEvent.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                  >
                    Delete
                  </button>
                )}
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded ml-auto"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 px-4 py-2 rounded-lg shadow-lg text-white animate-fade-in
          ${toast.type === "success" ? "bg-green-600" : ""}
          ${toast.type === "info" ? "bg-blue-600" : ""}
          ${toast.type === "error" ? "bg-red-600" : ""}`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
};
