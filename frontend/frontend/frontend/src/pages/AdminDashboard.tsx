import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  GraduationCap,
  Loader2,
  RefreshCw,
  UserRound,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  getAdminDashboard,
  type AdminDashboardStats,
} from "../api/admin";

// ============================================================
// HELPERS
// ============================================================

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatDateRange(start: string, end: string) {
  const startDate = formatDate(start);
  const endDate = formatDate(end);

  if (startDate === endDate) {
    return startDate;
  }

  return `${startDate} – ${endDate}`;
}

function timeAgo(value: string) {
  if (!value) return "-";

  const timestamp = new Date(value).getTime();

  if (Number.isNaN(timestamp)) {
    return formatDate(value);
  }

  const seconds = Math.max(
    0,
    Math.floor((Date.now() - timestamp) / 1000),
  );

  if (seconds < 60) {
    return "Just now";
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hr ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }

  return formatDate(value);
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 17) {
    return "Good afternoon";
  }

  return "Good evening";
}

// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: LucideIcon;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        <Icon size={21} />
      </div>

      <p className="mt-5 text-sm font-medium text-slate-500">
        {title}
      </p>

      <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
        {value}
      </h2>

      <p className="mt-2 text-xs text-emerald-600">
        Live database data
      </p>
    </div>
  );
}

// ============================================================
// MAIN DASHBOARD
// ============================================================

