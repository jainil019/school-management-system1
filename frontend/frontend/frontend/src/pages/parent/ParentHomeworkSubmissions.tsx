import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getMyChildren,
  type ParentChild,
} from "../../api/parentChildren";

import {
  getChildHomeworkSubmissions,
  type ParentHomeworkSubmission,
} from "../../api/parentHomeworkSubmissions";

function ParentHomeworkSubmissions() {
  const navigate = useNavigate();
  const { studentId } = useParams<{ studentId: string }>();

  const [children, setChildren] = useState<ParentChild[]>([]);
  const [submissions, setSubmissions] = useState<
    ParentHomeworkSubmission[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const selectedChild = useMemo(() => {
    if (!studentId) return null;

    return (
      children.find(
        (child) => child.student_id === Number(studentId)
      ) ?? null
    );
  }, [children, studentId]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const childData = await getMyChildren();

        setChildren(childData);

        if (childData.length === 0) {
          setSubmissions([]);
          return;
        }

        const selectedId = studentId
          ? Number(studentId)
          : childData[0].student_id;

        const childExists = childData.some(
          (child) => child.student_id === selectedId
        );

        if (!childExists) {
          setError(
            "This student is not linked to your parent account."
          );
          setSubmissions([]);
          return;
        }

        const submissionData =
          await getChildHomeworkSubmissions(selectedId);

        setSubmissions(submissionData);
      } catch (err: any) {
        console.error(
          "Failed to load homework submissions:",
          err
        );

        const detail = err?.response?.data?.detail;

        setError(
          typeof detail === "string"
            ? detail
            : "Unable to load homework submissions."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [studentId]);



  const formatDateTime = (value: string | null) => {
    if (!value) return "-";

    return new Date(value).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusClass = (status: string) => {
    switch (status.toUpperCase()) {
      case "REVIEWED":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";

      case "REJECTED":
        return "border-red-200 bg-red-50 text-red-700";

      case "LATE":
        return "border-amber-200 bg-amber-50 text-amber-700";

      default:
        return "border-blue-200 bg-blue-50 text-blue-700";
    }
  };

  const reviewedCount = submissions.filter(
    (item) => item.status.toUpperCase() === "REVIEWED"
  ).length;

  const pendingCount = submissions.filter(
    (item) => item.status.toUpperCase() === "SUBMITTED"
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-sm text-slate-500">
              Loading homework submissions...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <p className="text-sm font-medium text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/parent/children")
              }
              className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Back to My Children
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <h2 className="text-lg font-semibold text-slate-900">
              No Children Linked
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              No student is currently linked to your parent
              account.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">
                Parent Portal
              </p>

              <h1 className="mt-1 text-2xl font-bold text-slate-900">
                Homework Submissions
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                View your child's submitted homework and teacher
                feedback.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  `/parent/profile/${selectedChild?.student_id}`
                )
              }
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              View Child Profile
            </button>
          </div>
        </div>

        {/* Child Selector */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <label
            htmlFor="child"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Select Child
          </label>

          <select
            id="child"
            value={selectedChild?.student_id ?? ""}
            onChange={(event) => {
              const id = Number(event.target.value);

              navigate(
                `/parent/homework-submissions/${id}`
              );
            }}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:max-w-md"
          >
            {children.map((child) => (
              <option
                key={child.student_id}
                value={child.student_id}
              >
                {child.first_name} {child.last_name}
              </option>
            ))}
          </select>
        </div>

        {/* Child Info */}
        {selectedChild && (
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">
                {selectedChild.first_name.charAt(0)}
                {selectedChild.last_name.charAt(0)}
              </div>

              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {selectedChild.first_name}{" "}
                  {selectedChild.last_name}
                </h2>

                <p className="text-sm text-slate-500">
                  Admission No: {selectedChild.admission_no}
                </p>

                <p className="text-sm text-slate-500">
                  Relationship: {selectedChild.relationship}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Submissions
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {submissions.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Reviewed
            </p>

            <p className="mt-2 text-2xl font-bold text-emerald-600">
              {reviewedCount}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Pending Review
            </p>

            <p className="mt-2 text-2xl font-bold text-amber-600">
              {pendingCount}
            </p>
          </div>
        </div>

        {/* Submissions */}
        {submissions.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              📄
            </div>

            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              No Submissions
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              This child has not submitted any homework yet.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {submissions.map((submission) => (
              <div
                key={submission.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      Homework #{submission.homework_id}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Submission #{submission.id}
                    </p>
                  </div>

                  <span
                    className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-medium ${getStatusClass(
                      submission.status
                    )}`}
                  >
                    {submission.status}
                  </span>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Submitted
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {formatDateTime(
                        submission.submitted_at
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Student ID
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {submission.student_id}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Reviewed By
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {submission.reviewed_by ?? "Not reviewed"}
                    </p>
                  </div>
                </div>

                {submission.feedback && (
                  <div className="mt-5 rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Teacher Feedback
                    </p>

                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                      {submission.feedback}
                    </p>
                  </div>
                )}

                {submission.file_url && (
                  <div className="mt-5">
                    <a
                      href={
                        submission.file_url.startsWith("http")
                          ? submission.file_url
                          : `http://127.0.0.1:8000${submission.file_url}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      View Submitted PDF
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ParentHomeworkSubmissions;