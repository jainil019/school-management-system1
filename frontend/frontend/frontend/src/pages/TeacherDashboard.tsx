import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  RefreshCw,
  Users,
  XCircle,
  Clock,
  ArrowRight,
  FileText,
} from "lucide-react";

import { getTeacherAssignments } from "../api/teacherAssignments";
import type { TeacherAssignment } from "../api/teacherAssignments";

import { getClasses } from "../api/classes";
import type { SchoolClass } from "../api/classes";

import { getSections } from "../api/sections";
import type { Section } from "../api/sections";

import { getSubjects } from "../api/subjects";
import type { Subject } from "../api/subjects";

import { getAcademicYears } from "../api/academicYears";
import type { AcademicYear } from "../api/academicYears";

import { getStudents } from "../api/students";
import type { Student } from "../api/students";

import { getStudentEnrollments } from "../api/studentEnrollments";
import type { StudentEnrollment } from "../api/studentEnrollments";

import { getAttendance } from "../api/attendance";
import type { Attendance } from "../api/attendance";

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";

  return "Good evening";
}

function formatToday() {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

function StatCard({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string;
  value: string;
  icon: any;
  description: string;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 sm:h-11 sm:w-11">
        <Icon size={21} />
      </div>

      <p className="mt-4 text-sm font-medium text-slate-500 sm:mt-5">
        {title}
      </p>

      <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        {value}
      </h2>

      <p className="mt-2 text-xs text-emerald-600">
        {description}
      </p>
    </div>
  );
}

export default function TeacherDashboard() {
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [
        assignmentData,
        classData,
        sectionData,
        subjectData,
        yearData,
        studentData,
        enrollmentData,
        attendanceData,
      ] = await Promise.all([
        getTeacherAssignments(),
        getClasses(),
        getSections(),
        getSubjects(),
        getAcademicYears(),
        getStudents(),
        getStudentEnrollments(),
        getAttendance(),
      ]);

      setAssignments(assignmentData);
      setClasses(classData);
      setSections(sectionData);
      setSubjects(subjectData);
      setAcademicYears(yearData);
      setStudents(studentData);
      setEnrollments(enrollmentData);
      setAttendance(attendanceData);
    } catch (e: any) {
      console.error("Teacher dashboard error:", e);

      setError(
        e?.response?.data?.detail ||
          "Unable to load teacher dashboard."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const today = useMemo(() => formatToday(), []);

  const getClassName = (id: number) =>
    classes.find((item) => item.id === id)?.name ||
    `Class #${id}`;

  const getSectionName = (id: number) =>
    sections.find((item) => item.id === id)?.name ||
    `Section #${id}`;

  const getSubjectName = (id: number) =>
    subjects.find((item) => item.id === id)?.name ||
    `Subject #${id}`;

  const getAcademicYearName = (id: number) =>
    academicYears.find((item) => item.id === id)?.name ||
    `Year #${id}`;

  const teacherStudentIds = useMemo(() => {
    const ids = new Set<number>();

    assignments.forEach((assignment) => {
      enrollments
        .filter(
          (enrollment) =>
            enrollment.class_id === assignment.class_id &&
            enrollment.section_id === assignment.section_id &&
            enrollment.academic_year_id ===
              assignment.academic_year_id &&
            enrollment.status.toUpperCase() === "ACTIVE"
        )
        .forEach((enrollment) => {
          ids.add(enrollment.student_id);
        });
    });

    return ids;
  }, [assignments, enrollments]);

  const teacherStudents = useMemo(
    () =>
      students.filter((student) =>
        teacherStudentIds.has(student.id)
      ),
    [students, teacherStudentIds]
  );

  const todayString = new Date()
    .toISOString()
    .split("T")[0];

  const todayAttendance = useMemo(
    () =>
      attendance.filter(
        (item) => item.date === todayString
      ),
    [attendance, todayString]
  );

  const presentToday = todayAttendance.filter(
    (item) => item.status.toUpperCase() === "PRESENT"
  ).length;

  const absentToday = todayAttendance.filter(
    (item) => item.status.toUpperCase() === "ABSENT"
  ).length;

  const lateToday = todayAttendance.filter(
    (item) => item.status.toUpperCase() === "LATE"
  ).length;

  const attendanceRate =
    todayAttendance.length > 0
      ? Math.round(
          (presentToday / todayAttendance.length) * 100
        )
      : 0;

  const assignedStudents = teacherStudents.length;

  return (
    <div className="min-w-0 space-y-5 sm:space-y-7">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div className="min-w-0">
          <p className="text-sm font-medium text-blue-600">
            {today}
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {getGreeting()}, Teacher 👋
          </h1>

          <p className="mt-1 text-sm leading-5 text-slate-500">
            Here's an overview of your classes and students.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:flex">

          <button
            type="button"
            onClick={() => void loadDashboard()}
            className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 sm:px-4"
          >
            <RefreshCw size={17} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => navigate("/teacher/attendance")}
            className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 sm:px-4"
          >
            <ClipboardCheck size={17} />
            <span>Attendance</span>
          </button>

        </div>
      </div>

      {/* ================================================= */}
      {/* ERROR */}
      {/* ================================================= */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ================================================= */}
      {/* STATS */}
      {/* ================================================= */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          title="Assigned Classes"
          value={loading ? "..." : String(assignments.length)}
          icon={BookOpen}
          description="Your active assignments"
        />

        <StatCard
          title="My Students"
          value={loading ? "..." : String(assignedStudents)}
          icon={GraduationCap}
          description="Active enrolled students"
        />

        <StatCard
          title="Today's Attendance"
          value={loading ? "..." : `${attendanceRate}%`}
          icon={CheckCircle2}
          description={`${todayAttendance.length} records today`}
        />

        <StatCard
          title="Subjects"
          value={
            loading
              ? "..."
              : String(
                  new Set(
                    assignments.map(
                      (assignment) => assignment.subject_id
                    )
                  ).size
                )
          }
          icon={BookOpen}
          description="Assigned subjects"
        />

      </div>

      {/* ================================================= */}
      {/* ATTENDANCE + QUICK ACTIONS */}
      {/* ================================================= */}

      <div className="grid min-w-0 gap-5 xl:grid-cols-3">

        {/* Attendance */}

        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 xl:col-span-2">

          <div className="flex min-w-0 items-start justify-between gap-4">

            <div className="min-w-0">
              <h2 className="font-semibold text-slate-900">
                Today's Attendance
              </h2>

              <p className="mt-1 text-sm leading-5 text-slate-500">
                Attendance records created for your students today.
              </p>
            </div>

            <ClipboardCheck
              size={22}
              className="shrink-0 text-blue-600"
            />

          </div>

          <div className="mt-5 grid gap-3 sm:mt-6 sm:grid-cols-3 sm:gap-4">

            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 size={18} />

                <span className="text-sm font-medium">
                  Present
                </span>
              </div>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {presentToday}
              </p>
            </div>

            <div className="rounded-xl border border-red-100 bg-red-50 p-4">
              <div className="flex items-center gap-2 text-red-700">
                <XCircle size={18} />

                <span className="text-sm font-medium">
                  Absent
                </span>
              </div>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {absentToday}
              </p>
            </div>

            <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
              <div className="flex items-center gap-2 text-amber-700">
                <Clock size={18} />

                <span className="text-sm font-medium">
                  Late
                </span>
              </div>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {lateToday}
              </p>
            </div>

          </div>

          <Link
            to="/teacher/attendance"
            className="mt-4 flex min-h-11 items-center justify-between rounded-xl border border-slate-200 p-4 text-sm font-semibold text-slate-700 hover:border-blue-200 hover:bg-blue-50 sm:mt-5"
          >
            <span>Manage Attendance</span>
            <ArrowRight size={17} />
          </Link>

        </div>

        {/* Quick Actions */}

        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">

          <h2 className="font-semibold text-slate-900">
            Quick Actions
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Common teacher tasks.
          </p>

          <div className="mt-4 space-y-3 sm:mt-5">

            <Link
              to="/teacher/classes"
              className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 p-4 hover:border-blue-200 hover:bg-blue-50"
            >
              <Users
                className="shrink-0 text-blue-600"
                size={20}
              />

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800">
                  My Classes
                </p>

                <p className="text-xs text-slate-400">
                  View assigned classes
                </p>
              </div>

              <ArrowRight
                size={16}
                className="shrink-0"
              />
            </Link>

            <Link
              to="/teacher/attendance"
              className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 p-4 hover:border-blue-200 hover:bg-blue-50"
            >
              <ClipboardCheck
                className="shrink-0 text-blue-600"
                size={20}
              />

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800">
                  Attendance
                </p>

                <p className="text-xs text-slate-400">
                  Mark today's attendance
                </p>
              </div>

              <ArrowRight
                size={16}
                className="shrink-0"
              />
            </Link>

            <Link
              to="/teacher/homework"
              className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 p-4 hover:border-blue-200 hover:bg-blue-50"
            >
              <FileText
                className="shrink-0 text-blue-600"
                size={20}
              />

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800">
                  Homework
                </p>

                <p className="text-xs text-slate-400">
                  Manage class homework
                </p>
              </div>

              <ArrowRight
                size={16}
                className="shrink-0"
              />
            </Link>

          </div>
        </div>
      </div>

      {/* ================================================= */}
      {/* ASSIGNED CLASSES */}
      {/* ================================================= */}

      <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">

        <div className="flex min-w-0 items-start justify-between gap-4">

          <div className="min-w-0">
            <h2 className="font-semibold text-slate-900">
              My Classes
            </h2>

            <p className="mt-1 text-sm leading-5 text-slate-500">
              Classes and subjects assigned to you.
            </p>
          </div>

          <Link
            to="/teacher/classes"
            className="flex shrink-0 items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            <span className="hidden sm:inline">
              View all
            </span>

            <ArrowRight size={16} />
          </Link>

        </div>

        {loading ? (
          <div className="py-10 text-center text-sm text-slate-500">
            Loading classes...
          </div>
        ) : assignments.length === 0 ? (
          <div className="py-10 text-center">

            <BookOpen
              className="mx-auto mb-3 text-slate-400"
              size={35}
            />

            <p className="font-medium text-slate-700">
              No classes assigned
            </p>

            <p className="mt-1 px-4 text-sm text-slate-500">
              Your administrator has not assigned any classes yet.
            </p>

          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:mt-5 md:grid-cols-2 xl:grid-cols-3">

            {assignments.slice(0, 6).map((assignment) => {
              const studentCount = enrollments.filter(
                (enrollment) =>
                  enrollment.class_id ===
                    assignment.class_id &&
                  enrollment.section_id ===
                    assignment.section_id &&
                  enrollment.academic_year_id ===
                    assignment.academic_year_id &&
                  enrollment.status.toUpperCase() ===
                    "ACTIVE"
              ).length;

              return (
                <Link
                  key={assignment.id}
                  to={`/teacher/classes/${assignment.id}`}
                  className="min-w-0 rounded-xl border border-slate-200 p-4 transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 sm:p-5"
                >
                  <div className="flex min-w-0 items-center gap-3">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <BookOpen size={20} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-slate-900">
                        {getClassName(assignment.class_id)} -{" "}
                        {getSectionName(assignment.section_id)}
                      </h3>

                      <p className="truncate text-sm text-blue-600">
                        {getSubjectName(assignment.subject_id)}
                      </p>
                    </div>

                  </div>

                  <div className="mt-4 space-y-2 text-sm">

                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-500">
                        Students
                      </span>

                      <span className="font-semibold text-slate-800">
                        {studentCount}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-500">
                        Academic Year
                      </span>

                      <span className="max-w-[55%] truncate text-right font-medium text-slate-800">
                        {getAcademicYearName(
                          assignment.academic_year_id
                        )}
                      </span>
                    </div>

                  </div>
                </Link>
              );
            })}

          </div>
        )}

      </div>

    </div>
  );
}