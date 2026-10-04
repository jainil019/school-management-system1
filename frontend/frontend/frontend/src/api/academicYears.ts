import api from "./axios";
export interface AcademicYear { id:number; name:string; start_date:string; end_date:string; is_current:boolean; }
export const getAcademicYears=async():Promise<AcademicYear[]> => (await api.get("/academic-years")).data;
export const createAcademicYear=async(data:{name:string;start_date:string;end_date:string;is_current?:boolean}):Promise<AcademicYear> => (await api.post("/academic-years",data)).data;
