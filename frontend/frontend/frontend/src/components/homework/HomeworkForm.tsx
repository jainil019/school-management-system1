import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

import {
  createHomework,
  updateHomework,
  type Homework as HomeworkItem,
} from "../../api/homework";

import {
  getClasses,
  getSections,
  getSubjects,
  getTeachers,
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

interface HomeworkFormProps {
  homework?: HomeworkItem | null;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
}

export default function HomeworkForm({
  homework,
  onClose,
  onSuccess,
}: HomeworkFormProps) {
  const isEdit = Boolean(homework);

  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectLookup[]>([]);
  const [teachers, setTeachers] = useState<TeacherLookup[]>([]);

  const [classId, setClassId] = useState(
    homework ? String(homework.class_id) : "",
  );

  const [sectionId, setSectionId] = useState(
    homework?.section_id != null ? String(homework.section_id) : "",
  );

  const [subjectId, setSubjectId] = useState(
    homework ? String(homework.subject_id) : "",
  );

  const [teacherId, setTeacherId] = useState(
    homework ? String(homework.teacher_id) : "",
  );

  const [title, setTitle] = useState(homework?.title ?? "");
  const [description, setDescription] = useState(
    homework?.description ?? "",
  );

  const [assignedDate, setAssignedDate] = useState(
    homework?.assigned_date ??
      new Date().toISOString().slice(0, 10),
  );

  const [dueDate, setDueDate] = useState(
    homework?.due_date ??
      new Date().toISOString().slice(0, 10),
  );

  const [attachment, setAttachment] = useState(
    homework?.attachment_url ?? "",
  );

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void Promise.all([
      getClasses(),
      getSections(),
      getSubjects(),
      getTeachers(),
    ])
      .then(([c, s, sub, t]) => {
        setClasses(c);
        setSections(s);
        setSubjects(sub);
        setTeachers(t);
      })
      .catch((e: any) => {
        setError(
          e?.response?.data?.detail ??
            "Unable to load options.",
        );
      });
  }, []);

  const visibleSections = useMemo(
    () =>
      sections.filter(
        (section) =>
          !classId ||
          section.class_id === Number(classId),
      ),
    [sections, classId],
  );

  useEffect(() => {
    if (
      !visibleSections.some(
        (section) => String(section.id) === sectionId,
      )
    ) {
      setSectionId("");
    }
  }, [visibleSections, sectionId]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();

    setError("");

    if (
      !classId ||
      !subjectId ||
      !teacherId ||
      !title.trim() ||
      !assignedDate ||
      !dueDate
    ) {
      setError(
        "Class, subject, teacher, title and dates are required.",
      );
      return;
    }

    if (dueDate < assignedDate) {
      setError(
        "Due date cannot be before assigned date.",
      );
      return;
    }

    try {
      setSaving(true);

      if (isEdit && homework) {
        await updateHomework(homework.id, {
          title: title.trim(),
          description:
            description.trim() || null,
          due_date: dueDate,
          attachment_url:
            attachment.trim() || null,
        });
      } else {
        await createHomework({
          class_id: Number(classId),
          section_id: sectionId
            ? Number(sectionId)
            : null,
          subject_id: Number(subjectId),
          teacher_id: Number(teacherId),
          title: title.trim(),
          description:
            description.trim() || null,
          assigned_date: assignedDate,
          due_date: dueDate,
          attachment_url:
            attachment.trim() || null,
        });
      }

      await onSuccess();
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ??
          (isEdit
            ? "Unable to update homework."
            : "Unable to create homework."),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModuleModal
      title={
        isEdit
          ? "Edit Homework"
          : "Create Homework"
      }
      onClose={onClose}
    >
      <form
        onSubmit={submit}
        className="space-y-5"
      >
        {error && <ErrorBox message={error} />}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Class" required>
            <select
              className={inputClass}
              value={classId}
              onChange={(event) =>
                setClassId(event.target.value)
              }
              disabled={isEdit}
            >
              <option value="">
                Select class
              </option>

              {classes.map((schoolClass) => (
                <option
                  key={schoolClass.id}
                  value={schoolClass.id}
                >
                  {schoolClass.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Section">
            <select
              className={inputClass}
              value={sectionId}
              onChange={(event) =>
                setSectionId(event.target.value)
              }
              disabled={isEdit}
            >
              <option value="">
                All sections
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

          <Field label="Subject" required>
            <select
              className={inputClass}
              value={subjectId}
              onChange={(event) =>
                setSubjectId(event.target.value)
              }
              disabled={isEdit}
            >
              <option value="">
                Select subject
              </option>

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
              disabled={isEdit}
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

          <Field label="Title" required>
            <input
              className={inputClass}
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              maxLength={200}
              placeholder="Enter homework title"
            />
          </Field>

          <Field label="Attachment URL">
            <input
              className={inputClass}
              value={attachment}
              onChange={(event) =>
                setAttachment(event.target.value)
              }
              placeholder="https://..."
            />
          </Field>

          <Field label="Assigned Date" required>
            <input
              type="date"
              className={inputClass}
              value={assignedDate}
              onChange={(event) =>
                setAssignedDate(event.target.value)
              }
              disabled={isEdit}
            />
          </Field>

          <Field label="Due Date" required>
            <input
              type="date"
              className={inputClass}
              value={dueDate}
              onChange={(event) =>
                setDueDate(event.target.value)
              }
            />
          </Field>
        </div>

        <Field label="Description">
          <textarea
            className={`${inputClass} min-h-28`}
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            placeholder="Enter homework description..."
          />
        </Field>

        <div className="flex justify-end gap-3 border-t pt-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 hover:bg-slate-100"
          >
            Cancel
          </button>

          <PrimaryButton
            type="submit"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : isEdit
                ? "Update Homework"
                : "Create Homework"}
          </PrimaryButton>
        </div>
      </form>
    </ModuleModal>
  );
}