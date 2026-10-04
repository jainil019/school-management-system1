import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  RefreshCw,
  Search,
  X,
  XCircle,
} from "lucide-react";

import {
  getHomeworkSubmissions,
  reviewHomeworkSubmission,
  type HomeworkSubmission,
} from "../../api/homeworkSubmissions";

import {
  getHomework,
  type Homework,
} from "../../api/homework";

import {
  getStudents,
  type Student,
} from "../../api/students";

import {
  getTeacherAssignments,
  type TeacherAssignment,
} from "../../api/teacherAssignments";

import {
  getClasses,
  type SchoolClass,
} from "../../api/classes";

import {
  getSections,
  type Section,
} from "../../api/sections";

import {
  getSubjects,
  type Subject,
} from "../../api/subjects";



interface ReviewForm {
  status: string;
  feedback: string;
}

export default function TeacherHomeworkSubmissions() {
  const [submissions, setSubmissions] = useState<
    HomeworkSubmission[]
  >([]);

  const [homework, setHomework] = useState<
    Homework[]
  >([]);

  const [students, setStudents] = useState<
    Student[]
  >([]);

  const [assignments, setAssignments] = useState<
    TeacherAssignment[]
  >([]);

  const [classes, setClasses] = useState<
    SchoolClass[]
  >([]);

  const [sections, setSections] = useState<
    Section[]
  >([]);

  const [subjects, setSubjects] = useState<
    Subject[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [selectedSubmission, setSelectedSubmission] =
    useState<HomeworkSubmission | null>(
      null
    );

  const [reviewForm, setReviewForm] =
    useState<ReviewForm>({
      status: "REVIEWED",
      feedback: "",
    });

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        submissionData,
        homeworkData,
        studentData,
        assignmentData,
        classData,
        sectionData,
        subjectData,
      ] = await Promise.all([
        getHomeworkSubmissions(),
        getHomework(),
        getStudents(),
        getTeacherAssignments(),
        getClasses(),
        getSections(),
        getSubjects(),
      ]);

      setSubmissions(submissionData);
      setHomework(homeworkData);
      setStudents(studentData);
      setAssignments(assignmentData);
      setClasses(classData);
      setSections(sectionData);
      setSubjects(subjectData);
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.detail ||
          "Unable to load homework submissions."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const homeworkMap = useMemo(
    () =>
      new Map(
        homework.map((item) => [
          item.id,
          item,
        ])
      ),
    [homework]
  );

  const studentMap = useMemo(
    () =>
      new Map(
        students.map((item) => [
          item.id,
          item,
        ])
      ),
    [students]
  );

  const classMap = useMemo(
    () =>
      new Map(
        classes.map((item) => [
          item.id,
          item,
        ])
      ),
    [classes]
  );

  const sectionMap = useMemo(
    () =>
      new Map(
        sections.map((item) => [
          item.id,
          item,
        ])
      ),
    [sections]
  );

  const subjectMap = useMemo(
    () =>
      new Map(
        subjects.map((item) => [
          item.id,
          item,
        ])
      ),
    [subjects]
  );

  /*
   * Only submissions belonging to the
   * logged-in teacher's assignments are shown.
   */
  const teacherHomeworkIds = useMemo(() => {
    const allowedKeys = new Set(
      assignments.map(
        (assignment) =>
          `${assignment.class_id}-${assignment.section_id}-${assignment.subject_id}`
      )
    );

    return new Set(
      homework
        .filter((item) =>
          allowedKeys.has(
            `${item.class_id}-${item.section_id}-${item.subject_id}`
          )
        )
        .map((item) => item.id)
    );
  }, [assignments, homework]);

  const teacherSubmissions = useMemo(
    () =>
      submissions.filter((submission) =>
        teacherHomeworkIds.has(
          submission.homework_id
        )
      ),
    [submissions, teacherHomeworkIds]
  );

  const filteredSubmissions = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return teacherSubmissions.filter(
      (submission) => {
        const homeworkItem =
          homeworkMap.get(
            submission.homework_id
          );

        const student =
          studentMap.get(
            submission.student_id
          );

        const className =
          homeworkItem
            ? classMap
                .get(homeworkItem.class_id)
                ?.name.toLowerCase() || ""
            : "";

        const sectionName =
          homeworkItem?.section_id
            ? sectionMap
                .get(
                  homeworkItem.section_id
                )
                ?.name.toLowerCase() || ""
            : "";

        const subjectName =
          homeworkItem
            ? subjectMap
                .get(homeworkItem.subject_id)
                ?.name.toLowerCase() || ""
            : "";

        const studentName =
          student
            ? `${student.first_name} ${student.last_name}`.toLowerCase()
            : "";

        const matchesSearch =
          !query ||
          homeworkItem?.title
            .toLowerCase()
            .includes(query) ||
          studentName.includes(query) ||
          student?.admission_no
            ?.toLowerCase()
            .includes(query) ||
          className.includes(query) ||
          sectionName.includes(query) ||
          subjectName.includes(query);

        const normalizedStatus =
          submission.status.toUpperCase();

        const matchesStatus =
          statusFilter === "ALL" ||
          normalizedStatus ===
            statusFilter;

        return (
          matchesSearch &&
          matchesStatus
        );
      }
    );
  }, [
    teacherSubmissions,
    search,
    statusFilter,
    homeworkMap,
    studentMap,
    classMap,
    sectionMap,
    subjectMap,
  ]);

  const stats = useMemo(() => {
    const total =
      teacherSubmissions.length;

    const pending =
      teacherSubmissions.filter(
        (item) =>
          item.status.toUpperCase() ===
          "SUBMITTED"
      ).length;

    const reviewed =
      teacherSubmissions.filter(
        (item) =>
          item.status.toUpperCase() ===
          "REVIEWED"
      ).length;

    const rejected =
      teacherSubmissions.filter(
        (item) =>
          item.status.toUpperCase() ===
          "REJECTED"
      ).length;

    return {
      total,
      pending,
      reviewed,
      rejected,
    };
  }, [teacherSubmissions]);

  const openReview = (
    submission: HomeworkSubmission
  ) => {
    setSelectedSubmission(
      submission
    );

    setReviewForm({
      status:
        submission.status.toUpperCase() ===
        "REVIEWED"
          ? "REVIEWED"
          : "REVIEWED",
      feedback:
        submission.feedback || "",
    });

    setError("");
  };

  const closeReview = () => {
    setSelectedSubmission(null);

    setReviewForm({
      status: "REVIEWED",
      feedback: "",
    });
  };

  const handleReview = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!selectedSubmission) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const updated =
        await reviewHomeworkSubmission(
          selectedSubmission.id,
          {
            status:
              reviewForm.status,
            feedback:
              reviewForm.feedback.trim() ||
              null,
          }
        );

      setSubmissions((current) =>
        current.map((item) =>
          item.id === updated.id
            ? updated
            : item
        )
      );

      closeReview();
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.detail ||
          "Unable to review submission."
      );
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (
    status: string
  ) => {
    const normalized =
      status.toUpperCase();

    if (normalized === "REVIEWED") {
      return {
        label: "Reviewed",
        className:
          "bg-emerald-50 text-emerald-700",
        icon: CheckCircle2,
      };
    }

    if (normalized === "REJECTED") {
      return {
        label: "Rejected",
        className:
          "bg-red-50 text-red-700",
        icon: XCircle,
      };
    }

    return {
      label: "Pending Review",
      className:
        "bg-amber-50 text-amber-700",
      icon: Clock3,
    };
  };

  const formatStudentName = (
    studentId: number
  ) => {
    const student =
      studentMap.get(studentId);

    if (!student) {
      return `Student #${studentId}`;
    }

    return `${student.first_name} ${student.last_name}`;
  };

  const getHomeworkInfo = (
    homeworkId: number
  ) => {
    const item =
      homeworkMap.get(homeworkId);

    if (!item) {
      return {
        title: `Homework #${homeworkId}`,
        className: "-",
        sectionName: "-",
        subjectName: "-",
      };
    }

    return {
      title: item.title,

      className:
        classMap.get(item.class_id)
          ?.name ||
        `Class #${item.class_id}`,

      sectionName: item.section_id
        ? sectionMap.get(
            item.section_id
          )?.name ||
          `Section #${item.section_id}`
        : "All sections",

      subjectName:
        subjectMap.get(
          item.subject_id
        )?.name ||
        `Subject #${item.subject_id}`,
    };
  };

  return (
    <div className="space-y-7">

      {/* Header */}

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

        <div>
          <p className="text-sm font-medium text-blue-600">
            Teacher Portal
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Homework Submissions
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Review homework submitted by your students.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            void loadData()
          }
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <RefreshCw size={17} />
          Refresh
        </button>

      </div>

      {/* Error */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Stats */}

      <div className="grid gap-5 md:grid-cols-4">

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <FileText size={21} />
          </div>

          <p className="mt-5 text-sm font-medium text-slate-500">
            Total Submissions
          </p>

          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            {loading
              ? "..."
              : stats.total}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Clock3 size={21} />
          </div>

          <p className="mt-5 text-sm font-medium text-slate-500">
            Pending Review
          </p>

          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            {loading
              ? "..."
              : stats.pending}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={21} />
          </div>

          <p className="mt-5 text-sm font-medium text-slate-500">
            Reviewed
          </p>

          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            {loading
              ? "..."
              : stats.reviewed}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
            <XCircle size={21} />
          </div>

          <p className="mt-5 text-sm font-medium text-slate-500">
            Rejected
          </p>

          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            {loading
              ? "..."
              : stats.rejected}
          </h2>
        </div>

      </div>

      {/* Filters */}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="grid gap-4 md:grid-cols-[1fr_220px]">

          <div className="relative">

            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search student, homework, class or subject..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />

          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="ALL">
              All Status
            </option>

            <option value="SUBMITTED">
              Pending Review
            </option>

            <option value="REVIEWED">
              Reviewed
            </option>

            <option value="REJECTED">
              Rejected
            </option>
          </select>

        </div>

      </div>

      {/* Table */}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-200 px-6 py-5">

          <h2 className="font-semibold text-slate-900">
            Student Submissions
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {filteredSubmissions.length} submission
            {filteredSubmissions.length === 1
              ? ""
              : "s"}
          </p>

        </div>

        {loading ? (
          <div className="p-12 text-center">

            <RefreshCw
              size={30}
              className="mx-auto animate-spin text-blue-600"
            />

            <p className="mt-3 text-sm text-slate-500">
              Loading submissions...
            </p>

          </div>
        ) : filteredSubmissions.length ===
          0 ? (
          <div className="p-12 text-center">

            <FileText
              size={42}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-4 font-semibold text-slate-800">
              No submissions found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              No student submissions match your current filters.
            </p>

          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full min-w-[1100px]">

              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left">

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Student
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Homework
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Class
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Submitted
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    File
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Action
                  </th>

                </tr>
              </thead>

              <tbody>

                {filteredSubmissions.map(
                  (submission) => {
                    const info =
                      getHomeworkInfo(
                        submission.homework_id
                      );

                    const status =
                      getStatusBadge(
                        submission.status
                      );

                    const StatusIcon =
                      status.icon;

                    const student =
                      studentMap.get(
                        submission.student_id
                      );

                    return (
                      <tr
                        key={submission.id}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >

                        {/* Student */}

                        <td className="px-6 py-4">

                          <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 font-semibold text-blue-600">
                              {student
                                ? student.first_name
                                    .charAt(0)
                                    .toUpperCase()
                                : "S"}
                            </div>

                            <div>
                              <p className="font-semibold text-slate-900">
                                {formatStudentName(
                                  submission.student_id
                                )}
                              </p>

                              {student && (
                                <p className="mt-1 text-xs text-slate-400">
                                  {student.admission_no}
                                </p>
                              )}
                            </div>

                          </div>

                        </td>

                        {/* Homework */}

                        <td className="px-6 py-4">

                          <p className="max-w-[230px] font-semibold text-slate-800">
                            {info.title}
                          </p>

                          <p className="mt-1 text-xs text-blue-600">
                            {info.subjectName}
                          </p>

                        </td>

                        {/* Class */}

                        <td className="px-6 py-4">

                          <p className="text-sm font-semibold text-slate-800">
                            {info.className}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {info.sectionName}
                          </p>

                        </td>

                        {/* Submitted */}

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {submission.submitted_at
                            ? new Date(
                                submission.submitted_at
                              ).toLocaleString()
                            : "Not submitted"}
                        </td>

                        {/* Status */}

                        <td className="px-6 py-4">

                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                          >
                            <StatusIcon
                              size={14}
                            />

                            {status.label}
                          </span>

                        </td>

                        {/* File */}

                        <td className="px-6 py-4">

                          {submission.file_url ? (
                            <a
                              href={
                                submission.file_url
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                            >
                              <Eye
                                size={14}
                              />
                              View File
                            </a>
                          ) : (
                            <span className="text-xs text-slate-400">
                              No file
                            </span>
                          )}

                        </td>

                        {/* Action */}

                        <td className="px-6 py-4">

                          <button
                            type="button"
                            onClick={() =>
                              openReview(
                                submission
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                          >
                            <Eye
                              size={15}
                            />
                            Review
                          </button>

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* Review Modal */}

      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">

          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Review Submission
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {formatStudentName(
                    selectedSubmission.student_id
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={closeReview}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>

            </div>

            <form
              onSubmit={handleReview}
              className="space-y-5 p-6"
            >

              {/* Homework information */}

              <div className="rounded-xl bg-slate-50 p-4">

                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Homework
                </p>

                <p className="mt-1 font-semibold text-slate-900">
                  {
                    getHomeworkInfo(
                      selectedSubmission.homework_id
                    ).title
                  }
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {
                    getHomeworkInfo(
                      selectedSubmission.homework_id
                    ).className
                  }{" "}
                  •{" "}
                  {
                    getHomeworkInfo(
                      selectedSubmission.homework_id
                    ).sectionName
                  }{" "}
                  •{" "}
                  {
                    getHomeworkInfo(
                      selectedSubmission.homework_id
                    ).subjectName
                  }
                </p>

              </div>

              {/* Submitted date */}

              <div>
                <p className="text-sm font-semibold text-slate-700">
                  Submitted At
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedSubmission.submitted_at
                    ? new Date(
                        selectedSubmission.submitted_at
                      ).toLocaleString()
                    : "Not submitted"}
                </p>
              </div>

              {/* File */}

              {selectedSubmission.file_url && (
                <a
                  href={
                    selectedSubmission.file_url
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                >
                  <FileText size={18} />
                  Open Student Submission
                </a>
              )}

              {/* Status */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Review Status
                </label>

                <select
                  value={
                    reviewForm.status
                  }
                  onChange={(event) =>
                    setReviewForm(
                      (current) => ({
                        ...current,
                        status:
                          event.target.value,
                      })
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="REVIEWED">
                    Reviewed
                  </option>

                  <option value="REJECTED">
                    Rejected
                  </option>

                  <option value="SUBMITTED">
                    Pending Review
                  </option>
                </select>

              </div>

              {/* Feedback */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Feedback
                </label>

                <textarea
                  value={
                    reviewForm.feedback
                  }
                  onChange={(event) =>
                    setReviewForm(
                      (current) => ({
                        ...current,
                        feedback:
                          event.target.value,
                      })
                    )
                  }
                  rows={5}
                  placeholder="Write feedback for the student..."
                  className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

              </div>

              {/* Buttons */}

              <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">

                <button
                  type="button"
                  onClick={closeReview}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <RefreshCw
                      size={16}
                      className="animate-spin"
                    />
                  )}

                  Save Review
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}