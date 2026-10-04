import api from "./axios";
export interface ClassSubject {
  id: number;
  class_id: number;
  subject_id: number;
}
export interface CreateClassSubject {
  class_id: number;
  subject_id: number;
}
export const getClassSubjects = async (): Promise<ClassSubject[]> =>
  (await api.get("/class-subjects")).data;
export const createClassSubject = async (
  data: CreateClassSubject,
): Promise<ClassSubject> => (await api.post("/class-subjects", data)).data;
export const deleteClassSubject = async (id: number): Promise<void> => {
  await api.delete(`/class-subjects/${id}`);
};
