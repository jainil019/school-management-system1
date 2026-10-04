import api from "./axios";

export interface StudentExamination {
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

export const getMyExaminations =
  async (): Promise<StudentExamination[]> => {
    const response = await api.get<StudentExamination[]>(
      "/examinations/me"
    );

    return response.data;
  };