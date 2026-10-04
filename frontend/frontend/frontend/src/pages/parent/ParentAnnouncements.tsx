import {
  Bell,
  Calendar,
  Megaphone,
  Search,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  getParentAnnouncements,
  type ParentAnnouncement,
} from "../../api/parentAnnouncements";

function ParentAnnouncements() {
  const [announcements, setAnnouncements] = useState<
    ParentAnnouncement[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadAnnouncements = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getParentAnnouncements();

        setAnnouncements(data);
      } catch (err) {
        console.error(
          "Failed to load parent announcements:",
          err
        );

        setError(
          "Failed to load announcements. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    void loadAnnouncements();
  }, []);

  const filteredAnnouncements = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return announcements;
    }

    return announcements.filter(
      (announcement) =>
        announcement.title
          .toLowerCase()
          .includes(query) ||
       announcement.description
          .toLowerCase()
          .includes(query)
    );
  }, [announcements, search]);

  const formatDate = (
    value: string | null
  ) => {
    if (!value) {
      return "-";
    }

    return new Date(value).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatDateTime = (
    value: string | null
  ) => {
    if (!value) {
      return "-";
    }

    return new Date(value).toLocaleString(
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

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-500">
            Loading announcements...
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
            <Megaphone className="h-6 w-6 text-indigo-600" />

            <span className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
              Parent Portal
            </span>
          </div>

          <h1 className="text-3xl font-bold text-slate-900">
            Announcements
          </h1>

          <p className="mt-1 text-slate-500">
            Important school announcements and updates.
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
            placeholder="Search announcements..."
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

      {/* Summary */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">
              Total Announcements
            </span>

            <Bell className="h-5 w-5 text-indigo-600" />
          </div>

          <p className="text-2xl font-bold text-slate-900">
            {announcements.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">
              Showing
            </span>

            <Megaphone className="h-5 w-5 text-indigo-600" />
          </div>

          <p className="text-2xl font-bold text-slate-900">
            {filteredAnnouncements.length}
          </p>
        </div>
      </div>

      {/* Announcements */}
      {filteredAnnouncements.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <Megaphone className="mx-auto mb-4 h-12 w-12 text-slate-300" />

          <h2 className="font-semibold text-slate-900">
            No announcements found
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {search
              ? "Try a different search term."
              : "There are no announcements available right now."}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredAnnouncements.map(
            (announcement) => (
              <article
                key={announcement.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50">
                      <Megaphone className="h-5 w-5 text-indigo-600" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h2 className="text-xl font-bold text-slate-900">
                        {announcement.title}
                      </h2>

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />

                          Published{" "}
                          {formatDateTime(
                            announcement.created_at
                          )}
                        </span>

                        {announcement.expires_at && (
                          <span>
                            Expires{" "}
                            {formatDate(
                              announcement.expires_at
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-5">
                    <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                      {announcement.description}
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

export default ParentAnnouncements;