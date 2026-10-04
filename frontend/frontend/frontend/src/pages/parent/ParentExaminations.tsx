import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getMyChildren,
  type ParentChild,
} from "../../api/parentChildren";

import {
  getChildExaminations,
  type ParentExamination,
} from "../../api/parentExaminations";

function ParentExaminations() {
  const navigate = useNavigate();
  const { studentId } = useParams<{ studentId: string }>();

  const [children, setChildren] = useState<ParentChild[]>([]);
  const [examinations, setExaminations] = useState<
    ParentExamination[]
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
          setExaminations([]);
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
          setExaminations([]);
          return;
        }

        const examinationData =
          await getChildExaminations(selectedId);

        setExaminations(examinationData);
      } catch (err: any) {
        console.error(
          "Failed to load examinations:",
          err
        );

        const detail = err?.response?.data?.detail;

        setError(
          typeof detail === "string"
            ? detail
            : "Unable to load examinations."
        );
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

  const getStatusClass = (status: string) => {
    switch (status.toUpperCase()) {
      case "COMPLETED":
      case "FINISHED":
        return "border-slate-200 bg-slate-100 text-slate-700";

      case "ONGOING":
      case "IN_PROGRESS":
        return "border-amber-200 bg-amber-50 text-amber-700";

      case "UPCOMING":
        return "border-blue-200 bg-blue-50 text-blue-700";

      default:
        return "border-slate-200 bg-slate-50 text-slate-600";
    }
  };

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
        subjects: ParentExamination[];
      }
    >();

    examinations.forEach((item) => {
      const existing = groups.get(item.examination_id);

      if (existing) {
        existing.subjects.push(item);
      } else {
        groups.set(item.examination_id, {
          examination_id: item.examination_id,
          examination_name: item.examination_name,
          academic_year_id: item.academic_year_id,
          start_date: item.start_date,
          end_date: item.end_date,
          examination_status: item.examination_status,
          subjects: [item],
        });
      }
    });

    return Array.from(groups.values());
  }, [examinations]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-sm text-slate-500">
              Loading examinations...
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

  const totalSubjects = examinations.length;

  const upcomingSubjects = examinations.filter(
    (item) =>
      item.examination_status.toUpperCase() === "UPCOMING"
  ).length;

  const totalExaminations = groupedExaminations.length;

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
                Examinations
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                View your child's examination schedule.
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

              navigate(`/parent/examinations/${id}`);
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
              Examinations
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {totalExaminations}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Subjects
            </p>

            <p className="mt-2 text-2xl font-bold text-blue-600">
              {totalSubjects}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Upcoming Subjects
            </p>

            <p className="mt-2 text-2xl font-bold text-amber-600">
              {upcomingSubjects}
            </p>
          </div>
        </div>

        {/* Empty State */}
        {groupedExaminations.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              📝
            </div>

            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              No Examinations
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              No examination schedule is currently available
              for this child.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedExaminations.map((exam) => (
              <div
                key={exam.examination_id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                {/* Exam Header */}
                <div className="border-b border-slate-200 p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900">
                        {exam.examination_name}
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Academic Year ID:{" "}
                        {exam.academic_year_id}
                      </p>
                    </div>

                    <span
                      className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-medium ${getStatusClass(
                        exam.examination_status
                      )}`}
                    >
                      {exam.examination_status}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Start Date
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {formatDate(exam.start_date)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        End Date
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {formatDate(exam.end_date)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Subjects */}
                <div className="p-6">
                  <h3 className="mb-4 text-sm font-semibold text-slate-900">
                    Examination Subjects
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px] text-left">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Subject
                          </th>

                          <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Exam Date
                          </th>

                          <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Max Marks
                          </th>

                          <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Passing Marks
                          </th>

                          <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Status
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {exam.subjects.map((subject) => (
                          <tr
                            key={subject.exam_subject_id}
                            className="border-b border-slate-100 last:border-0"
                          >
                            <td className="px-4 py-4">
                              <p className="font-medium text-slate-900">
                                {subject.subject_name}
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                Subject ID:{" "}
                                {subject.subject_id}
                              </p>
                            </td>

                            <td className="px-4 py-4 text-sm text-slate-600">
                              {formatDate(
                                subject.exam_date
                              )}
                            </td>

                            <td className="px-4 py-4 text-sm font-medium text-slate-700">
                              {subject.max_marks}
                            </td>

                            <td className="px-4 py-4 text-sm font-medium text-slate-700">
                              {subject.passing_marks}
                            </td>

                            <td className="px-4 py-4">
                              <span
                                className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getStatusClass(
                                  exam.examination_status
                                )}`}
                              >
                                {exam.examination_status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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

export default ParentExaminations;