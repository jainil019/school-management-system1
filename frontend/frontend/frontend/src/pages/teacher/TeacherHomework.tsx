import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  Edit3,
  FileText,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";

import {
  getHomework,
  createHomework,
  updateHomework,
  deleteHomework,
  type Homework,
} from "../../api/homework";

import {
  getTeacherAssignments,
  type TeacherAssignment,
} from "../../api/teacherAssignments";

import {
  getClasses,
  type SchoolClass,
} from "../../api/classes";

import {
  getSections,
  type Section,
} from "../../api/sections";

import {
  getSubjects,
  type Subject,
} from "../../api/subjects";

interface HomeworkForm {
  class_id: number | "";
  section_id: number | "";
  subject_id: number | "";
  teacher_id: number | "";
  title: string;
  description: string;
  assigned_date: string;
  due_date: string;
  attachment_url: string;
}

const today = new Date().toISOString().split("T")[0];

const emptyForm: HomeworkForm = {
  class_id: "",
  section_id: "",
  subject_id: "",
  teacher_id: "",
  title: "",
  description: "",
  assigned_date: today,
  due_date: "",
  attachment_url: "",
};

export default function TeacherHomework() {
  const [homework, setHomework] = useState<Homework[]>([]);
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [form, setForm] =
    useState<HomeworkForm>(emptyForm);

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [search, setSearch] = useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        homeworkData,
        assignmentData,
        classData,
        sectionData,
        subjectData,
      ] = await Promise.all([
        getHomework(),
        getTeacherAssignments(),
        getClasses(),
        getSections(),
        getSubjects(),
      ]);

      setHomework(homeworkData);
      setAssignments(assignmentData);
      setClasses(classData);
      setSections(sectionData);
      setSubjects(subjectData);
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.detail ||
          "Unable to load homework."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const classMap = useMemo(
    () =>
      new Map(
        classes.map((item) => [
          item.id,
          item,
        ])
      ),
    [classes]
  );

  const sectionMap = useMemo(
    () =>
      new Map(
        sections.map((item) => [
          item.id,
          item,
        ])
      ),
    [sections]
  );

  const subjectMap = useMemo(
    () =>
      new Map(
        subjects.map((item) => [
          item.id,
          item,
        ])
      ),
    [subjects]
  );

  /*
   * Only homework belonging to this teacher's
   * assigned class/section/subject is displayed.
   */
  const allowedAssignmentKeys = useMemo(
    () =>
      new Set(
        assignments.map(
          (assignment) =>
            `${assignment.class_id}-${assignment.section_id}-${assignment.subject_id}`
        )
      ),
    [assignments]
  );

  const teacherHomework = useMemo(() => {
    return homework.filter((item) =>
      allowedAssignmentKeys.has(
        `${item.class_id}-${item.section_id}-${item.subject_id}`
      )
    );
  }, [homework, allowedAssignmentKeys]);

  const filteredHomework = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) {
      return teacherHomework;
    }

    return teacherHomework.filter((item) => {
      const className =
        classMap
          .get(item.class_id)
          ?.name?.toLowerCase() || "";

      const sectionName =
        item.section_id
          ? sectionMap
              .get(item.section_id)
              ?.name?.toLowerCase() || ""
          : "";

      const subjectName =
        subjectMap
          .get(item.subject_id)
          ?.name?.toLowerCase() || "";

      return (
        item.title
          .toLowerCase()
          .includes(query) ||
        className.includes(query) ||
        sectionName.includes(query) ||
        subjectName.includes(query)
      );
    });
  }, [
    teacherHomework,
    search,
    classMap,
    sectionMap,
    subjectMap,
  ]);

  const availableClasses = useMemo(() => {
    const ids = new Set(
      assignments.map(
        (assignment) => assignment.class_id
      )
    );

    return classes.filter((item) =>
      ids.has(item.id)
    );
  }, [assignments, classes]);

  const availableSections = useMemo(() => {
    if (form.class_id === "") {
      return [];
    }

    const ids = new Set(
      assignments
        .filter(
          (assignment) =>
            assignment.class_id ===
            Number(form.class_id)
        )
        .map(
          (assignment) =>
            assignment.section_id
        )
    );

    return sections.filter((item) =>
      ids.has(item.id)
    );
  }, [assignments, sections, form.class_id]);

  const availableSubjects = useMemo(() => {
    if (
      form.class_id === "" ||
      form.section_id === ""
    ) {
      return [];
    }

    const ids = new Set(
      assignments
        .filter(
          (assignment) =>
            assignment.class_id ===
              Number(form.class_id) &&
            assignment.section_id ===
              Number(form.section_id)
        )
        .map(
          (assignment) =>
            assignment.subject_id
        )
    );

    return subjects.filter((item) =>
      ids.has(item.id)
    );
  }, [
    assignments,
    subjects,
    form.class_id,
    form.section_id,
  ]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const openCreate = () => {
    setForm({
      ...emptyForm,
      assigned_date: today,
    });

    setEditingId(null);
    setShowForm(true);
    setError("");
  };

  const openEdit = (item: Homework) => {
    setEditingId(item.id);

    setForm({
      class_id: item.class_id,
      section_id: item.section_id ?? "",
      subject_id: item.subject_id,
      teacher_id: item.teacher_id,
      title: item.title,
      description: item.description || "",
      assigned_date: item.assigned_date,
      due_date: item.due_date,
      attachment_url:
        item.attachment_url || "",
    });

    setShowForm(true);
    setError("");
  };

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (
        form.class_id === "" ||
        form.section_id === "" ||
        form.subject_id === ""
      ) {
        setError(
          "Please select class, section and subject."
        );

        return;
      }

      if (!form.title.trim()) {
        setError("Homework title is required.");

        return;
      }

      if (!form.due_date) {
        setError("Due date is required.");

        return;
      }

      /*
       * The existing API requires teacher_id.
       *
       * We take it from the selected teacher assignment
       * instead of asking the teacher to type an ID.
       */
      const assignment =
        assignments.find(
          (item) =>
            item.class_id ===
              Number(form.class_id) &&
            item.section_id ===
              Number(form.section_id) &&
            item.subject_id ===
              Number(form.subject_id)
        );

      if (!assignment) {
        setError(
          "This class, section and subject are not assigned to you."
        );

        return;
      }

      if (editingId !== null) {
        await updateHomework(
          editingId,
          {
            title: form.title.trim(),
            description:
              form.description.trim() ||
              null,
            due_date: form.due_date,
            attachment_url:
              form.attachment_url.trim() ||
              null,
          }
        );
      } else {
        await createHomework({
          class_id: Number(form.class_id),
          section_id: Number(form.section_id),
          subject_id: Number(form.subject_id),
          teacher_id: assignment.teacher_id,
          title: form.title.trim(),
          description:
            form.description.trim() ||
            null,
          assigned_date:
            form.assigned_date,
          due_date: form.due_date,
          attachment_url:
            form.attachment_url.trim() ||
            null,
        });
      }

      await loadData();
      resetForm();
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.detail ||
          "Unable to save homework."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this homework?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteHomework(id);

      setHomework((current) =>
        current.filter(
          (item) => item.id !== id
        )
      );
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.detail ||
          "Unable to delete homework."
      );
    }
  };

  const getStatus = (dueDate: string) => {
    const todayDate =
      new Date(today);

    const due =
      new Date(dueDate);

    if (due < todayDate) {
      return {
        label: "Overdue",
        className:
          "bg-red-50 text-red-700",
      };
    }

    if (
      due.getTime() ===
      todayDate.getTime()
    ) {
      return {
        label: "Due Today",
        className:
          "bg-amber-50 text-amber-700",
      };
    }

    return {
      label: "Active",
      className:
        "bg-emerald-50 text-emerald-700",
    };
  };

  return (
    <div className="space-y-7">

      {/* Header */}

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

        <div>
          <p className="text-sm font-medium text-blue-600">
            Teacher Portal
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Homework
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Create and manage homework for your assigned classes.
          </p>
        </div>

        <div className="flex gap-3">

          <button
            type="button"
            onClick={() =>
              void loadData()
            }
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <RefreshCw size={17} />
            Refresh
          </button>

          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700"
          >
            <Plus size={17} />
            Add Homework
          </button>

        </div>

      </div>

      {/* Error */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Stats */}

      <div className="grid gap-5 md:grid-cols-3">

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <FileText size={21} />
          </div>

          <p className="mt-5 text-sm font-medium text-slate-500">
            Total Homework
          </p>

          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            {loading
              ? "..."
              : teacherHomework.length}
          </h2>

          <p className="mt-2 text-xs text-blue-600">
            Your homework
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <BookOpen size={21} />
          </div>

          <p className="mt-5 text-sm font-medium text-slate-500">
            Assigned Classes
          </p>

          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            {loading
              ? "..."
              : assignments.length}
          </h2>

          <p className="mt-2 text-xs text-emerald-600">
            Teaching assignments
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <CalendarDays size={21} />
          </div>

          <p className="mt-5 text-sm font-medium text-slate-500">
            Active Homework
          </p>

          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            {loading
              ? "..."
              : teacherHomework.filter(
                  (item) =>
                    new Date(
                      item.due_date
                    ) >=
                    new Date(today)
                ).length}
          </h2>

          <p className="mt-2 text-xs text-amber-600">
            Upcoming deadlines
          </p>
        </div>

      </div>

      {/* Search */}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="relative">

          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search homework, class, subject..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />

        </div>

      </div>

      {/* Homework list */}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-200 px-6 py-5">

          <h2 className="font-semibold text-slate-900">
            Homework List
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {filteredHomework.length} homework item
            {filteredHomework.length === 1
              ? ""
              : "s"}
          </p>

        </div>

        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw
              size={30}
              className="mx-auto animate-spin text-blue-600"
            />

            <p className="mt-3 text-sm text-slate-500">
              Loading homework...
            </p>
          </div>
        ) : filteredHomework.length === 0 ? (
          <div className="p-12 text-center">

            <FileText
              size={42}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-4 font-semibold text-slate-800">
              No homework found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Create homework for one of your assigned classes.
            </p>

          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full min-w-[950px]">

              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left">

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Homework
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Class
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Subject
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Assigned
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Due Date
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>

                </tr>
              </thead>

              <tbody>

                {filteredHomework.map(
                  (item) => {
                    const status =
                      getStatus(
                        item.due_date
                      );

                    return (
                      <tr
                        key={item.id}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >

                        <td className="px-6 py-4">

                          <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                              <FileText size={18} />
                            </div>

                            <div>
                              <p className="font-semibold text-slate-900">
                                {item.title}
                              </p>

                              {item.description && (
                                <p className="mt-1 max-w-xs truncate text-xs text-slate-400">
                                  {item.description}
                                </p>
                              )}
                            </div>

                          </div>

                        </td>

                        <td className="px-6 py-4">

                          <p className="text-sm font-semibold text-slate-800">
                            {classMap.get(
                              item.class_id
                            )?.name ||
                              `Class #${item.class_id}`}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {item.section_id
                              ? sectionMap.get(
                                  item.section_id
                                )?.name ||
                                `Section #${item.section_id}`
                              : "All sections"}
                          </p>

                        </td>

                        <td className="px-6 py-4">
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                            {subjectMap.get(
                              item.subject_id
                            )?.name ||
                              `Subject #${item.subject_id}`}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {item.assigned_date}
                        </td>

                        <td className="px-6 py-4 text-sm font-medium text-slate-700">
                          {item.due_date}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </td>

                        <td className="px-6 py-4">

                          <div className="flex items-center gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                openEdit(item)
                              }
                              className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                              title="Edit"
                            >
                              <Edit3
                                size={17}
                              />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                void handleDelete(
                                  item.id
                                )
                              }
                              className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                              title="Delete"
                            >
                              <Trash2
                                size={17}
                              />
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* ================================================= */}
      {/* FORM MODAL */}
      {/* ================================================= */}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            {/* Modal Header */}

            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingId
                    ? "Edit Homework"
                    : "Create Homework"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Assign homework to one of your classes.
                </p>
              </div>

              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>

            </div>

            {/* Form */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >

              {/* Class */}

              {!editingId && (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Class
                    </label>

                    <select
                      value={form.class_id}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          class_id:
                            event.target.value
                              ? Number(
                                  event.target.value
                                )
                              : "",
                          section_id: "",
                          subject_id: "",
                        }))
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      required
                    >
                      <option value="">
                        Select class
                      </option>

                      {availableClasses.map(
                        (item) => (
                          <option
                            key={item.id}
                            value={item.id}
                          >
                            {item.name}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  {/* Section */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Section
                    </label>

                    <select
                      value={form.section_id}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          section_id:
                            event.target.value
                              ? Number(
                                  event.target.value
                                )
                              : "",
                          subject_id: "",
                        }))
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      required
                      disabled={
                        form.class_id === ""
                      }
                    >
                      <option value="">
                        Select section
                      </option>

                      {availableSections.map(
                        (item) => (
                          <option
                            key={item.id}
                            value={item.id}
                          >
                            {item.name}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  {/* Subject */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Subject
                    </label>

                    <select
                      value={form.subject_id}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          subject_id:
                            event.target.value
                              ? Number(
                                  event.target.value
                                )
                              : "",
                        }))
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      required
                      disabled={
                        form.section_id === ""
                      }
                    >
                      <option value="">
                        Select subject
                      </option>

                      {availableSubjects.map(
                        (item) => (
                          <option
                            key={item.id}
                            value={item.id}
                          >
                            {item.name}{" "}
                            {item.code
                              ? `(${item.code})`
                              : ""}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </>
              )}

              {/* Title */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Homework Title
                </label>

                <input
                  type="text"
                  value={form.title}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      title:
                        event.target.value,
                    }))
                  }
                  placeholder="Example: Chapter 5 Exercise"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>

              {/* Description */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Description
                </label>

                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description:
                        event.target.value,
                    }))
                  }
                  rows={4}
                  placeholder="Enter homework instructions..."
                  className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Dates */}

              <div className="grid gap-5 md:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Assigned Date
                  </label>

                  <input
                    type="date"
                    value={
                      form.assigned_date
                    }
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        assigned_date:
                          event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Due Date
                  </label>

                  <input
                    type="date"
                    value={
                      form.due_date
                    }
                    min={
                      form.assigned_date
                    }
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        due_date:
                          event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    required
                  />
                </div>

              </div>

              {/* Attachment */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Attachment URL
                  <span className="ml-2 font-normal text-slate-400">
                    Optional
                  </span>
                </label>

                <input
                  type="url"
                  value={
                    form.attachment_url
                  }
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      attachment_url:
                        event.target.value,
                    }))
                  }
                  placeholder="https://..."
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Buttons */}

              <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">

                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <RefreshCw
                      size={16}
                      className="animate-spin"
                    />
                  )}

                  {editingId
                    ? "Update Homework"
                    : "Create Homework"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}