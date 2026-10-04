import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileWarning,
  Loader2,
  XCircle,
} from "lucide-react";

import { getChildAttendance } from "../../api/parentAttendance";
import { getMyChildren, type ParentChild } from "../../api/parentChildren";

interface AttendanceRecord {
  id: number;
  student_id: number;
  enrollment_id: number;
  date: string;
  status: string;
  marked_by: number;
}

function ParentAttendance() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();

  const [child, setChild] = useState<ParentChild | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAttendance = async () => {
      if (!studentId) {
        setError("Student ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const id = Number(studentId);

        if (Number.isNaN(id)) {
          setError("Invalid student ID.");
          return;
        }

        const [children, attendanceData] = await Promise.all([
          getMyChildren(),
          getChildAttendance(id),
        ]);

        const selectedChild =
          children.find((item) => item.student_id === id) ?? null;

        if (!selectedChild) {
          setError(
            "This student is not linked to your parent account."
          );
          return;
        }

        setChild(selectedChild);
        setAttendance(attendanceData);
      } catch (err: any) {
        console.error("Failed to load child attendance:", err);

        const message =
          err?.response?.data?.detail ||
          "Failed to load attendance.";

        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadAttendance();
  }, [studentId]);

  const statistics = useMemo(() => {
    const present = attendance.filter(
      (record) => record.status === "PRESENT"
    ).length;

    const absent = attendance.filter(
      (record) => record.status === "ABSENT"
    ).length;

    const late = attendance.filter(
      (record) => record.status === "LATE"
    ).length;

    const leave = attendance.filter(
      (record) => record.status === "LEAVE"
    ).length;

    const total = attendance.length;

    const percentage =
      total > 0
        ? ((present + late) / total) * 100
        : 0;

    return {
      present,
      absent,
      late,
      leave,
      total,
      percentage,
    };
  }, [attendance]);

  const formatDate = (date: string) => {
    return new Date(`${date}T00:00:00`).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "PRESENT":
        return "bg-emerald-50 text-emerald-700";

      case "ABSENT":
        return "bg-red-50 text-red-700";

      case "LATE":
        return "bg-amber-50 text-amber-700";

      case "LEAVE":
        return "bg-blue-50 text-blue-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PRESENT":
        return <CheckCircle2 size={16} />;

      case "ABSENT":
        return <XCircle size={16} />;

      case "LATE":
        return <Clock3 size={16} />;

      case "LEAVE":
        return <CalendarDays size={16} />;

      default:
        return <FileWarning size={16} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="flex items-center gap-3 text-slate-600">
            <Loader2
              size={24}
              className="animate-spin"
            />
            <span>Loading attendance...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-5xl">
          <button
            type="button"
            onClick={() => navigate("/parent/children")}
            className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft size={18} />
            Back to My Children
          </button>

          <div className="rounded-2xl border border-red-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3 text-red-600">
              <XCircle size={24} />
              <h2 className="text-lg font-semibold">
                Unable to load attendance
              </h2>
            </div>

            <p className="mt-3 text-slate-600">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!child) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() =>
              navigate(`/parent/profile/${child.student_id}`)
            }
            className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft size={18} />
            Back to Child Profile
          </button>

          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Attendance
            </h1>

            <p className="mt-1 text-slate-500">
              Attendance records for{" "}
              <span className="font-semibold text-slate-700">
                {child.first_name} {child.last_name}
              </span>
            </p>
          </div>
        </div>

        {/* Child Information */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Student
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                {child.first_name} {child.last_name}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Admission No:{" "}
                <span className="font-medium text-slate-700">
                  {child.admission_no}
                </span>
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 px-5 py-4 text-center">
              <p className="text-sm text-slate-500">
                Attendance Percentage
              </p>

              <p className="mt-1 text-3xl font-bold text-slate-900">
                {statistics.percentage.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Days
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {statistics.total}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-emerald-600">
              Present
            </p>

            <p className="mt-2 text-2xl font-bold text-emerald-700">
              {statistics.present}
            </p>
          </div>

          <div className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-red-600">
              Absent
            </p>

            <p className="mt-2 text-2xl font-bold text-red-700">
              {statistics.absent}
            </p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-amber-600">
              Late
            </p>

            <p className="mt-2 text-2xl font-bold text-amber-700">
              {statistics.late}
            </p>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-blue-600">
              Leave
            </p>

            <p className="mt-2 text-2xl font-bold text-blue-700">
              {statistics.leave}
            </p>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Attendance History
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Latest attendance records are shown first.
            </p>
          </div>

          {attendance.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <CalendarDays
                size={42}
                className="mx-auto text-slate-300"
              />

              <h3 className="mt-4 text-lg font-semibold text-slate-800">
                No attendance records
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                No attendance has been recorded for this student yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      #
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Date
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Attendance ID
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 bg-white">
                  {attendance.map((record, index) => (
                    <tr
                      key={record.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                        {index + 1}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">
                        {formatDate(record.date)}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusClass(
                            record.status
                          )}`}
                        >
                          {getStatusIcon(record.status)}
                          {record.status}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                        #{record.id}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ParentAttendance;