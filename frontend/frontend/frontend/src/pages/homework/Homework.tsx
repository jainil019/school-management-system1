import { useEffect, useMemo, useState } from "react";

import {
  deleteHomework,
  getHomework,
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

import HomeworkForm from "../../components/homework/HomeworkForm";

import {
  DangerButton,
  EmptyState,
  PageHeader,
  PrimaryButton,
} from "../../components/common/ModuleUi";

export default function Homework() {
  const [items, setItems] = useState<HomeworkItem[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectLookup[]>([]);
  const [teachers, setTeachers] = useState<TeacherLookup[]>([]);

  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editingHomework, setEditingHomework] =
    useState<HomeworkItem | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        homework,
        classList,
        sectionList,
        subjectList,
        teacherList,
      ] = await Promise.all([
        getHomework(),
        getClasses(),
        getSections(),
        getSubjects(),
        getTeachers(),
      ]);

      setItems(homework);
      setClasses(classList);
      setSections(sectionList);
      setSubjects(subjectList);
      setTeachers(teacherList);
    } catch (e: any) {
      setError(
        e?.response?.data?.detail ??
          "Unable to load homework.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const className = (id: number) =>
    classes.find((item) => item.id === id)?.name ??
    `Class #${id}`;

  const sectionName = (id: number | null) => {
    if (id === null) {
      return "All sections";
    }

    return (
      sections.find((item) => item.id === id)?.name ??
      `Section #${id}`
    );
  };

  const subjectName = (id: number) =>
    subjects.find((item) => item.id === id)?.name ??
    `Subject #${id}`;

  const teacherName = (id: number) => {
    const teacher = teachers.find(
      (item) => item.id === id,
    );

    return teacher
      ? `${teacher.first_name} ${teacher.last_name}`
      : `Teacher #${id}`;
  };

  const filtered = useMemo(() => {
    const search = q.toLowerCase();

    return items.filter((item) =>
      `${item.title}
       ${className(item.class_id)}
       ${sectionName(item.section_id)}
       ${subjectName(item.subject_id)}
       ${teacherName(item.teacher_id)}
       ${item.due_date}`
        .toLowerCase()
        .includes(search),
    );
  }, [
    items,
    classes,
    sections,
    subjects,
    teachers,
    q,
  ]);

  const openCreate = () => {
    setEditingHomework(null);
    setOpen(true);
  };

  const openEdit = (homework: HomeworkItem) => {
    setEditingHomework(homework);
    setOpen(true);
  };

  const closeForm = () => {
    setOpen(false);
    setEditingHomework(null);
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this homework?")) {
      return;
    }

    try {
      setError("");
      await deleteHomework(id);
      await load();
    } catch (e: any) {
      setError(
        e?.response?.data?.detail ??
          "Unable to delete homework.",
      );
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        title="Homework"
        description="Create and manage class homework."
        action={
          <PrimaryButton onClick={openCreate}>
            + Create Homework
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
        placeholder="Search homework..."
        value={q}
        onChange={(event) =>
          setQ(event.target.value)
        }
      />

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center">
            Loading...
          </div>
        ) : !filtered.length ? (
          <EmptyState message="No homework found." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">
                    Title
                  </th>

                  <th className="px-5 py-3">
                    Class / Section
                  </th>

                  <th className="px-5 py-3">
                    Subject
                  </th>

                  <th className="px-5 py-3">
                    Teacher
                  </th>

                  <th className="px-5 py-3">
                    Assigned
                  </th>

                  <th className="px-5 py-3">
                    Due
                  </th>

                  <th className="px-5 py-3 text-right">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td className="px-5 py-4 font-medium text-slate-800">
                      {item.title}
                    </td>

                    <td className="px-5 py-4">
                      {className(item.class_id)} /{" "}
                      {sectionName(item.section_id)}
                    </td>

                    <td className="px-5 py-4">
                      {subjectName(item.subject_id)}
                    </td>

                    <td className="px-5 py-4">
                      {teacherName(item.teacher_id)}
                    </td>

                    <td className="px-5 py-4">
                      {item.assigned_date}
                    </td>

                    <td className="px-5 py-4">
                      {item.due_date}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            openEdit(item)
                          }
                          className="rounded-lg border border-blue-200 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50"
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
        <HomeworkForm
          homework={editingHomework}
          onClose={closeForm}
          onSuccess={load}
        />
      )}
    </div>
  );
}