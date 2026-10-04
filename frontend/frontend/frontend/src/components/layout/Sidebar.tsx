import {
  LayoutDashboard,
  GraduationCap,
  Users,
  UserRound,
  BookOpen,
  Link2,
  Layers,
  ClipboardCheck,
  Bell,
  FileText,
  Wallet,
  CalendarDays,
  Megaphone,
  CalendarRange,
  Settings,
  LogOut,
  UserCog,
  BarChart3,
  UserPlus,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const menuGroups = [
  {
    title: "MAIN",
    items: [
      {
        name: "Dashboard",
        path: "/admin",
        icon: LayoutDashboard,
      },
    ],
  },

  {
    title: "PEOPLE",
    items: [
      {
        name: "User Management",
        path: "/admin/users",
        icon: UserCog,
      },
      {
        name: "Students",
        path: "/admin/students",
        icon: GraduationCap,
      },
      {
        name: "Student Enrollments",
        path: "/admin/student-enrollments",
        icon: UserPlus,
      },
      {
        name: "Teachers",
        path: "/admin/teachers",
        icon: Users,
      },
      {
        name: "Parents",
        path: "/admin/parents",
        icon: UserRound,
      },
      {
        name: "Parent-Student Links",
        path: "/admin/parent-student-links",
        icon: Link2,
      },
    ],
  },

  {
    title: "ACADEMICS",
    items: [
      {
        name: "Academic Years",
        path: "/admin/academic-years",
        icon: CalendarRange,
      },
      {
        name: "Classes",
        path: "/admin/classes",
        icon: BookOpen,
      },
      {
        name: "Sections",
        path: "/admin/sections",
        icon: Layers,
      },
      {
        name: "Subjects",
        path: "/admin/subjects",
        icon: BookOpen,
      },
      {
        name: "Class Subjects",
        path: "/admin/class-subjects",
        icon: Layers,
      },
      {
        name: "Teacher Assignments",
        path: "/admin/teacher-assignments",
        icon: Users,
      },
      {
        name: "Attendance",
        path: "/admin/attendance",
        icon: ClipboardCheck,
      },
      {
        name: "Homework",
        path: "/admin/homework",
        icon: FileText,
      },
      {
        name: "Submissions",
        path: "/admin/homework-submissions",
        icon: ClipboardCheck,
      },
    ],
  },

  {
    title: "EXAMS",
    items: [
      {
        name: "Examinations",
        path: "/admin/exams",
        icon: FileText,
      },
      {
        name: "Exam Subjects",
        path: "/admin/exam-subjects",
        icon: BookOpen,
      },
      {
        name: "Marks",
        path: "/admin/marks",
        icon: GraduationCap,
      },
    ],
  },

  {
    title: "FINANCE",
    items: [
      {
        name: "Fee Structures",
        path: "/admin/fee-structures",
        icon: Wallet,
      },
      {
        name: "Student Fees",
        path: "/admin/student-fees",
        icon: Wallet,
      },
      {
        name: "Payments",
        path: "/admin/payments",
        icon: Wallet,
      },
      {
        name: "Reports",
        path: "/admin/reports",
        icon: BarChart3,
      },
      {
        name: "Timetable",
        path: "/admin/timetable",
        icon: CalendarDays,
      },
    ],
  },

  {
    title: "COMMUNICATION",
    items: [
      {
        name: "Announcements",
        path: "/admin/announcements",
        icon: Megaphone,
      },
      {
        name: "Notifications",
        path: "/admin/notifications",
        icon: Bell,
      },
    ],
  },
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

function Sidebar({
  isOpen,
  setIsOpen,
}: SidebarProps) {
  const { logout } = useAuth();

  return (
    <>
      {/* Mobile Overlay */}

      {isOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
        />
      )}

      {/* Sidebar */}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[260px] flex-col border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out ${
          isOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >

        {/* Logo */}

        <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-slate-100 px-6">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20">
              <GraduationCap
                size={22}
                className="text-white"
              />
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                School<span className="text-blue-600">MS</span>
              </h1>

              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                Management System
              </p>
            </div>

          </div>

          {/* Mobile Close */}

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 lg:hidden"
            aria-label="Close menu"
          >
            <X size={21} />
          </button>

        </div>

        {/* Navigation */}

        <div className="flex-1 overflow-y-auto px-4 py-5">

          {menuGroups.map((group) => (

            <div
              key={group.title}
              className="mb-6"
            >

              <p className="mb-2 px-3 text-[10px] font-bold tracking-widest text-slate-400">
                {group.title}
              </p>

              <nav className="space-y-1">

                {group.items.map((item) => {

                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === "/admin"}
                      onClick={() => setIsOpen(false)}
                      className={({ isActive }) =>
                        `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                          isActive
                            ? "bg-blue-50 text-blue-600 shadow-sm"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon
                            size={19}
                            strokeWidth={
                              isActive ? 2.5 : 2
                            }
                          />

                          <span>{item.name}</span>
                        </>
                      )}
                    </NavLink>
                  );

                })}

              </nav>

            </div>

          ))}

        </div>

        {/* Bottom */}

        <div className="shrink-0 border-t border-slate-100 p-4">

          <NavLink
            to="/admin/settings"
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              `mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`
            }
          >
            <Settings size={19} />

            <span>Settings</span>
          </NavLink>

          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-50"
          >
            <LogOut size={19} />

            <span>Logout</span>
          </button>

        </div>

      </aside>
    </>
  );
}

export default Sidebar;