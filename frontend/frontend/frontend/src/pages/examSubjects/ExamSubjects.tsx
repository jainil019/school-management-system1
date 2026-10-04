import { useEffect, useMemo, useState } from "react";

import {
  deleteExamSubject,
  getExamSubjects,
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

import ExamSubjectForm from "../../components/examSubjects/ExamSubjectForm";

import {
  DangerButton,
  EmptyState,
  PageHeader,
  PrimaryButton,
} from "../../components/common/ModuleUi";

export default function ExamSubjects() {
  const [items, setItems] = useState<ExamSubject[]>([]);
  const [exams, setExams] = useState<Examination[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectLookup[]>([]);

  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ExamSubject | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");

      const [examSubjects, examinations, classList, subjectList] =
        await Promise.all([
          getExamSubjects(),
          getExaminations(),
          getClasses(),
          getSubjects(),
        ]);

      setItems(examSubjects);
      setExams(examinations);
      setClasses(classList);
      setSubjects(subjectList);
    } catch (e: any) {
      setError(
        e?.response?.data?.detail ??
          "Unable to load exam subjects."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const getName = (
    id: number,
    list: any[],
    label: string
  ) => {
    return (
      list.find((item: any) => item.id === id)?.name ??
      `${label} #${id}`
    );
  };

  const filtered = useMemo(() => {
    const search = q.toLowerCase();

    return items.filter((item) =>
      `${getName(item.examination_id, exams, "Exam")}
       ${getName(item.class_id, classes, "Class")}
       ${getName(item.subject_id, subjects, "Subject")}
       ${item.exam_date}
       ${item.max_marks}
       ${item.passing_marks}`
        .toLowerCase()
        .includes(search)
    );
  }, [items, exams, classes, subjects, q]);

  const remove = async (id: number) => {
    if (!confirm("Delete this exam subject?")) {
      return;
    }

    try {
      setError("");
      await deleteExamSubject(id);
      await load();
    } catch (e: any) {
      setError(
        e?.response?.data?.detail ??
          "Unable to delete exam subject."
      );
    }
  };

  const openCreate = () => {
    setEditing(null);
    setOpen(true);
  };

  const openEdit = (item: ExamSubject) => {
    setEditing(item);
    setOpen(true);
  };

  const closeForm = () => {
    setOpen(false);
    setEditing(null);
  };

  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        title="Exam Subjects"
        description="Configure subjects, marks and exam dates for each examination."
        action={
          <PrimaryButton onClick={openCreate}>
            + Add Exam Subject
          </PrimaryButton>
        }
      />

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <input
        className="mb-4 w-full max-w-lg rounded-xl border border-slate-300 px-4 py-2.5 text-sm"
        placeholder="Search examination, class or subject..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center">
            Loading...
          </div>
        ) : !filtered.length ? (
          <EmptyState message="No exam subjects found." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">
                    Exam
                  </th>

                  <th className="px-5 py-3">
                    Class
                  </th>

                  <th className="px-5 py-3">
                    Subject
                  </th>

                  <th className="px-5 py-3">
                    Marks
                  </th>

                  <th className="px-5 py-3">
                    Date
                  </th>

                  <th className="px-5 py-3 text-right">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td className="px-5 py-4 font-medium">
                      {getName(
                        item.examination_id,
                        exams,
                        "Exam"
                      )}
                    </td>

                    <td className="px-5 py-4">
                      {getName(
                        item.class_id,
                        classes,
                        "Class"
                      )}
                    </td>

                    <td className="px-5 py-4">
                      {getName(
                        item.subject_id,
                        subjects,
                        "Subject"
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-medium">
                        {item.passing_marks}
                      </span>
                      {" / "}
                      {item.max_marks}
                    </td>

                    <td className="px-5 py-4">
                      {item.exam_date}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(item)}
                          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
                        >
                          Edit
                        </button>

                        <DangerButton
                          onClick={() =>
                            void remove(item.id)
                          }
                        >
                          Delete
                        </DangerButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {open && (
        <ExamSubjectForm
          examSubject={editing}
          onClose={closeForm}
          onSuccess={load}
        />
      )}
    </div>
  );
}