import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  GraduationCap,
  MapPin,
  Phone,
  UserRound,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getMyChildren,
  type ParentChild,
} from "../../api/parentChildren";

function formatDate(date: string | null) {
  if (!date) {
    return "Not available";
  }

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function ParentChildProfile() {
  const navigate = useNavigate();
  const { studentId } = useParams();

  const [child, setChild] = useState<ParentChild | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadChild = async () => {
      try {
        setLoading(true);
        setError("");

        const children = await getMyChildren();

        const selectedChild = children.find(
          (item) => item.student_id === Number(studentId)
        );

        if (!selectedChild) {
          setError(
            "This student is not linked to your parent account."
          );
          return;
        }

        setChild(selectedChild);
      } catch (err: any) {
        console.error("Failed to load child profile:", err);

        const detail = err?.response?.data?.detail;

        setError(
          detail ||
            "Unable to load the child profile. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadChild();
  }, [studentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <p className="text-sm text-slate-500">
            Loading child profile...
          </p>
        </div>
      </div>
    );
  }

  if (error || !child) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <button
          type="button"
          onClick={() => navigate("/parent/children")}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Children
        </button>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <h1 className="text-lg font-semibold text-red-800">
            Unable to load profile
          </h1>

          <p className="mt-2 text-sm text-red-700">
            {error || "Student not found."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Back */}
      <button
        type="button"
        onClick={() => navigate("/parent/children")}
        className="mb-6 flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to My Children
      </button>

      {/* Header */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center">
          {/* Photo */}
          <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-indigo-50">
            {child.photo_url ? (
              <img
                src={child.photo_url}
                alt={`${child.first_name} ${child.last_name}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <UserRound className="h-12 w-12 text-indigo-400" />
            )}
          </div>

          {/* Basic information */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-900">
                {child.first_name} {child.last_name}
              </h1>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  child.status === "ACTIVE"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {child.status}
              </span>
            </div>

            <p className="mt-2 text-sm text-slate-500">
              Admission No:{" "}
              <span className="font-semibold text-slate-700">
                {child.admission_no}
              </span>
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Relationship:{" "}
              <span className="font-semibold text-slate-700">
                {child.relationship}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Personal Information */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                <UserRound className="h-5 w-5 text-indigo-600" />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Personal Information
                </h2>

                <p className="text-xs text-slate-500">
                  Student personal details
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-5 p-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Full Name
              </p>

              <p className="mt-1 font-medium text-slate-800">
                {child.first_name} {child.last_name}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Admission Number
              </p>

              <p className="mt-1 font-medium text-slate-800">
                {child.admission_no}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Date of Birth
              </p>

              <p className="mt-1 flex items-center gap-2 font-medium text-slate-800">
                <CalendarDays className="h-4 w-4 text-slate-400" />
                {formatDate(child.dob)}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Gender
              </p>

              <p className="mt-1 font-medium text-slate-800">
                {child.gender || "Not available"}
              </p>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                <Phone className="h-5 w-5 text-blue-600" />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Contact Information
                </h2>

                <p className="text-xs text-slate-500">
                  Student contact details
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-5 p-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Phone
              </p>

              <p className="mt-1 flex items-center gap-2 font-medium text-slate-800">
                <Phone className="h-4 w-4 text-slate-400" />
                {child.phone || "Not available"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Address
              </p>

              <p className="mt-1 flex items-start gap-2 font-medium text-slate-800">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                {child.address || "Not available"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Admission Date
              </p>

              <p className="mt-1 flex items-center gap-2 font-medium text-slate-800">
                <GraduationCap className="h-4 w-4 text-slate-400" />
                {formatDate(child.admission_date)}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Account Status
              </p>

              <p className="mt-1 font-medium text-slate-800">
                {child.status}
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Child Navigation */}
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">
          Student Information
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Use the Parent Portal to view this child's academic
          information.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <button
            type="button"
            onClick={() =>
              navigate(`/parent/attendance/${child.student_id}`)
            }
            className="rounded-xl border border-slate-200 p-4 text-left transition hover:border-indigo-200 hover:bg-indigo-50"
          >
            <CalendarDays className="h-5 w-5 text-indigo-600" />

            <p className="mt-3 font-semibold text-slate-800">
              Attendance
            </p>

            <p className="mt-1 text-xs text-slate-500">
              View attendance records
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(`/parent/homework/${child.student_id}`)
            }
            className="rounded-xl border border-slate-200 p-4 text-left transition hover:border-indigo-200 hover:bg-indigo-50"
          >
            <GraduationCap className="h-5 w-5 text-indigo-600" />

            <p className="mt-3 font-semibold text-slate-800">
              Homework
            </p>

            <p className="mt-1 text-xs text-slate-500">
              View homework
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(`/parent/marks/${child.student_id}`)
            }
            className="rounded-xl border border-slate-200 p-4 text-left transition hover:border-indigo-200 hover:bg-indigo-50"
          >
            <UserRound className="h-5 w-5 text-indigo-600" />

            <p className="mt-3 font-semibold text-slate-800">
              Marks / Results
            </p>

            <p className="mt-1 text-xs text-slate-500">
              View examination results
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(`/parent/fees/${child.student_id}`)
            }
            className="rounded-xl border border-slate-200 p-4 text-left transition hover:border-indigo-200 hover:bg-indigo-50"
          >
            <GraduationCap className="h-5 w-5 text-indigo-600" />

            <p className="mt-3 font-semibold text-slate-800">
              Fees
            </p>

            <p className="mt-1 text-xs text-slate-500">
              View fee information
            </p>
          </button>
        </div>
      </section>
    </div>
  );
}

export default ParentChildProfile;