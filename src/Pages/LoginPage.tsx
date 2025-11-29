// LoginPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaFacebookF, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { Lock, User } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Fake check: you can replace with API later
    if (username === "admin" && password === "admin123") {
      navigate("/admin"); // redirect to admin page
    } else {
      alert("Invalid credentials. Try admin/admin123");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-100 to-blue-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-2">
          Let's Get Started
        </h2>
        <p className="text-gray-500 text-center mb-6">
          Sign in to continue to Gilded Admin.
        </p>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleLogin}>
          {/* Username */}
          <div className="relative">
            <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="h-4 w-4 text-blue-600" />
              <span className="text-gray-600">Remember Me</span>
            </label>
            <button
              type="button"
              className="text-blue-600 hover:underline flex items-center gap-1"
            >
              <Lock className="w-3 h-3" /> Forgot pwd?
            </button>
          </div>

          {/* Sign In button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md shadow hover:bg-blue-700 transition"
          >
            SIGN IN
          </button>
        </form>

        {/* Sign Up */}
        <p className="text-center text-gray-600 text-sm mt-6">
          Don’t have an account?{" "}
          <a href="#" className="text-blue-600 hover:underline font-medium">
            Sign Up
          </a>
        </p>

        {/* Social login */}
        <div className="mt-6">
          <p className="text-center text-gray-400 text-sm mb-4">- Sign With -</p>
          <div className="flex justify-center gap-4">
            <button className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 text-blue-600 hover:bg-blue-200 transition">
              <FaFacebookF />
            </button>
            <button className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 text-black hover:bg-gray-200 transition">
              <FaXTwitter />
            </button>
            <button className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 text-pink-500 hover:bg-pink-200 transition">
              <FaInstagram />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
