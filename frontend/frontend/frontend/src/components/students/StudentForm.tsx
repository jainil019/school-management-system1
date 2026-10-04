import { useState } from "react";
import type { FormEvent } from "react";
import { CalendarDays, GraduationCap, LockKeyhole, Mail, MapPin, Phone, UserRound, X } from "lucide-react";
import { createStudent, updateStudent, type CreateStudentData, type Student, type UpdateStudentData } from "../../api/students";

interface Props { onClose: () => void; onSuccess: () => void; student?: Student | null; }

const input = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";
const label = "mb-2 block text-sm font-semibold text-slate-700";

function StudentForm({ onClose, onSuccess, student }: Props) {
  const editing = Boolean(student);
  const [form, setForm] = useState<CreateStudentData>({
    email: "", password: "", admission_no: student?.admission_no ?? "", first_name: student?.first_name ?? "", last_name: student?.last_name ?? "",
    dob: student?.dob ?? "", gender: student?.gender ?? "", phone: student?.phone ?? "", address: student?.address ?? "", admission_date: student?.admission_date ?? "", status: student?.status ?? "ACTIVE",
  });
  const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  const set = (name: keyof CreateStudentData, value: string) => setForm((f) => ({ ...f, [name]: value }));
  const apiError = (e: any) => Array.isArray(e.response?.data?.detail) ? e.response.data.detail.map((x: any) => `${x.loc?.at(-1) ?? "Field"}: ${x.msg}`).join(", ") : e.response?.data?.detail || "Unable to save student. Please check the details and try again.";

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setError("");
    if (!form.first_name.trim() || !form.last_name.trim()) return setError("First name and last name are required.");
    if (!form.admission_no.trim()) return setError("Admission number is required.");
    if (!editing && (!form.email.trim() || !form.password)) return setError("Login email and password are required.");
    if (!editing && form.password.length < 8) return setError("Password must be at least 8 characters.");
    try {
      setLoading(true);
      if (editing && student) {
        const { email: _email, password: _password, ...update } = form;
        await updateStudent(student.id, { ...update, admission_no: update.admission_no.trim(), first_name: update.first_name.trim(), last_name: update.last_name.trim(), status: update.status || "ACTIVE" } as UpdateStudentData);
      } else {
        await createStudent({ ...form, email: form.email.trim().toLowerCase(), admission_no: form.admission_no.trim(), first_name: form.first_name.trim(), last_name: form.last_name.trim(), status: "ACTIVE" });
      }
      onSuccess(); onClose();
    } catch (e) { setError(apiError(e)); } finally { setLoading(false); }
  };

  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && !loading && onClose()}>
    <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
      <header className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
        <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><GraduationCap size={22}/></div><div><h2 className="text-xl font-bold text-slate-900">{editing ? "Edit Student" : "Add Student"}</h2><p className="text-sm text-slate-500">{editing ? "Update the student's profile." : "Create the student profile and login account in one step."}</p></div></div>
        <button type="button" onClick={onClose} disabled={loading} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X size={21}/></button>
      </header>
      <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
        <div className="flex-1 space-y-7 overflow-y-auto p-6">
          {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}
          {!editing && <section><h3 className="mb-1 text-sm font-bold uppercase tracking-wide text-slate-700">Login Account</h3><p className="mb-4 text-xs text-slate-400">These credentials are used by the student to sign in.</p><div className="grid gap-5 sm:grid-cols-2 rounded-2xl border border-blue-100 bg-blue-50/50 p-5"><div><label className={label}><Mail size={15} className="mr-1 inline"/> Email <span className="text-red-500">*</span></label><input className={input} type="email" value={form.email} onChange={e=>set("email",e.target.value)} placeholder="student@school.com" required/></div><div><label className={label}><LockKeyhole size={15} className="mr-1 inline"/> Password <span className="text-red-500">*</span></label><input className={input} type="password" value={form.password} onChange={e=>set("password",e.target.value)} placeholder="Minimum 8 characters" required minLength={8}/></div></div></section>}
          <section><h3 className="mb-1 text-sm font-bold uppercase tracking-wide text-slate-700">Student Information</h3><p className="mb-4 text-xs text-slate-400">Basic admission and personal information.</p><div className="grid gap-5 sm:grid-cols-2"><div><label className={label}>Admission Number *</label><input className={input} value={form.admission_no} onChange={e=>set("admission_no",e.target.value)} placeholder="ADM-2026-001" required/></div><div><label className={label}>Admission Date</label><input className={input} type="date" value={form.admission_date ?? ""} onChange={e=>set("admission_date",e.target.value)}/></div><div><label className={label}><UserRound size={15} className="mr-1 inline"/> First Name *</label><input className={input} value={form.first_name} onChange={e=>set("first_name",e.target.value)} required/></div><div><label className={label}>Last Name *</label><input className={input} value={form.last_name} onChange={e=>set("last_name",e.target.value)} required/></div><div><label className={label}><CalendarDays size={15} className="mr-1 inline"/> Date of Birth</label><input className={input} type="date" value={form.dob ?? ""} onChange={e=>set("dob",e.target.value)}/></div><div><label className={label}>Gender</label><select className={input} value={form.gender ?? ""} onChange={e=>set("gender",e.target.value)}><option value="">Select gender</option><option>Male</option><option>Female</option><option>Other</option></select></div></div></section>
          <section><h3 className="mb-1 text-sm font-bold uppercase tracking-wide text-slate-700">Contact Information</h3><p className="mb-4 text-xs text-slate-400">Information used by the school for communication.</p><div className="grid gap-5 sm:grid-cols-2"><div><label className={label}><Phone size={15} className="mr-1 inline"/> Phone</label><input className={input} type="tel" value={form.phone ?? ""} onChange={e=>set("phone",e.target.value)} placeholder="9876543210"/></div><div className="sm:col-span-2"><label className={label}><MapPin size={15} className="mr-1 inline"/> Address</label><textarea className={input} rows={3} value={form.address ?? ""} onChange={e=>set("address",e.target.value)} placeholder="Residential address"/></div></div></section>
        </div>
        <footer className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4"><button type="button" onClick={onClose} disabled={loading} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button><button type="submit" disabled={loading} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-60">{loading ? "Saving..." : editing ? "Save Changes" : "Create Student"}</button></footer>
      </form>
    </div>
  </div>;
}
export default StudentForm;
