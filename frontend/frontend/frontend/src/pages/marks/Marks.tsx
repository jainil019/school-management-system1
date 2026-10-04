import { useEffect, useMemo, useState } from "react";

import {
  deleteMark,
  getMarks,
  type Mark,
} from "../../api/marks";

import {
  getStudents,
  type StudentLookup,
} from "../../api/lookups";

import MarkForm from "../../components/marks/MarkForm";

import {
  DangerButton,
  EmptyState,
  PageHeader,
  PrimaryButton,
} from "../../components/common/ModuleUi";

export default function Marks() {
  const [items, setItems] = useState<Mark[]>([]);
  const [students, setStudents] = useState<StudentLookup[]>([]);

  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Mark | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");

      const [marks, studentList] = await Promise.all([
        getMarks(),
        getStudents(),
      ]);

      setItems(marks);
      setStudents(studentList);
    } catch (e: any) {
      setError(
        e?.response?.data?.detail ??
          "Unable to load marks."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const getStudentName = (id: number) => {
    const student = students.find(
      (item) => item.id === id
    );

    return student
      ? `${student.first_name} ${student.last_name}`
      : `Student #${id}`;
  };

  const filtered = useMemo(() => {
    const search = q.toLowerCase();

    return items.filter((item) =>
      `${getStudentName(item.student_id)}
       ${item.exam_subject_id}
       ${item.marks_obtained}
       ${item.grade ?? ""}
       ${item.remarks ?? ""}`
        .toLowerCase()
        .includes(search)
    );
  }, [items, students, q]);

  const remove = async (id: number) => {
    if (!confirm("Delete this mark?")) {
      return;
    }

    try {
      setError("");

      await deleteMark(id);
      await load();
    } catch (e: any) {
      setError(
        e?.response?.data?.detail ??
          "Unable to delete mark."
      );
    }
  };

  const openCreate = () => {
    setEditing(null);
    setOpen(true);
  };

  const openEdit = (mark: Mark) => {
    setEditing(mark);
    setOpen(true);
  };

  const closeForm = () => {
    setOpen(false);
    setEditing(null);
  };

  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        title="Marks"
        description="Record marks against configured exam subjects."
        action={
          <PrimaryButton onClick={openCreate}>
            + Enter Marks
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
        placeholder="Search student, grade or marks..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center">
            Loading...
          </div>
        ) : !filtered.length ? (
          <EmptyState message="No marks found." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">
                    Student
                  </th>

                  <th className="px-5 py-3">
                    Exam Subject
                  </th>

                  <th className="px-5 py-3">
                    Marks
                  </th>

                  <th className="px-5 py-3">
                    Grade
                  </th>

                  <th className="px-5 py-3">
                    Remarks
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
                      {getStudentName(item.student_id)}
                    </td>

                    <td className="px-5 py-4">
                      #{item.exam_subject_id}
                    </td>

                    <td className="px-5 py-4 font-medium">
                      {item.marks_obtained}
                    </td>

                    <td className="px-5 py-4">
                      {item.grade ?? "—"}
                    </td>

                    <td className="px-5 py-4">
                      {item.remarks ?? "—"}
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
        <MarkForm
          mark={editing}
          onClose={closeForm}
          onSuccess={load}
        />
      )}
    </div>
  );
}