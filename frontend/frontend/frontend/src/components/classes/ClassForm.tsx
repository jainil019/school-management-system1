import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { X } from "lucide-react";

import {
  createClass,
  updateClass,
  type SchoolClass,
} from "../../api/classes";

import {
  getAcademicYears,
  type AcademicYear,
} from "../../api/academicYears";

interface ClassFormProps {
  onClose: () => void;
  onSuccess: () => void;
  editingClass?: SchoolClass | null;
}

const ClassForm = ({
  onClose,
  onSuccess,
  editingClass = null,
}: ClassFormProps) => {
  const isEditing = Boolean(editingClass);

  const [name, setName] = useState(
    editingClass?.name ?? ""
  );

  const [academicYearId, setAcademicYearId] = useState(
    editingClass
      ? String(editingClass.academic_year_id)
      : ""
  );

  const [academicYears, setAcademicYears] = useState<
    AcademicYear[]
  >([]);

  const [loadingYears, setLoadingYears] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAcademicYears = async () => {
      try {
        setLoadingYears(true);

        const data = await getAcademicYears();
        setAcademicYears(data);

        if (!editingClass) {
          const currentYear = data.find(
            (year) => year.is_current
          );

          if (currentYear) {
            setAcademicYearId(String(currentYear.id));
          } else if (data.length > 0) {
            setAcademicYearId(String(data[0].id));
          }
        }
      } catch (err: any) {
        setError(
          err?.response?.data?.detail ||
            "Failed to load academic years."
        );
      } finally {
        setLoadingYears(false);
      }
    };

    void loadAcademicYears();
  }, [editingClass]);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Class name is required.");
      return;
    }

    if (!academicYearId) {
      setError("Please select an academic year.");
      return;
    }

    try {
      setSaving(true);

      const data = {
        name: name.trim(),
        academic_year_id: Number(academicYearId),
      };

      if (isEditing && editingClass) {
        await updateClass(editingClass.id, data);
      } else {
        await createClass(data);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      const detail = err?.response?.data?.detail;

      if (Array.isArray(detail)) {
        setError(
          detail.map((item: any) => item.msg).join(", ")
        );
      } else {
        setError(
          detail ||
            `Failed to ${
              isEditing ? "update" : "create"
            } class.`
        );
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditing ? "Edit Class" : "Add Class"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {isEditing
                ? "Update class information."
                : "Create a new class for an academic year."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5 px-6 py-6">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Class Name{" "}
                <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="e.g. 10"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Academic Year{" "}
                <span className="text-red-500">*</span>
              </label>

              <select
                value={academicYearId}
                onChange={(event) =>
                  setAcademicYearId(event.target.value)
                }
                disabled={loadingYears}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
              >
                <option value="">
                  {loadingYears
                    ? "Loading academic years..."
                    : "Select academic year"}
                </option>

                {academicYears.map((year) => (
                  <option
                    key={year.id}
                    value={year.id}
                  >
                    {year.name}
                    {year.is_current
                      ? " (Current)"
                      : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving || loadingYears}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? isEditing
                  ? "Saving..."
                  : "Creating..."
                : isEditing
                ? "Save Changes"
                : "Add Class"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClassForm;