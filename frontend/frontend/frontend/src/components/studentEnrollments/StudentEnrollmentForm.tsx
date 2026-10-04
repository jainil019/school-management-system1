import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

import {
  createStudentEnrollment,
  updateStudentEnrollment,
  type StudentEnrollment,
} from "../../api/studentEnrollments";

import {
  getAcademicYears,
  getClasses,
  getSections,
  getStudents,
  type AcademicYear,
  type ClassItem,
  type SectionItem,
  type StudentLookup,
} from "../../api/lookups";

import ModuleModal from "../common/ModuleModal";
import {
  ErrorBox,
  Field,
  inputClass,
  PrimaryButton,
} from "../common/ModuleUi";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  editingEnrollment?: StudentEnrollment | null;
}

export default function StudentEnrollmentForm({
  onClose,
  onSuccess,
  editingEnrollment = null,
}: Props) {
  const editing = Boolean(editingEnrollment);

  const [students, setStudents] = useState<
    StudentLookup[]
  >([]);

  const [years, setYears] = useState<
    AcademicYear[]
  >([]);

  const [classes, setClasses] = useState<
    ClassItem[]
  >([]);

  const [sections, setSections] = useState<
    SectionItem[]
  >([]);

  const [studentId, setStudentId] = useState(
    editingEnrollment
      ? String(editingEnrollment.student_id)
      : ""
  );

  const [yearId, setYearId] = useState(
    editingEnrollment
      ? String(editingEnrollment.academic_year_id)
      : ""
  );

  const [classId, setClassId] = useState(
    editingEnrollment
      ? String(editingEnrollment.class_id)
      : ""
  );

  const [sectionId, setSectionId] = useState(
    editingEnrollment
      ? String(editingEnrollment.section_id)
      : ""
  );

  const [rollNo, setRollNo] = useState(
    editingEnrollment?.roll_no != null
      ? String(editingEnrollment.roll_no)
      : ""
  );

  const [enrollmentDate, setEnrollmentDate] =
    useState(
      editingEnrollment?.enrollment_date ??
        new Date().toISOString().slice(0, 10)
    );

  const [status, setStatus] = useState(
    editingEnrollment?.status ?? "ACTIVE"
  );

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void Promise.all([
      getStudents(),
      getAcademicYears(),
      getClasses(),
      getSections(),
    ])
      .then(([studentData, yearData, classData, sectionData]) => {
        setStudents(studentData);
        setYears(yearData);
        setClasses(classData);
        setSections(sectionData);

        if (!editingEnrollment) {
          const currentYear = yearData.find(
            (year) => year.is_current
          );

          if (currentYear) {
            setYearId(String(currentYear.id));
          }
        }
      })
      .catch((err: any) => {
        setError(
          err?.response?.data?.detail ??
            "Unable to load enrollment options."
        );
      });
  }, [editingEnrollment]);

  const visibleClasses = useMemo(() => {
    if (!yearId) {
      return [];
    }

    return classes.filter(
      (item) =>
        item.academic_year_id === Number(yearId)
    );
  }, [classes, yearId]);

  const visibleSections = useMemo(() => {
    if (!classId) {
      return [];
    }

    return sections.filter(
      (item) =>
        item.class_id === Number(classId)
    );
  }, [sections, classId]);

  useEffect(() => {
    if (
      sectionId &&
      !visibleSections.some(
        (section) =>
          String(section.id) === sectionId
      )
    ) {
      setSectionId("");
    }
  }, [visibleSections, sectionId]);

  useEffect(() => {
    if (
      classId &&
      !visibleClasses.some(
        (item) => String(item.id) === classId
      )
    ) {
      setClassId("");
      setSectionId("");
    }
  }, [visibleClasses, classId]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (
      !studentId ||
      !yearId ||
      !classId ||
      !sectionId ||
      !enrollmentDate
    ) {
      setError(
        "Student, academic year, class, section and enrollment date are required."
      );
      return;
    }

    const data = {
      student_id: Number(studentId),
      academic_year_id: Number(yearId),
      class_id: Number(classId),
      section_id: Number(sectionId),
      roll_no: rollNo ? Number(rollNo) : null,
      enrollment_date: enrollmentDate,
      status,
    };

    try {
      setSaving(true);

      if (editingEnrollment) {
        await updateStudentEnrollment(
          editingEnrollment.id,
          data
        );
      } else {
        await createStudentEnrollment(data);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ??
          `Unable to ${
            editing ? "update" : "create"
          } enrollment.`
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModuleModal
      title={
        editing
          ? "Edit Student Enrollment"
          : "Enroll Student"
      }
      subtitle="Assign a student to an academic year, class and section."
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
              onChange={(event) =>
                setStudentId(event.target.value)
              }
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

          <Field label="Academic Year" required>
            <select
              className={inputClass}
              value={yearId}
              onChange={(event) => {
                setYearId(event.target.value);
                setClassId("");
                setSectionId("");
              }}
            >
              <option value="">
                Select academic year
              </option>

              {years.map((year) => (
                <option
                  key={year.id}
                  value={year.id}
                >
                  {year.name}
                  {year.is_current
                    ? " (Current)"
                    : ""}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Class" required>
            <select
              className={inputClass}
              value={classId}
              onChange={(event) => {
                setClassId(event.target.value);
                setSectionId("");
              }}
              disabled={!yearId}
            >
              <option value="">
                {yearId
                  ? "Select class"
                  : "Select academic year first"}
              </option>

              {visibleClasses.map((item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Section" required>
            <select
              className={inputClass}
              value={sectionId}
              onChange={(event) =>
                setSectionId(event.target.value)
              }
              disabled={!classId}
            >
              <option value="">
                {classId
                  ? "Select section"
                  : "Select class first"}
              </option>

              {visibleSections.map((section) => (
                <option
                  key={section.id}
                  value={section.id}
                >
                  {section.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Roll Number">
            <input
              type="number"
              min="1"
              className={inputClass}
              value={rollNo}
              onChange={(event) =>
                setRollNo(event.target.value)
              }
              placeholder="15"
            />
          </Field>

          <Field label="Enrollment Date" required>
            <input
              type="date"
              className={inputClass}
              value={enrollmentDate}
              onChange={(event) =>
                setEnrollmentDate(
                  event.target.value
                )
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
              <option value="ACTIVE">
                ACTIVE
              </option>
              <option value="INACTIVE">
                INACTIVE
              </option>
              <option value="COMPLETED">
                COMPLETED
              </option>
              <option value="TRANSFERRED">
                TRANSFERRED
              </option>
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
              : editing
                ? "Update Enrollment"
                : "Enroll Student"}
          </PrimaryButton>
        </div>
      </form>
    </ModuleModal>
  );
}