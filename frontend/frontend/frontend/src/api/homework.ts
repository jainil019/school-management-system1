import api from "./axios";

export interface Homework {
  id: number;
  class_id: number;
  section_id: number | null;
  subject_id: number;
  teacher_id: number;
  title: string;
  description: string | null;
  assigned_date: string;
  due_date: string;
  attachment_url: string | null;
  created_at: string;
}

export interface CreateHomework {
  class_id: number;
  section_id?: number | null;
  subject_id: number;
  teacher_id: number;
  title: string;
  description?: string | null;
  assigned_date: string;
  due_date: string;
  attachment_url?: string | null;
}

export interface UpdateHomework {
  title: string;
  description?: string | null;
  due_date: string;
  attachment_url?: string | null;
}

// Admin / Teacher
export const getHomework = async (): Promise<Homework[]> => {
  const response = await api.get<Homework[]>("/homework");
  return response.data;
};

export const createHomework = async (
  data: CreateHomework
): Promise<Homework> => {
  const response = await api.post<Homework>("/homework", data);
  return response.data;
};

export const updateHomework = async (
  id: number,
  data: UpdateHomework
): Promise<Homework> => {
  const response = await api.put<Homework>(
    `/homework/${id}`,
    data
  );

  return response.data;
};

export const deleteHomework = async (
  id: number
): Promise<void> => {
  await api.delete(`/homework/${id}`);
};

// Student
export const getMyHomework = async (): Promise<Homework[]> => {
  const response = await api.get<Homework[]>("/homework/me");
  return response.data;
};