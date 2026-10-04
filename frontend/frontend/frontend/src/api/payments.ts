import api from "./axios";
export interface Payment { id:number; student_fee_id:number; amount:number; paid_at:string; method:string; receipt_no:string; recorded_by:number; }
export interface CreatePayment { student_fee_id:number; amount:number; method:string; receipt_no:string; }
export const getPayments=async():Promise<Payment[]> => (await api.get("/payments")).data;
export const createPayment=async(data:CreatePayment):Promise<Payment> => (await api.post("/payments",data)).data;
export const deletePayment=async(id:number)=>{await api.delete(`/payments/${id}`);};
