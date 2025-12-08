import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { User, UserCircle2, ChevronDown } from "lucide-react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
  username: string;
  password: string;
  language: string;
  usertype: string;
  gender: string;
  isActive: boolean;
  inActive: string;
};

export default function AddUserForm() {
  const location = useLocation();
  const editingUser = (location.state as any)?.user || null;
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormState>({
    firstName: editingUser?.firstname || "",
    lastName: editingUser?.lastname || "",
    email: editingUser?.email || "",
    bio: editingUser?.bio || "",
    username: editingUser?.username || "",
    password: "",
    language: editingUser?.language || "English",
    usertype: editingUser?.usertype ? prettifyUserType(editingUser.usertype) : "Super-Admin",
    gender: editingUser?.gender || "male",
    isActive: editingUser?.active ?? true,
    inActive: editingUser?.inActive || "",
  });

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pwStrength, setPwStrength] = useState<"empty" | "weak" | "medium" | "strong">("empty");

  // helpers
  function toApiUserType(value: string) {
    return value.toUpperCase().replace("-", "_").replace(" ", "_");
  }
  function prettifyUserType(apiValue: string) {
    // from SUPER_ADMIN -> Super-Admin
    return apiValue
      .toLowerCase()
      .split("_")
      .map((s) => s[0].toUpperCase() + s.slice(1))
      .join("-");
  }

  useEffect(() => {
    // compute password strength
    const pw = formData.password || "";
    if (!pw) return setPwStrength("empty");

    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;

    if (score <= 1) setPwStrength("weak");
    else if (score === 2 || score === 3) setPwStrength("medium");
    else setPwStrength("strong");
  }, [formData.password]);

  const validate = (): boolean => {
    const err: Record<string, string> = {};

    if (!formData.firstName.trim()) err.firstName = "First name is required";
    if (!formData.lastName.trim()) err.lastName = "Last name is required";
    if (!formData.username.trim()) err.username = "Username is required";

    // simple email regex
    if (!formData.email.trim()) err.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      err.email = "Invalid email format";

    // password: required only on create
    if (!editingUser && formData.password.length < 8)
      err.password = "Password must be at least 8 characters";

    // when password provided on update, ensure min length
    if (editingUser && formData.password && formData.password.length > 0 && formData.password.length < 8)
      err.password = "Password must be at least 8 characters";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the errors before saving.");
      return;
    }

    const payload: any = {
      firstname: formData.firstName.trim(),
      lastname: formData.lastName.trim(),
      email: formData.email.trim(),
      bio: formData.bio.trim(),
      username: formData.username.trim(),
      language: formData.language,
      usertype: toApiUserType(formData.usertype),
      gender: formData.gender,
      active: formData.isActive,
      inActive: formData.inActive || null,
      // registrationDate left to backend default (Prisma)
      lastLogin: editingUser?.lastLogin || new Date().toISOString(),
      token: null,
    };

    if (formData.password && formData.password.length >= 8) {
      payload.password = formData.password;
    }

    try {
      let response;
      if (editingUser?.id) {
        response = await axios.put(`http://localhost:3000/api/user/${editingUser.id}`, payload);
        toast.success("User updated successfully");
      } else {
        response = await axios.post("http://localhost:3000/api/user", payload);
        toast.success("User created successfully");
      }
      const savedUser = response.data.data;
      navigate("/users", { state: { user: savedUser } });
    } catch (error: any) {
      console.error("Error saving user:", error);
      const msg = error?.response?.data?.error || "Failed to save user";
      toast.error(msg);
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
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-white">
      <Toaster position="top-right" />
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
                  <UserCircle2
                    className="w-32 h-32 text-white"
                    strokeWidth={1.5}
                  />
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
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className={`w-full px-4 py-3 bg-gray-50 border-0 rounded-md focus:outline-none focus:ring-2 ${errors.firstName ? "focus:ring-red-500" : "focus:ring-blue-500"}`}
                />
                {errors.firstName && <p className="text-sm text-red-600 mt-1">{errors.firstName}</p>}
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
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className={`w-full px-4 py-3 bg-gray-50 border-0 rounded-md focus:outline-none focus:ring-2 ${errors.lastName ? "focus:ring-red-500" : "focus:ring-blue-500"}`}
                />
                {errors.lastName && <p className="text-sm text-red-600 mt-1">{errors.lastName}</p>}
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
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className={`w-full px-4 py-3 bg-gray-50 border-0 rounded-md focus:outline-none focus:ring-2 ${errors.email ? "focus:ring-red-500" : "focus:ring-blue-500"}`}
                />
                {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  rows={8}
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Credentials */}
          <div className="mt-12 max-w-2xl space-y-6">
            <h2 className="text-2xl font-normal mb-6">Sign in credentials</h2>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className={`w-full px-4 py-3 bg-gray-50 border-0 rounded-md focus:outline-none focus:ring-2 ${errors.username ? "focus:ring-red-500" : "focus:ring-blue-500"}`}
              />
              {errors.username && <p className="text-sm text-red-600 mt-1">{errors.username}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Password
              </label>

              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder={
                  editingUser ? "Type new password (optional)" : "Type password"
                }
                className={`w-full px-4 py-3 bg-gray-50 border-0 rounded-md focus:outline-none focus:ring-2 placeholder:text-gray-400 placeholder:italic ${errors.password ? "focus:ring-red-500" : "focus:ring-blue-500"}`}
                required={!editingUser}
              />

              {pwStrength !== "empty" && (
                <div className="mt-2">
                  <div className="h-2 w-full bg-gray-200 rounded">
                    <div
                      className={`h-2 rounded ${pwStrength === "weak" ? "w-1/4 bg-red-500" : pwStrength === "medium" ? "w-2/4 bg-yellow-400" : "w-3/4 bg-green-500"}`}
                    />
                  </div>
                  <p className="text-sm mt-1 italic">
                    {pwStrength === "weak" && "Weak password"}
                    {pwStrength === "medium" && "Medium strength"}
                    {pwStrength === "strong" && "Strong password"}
                  </p>
                </div>
              )}

              {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password}</p>}

              <p className="mt-2 text-sm text-gray-600 italic">
                Passwords must be at least 8 characters, with uppercase,
                lowercase, and number.
              </p>
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Language
              </label>
              <div className="relative">
                <select
                  value={formData.language}
                  onChange={(e) =>
                    setFormData({ ...formData, language: e.target.value })
                  }
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
                  onChange={(e) =>
                    setFormData({ ...formData, usertype: e.target.value })
                  }
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
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Gender <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  required
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-10"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Active / Deactivate */}
            <div className="flex gap-6 items-center">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
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
