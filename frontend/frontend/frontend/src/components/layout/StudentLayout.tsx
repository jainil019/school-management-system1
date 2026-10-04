import { useState } from "react";
import {
  Bell,
  BookOpen,
  CalendarCheck,
  ClipboardList,
  GraduationCap,
  Home,
  LogOut,
  Megaphone,
  UserRound,
  Users,
  Trophy,
  Menu,
  X,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const menuItems = [
  {
    label: "Dashboard",
    path: "/student",
    icon: Home,
  },
  {
    label: "My Profile",
    path: "/student/profile",
    icon: UserRound,
  },
  {
    label: "My Classes",
    path: "/student/classes",
    icon: Users,
  },
  {
    label: "Attendance",
    path: "/student/attendance",
    icon: CalendarCheck,
  },
  {
    label: "Homework",
    path: "/student/homework",
    icon: BookOpen,
  },
  {
    label: "Homework Submissions",
    path: "/student/homework-submissions",
    icon: ClipboardList,
  },
  {
    label: "Examinations",
    path: "/student/examinations",
    icon: ClipboardList,
  },
  {
    label: "Marks / Results",
    path: "/student/marks",
    icon: Trophy,
  },
  {
    label: "Announcements",
    path: "/student/announcements",
    icon: Megaphone,
  },
  {
    label: "Notifications",
    path: "/student/notifications",
    icon: Bell,
  },
];

function StudentLayout() {
  const { user, logout } = useAuth();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50">

      {/* =====================================================
          MOBILE HEADER
      ===================================================== */}

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

          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
            <GraduationCap
              size={20}
              className="text-white"
            />
          </div>

          <div>
            <div className="text-base font-bold text-slate-900">
              School<span className="text-blue-600">MS</span>
            </div>

            <p className="text-[9px] text-slate-400">
              Student Portal
            </p>
          </div>

        </div>

      </header>

      {/* =====================================================
          MOBILE OVERLAY
      ===================================================== */}

      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
        />
      )}

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[335px] max-w-[90vw] flex-col border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out ${
          isSidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >

        {/* Logo */}

        <div className="flex h-20 shrink-0 items-center justify-between border-b border-slate-200 px-6 sm:px-7">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600">
              <GraduationCap
                size={25}
                className="text-white"
              />
            </div>

            <div>
              <div className="text-xl font-bold text-slate-900">
                School<span className="text-blue-600">MS</span>
              </div>

              <p className="text-xs text-slate-400">
                Student Portal
              </p>
            </div>

          </div>

          {/* Close button - mobile only */}

          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 lg:hidden"
            aria-label="Close menu"
          >
            <X size={21} />
          </button>

        </div>

        {/* Navigation */}

        <nav
          className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-5 sm:px-5 sm:py-6"
          style={{ scrollbarWidth: "thin" }}
        >

          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Student Menu
          </p>

          <div className="space-y-1">

            {menuItems.map((item) => {

              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/student"}
                  onClick={() => setIsSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? "bg-blue-50 text-blue-600"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`
                  }
                >
                  <Icon size={19} />

                  <span>{item.label}</span>
                </NavLink>
              );

            })}

          </div>

        </nav>

        {/* User / Logout */}

        <div className="shrink-0 border-t border-slate-200 p-4 sm:p-5">

          <div className="mb-4 flex items-center gap-3 rounded-xl bg-slate-50 p-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
              {user?.email?.charAt(0).toUpperCase() || "S"}
            </div>

            <div className="min-w-0">

              <p className="truncate text-sm font-semibold text-slate-800">
                {user?.email || "Student"}
              </p>

              <p className="text-xs text-slate-400">
                Student
              </p>

            </div>

          </div>

          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={19} />

            <span>Logout</span>
          </button>

        </div>

      </aside>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="min-h-screen min-w-0 pt-16 lg:ml-[335px] lg:pt-0">

        {/* Desktop Top Header */}

        <header className="sticky top-0 z-30 hidden h-20 items-center justify-between border-b border-slate-200 bg-white px-6 sm:px-8 lg:flex">

          <div>

            <p className="text-sm text-slate-400">
              Student Portal
            </p>

            <h1 className="text-lg font-semibold text-slate-900">
              Welcome back
            </h1>

          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
            <Bell
              size={19}
              className="text-blue-600"
            />
          </div>

        </header>

        {/* Page Content */}

        <div className="min-w-0 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>

      </main>

    </div>
  );
}

export default StudentLayout;