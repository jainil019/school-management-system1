import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import {
  createExamSubject,
  updateExamSubject,
  type ExamSubject,
} from "../../api/examSubjects";

import {
  getClasses,
  getSubjects,
  type ClassItem,
  type SubjectLookup,
} from "../../api/lookups";

import {
  getExaminations,
  type Examination,
} from "../../api/examinations";

import ModuleModal from "../common/ModuleModal";

import {
  ErrorBox,
  Field,
  inputClass,
  PrimaryButton,
} from "../common/ModuleUi";

interface ExamSubjectFormProps {
  examSubject?: ExamSubject | null;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
}

export default function ExamSubjectForm({
  examSubject,
  onClose,
  onSuccess,
}: ExamSubjectFormProps) {
  const isEdit = Boolean(examSubject);

  const [exams, setExams] = useState<Examination[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectLookup[]>([]);

  const [examId, setExamId] = useState("");
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");

  const [max, setMax] = useState("100");
  const [passing, setPassing] = useState("33");
  const [date, setDate] = useState("");

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void Promise.all([
      getExaminations(),
      getClasses(),
      getSubjects(),
    ])
      .then(([examList, classList, subjectList]) => {
        setExams(examList);
        setClasses(classList);
        setSubjects(subjectList);
      })
      .catch((e: any) => {
        setError(
          e?.response?.data?.detail ??
            "Unable to load options."
        );
      });
  }, []);

  useEffect(() => {
    if (!examSubject) {
      setExamId("");
      setClassId("");
      setSubjectId("");
      setMax("100");
      setPassing("33");
      setDate("");
      return;
    }

    setExamId(String(examSubject.examination_id));
    setClassId(String(examSubject.class_id));
    setSubjectId(String(examSubject.subject_id));
    setMax(String(examSubject.max_marks));
    setPassing(String(examSubject.passing_marks));
    setDate(examSubject.exam_date);
  }, [examSubject]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();

    setError("");

    const maxMarks = Number(max);
    const passingMarks = Number(passing);

    if (
      !examId ||
      !classId ||
      !subjectId ||
      !date
    ) {
      setError(
        "Examination, class, subject and exam date are required."
      );
      return;
    }

    if (
      maxMarks <= 0 ||
      passingMarks < 0 ||
      passingMarks > maxMarks
    ) {
      setError(
        "Marks must satisfy max > 0, passing >= 0 and passing <= max."
      );
      return;
    }

    try {
      setSaving(true);

      if (examSubject) {
        await updateExamSubject(examSubject.id, {
          max_marks: maxMarks,
          passing_marks: passingMarks,
          exam_date: date,
        });
      } else {
        await createExamSubject({
          examination_id: Number(examId),
          class_id: Number(classId),
          subject_id: Number(subjectId),
          max_marks: maxMarks,
          passing_marks: passingMarks,
          exam_date: date,
        });
      }

      await onSuccess();
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ??
          `Unable to ${
            isEdit ? "update" : "add"
          } exam subject.`
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModuleModal
      title={
        isEdit
          ? "Edit Exam Subject"
          : "Add Exam Subject"
      }
      subtitle={
        isEdit
          ? "Update marks and exam date."
          : "The subject must already be assigned to the selected class."
      }
      onClose={onClose}
    >
      <form
        onSubmit={submit}
        className="space-y-5"
      >
        {error && <ErrorBox message={error} />}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Examination"
            required
          >
            <select
              className={inputClass}
              value={examId}
              onChange={(e) =>
                setExamId(e.target.value)
              }
              disabled={isEdit}
            >
              <option value="">
                Select examination
              </option>

              {exams.map((exam) => (
                <option
                  key={exam.id}
                  value={exam.id}
                >
                  {exam.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Class" required>
            <select
              className={inputClass}
              value={classId}
              onChange={(e) =>
                setClassId(e.target.value)
              }
              disabled={isEdit}
            >
              <option value="">
                Select class
              </option>

              {classes.map((item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Subject" required>
            <select
              className={inputClass}
              value={subjectId}
              onChange={(e) =>
                setSubjectId(e.target.value)
              }
              disabled={isEdit}
            >
              <option value="">
                Select subject
              </option>

              {subjects.map((item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.name} ({item.code})
                </option>
              ))}
            </select>
          </Field>

          <Field
            label="Maximum Marks"
            required
          >
            <input
              type="number"
              min="1"
              className={inputClass}
              value={max}
              onChange={(e) =>
                setMax(e.target.value)
              }
            />
          </Field>

          <Field
            label="Passing Marks"
            required
          >
            <input
              type="number"
              min="0"
              className={inputClass}
              value={passing}
              onChange={(e) =>
                setPassing(e.target.value)
              }
            />
          </Field>

          <Field
            label="Exam Date"
            required
          >
            <input
              type="date"
              className={inputClass}
              value={date}
              onChange={(e) =>
                setDate(e.target.value)
              }
            />
          </Field>
        </div>

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
                ? "Update Exam Subject"
                : "Add Exam Subject"}
          </PrimaryButton>
        </div>
      </form>
    </ModuleModal>
  );
}