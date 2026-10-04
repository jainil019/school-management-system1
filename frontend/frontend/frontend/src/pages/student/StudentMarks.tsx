import { useEffect, useMemo, useState } from "react";

import {
  getMyMarks,
  type StudentMark,
} from "../../api/studentMarks";


function StudentMarks() {
  const [marks, setMarks] = useState<StudentMark[]>(
    []
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  const loadMarks = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMyMarks();

      setMarks(data);
    } catch (err: any) {
      console.error(
        "Failed to load student marks:",
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
            : "Unable to load marks."
        );
      } else if (typeof detail === "string") {
        setError(detail);
      } else {
        setError(
          "Unable to load marks. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadMarks();
  }, []);


  // ----------------------------------------------------------
  // Group marks by examination
  // ----------------------------------------------------------

  const groupedResults = useMemo(() => {
    const groups = new Map<
      number,
      {
        examination_id: number;
        examination_name: string;
        examination_status: string;
        start_date: string;
        end_date: string;
        subjects: StudentMark[];
      }
    >();

    marks.forEach((mark) => {
      const existing = groups.get(
        mark.examination_id
      );

      if (existing) {
        existing.subjects.push(mark);
      } else {
        groups.set(mark.examination_id, {
          examination_id: mark.examination_id,
          examination_name:
            mark.examination_name,
          examination_status:
            mark.examination_status,
          start_date: mark.start_date,
          end_date: mark.end_date,
          subjects: [mark],
        });
      }
    });

    return Array.from(groups.values());
  }, [marks]);


  // ----------------------------------------------------------
  // Overall statistics
  // ----------------------------------------------------------

  const overallStats = useMemo(() => {
    const totalObtained = marks.reduce(
      (total, mark) =>
        total + mark.marks_obtained,
      0
    );

    const totalMaximum = marks.reduce(
      (total, mark) =>
        total + mark.max_marks,
      0
    );

    const passedSubjects = marks.filter(
      (mark) =>
        mark.result_status === "PASS"
    ).length;

    const failedSubjects = marks.filter(
      (mark) =>
        mark.result_status === "FAIL"
    ).length;

    const percentage =
      totalMaximum > 0
        ? (totalObtained / totalMaximum) * 100
        : 0;

    return {
      totalObtained,
      totalMaximum,
      passedSubjects,
      failedSubjects,
      percentage,
    };
  }, [marks]);


  const formatDate = (
    dateString: string
  ) => {
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


  const getStatusClass = (
    status: string
  ) => {
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

    return "bg-amber-100 text-amber-700";
  };


  const getResultClass = (
    result: string
  ) => {
    if (result === "PASS") {
      return "bg-emerald-100 text-emerald-700";
    }

    return "bg-red-100 text-red-700";
  };


  return (
    <div className="space-y-6">

      {/* ================================================== */}
      {/* Header */}
      {/* ================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Marks & Results
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View your examination marks,
            grades and results.
          </p>
        </div>

        <button
          type="button"
          onClick={loadMarks}
          disabled={loading}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Refreshing..."
            : "Refresh"}
        </button>

      </div>


      {/* ================================================== */}
      {/* Loading */}
      {/* ================================================== */}

      {loading && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-sm text-slate-500">
            Loading your results...
          </p>
        </div>
      )}


      {/* ================================================== */}
      {/* Error */}
      {/* ================================================== */}

      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">
            {error}
          </p>
        </div>
      )}


      {/* ================================================== */}
      {/* Empty */}
      {/* ================================================== */}

      {!loading &&
        !error &&
        marks.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">

            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <span className="text-xl">
                📊
              </span>
            </div>

            <h2 className="text-lg font-semibold text-slate-900">
              No results available
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your marks have not been published yet.
            </p>

          </div>
        )}


      {/* ================================================== */}
      {/* Results */}
      {/* ================================================== */}

      {!loading &&
        !error &&
        marks.length > 0 && (
          <>

            {/* -------------------------------------------- */}
            {/* Overall Statistics */}
            {/* -------------------------------------------- */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                <p className="text-sm text-slate-500">
                  Total Marks
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {overallStats.totalObtained}
                  <span className="text-base font-medium text-slate-400">
                    {" "}
                    /{" "}
                    {overallStats.totalMaximum}
                  </span>
                </p>

              </div>


              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                <p className="text-sm text-slate-500">
                  Overall Percentage
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {overallStats.percentage.toFixed(
                    2
                  )}
                  %
                </p>

              </div>


              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                <p className="text-sm text-slate-500">
                  Passed Subjects
                </p>

                <p className="mt-2 text-2xl font-bold text-emerald-600">
                  {
                    overallStats.passedSubjects
                  }
                </p>

              </div>


              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                <p className="text-sm text-slate-500">
                  Failed Subjects
                </p>

                <p className="mt-2 text-2xl font-bold text-red-600">
                  {
                    overallStats.failedSubjects
                  }
                </p>

              </div>

            </div>


            {/* -------------------------------------------- */}
            {/* Examination Results */}
            {/* -------------------------------------------- */}

            <div className="space-y-6">

              {groupedResults.map(
                (examination) => {

                  const totalObtained =
                    examination.subjects.reduce(
                      (total, subject) =>
                        total +
                        subject.marks_obtained,
                      0
                    );

                  const totalMaximum =
                    examination.subjects.reduce(
                      (total, subject) =>
                        total +
                        subject.max_marks,
                      0
                    );

                  const percentage =
                    totalMaximum > 0
                      ? (totalObtained /
                          totalMaximum) *
                        100
                      : 0;

                  const hasFailed =
                    examination.subjects.some(
                      (subject) =>
                        subject.result_status ===
                        "FAIL"
                    );

                  return (
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

                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${getResultClass(
                                  hasFailed
                                    ? "FAIL"
                                    : "PASS"
                                )}`}
                              >
                                {hasFailed
                                  ? "FAIL"
                                  : "PASS"}
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


                          {/* Summary */}

                          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">

                            <div className="rounded-lg bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200">

                              <p className="text-xs text-slate-500">
                                Marks
                              </p>

                              <p className="mt-1 font-bold text-slate-900">
                                {
                                  totalObtained
                                }
                                /
                                {
                                  totalMaximum
                                }
                              </p>

                            </div>


                            <div className="rounded-lg bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200">

                              <p className="text-xs text-slate-500">
                                Percentage
                              </p>

                              <p className="mt-1 font-bold text-slate-900">
                                {percentage.toFixed(
                                  2
                                )}
                                %
                              </p>

                            </div>


                            <div className="rounded-lg bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200">

                              <p className="text-xs text-slate-500">
                                Subjects
                              </p>

                              <p className="mt-1 font-bold text-slate-900">
                                {
                                  examination
                                    .subjects
                                    .length
                                }
                              </p>

                            </div>

                          </div>

                        </div>

                      </div>


                      {/* Subject Results */}

                      <div className="overflow-x-auto">

                        <table className="min-w-full text-left">

                          <thead className="border-b border-slate-200 bg-white">

                            <tr>

                              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Subject
                              </th>

                              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Marks
                              </th>

                              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Passing
                              </th>

                              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Percentage
                              </th>

                              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Grade
                              </th>

                              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Result
                              </th>

                            </tr>

                          </thead>


                          <tbody className="divide-y divide-slate-100">

                            {examination.subjects.map(
                              (subject) => (
                                <tr
                                  key={
                                    subject.mark_id
                                  }
                                  className="transition hover:bg-slate-50"
                                >

                                  <td className="px-5 py-4">

                                    <p className="font-medium text-slate-900">
                                      {
                                        subject.subject_name
                                      }
                                    </p>

                                    {subject.remarks && (
                                      <p className="mt-1 text-xs text-slate-500">
                                        {
                                          subject.remarks
                                        }
                                      </p>
                                    )}

                                  </td>


                                  <td className="px-5 py-4">

                                    <span className="font-semibold text-slate-900">
                                      {
                                        subject.marks_obtained
                                      }
                                    </span>

                                    <span className="text-sm text-slate-400">
                                      {" "}
                                      /{" "}
                                      {
                                        subject.max_marks
                                      }
                                    </span>

                                  </td>


                                  <td className="px-5 py-4 text-sm text-slate-600">
                                    {
                                      subject.passing_marks
                                    }
                                  </td>


                                  <td className="px-5 py-4 text-sm font-medium text-slate-700">
                                    {subject.percentage.toFixed(
                                      2
                                    )}
                                    %
                                  </td>


                                  <td className="px-5 py-4">

                                    <span className="font-semibold text-slate-700">
                                      {subject.grade ||
                                        "-"}
                                    </span>

                                  </td>


                                  <td className="px-5 py-4">

                                    <span
                                      className={`rounded-full px-3 py-1 text-xs font-semibold ${getResultClass(
                                        subject.result_status
                                      )}`}
                                    >
                                      {
                                        subject.result_status
                                      }
                                    </span>

                                  </td>

                                </tr>
                              )
                            )}

                          </tbody>

                        </table>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          </>
        )}

    </div>
  );
}


export default StudentMarks;