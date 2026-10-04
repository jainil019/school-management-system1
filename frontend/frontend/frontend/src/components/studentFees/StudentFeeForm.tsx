import { useEffect,useState } from "react";
import type { FormEvent } from "react";
import { createStudentFee } from "../../api/studentFees";
import { getFeeStructures,type FeeStructure } from "../../api/feeStructures";
import { getStudents,type StudentLookup } from "../../api/lookups";
import ModuleModal from "../common/ModuleModal";
import { ErrorBox,Field,inputClass,PrimaryButton } from "../common/ModuleUi";

export default function StudentFeeForm({onClose,onSuccess}:{onClose:()=>void;onSuccess:()=>void}){
 const [students,setStudents]=useState<StudentLookup[]>([]),[fees,setFees]=useState<FeeStructure[]>([]),[studentId,setStudentId]=useState(""),[feeId,setFeeId]=useState(""),[error,setError]=useState(""),[saving,setSaving]=useState(false);
 useEffect(()=>{void Promise.all([getStudents(),getFeeStructures()]).then(([s,f])=>{setStudents(s);setFees(f);}).catch((e:any)=>setError(e?.response?.data?.detail??"Unable to load options."));},[]);
 const submit=async(e:FormEvent)=>{e.preventDefault();setError("");if(!studentId||!feeId)return setError("Student and fee structure are required.");try{setSaving(true);await createStudentFee({student_id:Number(studentId),fee_structure_id:Number(feeId)});onSuccess();onClose();}catch(err:any){setError(err?.response?.data?.detail??"Unable to assign fee.");}finally{setSaving(false);}};
 return <ModuleModal title="Assign Fee to Student" onClose={onClose}><form onSubmit={submit} className="space-y-5">{error&&<ErrorBox message={error}/>}<Field label="Student" required><select className={inputClass} value={studentId} onChange={e=>setStudentId(e.target.value)}><option value="">Select student</option>{students.map(s=><option key={s.id} value={s.id}>{s.first_name} {s.last_name} — {s.admission_no}</option>)}</select></Field><Field label="Fee Structure" required><select className={inputClass} value={feeId} onChange={e=>setFeeId(e.target.value)}><option value="">Select fee</option>{fees.map(f=><option key={f.id} value={f.id}>{f.fee_type} — ₹{Number(f.amount).toLocaleString()} — Due {f.due_date}</option>)}</select></Field><div className="flex justify-end gap-3 border-t pt-5"><button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 hover:bg-slate-100">Cancel</button><PrimaryButton type="submit" disabled={saving}>{saving?"Saving...":"Assign Fee"}</PrimaryButton></div></form></ModuleModal>;
}
