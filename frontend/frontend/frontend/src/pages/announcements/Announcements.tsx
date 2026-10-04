import { useEffect, useMemo, useState } from "react";

import {
  deleteAnnouncement,
  getAnnouncements,
  type Announcement,
} from "../../api/announcements";

import {
  getClasses,
  getSections,
  type ClassItem,
  type SectionItem,
} from "../../api/lookups";

import AnnouncementForm from "../../components/announcements/AnnouncementForm";

import {
  DangerButton,
  EmptyState,
  PageHeader,
  PrimaryButton,
} from "../../components/common/ModuleUi";

export default function Announcements() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [sections, setSections] = useState<SectionItem[]>([]);

  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] =
    useState<Announcement | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");

      const [announcementData, classData, sectionData] =
        await Promise.all([
          getAnnouncements(),
          getClasses(),
          getSections(),
        ]);

      setItems(announcementData);
      setClasses(classData);
      setSections(sectionData);
    } catch (e: any) {
      setError(
        e?.response?.data?.detail ||
          "Unable to load announcements."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const getClassName = (id: number | null) => {
    if (id === null) return "All Classes";

    return (
      classes.find((item) => item.id === id)?.name ||
      `Class #${id}`
    );
  };

  const getSectionName = (id: number | null) => {
    if (id === null) return "All Sections";

    return (
      sections.find((item) => item.id === id)?.name ||
      `Section #${id}`
    );
  };

  const filtered = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return items;

    return items.filter((item) => {
      const text = [
        item.title,
        item.description,
        item.audience,
        getClassName(item.class_id),
        getSectionName(item.section_id),
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(value);
    });
  }, [items, classes, sections, search]);

  const openCreate = () => {
    setEditingAnnouncement(null);
    setShowForm(true);
  };

  const openEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingAnnouncement(null);
  };

  const remove = async (id: number) => {
    if (!window.confirm("Delete this announcement?")) {
      return;
    }

    try {
      setError("");

      await deleteAnnouncement(id);

      await load();
    } catch (e: any) {
      setError(
        e?.response?.data?.detail ||
          "Unable to delete announcement."
      );
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        title="Announcements"
        description="Publish school announcements to supported audiences."
        action={
          <PrimaryButton onClick={openCreate}>
            + Create Announcement
          </PrimaryButton>
        }
      />

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          className="w-full max-w-lg rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          placeholder="Search announcements..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button
          type="button"
          onClick={() => void load()}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Loading announcements...
          </div>
        ) : !filtered.length ? (
          <EmptyState message="No active announcements found." />
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-4 p-5 lg:flex-row lg:items-start lg:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-900">
                      {item.title}
                    </h3>

                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                      {item.audience}
                    </span>
                  </div>

                  <p className="text-sm leading-6 text-slate-600">
                    {item.description}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-slate-600">
                      {getClassName(item.class_id)}
                    </span>

                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-slate-600">
                      {getSectionName(item.section_id)}
                    </span>

                    {item.expires_at && (
                      <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-amber-700">
                        Expires:{" "}
                        {new Date(
                          item.expires_at
                        ).toLocaleString()}
                      </span>
                    )}
                  </div>

                  <p className="mt-3 text-xs text-slate-400">
                    Created{" "}
                    {new Date(
                      item.created_at
                    ).toLocaleString()}
                  </p>
                </div>

                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(item)}
                    className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
                  >
                    Edit
                  </button>

                  <DangerButton
                    onClick={() => void remove(item.id)}
                  >
                    Delete
                  </DangerButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <AnnouncementForm
          announcement={editingAnnouncement}
          onClose={closeForm}
          onSuccess={async () => {
            closeForm();
            await load();
          }}
        />
      )}
    </div>
  );
}