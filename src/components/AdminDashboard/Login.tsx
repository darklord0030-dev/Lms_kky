import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import AppContent from "./AppContent";

type ViewMode = "signup" | "login" | "view";

export default function Login() {
  const [viewMode, setViewMode] = useState<ViewMode>("signup");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [showResendPopup, setShowResendPopup] = useState(false);

  const navigate = useNavigate();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setResetEmail(value);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError("Please enter a valid email address");
      setIsValid(false);
    } else {
      setEmailError("");
      setIsValid(true);
    }
  };

  // const handleResetPassword = () => {
  //   if (!isValid) return;
  //   setResetLoading(true);
  //   setTimeout(() => {
  //     setResetLoading(false);
  //     toast.success("Reset email sent successfully");
  //     setIsForgotModalOpen(false);
  //   }, 2000);
  // };


  const handleResetPassword = async () => {
  if (!isValid) return;

  try {
    setResetLoading(true);
    // const email = "darklord0030@gmail.com"
    console.log("resetEmail :",resetEmail);
    
    const response = await axios.post(
      "http://localhost:3000/api/auth/request-password-reset", { email: resetEmail });  // assuming you have email in state

    toast.success(response.data.message || "Reset email sent successfully");
    setIsForgotModalOpen(false);
    
  } catch (error) {
    console.error("Reset password error:");
    // toast.error(
    //   error.response?.data?.message || "Failed to send reset email"
    // );
  } finally {
    setResetLoading(false);
  }
};

  const handleSignup = async (formData: {
    firstname: string;
    lastname: string;
    email: string;  
    username: string;
    password: string;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      await axios.post("http://localhost:3000/api/user", formData);
      toast.success("Signup successful");
      setViewMode("view");
    } catch (error: any) {
      const msg = error.response?.data?.message || "Signup failed. Try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

   const handleLogin = async (formData: {
  usernameOrEmail: string;
  password: string;
}) => {
  try {
    setIsLoading(true);

    const response = await axios.post("http://localhost:3000/api/auth/login", formData);

    // const token = response.data?.accessToken;
    const token = response;
    const userType = response.data?.userType;

    console.log("Login Response:", response.data);
    console.log("token:", token);
    

    if (token) {
      localStorage.setItem("token", JSON.stringify(response));;
    }

    toast.success("Login successful");

    // Redirect based on userType
    if (userType === "ADMIN") {
      setViewMode("view"); // or navigate("/dashboard");
    } else if (userType === "LEARNER") {
      // navigate("/");
      alert("Learner logged in, redirecting to Student page.");
    } else {
      console.warn("Unknown userType:", userType);
    }

  } catch (error: any) {
    console.error(error);
    const message =
      error.response?.data?.message || "Something went wrong. Try again.";
    setError(message);
    toast.error(message);
  } finally {
    setIsLoading(false);
  }
};

  const SignupForm = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [formData, setFormData] = useState({
      firstname: "",
      lastname: "",
      email: "",
      username: "",
      password: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!acceptTerms) {
        alert("Please accept the Terms of Service");
        return;
      }
      handleSignup(formData);
    };

    return (
      <div className="bg-white rounded-3xl shadow-2xl p-12 w-full max-w-xl backdrop-blur-md bg-opacity-90">
        <Logo />
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-10">
          Let's start, it's easy!
        </h1>
        {error && <ErrorBox message={error} />}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="First Name"
              value={formData.firstname}
              onChange={(e) =>
                setFormData({ ...formData, firstname: e.target.value })
              }
              required
              className="w-full px-4 py-3 border-2 border-blue-600 rounded-lg"
            />
            <input
              type="text"
              placeholder="Last Name"
              value={formData.lastname}
              onChange={(e) =>
                setFormData({ ...formData, lastname: e.target.value })
              }
              required
              className="w-full px-4 py-3 border-2 border-blue-600 rounded-lg"
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              className="w-full px-4 py-3 border-2 border-blue-600 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Username"
              required
              autoComplete="new-username"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              className="w-full px-4 py-3 border-2 border-blue-600 rounded-lg"
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                autoComplete="new-password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                className="w-full px-4 py-3 border-2 border-blue-600 rounded-lg pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="w-4 h-4"
            />
            I accept the{" "}
            <a href="/terms" target="_blank" className="text-blue-600 underline">
              Terms & Conditions
            </a>
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-full mt-6"
          >
            {isLoading ? "Creating account..." : "Create free account"}
          </button>

          <p className="text-center text-gray-700 text-sm mt-6">
            Already have an account?
            <button
              type="button"
              onClick={() => setViewMode("login")}
              className="text-gray-900 font-semibold ml-1"
            >
              Login
            </button>
          </p>
        </form>
      </div>
    );
  };

  const LoginForm = () => {
    const [formData, setFormData] = useState({
      usernameOrEmail: "",
      password: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleLogin(formData);
    };

    return (
      <div className="bg-white rounded-3xl shadow-2xl p-12 w-full max-w-xl backdrop-blur-md bg-opacity-90">
        <Logo />
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-10">
          Welcome back!
        </h1>
        {error && <ErrorBox message={error} />}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Username or Email"
            value={formData.usernameOrEmail}
            onChange={(e) =>
              setFormData({ ...formData, usernameOrEmail: e.target.value })
            }
            required
            className="w-full px-4 py-3 bg-gray-100 rounded-lg"
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
            className="w-full px-4 py-3 bg-gray-100 rounded-lg"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-full mt-6"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
          <div className="text-center mt-3">
            <span
              className="text-red-500 hover:underline cursor-pointer"
              onClick={() => setIsForgotModalOpen(true)}
            >
              Forgot Password?
            </span>
          </div>
          <p className="text-center text-gray-700 text-sm mt-6">
            Create a new account?
            <button
              type="button"
              onClick={() => setViewMode("signup")}
              className="text-gray-900 font-semibold ml-1"
            >
              Sign Up
            </button>
          </p>
        </form>
      </div>
    );
  };

  const Logo = () => (
    <div className="flex items-center gap-2 justify-center mb-4">
      <div className="bg-orange-500 rounded-full w-8 h-8 flex items-center justify-center">
        <span className="text-white font-bold text-xl">C</span>
      </div>
      <span className="font-semibold text-xl">Lms</span>
    </div>
  );

  const ErrorBox = ({ message }: { message: string }) => (
    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
      {message}
    </div>
  );

 return (
  <>
    {/* Show Login/Signup UI only if not in view mode */}
    {viewMode !== "view" && (
      <div className="min-h-screen w-full flex items-center justify-center p-4 bg-cover bg-center">
        {viewMode === "signup" && <SignupForm />}
        {viewMode === "login" && <LoginForm />}
      </div>
    )}

    {/* Show main app content after successful login/signup */}
    {viewMode === "view" && (
      <div className="min-h-screen w-full bg-white">
        <AppContent />
      </div>
    )}

    {/* Forgot Password Modal */}
    {isForgotModalOpen && (
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-50"
        onClick={() => setIsForgotModalOpen(false)}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl p-7 w-[420px] relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
            onClick={() => setIsForgotModalOpen(false)}
          >
            ✕
          </button>
          <h2 className="text-2xl font-semibold text-gray-900 text-center">
            Forgot Password?
          </h2>
          <p className="text-gray-500 text-center mt-1 text-sm">
            Enter your email to receive a secure password reset link.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleResetPassword();
            }}
            className="mt-6"
          >
            <label className="text-sm font-medium text-gray-700">
              Registered Email
            </label>
            <input
              type="email"
              placeholder="email@company.com"
              value={resetEmail}
              onChange={handleEmailChange}
              // value={email}
              // onChange={(e) => setEmail(e.target.value)}
              required
              className={`w-full border p-3 rounded-lg mt-1 outline-none transition ${
                emailError
                  ? "border-red-500 focus:ring-red-400"
                  : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-400"
              }`}
            />
            {emailError && (
              <p className="text-red-500 text-sm mt-1">{emailError}</p>
            )}
            <button
              type="submit"
              disabled={!isValid || resetLoading}
              className={`mt-4 w-full py-3 rounded-lg font-semibold transition-colors ${
                isValid
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-gray-300 text-gray-600 cursor-not-allowed"
              }`}
            >
              {resetLoading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "8px" }}>
            <a
              href="#"
              style={{
                color: "#2563eb",
                textDecoration: "underline",
                fontWeight: 300,
                fontSize: "0.85rem",
                fontFamily: "Inter, Arial, sans-serif",
                transition: "color 0.2s ease",
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = "#d8261d")}
              onMouseOut={(e) => (e.currentTarget.style.color = "#2563eb")}
              onClick={(e) => {
                e.preventDefault();
                setShowResendPopup(true);
                setTimeout(() => setShowResendPopup(false), 3000);
              }}
            >
              Resend link
            </a>

            {showResendPopup && (
              <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                <div className="bg-white rounded-lg shadow-xl p-6 w-80 text-center animate-fadeIn">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Link Sent Again!
                  </h3>
                  <p className="text-sm text-gray-600 mt-2">
                    A new reset link has been sent to your email.
                  </p>
                  <button
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                    onClick={() => setShowResendPopup(false)}
                  >
                    OK
                  </button>
                </div>
              </div>
            )}
          </div>

          <p className="text-xs text-gray-400 text-center mt-4">
            We never share your email with anyone.
          </p>
        </div>
      </div>
    )}
  </>
);
}
