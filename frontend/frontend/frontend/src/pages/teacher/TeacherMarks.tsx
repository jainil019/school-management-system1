import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Edit3,
  FileText,
  Loader2,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import { getMarks, createMark, updateMark, deleteMark } from "../../api/marks";
import { getStudents, type Student } from "../../api/students";
import {
  getStudentEnrollments,
  type StudentEnrollment,
} from "../../api/studentEnrollments";
import {
  getExamSubjects,
  type ExamSubject,
} from "../../api/examSubjects";
import {
  getExaminations,
  type Examination,
} from "../../api/examinations";
import {
  getSubjects,
  type Subject,
} from "../../api/subjects";
import {
  getClasses,
  type SchoolClass,
} from "../../api/classes";
import {
  getTeacherAssignments,
  type TeacherAssignment,
} from "../../api/teacherAssignments";

interface MarkForm {
  exam_subject_id: number;
  student_id: number;
  marks_obtained: string;
  grade: string;
  remarks: string;
}

const emptyForm: MarkForm = {
  exam_subject_id: 0,
  student_id: 0,
  marks_obtained: "",
  grade: "",
  remarks: "",
};

const getGrade = (marks: number, maxMarks: number): string => {
  if (maxMarks <= 0) return "";

  const percentage = (marks / maxMarks) * 100;

  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B+";
  if (percentage >= 60) return "B";
  if (percentage >= 50) return "C";
  if (percentage >= 40) return "D";
  return "F";
};

const formatDate = (date: string) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};


