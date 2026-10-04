import api from "./axios";
export interface Timetable { id:number; academic_year_id:number; class_id:number; section_id:number; subject_id:number; teacher_id:number; day_of_week:string; start_time:string; end_time:string; room:string|null; }
export interface CreateTimetable { academic_year_id:number; class_id:number; section_id:number; subject_id:number; teacher_id:number; day_of_week:string; start_time:string; end_time:string; room?:string|null; }
export interface UpdateTimetable { day_of_week:string; start_time:string; end_time:string; room?:string|null; }
export const getTimetables=async():Promise<Timetable[]> => (await api.get("/timetables")).data;
export const createTimetable=async(data:CreateTimetable):Promise<Timetable> => (await api.post("/timetables",data)).data;
export const updateTimetable=async(id:number,data:UpdateTimetable):Promise<Timetable> => (await api.put(`/timetables/${id}`,data)).data;
export const deleteTimetable=async(id:number)=>{await api.delete(`/timetables/${id}`);};
