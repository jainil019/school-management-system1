import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getMyChildren, type ParentChild } from "../../api/parentChildren";
import {
  getChildHomework,
  type ParentHomework as Homework,
} from "../../api/parentHomework";

function ParentHomework() {
  const navigate = useNavigate();
  const { studentId } = useParams<{ studentId: string }>();

  const [children, setChildren] = useState<ParentChild[]>([]);
  const [homework, setHomework] = useState<Homework[]>([]);
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
          setHomework([]);
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
          setHomework([]);
          return;
        }

        const homeworkData = await getChildHomework(selectedId);

        setHomework(homeworkData);
      } catch (err: any) {
        console.error("Failed to load parent homework:", err);

        const detail = err?.response?.data?.detail;

        if (typeof detail === "string") {
          setError(detail);
        } else {
          setError("Unable to load homework.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [studentId]);

  const formatDate = (value: string) => {
    if (!value) return "-";

    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatus = (dueDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);

    if (due < today) {
      return {
        label: "Overdue",
        className:
          "bg-red-50 text-red-700 border-red-200",
      };
    }

    if (due.getTime() === today.getTime()) {
      return {
        label: "Due Today",
        className:
          "bg-amber-50 text-amber-700 border-amber-200",
      };
    }

    return {
      label: "Upcoming",
      className:
        "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-sm text-slate-500">
              Loading homework...
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
              onClick={() => navigate("/parent/children")}
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
              No student is currently linked to your parent account.
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
                Homework
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                View homework assigned to your child.
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

              navigate(`/parent/homework/${id}`);
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

        {/* Child Information */}
        {selectedChild && (
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
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
              Total Homework
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {homework.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Upcoming
            </p>

            <p className="mt-2 text-2xl font-bold text-emerald-600">
              {
                homework.filter(
                  (item) =>
                    new Date(item.due_date) >= new Date()
                ).length
              }
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Overdue
            </p>

            <p className="mt-2 text-2xl font-bold text-red-600">
              {
                homework.filter(
                  (item) =>
                    new Date(item.due_date) <
                    new Date()
                ).length
              }
            </p>
          </div>
        </div>

        {/* Homework */}
        {homework.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              📚
            </div>

            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              No Homework
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              There is currently no homework assigned to this child.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {homework.map((item) => {
              const homeworkStatus = getStatus(item.due_date);

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">
                        {item.title}
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Homework #{item.id}
                      </p>
                    </div>

                    <span
                      className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-medium ${homeworkStatus.className}`}
                    >
                      {homeworkStatus.label}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Subject ID
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {item.subject_id}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Teacher ID
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {item.teacher_id}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Assigned Date
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {formatDate(item.assigned_date)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Due Date
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {formatDate(item.due_date)}
                      </p>
                    </div>
                  </div>

                  {item.description && (
                    <div className="mt-5 rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Description
                      </p>

                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                        {item.description}
                      </p>
                    </div>
                  )}

                  {item.attachment_url && (
                    <div className="mt-5">
                      <a
                        href={item.attachment_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                      >
                        View Attachment
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ParentHomework;