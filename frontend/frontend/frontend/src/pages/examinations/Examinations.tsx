import { useEffect, useMemo, useState } from "react";

import {
  deleteExamination,
  getExaminations,
  type Examination,
} from "../../api/examinations";

import {
  getAcademicYears,
  type AcademicYear,
} from "../../api/lookups";

import ExaminationForm from "../../components/examinations/ExaminationForm";

import {
  DangerButton,
  EmptyState,
  PageHeader,
  PrimaryButton,
} from "../../components/common/ModuleUi";

export default function Examinations() {
  const [items, setItems] = useState<Examination[]>([]);
  const [years, setYears] = useState<AcademicYear[]>([]);

  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editingExamination, setEditingExamination] =
    useState<Examination | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");

      const [examinations, academicYears] =
        await Promise.all([
          getExaminations(),
          getAcademicYears(),
        ]);

      setItems(examinations);
      setYears(academicYears);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ??
          "Unable to load examinations.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const yearName = (id: number) =>
    years.find((year) => year.id === id)?.name ??
    `Year #${id}`;

  const filtered = useMemo(() => {
    const search = q.toLowerCase();

    return items.filter((item) =>
      `${item.name} ${item.status} ${yearName(
        item.academic_year_id,
      )} ${item.start_date} ${item.end_date}`
        .toLowerCase()
        .includes(search),
    );
  }, [items, years, q]);

  const openCreate = () => {
    setEditingExamination(null);
    setOpen(true);
  };

  const openEdit = (examination: Examination) => {
    setEditingExamination(examination);
    setOpen(true);
  };

  const closeForm = () => {
    setOpen(false);
    setEditingExamination(null);
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this examination?")) {
      return;
    }

    try {
      setError("");

      await deleteExamination(id);
      await load();
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ??
          "Unable to delete examination.",
      );
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        title="Examinations"
        description="Manage examination periods."
        action={
          <PrimaryButton onClick={openCreate}>
            + Create Examination
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
        placeholder="Search examinations..."
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
          <EmptyState message="No examinations found." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">
                    Name
                  </th>

                  <th className="px-5 py-3">
                    Academic Year
                  </th>

                  <th className="px-5 py-3">
                    Start Date
                  </th>

                  <th className="px-5 py-3">
                    End Date
                  </th>

                  <th className="px-5 py-3">
                    Status
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
                      {item.name}
                    </td>

                    <td className="px-5 py-4">
                      {yearName(
                        item.academic_year_id,
                      )}
                    </td>

                    <td className="px-5 py-4">
                      {item.start_date}
                    </td>

                    <td className="px-5 py-4">
                      {item.end_date}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                        {item.status}
                      </span>
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
        <ExaminationForm
          examination={editingExamination}
          onClose={closeForm}
          onSuccess={load}
        />
      )}
    </div>
  );
}