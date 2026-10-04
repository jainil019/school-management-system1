import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  GraduationCap,
  RefreshCw,
  Pencil,
  Trash2,
} from "lucide-react";

import {
  getClasses,
  deleteClass,
  type SchoolClass,
} from "../../api/classes";

import {
  getAcademicYears,
  type AcademicYear,
} from "../../api/academicYears";

import ClassForm from "../../components/classes/ClassForm";

const Classes = () => {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [classesData, yearsData] = await Promise.all([
        getClasses(),
        getAcademicYears(),
      ]);

      setClasses(classesData);
      setAcademicYears(yearsData);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail || "Failed to load classes."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const filteredClasses = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return classes;
    }

    return classes.filter((item) => {
      const academicYear = academicYears.find(
        (year) => year.id === item.academic_year_id
      );

      return (
        item.name.toLowerCase().includes(value) ||
        academicYear?.name.toLowerCase().includes(value)
      );
    });
  }, [classes, academicYears, search]);

  const getAcademicYearName = (academicYearId: number) => {
    const year = academicYears.find(
      (item) => item.id === academicYearId
    );

    return year?.name || `Year #${academicYearId}`;
  };

  const currentAcademicYear = academicYears.find(
    (year) => year.is_current
  );

  const currentYearClasses = currentAcademicYear
    ? classes.filter(
        (item) =>
          item.academic_year_id === currentAcademicYear.id
      ).length
    : 0;

  const handleAdd = () => {
    setEditingClass(null);
    setShowForm(true);
  };

  const handleEdit = (schoolClass: SchoolClass) => {
    setEditingClass(schoolClass);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingClass(null);
  };

  const handleDelete = async (schoolClass: SchoolClass) => {
    const confirmed = window.confirm(
      `Delete Class ${schoolClass.name}?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(schoolClass.id);
      setError("");

      await deleteClass(schoolClass.id);

      await loadData();
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          "Unable to delete class. It may be connected to other records."
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Classes
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage school classes and academic years.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void loadData()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <Plus size={18} />
            Add Class
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-blue-50 p-3">
              <GraduationCap
                size={24}
                className="text-blue-600"
              />
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Total Classes
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-900">
                {classes.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-green-50 p-3">
              <GraduationCap
                size={24}
                className="text-green-600"
              />
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Current Year Classes
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-900">
                {currentYearClasses}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="relative max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search class or academic year..."
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-gray-50">
              <tr className="border-b border-gray-200">
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  ID
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Class Name
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Academic Year
                </th>

                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-10 text-center text-sm text-gray-500"
                  >
                    Loading classes...
                  </td>
                </tr>
              ) : filteredClasses.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-10 text-center"
                  >
                    <GraduationCap
                      size={40}
                      className="mx-auto text-gray-300"
                    />

                    <p className="mt-3 text-sm font-medium text-gray-700">
                      No classes found
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {search
                        ? "Try a different search."
                        : "Add your first class to get started."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredClasses.map((schoolClass) => (
                  <tr
                    key={schoolClass.id}
                    className="transition hover:bg-gray-50"
                  >
                    {/* ID */}
                    <td className="px-6 py-4 text-sm text-gray-500">
                      #{schoolClass.id}
                    </td>

                    {/* Class Name */}
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        Class {schoolClass.name}
                      </div>
                    </td>

                    {/* Academic Year */}
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                        {getAcademicYearName(
                          schoolClass.academic_year_id
                        )}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {/* Edit */}
                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(schoolClass)
                          }
                          title="Edit Class"
                          className="rounded-lg p-2 text-gray-400 transition hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Pencil size={17} />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          disabled={
                            deletingId === schoolClass.id
                          }
                          onClick={() =>
                            void handleDelete(schoolClass)
                          }
                          title="Delete Class"
                          className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && filteredClasses.length > 0 && (
          <div className="border-t border-gray-200 px-6 py-3 text-sm text-gray-500">
            Showing {filteredClasses.length} of{" "}
            {classes.length} classes
          </div>
        )}
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <ClassForm
          editingClass={editingClass}
          onClose={handleCloseForm}
          onSuccess={loadData}
        />
      )}
    </div>
  );
};

export default Classes;