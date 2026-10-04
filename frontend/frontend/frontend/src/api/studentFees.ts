import api from "./axios";
export interface StudentFee { id:number; student_id:number; fee_structure_id:number; amount_due:number; amount_paid:number; status:string; created_at:string; }
export interface CreateStudentFee { student_id:number; fee_structure_id:number; }
export const getStudentFees=async():Promise<StudentFee[]> => (await api.get("/student-fees")).data;
export const createStudentFee=async(data:CreateStudentFee):Promise<StudentFee> => (await api.post("/student-fees",data)).data;
export const updateStudentFee=async(id:number,status:string):Promise<StudentFee> => (await api.put(`/student-fees/${id}`,{status})).data;
export const deleteStudentFee=async(id:number)=>{await api.delete(`/student-fees/${id}`);};
