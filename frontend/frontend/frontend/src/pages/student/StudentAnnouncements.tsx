import { useEffect, useState } from "react";

import {
  getMyAnnouncements,
  type StudentAnnouncement,
} from "../../api/studentAnnouncements";


function StudentAnnouncements() {
  const [announcements, setAnnouncements] =
    useState<StudentAnnouncement[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMyAnnouncements();

      setAnnouncements(data);
    } catch (err: any) {
      console.error(
        "Failed to load announcements:",
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
            : "Unable to load announcements."
        );
      } else if (typeof detail === "string") {
        setError(detail);
      } else {
        setError(
          "Unable to load announcements. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadAnnouncements();
  }, []);


  const formatDate = (dateString: string) => {
    if (!dateString) {
      return "-";
    }

    return new Date(dateString).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };


  const formatDateTime = (dateString: string) => {
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


  const getAudienceLabel = (audience: string) => {
    switch (audience.toUpperCase()) {
      case "ALL":
        return "Everyone";

      case "STUDENT":
        return "Students";

      case "CLASS":
        return "Class";

      case "SECTION":
        return "Section";

      default:
        return audience;
    }
  };


  return (
    <div className="space-y-6">

      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Announcements
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View announcements relevant to you.
          </p>
        </div>

        <button
          type="button"
          onClick={loadAnnouncements}
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
            Loading announcements...
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
        announcements.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">

            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <span className="text-xl">
                📢
              </span>
            </div>

            <h2 className="text-lg font-semibold text-slate-900">
              No announcements
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              There are no active announcements
              for you right now.
            </p>

          </div>
        )}


      {/* Announcement List */}

      {!loading &&
        !error &&
        announcements.length > 0 && (
          <div className="space-y-4">

            {announcements.map(
              (announcement) => (
                <article
                  key={announcement.id}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                >

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                    <div className="min-w-0">

                      <div className="flex flex-wrap items-center gap-2">

                        <h2 className="text-lg font-semibold text-slate-900">
                          {announcement.title}
                        </h2>

                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                          {getAudienceLabel(
                            announcement.audience
                          )}
                        </span>

                      </div>

                      <p className="mt-1 text-xs text-slate-400">
                        Published{" "}
                        {formatDateTime(
                          announcement.created_at
                        )}
                      </p>

                    </div>

                  </div>


                  <div className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                    {announcement.description}
                  </div>


                  <div className="mt-5 flex flex-wrap gap-4 border-t border-slate-100 pt-4 text-xs text-slate-500">

                    <span>
                      Published:{" "}
                      <strong className="font-medium text-slate-700">
                        {formatDate(
                          announcement.created_at
                        )}
                      </strong>
                    </span>

                    {announcement.expires_at && (
                      <span>
                        Expires:{" "}
                        <strong className="font-medium text-slate-700">
                          {formatDateTime(
                            announcement.expires_at
                          )}
                        </strong>
                      </span>
                    )}

                  </div>

                </article>
              )
            )}

          </div>
        )}

    </div>
  );
}


export default StudentAnnouncements;