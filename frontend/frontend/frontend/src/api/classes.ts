import api from "./axios";

export interface SchoolClass {
  id: number;
  name: string;
  academic_year_id: number;
}

export interface ClassData {
  name: string;
  academic_year_id: number;
}

export const getClasses = async (): Promise<SchoolClass[]> =>
  (await api.get("/classes")).data;

export const getClass = async (
  id: number
): Promise<SchoolClass> =>
  (await api.get(`/classes/${id}`)).data;

export const createClass = async (
  data: ClassData
): Promise<SchoolClass> =>
  (await api.post("/classes", data)).data;

export const updateClass = async (
  id: number,
  data: ClassData
): Promise<SchoolClass> =>
  (await api.put(`/classes/${id}`, data)).data;

export const deleteClass = async (
  id: number
): Promise<void> => {
  await api.delete(`/classes/${id}`);
};