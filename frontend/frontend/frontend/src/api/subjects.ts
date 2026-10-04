import api from "./axios";

export interface Subject {
  id: number;
  name: string;
  code: string;
}

export interface CreateSubjectData {
  name: string;
  code: string;
}

export type UpdateSubjectData = CreateSubjectData;


export const getSubjects = async (): Promise<Subject[]> =>
  (await api.get("/subjects")).data;


export const getSubject = async (
  id: number
): Promise<Subject> =>
  (await api.get(`/subjects/${id}`)).data;


export const createSubject = async (
  data: CreateSubjectData
): Promise<Subject> =>
  (await api.post("/subjects", data)).data;


export const updateSubject = async (
  id: number,
  data: UpdateSubjectData
): Promise<Subject> =>
  (await api.put(`/subjects/${id}`, data)).data;


export const deleteSubject = async (
  id: number
): Promise<void> => {
  await api.delete(`/subjects/${id}`);
};