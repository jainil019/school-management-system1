import api from "./axios";

export interface Section {
  id: number;
  name: string;
  class_id: number;
}

export interface CreateSectionData {
  name: string;
  class_id: number;
}

export type UpdateSectionData = CreateSectionData;

export const getSections = async (): Promise<Section[]> =>
  (await api.get("/sections")).data;

export const getSection = async (
  id: number
): Promise<Section> =>
  (await api.get(`/sections/${id}`)).data;

export const createSection = async (
  data: CreateSectionData
): Promise<Section> =>
  (await api.post("/sections", data)).data;

export const updateSection = async (
  id: number,
  data: UpdateSectionData
): Promise<Section> =>
  (await api.put(`/sections/${id}`, data)).data;

export const deleteSection = async (
  id: number
): Promise<void> => {
  await api.delete(`/sections/${id}`);
};