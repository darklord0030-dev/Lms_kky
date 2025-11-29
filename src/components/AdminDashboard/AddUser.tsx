import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { User, UserCircle2, ChevronDown } from "lucide-react";
import axios from "axios";

export default function AddUserForm() {
  const location = useLocation();
  const editingUser = location.state?.user;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: editingUser?.firstname || "",
    lastName: editingUser?.lastname || "",
    email: editingUser?.email || "",
    bio: editingUser?.bio || "",
    username: editingUser?.username || "",
    password: "",
    language: editingUser?.language || "English",
    usertype: editingUser?.usertype || "Super-Admin",
    gender: editingUser?.gender || "male",
    isActive: editingUser?.active ?? true,
    inActive: editingUser?.inActive || "",
   
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    
    const lastLogin = new Date().toISOString(); 

    const payload = {
      firstname: formData.firstName.trim(),
      lastname: formData.lastName.trim(),
      email: formData.email.trim(),
      bio: formData.bio.trim(),
      username: formData.username.trim(),
      password: formData.password || undefined,
      language: formData.language,
      usertype: formData.usertype.toUpperCase().replace("-", "_"),
      gender: formData.gender,
      active: formData.isActive,
      inActive: formData.inActive || null,
      token: null,
      lastLogin,
    };

    try {
      let response;

      if (editingUser?.id) {
        // Update user
        response = await axios.put(
          `http://localhost:3000/api/user/${Number(editingUser.id)}`,
          payload
        );
      } else {
        // Create user
        response = await axios.post(
          "http://localhost:3000/api/user",
          payload
        );
      }

      const savedUser = response.data.data; // ✅ actual user object
      navigate("/users", { state: { user: savedUser } });

    } catch (error: any) {
      console.error("❌ Error saving user:", error);
      alert("Failed to save user. Check console for details.");
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      bio: "",
      username: "",
      password: "",
      language: "English",
      usertype: "Learner",
      gender: "male",
      isActive: true,
      inActive: "",
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-8 py-8">
        <h1 className="text-4xl font-normal mb-8">
          {editingUser ? "Edit User" : "Add User"}
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="flex gap-8">
            {/* Avatar */}
            <div className="w-64 flex-shrink-0">
              <div className="bg-orange-500 rounded-lg w-64 h-96 flex items-center justify-center">
                {formData.gender === "male" ? (
                  <User className="w-32 h-32 text-white" strokeWidth={1.5} />
                ) : (
                  <UserCircle2 className="w-32 h-32 text-white" strokeWidth={1.5} />
                )}
              </div>
            </div>

            {/* Personal Info */}
            <div className="flex-1 space-y-6">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  First name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Last name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={8}
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Credentials */}
          <div className="mt-12 max-w-2xl space-y-6">
            <h2 className="text-2xl font-normal mb-6">Sign in credentials</h2>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })} 
               className="w-full px-4 py-3 bg-gray-50 border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
               aria-required
            />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Type new password"
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400 placeholder:italic"
             required
             />
              <p className="mt-2 text-sm text-gray-600 italic">
                Passwords must be at least 8 characters, with uppercase, lowercase, and number.
              </p>
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Language</label>
              <div className="relative">
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-10"
                >
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* User Type */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                User type <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  required
                  value={formData.usertype}
                  onChange={(e) => setFormData({ ...formData, usertype: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-10"
                >
                  <option>Super-Admin</option>
                  <option>Admin</option>
                  <option>Instructor</option>
                  <option>Learner</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Gender <span className="text-red-500">*</span></label>
              <div className="relative">
                <select
                  required
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-10"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Active/Deactivate */}
            <div className="flex gap-6 items-center">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600"
                />
                Active
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!formData.inActive}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      inActive: e.target.checked ? new Date().toISOString() : "",
                    })
                  }
                  className="w-5 h-5 rounded border-gray-300 text-blue-600"
                />
                Deactivate at
              </label>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 mt-8">
              <button
                type="submit"
                className="px-8 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-8 py-3 bg-gray-200 text-gray-900 font-medium rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
