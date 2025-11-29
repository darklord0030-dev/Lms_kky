import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { Key } from 'lucide-react';
import axios from "axios";


function Reset() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwiZW1haWwiOiJjaGFuZGFueTA5MjJAZ21haWwuY29tIiwiaWF0IjoxNzYzMjc5MTEyLCJleHAiOjE3NjMzNjU1MTJ9.qR3lPTbqvNnAuHHeKLjUUv1H_uG7pFaM81ZbT33Z23s";

  const navigate = useNavigate();

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // -----------------------
    // VALIDATION
    // -----------------------
    if (!newPassword || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    // -----------------------
    // API CALL
    // -----------------------
    try {
      const res = await axios.post(
        `http://localhost:3000/api/auth/reset-password/${token}`,
        { newPassword }, // <-- Send JSON object (not string)
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Data:", res.data);
      setSuccess(true);

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleCancel = () => {
    setNewPassword("");
    setConfirmPassword("");
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-blue-600 p-8 flex justify-center">
          <div className="bg-blue-700 rounded-full p-6 shadow-lg">
            <Key className="w-16 h-16 text-white" strokeWidth={2.5} />
          </div>
        </div>

        <div className="p-8">
          <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">
            Reset Password
          </h1>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {error && <div className="text-red-600 text-sm text-center">{error}</div>}
            {success && (
              <div className="text-green-600 text-sm text-center">
                Password reset successfully!
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleContinue}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 font-medium"
              >
                Continue
              </button>

              <button
                onClick={handleCancel}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reset;

