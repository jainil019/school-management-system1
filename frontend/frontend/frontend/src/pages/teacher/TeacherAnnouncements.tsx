import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Bell,
  Edit3,
  Loader2,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  type Announcement,
  type CreateAnnouncement,
} from "../../api/announcements";

import {
  getClasses,
  type SchoolClass,
} from "../../api/classes";

import {
  getSections,
  type Section,
} from "../../api/sections";

interface AnnouncementForm {
  title: string;
  description: string;
  audience: string;
  class_id: number | null;
  section_id: number | null;
  expires_at: string;
}

const emptyForm: AnnouncementForm = {
  title: "",
  description: "",
  audience: "ALL",
  class_id: null,
  section_id: null,
  expires_at: "",
};

const formatDate = (date: string | null) => {
  if (!date) return "No expiry";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const isExpired = (date: string | null) => {
  if (!date) return false;

  return new Date(date).getTime() < Date.now();
};

export default function TeacherAnnouncements() {
  const [announcements, setAnnouncements] = useState<
    Announcement[]
  >([]);

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [sections, setSections] = useState<Section[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [audienceFilter, setAudienceFilter] =
    useState("ALL");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(
    null
  );

  const [form, setForm] =
    useState<AnnouncementForm>(emptyForm);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        announcementsData,
        classesData,
        sectionsData,
      ] = await Promise.all([
        getAnnouncements(),
        getClasses(),
        getSections(),
      ]);

      setAnnouncements(announcementsData);
      setClasses(classesData);
      setSections(sectionsData);
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "Failed to load announcements."
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredSections = useMemo(() => {
    if (!form.class_id) return [];

    return sections.filter(
      (section) => section.class_id === form.class_id
    );
  }, [sections, form.class_id]);

  const filteredAnnouncements = useMemo(() => {
    const query = search.trim().toLowerCase();

    return announcements.filter((announcement) => {
      if (
        audienceFilter !== "ALL" &&
        announcement.audience !== audienceFilter
      ) {
        return false;
      }

      if (!query) return true;

      const className =
        classes.find(
          (item) => item.id === announcement.class_id
        )?.name ?? "";

      const sectionName =
        sections.find(
          (item) => item.id === announcement.section_id
        )?.name ?? "";

      const searchableText = [
        announcement.title,
        announcement.description,
        announcement.audience,
        className,
        sectionName,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [
    announcements,
    classes,
    sections,
    search,
    audienceFilter,
  ]);

  const stats = useMemo(() => {
    const total = announcements.length;

    const active = announcements.filter(
      (announcement) => !isExpired(announcement.expires_at)
    ).length;

    const expired = total - active;

    const classTargeted = announcements.filter(
      (announcement) =>
        announcement.class_id !== null
    ).length;

    return {
      total,
      active,
      expired,
      classTargeted,
    };
  }, [announcements]);

  const getTargetText = (
    announcement: Announcement
  ) => {
    if (announcement.audience === "ALL") {
      return "Everyone";
    }

    const className =
      classes.find(
        (item) => item.id === announcement.class_id
      )?.name ?? "Class";

    const sectionName =
      sections.find(
        (item) => item.id === announcement.section_id
      )?.name;

    if (sectionName) {
      return `${className} - ${sectionName}`;
    }

    return className;
  };

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setShowModal(true);
  };

  const openEditModal = (
    announcement: Announcement
  ) => {
    setEditingId(announcement.id);

    setForm({
      title: announcement.title,
      description: announcement.description,
      audience: announcement.audience,
      class_id: announcement.class_id,
      section_id: announcement.section_id,
      expires_at: announcement.expires_at
        ? announcement.expires_at.slice(0, 16)
        : "",
    });

    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleAudienceChange = (
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      audience: value,
      class_id:
        value === "ALL" ? null : previous.class_id,
      section_id:
        value === "ALL" ? null : previous.section_id,
    }));
  };

  const handleClassChange = (
    value: string
  ) => {
    const classId =
      value === "" ? null : Number(value);

    setForm((previous) => ({
      ...previous,
      class_id: classId,
      section_id: null,
    }));
  };

  const handleSave = async () => {
    try {
      setError("");

      if (!form.title.trim()) {
        setError("Please enter an announcement title.");
        return;
      }

      if (!form.description.trim()) {
        setError(
          "Please enter an announcement description."
        );
        return;
      }

      if (form.audience !== "ALL" && !form.class_id) {
        setError(
          "Please select a class for targeted announcements."
        );
        return;
      }

      setSaving(true);

      const payload: CreateAnnouncement = {
        title: form.title.trim(),
        description: form.description.trim(),
        audience: form.audience,
        class_id: form.class_id,
        section_id: form.section_id,
        expires_at: form.expires_at
          ? new Date(form.expires_at).toISOString()
          : null,
      };

      if (editingId) {
        const updated = await updateAnnouncement(
          editingId,
          payload
        );

        setAnnouncements((previous) =>
          previous.map((announcement) =>
            announcement.id === editingId
              ? updated
              : announcement
          )
        );
      } else {
        const created =
          await createAnnouncement(payload);

        setAnnouncements((previous) => [
          created,
          ...previous,
        ]);
      }

      closeModal();
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "Failed to save announcement."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (
    id: number
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this announcement?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteAnnouncement(id);

      setAnnouncements((previous) =>
        previous.filter(
          (announcement) => announcement.id !== id
        )
      );
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "Failed to delete announcement."
      );
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading announcements...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
            <Bell className="h-4 w-4" />
            <span>Teacher Panel</span>
            <span>/</span>
            <span>Announcements</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900">
            Announcements
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Create and manage announcements for students
            and parents.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          New Announcement
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Total
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {stats.total}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Active
          </p>

          <p className="mt-2 text-3xl font-bold text-emerald-600">
            {stats.active}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Expired
          </p>

          <p className="mt-2 text-3xl font-bold text-red-600">
            {stats.expired}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Class Targeted
          </p>

          <p className="mt-2 text-3xl font-bold text-blue-600">
            {stats.classTargeted}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Search
            </label>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search announcements..."
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Audience
            </label>

            <select
              value={audienceFilter}
              onChange={(event) =>
                setAudienceFilter(
                  event.target.value
                )
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="ALL">
                All Audiences
              </option>
              <option value="STUDENTS">
                Students
              </option>
              <option value="PARENTS">
                Parents
              </option>
              <option value="TEACHERS">
                Teachers
              </option>
              <option value="ALL">
                Everyone
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Announcement list */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-900">
            Announcement List
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {filteredAnnouncements.length} announcement
            {filteredAnnouncements.length !== 1
              ? "s"
              : ""}
          </p>
        </div>

        {filteredAnnouncements.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
            <Bell className="h-12 w-12 text-slate-300" />

            <h3 className="mt-4 text-lg font-semibold text-slate-800">
              No announcements found
            </h3>

            <p className="mt-1 max-w-md text-sm text-slate-500">
              There are no announcements matching your
              current filters.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredAnnouncements.map(
              (announcement) => {
                const expired = isExpired(
                  announcement.expires_at
                );

                return (
                  <div
                    key={announcement.id}
                    className="p-5 transition hover:bg-slate-50"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-semibold text-slate-900">
                            {announcement.title}
                          </h3>

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              expired
                                ? "bg-red-50 text-red-700"
                                : "bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {expired
                              ? "Expired"
                              : "Active"}
                          </span>
                        </div>

                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                          {announcement.description}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                            {announcement.audience}
                          </span>

                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                            Target:{" "}
                            {getTargetText(
                              announcement
                            )}
                          </span>

                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                            Expires:{" "}
                            {formatDate(
                              announcement.expires_at
                            )}
                          </span>

                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                            Created:{" "}
                            {formatDate(
                              announcement.created_at
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 gap-2">
                        <button
                          onClick={() =>
                            openEditModal(
                              announcement
                            )
                          }
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                          title="Edit announcement"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(
                              announcement.id
                            )
                          }
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                          title="Delete announcement"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingId
                    ? "Edit Announcement"
                    : "New Announcement"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Create an announcement and choose who
                  should receive it.
                </p>
              </div>

              <button
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 p-6">
              {error && (
                <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Title *
                </label>

                <input
                  type="text"
                  value={form.title}
                  disabled={saving}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      title: event.target.value,
                    }))
                  }
                  placeholder="Enter announcement title"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Description *
                </label>

                <textarea
                  rows={5}
                  value={form.description}
                  disabled={saving}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      description:
                        event.target.value,
                    }))
                  }
                  placeholder="Write your announcement..."
                  className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                />
              </div>

              {/* Audience */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Audience *
                </label>

                <select
                  value={form.audience}
                  disabled={saving}
                  onChange={(event) =>
                    handleAudienceChange(
                      event.target.value
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                >
                  <option value="ALL">
                    Everyone
                  </option>

                  <option value="STUDENTS">
                    Students
                  </option>

                  <option value="PARENTS">
                    Parents
                  </option>

                  <option value="TEACHERS">
                    Teachers
                  </option>
                </select>
              </div>

              {/* Class + Section */}
              {form.audience !== "ALL" && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Class
                    </label>

                    <select
                      value={form.class_id ?? ""}
                      disabled={saving}
                      onChange={(event) =>
                        handleClassChange(
                          event.target.value
                        )
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                    >
                      <option value="">
                        Select class
                      </option>

                      {classes.map((schoolClass) => (
                        <option
                          key={schoolClass.id}
                          value={schoolClass.id}
                        >
                          {schoolClass.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Section
                    </label>

                    <select
                      value={form.section_id ?? ""}
                      disabled={
                        saving || !form.class_id
                      }
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          section_id:
                            event.target.value === ""
                              ? null
                              : Number(
                                  event.target.value
                                ),
                        }))
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                    >
                      <option value="">
                        All sections
                      </option>

                      {filteredSections.map(
                        (section) => (
                          <option
                            key={section.id}
                            value={section.id}
                          >
                            {section.name}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>
              )}

              {/* Expiry */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Expiry Date & Time
                </label>

                <input
                  type="datetime-local"
                  value={form.expires_at}
                  disabled={saving}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      expires_at:
                        event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                />

                <p className="mt-1 text-xs text-slate-500">
                  Leave empty if the announcement should not
                  expire.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}

                {editingId
                  ? "Update Announcement"
                  : "Create Announcement"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}