function AdminDashboard() {
  const navigate = useNavigate();

  const [data, setData] =
    useState<AdminDashboardStats | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ----------------------------------------------------------
  // LOAD REAL DATABASE DATA
  // ----------------------------------------------------------

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getAdminDashboard();

      setData(result);
    } catch (error) {
      console.error(
        "Failed to load admin dashboard:",
        error,
      );

      setError(
        "Unable to load live dashboard data. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  // ----------------------------------------------------------
  // CURRENT DATE
  // ----------------------------------------------------------

  const today = useMemo(() => {
    return new Intl.DateTimeFormat("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date());
  }, []);

  const attendance = data?.attendance;

  const attendanceRate =
    attendance?.attendance_rate ?? 0;

  // ----------------------------------------------------------
  // UI
  // ----------------------------------------------------------

  return (
    <div className="min-w-0 space-y-5 sm:space-y-7">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex min-w-0 flex-col justify-between gap-4 sm:flex-row sm:items-center">

        <div>

          <p className="text-sm font-medium text-blue-600">
            {today}
          </p>

          <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            {getGreeting()}, Admin 👋
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Here&apos;s what&apos;s happening in your school today.
          </p>

        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/timetables")}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 sm:w-auto"
        >
          <CalendarDays size={17} />

          View Timetable
        </button>

      </div>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">

          <span>{error}</span>

          <button
            type="button"
            onClick={() => void loadDashboard()}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-3 py-2 font-semibold text-red-700 shadow-sm hover:bg-red-100"
          >
            <RefreshCw size={15} />

            Retry
          </button>

        </div>
      )}

      {/* ======================================================
          STAT CARDS
      ====================================================== */}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          title="Total Students"
          value={
            loading
              ? "..."
              : String(data?.total_students ?? 0)
          }
          icon={GraduationCap}
        />

        <StatCard
          title="Total Teachers"
          value={
            loading
              ? "..."
              : String(data?.total_teachers ?? 0)
          }
          icon={Users}
        />

        <StatCard
          title="Total Parents"
          value={
            loading
              ? "..."
              : String(data?.total_parents ?? 0)
          }
          icon={UserRound}
        />

        <StatCard
          title="Fees Collected"
          value={
            loading
              ? "..."
              : formatCurrency(
                  data?.fees_collected ?? 0,
                )
          }
          icon={Wallet}
        />

      </div>

      {/* ======================================================
          ATTENDANCE + ACTIVITY
      ====================================================== */}

      <div className="grid gap-6 xl:grid-cols-3">

        {/* ====================================================
            ATTENDANCE
        ==================================================== */}

        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 xl:col-span-2">

          <div className="flex items-center justify-between gap-4">

            <div>

              <h2 className="font-semibold text-slate-900">
                Attendance Overview
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Real attendance records from Monday through today
              </p>

            </div>

            <button
              type="button"
              onClick={() => void loadDashboard()}
              className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
              title="Refresh dashboard"
            >
              <RefreshCw size={16} />
            </button>

          </div>

          <div className="mt-6 flex min-w-0 flex-col gap-6 sm:mt-8 sm:gap-8 sm:flex-row sm:items-center">

            {/* Attendance Circle */}

            <div className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full border-[10px] border-blue-500 sm:h-40 sm:w-40 sm:border-[14px]">

              {loading ? (

                <Loader2
                  className="animate-spin text-blue-500"
                  size={30}
                />

              ) : (

                <div className="text-center">

                  <p className="text-3xl font-bold text-slate-900">
                    {attendanceRate.toFixed(1)}%
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Present
                  </p>

                </div>

              )}

            </div>

            {/* Attendance Details */}

            <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2 sm:gap-4">

              <AttendanceItem
                label="Present"
                value={attendance?.present ?? 0}
                icon={<CheckCircle2 size={17} />}
                className="text-emerald-600"
              />

              <AttendanceItem
                label="Late"
                value={attendance?.late ?? 0}
                icon={<Clock size={17} />}
                className="text-amber-500"
              />

              <AttendanceItem
                label="Absent"
                value={attendance?.absent ?? 0}
                icon={<XCircle size={17} />}
                className="text-red-500"
              />

              <AttendanceItem
                label="Leave"
                value={attendance?.leave ?? 0}
                icon={<FileText size={17} />}
                className="text-slate-500"
              />

            </div>

          </div>

          <div className="mt-6 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
            {attendance?.total_records ?? 0} attendance records
            found for this week.
          </div>

        </div>

        {/* ====================================================
            RECENT ACTIVITY
        ==================================================== */}

        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">

          <div className="flex items-center justify-between">

            <h2 className="font-semibold text-slate-900">
              Recent Activity
            </h2>

            <button
              type="button"
              onClick={() => void loadDashboard()}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Refresh
            </button>

          </div>

          <div className="mt-6 space-y-5">

            {loading && (

              <div className="flex items-center gap-2 text-sm text-slate-400">

                <Loader2
                  size={16}
                  className="animate-spin"
                />

                Loading activity...

              </div>

            )}

            {!loading &&
              data?.recent_activity.length === 0 && (

                <p className="text-sm text-slate-400">
                  No activity has been recorded yet.
                </p>

              )}

            {!loading &&
              data?.recent_activity.map(
                (activity, index) => (

                  <div
                    key={activity.id}
                    className="flex gap-3"
                  >

                    <div className="flex flex-col items-center">

                      <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />

                      {index !==
                        data.recent_activity.length - 1 && (
                        <div className="mt-1 h-full w-px bg-slate-100" />
                      )}

                    </div>

                    <div className="-mt-1 flex-1 pb-1">

                      <p className="text-sm font-semibold text-slate-800">
                        {activity.title}
                      </p>

                      <p className="mt-0.5 break-words text-xs text-slate-400">
                        {activity.description}
                      </p>

                      <p className="mt-1 text-[11px] text-slate-400">
                        {timeAgo(activity.occurred_at)}
                      </p>

                    </div>

                  </div>

                ),
              )}

          </div>

        </div>

      </div>

      {/* ======================================================
          UPCOMING EXAMS + QUICK ACTIONS
      ====================================================== */}

      <div className="grid gap-6 lg:grid-cols-2">

        {/* ====================================================
            EXAMS
        ==================================================== */}

        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="font-semibold text-slate-900">
                Upcoming Exams
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Exams currently stored in the system
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/admin/examinations")
              }
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              View all

              <ArrowRight size={14} />
            </button>

          </div>

          <div className="mt-5 space-y-3">

            {loading && (
              <p className="text-sm text-slate-400">
                Loading exams...
              </p>
            )}

            {!loading &&
              data?.upcoming_exams.length === 0 && (

                <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                  No upcoming examinations have been scheduled.
                </p>

              )}

            {!loading &&
              data?.upcoming_exams.map((exam) => (

                <div
                  key={exam.id}
                  className="flex min-w-0 items-center gap-3 rounded-xl bg-slate-50 p-3 sm:gap-4 sm:p-4"
                >

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">

                    <FileText size={20} />

                  </div>

                  <div className="min-w-0 flex-1">

                    <p className="truncate text-sm font-semibold text-slate-800">
                      {exam.name}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {formatDateRange(
                        exam.start_date,
                        exam.end_date,
                      )}
                    </p>

                  </div>

                  <span className="shrink-0 rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-slate-500 sm:text-[11px]">
                    {exam.status}
                  </span>

                </div>

              ))}

          </div>

        </div>

        {/* ====================================================
            QUICK ACTIONS
        ==================================================== */}

        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">

          <h2 className="font-semibold text-slate-900">
            Quick Actions
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Open the real management screens
          </p>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">

            <QuickAction
              icon={<GraduationCap size={20} />}
              title="Add Student"
              description="Register a student"
              onClick={() =>
                navigate("/admin/students")
              }
            />

            <QuickAction
              icon={<Users size={20} />}
              title="Add Teacher"
              description="Create teacher account"
              onClick={() =>
                navigate("/admin/teachers")
              }
            />

            <QuickAction
              icon={<Wallet size={20} />}
              title="Record Payment"
              description="Open payments"
              onClick={() =>
                navigate("/admin/payments")
              }
            />

            <QuickAction
              icon={<FileText size={20} />}
              title="Create Exam"
              description="Schedule examination"
              onClick={() =>
                navigate("/admin/examinations")
              }
            />

          </div>

        </div>

      </div>

    </div>
  );
}

// ============================================================
// ATTENDANCE ITEM
// ============================================================

function AttendanceItem({
  label,
  value,
  icon,
  className,
}: {
  label: string;
  value: number;
  icon: ReactNode;
  className: string;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-100 p-3 sm:p-4">

      <div
        className={`flex items-center gap-2 ${className}`}
      >

        {icon}

        <span className="text-sm font-medium text-slate-700">
          {label}
        </span>

      </div>

      <p className="mt-2 text-2xl font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        Records this week
      </p>

    </div>
  );
}

// ============================================================
// QUICK ACTION
// ============================================================

function QuickAction({
  icon,
  title,
  description,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-w-0 rounded-xl border border-slate-200 p-3 text-left transition hover:border-blue-200 hover:bg-blue-50 sm:p-4"
    >

      <span className="text-blue-600">
        {icon}
      </span>

      <p className="mt-3 break-words text-sm font-semibold text-slate-800">
        {title}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {description}
      </p>

    </button>
  );
}

export default AdminDashboard;