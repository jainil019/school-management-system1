import api from "./axios";
export interface Examination { id:number; name:string; academic_year_id:number; start_date:string; end_date:string; status:string; }
export interface CreateExamination { name:string; academic_year_id:number; start_date:string; end_date:string; status:string; }
export const getExaminations=async():Promise<Examination[]> => (await api.get("/examinations")).data;
export const createExamination=async(data:CreateExamination):Promise<Examination> => (await api.post("/examinations",data)).data;
export const updateExamination=async(id:number,data:CreateExamination):Promise<Examination> => (await api.put(`/examinations/${id}`,data)).data;
export const deleteExamination=async(id:number)=>{await api.delete(`/examinations/${id}`);};
