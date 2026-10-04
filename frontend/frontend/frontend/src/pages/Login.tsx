import { useState } from "react";
import { Eye, EyeOff, GraduationCap, Lock, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (error: any) {
      setError(
        error.response?.data?.detail ||
          "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-2">

      {/* Left Section */}
      <div className="relative hidden overflow-hidden bg-slate-950 lg:flex">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 via-transparent to-indigo-600/20" />

        <div className="relative z-10 flex w-full flex-col justify-between p-12">

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600">
              <GraduationCap
                size={25}
                className="text-white"
              />
            </div>

            <span className="text-2xl font-bold text-white">
              School<span className="text-blue-400">MS</span>
            </span>
          </div>

          <div className="max-w-lg">
            <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-blue-400">
              School Management Platform
            </p>

            <h1 className="text-5xl font-bold leading-tight text-white">
              Manage your school
              <span className="text-blue-400">
                {" "}smarter.
              </span>
            </h1>

            <p className="mt-6 text-lg leading-8 text-slate-400">
              Manage students, teachers, attendance, academics,
              fees and communication from one powerful platform.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-2xl font-bold text-white">
                  120+
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Students
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-2xl font-bold text-white">
                  25+
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Teachers
                </p>
              </div>
            </div>
          </div>

          <p className="text-sm text-slate-500">
            © 2026 SchoolMS. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          {/* Mobile Logo */}
          <div className="mb-10 flex items-center justify-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600">
              <GraduationCap
                size={25}
                className="text-white"
              />
            </div>

            <span className="text-2xl font-bold">
              School<span className="text-blue-600">MS</span>
            </span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Welcome back 👋
            </h2>

            <p className="mt-2 text-slate-500">
              Sign in to access your school dashboard.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email address
              </label>

              <div className="relative">
                <Mail
                  size={19}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@school.com"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Password
              </label>

              <div className="relative">
                <Lock
                  size={19}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-12 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

          </form>

          <p className="mt-8 text-center text-xs text-slate-400">
            Secure school management system
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;