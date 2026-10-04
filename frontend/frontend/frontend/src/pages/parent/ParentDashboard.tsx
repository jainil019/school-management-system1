import { useEffect, useState } from "react";
import {
  Bell,
  BookOpen,
  CalendarCheck,
  ChevronRight,
  GraduationCap,
  IndianRupee,
  LayoutDashboard,
  LogOut,
  UserRound,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import {
  getMyChildren,
  type ParentChild,
} from "../../api/parentChildren";

function ParentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [children, setChildren] = useState<ParentChild[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadChildren = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getMyChildren();

        setChildren(data);
      } catch (err) {
        console.error(
          "Failed to load children:",
          err
        );

        setError(
          "Failed to load children. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    void loadChildren();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const firstChild = children[0] ?? null;

  const activeChildren = children.filter(
    (child) => child.status === "ACTIVE"
  );

  // ==========================================================
  // CHILD PATH HELPER
  // ==========================================================

  const openChildPath = (
    path: (studentId: number) => string
  ) => {
    if (firstChild) {
      navigate(path(firstChild.student_id));
    } else {
      navigate("/parent/children");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <header className="border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between px-6 py-5">
          <div>
            <div className="flex items-center gap-2">
              <LayoutDashboard className="h-6 w-6 text-indigo-600" />

              <h1 className="text-2xl font-bold text-slate-900">
                Parent Dashboard
              </h1>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Welcome back! Manage your children's school information.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </header>

      {/* ================================================== */}
      {/* MAIN */}
      {/* ================================================== */}

     <main className="min-w-0 space-y-6 p-4 sm:space-y-8 sm:p-6">
        {/* Error */}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* ================================================== */}
        {/* WELCOME */}
        {/* ================================================== */}

        <section className="w-full min-w-0 overflow-hidden rounded-2xl bg-indigo-600 p-4 text-white shadow-sm sm:p-6">
         <div className="flex min-w-0 flex-col justify-between gap-5 md:flex-row md:items-center">
           <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-indigo-100">
                Welcome back
              </p>

              <h2 className="mt-1 break-words text-xl font-bold sm:text-2xl">
                {user?.email}
              </h2>

              <p className="mt-2 max-w-xl text-sm text-indigo-100">
                Keep track of your children's attendance,
                homework, examinations, results, fees,
                announcements and more.
              </p>
            </div>

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
              <UserRound className="h-8 w-8" />
            </div>
          </div>
        </section>

        {/* ================================================== */}
        {/* STATISTICS */}
        {/* ================================================== */}

        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* My Children */}

          <button
            type="button"
            onClick={() =>
              navigate("/parent/children")
            }
            className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  My Children
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {loading
                    ? "..."
                    : children.length}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </button>

          {/* Active Children */}

          <button
            type="button"
            onClick={() =>
              navigate("/parent/children")
            }
            className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Active Children
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {loading
                    ? "..."
                    : activeChildren.length}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                <GraduationCap className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </button>

          {/* Attendance */}

          <button
            type="button"
            onClick={() =>
              openChildPath(
                (studentId) =>
                  `/parent/attendance/${studentId}`
              )
            }
            className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Attendance
                </p>

                <p className="mt-2 text-lg font-bold text-slate-900">
                  View Details
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                <CalendarCheck className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </button>

          {/* Fees */}

          <button
            type="button"
            onClick={() =>
              openChildPath(
                (studentId) =>
                  `/parent/fees/${studentId}`
              )
            }
            className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Fees
                </p>

                <p className="mt-2 text-lg font-bold text-slate-900">
                  View Details
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
                <IndianRupee className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </button>
        </section>

        {/* ================================================== */}
        {/* MY CHILDREN */}
        {/* ================================================== */}

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                My Children
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Students linked to your parent account.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/parent/children")
              }
              className="flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              View All

              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="py-10 text-center">
                <p className="text-sm text-slate-500">
                  Loading children...
                </p>
              </div>
            ) : children.length === 0 ? (
              <div className="py-10 text-center">
                <Users className="mx-auto h-10 w-10 text-slate-300" />

                <p className="mt-3 font-medium text-slate-700">
                  No children linked
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Contact the school administrator to link a student
                  to your account.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/parent/children")
                  }
                  className="mt-5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  Open My Children
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {children.slice(0, 4).map(
                  (child) => (
                    <div
                      key={child.link_id}
                      className="flex items-center justify-between rounded-xl border border-slate-200 p-4 transition hover:border-indigo-200 hover:bg-indigo-50/30"
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100">
                          {child.photo_url ? (
                            <img
                              src={child.photo_url}
                              alt={`${child.first_name} ${child.last_name}`}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <UserRound className="h-6 w-6 text-slate-400" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate font-semibold text-slate-900">
                            {child.first_name}{" "}
                            {child.last_name}
                          </h3>

                          <p className="mt-1 text-xs text-slate-500">
                            Admission No:{" "}
                            {child.admission_no}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            Relationship:{" "}
                            {child.relationship}
                          </p>

                          <p
                            className={`mt-1 text-xs font-semibold ${
                              child.status ===
                              "ACTIVE"
                                ? "text-emerald-600"
                                : "text-red-600"
                            }`}
                          >
                            {child.status}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/parent/profile/${child.student_id}`
                          )
                        }
                        className="ml-3 shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-indigo-600"
                        title="View child profile"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </section>

        {/* ================================================== */}
        {/* QUICK ACTIONS */}
        {/* ================================================== */}

        <section>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Quickly access your children's school information.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* My Children */}

            <button
              type="button"
              onClick={() =>
                navigate("/parent/children")
              }
              className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50">
                <Users className="h-5 w-5 text-indigo-600" />
              </div>

              <h3 className="mt-4 font-semibold text-slate-900">
                My Children
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                View your linked children.
              </p>

              <div className="mt-4 flex items-center text-sm font-semibold text-indigo-600">
                Open
                <ChevronRight className="ml-1 h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </button>

            {/* Profile */}

            <button
              type="button"
              onClick={() =>
                openChildPath(
                  (studentId) =>
                    `/parent/profile/${studentId}`
                )
              }
              className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50">
                <UserRound className="h-5 w-5 text-indigo-600" />
              </div>

              <h3 className="mt-4 font-semibold text-slate-900">
                Child Profile
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                View your child's profile.
              </p>

              <div className="mt-4 flex items-center text-sm font-semibold text-indigo-600">
                Open
                <ChevronRight className="ml-1 h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </button>

            {/* Attendance */}

            <button
              type="button"
              onClick={() =>
                openChildPath(
                  (studentId) =>
                    `/parent/attendance/${studentId}`
                )
              }
              className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                <CalendarCheck className="h-5 w-5 text-blue-600" />
              </div>

              <h3 className="mt-4 font-semibold text-slate-900">
                Attendance
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Check your child's attendance.
              </p>

              <div className="mt-4 flex items-center text-sm font-semibold text-blue-600">
                Open
                <ChevronRight className="ml-1 h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </button>

            {/* Homework */}

            <button
              type="button"
              onClick={() =>
                openChildPath(
                  (studentId) =>
                    `/parent/homework/${studentId}`
                )
              }
              className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50">
                <BookOpen className="h-5 w-5 text-amber-600" />
              </div>

              <h3 className="mt-4 font-semibold text-slate-900">
                Homework
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                View assigned homework.
              </p>

              <div className="mt-4 flex items-center text-sm font-semibold text-amber-600">
                Open
                <ChevronRight className="ml-1 h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </button>

            {/* Homework Submissions */}

            <button
              type="button"
              onClick={() =>
                openChildPath(
                  (studentId) =>
                    `/parent/homework-submissions/${studentId}`
                )
              }
              className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50">
                <BookOpen className="h-5 w-5 text-cyan-600" />
              </div>

              <h3 className="mt-4 font-semibold text-slate-900">
                Homework Submissions
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Check submitted homework.
              </p>

              <div className="mt-4 flex items-center text-sm font-semibold text-cyan-600">
                Open
                <ChevronRight className="ml-1 h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </button>

            {/* Examinations */}

            <button
              type="button"
              onClick={() =>
                openChildPath(
                  (studentId) =>
                    `/parent/examinations/${studentId}`
                )
              }
              className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-purple-300 hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50">
                <GraduationCap className="h-5 w-5 text-purple-600" />
              </div>

              <h3 className="mt-4 font-semibold text-slate-900">
                Examinations
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                View examinations.
              </p>

              <div className="mt-4 flex items-center text-sm font-semibold text-purple-600">
                Open
                <ChevronRight className="ml-1 h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </button>

            {/* Marks */}

            <button
              type="button"
              onClick={() =>
                openChildPath(
                  (studentId) =>
                    `/parent/marks/${studentId}`
                )
              }
              className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
                <GraduationCap className="h-5 w-5 text-emerald-600" />
              </div>

              <h3 className="mt-4 font-semibold text-slate-900">
                Marks / Results
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                View examination results.
              </p>

              <div className="mt-4 flex items-center text-sm font-semibold text-emerald-600">
                Open
                <ChevronRight className="ml-1 h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </button>

            {/* Fees */}

            <button
              type="button"
              onClick={() =>
                openChildPath(
                  (studentId) =>
                    `/parent/fees/${studentId}`
                )
              }
              className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50">
                <IndianRupee className="h-5 w-5 text-amber-600" />
              </div>

              <h3 className="mt-4 font-semibold text-slate-900">
                Fees
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                View fees and payment history.
              </p>

              <div className="mt-4 flex items-center text-sm font-semibold text-amber-600">
                Open
                <ChevronRight className="ml-1 h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </button>

            {/* Announcements */}

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/parent/announcements"
                )
              }
              className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-rose-300 hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50">
                <Bell className="h-5 w-5 text-rose-600" />
              </div>

              <h3 className="mt-4 font-semibold text-slate-900">
                Announcements
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                View school announcements.
              </p>

              <div className="mt-4 flex items-center text-sm font-semibold text-rose-600">
                Open
                <ChevronRight className="ml-1 h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </button>

            {/* Notifications */}

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/parent/notifications"
                )
              }
              className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-purple-300 hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50">
                <Bell className="h-5 w-5 text-purple-600" />
              </div>

              <h3 className="mt-4 font-semibold text-slate-900">
                Notifications
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Check your latest notifications.
              </p>

              <div className="mt-4 flex items-center text-sm font-semibold text-purple-600">
                Open
                <ChevronRight className="ml-1 h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default ParentDashboard;