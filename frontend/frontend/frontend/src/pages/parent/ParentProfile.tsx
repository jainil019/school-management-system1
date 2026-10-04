import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  CalendarDays,
  Loader2,
  AlertCircle,
} from "lucide-react";

import {
  getMyParentProfile,
  type ParentProfile as ParentProfileData,
} from "../../api/parentProfile";
function ParentProfile() {
  const [profile, setProfile] = useState<ParentProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getMyParentProfile();

        setProfile(data);
      } catch (err) {
        console.error("Failed to load parent profile:", err);
        setError("Unable to load your profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="flex items-center gap-3 text-slate-600">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading profile...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
            <User className="mx-auto mb-3 h-10 w-10 text-slate-400" />
            <p className="text-slate-600">
              Parent profile was not found.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const fullName = `${profile.first_name} ${profile.last_name}`;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            My Profile
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View your parent account information.
          </p>
        </div>

        {/* Profile Header */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-8">
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-3xl font-bold text-slate-800 shadow-lg">
                {profile.first_name.charAt(0).toUpperCase()}
                {profile.last_name.charAt(0).toUpperCase()}
              </div>

              <div className="text-center sm:text-left">
                <h2 className="text-2xl font-bold text-white">
                  {fullName}
                </h2>

                <p className="mt-1 text-sm text-slate-300">
                  Parent Account
                </p>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="p-6">
            <h3 className="mb-5 text-lg font-semibold text-slate-900">
              Personal Information
            </h3>

            <div className="grid gap-5 md:grid-cols-2">
              {/* First Name */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-slate-500">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    First Name
                  </span>
                </div>

                <p className="font-semibold text-slate-900">
                  {profile.first_name}
                </p>
              </div>

              {/* Last Name */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-slate-500">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Last Name
                  </span>
                </div>

                <p className="font-semibold text-slate-900">
                  {profile.last_name}
                </p>
              </div>

              {/* Email */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-slate-500">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Email Address
                  </span>
                </div>

                <p className="break-all font-semibold text-slate-900">
                  {profile.email}
                </p>
              </div>

              {/* Phone */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-slate-500">
                  <Phone className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Phone Number
                  </span>
                </div>

                <p className="font-semibold text-slate-900">
                  {profile.phone || "Not provided"}
                </p>
              </div>

              {/* Address */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
                <div className="mb-2 flex items-center gap-2 text-slate-500">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Address
                  </span>
                </div>

                <p className="font-semibold text-slate-900">
                  {profile.address || "Not provided"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-5 text-lg font-semibold text-slate-900">
            Account Information
          </h3>

          <div className="grid gap-5 md:grid-cols-3">
            {/* Account Status */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-slate-500">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Account Status
                </span>
              </div>

              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                  profile.is_active
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {profile.is_active ? "Active" : "Inactive"}
              </span>
            </div>

            {/* User ID */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-slate-500">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Account ID
                </span>
              </div>

              <p className="font-semibold text-slate-900">
                #{profile.user_id}
              </p>
            </div>

            {/* Created */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-slate-500">
                <CalendarDays className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Member Since
                </span>
              </div>

              <p className="font-semibold text-slate-900">
                {formatDate(profile.created_at)}
              </p>
            </div>
          </div>
        </div>

        {/* Information Notice */}
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <div className="flex gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

            <div>
              <p className="font-semibold text-blue-900">
                Profile information
              </p>

              <p className="mt-1 text-sm text-blue-700">
                Your profile information is managed by the school
                administration. Contact the school office if any
                information needs to be changed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ParentProfile;