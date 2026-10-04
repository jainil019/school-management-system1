import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import {
  createTeacherAssignment,
  updateTeacherAssignment,
  type TeacherAssignment,
} from "../../api/teacherAssignments";

import {
  getAcademicYears,
  getClasses,
  getSections,
  getSubjects,
  getTeachers,
  type AcademicYear,
  type ClassItem,
  type SectionItem,
  type SubjectLookup,
  type TeacherLookup,
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
  editingAssignment?: TeacherAssignment | null;
}

export default function TeacherAssignmentForm({
  onClose,
  onSuccess,
  editingAssignment = null,
}: Props) {
  const editing = Boolean(editingAssignment);

  const [years, setYears] = useState<AcademicYear[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectLookup[]>([]);
  const [teachers, setTeachers] = useState<TeacherLookup[]>([]);

  const [yearId, setYearId] = useState(
    editingAssignment
      ? String(editingAssignment.academic_year_id)
      : "",
  );

  const [classId, setClassId] = useState(
    editingAssignment
      ? String(editingAssignment.class_id)
      : "",
  );

  const [sectionId, setSectionId] = useState(
    editingAssignment
      ? String(editingAssignment.section_id)
      : "",
  );

  const [subjectId, setSubjectId] = useState(
    editingAssignment
      ? String(editingAssignment.subject_id)
      : "",
  );

  const [teacherId, setTeacherId] = useState(
    editingAssignment
      ? String(editingAssignment.teacher_id)
      : "",
  );

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void Promise.all([
      getAcademicYears(),
      getClasses(),
      getSections(),
      getSubjects(),
      getTeachers(),
    ])
      .then(([y, c, s, sub, t]) => {
        setYears(y);
        setClasses(c);
        setSections(s);
        setSubjects(sub);
        setTeachers(t);

        if (!editingAssignment) {
          const currentYear = y.find((year) => year.is_current);

          if (currentYear) {
            setYearId(String(currentYear.id));
          }
        }
      })
      .catch((e: any) => {
        setError(
          e?.response?.data?.detail ??
            "Unable to load options.",
        );
      });
  }, [editingAssignment]);

  const visibleClasses = classes.filter(
    (item) =>
      !yearId ||
      item.academic_year_id === Number(yearId),
  );

  const visibleSections = sections.filter(
    (item) =>
      !classId ||
      item.class_id === Number(classId),
  );

  useEffect(() => {
    if (
      classId &&
      !visibleSections.some(
        (section) => String(section.id) === sectionId,
      )
    ) {
      setSectionId("");
    }
  }, [classId, sectionId, visibleSections]);

  useEffect(() => {
    if (
      yearId &&
      !visibleClasses.some(
        (item) => String(item.id) === classId,
      )
    ) {
      setClassId("");
    }
  }, [yearId, classId, visibleClasses]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (
      !yearId ||
      !classId ||
      !sectionId ||
      !subjectId ||
      !teacherId
    ) {
      setError("All fields are required.");
      return;
    }

    const data = {
      academic_year_id: Number(yearId),
      class_id: Number(classId),
      section_id: Number(sectionId),
      subject_id: Number(subjectId),
      teacher_id: Number(teacherId),
    };

    try {
      setSaving(true);

      if (editingAssignment) {
        await updateTeacherAssignment(
          editingAssignment.id,
          data,
        );
      } else {
        await createTeacherAssignment(data);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ??
          `Unable to ${
            editing ? "update" : "create"
          } assignment.`,
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModuleModal
      title={
        editing
          ? "Edit Teacher Assignment"
          : "Assign Teacher"
      }
      subtitle="The subject must already be assigned to the selected class."
      onClose={onClose}
    >
      <form onSubmit={submit} className="space-y-5">
        {error && <ErrorBox message={error} />}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Academic Year" required>
            <select
              className={inputClass}
              value={yearId}
              onChange={(event) =>
                setYearId(event.target.value)
              }
            >
              <option value="">Select year</option>

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
              onChange={(event) =>
                setClassId(event.target.value)
              }
            >
              <option value="">Select class</option>

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
            >
              <option value="">Select section</option>

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

          <Field label="Subject" required>
            <select
              className={inputClass}
              value={subjectId}
              onChange={(event) =>
                setSubjectId(event.target.value)
              }
            >
              <option value="">Select subject</option>

              {subjects.map((subject) => (
                <option
                  key={subject.id}
                  value={subject.id}
                >
                  {subject.name} ({subject.code})
                </option>
              ))}
            </select>
          </Field>

          <Field label="Teacher" required>
            <select
              className={inputClass}
              value={teacherId}
              onChange={(event) =>
                setTeacherId(event.target.value)
              }
            >
              <option value="">Select teacher</option>

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
              : editing
                ? "Update Assignment"
                : "Create Assignment"}
          </PrimaryButton>
        </div>
      </form>
    </ModuleModal>
  );
}