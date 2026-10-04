import {
  Bell,
  CheckCircle2,
  Clock,
  Search,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  getParentNotifications,
  type ParentNotification,
} from "../../api/parentNotifications";

function ParentNotifications() {
  const [notifications, setNotifications] = useState<
    ParentNotification[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getParentNotifications();

        setNotifications(data);
      } catch (err) {
        console.error(
          "Failed to load parent notifications:",
          err
        );

        setError(
          "Failed to load notifications. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    void loadNotifications();
  }, []);

  const filteredNotifications = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return notifications;
    }

    return notifications.filter(
      (notification) =>
        notification.title
          .toLowerCase()
          .includes(query) ||
        notification.message
          .toLowerCase()
          .includes(query) ||
        notification.type
          .toLowerCase()
          .includes(query)
    );
  }, [notifications, search]);

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  const formatDateTime = (value: string) => {
    return new Date(value).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTypeClass = (type: string) => {
    switch (type.toUpperCase()) {
      case "SUCCESS":
        return "bg-emerald-50 text-emerald-700";

      case "WARNING":
        return "bg-amber-50 text-amber-700";

      case "ERROR":
        return "bg-red-50 text-red-700";

      case "ANNOUNCEMENT":
        return "bg-indigo-50 text-indigo-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-500">
            Loading notifications...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Bell className="h-6 w-6 text-indigo-600" />

            <span className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
              Parent Portal
            </span>
          </div>

          <h1 className="text-3xl font-bold text-slate-900">
            Notifications
          </h1>

          <p className="mt-1 text-slate-500">
            Stay updated with important school notifications.
          </p>
        </div>

        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search notifications..."
            className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Statistics */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">
              Total Notifications
            </span>

            <Bell className="h-5 w-5 text-indigo-600" />
          </div>

          <p className="text-2xl font-bold text-slate-900">
            {notifications.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">
              Unread
            </span>

            <Clock className="h-5 w-5 text-amber-600" />
          </div>

          <p className="text-2xl font-bold text-amber-600">
            {unreadCount}
          </p>
        </div>
      </div>

      {/* Notifications */}
      {filteredNotifications.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <Bell className="mx-auto mb-4 h-12 w-12 text-slate-300" />

          <h2 className="font-semibold text-slate-900">
            No notifications found
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {search
              ? "Try a different search term."
              : "You don't have any notifications right now."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map(
            (notification) => (
              <div
                key={notification.id}
                className={`rounded-2xl border bg-white p-5 shadow-sm ${
                  notification.is_read
                    ? "border-slate-200"
                    : "border-indigo-200 bg-indigo-50/30"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                      notification.is_read
                        ? "bg-slate-100"
                        : "bg-indigo-100"
                    }`}
                  >
                    {notification.is_read ? (
                      <CheckCircle2 className="h-5 w-5 text-slate-500" />
                    ) : (
                      <Bell className="h-5 w-5 text-indigo-600" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">
                          {notification.title}
                        </h2>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getTypeClass(
                              notification.type
                            )}`}
                          >
                            {notification.type}
                          </span>

                          {!notification.is_read && (
                            <span className="rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
                              NEW
                            </span>
                          )}
                        </div>
                      </div>

                      <span className="flex shrink-0 items-center gap-1 text-xs text-slate-500">
                        <Clock className="h-3.5 w-3.5" />

                        {formatDateTime(
                          notification.created_at
                        )}
                      </span>
                    </div>

                    <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">
                      {notification.message}
                    </p>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default ParentNotifications;