import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Check,
  RefreshCw,
  Send,
  Trash2,
} from "lucide-react";

import {
  createNotification,
  deleteNotification,
  getMyNotifications,
  markNotificationRead,
  type Notification,
} from "../../api/notifications";

import { getUsers, type User } from "../../api/users";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [userId, setUserId] = useState("");
  const [type, setType] = useState("GENERAL");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [search, setSearch] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);

      const [notificationData, userData] = await Promise.all([
        getMyNotifications(),
        getUsers(),
      ]);

      setNotifications(notificationData);
      setUsers(userData);
    } catch (error: any) {
      console.error(error);
      alert(
        error?.response?.data?.detail ||
          "Unable to load notifications."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredNotifications = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return notifications;

    return notifications.filter(
      (notification) =>
        notification.title.toLowerCase().includes(value) ||
        notification.message.toLowerCase().includes(value) ||
        notification.type.toLowerCase().includes(value)
    );
  }, [notifications, search]);

  const sendNotification = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      alert("Please select a recipient.");
      return;
    }

    if (!title.trim()) {
      alert("Please enter notification title.");
      return;
    }

    if (!message.trim()) {
      alert("Please enter notification message.");
      return;
    }

    try {
      setSending(true);

      await createNotification({
        user_id: Number(userId),
        type,
        title: title.trim(),
        message: message.trim(),
      });

      alert("Notification sent successfully.");

      setUserId("");
      setType("GENERAL");
      setTitle("");
      setMessage("");

      await loadData();
    } catch (error: any) {
      console.error(error);

      alert(
        error?.response?.data?.detail ||
          "Unable to send notification."
      );
    } finally {
      setSending(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await markNotificationRead(id);

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === id
            ? {
                ...notification,
                is_read: true,
                read_at: new Date().toISOString(),
              }
            : notification
        )
      );
    } catch (error: any) {
      alert(
        error?.response?.data?.detail ||
          "Unable to mark notification as read."
      );
    }
  };

  const removeNotification = async (id: number) => {
    if (!window.confirm("Delete this notification?")) {
      return;
    }

    try {
      await deleteNotification(id);

      setNotifications((current) =>
        current.filter((notification) => notification.id !== id)
      );
    } catch (error: any) {
      alert(
        error?.response?.data?.detail ||
          "Unable to delete notification."
      );
    }
  };

  const getRecipientLabel = (user: User) => {
    return `${user.email} — ${user.role_name}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Notifications
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Send notifications to students, teachers, parents and other users.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {/* Send Notification */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
            <Send size={20} />
          </div>

          <div>
            <h2 className="font-semibold text-slate-900">
              Send Notification
            </h2>

            <p className="text-sm text-slate-500">
              Send a notification to a specific user.
            </p>
          </div>
        </div>

        <form onSubmit={sendNotification} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Recipient
              </label>

              <select
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className={inputClass}
              >
                <option value="">Select recipient</option>

                {users
                  .filter((user) => user.is_active)
                  .map((user) => (
                    <option key={user.id} value={user.id}>
                      {getRecipientLabel(user)}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Type
              </label>

              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className={inputClass}
              >
                <option value="GENERAL">General</option>
                <option value="ANNOUNCEMENT">Announcement</option>
                <option value="HOMEWORK">Homework</option>
                <option value="EXAM">Exam</option>
                <option value="ATTENDANCE">Attendance</option>
                <option value="FEE">Fee</option>
                <option value="SYSTEM">System</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Title
            </label>

            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter notification title"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Message
            </label>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter notification message"
              rows={4}
              className={inputClass}
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send size={17} />

              {sending ? "Sending..." : "Send Notification"}
            </button>
          </div>
        </form>
      </div>

      {/* My Notifications */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">
              My Notifications
            </h2>

            <p className="text-sm text-slate-500">
              Notifications received by the current admin account.
            </p>
          </div>

          <input
            type="text"
            placeholder="Search notifications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 md:w-72"
          />
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Loading notifications...
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-10 text-center">
            <Bell className="mx-auto mb-3 text-slate-300" size={40} />

            <p className="font-medium text-slate-700">
              No notifications found
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Notifications sent to this admin account will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-5 ${
                  notification.is_read ? "bg-white" : "bg-blue-50/40"
                }`}
              >
                <div className="flex gap-4">
                  <div className="mt-1 rounded-full bg-blue-100 p-2 text-blue-600">
                    <Bell size={17} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col justify-between gap-2 md:flex-row">
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {notification.title}
                        </h3>

                        <span className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                          {notification.type}
                        </span>
                      </div>

                      <span className="text-xs text-slate-400">
                        {new Date(
                          notification.created_at
                        ).toLocaleString()}
                      </span>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {notification.message}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {!notification.is_read && (
                        <button
                          type="button"
                          onClick={() =>
                            markAsRead(notification.id)
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <Check size={14} />
                          Mark as read
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          removeNotification(notification.id)
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}