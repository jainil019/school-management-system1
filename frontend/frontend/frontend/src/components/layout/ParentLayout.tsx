import {
  Bell,
  BookOpen,
  CalendarCheck,
  ClipboardList,
  DollarSign,
  FileText,
  GraduationCap,
  Home,
  LogOut,
  Menu,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import {
  getMyChildren,
  type ParentChild,
} from "../../api/parentChildren";

function ParentLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [children, setChildren] = useState<ParentChild[]>([]);
  const [childrenLoading, setChildrenLoading] = useState(true);

  useEffect(() => {
    const loadChildren = async () => {
      try {
        setChildrenLoading(true);

        const data = await getMyChildren();

        setChildren(data);
      } catch (error) {
        console.error("Failed to load parent children:", error);
        setChildren([]);
      } finally {
        setChildrenLoading(false);
      }
    };

    void loadChildren();
  }, []);

  /*
   * Use the first linked child as the default child
   * for child-specific sidebar pages.
   *
   * The parent can select another child from
   * My Children.
   */
  const firstChild = children[0];

  const childProfilePath = firstChild
    ? `/parent/profile/${firstChild.student_id}`
    : "/parent/children";

  const attendancePath = firstChild
    ? `/parent/attendance/${firstChild.student_id}`
    : "/parent/children";

  const homeworkPath = firstChild
    ? `/parent/homework/${firstChild.student_id}`
    : "/parent/children";

  const homeworkSubmissionsPath = firstChild
    ? `/parent/homework-submissions/${firstChild.student_id}`
    : "/parent/children";

  const examinationsPath = firstChild
    ? `/parent/examinations/${firstChild.student_id}`
    : "/parent/children";

  const marksPath = firstChild
    ? `/parent/marks/${firstChild.student_id}`
    : "/parent/children";

  const feesPath = firstChild
    ? `/parent/fees/${firstChild.student_id}`
    : "/parent/children";
    

  const announcementsPath = "/parent/announcements";

  const notificationsPath = "/parent/notifications";

  const menuItems = [
    {
      label: "Dashboard",
      path: "/parent",
      icon: Home,
    },
    {
      label: "My Children",
      path: "/parent/children",
      icon: Users,
    },
    {
      label: "Child Profile",
      path: childProfilePath,
      icon: UserRound,
      disabled: childrenLoading || !firstChild,
    },
    {
  label: "My Profile",
  path: "/parent/profile",
  icon: UserRound,
},
    {
      label: "Attendance",
      path: attendancePath,
      icon: CalendarCheck,
      disabled: childrenLoading || !firstChild,
    },
    {
      label: "Homework",
      path: homeworkPath,
      icon: BookOpen,
      disabled: childrenLoading || !firstChild,
    },
    {
      label: "Homework Submissions",
      path: homeworkSubmissionsPath,
      icon: ClipboardList,
      disabled: childrenLoading || !firstChild,
    },
    {
      label: "Examinations",
      path: examinationsPath,
      icon: ClipboardList,
      disabled: childrenLoading || !firstChild,
    },
    {
      label: "Marks / Results",
      path: marksPath,
      icon: FileText,
      disabled: childrenLoading || !firstChild,
    },
    {
      label: "Fees",
      path: feesPath,
      icon: DollarSign,
      disabled: childrenLoading || !firstChild,
    },
    {
      label: "Announcements",
      path: announcementsPath,
      icon: Bell,
    },
    {
      label: "Notifications",
      path: notificationsPath,
      icon: Bell,
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleNavigation = (
    event: React.MouseEvent<HTMLAnchorElement>,
    disabled?: boolean
  ) => {
    if (disabled) {
      event.preventDefault();
      return;
    }

    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <header className="fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
        >
          <Menu className="h-6 w-6" />
        </button>

        <div className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-indigo-600" />

          <span className="font-bold text-slate-900">
            School Management
          </span>
        </div>

        <div className="w-10" />
      </header>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[335px] flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0 ${
          mobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-20 items-center justify-between border-b border-slate-200 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>

            <div>
              <h1 className="font-bold text-slate-900">
                School Management
              </h1>

              <p className="text-xs text-slate-500">
                Parent Portal
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User */}
        <div className="border-b border-slate-100 p-5">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-100">
              <UserRound className="h-5 w-5 text-indigo-600" />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">
                {user?.email || "Parent"}
              </p>

              <p className="text-xs font-medium text-indigo-600">
                PARENT
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav
          className="flex-1 overflow-y-auto overflow-x-hidden px-5 py-6"
          style={{ scrollbarWidth: "thin" }}
        >
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Parent Portal
          </p>

          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.label}
                  to={item.path}
                  end={item.path === "/parent"}
                  onClick={(event) =>
                    handleNavigation(
                      event,
                      item.disabled
                    )
                  }
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                      item.disabled
                        ? "cursor-not-allowed text-slate-300"
                        : isActive
                          ? "bg-indigo-50 text-indigo-700"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`
                  }
                >
                  <Icon className="h-5 w-5 shrink-0" />

                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Logout */}
        <div className="border-t border-slate-200 p-5">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            <LogOut className="h-5 w-5" />

            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="min-h-screen min-w-0 overflow-x-hidden lg:ml-[335px]">
        <div className="pt-16 lg:pt-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default ParentLayout;