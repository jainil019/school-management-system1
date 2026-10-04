import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { createClassSubject } from "../../api/classSubjects";
import { getClasses, getSubjects, type ClassItem, type SubjectLookup } from "../../api/lookups";
import ModuleModal from "../common/ModuleModal";
import { ErrorBox, Field, inputClass, PrimaryButton } from "../common/ModuleUi";

export default function ClassSubjectForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectLookup[]>([]);
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { void Promise.all([getClasses(), getSubjects()]).then(([c, s]) => { setClasses(c); setSubjects(s); }).catch((e) => setError(e?.response?.data?.detail ?? "Unable to load options.")); }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setError("");
    if (!classId || !subjectId) return setError("Class and subject are required.");
    try { setSaving(true); await createClassSubject({ class_id: Number(classId), subject_id: Number(subjectId) }); onSuccess(); onClose(); }
    catch (err: any) { setError(err?.response?.data?.detail ?? "Unable to assign subject."); }
    finally { setSaving(false); }
  };

  return <ModuleModal title="Assign Subject to Class" subtitle="A class can have each subject only once." onClose={onClose}>
    <form onSubmit={submit} className="space-y-5">
      {error && <ErrorBox message={error} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Class" required><select className={inputClass} value={classId} onChange={(e) => setClassId(e.target.value)}><option value="">Select class</option>{classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
        <Field label="Subject" required><select className={inputClass} value={subjectId} onChange={(e) => setSubjectId(e.target.value)}><option value="">Select subject</option>{subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}</select></Field>
      </div>
      <div className="flex justify-end gap-3 border-t pt-5"><button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100">Cancel</button><PrimaryButton type="submit" disabled={saving}>{saving ? "Saving..." : "Assign Subject"}</PrimaryButton></div>
    </form>
  </ModuleModal>;
}
