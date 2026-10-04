import api from "./axios";

export interface StudentEnrollment {
  id: number;
  student_id: number;
  academic_year_id: number;
  class_id: number;
  section_id: number;
  roll_no: number | null;
  enrollment_date: string;
  status: string;

  academic_year_name?: string | null;
  class_name?: string | null;
  section_name?: string | null;
}

export interface CreateStudentEnrollment {
  student_id: number;
  academic_year_id: number;
  class_id: number;
  section_id: number;
  roll_no: number | null;
  enrollment_date: string;
  status: string;
}

export type UpdateStudentEnrollment = CreateStudentEnrollment;

// Admin / Teacher APIs
export const getStudentEnrollments =
  async (): Promise<StudentEnrollment[]> => {
    const response = await api.get<StudentEnrollment[]>(
      "/student-enrollments"
    );

    return response.data;
  };

export const getStudentEnrollment =
  async (id: number): Promise<StudentEnrollment> => {
    const response = await api.get<StudentEnrollment>(
      `/student-enrollments/${id}`
    );

    return response.data;
  };

export const createStudentEnrollment =
  async (
    data: CreateStudentEnrollment
  ): Promise<StudentEnrollment> => {
    const response = await api.post<StudentEnrollment>(
      "/student-enrollments",
      data
    );

    return response.data;
  };

export const updateStudentEnrollment =
  async (
    id: number,
    data: UpdateStudentEnrollment
  ): Promise<StudentEnrollment> => {
    const response = await api.put<StudentEnrollment>(
      `/student-enrollments/${id}`,
      data
    );

    return response.data;
  };

export const deleteStudentEnrollment =
  async (id: number): Promise<void> => {
    await api.delete(`/student-enrollments/${id}`);
  };

// Student Portal API
export const getMyEnrollments =
  async (): Promise<StudentEnrollment[]> => {
    const response = await api.get<StudentEnrollment[]>(
      "/student-enrollments/me"
    );

    return response.data;
  };