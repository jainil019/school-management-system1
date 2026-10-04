import api from "./axios";

export interface TeacherAssignment {
  id: number;
  teacher_id: number;
  class_id: number;
  section_id: number;
  subject_id: number;
  academic_year_id: number;
}

export interface CreateTeacherAssignment {
  teacher_id: number;
  class_id: number;
  section_id: number;
  subject_id: number;
  academic_year_id: number;
}

export type UpdateTeacherAssignment = CreateTeacherAssignment;

export const getTeacherAssignments = async (): Promise<TeacherAssignment[]> =>
  (await api.get("/teacher-assignments")).data;

export const getTeacherAssignment = async (
  id: number,
): Promise<TeacherAssignment> =>
  (await api.get(`/teacher-assignments/${id}`)).data;

export const createTeacherAssignment = async (
  data: CreateTeacherAssignment,
): Promise<TeacherAssignment> =>
  (await api.post("/teacher-assignments", data)).data;

export const updateTeacherAssignment = async (
  id: number,
  data: UpdateTeacherAssignment,
): Promise<TeacherAssignment> =>
  (await api.put(`/teacher-assignments/${id}`, data)).data;

export const deleteTeacherAssignment = async (
  id: number,
): Promise<void> => {
  await api.delete(`/teacher-assignments/${id}`);
};