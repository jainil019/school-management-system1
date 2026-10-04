import { useEffect, useState } from "react";
import {
  createAcademicYear,
  getAcademicYears,
  type AcademicYear,
} from "../../api/academicYears";

import ModuleModal from "../../components/common/ModuleModal";
import {
  EmptyState,
  ErrorBox,
  Field,
  inputClass,
  PageHeader,
  PrimaryButton,
} from "../../components/common/ModuleUi";

export default function AcademicYears() {
  const [items, setItems] = useState<AcademicYear[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isCurrent, setIsCurrent] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      setItems(await getAcademicYears());
    } catch (e: any) {
      setError(
        e?.response?.data?.detail ??
          "Unable to load academic years."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const resetForm = () => {
    setName("");
    setStartDate("");
    setEndDate("");
    setIsCurrent(true);
  };

  const closeForm = () => {
    setOpen(false);
    resetForm();
    setError("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !startDate || !endDate) {
      setError(
        "Academic year name, start date and end date are required."
      );
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      setError("End date must be after start date.");
      return;
    }

    try {
      setSaving(true);

      await createAcademicYear({
        name: name.trim(),
        start_date: startDate,
        end_date: endDate,
        is_current: isCurrent,
      });

      await load();
      closeForm();
    } catch (e: any) {
      setError(
        e?.response?.data?.detail ??
          "Unable to create academic year."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Academic Years"
        description="Manage school academic years."
        action={
          <PrimaryButton onClick={() => setOpen(true)}>
            + Add Academic Year
          </PrimaryButton>
        }
      />

      {error && !open && <ErrorBox message={error} />}

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Loading...
          </div>
        ) : !items.length ? (
          <EmptyState message="No academic years found." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Start Date</th>
                  <th className="px-5 py-3">End Date</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-5 py-4 font-medium text-slate-900">
                      {item.name}
                    </td>

                    <td className="px-5 py-4">
                      {item.start_date}
                    </td>

                    <td className="px-5 py-4">
                      {item.end_date}
                    </td>

                    <td className="px-5 py-4">
                      {item.is_current ? (
                        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                          Current
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                          Previous
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {open && (
        <ModuleModal
          title="Add Academic Year"
          onClose={closeForm}
        >
          <form onSubmit={submit} className="space-y-5">
            {error && <ErrorBox message={error} />}

            <Field label="Academic Year Name" required>
              <input
                className={inputClass}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="2026-2027"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Start Date" required>
                <input
                  type="date"
                  className={inputClass}
                  value={startDate}
                  onChange={(e) =>
                    setStartDate(e.target.value)
                  }
                />
              </Field>

              <Field label="End Date" required>
                <input
                  type="date"
                  className={inputClass}
                  value={endDate}
                  onChange={(e) =>
                    setEndDate(e.target.value)
                  }
                />
              </Field>
            </div>

            <label className="flex items-center gap-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={isCurrent}
                onChange={(e) =>
                  setIsCurrent(e.target.checked)
                }
                className="h-4 w-4 rounded border-slate-300"
              />

              Set as current academic year
            </label>

            <div className="flex justify-end gap-3 border-t pt-5">
              <button
                type="button"
                onClick={closeForm}
                className="rounded-xl px-4 py-2.5 hover:bg-slate-100"
              >
                Cancel
              </button>

              <PrimaryButton type="submit" disabled={saving}>
                {saving ? "Saving..." : "Create Academic Year"}
              </PrimaryButton>
            </div>
          </form>
        </ModuleModal>
      )}
    </div>
  );
}