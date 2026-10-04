import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import {
  createMark,
  updateMark,
  type Mark,
} from "../../api/marks";

import {
  getExamSubjects,
  type ExamSubject,
} from "../../api/examSubjects";

import {
  getStudents,
  type StudentLookup,
} from "../../api/lookups";

import ModuleModal from "../common/ModuleModal";

import {
  ErrorBox,
  Field,
  inputClass,
  PrimaryButton,
} from "../common/ModuleUi";

interface MarkFormProps {
  mark?: Mark | null;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
}

export default function MarkForm({
  mark,
  onClose,
  onSuccess,
}: MarkFormProps) {
  const isEdit = Boolean(mark);

  const [examSubjects, setExamSubjects] =
    useState<ExamSubject[]>([]);

  const [students, setStudents] =
    useState<StudentLookup[]>([]);

  const [esId, setEsId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [marks, setMarks] = useState("");
  const [grade, setGrade] = useState("");
  const [remarks, setRemarks] = useState("");

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void Promise.all([
      getExamSubjects(),
      getStudents(),
    ])
      .then(([examSubjectList, studentList]) => {
        setExamSubjects(examSubjectList);
        setStudents(studentList);
      })
      .catch((e: any) => {
        setError(
          e?.response?.data?.detail ??
            "Unable to load options."
        );
      });
  }, []);

  useEffect(() => {
    if (!mark) {
      setEsId("");
      setStudentId("");
      setMarks("");
      setGrade("");
      setRemarks("");
      return;
    }

    setEsId(String(mark.exam_subject_id));
    setStudentId(String(mark.student_id));
    setMarks(String(mark.marks_obtained));
    setGrade(mark.grade ?? "");
    setRemarks(mark.remarks ?? "");
  }, [mark]);

  const selected = examSubjects.find(
    (item) => item.id === Number(esId)
  );

  const submit = async (e: FormEvent) => {
    e.preventDefault();

    setError("");

    const value = Number(marks);

    if (
      !esId ||
      !studentId ||
      marks === ""
    ) {
      setError(
        "Exam subject, student and marks are required."
      );
      return;
    }

    if (
      value < 0 ||
      value > (selected?.max_marks ?? Infinity)
    ) {
      setError(
        `Marks must be between 0 and ${
          selected?.max_marks ?? "the maximum"
        }.`
      );
      return;
    }

    try {
      setSaving(true);

      if (mark) {
        await updateMark(mark.id, {
          marks_obtained: value,
          grade: grade.trim() || null,
          remarks: remarks.trim() || null,
        });
      } else {
        await createMark({
          exam_subject_id: Number(esId),
          student_id: Number(studentId),
          marks_obtained: value,
          grade: grade.trim() || null,
          remarks: remarks.trim() || null,
        });
      }

      await onSuccess();
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ??
          `Unable to ${
            isEdit ? "update" : "create"
          } mark.`
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModuleModal
      title={isEdit ? "Edit Marks" : "Enter Marks"}
      onClose={onClose}
    >
      <form
        onSubmit={submit}
        className="space-y-5"
      >
        {error && <ErrorBox message={error} />}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Exam Subject"
            required
          >
            <select
              className={inputClass}
              value={esId}
              onChange={(e) =>
                setEsId(e.target.value)
              }
              disabled={isEdit}
            >
              <option value="">
                Select exam subject
              </option>

              {examSubjects.map((item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  Exam Subject #{item.id} — Max{" "}
                  {item.max_marks}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Student" required>
            <select
              className={inputClass}
              value={studentId}
              onChange={(e) =>
                setStudentId(e.target.value)
              }
              disabled={isEdit}
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

          <Field
            label={`Marks Obtained${
              selected
                ? ` (max ${selected.max_marks})`
                : ""
            }`}
            required
          >
            <input
              type="number"
              min="0"
              max={selected?.max_marks}
              className={inputClass}
              value={marks}
              onChange={(e) =>
                setMarks(e.target.value)
              }
            />
          </Field>

          <Field label="Grade">
            <input
              className={inputClass}
              value={grade}
              onChange={(e) =>
                setGrade(e.target.value)
              }
              placeholder="A+"
              maxLength={10}
            />
          </Field>
        </div>

        <Field label="Remarks">
          <textarea
            className={`${inputClass} min-h-24`}
            value={remarks}
            onChange={(e) =>
              setRemarks(e.target.value)
            }
            placeholder="Optional remarks"
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
                ? "Update Marks"
                : "Save Marks"}
          </PrimaryButton>
        </div>
      </form>
    </ModuleModal>
  );
}