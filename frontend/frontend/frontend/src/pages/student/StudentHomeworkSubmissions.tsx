import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  FileText,
  RefreshCw,
  Send,
  Upload,
  XCircle,
} from "lucide-react";

import {
  createHomeworkSubmission,
  getMyHomeworkSubmissions,
  uploadHomeworkPdf,
  type HomeworkSubmission,
} from "../../api/homeworkSubmissions";

import {
  getMyHomework,
  type Homework,
} from "../../api/homework";

import { getMyStudentProfile } from "../../api/student";

export default function StudentHomeworkSubmissions() {
  const [submissions, setSubmissions] = useState<
    HomeworkSubmission[]
  >([]);

  const [homework, setHomework] = useState<Homework[]>([]);
  const [studentId, setStudentId] = useState<number | null>(null);

  const [selectedHomework, setSelectedHomework] =
    useState("");

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        submissionData,
        homeworkData,
        student,
      ] = await Promise.all([
        getMyHomeworkSubmissions(),
        getMyHomework(),
        getMyStudentProfile(),
      ]);

      setSubmissions(submissionData);
      setHomework(homeworkData);
      setStudentId(student.id);
    } catch (err: any) {
      console.error(
        "Unable to load homework submissions:",
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
            : "Unable to load your homework submissions."
        );
      } else if (typeof detail === "string") {
        setError(detail);
      } else {
        setError(
          "Unable to load your homework submissions."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const getHomeworkTitle = (id: number) => {
    return (
      homework.find((item) => item.id === id)?.title ||
      `Homework #${id}`
    );
  };

  const submittedHomeworkIds = new Set(
    submissions.map((item) => item.homework_id)
  );

  const availableHomework = homework.filter(
    (item) => !submittedHomeworkIds.has(item.id)
  );

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setError("");
    setSuccess("");

    const file = event.target.files?.[0];

    if (!file) {
      setSelectedFile(null);
      return;
    }

    // PDF extension check
    if (
      !file.name
        .toLowerCase()
        .endsWith(".pdf")
    ) {
      setSelectedFile(null);
      event.target.value = "";

      setError("Only PDF files are allowed.");

      return;
    }

    // Maximum 10 MB
    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      setSelectedFile(null);
      event.target.value = "";

      setError(
        "PDF file size must not exceed 10 MB."
      );

      return;
    }

    setSelectedFile(file);
  };

  const submitHomework = async () => {
    try {
      setError("");
      setSuccess("");

      if (!studentId) {
        setError(
          "Student profile could not be found."
        );
        return;
      }

      if (!selectedHomework) {
        setError("Please select homework.");
        return;
      }

      if (!selectedFile) {
        setError("Please select a PDF file.");
        return;
      }

      setSaving(true);

      // ======================================================
      // 1. Upload PDF
      // ======================================================

      const uploadResult =
        await uploadHomeworkPdf(selectedFile);

      // ======================================================
      // 2. Create homework submission
      // ======================================================

      await createHomeworkSubmission({
        homework_id: Number(selectedHomework),
        student_id: studentId,
        file_url: uploadResult.file_url,
      });

      // ======================================================
      // 3. Reset form
      // ======================================================

      setSelectedHomework("");
      setSelectedFile(null);

      const fileInput =
        document.getElementById(
          "homework-pdf"
        ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }

      setSuccess(
        "Homework submitted successfully."
      );

      await loadData();
    } catch (err: any) {
      console.error(
        "Unable to submit homework:",
        err
      );

      const detail = err?.response?.data?.detail;

      // FastAPI validation error
      if (Array.isArray(detail)) {
        const messages = detail
          .map((item: any) => item?.msg)
          .filter(Boolean);

        setError(
          messages.length > 0
            ? messages.join(", ")
            : "Invalid request."
        );
      }
      // Normal FastAPI error
      else if (typeof detail === "string") {
        setError(detail);
      }
      // Unknown error
      else {
        setError(
          "Unable to submit homework. Please try again."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const getStatus = (status: string) => {
    switch (status) {
      case "REVIEWED":
        return {
          icon: CheckCircle2,
          className:
            "bg-green-50 text-green-700",
        };

      case "REJECTED":
        return {
          icon: XCircle,
          className:
            "bg-red-50 text-red-700",
        };

      case "LATE":
        return {
          icon: Clock3,
          className:
            "bg-orange-50 text-orange-700",
        };

      default:
        return {
          icon: Clock3,
          className:
            "bg-blue-50 text-blue-700",
        };
    }
  };

  const getFileUrl = (fileUrl: string) => {
    if (
      fileUrl.startsWith("http://") ||
      fileUrl.startsWith("https://")
    ) {
      return fileUrl;
    }

    return `http://127.0.0.1:8000${fileUrl}`;
  };

  return (
    <div className="space-y-6">

      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Homework Submissions
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Submit homework PDF files and view teacher feedback.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadData()}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={17}
            className={
              loading ? "animate-spin" : ""
            }
          />

          Refresh
        </button>
      </div>

      {/* ================================================== */}
      {/* ERROR */}
      {/* ================================================== */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ================================================== */}
      {/* SUCCESS */}
      {/* ================================================== */}

      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* ================================================== */}
      {/* SUBMIT HOMEWORK */}
      {/* ================================================== */}

      {!loading &&
        availableHomework.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <Send size={22} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Submit Homework
                </h2>

                <p className="text-sm text-slate-500">
                  Select homework and upload your PDF.
                </p>
              </div>

            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">

              {/* Homework */}

              <div>
                <label
                  htmlFor="homework"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Homework
                </label>

                <select
                  id="homework"
                  value={selectedHomework}
                  onChange={(event) =>
                    setSelectedHomework(
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">
                    Select homework
                  </option>

                  {availableHomework.map((item) => (
                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {item.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* PDF */}

              <div>
                <label
                  htmlFor="homework-pdf"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Homework PDF
                </label>

                <label
                  htmlFor="homework-pdf"
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 transition hover:border-blue-400 hover:bg-blue-50"
                >
                  <div className="rounded-lg bg-white p-2 text-blue-600 shadow-sm">
                    <Upload size={18} />
                  </div>

                  <div className="min-w-0 flex-1">
                    {selectedFile ? (
                      <>
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {selectedFile.name}
                        </p>

                        <p className="text-xs text-slate-500">
                          {(
                            selectedFile.size /
                            (1024 * 1024)
                          ).toFixed(2)}{" "}
                          MB
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-semibold text-slate-700">
                          Choose PDF file
                        </p>

                        <p className="text-xs text-slate-500">
                          PDF only · Maximum 10 MB
                        </p>
                      </>
                    )}
                  </div>
                </label>

                <input
                  id="homework-pdf"
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

            </div>

            <button
              type="button"
              onClick={() =>
                void submitHomework()
              }
              disabled={saving}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RefreshCw
                    size={17}
                    className="animate-spin"
                  />

                  Uploading...
                </>
              ) : (
                <>
                  <Send size={17} />

                  Submit Homework
                </>
              )}
            </button>

          </div>
        )}

      {/* ================================================== */}
      {/* SUBMISSIONS */}
      {/* ================================================== */}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
          Loading submissions...
        </div>
      ) : submissions.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

          <FileText
            size={44}
            className="mx-auto text-slate-300"
          />

          <h2 className="mt-4 text-lg font-semibold text-slate-800">
            No submissions yet
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Your submitted homework will appear here.
          </p>

        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[850px] text-left text-sm">

              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-4">
                    Homework
                  </th>

                  <th className="px-5 py-4">
                    Submitted
                  </th>

                  <th className="px-5 py-4">
                    Status
                  </th>

                  <th className="px-5 py-4">
                    Feedback
                  </th>

                  <th className="px-5 py-4">
                    Submission
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {submissions.map((item) => {
                  const status =
                    getStatus(item.status);

                  const StatusIcon =
                    status.icon;

                  return (
                    <tr key={item.id}>

                      <td className="px-5 py-4 font-semibold text-slate-800">
                        {getHomeworkTitle(
                          item.homework_id
                        )}
                      </td>

                      <td className="px-5 py-4 text-slate-500">
                        {item.submitted_at
                          ? new Date(
                              item.submitted_at
                            ).toLocaleString()
                          : "—"}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                        >
                          <StatusIcon size={14} />
                          {item.status}
                        </span>
                      </td>

                      <td className="max-w-xs px-5 py-4 text-slate-500">
                        {item.feedback ||
                          "No feedback yet"}
                      </td>

                      <td className="px-5 py-4">
                        {item.file_url ? (
                          <a
                            href={getFileUrl(
                              item.file_url
                            )}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 font-semibold text-blue-600 hover:underline"
                          >
                            <FileText size={16} />
                            View PDF
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>

                    </tr>
                  );
                })}
              </tbody>

            </table>

          </div>

        </div>
      )}

    </div>
  );
}