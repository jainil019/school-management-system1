import api from "./axios";

export interface Student {
  id: number;
  user_id: number;
  admission_no: string;
  first_name: string;
  last_name: string;
  dob?: string | null;
  gender?: string | null;
  phone?: string | null;
  address?: string | null;
  admission_date?: string | null;
  photo_url?: string | null;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export const getMyStudentProfile = async (): Promise<Student> => {
  const response = await api.get<Student>("/students/me");
  return response.data;
};