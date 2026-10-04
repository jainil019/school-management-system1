import { useEffect, useState } from "react";
import { Eye, Loader2, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  getMyChildren,
  type ParentChild,
} from "../../api/parentChildren";

function ParentChildren() {
  const navigate = useNavigate();

  const [children, setChildren] = useState<ParentChild[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadChildren = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getMyChildren();
        setChildren(data);
      } catch (error: any) {
        console.error("Failed to load children:", error);

        const detail = error?.response?.data?.detail;

        if (Array.isArray(detail)) {
          setError(
            detail
              .map(
                (item: any) =>
                  `${item.loc?.at(-1) ?? "Field"}: ${item.msg}`
              )
              .join(", ")
          );
        } else {
          setError(detail || "Failed to load children.");
        }
      } finally {
        setLoading(false);
      }
    };

    void loadChildren();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
            <Users size={24} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              My Children
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              View and manage information about your linked children.
            </p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-12 text-sm text-slate-500 shadow-sm">
          <Loader2 size={20} className="mr-2 animate-spin" />
          Loading children...
        </div>
      ) : children.length === 0 ? (
        /* Empty */
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <Users
            size={42}
            className="mx-auto text-slate-300"
          />

          <h2 className="mt-4 text-lg font-semibold text-slate-800">
            No children linked
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            No student is currently linked to your parent account.
            Please contact the school administrator.
          </p>
        </div>
      ) : (
        /* Children */
        <div className="grid gap-6  md:grid-cols-2 m-4   xl:grid-cols-3">
          {children.map((child) => (
            <div
              key={child.link_id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              {/* Card Header */}
              <div className="border-b border-slate-100 bg-slate-50 p-6">
                <div className="flex items-center gap-4">
                  {child.photo_url ? (
                    <img
                      src={child.photo_url}
                      alt={`${child.first_name} ${child.last_name}`}
                      className="h-16 w-16 rounded-2xl object-cover ring-2 ring-white shadow-sm"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-xl font-bold text-blue-600">
                      {child.first_name.charAt(0)}
                      {child.last_name.charAt(0)}
                    </div>
                  )}

                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-bold text-slate-900">
                      {child.first_name} {child.last_name}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Admission No: {child.admission_no}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="space-y-4 p-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Relationship
                  </span>

                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {child.relationship}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Gender
                  </span>

                  <span className="text-sm font-medium text-slate-800">
                    {child.gender || "Not provided"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Status
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      child.status === "ACTIVE"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {child.status}
                  </span>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/parent/profile/${child.student_id}`
                      )
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                  >
                    <Eye size={18} />
                    View Profile
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ParentChildren;