import { useEffect, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  Clock,
  ExternalLink,
  RefreshCw,
} from "lucide-react";

import {
  getMyHomework,
  type Homework,
} from "../../api/homework";

export default function StudentHomework() {
  const [homework, setHomework] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadHomework = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMyHomework();

      setHomework(data);
    } catch (err: any) {
      console.error("Unable to load homework:", err);

      setError(
        err?.response?.data?.detail ||
          "Unable to load your homework."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadHomework();
  }, []);

  const getDueStatus = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);

    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);

    if (due < today) {
      return {
        label: "Overdue",
        className: "bg-red-50 text-red-700",
      };
    }

    if (due.getTime() === today.getTime()) {
      return {
        label: "Due Today",
        className: "bg-orange-50 text-orange-700",
      };
    }

    return {
      label: "Pending",
      className: "bg-blue-50 text-blue-700",
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Homework
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View homework assigned to your class and section.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadHomework()}
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
          Loading your homework...
        </div>
      ) : error ? (
        /* Error */
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error}
        </div>
      ) : homework.length === 0 ? (
        /* Empty */
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <BookOpen
            size={44}
            className="mx-auto text-slate-300"
          />

          <h2 className="mt-4 text-lg font-semibold text-slate-800">
            No homework found
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Homework assigned to your class will appear here.
          </p>
        </div>
      ) : (
        /* Homework Cards */
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {homework.map((item) => {
            const dueStatus = getDueStatus(item.due_date);

            return (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                {/* Top */}
                <div className="flex items-start justify-between gap-3">
                  <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                    <BookOpen size={24} />
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${dueStatus.className}`}
                  >
                    {dueStatus.label}
                  </span>
                </div>

                {/* Title */}
                <h2 className="mt-5 text-xl font-bold text-slate-900">
                  {item.title}
                </h2>

                {/* Description */}
                {item.description && (
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                    {item.description}
                  </p>
                )}

                {/* Details */}
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="flex items-center gap-2 text-sm text-slate-500">
                      <CalendarDays size={16} />
                      Assigned
                    </span>

                    <span className="font-semibold text-slate-800">
                      {item.assigned_date}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-slate-500">
                      <Clock size={16} />
                      Due Date
                    </span>

                    <span className="font-semibold text-slate-800">
                      {item.due_date}
                    </span>
                  </div>
                </div>

                {/* Attachment */}
                {item.attachment_url && (
                  <a
                    href={item.attachment_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    <ExternalLink size={16} />
                    View Attachment
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}