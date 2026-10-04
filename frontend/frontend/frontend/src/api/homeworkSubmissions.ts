import api from "./axios";

export interface HomeworkSubmission {
  id: number;
  homework_id: number;
  student_id: number;
  submitted_at: string | null;
  file_url: string | null;
  status: string;
  feedback: string | null;
  reviewed_by: number | null;
}

export interface CreateHomeworkSubmission {
  homework_id: number;
  student_id: number;
  file_url?: string | null;
}

export interface ReviewHomeworkSubmission {
  status: string;
  feedback?: string | null;
}

// ============================================================
// ADMIN / PRINCIPAL / TEACHER
// ============================================================

export const getHomeworkSubmissions =
  async (): Promise<HomeworkSubmission[]> => {
    const response = await api.get<HomeworkSubmission[]>(
      "/homework-submissions"
    );

    return response.data;
  };

// ============================================================
// CREATE SUBMISSION
// ============================================================

export const createHomeworkSubmission = async (
  data: CreateHomeworkSubmission
): Promise<HomeworkSubmission> => {
  const response =
    await api.post<HomeworkSubmission>(
      "/homework-submissions",
      data
    );

  return response.data;
};

// ============================================================
// STUDENT: MY SUBMISSIONS
// ============================================================

export const getMyHomeworkSubmissions =
  async (): Promise<HomeworkSubmission[]> => {
    const response =
      await api.get<HomeworkSubmission[]>(
        "/homework-submissions/me"
      );

    return response.data;
  };

// ============================================================
// TEACHER / ADMIN: REVIEW SUBMISSION
// ============================================================

export const reviewHomeworkSubmission = async (
  id: number,
  data: ReviewHomeworkSubmission
): Promise<HomeworkSubmission> => {
  const response =
    await api.put<HomeworkSubmission>(
      `/homework-submissions/${id}`,
      data
    );

  return response.data;
};

// ============================================================
// ADMIN / PRINCIPAL: DELETE SUBMISSION
// ============================================================

export const deleteHomeworkSubmission = async (
  id: number
): Promise<void> => {
  await api.delete(
    `/homework-submissions/${id}`
  );
};

// ============================================================
// STUDENT: UPLOAD PDF
// ============================================================

export interface HomeworkPdfUploadResponse {
  message: string;
  file_url: string;
  filename: string;
  size: number;
}

export const uploadHomeworkPdf = async (
  file: File
): Promise<HomeworkPdfUploadResponse> => {
  const formData = new FormData();

  formData.append("file", file);

  const response =
    await api.post<HomeworkPdfUploadResponse>(
      "/homework-submissions/upload",
      formData
    );

  return response.data;
};