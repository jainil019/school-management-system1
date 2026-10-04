import { useMemo, useState } from "react";
import {
  Award,
  Bell,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Home,
  LogOut,
  Megaphone,
  Search,
  Users,
  Menu,
  X,
} from "lucide-react";

import { NavLink, Outlet, useNavigate } from "react-router-dom";

const menuItems = [
  {
    label: "Dashboard",
    path: "/teacher",
    icon: Home,
  },
  {
    label: "My Classes",
    path: "/teacher/classes",
    icon: BookOpen,
  },
  {
    label: "My Students",
    path: "/teacher/students",
    icon: Users,
  },
  {
    label: "Attendance",
    path: "/teacher/attendance",
    icon: ClipboardCheck,
  },
  {
    label: "Homework",
    path: "/teacher/homework",
    icon: FileText,
  },
  {
    label: "Homework Submissions",
    path: "/teacher/homework-submissions",
    icon: FileText,
  },
  {
    label: "Examinations",
    path: "/teacher/examinations",
    icon: CalendarDays,
  },
  {
    label: "Marks",
    path: "/teacher/marks",
    icon: Award,
  },
  {
    label: "Announcements",
    path: "/teacher/announcements",
    icon: Megaphone,
  },
];

export default function TeacherLayout() {
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const teacher = useMemo(() => {
    try {
      const stored = localStorage.getItem("user");

      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Ignore invalid local storage data
    }

    return null;
  }, []);

  const teacherEmail = teacher?.email || "teacher@school.com";

  const teacherName =
    teacher?.first_name || teacher?.name || "Teacher";

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", {
      replace: true,
    });
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50">

      {/* ================================================= */}
      {/* MOBILE HEADER */}
      {/* ================================================= */}

      <header className="fixed left-0 right-0 top-0 z-30 flex h-16 items-center border-b border-slate-200 bg-white px-4 lg:hidden">

        <button
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        <div className="ml-3 flex items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600">
            <GraduationCap
              size={20}
              className="text-white"
            />
          </div>

          <div>
            <div className="text-base font-bold text-slate-900">
              School<span className="text-blue-600">MS</span>
            </div>

            <p className="text-[9px] font-medium tracking-wide text-slate-400">
              TEACHER PORTAL
            </p>
          </div>
        </div>
      </header>

      {/* ================================================= */}
      {/* MOBILE OVERLAY */}
      {/* ================================================= */}

      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={closeSidebar}
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
        />
      )}

      {/* ================================================= */}
      {/* LEFT SIDEBAR */}
      {/* ================================================= */}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[335px] max-w-[90vw] flex-col border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out ${
          isSidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* ================================================= */}
        {/* LOGO */}
        {/* ================================================= */}

        <div className="flex h-[92px] shrink-0 items-center justify-between border-b border-slate-100 px-6 sm:px-8">

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <GraduationCap size={26} />
            </div>

            <div>
              <h1 className="text-[20px] font-bold tracking-tight text-slate-900">
                School
                <span className="text-blue-600">MS</span>
              </h1>

              <p className="mt-0.5 text-[11px] font-medium tracking-wider text-slate-400">
                MANAGEMENT SYSTEM
              </p>
            </div>

          </div>

          {/* Mobile close button */}

          <button
            type="button"
            onClick={closeSidebar}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 lg:hidden"
            aria-label="Close menu"
          >
            <X size={21} />
          </button>

        </div>

        {/* ================================================= */}
        {/* MENU */}
        {/* ================================================= */}

        <nav
          className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-5 sm:px-5 sm:py-6"
          style={{
            scrollbarWidth: "thin",
          }}
        >
          {/* MAIN */}

          <p className="mb-3 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Main
          </p>

          <div className="space-y-1">

            <NavLink
              to="/teacher"
              end
              onClick={closeSidebar}
              className={({ isActive }) =>
                `flex h-12 items-center gap-4 rounded-xl px-4 text-[15px] font-medium transition ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`
              }
            >
              <Home size={21} />
              <span>Dashboard</span>
            </NavLink>

          </div>

          {/* ACADEMICS */}

          <p className="mb-3 mt-7 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Academics
          </p>

          <div className="space-y-1">

            {menuItems
              .filter((item) => item.path !== "/teacher")
              .map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={closeSidebar}
                    className={({ isActive }) =>
                      `flex min-h-12 items-center gap-4 rounded-xl px-4 py-3 text-[15px] font-medium transition ${
                        isActive
                          ? "bg-blue-50 text-blue-600"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`
                    }
                  >
                    <Icon
                      size={21}
                      className="shrink-0"
                    />

                    <span className="min-w-0">
                      {item.label}
                    </span>
                  </NavLink>
                );
              })}

          </div>

          {/* ACCOUNT */}

          <p className="mb-3 mt-7 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Account
          </p>

          <NavLink
            to="/teacher/notifications"
            onClick={closeSidebar}
            className={({ isActive }) =>
              `flex h-12 items-center gap-4 rounded-xl px-4 text-[15px] font-medium transition ${
                isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`
            }
          >
            <Bell
              size={21}
              className="shrink-0"
            />

            <span>Notifications</span>
          </NavLink>

        </nav>

        {/* ================================================= */}
        {/* LOGOUT */}
        {/* ================================================= */}

        <div className="shrink-0 border-t border-slate-100 px-4 py-4 sm:px-5 sm:py-5">

          <button
            type="button"
            onClick={logout}
            className="flex h-12 w-full items-center gap-4 rounded-xl px-4 text-[15px] font-medium text-red-500 transition hover:bg-red-50"
          >
            <LogOut
              size={21}
              className="shrink-0"
            />

            <span>Logout</span>
          </button>

        </div>
      </aside>

      {/* ================================================= */}
      {/* RIGHT SIDE */}
      {/* ================================================= */}

      <div className="min-w-0 lg:pl-[335px]">

        {/* ================================================= */}
        {/* DESKTOP TOP HEADER */}
        {/* ================================================= */}

        <header className="sticky top-0 z-30 hidden h-[92px] items-center justify-between border-b border-slate-200 bg-white px-6 sm:px-9 lg:flex">

          {/* Search */}

          <div className="flex w-full max-w-[415px] items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5">

            <Search
              size={21}
              className="shrink-0 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search anything..."
              className="ml-3 min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />

            <span className="ml-2 shrink-0 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-400">
              Ctrl K
            </span>

          </div>

          {/* Right side */}

          <div className="ml-6 flex shrink-0 items-center gap-4 xl:gap-6">

            {/* Notification */}

            <button
              type="button"
              onClick={() =>
                navigate("/teacher/notifications")
              }
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-50 hover:text-blue-600"
            >
              <Bell size={23} />

              <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500" />
            </button>

            <div className="h-9 w-px bg-slate-200" />

            {/* User */}

            <button
              type="button"
              onClick={() => navigate("/teacher")}
              className="flex min-w-0 items-center gap-3"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                {teacherName.charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0 text-left">
                <p className="max-w-[220px] truncate text-sm font-semibold text-slate-900">
                  {teacherEmail}
                </p>

                <p className="mt-0.5 text-xs text-slate-400">
                  Teacher
                </p>
              </div>
            </button>

          </div>
        </header>

        {/* ================================================= */}
        {/* PAGE CONTENT */}
        {/* ================================================= */}

        <main className="min-h-screen min-w-0 bg-slate-50 pt-16 lg:min-h-[calc(100vh-92px)] lg:pt-0">
          <div className="min-w-0 p-4 sm:p-6 lg:p-9">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
}