import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  deleteTeacherAssignment,
  getTeacherAssignments,
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

import TeacherAssignmentForm from "../../components/teacherAssignments/TeacherAssignmentForm";

import {
  DangerButton,
  EmptyState,
  PageHeader,
  PrimaryButton,
} from "../../components/common/ModuleUi";

export default function TeacherAssignments() {
  const [items, setItems] = useState<TeacherAssignment[]>([]);
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectLookup[]>([]);
  const [teachers, setTeachers] = useState<TeacherLookup[]>([]);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const [editingAssignment, setEditingAssignment] =
    useState<TeacherAssignment | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        assignments,
        academicYears,
        classData,
        sectionData,
        subjectData,
        teacherData,
      ] = await Promise.all([
        getTeacherAssignments(),
        getAcademicYears(),
        getClasses(),
        getSections(),
        getSubjects(),
        getTeachers(),
      ]);

      setItems(assignments);
      setYears(academicYears);
      setClasses(classData);
      setSections(sectionData);
      setSubjects(subjectData);
      setTeachers(teacherData);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ??
          "Unable to load teacher assignments."
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
    data: any[],
    label: string
  ) => {
    return (
      data.find((item) => item.id === id)?.name ??
      `${label} #${id}`
    );
  };

  const getTeacherName = (id: number) => {
    const teacher = teachers.find(
      (item) => item.id === id
    );

    return teacher
      ? `${teacher.first_name} ${teacher.last_name}`
      : `Teacher #${id}`;
  };

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const text = `
        ${getTeacherName(item.teacher_id)}
        ${getName(item.class_id, classes, "Class")}
        ${getName(item.section_id, sections, "Section")}
        ${getName(item.subject_id, subjects, "Subject")}
        ${getName(item.academic_year_id, years, "Year")}
      `.toLowerCase();

      return text.includes(query.toLowerCase());
    });
  }, [
    items,
    teachers,
    classes,
    sections,
    subjects,
    years,
    query,
  ]);

  const handleAdd = () => {
    setEditingAssignment(null);
    setOpen(true);
  };

  const handleEdit = (
    assignment: TeacherAssignment
  ) => {
    setEditingAssignment(assignment);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingAssignment(null);
  };

  const handleDelete = async (
    assignment: TeacherAssignment
  ) => {
    if (deletingId !== null) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this teacher assignment?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(assignment.id);
      setError("");

      await deleteTeacherAssignment(assignment.id);

      await load();
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ??
          "Unable to delete assignment."
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        title="Teacher Assignments"
        description="Assign teachers to classes, sections and subjects."
        action={
          <PrimaryButton onClick={handleAdd}>
            + Assign Teacher
          </PrimaryButton>
        }
      />

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input
          className="w-full max-w-lg rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-500"
          placeholder="Search assignments..."
          value={query}
          onChange={(event) =>
            setQuery(event.target.value)
          }
        />

        <button
          type="button"
          onClick={() => void load()}
          className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Loading...
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState message="No teacher assignments found." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">
                    Teacher
                  </th>

                  <th className="px-5 py-3">
                    Class
                  </th>

                  <th className="px-5 py-3">
                    Section
                  </th>

                  <th className="px-5 py-3">
                    Subject
                  </th>

                  <th className="px-5 py-3">
                    Academic Year
                  </th>

                  <th className="px-5 py-3 text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-5 py-4 font-medium text-slate-900">
                      {getTeacherName(
                        item.teacher_id
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
                        item.section_id,
                        sections,
                        "Section"
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
                      {getName(
                        item.academic_year_id,
                        years,
                        "Year"
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(item)
                          }
                          className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          Edit
                        </button>

                        <DangerButton
                          onClick={() =>
                            void handleDelete(item)
                          }
                        >
                          {deletingId === item.id
                            ? "Deleting..."
                            : "Delete"}
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
        <TeacherAssignmentForm
          onClose={handleClose}
          onSuccess={load}
          editingAssignment={editingAssignment}
        />
      )}
    </div>
  );
}