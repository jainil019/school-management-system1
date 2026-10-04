import api from "./axios";

export interface ParentExamination {
  exam_subject_id: number;
  examination_id: number;
  examination_name: string;
  academic_year_id: number;
  start_date: string;
  end_date: string;
  examination_status: string;
  subject_id: number;
  subject_name: string;
  max_marks: number;
  passing_marks: number;
  exam_date: string;
}

export const getChildExaminations = async (
  studentId: number
): Promise<ParentExamination[]> => {
  const response = await api.get<ParentExamination[]>(
    `/examinations/parent/${studentId}`
  );

  return response.data;
};