export default function TeacherMarks() {
  const [marks, setMarks] = useState<any[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([]);
  const [examSubjects, setExamSubjects] = useState<ExamSubject[]>([]);
  const [examinations, setExaminations] = useState<Examination[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedExamId, setSelectedExamId] = useState<number | "">("");
  const [selectedExamSubjectId, setSelectedExamSubjectId] = useState<
    number | ""
  >("");

  const [showModal, setShowModal] = useState(false);
  const [editingMarkId, setEditingMarkId] = useState<number | null>(null);
  const [form, setForm] = useState<MarkForm>(emptyForm);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        marksData,
        studentsData,
        enrollmentsData,
        examSubjectsData,
        examinationsData,
        subjectsData,
        classesData,
        assignmentsData,
      ] = await Promise.all([
        getMarks(),
        getStudents(),
        getStudentEnrollments(),
        getExamSubjects(),
        getExaminations(),
        getSubjects(),
        getClasses(),
        getTeacherAssignments(),
      ]);

      setMarks(marksData);
      setStudents(studentsData);
      setEnrollments(enrollmentsData);
      setExamSubjects(examSubjectsData);
      setExaminations(examinationsData);
      setSubjects(subjectsData);
      setClasses(classesData);
      setAssignments(assignmentsData);
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "Failed to load marks data."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * Teacher can only see exam subjects where:
   *
   * assignment.class_id === examSubject.class_id
   * assignment.subject_id === examSubject.subject_id
   */
  const teacherExamSubjects = useMemo(() => {
    const allowedKeys = new Set(
      assignments.map(
        (assignment) =>
          `${assignment.class_id}-${assignment.subject_id}`
      )
    );

    return examSubjects.filter((examSubject) =>
      allowedKeys.has(
        `${examSubject.class_id}-${examSubject.subject_id}`
      )
    );
  }, [assignments, examSubjects]);

  const teacherExamSubjectIds = useMemo(
    () => new Set(teacherExamSubjects.map((item) => item.id)),
    [teacherExamSubjects]
  );

  /*
   * Only marks belonging to the teacher's assigned
   * exam subjects are displayed.
   */
  const teacherMarks = useMemo(() => {
    return marks.filter((mark) =>
      teacherExamSubjectIds.has(mark.exam_subject_id)
    );
  }, [marks, teacherExamSubjectIds]);

  const filteredExamSubjects = useMemo(() => {
    return teacherExamSubjects.filter((examSubject) => {
      if (
        selectedExamId !== "" &&
        examSubject.examination_id !== selectedExamId
      ) {
        return false;
      }

      return true;
    });
  }, [teacherExamSubjects, selectedExamId]);

  const filteredMarks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return teacherMarks.filter((mark) => {
      if (
        selectedExamSubjectId !== "" &&
        mark.exam_subject_id !== selectedExamSubjectId
      ) {
        return false;
      }

      const student = students.find(
        (item) => item.id === mark.student_id
      );

      const examSubject = examSubjects.find(
        (item) => item.id === mark.exam_subject_id
      );

      const subject = examSubject
        ? subjects.find((item) => item.id === examSubject.subject_id)
        : undefined;

      const examination = examSubject
        ? examinations.find(
            (item) => item.id === examSubject.examination_id
          )
        : undefined;

      const classItem = examSubject
        ? classes.find((item) => item.id === examSubject.class_id)
        : undefined;

      const studentName = student
        ? `${student.first_name} ${student.last_name}`
        : "";

      const searchableText = [
        studentName,
        student?.admission_no ?? "",
        subject?.name ?? "",
        subject?.code ?? "",
        examination?.name ?? "",
        classItem?.name ?? "",
        mark.grade ?? "",
        mark.remarks ?? "",
        mark.marks_obtained,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [
    teacherMarks,
    students,
    examSubjects,
    subjects,
    examinations,
    classes,
    search,
    selectedExamSubjectId,
  ]);

  const selectedExamSubject = useMemo(() => {
    if (!form.exam_subject_id) return undefined;

    return examSubjects.find(
      (item) => item.id === form.exam_subject_id
    );
  }, [examSubjects, form.exam_subject_id]);

  const availableStudents = useMemo(() => {
    if (!selectedExamSubject) return [];

    /*
     * Students must be actively enrolled in the exam subject's class.
     */
    const enrolledStudentIds = new Set(
      enrollments
        .filter(
          (enrollment) =>
            enrollment.class_id === selectedExamSubject.class_id &&
            enrollment.status.toUpperCase() === "ACTIVE"
        )
        .map((enrollment) => enrollment.student_id)
    );

    return students
      .filter(
        (student) =>
          student.status.toUpperCase() === "ACTIVE" &&
          enrolledStudentIds.has(student.id)
      )
      .sort((a, b) =>
        `${a.first_name} ${a.last_name}`.localeCompare(
          `${b.first_name} ${b.last_name}`
        )
      );
  }, [students, enrollments, selectedExamSubject]);

  const existingMarkForStudent = useMemo(() => {
    if (!form.exam_subject_id || !form.student_id) {
      return undefined;
    }

    return teacherMarks.find(
      (mark) =>
        mark.exam_subject_id === form.exam_subject_id &&
        mark.student_id === form.student_id &&
        mark.id !== editingMarkId
    );
  }, [
    teacherMarks,
    form.exam_subject_id,
    form.student_id,
    editingMarkId,
  ]);

  const stats = useMemo(() => {
    const total = teacherMarks.length;

    const passed = teacherMarks.filter((mark) => {
      const examSubject = examSubjects.find(
        (item) => item.id === mark.exam_subject_id
      );

      return (
        examSubject &&
        Number(mark.marks_obtained) >=
          Number(examSubject.passing_marks)
      );
    }).length;

    const failed = total - passed;

    const average =
      total > 0
        ? teacherMarks.reduce(
            (sum, mark) => sum + Number(mark.marks_obtained),
            0
          ) / total
        : 0;

    return {
      total,
      passed,
      failed,
      average,
    };
  }, [teacherMarks, examSubjects]);

 

  const openCreateModal = () => {
    setEditingMarkId(null);

    setForm({
      ...emptyForm,
      exam_subject_id:
        selectedExamSubjectId !== ""
          ? selectedExamSubjectId
          : filteredExamSubjects[0]?.id ?? 0,
    });

    setError("");
    setShowModal(true);
  };

  const openEditModal = (mark: any) => {
    setEditingMarkId(mark.id);

    setForm({
      exam_subject_id: mark.exam_subject_id,
      student_id: mark.student_id,
      marks_obtained: String(mark.marks_obtained),
      grade: mark.grade ?? "",
      remarks: mark.remarks ?? "",
    });

    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingMarkId(null);
    setForm(emptyForm);
  };

  const handleExamSubjectChange = (value: number) => {
    setForm((previous) => ({
      ...previous,
      exam_subject_id: value,
      student_id: 0,
      marks_obtained: "",
      grade: "",
      remarks: "",
    }));
  };

  const handleMarksChange = (value: string) => {
    if (value === "") {
      setForm((previous) => ({
        ...previous,
        marks_obtained: "",
        grade: "",
      }));
      return;
    }

    const numberValue = Number(value);

    if (Number.isNaN(numberValue)) return;

    const maxMarks = Number(selectedExamSubject?.max_marks ?? 0);

    const grade =
      maxMarks > 0 && numberValue >= 0
        ? getGrade(numberValue, maxMarks)
        : "";

    setForm((previous) => ({
      ...previous,
      marks_obtained: value,
      grade,
    }));
  };

  const handleSave = async () => {
    try {
      setError("");

      if (!form.exam_subject_id) {
        setError("Please select an exam subject.");
        return;
      }

      if (!form.student_id) {
        setError("Please select a student.");
        return;
      }

      if (form.marks_obtained === "") {
        setError("Please enter marks.");
        return;
      }

      const marksObtained = Number(form.marks_obtained);
      const maxMarks = Number(
        selectedExamSubject?.max_marks ?? 0
      );

      if (Number.isNaN(marksObtained)) {
        setError("Marks must be a valid number.");
        return;
      }

      if (marksObtained < 0) {
        setError("Marks cannot be negative.");
        return;
      }

      if (marksObtained > maxMarks) {
        setError(
          `Marks cannot be greater than ${maxMarks}.`
        );
        return;
      }

      if (!editingMarkId && existingMarkForStudent) {
        setError(
          "Marks already exist for this student and exam subject."
        );
        return;
      }

      setSaving(true);

      if (editingMarkId) {
        const updated = await updateMark(editingMarkId, {
          marks_obtained: marksObtained,
          grade: form.grade || null,
          remarks: form.remarks.trim() || null,
        });

        setMarks((previous) =>
          previous.map((mark) =>
            mark.id === editingMarkId ? updated : mark
          )
        );
      } else {
        const created = await createMark({
          exam_subject_id: form.exam_subject_id,
          student_id: form.student_id,
          marks_obtained: marksObtained,
          grade: form.grade || null,
          remarks: form.remarks.trim() || null,
        });

        setMarks((previous) => [...previous, created]);
      }

      closeModal();
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "Failed to save marks."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete these marks?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteMark(id);

      setMarks((previous) =>
        previous.filter((mark) => mark.id !== id)
      );
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "Failed to delete marks."
      );
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading marks...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
            <FileText className="h-4 w-4" />
            <span>Teacher Panel</span>
            <span>/</span>
            <span>Marks</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900">
            Marks Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Enter and manage marks for your assigned subjects.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          disabled={filteredExamSubjects.length === 0}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <Plus className="h-4 w-4" />
          Enter Marks
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Total Marks
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {stats.total}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Passed
          </p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">
            {stats.passed}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Failed
          </p>
          <p className="mt-2 text-3xl font-bold text-red-600">
            {stats.failed}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Average Marks
          </p>
          <p className="mt-2 text-3xl font-bold text-blue-600">
            {stats.average.toFixed(1)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Search
            </label>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Student, subject, exam..."
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Examination
            </label>

            <select
              value={selectedExamId}
              onChange={(event) => {
                const value = event.target.value;

                setSelectedExamId(
                  value === "" ? "" : Number(value)
                );

                setSelectedExamSubjectId("");
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">All examinations</option>

              {examinations
                .filter((exam) =>
                  teacherExamSubjects.some(
                    (item) =>
                      item.examination_id === exam.id
                  )
                )
                .map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Subject / Class
            </label>

            <select
              value={selectedExamSubjectId}
              onChange={(event) => {
                const value = event.target.value;

                setSelectedExamSubjectId(
                  value === "" ? "" : Number(value)
                );
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">All subjects</option>

              {filteredExamSubjects.map((examSubject) => {
                const subject = subjects.find(
                  (item) =>
                    item.id === examSubject.subject_id
                );

                const classItem = classes.find(
                  (item) =>
                    item.id === examSubject.class_id
                );

                return (
                  <option
                    key={examSubject.id}
                    value={examSubject.id}
                  >
                    {subject?.name ?? "Subject"} -{" "}
                    {classItem?.name ?? "Class"}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-900">
            Student Marks
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {filteredMarks.length} record
            {filteredMarks.length !== 1 ? "s" : ""}
          </p>
        </div>

        {filteredMarks.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
            <FileText className="h-12 w-12 text-slate-300" />

            <h3 className="mt-4 text-lg font-semibold text-slate-800">
              No marks found
            </h3>

            <p className="mt-1 max-w-md text-sm text-slate-500">
              No marks match your current filters. Enter marks
              for your assigned subjects to see them here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200">
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Student
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Exam
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Subject
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Class
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Marks
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Grade
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Result
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredMarks.map((mark) => {
                  const student = students.find(
                    (item) => item.id === mark.student_id
                  );

                  const examSubject = examSubjects.find(
                    (item) =>
                      item.id === mark.exam_subject_id
                  );

                  const examination = examSubject
                    ? examinations.find(
                        (item) =>
                          item.id ===
                          examSubject.examination_id
                      )
                    : undefined;

                  const subject = examSubject
                    ? subjects.find(
                        (item) =>
                          item.id === examSubject.subject_id
                      )
                    : undefined;

                  const classItem = examSubject
                    ? classes.find(
                        (item) =>
                          item.id === examSubject.class_id
                      )
                    : undefined;

                  const passed =
                    examSubject &&
                    Number(mark.marks_obtained) >=
                      Number(examSubject.passing_marks);

                  return (
                    <tr
                      key={mark.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-900">
                          {student
                            ? `${student.first_name} ${student.last_name}`
                            : "Unknown Student"}
                        </div>

                        <div className="text-xs text-slate-500">
                          {student?.admission_no ?? "-"}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-800">
                          {examination?.name ?? "Unknown"}
                        </div>

                        <div className="text-xs text-slate-500">
                          {examination
                            ? formatDate(
                                examination.start_date
                              )
                            : "-"}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-800">
                          {subject?.name ?? "Unknown"}
                        </div>

                        <div className="text-xs text-slate-500">
                          {subject?.code ?? "-"}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-700">
                        {classItem?.name ?? "-"}
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900">
                          {mark.marks_obtained} /{" "}
                          {examSubject?.max_marks ?? "-"}
                        </div>

                        <div className="text-xs text-slate-500">
                          Pass:{" "}
                          {examSubject?.passing_marks ?? "-"}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                          {mark.grade ?? "-"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            passed
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {passed ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : (
                            <AlertCircle className="h-3.5 w-3.5" />
                          )}

                          {passed ? "PASS" : "FAIL"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() =>
                              openEditModal(mark)
                            }
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                            title="Edit marks"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(mark.id)
                            }
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                            title="Delete marks"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingMarkId
                    ? "Edit Marks"
                    : "Enter Marks"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingMarkId
                    ? "Update the student's marks."
                    : "Enter marks for a student."}
                </p>
              </div>

              <button
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 p-6">
              {error && (
                <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Exam Subject */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Exam Subject *
                </label>

                <select
                  value={form.exam_subject_id}
                  disabled={Boolean(editingMarkId) || saving}
                  onChange={(event) =>
                    handleExamSubjectChange(
                      Number(event.target.value)
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                >
                  <option value={0}>
                    Select exam subject
                  </option>

                  {filteredExamSubjects.map(
                    (examSubject) => {
                      const subject = subjects.find(
                        (item) =>
                          item.id ===
                          examSubject.subject_id
                      );

                      const classItem = classes.find(
                        (item) =>
                          item.id ===
                          examSubject.class_id
                      );

                      const examination =
                        examinations.find(
                          (item) =>
                            item.id ===
                            examSubject.examination_id
                        );

                      return (
                        <option
                          key={examSubject.id}
                          value={examSubject.id}
                        >
                          {examination?.name ?? "Exam"} -{" "}
                          {subject?.name ?? "Subject"} -{" "}
                          {classItem?.name ?? "Class"}
                        </option>
                      );
                    }
                  )}
                </select>
              </div>

              {/* Exam information */}
              {selectedExamSubject && (
                <div className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-4 md:grid-cols-4">
                  <div>
                    <p className="text-xs text-slate-500">
                      Max Marks
                    </p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {selectedExamSubject.max_marks}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Passing
                    </p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {selectedExamSubject.passing_marks}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Exam Date
                    </p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {formatDate(
                        selectedExamSubject.exam_date
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Subject
                    </p>
                    <p className="mt-1 truncate font-semibold text-slate-900">
                      {subjects.find(
                        (item) =>
                          item.id ===
                          selectedExamSubject.subject_id
                      )?.name ?? "-"}
                    </p>
                  </div>
                </div>
              )}

              {/* Student */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Student *
                </label>

                <select
                  value={form.student_id}
                  disabled={
                    !form.exam_subject_id ||
                    Boolean(editingMarkId) ||
                    saving
                  }
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      student_id: Number(
                        event.target.value
                      ),
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                >
                  <option value={0}>
                    {!form.exam_subject_id
                      ? "Select exam subject first"
                      : "Select student"}
                  </option>

                  {availableStudents.map((student) => (
                    <option
                      key={student.id}
                      value={student.id}
                    >
                      {student.first_name}{" "}
                      {student.last_name} —{" "}
                      {student.admission_no}
                    </option>
                  ))}
                </select>

                {form.exam_subject_id &&
                  availableStudents.length === 0 && (
                    <p className="mt-2 text-xs text-amber-600">
                      No active students are enrolled in this
                      class.
                    </p>
                  )}
              </div>

              {/* Marks */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Marks Obtained *
                  </label>

                  <input
                    type="number"
                    min="0"
                    max={selectedExamSubject?.max_marks}
                    step="0.01"
                    value={form.marks_obtained}
                    disabled={saving}
                    onChange={(event) =>
                      handleMarksChange(
                        event.target.value
                      )
                    }
                    placeholder={
                      selectedExamSubject
                        ? `0 - ${selectedExamSubject.max_marks}`
                        : "Enter marks"
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Grade
                  </label>

                  <input
                    type="text"
                    value={form.grade}
                    disabled
                    placeholder="Auto calculated"
                    className="w-full rounded-lg border border-slate-300 bg-slate-100 px-3 py-2.5 text-sm text-slate-600 outline-none"
                  />
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Remarks
                </label>

                <textarea
                  rows={3}
                  value={form.remarks}
                  disabled={saving}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      remarks: event.target.value,
                    }))
                  }
                  placeholder="Optional remarks..."
                  className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}

                {editingMarkId
                  ? "Update Marks"
                  : "Save Marks"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}