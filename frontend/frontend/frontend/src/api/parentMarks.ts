import api from "./axios";

export interface ParentMark {
  mark_id: number;
  exam_subject_id: number;

  examination_id: number;
  examination_name: string;
  examination_status: string;
  start_date: string;
  end_date: string;

  subject_id: number;
  subject_name: string;

  marks_obtained: number;
  max_marks: number;
  passing_marks: number;

  percentage: number;

  grade: string | null;
  remarks: string | null;

  result_status: "PASS" | "FAIL";
}

export const getChildMarks = async (
  studentId: number
): Promise<ParentMark[]> => {
  const response = await api.get<ParentMark[]>(
    `/marks/parent/${studentId}`
  );

  return response.data;
};