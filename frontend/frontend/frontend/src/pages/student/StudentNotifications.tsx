import { useEffect, useMemo, useState } from "react";

import {
  getMyNotifications,
  markNotificationAsRead,
  type StudentNotification,
} from "../../api/studentNotifications";


function StudentNotifications() {
  const [notifications, setNotifications] =
    useState<StudentNotification[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [markingId, setMarkingId] =
    useState<number | null>(null);


  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMyNotifications();

      setNotifications(data);
    } catch (err: any) {
      console.error(
        "Failed to load notifications:",
        err
      );

      const detail =
        err?.response?.data?.detail;

      if (Array.isArray(detail)) {
        const messages = detail
          .map((item: any) => item?.msg)
          .filter(Boolean);

        setError(
          messages.length > 0
            ? messages.join(", ")
            : "Unable to load notifications."
        );
      } else if (typeof detail === "string") {
        setError(detail);
      } else {
        setError(
          "Unable to load notifications. Please try again."
        );
      }
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
        (notification) =>
          !notification.is_read
      ).length,
    [notifications]
  );


  const formatDateTime = (
    dateString: string
  ) => {
    if (!dateString) {
      return "-";
    }

    return new Date(dateString).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };


  const handleMarkAsRead = async (
    notification: StudentNotification
  ) => {
    if (notification.is_read) {
      return;
    }

    try {
      setMarkingId(notification.id);

      const updated =
        await markNotificationAsRead(
          notification.id
        );

      setNotifications((current) =>
        current.map((item) =>
          item.id === updated.id
            ? updated
            : item
        )
      );
    } catch (err) {
      console.error(
        "Failed to mark notification as read:",
        err
      );
    } finally {
      setMarkingId(null);
    }
  };


  return (
    <div className="space-y-6">

      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <div className="flex flex-wrap items-center gap-3">

            <h1 className="text-2xl font-bold text-slate-900">
              Notifications
            </h1>

            {unreadCount > 0 && (
              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                {unreadCount} unread
              </span>
            )}

          </div>

          <p className="mt-1 text-sm text-slate-500">
            View your latest notifications.
          </p>

        </div>


        <button
          type="button"
          onClick={loadNotifications}
          disabled={loading}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Refreshing..."
            : "Refresh"}
        </button>

      </div>


      {/* Loading */}

      {loading && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-sm text-slate-500">
            Loading notifications...
          </p>
        </div>
      )}


      {/* Error */}

      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">
            {error}
          </p>
        </div>
      )}


      {/* Empty */}

      {!loading &&
        !error &&
        notifications.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">

            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <span className="text-xl">
                🔔
              </span>
            </div>

            <h2 className="text-lg font-semibold text-slate-900">
              No notifications
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              You don't have any notifications
              right now.
            </p>

          </div>
        )}


      {/* Notification List */}

      {!loading &&
        !error &&
        notifications.length > 0 && (
          <div className="space-y-3">

            {notifications.map(
              (notification) => (
                <article
                  key={notification.id}
                  className={`rounded-xl border bg-white p-5 shadow-sm transition ${
                    notification.is_read
                      ? "border-slate-200"
                      : "border-blue-200 bg-blue-50/30"
                  }`}
                >

                  <div className="flex gap-4">

                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                        notification.is_read
                          ? "bg-slate-100"
                          : "bg-blue-100"
                      }`}
                    >
                      <span>
                        🔔
                      </span>
                    </div>


                    <div className="min-w-0 flex-1">

                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">

                        <div>

                          <div className="flex flex-wrap items-center gap-2">

                            <h2 className="font-semibold text-slate-900">
                              {
                                notification.title
                              }
                            </h2>

                            {!notification.is_read && (
                              <span className="rounded-full bg-blue-100 px-2 py-1 text-[11px] font-semibold text-blue-700">
                                NEW
                              </span>
                            )}

                          </div>

                          <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">
                            {
                              notification.type
                            }
                          </p>

                        </div>


                        {!notification.is_read && (
                          <button
                            type="button"
                            onClick={() =>
                              handleMarkAsRead(
                                notification
                              )
                            }
                            disabled={
                              markingId ===
                              notification.id
                            }
                            className="shrink-0 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                          >
                            {markingId ===
                            notification.id
                              ? "Updating..."
                              : "Mark as read"}
                          </button>
                        )}

                      </div>


                      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                        {
                          notification.message
                        }
                      </p>


                      <p className="mt-3 text-xs text-slate-400">
                        {
                          formatDateTime(
                            notification.created_at
                          )
                        }
                      </p>

                    </div>

                  </div>

                </article>
              )
            )}

          </div>
        )}

    </div>
  );
}


export default StudentNotifications;