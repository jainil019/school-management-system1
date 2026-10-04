import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import {
  createExamination,
  updateExamination,
  type Examination,
} from "../../api/examinations";

import {
  getAcademicYears,
  type AcademicYear,
} from "../../api/lookups";

import ModuleModal from "../common/ModuleModal";
import {
  ErrorBox,
  Field,
  inputClass,
  PrimaryButton,
} from "../common/ModuleUi";

interface ExaminationFormProps {
  examination?: Examination | null;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
}

export default function ExaminationForm({
  examination,
  onClose,
  onSuccess,
}: ExaminationFormProps) {
  const isEdit = Boolean(examination);

  const [years, setYears] = useState<AcademicYear[]>([]);
  const [name, setName] = useState("");
  const [yearId, setYearId] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [status, setStatus] = useState("UPCOMING");

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void getAcademicYears()
      .then(setYears)
      .catch((e: any) =>
        setError(
          e?.response?.data?.detail ??
            "Unable to load academic years."
        )
      );
  }, []);

  useEffect(() => {
    if (!examination) {
      setName("");
      setYearId("");
      setStart("");
      setEnd("");
      setStatus("UPCOMING");
      return;
    }

    setName(examination.name);
    setYearId(String(examination.academic_year_id));
    setStart(examination.start_date);
    setEnd(examination.end_date);
    setStatus(examination.status);
  }, [examination]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();

    setError("");

    if (!name.trim() || !yearId || !start || !end) {
      setError("All fields are required.");
      return;
    }

    if (end < start) {
      setError("End date cannot be before start date.");
      return;
    }

    try {
      setSaving(true);

      const data = {
        name: name.trim(),
        academic_year_id: Number(yearId),
        start_date: start,
        end_date: end,
        status,
      };

      if (examination) {
        await updateExamination(examination.id, data);
      } else {
        await createExamination(data);
      }

      await onSuccess();
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ??
          `Unable to ${isEdit ? "update" : "create"} examination.`
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModuleModal
      title={isEdit ? "Edit Examination" : "Create Examination"}
      onClose={onClose}
    >
      <form onSubmit={submit} className="space-y-5">
        {error && <ErrorBox message={error} />}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Examination Name" required>
            <input
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Mid Term Examination"
            />
          </Field>

          <Field label="Academic Year" required>
            <select
              className={inputClass}
              value={yearId}
              onChange={(e) => setYearId(e.target.value)}
            >
              <option value="">Select year</option>

              {years.map((year) => (
                <option key={year.id} value={year.id}>
                  {year.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Start Date" required>
            <input
              type="date"
              className={inputClass}
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </Field>

          <Field label="End Date" required>
            <input
              type="date"
              className={inputClass}
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </Field>

          <Field label="Status" required>
            <select
              className={inputClass}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {["UPCOMING", "ONGOING", "COMPLETED"].map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="flex justify-end gap-3 border-t pt-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 hover:bg-slate-100"
          >
            Cancel
          </button>

          <PrimaryButton type="submit" disabled={saving}>
            {saving
              ? "Saving..."
              : isEdit
                ? "Update Examination"
                : "Create Examination"}
          </PrimaryButton>
        </div>
      </form>
    </ModuleModal>
  );
}