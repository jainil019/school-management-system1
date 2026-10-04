import { useEffect, useMemo, useState } from "react";

import {
  getMyAttendance,
  type Attendance,
} from "../../api/attendance";

function StudentAttendance() {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAttendance = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMyAttendance();
      setAttendance(data);
    } catch (err) {
      console.error("Failed to load attendance:", err);
      setError("Failed to load attendance.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, []);

  const statistics = useMemo(() => {
    const total = attendance.length;

    const present = attendance.filter(
      (item) => item.status === "PRESENT"
    ).length;

    const absent = attendance.filter(
      (item) => item.status === "ABSENT"
    ).length;

    const late = attendance.filter(
      (item) => item.status === "LATE"
    ).length;

    const leave = attendance.filter(
      (item) => item.status === "LEAVE"
    ).length;

    const percentage =
      total > 0
        ? ((present + late) / total) * 100
        : 0;

    return {
      total,
      present,
      absent,
      late,
      leave,
      percentage,
    };
  }, [attendance]);

  const getStatusClass = (status: Attendance["status"]) => {
    switch (status) {
      case "PRESENT":
        return "bg-green-100 text-green-700";

      case "ABSENT":
        return "bg-red-100 text-red-700";

      case "LATE":
        return "bg-yellow-100 text-yellow-700";

      case "LEAVE":
        return "bg-blue-100 text-blue-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              My Attendance
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              View your attendance records and attendance percentage.
            </p>
          </div>

          <button
            type="button"
            onClick={loadAttendance}
            disabled={loading}
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Statistics */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Classes
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {statistics.total}
            </p>
          </div>

          <div className="rounded-xl border border-green-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Present
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {statistics.present}
            </p>
          </div>

          <div className="rounded-xl border border-red-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Absent
            </p>

            <p className="mt-2 text-3xl font-bold text-red-600">
              {statistics.absent}
            </p>
          </div>

          <div className="rounded-xl border border-yellow-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Late
            </p>

            <p className="mt-2 text-3xl font-bold text-yellow-600">
              {statistics.late}
            </p>
          </div>

          <div className="rounded-xl border border-blue-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Leave
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-600">
              {statistics.leave}
            </p>
          </div>
        </div>

        {/* Percentage */}
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Attendance Percentage
              </h2>

              <p className="text-sm text-slate-500">
                Present and Late are counted as attended days.
              </p>
            </div>

            <span className="text-2xl font-bold text-slate-900">
              {statistics.percentage.toFixed(1)}%
            </span>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-slate-900 transition-all"
              style={{
                width: `${Math.min(
                  statistics.percentage,
                  100
                )}%`,
              }}
            />
          </div>
        </div>

        {/* Attendance table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Attendance History
            </h2>
          </div>

          {loading ? (
            <div className="px-6 py-12 text-center text-sm text-slate-500">
              Loading attendance...
            </div>
          ) : attendance.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm font-medium text-slate-700">
                No attendance records found.
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Your attendance records will appear here once they are
                marked by your teacher.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">

                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      #
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Date
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Attendance ID
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 bg-white">
                  {attendance.map((record, index) => (
                    <tr
                      key={record.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                        {index + 1}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">
                        {new Date(record.date).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                            record.status
                          )}`}
                        >
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

export default StudentAttendance;