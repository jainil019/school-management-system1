import api from "./axios";

export interface ParentHomeworkSubmission {
  id: number;
  homework_id: number;
  student_id: number;
  submitted_at: string | null;
  file_url: string | null;
  status: string;
  feedback: string | null;
  reviewed_by: number | null;
}

export const getChildHomeworkSubmissions = async (
  studentId: number
): Promise<ParentHomeworkSubmission[]> => {
  const response = await api.get<ParentHomeworkSubmission[]>(
    `/homework-submissions/parent/${studentId}`
  );

  return response.data;
};