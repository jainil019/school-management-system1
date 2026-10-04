import { useEffect, useState } from "react";
import {
  BookOpen,
  CalendarCheck,
  ClipboardList,
  GraduationCap,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";

import {
  getMyStudentProfile,
  type Student,
} from "../api/student";

function StudentDashboard() {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStudent = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getMyStudentProfile();

        setStudent(data);
      } catch (err: any) {
        console.error(err);

        setError(
          err.response?.data?.detail ||
            "Unable to load student information."
        );
      } finally {
        setLoading(false);
      }
    };

    loadStudent();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center px-4">
        <p className="text-center text-sm text-slate-500">
          Loading your dashboard...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 sm:p-6">
        {error}
      </div>
    );
  }

  if (!student) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center sm:p-8">
        Student profile not found.
      </div>
    );
  }

  const fullName =
    `${student.first_name} ${student.last_name}`.trim();

  return (
    <div className="min-w-0 space-y-5 sm:space-y-6">

      {/* Welcome */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-5 sm:p-6 md:p-8">
        <div className="flex flex-col gap-5 sm:gap-6 md:flex-row md:items-center md:justify-between">

          <div className="min-w-0">
            <p className="text-xs font-medium text-blue-100 sm:text-sm">
              Student Dashboard
            </p>

            <h1 className="mt-2 text-2xl font-bold leading-tight text-white sm:text-3xl">
              Welcome, {student.first_name}! 👋
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100">
              Here's your school information and quick access
              to your academic portal.
            </p>
          </div>

          <div className="flex h-16 w-16 shrink-0 items-center justify-center self-start rounded-2xl bg-white/15 sm:h-20 sm:w-20 md:self-center">
            <GraduationCap
              size={34}
              className="text-white sm:h-10 sm:w-10"
            />
          </div>
        </div>
      </div>

      {/* Student Summary */}
      <div className="grid min-w-0 gap-4 sm:gap-5 md:grid-cols-3">

        <SummaryCard
          icon={<UserRound size={21} />}
          label="Student"
          value={fullName}
        />

        <SummaryCard
          icon={<ClipboardList size={21} />}
          label="Admission No."
          value={student.admission_no}
        />

        <SummaryCard
          icon={<CalendarCheck size={21} />}
          label="Status"
          value={student.status}
        />

      </div>

      {/* Quick Actions */}
      <div className="min-w-0">

        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
            Quick Access
          </h2>

          <p className="mt-1 text-sm leading-5 text-slate-500">
            Access your academic information quickly.
          </p>
        </div>

        <div className="grid min-w-0 gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <QuickAction
            to="/student/profile"
            icon={<UserRound size={23} />}
            title="My Profile"
            description="View your personal information"
          />

          <QuickAction
            to="/student/classes"
            icon={<GraduationCap size={23} />}
            title="My Classes"
            description="View your class information"
          />

          <QuickAction
            to="/student/attendance"
            icon={<CalendarCheck size={23} />}
            title="Attendance"
            description="Check your attendance"
          />

          <QuickAction
            to="/student/homework"
            icon={<BookOpen size={23} />}
            title="Homework"
            description="View assigned homework"
          />

        </div>
      </div>

      {/* Academic Area */}
      <div className="grid min-w-0 gap-4 sm:gap-5 lg:grid-cols-2">

        <DashboardCard
          title="Examinations"
          description="View upcoming and completed examinations."
          to="/student/examinations"
          icon={<ClipboardList size={22} />}
        />

        <DashboardCard
          title="Marks / Results"
          description="Check your examination marks and results."
          to="/student/marks"
          icon={<GraduationCap size={22} />}
        />

      </div>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">

      <div className="flex min-w-0 items-center gap-3 sm:gap-4">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 sm:h-11 sm:w-11">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 sm:text-xs">
            {label}
          </p>

          <p className="mt-1 truncate text-sm font-bold text-slate-900">
            {value}
          </p>
        </div>

      </div>
    </div>
  );
}

function QuickAction({
  to,
  icon,
  title,
  description,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      to={to}
      className="group min-w-0 rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md sm:p-5"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
        {icon}
      </div>

      <h3 className="mt-4 font-semibold text-slate-900">
        {title}
      </h3>

      <p className="mt-1 text-sm leading-5 text-slate-500">
        {description}
      </p>
    </Link>
  );
}

function DashboardCard({
  title,
  description,
  to,
  icon,
}: {
  title: string;
  description: string;
  to: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className="flex min-w-0 items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-200 hover:shadow-md sm:p-6"
    >
      <div className="min-w-0">
        <h3 className="font-semibold text-slate-900">
          {title}
        </h3>

        <p className="mt-2 text-sm leading-5 text-slate-500">
          {description}
        </p>
      </div>

      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 sm:h-12 sm:w-12">
        {icon}
      </div>
    </Link>
  );
}

export default StudentDashboard;