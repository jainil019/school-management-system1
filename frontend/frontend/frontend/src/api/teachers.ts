import api from "./axios";

export interface Teacher {
  id: number;
  user_id: number;
  employee_id: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  address?: string | null;
  dob?: string | null;
  gender?: string | null;
  qualification?: string | null;
  joining_date?: string | null;
  photo_url?: string | null;
  status: string;
}

export interface CreateTeacherData {
  email: string;
  password: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  address?: string;
  dob?: string;
  gender?: string;
  qualification?: string;
  joining_date?: string;
  photo_url?: string;
  status?: string;
}

export type UpdateTeacherData = Omit<CreateTeacherData, "email" | "password">;

export const getTeachers = async (): Promise<Teacher[]> => (await api.get("/teachers")).data;
export const getTeacher = async (id: number): Promise<Teacher> => (await api.get(`/teachers/${id}`)).data;
export const createTeacher = async (data: CreateTeacherData): Promise<Teacher> => (await api.post("/teachers/create-account", data)).data;
export const updateTeacher = async (id: number, data: UpdateTeacherData): Promise<Teacher> => (await api.put(`/teachers/${id}`, data)).data;
export const deleteTeacher = async (id: number): Promise<void> => { await api.delete(`/teachers/${id}`); };
