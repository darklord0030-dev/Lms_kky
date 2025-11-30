import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Components & Pages
import Layout from "./Layout";
import { DashboardStats } from "./DashboardStats";
import QuickActions from "./QuickActions";
import { RecentActivity } from "./RecentActivity";
import ReportChart from "./ReportChart";
import UserPage from "./UserPage";
import UserDetailsPage from "./UserDetailsPage";
import { CourseGrid } from "./CourseGrid";
import CourseDetailsPage from "./CourseDetailsPage";
import AddUser from "./AddUser";
import UnitOptions from "./UnitOptions";
import { Skills } from "./Skills";
import { CalendarDays } from "./CalendarDays";
import Notification from "./Notification";
import Reports from "./Reports";
import ReportsLandingPage from "./ReportsLandingPage";
import UserReport from "./UserReport";
import CourseReport from "./CourseReport";
import CustomReport from "./CustomReport";
import { Messages } from "./Messages";
import Settings from "./Settings";
import GroupsPage from "./GroupsPage";
import GroupsMainPage from "./GroupsMainPage";
import AddGroupForm from "./AddGroupForm";
import WorkflowBuilder from "./WorkflowBuilder";
import { Help } from "./Help";
import CourseBuilder from "./CourseBuilder";
import VideoPlayer from "./VideoPlayer";
import CourseManager from "./CourseManager";
import Reset from "./Reset";
import CoursePlayer from "./CoursePlayer";
import CourseApp from "./CourseApp";
import StudentApp from "../LearnerDashboard/StudentApp";
import StudentView from "./StudentView";
import TeacherView from "./TeacherView";
import AdminCourseCreator from "./AdminCourseCreator";
import CertificatesPage from "../LearnerDashboard/CertificatesPage";
import AssignmentsPage from "../LearnerDashboard/AssignmentsPage";
import TestPage from "../LearnerDashboard/TestsPage";
import Home from "../LearnerDashboard/Home";
import CourseCard from "../LearnerDashboard/CourseCard";

// ------------------------------------
// Stub Component
// ------------------------------------
const AddUserType: React.FC<{
  onClose: () => void;
  onSave: (data: { name: string; permissions: string[] }) => void;
}> = ({ onClose, onSave }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-xl font-bold mb-4">Add User Type</h2>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => {
            onSave({ name: "New UserType", permissions: [] });
            onClose();
          }}
        >
          Save
        </button>
        <button
          className="mt-2 px-4 py-2 bg-gray-300 text-black rounded"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

// ------------------------------------
// Main Component
// ------------------------------------
export default function AppContent() {
  const location = useLocation();

  const [isUserTypeModalOpen, setIsUserTypeModalOpen] = useState(false);
  const [userTypes, setUserTypes] = useState<
    { name: string; permissions: string[] }[]
  >([]);

  // ⭐ ADDED: userType state for Sidebar/Header
  const [userType, setUserType] = useState<"admin" | "learner">("learner");

  // ⭐ ADDED: load userType from localStorage token (uppercase → lowercase)
  useEffect(() => {
    const stored = localStorage.getItem("token");
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored);

      const rawType =
        parsed?.data?.userType ||
        parsed?.data?.usertype ||
        parsed?.userType ||
        parsed?.usertype;

      if (rawType) {
        const normalized = rawType.toLowerCase();

        if (normalized === "admin" || normalized === "learner") {
          setUserType(normalized);
        }
      }
    } catch (e) {
      console.error("Failed to parse user token:", e);
    }
  }, []);

  const openUserTypeModal = () => setIsUserTypeModalOpen(true);
  const closeUserTypeModal = () => setIsUserTypeModalOpen(false);

  const handleSaveUserType = (data: { name: string; permissions: string[] }) => {
    setUserTypes((prev) => [...prev, data]);
  };

  const isCourseBuilderPage = location.pathname === "/coursebuilder";

  return (
    <>
      <Toaster position="top-right" />

      {/* Modal */}
      {isUserTypeModalOpen && (
        <AddUserType
          onClose={closeUserTypeModal}
          onSave={handleSaveUserType}
        />
      )}

      {/* If CourseBuilder page → render without Layout */}
      {isCourseBuilderPage ? (
        <Routes>
          <Route path="/coursebuilder" element={<CourseBuilder />} />
        </Routes>
      ) : (

        // ⭐ PASSED userType to Layout (important!)
        <Layout userType={userType}>
          <Routes>
            {/* Dashboard */}
            <Route
              path="/dashboard"
              element={
                <div className="space-y-8">
                  <DashboardStats />
                  <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
                    <QuickActions />
                    <div className="space-y-8">
                      <RecentActivity />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
                    <ReportChart />
                  </div>
                </div>
              }
            />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Users */}
            <Route path="/users" element={<UserPage />} />
            <Route path="/userdetails/user/:id" element={<UserDetailsPage />} />

            {/* Courses */}
            <Route path="/courses" element={<CourseGrid />} />
            <Route path="/coursedetails/:id" element={<CourseDetailsPage />} />
            <Route path="/adduser" element={<AddUser />} />
            <Route path="/unitoption" element={<UnitOptions />} />
            <Route path="/Setup" element={<CourseManager />} />
            <Route path="/view" element={<CourseApp />} />
            <Route path="/student" element={<CoursePlayer />} />

            {/* Skills */}
            <Route path="/skills" element={<Skills />} />

            {/* Calendar */}
            <Route path="/calendar" element={<CalendarDays />} />

            {/* Notifications */}
            <Route path="/notification" element={<Notification />} />

            {/* Reports */}
            <Route path="/reports" element={<Reports />}>
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<ReportsLandingPage />} />
              <Route path="user/:id" element={<UserReport />} />
              <Route path="courses" element={<CourseReport />} />
              <Route path="custom" element={<CustomReport />} />
            </Route>

            {/* Messages */}
            <Route path="/messages" element={<Messages />} />

            {/* Settings */}
            <Route
              path="/settings"
              element={<Settings onNavigateToAddUserType={openUserTypeModal} />}
            />

            {/* Groups */}
            <Route path="/groups" element={<GroupsPage />} />
            <Route path="/groupsmainpage" element={<GroupsMainPage />} />
            <Route
              path="/addgroupform"
              element={
                <AddGroupForm
                  onBack={() => {}}
                  groups={[]}
                  setGroups={() => {}}
                />
              }
            />

            {/* Workflow */}
            <Route path="/workflow" element={<WorkflowBuilder />} />

            {/* Help */}
            <Route path="/help" element={<Help />} />

            {/* Media & Tools */}
            <Route path="/video" element={<VideoPlayer />} />
            <Route path="/reset" element={<Reset />} />

            {/* Student & Teacher */}
            <Route path="/new" element={<StudentApp />} />
            <Route path="/learner" element={<StudentView />} />
            <Route path="/teacher" element={<TeacherView />} />

            {/* Admin Course Creator */}
            <Route path="/admin" element={<AdminCourseCreator />} />

            {/* Learner Dashboard */}
            <Route path="/certificates" element={<CertificatesPage />} />
            <Route path="/assignments" element={<AssignmentsPage />} />
            <Route path="/home" element={<Home />} />
            <Route path="/card" element={<CourseCard />} />
            <Route path="/testpage" element={<TestPage />} />

            {/* Default - Catch all */}
            {/* <Route path="*" element={<Navigate to="/dashboard" replace />} /> */}
          </Routes>
        </Layout>
      )}
    </>
  );
}
