import { useEffect, useMemo, useState } from "react";
import {
  CalendarCheck,
  CheckCircle2,
  ClipboardCheck,
  Users,
  XCircle,
  Clock,
  FileText,
} from "lucide-react";

import {
  createAttendance,
  getAttendance,
  type Attendance,
} from "../../api/attendance";

import {
  getEnrollments,
  getStudents,
  type EnrollmentLookup,
  type StudentLookup,
} from "../../api/lookups";

import {
  getTeacherAssignments,
  type TeacherAssignment,
} from "../../api/teacherAssignments";

interface StudentAttendance {
  studentId: number;
  enrollmentId: number;
  name: string;
  admissionNo: string;
  status: string;
}

const STATUS_OPTIONS = [
  {
    value: "PRESENT",
    label: "Present",
    icon: CheckCircle2,
  },
  {
    value: "ABSENT",
    label: "Absent",
    icon: XCircle,
  },
  {
    value: "LATE",
    label: "Late",
    icon: Clock,
  },
  {
    value: "LEAVE",
    label: "Leave",
    icon: FileText,
  },
];

/* ============================================================
   API ERROR FORMATTER
   ============================================================ */

function getApiErrorMessage(
  error: any,
  fallback: string
): string {
  const detail = error?.response?.data?.detail;

  // Normal FastAPI error:
  // { "detail": "Attendance already exists..." }
  if (typeof detail === "string") {
    return detail;
  }

  // FastAPI validation error:
  // {
  //   "detail": [
  //     {
  //       "loc": ["body", "student_id"],
  //       "msg": "Field required",
  //       "type": "missing"
  //     }
  //   ]
  // }
  if (Array.isArray(detail)) {
    return detail
      .map((item: any) => {
        if (typeof item === "string") {
          return item;
        }

        if (item && typeof item === "object") {
          const location = Array.isArray(item.loc)
            ? item.loc.filter(Boolean).join(" → ")
            : "Field";

          const message =
            typeof item.msg === "string"
              ? item.msg
              : "Invalid value";

          return `${location}: ${message}`;
        }

        return String(item);
      })
      .join(", ");
  }

  if (
    detail &&
    typeof detail === "object"
  ) {
    if (typeof detail.msg === "string") {
      return detail.msg;
    }

    return JSON.stringify(detail);
  }

  if (
    typeof error?.message === "string" &&
    error.message
  ) {
    return error.message;
  }

  return fallback;
}

