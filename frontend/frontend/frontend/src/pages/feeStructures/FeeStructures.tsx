import { useEffect, useMemo, useState } from "react";

import {
  deleteFeeStructure,
  getFeeStructures,
  type FeeStructure,
} from "../../api/feeStructures";

import {
  getAcademicYears,
  getClasses,
  type AcademicYear,
  type ClassItem,
} from "../../api/lookups";

import FeeStructureForm from "../../components/feeStructures/FeeStructureForm";

import {
  DangerButton,
  EmptyState,
  PageHeader,
  PrimaryButton,
} from "../../components/common/ModuleUi";

export default function FeeStructures() {
  const [items, setItems] = useState<FeeStructure[]>([]);
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);

  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] =
    useState<FeeStructure | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");

      const [fees, yearList, classList] =
        await Promise.all([
          getFeeStructures(),
          getAcademicYears(),
          getClasses(),
        ]);

      setItems(fees);
      setYears(yearList);
      setClasses(classList);
    } catch (e: any) {
      setError(
        e?.response?.data?.detail ??
          "Unable to load fee structures."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const search = q.toLowerCase();

    return items.filter((item) => {
      const year =
        years.find(
          (y) => y.id === item.academic_year_id
        )?.name ?? "";

      const className =
        classes.find(
          (c) => c.id === item.class_id
        )?.name ?? "";

      return `${item.fee_type} ${year} ${className} ${item.amount}`
        .toLowerCase()
        .includes(search);
    });
  }, [items, years, classes, q]);

  const remove = async (id: number) => {
    if (!confirm("Delete this fee structure?")) {
      return;
    }

    try {
      setError("");

      await deleteFeeStructure(id);
      await load();
    } catch (e: any) {
      setError(
        e?.response?.data?.detail ??
          "Unable to delete fee structure."
      );
    }
  };

  const openCreate = () => {
    setEditing(null);
    setOpen(true);
  };

  const openEdit = (item: FeeStructure) => {
    setEditing(item);
    setOpen(true);
  };

  const closeForm = () => {
    setOpen(false);
    setEditing(null);
  };

  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        title="Fee Structures"
        description="Define fees by academic year and class."
        action={
          <PrimaryButton onClick={openCreate}>
            + Create Fee
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
        placeholder="Search fee type, class or year..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center">
            Loading...
          </div>
        ) : !filtered.length ? (
          <EmptyState message="No fee structures found." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">
                    Fee Type
                  </th>

                  <th className="px-5 py-3">
                    Class
                  </th>

                  <th className="px-5 py-3">
                    Year
                  </th>

                  <th className="px-5 py-3">
                    Amount
                  </th>

                  <th className="px-5 py-3">
                    Due Date
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
                      {item.fee_type}
                    </td>

                    <td className="px-5 py-4">
                      {classes.find(
                        (c) => c.id === item.class_id
                      )?.name ??
                        `Class #${item.class_id}`}
                    </td>

                    <td className="px-5 py-4">
                      {years.find(
                        (y) =>
                          y.id ===
                          item.academic_year_id
                      )?.name ??
                        `Year #${item.academic_year_id}`}
                    </td>

                    <td className="px-5 py-4 font-medium">
                      ₹
                      {Number(
                        item.amount
                      ).toLocaleString()}
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
        <FeeStructureForm
          feeStructure={editing}
          onClose={closeForm}
          onSuccess={load}
        />
      )}
    </div>
  );
}