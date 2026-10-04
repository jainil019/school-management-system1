import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import {
  createSubject,
  updateSubject,
  type Subject,
} from "../../api/subjects";

import ModuleModal from "../common/ModuleModal";
import {
  ErrorBox,
  Field,
  inputClass,
  PrimaryButton,
} from "../common/ModuleUi";


interface SubjectFormProps {
  onClose: () => void;
  onSuccess: () => void;
  editingSubject?: Subject | null;
}


export default function SubjectForm({
  onClose,
  onSuccess,
  editingSubject = null,
}: SubjectFormProps) {

  const editing = Boolean(editingSubject);

  const [name, setName] = useState(
    editingSubject?.name ?? ""
  );

  const [code, setCode] = useState(
    editingSubject?.code ?? ""
  );

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);


  useEffect(() => {
    setName(editingSubject?.name ?? "");
    setCode(editingSubject?.code ?? "");
    setError("");
  }, [editingSubject]);


  const submit = async (event: FormEvent) => {
    event.preventDefault();

    setError("");

    if (!name.trim() || !code.trim()) {
      setError(
        "Subject name and code are required."
      );
      return;
    }

    try {
      setSaving(true);

      const data = {
        name: name.trim(),
        code: code.trim().toUpperCase(),
      };

      if (editingSubject) {
        await updateSubject(
          editingSubject.id,
          data
        );
      } else {
        await createSubject(data);
      }

      onSuccess();
      onClose();

    } catch (err: any) {
      setError(
        err?.response?.data?.detail ??
          `Unable to ${
            editing ? "update" : "create"
          } subject.`
      );
    } finally {
      setSaving(false);
    }
  };


  return (
    <ModuleModal
      title={
        editing
          ? "Edit Subject"
          : "Add Subject"
      }
      subtitle={
        editing
          ? "Update the subject information."
          : "Create a subject that can be assigned to classes."
      }
      onClose={onClose}
    >

      <form
        onSubmit={submit}
        className="space-y-5"
      >

        {error && (
          <ErrorBox message={error} />
        )}

        <div className="grid gap-4 sm:grid-cols-2">

          <Field
            label="Subject Name"
            required
          >
            <input
              className={inputClass}
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              placeholder="Mathematics"
            />
          </Field>


          <Field
            label="Subject Code"
            required
          >
            <input
              className={inputClass}
              value={code}
              onChange={(e) =>
                setCode(e.target.value)
              }
              placeholder="MATH"
              maxLength={20}
            />
          </Field>

        </div>


        <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>


          <PrimaryButton
            type="submit"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : editing
              ? "Update Subject"
              : "Create Subject"}
          </PrimaryButton>

        </div>

      </form>

    </ModuleModal>
  );
}