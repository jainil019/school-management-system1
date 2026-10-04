import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { X, Layers, Save } from "lucide-react";

import {
  createSection,
  updateSection,
  type CreateSectionData,
  type Section,
} from "../../api/sections";

import {
  getClasses,
  type SchoolClass,
} from "../../api/classes";

interface SectionFormProps {
  onClose: () => void;
  onSuccess: () => void;
  editingSection?: Section | null;
}

const SectionForm = ({
  onClose,
  onSuccess,
  editingSection,
}: SectionFormProps) => {
  const editing = Boolean(editingSection);

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState<CreateSectionData>({
    name: editingSection?.name ?? "",
    class_id: editingSection?.class_id ?? 0,
  });

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      setLoadingClasses(true);
      setError("");

      const data = await getClasses();

      setClasses(data);

      if (!editingSection && data.length > 0) {
        setFormData((prev) => ({
          ...prev,
          class_id: data[0].id,
        }));
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          "Failed to load classes."
      );
    } finally {
      setLoadingClasses(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "class_id"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");

    if (!formData.name.trim()) {
      setError("Section name is required.");
      return;
    }

    if (!formData.class_id) {
      setError("Please select a class.");
      return;
    }

    try {
      setSaving(true);

      const data = {
        name: formData.name.trim(),
        class_id: formData.class_id,
      };

      if (editingSection) {
        await updateSection(
          editingSection.id,
          data
        );
      } else {
        await createSection(data);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          `Failed to ${
            editing ? "update" : "create"
          } section.`
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Layers size={20} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {editing
                  ? "Edit Section"
                  : "Add Section"}
              </h2>

              <p className="text-xs text-slate-400">
                {editing
                  ? "Update section details"
                  : "Create a new section for a class"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-5 p-6">
            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Class */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Class{" "}
                <span className="text-red-500">*</span>
              </label>

              <select
                name="class_id"
                value={formData.class_id || ""}
                onChange={handleChange}
                disabled={
                  loadingClasses || saving
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50"
              >
                {loadingClasses ? (
                  <option value="">
                    Loading classes...
                  </option>
                ) : classes.length === 0 ? (
                  <option value="">
                    No classes available
                  </option>
                ) : (
                  <>
                    <option value="">
                      Select class
                    </option>

                    {classes.map((schoolClass) => (
                      <option
                        key={schoolClass.id}
                        value={schoolClass.id}
                      >
                        {schoolClass.name}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>

            {/* Section Name */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Section Name{" "}
                <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Example: A"
                disabled={saving}
                maxLength={50}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50"
              />

              <p className="mt-1.5 text-xs text-slate-400">
                Example: A, B, C
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                saving ||
                loadingClasses ||
                classes.length === 0
              }
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save size={17} />

              {saving
                ? editing
                  ? "Updating..."
                  : "Creating..."
                : editing
                ? "Update Section"
                : "Create Section"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SectionForm;