import api from "./axios";
export interface Mark { id:number; exam_subject_id:number; student_id:number; marks_obtained:number; grade:string|null; remarks:string|null; }
export interface CreateMark { exam_subject_id:number; student_id:number; marks_obtained:number; grade?:string|null; remarks?:string|null; }
export const getMarks=async():Promise<Mark[]> => (await api.get("/marks")).data;
export const createMark=async(data:CreateMark):Promise<Mark> => (await api.post("/marks",data)).data;
export const updateMark=async(id:number,data:Omit<CreateMark,"exam_subject_id"|"student_id">):Promise<Mark> => (await api.put(`/marks/${id}`,data)).data;
export const deleteMark=async(id:number)=>{await api.delete(`/marks/${id}`);};
