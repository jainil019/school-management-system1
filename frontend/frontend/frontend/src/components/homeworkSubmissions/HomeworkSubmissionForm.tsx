import { useEffect,useState } from "react";
import type { FormEvent } from "react";
import { createHomeworkSubmission } from "../../api/homeworkSubmissions";
import { getHomework,type Homework as HomeworkItem } from "../../api/homework";
import { getStudents as getStudentLookup,type StudentLookup } from "../../api/lookups";
import ModuleModal from "../common/ModuleModal";
import { ErrorBox,Field,inputClass,PrimaryButton } from "../common/ModuleUi";

export default function HomeworkSubmissionForm({onClose,onSuccess}:{onClose:()=>void;onSuccess:()=>void}){
 const [homework,setHomework]=useState<HomeworkItem[]>([]),[students,setStudents]=useState<StudentLookup[]>([]),[homeworkId,setHomeworkId]=useState(""),[studentId,setStudentId]=useState(""),[fileUrl,setFileUrl]=useState(""),[error,setError]=useState(""),[saving,setSaving]=useState(false);
 useEffect(()=>{void Promise.all([getHomework(),getStudentLookup()]).then(([h,s])=>{setHomework(h);setStudents(s);}).catch((e:any)=>setError(e?.response?.data?.detail??"Unable to load options."));},[]);
 const submit=async(e:FormEvent)=>{e.preventDefault();setError("");if(!homeworkId||!studentId)return setError("Homework and student are required.");try{setSaving(true);await createHomeworkSubmission({homework_id:Number(homeworkId),student_id:Number(studentId),file_url:fileUrl.trim()||null});onSuccess();onClose();}catch(err:any){setError(err?.response?.data?.detail??"Unable to submit homework.");}finally{setSaving(false);}};
 return <ModuleModal title="Add Homework Submission" onClose={onClose}><form onSubmit={submit} className="space-y-5">{error&&<ErrorBox message={error}/>}<Field label="Homework" required><select className={inputClass} value={homeworkId} onChange={e=>setHomeworkId(e.target.value)}><option value="">Select homework</option>{homework.map(h=><option key={h.id} value={h.id}>{h.title} — {h.due_date}</option>)}</select></Field><Field label="Student" required><select className={inputClass} value={studentId} onChange={e=>setStudentId(e.target.value)}><option value="">Select student</option>{students.map(s=><option key={s.id} value={s.id}>{s.first_name} {s.last_name} — {s.admission_no}</option>)}</select></Field><Field label="File URL"><input className={inputClass} value={fileUrl} onChange={e=>setFileUrl(e.target.value)} placeholder="https://..."/></Field><div className="flex justify-end gap-3 border-t pt-5"><button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 hover:bg-slate-100">Cancel</button><PrimaryButton type="submit" disabled={saving}>{saving?"Saving...":"Submit"}</PrimaryButton></div></form></ModuleModal>;
}
