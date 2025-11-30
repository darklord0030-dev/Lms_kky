// ProtectedRoute.tsx
import { Navigate } from "react-router-dom";

export type ProtectedProps = {
  children: React.ReactNode;
  allowed?: string[];         // <-- ADD THIS
  userType?: string;          // <-- AND THIS
};

export default function ProtectedRoute({
  children,
  allowed,
  userType,
}: ProtectedProps) {
  const token = localStorage.getItem("token");

  // Block if not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If allowed roles are defined, enforce them
  if (allowed && userType && !allowed.includes(userType.toLowerCase())) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
