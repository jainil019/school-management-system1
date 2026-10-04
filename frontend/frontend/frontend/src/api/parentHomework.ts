import api from "./axios";

export interface ParentHomework {
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
}

export const getChildHomework = async (
  studentId: number
): Promise<ParentHomework[]> => {
  const response = await api.get<ParentHomework[]>(
    `/homework/parent/${studentId}`
  );

  return response.data;
};