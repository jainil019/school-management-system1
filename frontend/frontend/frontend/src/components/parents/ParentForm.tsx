import { useState } from "react";
import type { FormEvent } from "react";
import { LockKeyhole, Mail, MapPin, Phone, X } from "lucide-react";
import {
  createParent,
  updateParent,
  type CreateParentData,
  type Parent,
  type UpdateParentData,
} from "../../api/parents";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  parent?: Parent | null;
}

const input =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

function ParentForm({ onClose, onSuccess, parent }: Props) {
  const editing = Boolean(parent);

  const [form, setForm] = useState<CreateParentData>({
    email: "",
    password: "",
    first_name: parent?.first_name ?? "",
    last_name: parent?.last_name ?? "",
    phone: parent?.phone ?? "",
    address: parent?.address ?? "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (name: keyof CreateParentData, value: string) => {
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.first_name.trim() || !form.last_name.trim()) {
      setError("First name and last name are required.");
      return;
    }

    try {
      setLoading(true);

      if (editing && parent) {
        const data: UpdateParentData = {
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          phone: form.phone?.trim() || "",
          address: form.address?.trim() || "",
        };

        await updateParent(parent.id, data);
      } else {
        if (!form.email.trim() || !form.password) {
          setError("Email and password are required.");
          return;
        }

        if (form.password.length < 8) {
          setError("Password must be at least 8 characters.");
          return;
        }

        await createParent({
          ...form,
          email: form.email.trim().toLowerCase(),
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
        });
      }

      onSuccess();
      onClose();
    } catch (e: any) {
      setError(
        e.response?.data?.detail ||
          (editing
            ? "Unable to update parent."
            : "Unable to create parent.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b px-6 py-5">
          <div>
            <h2 className="text-xl font-bold">
              {editing ? "Edit Parent" : "Add Parent"}
            </h2>

            <p className="text-sm text-slate-500">
              {editing
                ? "Update parent contact information."
                : "Create the parent profile and login account."}
            </p>
          </div>

          <button onClick={onClose} disabled={loading}>
            <X />
          </button>
        </header>

        <form onSubmit={submit}>
          <div className="space-y-6 p-6">
            {error && (
              <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              {!editing && (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      Email
                    </label>

                    <div className="relative">
                      <Mail
                        className="absolute left-3 top-3.5 text-slate-400"
                        size={17}
                      />

                      <input
                        className={`${input} pl-10`}
                        type="email"
                        value={form.email}
                        onChange={(e) => set("email", e.target.value)}
                        required
                        placeholder="parent@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      Password
                    </label>

                    <div className="relative">
                      <LockKeyhole
                        className="absolute left-3 top-3.5 text-slate-400"
                        size={17}
                      />

                      <input
                        className={`${input} pl-10`}
                        type="password"
                        minLength={8}
                        value={form.password}
                        onChange={(e) => set("password", e.target.value)}
                        required
                        placeholder="Minimum 8 characters"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  First Name
                </label>

                <input
                  className={input}
                  value={form.first_name}
                  onChange={(e) => set("first_name", e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Last Name
                </label>

                <input
                  className={input}
                  value={form.last_name}
                  onChange={(e) => set("last_name", e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  <Phone className="mr-1 inline" size={15} />
                  Phone
                </label>

                <input
                  className={input}
                  value={form.phone ?? ""}
                  onChange={(e) => set("phone", e.target.value)}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-semibold">
                  <MapPin className="mr-1 inline" size={15} />
                  Address
                </label>

                <textarea
                  className={input}
                  rows={3}
                  value={form.address ?? ""}
                  onChange={(e) => set("address", e.target.value)}
                />
              </div>
            </div>
          </div>

          <footer className="flex justify-end gap-3 border-t bg-slate-50 p-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border bg-white px-5 py-2.5 text-sm font-semibold"
            >
              Cancel
            </button>

            <button
              disabled={loading}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white"
            >
              {loading
                ? editing
                  ? "Saving..."
                  : "Creating..."
                : editing
                ? "Save Changes"
                : "Create Parent"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}

export default ParentForm;