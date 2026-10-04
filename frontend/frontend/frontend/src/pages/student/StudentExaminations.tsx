import { useEffect, useMemo, useState } from "react";

import {
  getMyExaminations,
  type StudentExamination,
} from "../../api/studentExaminations";


function StudentExaminations() {
  const [examinations, setExaminations] = useState<
    StudentExamination[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadExaminations = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMyExaminations();

      setExaminations(data);
    } catch (err: any) {
      console.error(
        "Failed to load examinations:",
        err
      );

      const detail = err?.response?.data?.detail;

      if (Array.isArray(detail)) {
        const messages = detail
          .map((item: any) => item?.msg)
          .filter(Boolean);

        setError(
          messages.length > 0
            ? messages.join(", ")
            : "Unable to load examinations."
        );
      } else if (typeof detail === "string") {
        setError(detail);
      } else {
        setError(
          "Unable to load examinations. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadExaminations();
  }, []);


  // ----------------------------------------------------------
  // Group subjects by examination
  // ----------------------------------------------------------

  const groupedExaminations = useMemo(() => {
    const groups = new Map<
      number,
      {
        examination_id: number;
        examination_name: string;
        academic_year_id: number;
        start_date: string;
        end_date: string;
        examination_status: string;
        subjects: StudentExamination[];
      }
    >();

    examinations.forEach((item) => {
      const existing = groups.get(
        item.examination_id
      );

      if (existing) {
        existing.subjects.push(item);
      } else {
        groups.set(item.examination_id, {
          examination_id: item.examination_id,
          examination_name:
            item.examination_name,
          academic_year_id:
            item.academic_year_id,
          start_date: item.start_date,
          end_date: item.end_date,
          examination_status:
            item.examination_status,
          subjects: [item],
        });
      }
    });

    return Array.from(groups.values());
  }, [examinations]);


  const formatDate = (dateString: string) => {
    if (!dateString) {
      return "-";
    }

    return new Date(
      `${dateString}T00:00:00`
    ).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };


  const getStatusClass = (status: string) => {
    const normalized =
      status.toUpperCase();

    if (
      normalized === "COMPLETED" ||
      normalized === "FINISHED"
    ) {
      return "bg-slate-100 text-slate-700";
    }

    if (
      normalized === "ONGOING" ||
      normalized === "ACTIVE"
    ) {
      return "bg-blue-100 text-blue-700";
    }

    if (
      normalized === "UPCOMING" ||
      normalized === "SCHEDULED"
    ) {
      return "bg-amber-100 text-amber-700";
    }

    return "bg-slate-100 text-slate-700";
  };


  return (
    <div className="space-y-6">

      {/* -------------------------------------------------- */}
      {/* Header */}
      {/* -------------------------------------------------- */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Examinations
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View your examination schedule and
            subject-wise marks information.
          </p>
        </div>

        <button
          type="button"
          onClick={loadExaminations}
          disabled={loading}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Refreshing..."
            : "Refresh"}
        </button>

      </div>


      {/* -------------------------------------------------- */}
      {/* Loading */}
      {/* -------------------------------------------------- */}

      {loading && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-sm text-slate-500">
            Loading examinations...
          </p>
        </div>
      )}


      {/* -------------------------------------------------- */}
      {/* Error */}
      {/* -------------------------------------------------- */}

      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">
            {error}
          </p>
        </div>
      )}


      {/* -------------------------------------------------- */}
      {/* Empty */}
      {/* -------------------------------------------------- */}

      {!loading &&
        !error &&
        groupedExaminations.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <span className="text-xl">
                📚
              </span>
            </div>

            <h2 className="text-lg font-semibold text-slate-900">
              No examinations found
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your examination schedule has not
              been published yet.
            </p>
          </div>
        )}


      {/* -------------------------------------------------- */}
      {/* Examination Cards */}
      {/* -------------------------------------------------- */}

      {!loading &&
        !error &&
        groupedExaminations.length > 0 && (
          <div className="space-y-6">

            {groupedExaminations.map(
              (examination) => (
                <div
                  key={
                    examination.examination_id
                  }
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                >

                  {/* Examination Header */}

                  <div className="border-b border-slate-200 bg-slate-50 p-5">

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                      <div>
                        <div className="flex flex-wrap items-center gap-3">

                          <h2 className="text-lg font-bold text-slate-900">
                            {
                              examination.examination_name
                            }
                          </h2>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                              examination.examination_status
                            )}`}
                          >
                            {
                              examination.examination_status
                            }
                          </span>

                        </div>

                        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">

                          <span>
                            Start:{" "}
                            <strong className="font-medium text-slate-700">
                              {formatDate(
                                examination.start_date
                              )}
                            </strong>
                          </span>

                          <span>
                            End:{" "}
                            <strong className="font-medium text-slate-700">
                              {formatDate(
                                examination.end_date
                              )}
                            </strong>
                          </span>

                        </div>
                      </div>

                      <div className="rounded-lg bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200">

                        <p className="text-xs text-slate-500">
                          Subjects
                        </p>

                        <p className="text-lg font-bold text-slate-900">
                          {
                            examination.subjects
                              .length
                          }
                        </p>

                      </div>

                    </div>

                  </div>


                  {/* Subjects Table */}

                  <div className="overflow-x-auto">

                    <table className="min-w-full text-left">

                      <thead className="border-b border-slate-200 bg-white">

                        <tr>
                          <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Subject
                          </th>

                          <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Exam Date
                          </th>

                          <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Maximum Marks
                          </th>

                          <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Passing Marks
                          </th>
                        </tr>

                      </thead>

                      <tbody className="divide-y divide-slate-100">

                        {examination.subjects.map(
                          (subject) => (
                            <tr
                              key={
                                subject.exam_subject_id
                              }
                              className="transition hover:bg-slate-50"
                            >

                              <td className="px-5 py-4">

                                <div className="font-medium text-slate-900">
                                  {
                                    subject.subject_name
                                  }
                                </div>

                              </td>

                              <td className="px-5 py-4 text-sm text-slate-600">
                                {formatDate(
                                  subject.exam_date
                                )}
                              </td>

                              <td className="px-5 py-4 text-sm font-medium text-slate-700">
                                {
                                  subject.max_marks
                                }
                              </td>

                              <td className="px-5 py-4 text-sm font-medium text-slate-700">
                                {
                                  subject.passing_marks
                                }
                              </td>

                            </tr>
                          )
                        )}

                      </tbody>

                    </table>

                  </div>

                </div>
              )
            )}

          </div>
        )}

    </div>
  );
}


export default StudentExaminations;