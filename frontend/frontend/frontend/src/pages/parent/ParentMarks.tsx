import {
  Award,
  CheckCircle2,
  FileText,
  GraduationCap,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getMyChildren,
  type ParentChild,
} from "../../api/parentChildren";

import {
  getChildMarks,
  type ParentMark,
} from "../../api/parentMarks";

function ParentMarks() {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const [children, setChildren] = useState<ParentChild[]>([]);
  const [marks, setMarks] = useState<ParentMark[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const selectedStudentId = Number(studentId);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const childData = await getMyChildren();

        setChildren(childData);

        const child = childData.find(
          (item) => item.student_id === selectedStudentId
        );

        if (!child) {
          setError(
            "You are not authorized to view this student's marks."
          );
          return;
        }

        const markData = await getChildMarks(
          selectedStudentId
        );

        setMarks(markData);
      } catch (err) {
        console.error(
          "Failed to load child marks:",
          err
        );

        setError(
          "Failed to load marks. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    if (
      Number.isInteger(selectedStudentId) &&
      selectedStudentId > 0
    ) {
      void loadData();
    } else {
      setLoading(false);
      setError("Invalid student.");
    }
  }, [selectedStudentId]);

  const selectedChild = children.find(
    (child) =>
      child.student_id === selectedStudentId
  );

  const statistics = useMemo(() => {
    if (marks.length === 0) {
      return {
        totalSubjects: 0,
        passed: 0,
        failed: 0,
        average: 0,
        totalObtained: 0,
        totalMax: 0,
      };
    }

    const passed = marks.filter(
      (mark) => mark.result_status === "PASS"
    ).length;

    const failed = marks.filter(
      (mark) => mark.result_status === "FAIL"
    ).length;

    const totalObtained = marks.reduce(
      (sum, mark) =>
        sum + mark.marks_obtained,
      0
    );

    const totalMax = marks.reduce(
      (sum, mark) =>
        sum + mark.max_marks,
      0
    );

    const average =
      totalMax > 0
        ? (totalObtained / totalMax) * 100
        : 0;

    return {
      totalSubjects: marks.length,
      passed,
      failed,
      average,
      totalObtained,
      totalMax,
    };
  }, [marks]);

  const groupedMarks = useMemo(() => {
    const groups: Record<
      number,
      {
        examination_name: string;
        examination_status: string;
        start_date: string;
        end_date: string;
        marks: ParentMark[];
      }
    > = {};

    for (const mark of marks) {
      if (!groups[mark.examination_id]) {
        groups[mark.examination_id] = {
          examination_name:
            mark.examination_name,
          examination_status:
            mark.examination_status,
          start_date: mark.start_date,
          end_date: mark.end_date,
          marks: [],
        };
      }

      groups[mark.examination_id].marks.push(mark);
    }

    return Object.values(groups);
  }, [marks]);

  const formatDate = (
    value: string | null
  ) => {
    if (!value) return "-";

    return new Date(value).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getStatusClass = (
    status: string
  ) => {
    if (status === "PASS") {
      return "bg-emerald-50 text-emerald-700";
    }

    return "bg-red-50 text-red-700";
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-500">
            Loading marks...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-indigo-600" />

              <span className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
                Parent Portal
              </span>
            </div>

            <h1 className="text-3xl font-bold text-slate-900">
              Marks / Results
            </h1>

            <p className="mt-1 text-slate-500">
              View your child's examination results.
            </p>
          </div>

          {children.length > 0 && (
            <select
              value={
                selectedChild
                  ? selectedChild.student_id
                  : ""
              }
              onChange={(event) => {
                navigate(
                  `/parent/marks/${event.target.value}`
                );
              }}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-indigo-500"
            >
              {children.map((child) => (
                <option
                  key={child.student_id}
                  value={child.student_id}
                >
                  {child.first_name}{" "}
                  {child.last_name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Child Info */}
      {selectedChild && (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
              <GraduationCap className="h-6 w-6 text-indigo-600" />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">
                {selectedChild.first_name}{" "}
                {selectedChild.last_name}
              </h2>

              <p className="text-sm text-slate-500">
                Admission No:{" "}
                {selectedChild.admission_no}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">
              Subjects
            </span>

            <FileText className="h-5 w-5 text-indigo-600" />
          </div>

          <p className="text-3xl font-bold text-slate-900">
            {statistics.totalSubjects}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">
              Passed
            </span>

            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>

          <p className="text-3xl font-bold text-emerald-600">
            {statistics.passed}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">
              Failed
            </span>

            <XCircle className="h-5 w-5 text-red-600" />
          </div>

          <p className="text-3xl font-bold text-red-600">
            {statistics.failed}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">
              Overall %
            </span>

            <Award className="h-5 w-5 text-indigo-600" />
          </div>

          <p className="text-3xl font-bold text-slate-900">
            {statistics.average.toFixed(2)}%
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {statistics.totalObtained} /{" "}
            {statistics.totalMax} marks
          </p>
        </div>
      </div>

      {/* No Results */}
      {marks.length === 0 && !error && (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <FileText className="mx-auto mb-4 h-12 w-12 text-slate-300" />

          <h2 className="text-lg font-semibold text-slate-900">
            No marks available
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Examination marks have not been entered
            for this student yet.
          </p>
        </div>
      )}

      {/* Examination Results */}
      <div className="space-y-6">
        {groupedMarks.map((exam) => (
          <div
            key={exam.marks[0]?.examination_id}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
          >
            {/* Exam Header */}
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {exam.examination_name}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {formatDate(
                      exam.start_date
                    )}{" "}
                    -{" "}
                    {formatDate(
                      exam.end_date
                    )}
                  </p>
                </div>

                <span className="w-fit rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                  {exam.examination_status}
                </span>
              </div>
            </div>

            {/* Marks Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-6 py-4 font-semibold">
                      Subject
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Marks
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Percentage
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Grade
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Result
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Remarks
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {exam.marks.map((mark) => (
                    <tr
                      key={mark.mark_id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">
                          {mark.subject_name}
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          Exam Date:{" "}
                          {formatDate(
                            mark.start_date
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-900">
                          {mark.marks_obtained}
                        </span>

                        <span className="text-slate-500">
                          {" "}
                          / {mark.max_marks}
                        </span>

                        <div className="mt-1 text-xs text-slate-500">
                          Pass:{" "}
                          {mark.passing_marks}
                        </div>
                      </td>

                      <td className="px-6 py-4 font-medium text-slate-700">
                        {mark.percentage.toFixed(2)}%
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-sm font-semibold text-slate-700">
                          {mark.grade || "-"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                            mark.result_status
                          )}`}
                        >
                          {mark.result_status ===
                          "PASS" ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5" />
                          )}

                          {mark.result_status}
                        </span>
                      </td>

                      <td className="max-w-[220px] px-6 py-4 text-sm text-slate-600">
                        {mark.remarks || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ParentMarks;