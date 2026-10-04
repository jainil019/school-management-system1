import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Bell,
  Check,
  CheckCheck,
  Loader2,
  Search,
  Trash2,
  X,
} from "lucide-react";

import {
  getMyNotifications,
  markNotificationRead,
  deleteNotification,
  type Notification,
} from "../../api/notifications";

const formatDate = (date: string) => {
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getTypeLabel = (type: string) => {
  return type
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

export default function TeacherNotifications() {
  const [notifications, setNotifications] = useState<
    Notification[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<
    "ALL" | "UNREAD" | "READ"
  >("ALL");

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMyNotifications();

      setNotifications(data);
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "Failed to load notifications."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const unreadCount = useMemo(
    () =>
      notifications.filter(
        (notification) => !notification.is_read
      ).length,
    [notifications]
  );

  const readCount = notifications.length - unreadCount;

  const filteredNotifications = useMemo(() => {
    const query = search.trim().toLowerCase();

    return notifications.filter((notification) => {
      if (
        filter === "UNREAD" &&
        notification.is_read
      ) {
        return false;
      }

      if (
        filter === "READ" &&
        !notification.is_read
      ) {
        return false;
      }

      if (!query) return true;

      const searchableText = [
        notification.title,
        notification.message,
        notification.type,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [notifications, search, filter]);

  const handleMarkRead = async (
    notification: Notification
  ) => {
    if (notification.is_read) return;

    try {
      const updated =
        await markNotificationRead(
          notification.id
        );

      setNotifications((previous) =>
        previous.map((item) =>
          item.id === notification.id
            ? updated
            : item
        )
      );
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "Failed to mark notification as read."
      );
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter(
      (notification) => !notification.is_read
    );

    if (unread.length === 0) return;

    try {
      setError("");

      /*
       * The API provides one notification-at-a-time
       * read endpoint, so process each unread notification.
       */
      const updatedNotifications =
        await Promise.all(
          unread.map((notification) =>
            markNotificationRead(notification.id)
          )
        );

      setNotifications((previous) =>
        previous.map((notification) => {
          const updated =
            updatedNotifications.find(
              (item) =>
                item.id === notification.id
            );

          return updated ?? notification;
        })
      );
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "Failed to mark all notifications as read."
      );
    }
  };

  const handleDelete = async (
    notification: Notification
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this notification?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteNotification(
        notification.id
      );

      setNotifications((previous) =>
        previous.filter(
          (item) =>
            item.id !== notification.id
        )
      );
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "Failed to delete notification."
      );
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading notifications...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
            <Bell className="h-4 w-4" />
            <span>Teacher Panel</span>
            <span>/</span>
            <span>Notifications</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900">
            Notifications
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View and manage your school notifications.
          </p>
        </div>

        <button
          onClick={handleMarkAllRead}
          disabled={unreadCount === 0}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <CheckCheck className="h-4 w-4" />
          Mark All Read
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{error}</span>

          <button
            onClick={() => setError("")}
            className="ml-auto"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Total Notifications
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {notifications.length}
          </p>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-blue-700">
            Unread
          </p>

          <p className="mt-2 text-3xl font-bold text-blue-700">
            {unreadCount}
          </p>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-emerald-700">
            Read
          </p>

          <p className="mt-2 text-3xl font-bold text-emerald-700">
            {readCount}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Search
            </label>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search notifications..."
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Status
            </label>

            <select
              value={filter}
              onChange={(event) =>
                setFilter(
                  event.target.value as
                    | "ALL"
                    | "UNREAD"
                    | "READ"
                )
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="ALL">
                All Notifications
              </option>

              <option value="UNREAD">
                Unread
              </option>

              <option value="READ">
                Read
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Notification list */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-900">
            Notification List
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {filteredNotifications.length} notification
            {filteredNotifications.length !== 1
              ? "s"
              : ""}
          </p>
        </div>

        {filteredNotifications.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
            <Bell className="h-12 w-12 text-slate-300" />

            <h3 className="mt-4 text-lg font-semibold text-slate-800">
              No notifications
            </h3>

            <p className="mt-1 max-w-md text-sm text-slate-500">
              There are no notifications matching your
              current filters.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredNotifications.map(
              (notification) => (
                <div
                  key={notification.id}
                  className={`p-5 transition hover:bg-slate-50 ${
                    !notification.is_read
                      ? "bg-blue-50/40"
                      : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                        notification.is_read
                          ? "bg-slate-100 text-slate-500"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      <Bell className="h-5 w-5" />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3
                              className={`text-base ${
                                notification.is_read
                                  ? "font-medium text-slate-800"
                                  : "font-bold text-slate-900"
                              }`}
                            >
                              {notification.title}
                            </h3>

                            {!notification.is_read && (
                              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                                New
                              </span>
                            )}
                          </div>

                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                              {getTypeLabel(
                                notification.type
                              )}
                            </span>

                            <span className="text-xs text-slate-400">
                              {formatDate(
                                notification.created_at
                              )}
                            </span>
                          </div>
                        </div>

                        <div className="flex shrink-0 gap-2">
                          {!notification.is_read && (
                            <button
                              onClick={() =>
                                handleMarkRead(
                                  notification
                                )
                              }
                              className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                              title="Mark as read"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}

                          <button
                            onClick={() =>
                              handleDelete(
                                notification
                              )
                            }
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                            title="Delete notification"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                        {notification.message}
                      </p>

                      {notification.read_at && (
                        <p className="mt-2 text-xs text-slate-400">
                          Read on{" "}
                          {formatDate(
                            notification.read_at
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}