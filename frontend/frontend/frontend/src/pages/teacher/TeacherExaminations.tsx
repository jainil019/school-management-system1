import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";

import {
  BookOpen,
  CalendarDays,
  ClipboardList,
  RefreshCw,
  Search,
} from "lucide-react";

import {
  getExaminations,
  type Examination,
} from "../../api/examinations";

import {
  type ExamSubject,
} from "../../api/examSubjects";

import {
  getTeacherAssignments,
  type TeacherAssignment,
} from "../../api/teacherAssignments";

import {
  getClasses,
  type SchoolClass,
} from "../../api/classes";

import {
  getSubjects,
  type Subject,
} from "../../api/subjects";

import {
  getAcademicYears,
  type AcademicYear,
} from "../../api/academicYears";

export default function TeacherExaminations() {
  const [examinations, setExaminations] =
    useState<Examination[]>([]);

  const [examSubjects, setExamSubjects] =
    useState<ExamSubject[]>([]);

  const [assignments, setAssignments] =
    useState<TeacherAssignment[]>([]);

  const [classes, setClasses] =
    useState<SchoolClass[]>([]);

  const [subjects, setSubjects] =
    useState<Subject[]>([]);

  const [academicYears, setAcademicYears] =
    useState<AcademicYear[]>([]);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        examinationData,
        examSubjectResponse,
        assignmentData,
        classData,
        subjectData,
        academicYearData,
      ] = await Promise.all([
        getExaminations(),

        api.get("/exam-subjects").then(
          (response) => response.data
        ),

        getTeacherAssignments(),
        getClasses(),
        getSubjects(),
        getAcademicYears(),
      ]);

      setExaminations(examinationData);

      setExamSubjects(
        examSubjectResponse
      );

      setAssignments(assignmentData);
      setClasses(classData);
      setSubjects(subjectData);
      setAcademicYears(
        academicYearData
      );
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.detail ||
          "Unable to load examinations."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

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

  const academicYearMap = useMemo(
    () =>
      new Map(
        academicYears.map((item) => [
          item.id,
          item,
        ])
      ),
    [academicYears]
  );

  /*
   * A teacher can see an exam subject when:
   *
   * teacher assignment class == exam subject class
   *
   * AND
   *
   * teacher assignment subject == exam subject subject
   */
  const teacherExamSubjects = useMemo(() => {
    return examSubjects.filter(
      (examSubject) =>
        assignments.some(
          (assignment) =>
            assignment.class_id ===
              examSubject.class_id &&
            assignment.subject_id ===
              examSubject.subject_id
        )
    );
  }, [examSubjects, assignments]);

  const teacherExamIds = useMemo(
    () =>
      new Set(
        teacherExamSubjects.map(
          (item) => item.examination_id
        )
      ),
    [teacherExamSubjects]
  );

  const teacherExaminations = useMemo(
    () =>
      examinations.filter((exam) =>
        teacherExamIds.has(exam.id)
      ),
    [examinations, teacherExamIds]
  );

  const filteredExaminations = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return teacherExaminations.filter(
      (exam) => {
        const year =
          academicYearMap.get(
            exam.academic_year_id
          );

        const matchesSearch =
          !query ||
          exam.name
            .toLowerCase()
            .includes(query) ||
          exam.status
            .toLowerCase()
            .includes(query) ||
          year?.name
            .toLowerCase()
            .includes(query);

        const matchesStatus =
          statusFilter === "ALL" ||
          exam.status.toUpperCase() ===
            statusFilter;

        return (
          matchesSearch &&
          matchesStatus
        );
      }
    );
  }, [
    teacherExaminations,
    search,
    statusFilter,
    academicYearMap,
  ]);

  const getTeacherExamSubjects = (
    examinationId: number
  ) => {
    return teacherExamSubjects.filter(
      (item) =>
        item.examination_id ===
        examinationId
    );
  };

  const getStatusStyle = (
    status: string
  ) => {
    switch (status.toUpperCase()) {
      case "UPCOMING":
        return "bg-blue-50 text-blue-700";

      case "ONGOING":
        return "bg-amber-50 text-amber-700";

      case "COMPLETED":
        return "bg-emerald-50 text-emerald-700";

      case "CANCELLED":
        return "bg-red-50 text-red-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const totalExamSubjects =
    teacherExamSubjects.length;

  const upcomingExams =
    teacherExaminations.filter(
      (item) =>
        item.status.toUpperCase() ===
        "UPCOMING"
    ).length;

  const completedExams =
    teacherExaminations.filter(
      (item) =>
        item.status.toUpperCase() ===
        "COMPLETED"
    ).length;

  return (
    <div className="space-y-7">

      {/* Header */}

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

        <div>
          <p className="text-sm font-medium text-blue-600">
            Teacher Portal
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Examinations
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View examinations and subjects assigned to you.
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
            <ClipboardList size={21} />
          </div>

          <p className="mt-5 text-sm font-medium text-slate-500">
            My Examinations
          </p>

          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            {loading
              ? "..."
              : teacherExaminations.length}
          </h2>

        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <CalendarDays size={21} />
          </div>

          <p className="mt-5 text-sm font-medium text-slate-500">
            Upcoming
          </p>

          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            {loading
              ? "..."
              : upcomingExams}
          </h2>

        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <BookOpen size={21} />
          </div>

          <p className="mt-5 text-sm font-medium text-slate-500">
            Exam Subjects
          </p>

          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            {loading
              ? "..."
              : totalExamSubjects}
          </h2>

        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
            <ClipboardList size={21} />
          </div>

          <p className="mt-5 text-sm font-medium text-slate-500">
            Completed
          </p>

          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            {loading
              ? "..."
              : completedExams}
          </h2>

        </div>

      </div>

      {/* Search / Filter */}

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
              placeholder="Search examination..."
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

            <option value="UPCOMING">
              Upcoming
            </option>

            <option value="ONGOING">
              Ongoing
            </option>

            <option value="COMPLETED">
              Completed
            </option>

            <option value="CANCELLED">
              Cancelled
            </option>
          </select>

        </div>

      </div>

      {/* Examination Cards */}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">

          <RefreshCw
            size={30}
            className="mx-auto animate-spin text-blue-600"
          />

          <p className="mt-3 text-sm text-slate-500">
            Loading examinations...
          </p>

        </div>
      ) : filteredExaminations.length ===
        0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">

          <ClipboardList
            size={45}
            className="mx-auto text-slate-300"
          />

          <h3 className="mt-4 font-semibold text-slate-800">
            No examinations found
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            No examinations are currently assigned to your subjects.
          </p>

        </div>
      ) : (
        <div className="space-y-5">

          {filteredExaminations.map(
            (exam) => {
              const examSubjectList =
                getTeacherExamSubjects(
                  exam.id
                );

              const year =
                academicYearMap.get(
                  exam.academic_year_id
                );

              return (
                <div
                  key={exam.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >

                  {/* Exam Header */}

                  <div className="flex flex-col justify-between gap-4 border-b border-slate-200 bg-slate-50 px-6 py-5 md:flex-row md:items-center">

                    <div>

                      <div className="flex flex-wrap items-center gap-3">

                        <h2 className="text-lg font-bold text-slate-900">
                          {exam.name}
                        </h2>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                            exam.status
                          )}`}
                        >
                          {exam.status}
                        </span>

                      </div>

                      <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-500">

                        <span>
                          Academic Year:{" "}
                          <strong className="text-slate-700">
                            {year?.name ||
                              `Year #${exam.academic_year_id}`}
                          </strong>
                        </span>

                        <span>
                          {exam.start_date} →{" "}
                          {exam.end_date}
                        </span>

                      </div>

                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                      <ClipboardList
                        size={23}
                      />
                    </div>

                  </div>

                  {/* Subjects */}

                  <div className="p-6">

                    <div className="mb-4 flex items-center justify-between">

                      <div>
                        <h3 className="font-semibold text-slate-900">
                          My Exam Subjects
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                          {examSubjectList.length} subject
                          {examSubjectList.length ===
                          1
                            ? ""
                            : "s"} assigned
                        </p>
                      </div>

                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

                      {examSubjectList.map(
                        (examSubject) => {

                          const schoolClass =
                            classMap.get(
                              examSubject.class_id
                            );

                          const subject =
                            subjectMap.get(
                              examSubject.subject_id
                            );

                          return (
                            <div
                              key={
                                examSubject.id
                              }
                              className="rounded-xl border border-slate-200 p-4 hover:border-blue-200 hover:bg-blue-50/30"
                            >

                              <div className="flex items-start justify-between gap-3">

                                <div>

                                  <p className="font-semibold text-slate-900">
                                    {subject?.name ||
                                      `Subject #${examSubject.subject_id}`}
                                  </p>

                                  <p className="mt-1 text-sm text-blue-600">
                                    {schoolClass?.name ||
                                      `Class #${examSubject.class_id}`}
                                  </p>

                                </div>

                                <BookOpen
                                  size={18}
                                  className="text-slate-400"
                                />

                              </div>

                              <div className="mt-4 grid grid-cols-2 gap-3">

                                <div className="rounded-lg bg-slate-50 p-3">

                                  <p className="text-xs text-slate-400">
                                    Max Marks
                                  </p>

                                  <p className="mt-1 text-sm font-bold text-slate-800">
                                    {
                                      examSubject.max_marks
                                    }
                                  </p>

                                </div>

                                <div className="rounded-lg bg-slate-50 p-3">

                                  <p className="text-xs text-slate-400">
                                    Passing
                                  </p>

                                  <p className="mt-1 text-sm font-bold text-slate-800">
                                    {
                                      examSubject.passing_marks
                                    }
                                  </p>

                                </div>

                              </div>

                              <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">

                                <CalendarDays
                                  size={14}
                                />

                                Exam Date:{" "}
                                <span className="font-semibold text-slate-700">
                                  {
                                    examSubject.exam_date
                                  }
                                </span>

                              </div>

                            </div>
                          );
                        }
                      )}

                    </div>

                  </div>

                </div>
              );
            }
          )}

        </div>
      )}

    </div>
  );
}