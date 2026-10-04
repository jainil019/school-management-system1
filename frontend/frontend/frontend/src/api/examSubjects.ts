import api from "./axios";
export interface ExamSubject { id:number; examination_id:number; class_id:number; subject_id:number; max_marks:number; passing_marks:number; exam_date:string; }
export interface CreateExamSubject { examination_id:number; class_id:number; subject_id:number; max_marks:number; passing_marks:number; exam_date:string; }
export const getExamSubjects=async():Promise<ExamSubject[]> => (await api.get("/exam-subjects")).data;
export const createExamSubject=async(data:CreateExamSubject):Promise<ExamSubject> => (await api.post("/exam-subjects",data)).data;
export const updateExamSubject=async(id:number,data:Omit<CreateExamSubject,"examination_id"|"class_id"|"subject_id">):Promise<ExamSubject> => (await api.put(`/exam-subjects/${id}`,data)).data;
export const deleteExamSubject=async(id:number)=>{await api.delete(`/exam-subjects/${id}`);};
