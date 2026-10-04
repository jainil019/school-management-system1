import { useEffect, useMemo, useState } from "react";
import {
  getUsers,
  updateUserStatus,
  type User,
} from "../../api/users";

import {
  EmptyState,
  ErrorBox,
  PageHeader,
} from "../../components/common/ModuleUi";

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<number | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      setUsers(await getUsers());
    } catch (e: any) {
      setError(
        e?.response?.data?.detail ??
          "Unable to load users."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const value = query.toLowerCase().trim();

    if (!value) {
      return users;
    }

    return users.filter(
      (user) =>
        user.email.toLowerCase().includes(value) ||
        user.role_name.toLowerCase().includes(value)
    );
  }, [users, query]);

  const toggleStatus = async (user: User) => {
    try {
      setUpdating(user.id);
      setError("");

      const updated = await updateUserStatus(
        user.id,
        !user.is_active
      );

      setUsers((current) =>
        current.map((item) =>
          item.id === updated.id ? updated : item
        )
      );
    } catch (e: any) {
      setError(
        e?.response?.data?.detail ??
          "Unable to update user status."
      );
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="User Management"
        description="Manage system users and account access."
      />

      {error && (
        <div className="mt-4">
          <ErrorBox message={error} />
        </div>
      )}

      <input
        className="mt-6 w-full max-w-lg rounded-xl border border-slate-300 px-4 py-2.5 text-sm"
        placeholder="Search email or role..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Loading users...
          </div>
        ) : !filtered.length ? (
          <EmptyState message="No users found." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">ID</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {filtered.map((user) => (
                  <tr key={user.id}>
                    <td className="px-5 py-4">
                      #{user.id}
                    </td>

                    <td className="px-5 py-4 font-medium text-slate-900">
                      {user.email}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                        {user.role_name}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {user.is_active ? (
                        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                          Active
                        </span>
                      ) : (
                        <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
                          Inactive
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        disabled={updating === user.id}
                        onClick={() =>
                          void toggleStatus(user)
                        }
                        className={`rounded-xl px-4 py-2 text-sm font-medium ${
                          user.is_active
                            ? "bg-red-50 text-red-600 hover:bg-red-100"
                            : "bg-green-50 text-green-600 hover:bg-green-100"
                        } disabled:cursor-not-allowed disabled:opacity-50`}
                      >
                        {updating === user.id
                          ? "Updating..."
                          : user.is_active
                            ? "Deactivate"
                            : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}