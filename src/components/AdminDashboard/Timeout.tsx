import { useState } from "react";
import { Eye } from "lucide-react";
import timeoutIllustration from "../assets/timeout.png";

export default function Timeout() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-[#4a4a4a] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-[640px] p-12 relative">
        <h1 className="text-2xl font-semibold text-gray-900 mb-12">
          Just to be safe, we logged you out
        </h1>

        <div className="flex flex-col items-center justify-center py-12">
          <img
            src={timeoutIllustration} // dynamic illustration
            alt="timeout"
            className="w-80 mb-4"
          />

          <div className="mb-8">
            <p className="text-gray-700 text-center mb-8">
              Enter your password to pick up where you left off
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Password <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  <Eye size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
