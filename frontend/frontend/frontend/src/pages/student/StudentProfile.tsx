import { useEffect, useState } from "react";
import {
  CalendarDays,
  Mail,
  MapPin,
  Phone,
  UserRound,
} from "lucide-react";

import {
  getMyStudentProfile,
  type Student,
} from "../../api/student";

function StudentProfile() {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getMyStudentProfile();

        setStudent(data);
      } catch (err: any) {
        console.error(err);

        setError(
          err.response?.data?.detail ||
            "Unable to load your profile."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-sm text-slate-500">
          Loading profile...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
        {error}
      </div>
    );
  }

  if (!student) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-slate-500">
          Student profile not found.
        </p>
      </div>
    );
  }

  const fullName =
    `${student.first_name} ${student.last_name}`.trim();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm font-medium text-blue-600">
          Student Portal
        </p>

        <h1 className="mt-1 text-3xl font-bold text-slate-900">
          My Profile
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          View your personal and admission information.
        </p>
      </div>

      {/* Profile Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-8">
          <div className="flex items-center gap-5">
            {student.photo_url ? (
              <img
                src={student.photo_url}
                alt={fullName}
                className="h-20 w-20 rounded-full border-4 border-white/30 object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-2xl font-bold text-blue-600">
                {student.first_name
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}

            <div>
              <h2 className="text-2xl font-bold text-white">
                {fullName}
              </h2>

              <p className="mt-1 text-sm text-blue-100">
                Admission No: {student.admission_no}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-8 md:grid-cols-2">
          {/* Admission Number */}
          <InfoItem
            icon={<UserRound size={19} />}
            label="Admission Number"
            value={student.admission_no}
          />

          {/* Gender */}
          <InfoItem
            icon={<UserRound size={19} />}
            label="Gender"
            value={student.gender || "Not provided"}
          />

          {/* Date of Birth */}
          <InfoItem
            icon={<CalendarDays size={19} />}
            label="Date of Birth"
            value={formatDate(student.dob)}
          />

          {/* Admission Date */}
          <InfoItem
            icon={<CalendarDays size={19} />}
            label="Admission Date"
            value={formatDate(student.admission_date)}
          />

          {/* Phone */}
          <InfoItem
            icon={<Phone size={19} />}
            label="Phone"
            value={student.phone || "Not provided"}
          />

          {/* Email */}
          <InfoItem
            icon={<Mail size={19} />}
            label="Account ID"
            value={`User #${student.user_id}`}
          />

          {/* Address */}
          <div className="md:col-span-2">
            <InfoItem
              icon={<MapPin size={19} />}
              label="Address"
              value={student.address || "Not provided"}
            />
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900">
              Account Status
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Current student enrollment status.
            </p>
          </div>

          <span
            className={`rounded-full px-4 py-2 text-xs font-semibold ${
              student.status === "ACTIVE"
                ? "bg-emerald-50 text-emerald-600"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {student.status}
          </span>
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-semibold text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) {
    return "Not provided";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default StudentProfile;