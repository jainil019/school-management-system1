import { useEffect, useMemo, useState } from "react";
import {
  Link2,
  Loader2,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";

import { getParents, type Parent } from "../../api/parents";
import { getStudents, type Student } from "../../api/students";

import {
  createParentStudentLink,
  deleteParentStudentLink,
  getParentStudentLinks,
  type ParentStudentLink,
} from "../../api/parentStudentLinks";

function errorText(error: any) {
  const detail = error?.response?.data?.detail;

  if (Array.isArray(detail)) {
    return detail
      .map(
        (item: any) =>
          `${item.loc?.at(-1) ?? "Field"}: ${item.msg}`
      )
      .join(", ");
  }

  return detail || "Something went wrong.";
}

export default function ParentStudentLinks() {
  const [parents, setParents] = useState<Parent[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [links, setLinks] = useState<ParentStudentLink[]>([]);

  const [parentId, setParentId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [relationship, setRelationship] = useState("Father");

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");

      const [parentData, studentData, linkData] =
        await Promise.all([
          getParents(),
          getStudents(),
          getParentStudentLinks(),
        ]);

      setParents(parentData);
      setStudents(studentData);
      setLinks(linkData);
    } catch (error: any) {
      setError(errorText(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const parentName = (id: number) => {
    const parent = parents.find((item) => item.id === id);

    if (!parent) {
      return `Parent #${id}`;
    }

    return `${parent.first_name} ${parent.last_name}`;
  };

  const studentName = (id: number) => {
    const student = students.find((item) => item.id === id);

    if (!student) {
      return `Student #${id}`;
    }

    return `${student.first_name} ${student.last_name}`;
  };

  const admissionNo = (id: number) => {
    return (
      students.find((item) => item.id === id)?.admission_no ??
      `Student #${id}`
    );
  };

  const filteredLinks = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return links;
    }

    return links.filter((link) => {
      const text = [
        parentName(link.parent_id),
        studentName(link.student_id),
        admissionNo(link.student_id),
        link.relationship,
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(value);
    });
  }, [links, parents, students, search]);

  const handleCreate = async () => {
    setError("");
    setSuccess("");

    if (!parentId) {
      setError("Please select a parent.");
      return;
    }

    if (!studentId) {
      setError("Please select a student.");
      return;
    }

    try {
      setSaving(true);

      await createParentStudentLink({
        parent_id: Number(parentId),
        student_id: Number(studentId),
        relationship,
      });

      setSuccess("Student linked to parent successfully.");

      setParentId("");
      setStudentId("");
      setRelationship("Father");

      await load();
    } catch (error: any) {
      setError(errorText(error));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this parent-student link?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(id);
      setError("");
      setSuccess("");

      await deleteParentStudentLink(id);

      setSuccess("Parent-student link removed.");
      await load();
    } catch (error: any) {
      setError(errorText(error));
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
            <Link2 size={22} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Parent-Student Links
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Connect parents with their children.
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {success}
        </div>
      )}

      {/* Create Link */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <Plus size={19} className="text-blue-600" />

          <h2 className="font-semibold text-slate-900">
            Link Parent to Student
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {/* Parent */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Parent
            </label>

            <select
              value={parentId}
              onChange={(event) =>
                setParentId(event.target.value)
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="">Select parent</option>

              {parents.map((parent) => (
                <option key={parent.id} value={parent.id}>
                  {parent.first_name} {parent.last_name}
                </option>
              ))}
            </select>
          </div>

          {/* Student */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Student
            </label>

            <select
              value={studentId}
              onChange={(event) =>
                setStudentId(event.target.value)
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="">Select student</option>

              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.first_name} {student.last_name} —{" "}
                  {student.admission_no}
                </option>
              ))}
            </select>
          </div>

          {/* Relationship */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Relationship
            </label>

            <select
              value={relationship}
              onChange={(event) =>
                setRelationship(event.target.value)
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="Father">Father</option>
              <option value="Mother">Mother</option>
              <option value="Guardian">Guardian</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={handleCreate}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Link2 size={18} />
            )}

            {saving ? "Linking..." : "Link Student"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Total Parents
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {parents.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Total Students
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {students.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Active Links
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {links.length}
          </p>
        </div>
      </div>

      {/* Links table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">
              Linked Children
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              These relationships control which children a
              parent can see.
            </p>
          </div>

          <div className="relative w-full sm:max-w-sm">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search parent or student..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 p-10 text-sm text-slate-500">
            <Loader2 size={18} className="animate-spin" />
            Loading relationships...
          </div>
        ) : filteredLinks.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Users size={36} className="text-slate-300" />

            <h3 className="mt-3 font-semibold text-slate-800">
              No parent-student links found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Select a parent and student above to create
              the first relationship.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4">Parent</th>
                  <th className="px-5 py-4">Student</th>
                  <th className="px-5 py-4">
                    Admission No.
                  </th>
                  <th className="px-5 py-4">
                    Relationship
                  </th>
                  <th className="px-5 py-4 text-right">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredLinks.map((link) => (
                  <tr
                    key={link.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">
                        {parentName(link.parent_id)}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">
                        {studentName(link.student_id)}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {admissionNo(link.student_id)}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        {link.relationship}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() =>
                          void handleDelete(link.id)
                        }
                        disabled={deleting === link.id}
                        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 size={16} />

                        {deleting === link.id
                          ? "Removing..."
                          : "Unlink"}
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