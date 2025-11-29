import React from "react";
import { DashboardStats } from "../components/AdminDashboard/DashboardStats";
import { EmployeeDashboard } from "../components/EmployeeDashboard/EmployeeDashboard";

interface DashboardProps {
  role: "admin" | "employee";
}

export const Dashboard: React.FC<DashboardProps> = ({ role }) => {
  return (
    <div className="p-6">
      {role === "admin" ? <DashboardStats /> : <EmployeeDashboard />}
    </div>
  );
};
