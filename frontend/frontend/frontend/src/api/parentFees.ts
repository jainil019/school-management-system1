import api from "./axios";

export interface ParentFee {
  student_fee_id: number;
  student_id: number;
  fee_structure_id: number;
  fee_type: string;
  amount_due: number;
  amount_paid: number;
  amount_pending: number;
  status: string;
  due_date: string;
  created_at: string;
}

export interface ParentPayment {
  payment_id: number;
  student_fee_id: number;
  amount: number;
  paid_at: string;
  method: string;
  receipt_no: string;
}

export const getChildFees = async (
  studentId: number
): Promise<ParentFee[]> => {
  const response = await api.get<ParentFee[]>(
    `/student-fees/parent/${studentId}`
  );

  return response.data;
};

export const getChildPayments = async (
  studentId: number
): Promise<ParentPayment[]> => {
  const response = await api.get<ParentPayment[]>(
    `/payments/parent/${studentId}`
  );

  return response.data;
};