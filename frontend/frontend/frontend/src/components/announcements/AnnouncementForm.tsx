import { useEffect, useState } from "react";

import {
  createAnnouncement,
  updateAnnouncement,
  type Announcement,
  type CreateAnnouncement,
} from "../../api/announcements";

import {
  getClasses,
  getSections,
  type ClassItem,
  type SectionItem,
} from "../../api/lookups";

interface Props {
  announcement?: Announcement | null;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
}

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

export default function AnnouncementForm({
  announcement,
  onClose,
  onSuccess,
}: Props) {
  const isEdit = Boolean(announcement);

  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [sections, setSections] = useState<SectionItem[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [audience, setAudience] = useState("ALL");
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadLookups = async () => {
      try {
        const [classData, sectionData] = await Promise.all([
          getClasses(),
          getSections(),
        ]);

        setClasses(classData);
        setSections(sectionData);
      } catch (e: any) {
        setError(
          e?.response?.data?.detail ||
            "Unable to load classes and sections."
        );
      }
    };

    void loadLookups();
  }, []);

  useEffect(() => {
    if (!announcement) {
      setTitle("");
      setDescription("");
      setAudience("ALL");
      setClassId("");
      setSectionId("");
      setExpiresAt("");
      return;
    }

    setTitle(announcement.title);
    setDescription(announcement.description || "");
    setAudience(announcement.audience);
    setClassId(
      announcement.class_id
        ? String(announcement.class_id)
        : ""
    );
    setSectionId(
      announcement.section_id
        ? String(announcement.section_id)
        : ""
    );

    if (announcement.expires_at) {
      const date = new Date(announcement.expires_at);

      const localValue = new Date(
        date.getTime() -
          date.getTimezoneOffset() * 60000
      )
        .toISOString()
        .slice(0, 16);

      setExpiresAt(localValue);
    } else {
      setExpiresAt("");
    }
  }, [announcement]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    if (!description.trim()) {
      setError("Description is required.");
      return;
    }

    if (
      (audience === "CLASS" || audience === "SECTION") &&
      !classId
    ) {
      setError("Please select a class.");
      return;
    }

    if (audience === "SECTION" && !sectionId) {
      setError("Please select a section.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data: CreateAnnouncement = {
        title: title.trim(),
        description: description.trim(),
        audience,
        class_id: classId
          ? Number(classId)
          : null,
        section_id: sectionId
          ? Number(sectionId)
          : null,
        expires_at: expiresAt
          ? new Date(expiresAt).toISOString()
          : null,
      };

      if (announcement) {
        await updateAnnouncement(
          announcement.id,
          data
        );
      } else {
        await createAnnouncement(data);
      }

      await onSuccess();
    } catch (e: any) {
      setError(
        e?.response?.data?.detail ||
          "Unable to save announcement."
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredSections = classId
    ? sections.filter(
        (section) =>
          section.class_id === Number(classId)
      )
    : [];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-xl font-bold text-slate-900">
            {isEdit
              ? "Edit Announcement"
              : "Create Announcement"}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {isEdit
              ? "Update the announcement details."
              : "Create a new school announcement."}
          </p>
        </div>

        <form
          onSubmit={submit}
          className="space-y-5 p-6"
        >
          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Title
            </label>

            <input
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              placeholder="Enter announcement title"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              placeholder="Enter announcement details"
              rows={5}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Audience
            </label>

            <select
              value={audience}
              onChange={(e) => {
                setAudience(e.target.value);

                if (
                  e.target.value !== "CLASS" &&
                  e.target.value !== "SECTION"
                ) {
                  setClassId("");
                  setSectionId("");
                }

                if (e.target.value !== "SECTION") {
                  setSectionId("");
                }
              }}
              className={inputClass}
            >
              <option value="ALL">Everyone</option>
              <option value="STUDENT">Students</option>
              <option value="PARENT">Parents</option>
              <option value="TEACHER">Teachers</option>
              <option value="CLASS">Specific Class</option>
              <option value="SECTION">Specific Section</option>
            </select>
          </div>

          {(audience === "CLASS" ||
            audience === "SECTION") && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Class
              </label>

              <select
                value={classId}
                onChange={(e) => {
                  setClassId(e.target.value);
                  setSectionId("");
                }}
                className={inputClass}
              >
                <option value="">
                  Select class
                </option>

                {classes.map((item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {audience === "SECTION" && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Section
              </label>

              <select
                value={sectionId}
                onChange={(e) =>
                  setSectionId(e.target.value)
                }
                disabled={!classId}
                className={`${inputClass} disabled:bg-slate-100`}
              >
                <option value="">
                  Select section
                </option>

                {filteredSections.map((item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Expiry Date & Time
            </label>

            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) =>
                setExpiresAt(e.target.value)
              }
              className={inputClass}
            />

            <p className="mt-1 text-xs text-slate-400">
              Leave empty if the announcement should not expire.
            </p>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : isEdit
                  ? "Update Announcement"
                  : "Create Announcement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}