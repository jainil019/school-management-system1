import api from "./axios";
export interface FeeStructure { id:number; academic_year_id:number; class_id:number; fee_type:string; amount:number; due_date:string; }
export interface CreateFeeStructure { academic_year_id:number; class_id:number; fee_type:string; amount:number; due_date:string; }
export const getFeeStructures=async():Promise<FeeStructure[]> => (await api.get("/fee-structures")).data;
export const createFeeStructure=async(data:CreateFeeStructure):Promise<FeeStructure> => (await api.post("/fee-structures",data)).data;
export const updateFeeStructure=async(id:number,data:Omit<CreateFeeStructure,"academic_year_id"|"class_id">):Promise<FeeStructure> => (await api.put(`/fee-structures/${id}`,data)).data;
export const deleteFeeStructure=async(id:number)=>{await api.delete(`/fee-structures/${id}`);};
