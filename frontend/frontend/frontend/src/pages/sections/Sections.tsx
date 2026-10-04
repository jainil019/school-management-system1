import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Layers,
  RefreshCw,
  AlertCircle,
  Pencil,
  Trash2,
} from "lucide-react";

import {
  getSections,
  deleteSection,
  type Section,
} from "../../api/sections";

import {
  getClasses,
  type SchoolClass,
} from "../../api/classes";

import SectionForm from "../../components/sections/SectionForm";

const Sections = () => {
  const [sections, setSections] =
    useState<Section[]>([]);

  const [classes, setClasses] =
    useState<SchoolClass[]>([]);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingSection, setEditingSection] =
    useState<Section | null>(null);

  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [sectionData, classData] =
        await Promise.all([
          getSections(),
          getClasses(),
        ]);

      setSections(sectionData);
      setClasses(classData);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          "Failed to load sections."
      );
    } finally {
      setLoading(false);
    }
  };

  const getClassName = (classId: number) => {
    const schoolClass = classes.find(
      (item) => item.id === classId
    );

    return (
      schoolClass?.name ||
      `Class #${classId}`
    );
  };

  const filteredSections = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return sections;
    }

    return sections.filter((section) => {
      const className = getClassName(
        section.class_id
      );

      return (
        section.name
          .toLowerCase()
          .includes(query) ||
        className
          .toLowerCase()
          .includes(query)
      );
    });
  }, [sections, classes, search]);

  const handleAdd = () => {
    setEditingSection(null);
    setShowForm(true);
  };

  const handleEdit = (section: Section) => {
    setEditingSection(section);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingSection(null);
  };

  const handleDelete = async (
    section: Section
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete Section ${section.name} from Class ${getClassName(
        section.class_id
      )}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(section.id);
      setError("");

      await deleteSection(section.id);

      await loadData();
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          "Unable to delete section."
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-slate-400">
            <Layers size={16} />
            <span>Academics</span>
            <span>/</span>
            <span className="text-slate-600">
              Sections
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Sections
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage sections for each class.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Section
        </button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Sections
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {sections.length}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Layers size={21} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Classes With Sections
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {
                  new Set(
                    sections.map(
                      (section) =>
                        section.class_id
                    )
                  ).size
                }
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Layers size={21} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search sections..."
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={
                loading ? "animate-spin" : ""
              }
            />

            Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="m-5 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0"
            />

            <div>
              <p className="font-semibold">
                Unable to process section
              </p>

              <p className="mt-1">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                  ID
                </th>

                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                  Section
                </th>

                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                  Class
                </th>

                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 4 }).map(
                  (_, index) => (
                    <tr key={index}>
                      <td
                        colSpan={4}
                        className="px-6 py-5"
                      >
                        <div className="h-5 animate-pulse rounded-lg bg-slate-100" />
                      </td>
                    </tr>
                  )
                )
              ) : filteredSections.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-14 text-center"
                  >
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                      <Layers size={24} />
                    </div>

                    <p className="mt-4 text-sm font-semibold text-slate-700">
                      No sections found
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      {search
                        ? "Try a different search."
                        : "Create your first section."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredSections.map(
                  (section) => (
                    <tr
                      key={section.id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-slate-500">
                        #{section.id}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-sm font-bold text-blue-600">
                            {section.name
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              Section{" "}
                              {section.name}
                            </p>

                            <p className="text-xs text-slate-400">
                              ID: {section.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700">
                          {getClassName(
                            section.class_id
                          )}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(section)
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-100"
                            title="Edit section"
                          >
                            <Pencil size={15} />
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(section)
                            }
                            disabled={
                              deletingId ===
                              section.id
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                            title="Delete section"
                          >
                            <Trash2 size={15} />

                            {deletingId ===
                            section.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {!loading &&
          filteredSections.length > 0 && (
            <div className="border-t border-slate-100 px-6 py-4">
              <p className="text-sm text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-700">
                  {filteredSections.length}
                </span>{" "}
                section
                {filteredSections.length !== 1
                  ? "s"
                  : ""}
              </p>
            </div>
          )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <SectionForm
          onClose={handleCloseForm}
          onSuccess={loadData}
          editingSection={editingSection}
        />
      )}
    </div>
  );
};

export default Sections;