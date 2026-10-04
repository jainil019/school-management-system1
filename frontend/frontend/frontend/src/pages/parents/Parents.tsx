import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Trash2,
  UserRound,
  Pencil,
} from "lucide-react";

import {
  deleteParent,
  getParents,
  type Parent,
} from "../../api/parents";

import ParentForm from "../../components/parents/ParentForm";

function Parents() {
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const [openForm, setOpenForm] = useState(false);
  const [editingParent, setEditingParent] = useState<Parent | null>(null);

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getParents();
      setParents(data);
    } catch (e: any) {
      setError(
        e.response?.data?.detail || "Unable to load parents."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const filteredParents = useMemo(() => {
    return parents.filter((parent) =>
      `${parent.first_name} ${parent.last_name} ${
        parent.phone ?? ""
      } ${parent.address ?? ""}`
        .toLowerCase()
        .includes(query.toLowerCase())
    );
  }, [parents, query]);

  const handleEdit = (parent: Parent) => {
    setEditingParent(parent);
    setOpenForm(true);
  };

  const handleAdd = () => {
    setEditingParent(null);
    setOpenForm(true);
  };

  const handleClose = () => {
    setOpenForm(false);
    setEditingParent(null);
  };

  const handleDelete = async (parent: Parent) => {
    const confirmed = confirm(
      `Delete ${parent.first_name} ${parent.last_name}? Their login account will be disabled.`
    );

    if (!confirmed) return;

    try {
      setDeletingId(parent.id);

      await deleteParent(parent.id);

      await loadData();
    } catch (e: any) {
      alert(
        e.response?.data?.detail ||
          "Unable to delete parent."
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
          <h1 className="text-2xl font-bold text-slate-900">
            Parents
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage parent accounts and contact information.
          </p>
        </div>

        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Parent
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Search */}
        <div className="border-b p-4">
          <div className="relative max-w-lg">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              className="w-full rounded-xl border bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500"
              placeholder="Search parent..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-slate-500">
            Loading parents...
          </div>
        ) : error ? (
          <div className="m-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : filteredParents.length === 0 ? (
          <div className="flex flex-col items-center py-16">
            <UserRound className="text-slate-400" />

            <p className="mt-3 font-semibold">
              No parents found
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  {[
                    "Parent",
                    "Phone",
                    "Address",
                    "Action",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-400"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y">
                {filteredParents.map((parent) => (
                  <tr
                    key={parent.id}
                    className="hover:bg-slate-50"
                  >
                    {/* Parent */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 font-bold text-blue-600">
                          {parent.first_name?.[0]?.toUpperCase()}
                        </div>

                        <div>
                          <p className="text-sm font-semibold">
                            {parent.first_name}{" "}
                            {parent.last_name}
                          </p>

                          <p className="text-xs text-slate-400">
                            Parent ID #{parent.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="px-6 py-4 text-sm">
                      {parent.phone || "—"}
                    </td>

                    {/* Address */}
                    <td className="max-w-md px-6 py-4 text-sm text-slate-600">
                      {parent.address || "—"}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {/* Edit */}
                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(parent)
                          }
                          title="Edit Parent"
                          className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Pencil size={17} />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          disabled={
                            deletingId === parent.id
                          }
                          onClick={() =>
                            void handleDelete(parent)
                          }
                          title="Delete Parent"
                          className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        >
                          <Trash2 size={17} />
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

      {/* Add / Edit Form */}
      {openForm && (
        <ParentForm
          parent={editingParent}
          onClose={handleClose}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}

export default Parents;