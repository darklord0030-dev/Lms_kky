// App.tsx
import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";

// Layout & Sidebar
import Layout from "./components/AdminDashboard/Layout";
import ProtectedRoute from "./components/AdminDashboard/ProtectedRoute";

// LMS Pages
import { DashboardStats } from "./components/AdminDashboard/DashboardStats";
import { CourseGrid } from "./components/AdminDashboard/CourseGrid";
import { RecentActivity } from "./components/AdminDashboard/RecentActivity";
import UserPage from "./components/AdminDashboard/UserPage";
import { Skills } from "./components/AdminDashboard/Skills";

import QuickActions from "./components/AdminDashboard/QuickActions";
import CustomReport from "./components/AdminDashboard/CustomReport";
import ReportChart from "./components/AdminDashboard/ReportChart";
import { CalendarDays } from "./components/AdminDashboard/CalendarDays";
import { Help } from "./components/AdminDashboard/Help";
import { Messages } from "./components/AdminDashboard/Messages";
import Notification from "./components/AdminDashboard/Notification";
import Reports from "./components/AdminDashboard/Reports";
import UserReport from "./components/AdminDashboard/UserReport";
import CourseReport from "./components/AdminDashboard/CourseReport";
import ReportsLandingPage from "./components/AdminDashboard/ReportsLandingPage";
import Settings from "./components/AdminDashboard/Settings";
import Workflow from "./components/AdminDashboard/Workflow";
import UserDetailsPage from "./components/AdminDashboard/UserDetailsPage";
import CourseDetailsPage from "./components/AdminDashboard/CourseDetailsPage";
import GroupsMainPage from "./components/AdminDashboard/GroupsMainPage";
import GroupsPage from "./components/AdminDashboard/GroupsPage";
import AddGroupForm from "./components/AdminDashboard/AddGroupForm";
import CourseBuilder from "./components/AdminDashboard/CourseBuilder";
import AddUser from "./components/AdminDashboard/AddUser";
import UnitOptions from "./components/AdminDashboard/UnitOptions";
import Login from "./components/AdminDashboard/Login";
import Timeout from "./components/AdminDashboard/Timeout";
import VideoPlayer from "./components/AdminDashboard/VideoPlayer";
import AppContent from "./components/AdminDashboard/AppContent";
import Reset from "./components/AdminDashboard/Reset";
import CourseManager from "./components/AdminDashboard/CourseManager";
import CourseApp from  "./components/AdminDashboard/CourseApp";
import CoursePlayer from "./components/AdminDashboard/CoursePlayer";
import StudentApp from "./components/LearnerDashboard/StudentApp";
import TeacherView from "./components/AdminDashboard/TeacherView";
import StudentView from "./components/AdminDashboard/StudentView";
import { AuthProvider } from "./components/AdminDashboard/AuthContext";
import Teacher from "./components/AdminDashboard/Teacher";
import AdminCourseCreator from "./components/AdminDashboard/AdminCourseCreator";
import TestPage from "./components/LearnerDashboard/TestsPage";
import CertificatesPage from "./components/LearnerDashboard/CertificatesPage";
import AssignmentsPage from "./components/LearnerDashboard/AssignmentsPage";
import Home from "./components/LearnerDashboard/Home";




// --- Main App ---
export default function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [userType, setUserType] = useState<'admin' | 'teacher' | 'learner'>('admin'); // Add userType state

  return (
    <Router>
      {authenticated ? <AppContent userType={userType} /> : <Login setAuthenticated={setAuthenticated} setUserType={setUserType} />}
    </Router>
  );
}