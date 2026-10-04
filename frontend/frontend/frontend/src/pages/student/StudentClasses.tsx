import { useEffect, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  GraduationCap,
  Hash,
  RefreshCw,
} from "lucide-react";

import { getMyEnrollments } from "../../api/studentEnrollments";
import type { StudentEnrollment } from "../../api/studentEnrollments";

export default function StudentClasses() {
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>(
    []
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      // Student only needs their own enrollment API.
      // No /classes, /sections or /academic-years calls.
      const enrollmentData = await getMyEnrollments();

      setEnrollments(enrollmentData);
    } catch (err: any) {
      console.error("Unable to load student classes:", err);

      setError(
        err?.response?.data?.detail ||
          "Unable to load your class information."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            My Classes
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View your current and previous class enrollment details.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadData()}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={17}
            className={loading ? "animate-spin" : ""}
          />

          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
          Loading your classes...
        </div>
      ) : error ? (
        /* Error */
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error}
        </div>
      ) : enrollments.length === 0 ? (
        /* Empty */
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <GraduationCap
            size={42}
            className="mx-auto text-slate-300"
          />

          <h2 className="mt-4 text-lg font-semibold text-slate-800">
            No enrollment found
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Your class enrollment information will appear here.
          </p>
        </div>
      ) : (
        /* Enrollment Cards */
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {enrollments.map((enrollment) => (
            <div
              key={enrollment.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                  <GraduationCap size={24} />
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    enrollment.status === "ACTIVE"
                      ? "bg-green-50 text-green-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {enrollment.status}
                </span>
              </div>

              {/* Class */}
              <h2 className="mt-5 text-xl font-bold text-slate-900">
                {enrollment.class_name ||
                  `Class #${enrollment.class_id}`}
              </h2>

              {/* Section */}
              <p className="mt-1 text-sm text-slate-500">
                Section{" "}
                {enrollment.section_name ||
                  `#${enrollment.section_id}`}
              </p>

              {/* Details */}
              <div className="mt-6 space-y-4">

                {/* Roll Number */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="flex items-center gap-2 text-sm text-slate-500">
                    <Hash size={16} />
                    Roll Number
                  </span>

                  <span className="font-semibold text-slate-800">
                    {enrollment.roll_no ?? "Not assigned"}
                  </span>
                </div>

                {/* Academic Year */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="flex items-center gap-2 text-sm text-slate-500">
                    <BookOpen size={16} />
                    Academic Year
                  </span>

                  <span className="font-semibold text-slate-800">
                    {enrollment.academic_year_name ||
                      `Year #${enrollment.academic_year_id}`}
                  </span>
                </div>

                {/* Enrollment Date */}
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-slate-500">
                    <CalendarDays size={16} />
                    Enrolled On
                  </span>

                  <span className="font-semibold text-slate-800">
                    {enrollment.enrollment_date}
                  </span>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}