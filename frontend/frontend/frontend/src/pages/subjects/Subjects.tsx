import { useEffect, useMemo, useState } from "react";

import { deleteSubject, getSubjects, type Subject } from "../../api/subjects";

import SubjectForm from "../../components/subjects/SubjectForm";

import {
  EmptyState,
  PageHeader,
  PrimaryButton,
} from "../../components/common/ModuleUi";

import { Pencil, Trash2 } from "lucide-react";

export default function Subjects() {
  const [items, setItems] = useState<Subject[]>([]);
  const [query, setQuery] = useState("");

  const [open, setOpen] = useState(false);

  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getSubjects();

      setItems(data);
    } catch (err: any) {
      console.error("Delete subject error:", err);

      const detail = err?.response?.data?.detail;

      setError(
        typeof detail === "string" ? detail : "Unable to delete subject.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(
    () =>
      items.filter((x) =>
        `${x.name} ${x.code}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [items, query],
  );

  const handleAdd = () => {
    setEditingSubject(null);
    setOpen(true);
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setOpen(true);
  };

  const handleCloseForm = () => {
    setOpen(false);
    setEditingSubject(null);
  };

  const handleDelete = async (subject: Subject) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${subject.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(subject.id);
      setError("");

      await deleteSubject(subject.id);

      await load();
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Unable to delete subject.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        title="Subjects"
        description="Manage subjects available in the school."
        action={
          <PrimaryButton onClick={handleAdd}>+ Add Subject</PrimaryButton>
        }
      />

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input
          className="w-full max-w-md rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-500"
          placeholder="Search by name or code..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <button
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
          <EmptyState message="No subjects found." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-3">ID</th>

                  <th className="px-6 py-3">Subject</th>

                  <th className="px-6 py-3">Code</th>

                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filtered.map((x) => (
                  <tr key={x.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">{x.id}</td>

                    <td className="px-6 py-4 font-medium text-slate-900">
                      {x.name}
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs">
                        {x.code}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(x)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          <Pencil size={14} />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => void handleDelete(x)}
                          disabled={deletingId === x.id}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 size={14} />

                          {deletingId === x.id ? "Deleting..." : "Delete"}
                        </button>
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
        <SubjectForm
          onClose={handleCloseForm}
          onSuccess={load}
          editingSubject={editingSubject}
        />
      )}
    </div>
  );
}
