import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

import { createAttendance } from "../../api/attendance";

import {
  getEnrollments,
  getStudents,
  getTeachers,
  type EnrollmentLookup,
  type StudentLookup,
  type TeacherLookup,
} from "../../api/lookups";

import ModuleModal from "../common/ModuleModal";
import {
  ErrorBox,
  Field,
  inputClass,
  PrimaryButton,
} from "../common/ModuleUi";

interface AttendanceFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AttendanceForm({
  onClose,
  onSuccess,
}: AttendanceFormProps) {
  const [students, setStudents] = useState<
    StudentLookup[]
  >([]);

  const [enrollments, setEnrollments] = useState<
    EnrollmentLookup[]
  >([]);

  const [teachers, setTeachers] = useState<
    TeacherLookup[]
  >([]);

  const [studentId, setStudentId] = useState("");
  const [enrollmentId, setEnrollmentId] = useState("");

  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const [status, setStatus] = useState("PRESENT");
  const [teacherId, setTeacherId] = useState("");

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void Promise.all([
      getStudents(),
      getEnrollments(),
      getTeachers(),
    ])
      .then(([studentData, enrollmentData, teacherData]) => {
        setStudents(studentData);
        setEnrollments(enrollmentData);
        setTeachers(teacherData);
      })
      .catch((err: any) => {
        setError(
          err?.response?.data?.detail ??
            "Unable to load attendance options."
        );
      });
  }, []);

  const visibleEnrollments = useMemo(() => {
    if (!studentId) {
      return [];
    }

    return enrollments.filter(
      (enrollment) =>
        enrollment.student_id === Number(studentId)
    );
  }, [enrollments, studentId]);

  useEffect(() => {
    if (
      enrollmentId &&
      !visibleEnrollments.some(
        (enrollment) =>
          String(enrollment.id) === enrollmentId
      )
    ) {
      setEnrollmentId("");
    }
  }, [visibleEnrollments, enrollmentId]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (
      !studentId ||
      !enrollmentId ||
      !date ||
      !teacherId
    ) {
      setError(
        "Student, enrollment, date and teacher are required."
      );
      return;
    }

    try {
      setSaving(true);

      await createAttendance({
        student_id: Number(studentId),
        enrollment_id: Number(enrollmentId),
        date,
        status,
        marked_by: Number(teacherId),
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ??
          "Unable to create attendance."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModuleModal
      title="Mark Attendance"
      subtitle="One attendance record is allowed per student per date."
      onClose={onClose}
    >
      <form
        onSubmit={submit}
        className="space-y-5"
      >
        {error && <ErrorBox message={error} />}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Student" required>
            <select
              className={inputClass}
              value={studentId}
              onChange={(event) => {
                setStudentId(event.target.value);
                setEnrollmentId("");
              }}
            >
              <option value="">
                Select student
              </option>

              {students.map((student) => (
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
          </Field>

          <Field label="Enrollment" required>
            <select
              className={inputClass}
              value={enrollmentId}
              onChange={(event) =>
                setEnrollmentId(event.target.value)
              }
              disabled={!studentId}
            >
              <option value="">
                {studentId
                  ? "Select enrollment"
                  : "Select student first"}
              </option>

              {visibleEnrollments.map(
                (enrollment) => (
                  <option
                    key={enrollment.id}
                    value={enrollment.id}
                  >
                    Enrollment #{enrollment.id} —
                    {" "}Class {enrollment.class_id},
                    {" "}Section {enrollment.section_id}
                  </option>
                )
              )}
            </select>
          </Field>

          <Field label="Date" required>
            <input
              type="date"
              className={inputClass}
              value={date}
              onChange={(event) =>
                setDate(event.target.value)
              }
            />
          </Field>

          <Field label="Status" required>
            <select
              className={inputClass}
              value={status}
              onChange={(event) =>
                setStatus(event.target.value)
              }
            >
              <option value="PRESENT">
                PRESENT
              </option>

              <option value="ABSENT">
                ABSENT
              </option>

              <option value="LATE">
                LATE
              </option>

              <option value="LEAVE">
                LEAVE
              </option>
            </select>
          </Field>

          <Field
            label="Marked By (Teacher)"
            required
          >
            <select
              className={inputClass}
              value={teacherId}
              onChange={(event) =>
                setTeacherId(event.target.value)
              }
            >
              <option value="">
                Select teacher
              </option>

              {teachers.map((teacher) => (
                <option
                  key={teacher.id}
                  value={teacher.id}
                >
                  {teacher.first_name}{" "}
                  {teacher.last_name} —{" "}
                  {teacher.employee_id}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>

          <PrimaryButton
            type="submit"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : "Mark Attendance"}
          </PrimaryButton>
        </div>
      </form>
    </ModuleModal>
  );
}