export default function TeacherAttendance() {
  const [assignments, setAssignments] = useState<
    TeacherAssignment[]
  >([]);

  const [students, setStudents] = useState<
    StudentLookup[]
  >([]);

  const [enrollments, setEnrollments] = useState<
    EnrollmentLookup[]
  >([]);

  const [attendance, setAttendance] = useState<
    Attendance[]
  >([]);

  const [selectedAssignment, setSelectedAssignment] =
    useState("");

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const [studentAttendance, setStudentAttendance] =
    useState<StudentAttendance[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /* ============================================================
     LOAD DATA
     ============================================================ */

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          assignmentData,
          studentData,
          enrollmentData,
          attendanceData,
        ] = await Promise.all([
          getTeacherAssignments(),
          getStudents(),
          getEnrollments(),
          getAttendance(),
        ]);

        setAssignments(assignmentData);
        setStudents(studentData);
        setEnrollments(enrollmentData);
        setAttendance(attendanceData);
      } catch (err: any) {
        setError(
          getApiErrorMessage(
            err,
            "Unable to load attendance data."
          )
        );
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, []);

  /* ============================================================
     CURRENT ASSIGNMENT
     ============================================================ */

  const currentAssignment = useMemo(() => {
    if (!selectedAssignment) {
      return null;
    }

    return (
      assignments.find(
        (assignment) =>
          String(assignment.id) ===
          selectedAssignment
      ) ?? null
    );
  }, [
    assignments,
    selectedAssignment,
  ]);

  /* ============================================================
     STUDENTS FOR SELECTED CLASS
     ============================================================ */

  const classStudents = useMemo(() => {
    if (!currentAssignment) {
      return [];
    }

    const assignment = currentAssignment;

    const matchingEnrollments =
      enrollments.filter(
        (enrollment) =>
          enrollment.class_id ===
            assignment.class_id &&
          enrollment.section_id ===
            assignment.section_id &&
          enrollment.academic_year_id ===
            assignment.academic_year_id
      );

    return matchingEnrollments
      .map((enrollment) => {
        const student = students.find(
          (item) =>
            item.id === enrollment.student_id
        );

        if (!student) {
          return null;
        }

        return {
          studentId: student.id,
          enrollmentId: enrollment.id,
          name: `${student.first_name} ${student.last_name}`,
          admissionNo: student.admission_no,
        };
      })
      .filter(Boolean) as Omit<
      StudentAttendance,
      "status"
    >[];
  }, [
    currentAssignment,
    enrollments,
    students,
  ]);

  /* ============================================================
     LOAD EXISTING ATTENDANCE
     ============================================================ */

  useEffect(() => {
    if (!currentAssignment) {
      setStudentAttendance([]);
      return;
    }

    const existing = classStudents.map(
      (student) => {
        const record = attendance.find(
          (item) =>
            item.student_id ===
              student.studentId &&
            item.enrollment_id ===
              student.enrollmentId &&
            item.date === selectedDate
        );

        return {
          ...student,
          status:
            record?.status ?? "PRESENT",
        };
      }
    );

    setStudentAttendance(existing);
  }, [
    currentAssignment,
    classStudents,
    selectedDate,
    attendance,
  ]);

  /* ============================================================
     CHANGE STATUS
     ============================================================ */

  const changeStatus = (
    studentId: number,
    status: string
  ) => {
    setStudentAttendance((current) =>
      current.map((student) =>
        student.studentId === studentId
          ? {
              ...student,
              status,
            }
          : student
      )
    );
  };

  /* ============================================================
     SET ALL STATUS
     ============================================================ */

  const setAllStatus = (
    status: string
  ) => {
    setStudentAttendance((current) =>
      current.map((student) => ({
        ...student,
        status,
      }))
    );
  };

  /* ============================================================
     SAVE ATTENDANCE
     ============================================================ */

  const saveAttendance = async () => {
    if (!currentAssignment) {
      setError(
        "Please select a class first."
      );
      return;
    }

    if (studentAttendance.length === 0) {
      setError(
        "No students found for this class and section."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      /*
       * IMPORTANT:
       * Do NOT send marked_by from the frontend.
       *
       * The backend identifies the logged-in teacher
       * and uses that teacher's ID.
       */

      await Promise.all(
        studentAttendance.map(
          (student) =>
            createAttendance({
              student_id:
                student.studentId,

              enrollment_id:
                student.enrollmentId,

              date: selectedDate,

              status: student.status,
            })
        )
      );

      const updatedAttendance =
        await getAttendance();

      setAttendance(
        updatedAttendance
      );

      setMessage(
        `Attendance saved successfully for ${studentAttendance.length} students.`
      );
    } catch (err: any) {
      setError(
        getApiErrorMessage(
          err,
          "Unable to save attendance."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  /* ============================================================
     STATISTICS
     ============================================================ */

  const presentCount =
    studentAttendance.filter(
      (student) =>
        student.status === "PRESENT"
    ).length;

  const absentCount =
    studentAttendance.filter(
      (student) =>
        student.status === "ABSENT"
    ).length;

  const lateCount =
    studentAttendance.filter(
      (student) =>
        student.status === "LATE"
    ).length;

  const leaveCount =
    studentAttendance.filter(
      (student) =>
        student.status === "LEAVE"
    ).length;

  /* ============================================================
     LOADING
     ============================================================ */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />

            <p className="text-sm text-slate-500">
              Loading attendance...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ============================================================
     PAGE
     ============================================================ */

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-50 p-3">
                  <ClipboardCheck
                    className="text-blue-600"
                    size={26}
                  />
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-slate-900">
                    Attendance
                  </h1>

                  <p className="text-sm text-slate-500">
                    Mark and manage attendance
                    for your assigned classes
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-blue-50 px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-blue-700">
                <CalendarCheck size={18} />

                {selectedDate}
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl space-y-6 px-6 py-6">
        {/* Messages */}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {message}
          </div>
        )}

        {/* Statistics */}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Students
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {studentAttendance.length}
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 p-3">
                <Users
                  size={24}
                  className="text-blue-600"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Present
                </p>

                <p className="mt-2 text-3xl font-bold text-green-600">
                  {presentCount}
                </p>
              </div>

              <CheckCircle2
                size={30}
                className="text-green-500"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Absent
                </p>

                <p className="mt-2 text-3xl font-bold text-red-600">
                  {absentCount}
                </p>
              </div>

              <XCircle
                size={30}
                className="text-red-500"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Late / Leave
                </p>

                <p className="mt-2 text-3xl font-bold text-orange-500">
                  {lateCount +
                    leaveCount}
                </p>
              </div>

              <Clock
                size={30}
                className="text-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Selection */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-900">
              Select Class
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Only classes assigned to you
              are available.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Class / Section
              </label>

              <select
                value={selectedAssignment}
                onChange={(event) => {
                  setSelectedAssignment(
                    event.target.value
                  );
                  setMessage("");
                  setError("");
                }}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">
                  Select assigned class
                </option>

                {assignments.map(
                  (assignment) => (
                    <option
                      key={assignment.id}
                      value={assignment.id}
                    >
                      Class{" "}
                      {assignment.class_id}{" "}
                      — Section{" "}
                      {assignment.section_id}{" "}
                      — Subject{" "}
                      {assignment.subject_id}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Attendance Date
              </label>

              <input
                type="date"
                value={selectedDate}
                onChange={(event) => {
                  setSelectedDate(
                    event.target.value
                  );
                  setMessage("");
                  setError("");
                }}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
        </div>

        {/* Student List */}

        {currentAssignment && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-6 md:flex-row md:items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Student Attendance
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Select attendance status
                  for each student.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setAllStatus("PRESENT")
                  }
                  className="rounded-lg bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 hover:bg-green-100"
                >
                  Mark All Present
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setAllStatus("ABSENT")
                  }
                  className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
                >
                  Mark All Absent
                </button>
              </div>
            </div>

            {studentAttendance.length ===
            0 ? (
              <div className="p-10 text-center">
                <Users
                  size={40}
                  className="mx-auto text-slate-300"
                />

                <p className="mt-3 font-semibold text-slate-700">
                  No students found
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  No enrolled students were
                  found for this class and
                  section.
                </p>
              </div>
            ) : (
              <>
                <div className="divide-y divide-slate-100">
                  {studentAttendance.map(
                    (student, index) => (
                      <div
                        key={student.studentId}
                        className="flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">
                            {index + 1}
                          </div>

                          <div>
                            <p className="font-semibold text-slate-900">
                              {student.name}
                            </p>

                            <p className="text-sm text-slate-500">
                              Admission No:{" "}
                              {
                                student.admissionNo
                              }
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {STATUS_OPTIONS.map(
                            (option) => {
                              const Icon =
                                option.icon;

                              const active =
                                student.status ===
                                option.value;

                              return (
                                <button
                                  key={
                                    option.value
                                  }
                                  type="button"
                                  onClick={() =>
                                    changeStatus(
                                      student.studentId,
                                      option.value
                                    )
                                  }
                                  className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-xs font-semibold transition ${
                                    active
                                      ? option.value ===
                                        "PRESENT"
                                        ? "border-green-500 bg-green-50 text-green-700"
                                        : option.value ===
                                          "ABSENT"
                                        ? "border-red-500 bg-red-50 text-red-700"
                                        : option.value ===
                                          "LATE"
                                        ? "border-orange-500 bg-orange-50 text-orange-700"
                                        : "border-blue-500 bg-blue-50 text-blue-700"
                                      : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                                  }`}
                                >
                                  <Icon size={15} />

                                  {
                                    option.label
                                  }
                                </button>
                              );
                            }
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>

                <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-5">
                  <button
                    type="button"
                    onClick={() =>
                      void saveAttendance()
                    }
                    disabled={saving}
                    className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving
                      ? "Saving Attendance..."
                      : "Save Attendance"}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Empty State */}

        {!currentAssignment && (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
              <ClipboardCheck
                size={32}
                className="text-blue-600"
              />
            </div>

            <h3 className="mt-5 text-lg font-bold text-slate-900">
              Select a class to start
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Choose one of your assigned
              classes above to view students
              and mark their attendance.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}