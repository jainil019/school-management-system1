import { useEffect, useMemo, useState } from "react";
import { deleteClassSubject, getClassSubjects, type ClassSubject } from "../../api/classSubjects";
import { getClasses, getSubjects, type ClassItem, type SubjectLookup } from "../../api/lookups";
import ClassSubjectForm from "../../components/classSubjects/ClassSubjectForm";
import { DangerButton, EmptyState, PageHeader, PrimaryButton } from "../../components/common/ModuleUi";

export default function ClassSubjects() {
  const [items, setItems] = useState<ClassSubject[]>([]); const [classes, setClasses] = useState<ClassItem[]>([]); const [subjects, setSubjects] = useState<SubjectLookup[]>([]);
  const [query, setQuery] = useState(""); const [open, setOpen] = useState(false); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const load = async () => { try { setLoading(true); setError(""); const [a,c,s]=await Promise.all([getClassSubjects(),getClasses(),getSubjects()]); setItems(a); setClasses(c); setSubjects(s); } catch(e:any){setError(e?.response?.data?.detail ?? "Unable to load class subjects.");} finally{setLoading(false);} };
  useEffect(()=>{void load();},[]);
  const className=(id:number)=>classes.find(x=>x.id===id)?.name ?? `Class #${id}`;
  const subjectName=(id:number)=>subjects.find(x=>x.id===id)?.name ?? `Subject #${id}`;
  const filtered=useMemo(()=>items.filter(x=>`${className(x.class_id)} ${subjectName(x.subject_id)}`.toLowerCase().includes(query.toLowerCase())),[items,classes,subjects,query]);
  const remove=async(id:number)=>{if(!window.confirm("Remove this subject from the class?"))return;try{await deleteClassSubject(id);await load();}catch(e:any){setError(e?.response?.data?.detail ?? "Unable to remove assignment.");}};
  return <div className="p-4 sm:p-6"><PageHeader title="Class Subjects" description="Assign subjects to classes." action={<PrimaryButton onClick={()=>setOpen(true)}>+ Assign Subject</PrimaryButton>}/>{error&&<div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}<div className="mb-4"><input className="w-full max-w-md rounded-xl border border-slate-300 px-4 py-2.5 text-sm" placeholder="Search class or subject..." value={query} onChange={e=>setQuery(e.target.value)}/></div><div className="overflow-hidden rounded-2xl border bg-white shadow-sm">{loading?<div className="p-8 text-center text-sm text-slate-500">Loading...</div>:filtered.length===0?<EmptyState message="No class-subject assignments found."/>:<div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-6 py-3">ID</th><th className="px-6 py-3">Class</th><th className="px-6 py-3">Subject</th><th className="px-6 py-3 text-right">Action</th></tr></thead><tbody className="divide-y">{filtered.map(x=><tr key={x.id}><td className="px-6 py-4">{x.id}</td><td className="px-6 py-4 font-medium">{className(x.class_id)}</td><td className="px-6 py-4">{subjectName(x.subject_id)}</td><td className="px-6 py-4 text-right"><DangerButton onClick={()=>void remove(x.id)}>Remove</DangerButton></td></tr>)}</tbody></table></div>}</div>{open&&<ClassSubjectForm onClose={()=>setOpen(false)} onSuccess={load}/>}</div>;
}
