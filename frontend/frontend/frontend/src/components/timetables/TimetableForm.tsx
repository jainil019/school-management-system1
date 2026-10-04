import { useEffect,useState } from "react";
import type { FormEvent } from "react";
import { createTimetable } from "../../api/timetables";
import { getAcademicYears,getClasses,getSections,getSubjects,getTeachers,type AcademicYear,type ClassItem,type SectionItem,type SubjectLookup,type TeacherLookup } from "../../api/lookups";
import ModuleModal from "../common/ModuleModal";
import { ErrorBox,Field,inputClass,PrimaryButton } from "../common/ModuleUi";

export default function TimetableForm({onClose,onSuccess}:{onClose:()=>void;onSuccess:()=>void}){
 const [years,setYears]=useState<AcademicYear[]>([]),[classes,setClasses]=useState<ClassItem[]>([]),[sections,setSections]=useState<SectionItem[]>([]),[subjects,setSubjects]=useState<SubjectLookup[]>([]),[teachers,setTeachers]=useState<TeacherLookup[]>([]);
 const [yearId,setYearId]=useState(""),[classId,setClassId]=useState(""),[sectionId,setSectionId]=useState(""),[subjectId,setSubjectId]=useState(""),[teacherId,setTeacherId]=useState(""),[day,setDay]=useState("MONDAY"),[start,setStart]=useState("09:00"),[end,setEnd]=useState("10:00"),[room,setRoom]=useState(""),[error,setError]=useState(""),[saving,setSaving]=useState(false);
 useEffect(()=>{void Promise.all([getAcademicYears(),getClasses(),getSections(),getSubjects(),getTeachers()]).then(([y,c,s,sub,t])=>{setYears(y);setClasses(c);setSections(s);setSubjects(sub);setTeachers(t);}).catch((e:any)=>setError(e?.response?.data?.detail??"Unable to load options."));},[]);
 const visibleClasses=classes.filter(c=>!yearId||c.academic_year_id===Number(yearId));const visibleSections=sections.filter(s=>!classId||s.class_id===Number(classId));useEffect(()=>{if(!visibleClasses.some(c=>String(c.id)===classId))setClassId("");},[yearId]);useEffect(()=>{if(!visibleSections.some(s=>String(s.id)===sectionId))setSectionId("");},[classId]);
 const submit=async(e:FormEvent)=>{e.preventDefault();setError("");if(!yearId||!classId||!sectionId||!subjectId||!teacherId||!start||!end)return setError("All required fields must be selected.");if(start>=end)return setError("End time must be after start time.");try{setSaving(true);await createTimetable({academic_year_id:Number(yearId),class_id:Number(classId),section_id:Number(sectionId),subject_id:Number(subjectId),teacher_id:Number(teacherId),day_of_week:day,start_time:start,end_time:end,room:room.trim()||null});onSuccess();onClose();}catch(err:any){setError(err?.response?.data?.detail??"Unable to create timetable.");}finally{setSaving(false);}};
 return <ModuleModal title="Create Timetable Entry" onClose={onClose}><form onSubmit={submit} className="space-y-5">{error&&<ErrorBox message={error}/>}<div className="grid gap-4 sm:grid-cols-2">
 <Field label="Academic Year" required><select className={inputClass} value={yearId} onChange={e=>setYearId(e.target.value)}><option value="">Select year</option>{years.map(y=><option key={y.id} value={y.id}>{y.name}</option>)}</select></Field>
 <Field label="Class" required><select className={inputClass} value={classId} onChange={e=>setClassId(e.target.value)}><option value="">Select class</option>{visibleClasses.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
 <Field label="Section" required><select className={inputClass} value={sectionId} onChange={e=>setSectionId(e.target.value)}><option value="">Select section</option>{visibleSections.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></Field>
 <Field label="Subject" required><select className={inputClass} value={subjectId} onChange={e=>setSubjectId(e.target.value)}><option value="">Select subject</option>{subjects.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></Field>
 <Field label="Teacher" required><select className={inputClass} value={teacherId} onChange={e=>setTeacherId(e.target.value)}><option value="">Select teacher</option>{teachers.map(t=><option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>)}</select></Field>
 <Field label="Day" required><select className={inputClass} value={day} onChange={e=>setDay(e.target.value)}>{["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY","SUNDAY"].map(d=><option key={d}>{d}</option>)}</select></Field>
 <Field label="Start Time" required><input type="time" className={inputClass} value={start} onChange={e=>setStart(e.target.value)}/></Field>
 <Field label="End Time" required><input type="time" className={inputClass} value={end} onChange={e=>setEnd(e.target.value)}/></Field>
 <Field label="Room"><input className={inputClass} value={room} onChange={e=>setRoom(e.target.value)} placeholder="Room 101"/></Field>
 </div><div className="flex justify-end gap-3 border-t pt-5"><button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 hover:bg-slate-100">Cancel</button><PrimaryButton type="submit" disabled={saving}>{saving?"Saving...":"Create Entry"}</PrimaryButton></div></form></ModuleModal>;
}
