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

export interface CreateStudentData {
  email: string;
  password: string;
  admission_no: string;
  first_name: string;
  last_name: string;
  dob?: string;
  gender?: string;
  phone?: string;
  address?: string;
  admission_date?: string;
  photo_url?: string;
  status?: string;
}

export type UpdateStudentData = Omit<CreateStudentData, "email" | "password">;

export const getStudents = async (): Promise<Student[]> => (await api.get("/students")).data;
export const getStudent = async (id: number): Promise<Student> => (await api.get(`/students/${id}`)).data;
export const createStudent = async (data: CreateStudentData): Promise<Student> => (await api.post("/students/create-account", data)).data;
export const updateStudent = async (id: number, data: UpdateStudentData): Promise<Student> => (await api.put(`/students/${id}`, data)).data;
export const deleteStudent = async (id: number): Promise<void> => { await api.delete(`/students/${id}`); };
