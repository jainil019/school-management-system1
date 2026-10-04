import api from "./axios";

export interface Parent {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  phone: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateParentData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  address?: string | null;
}

export interface UpdateParentData {
  first_name: string;
  last_name: string;
  phone?: string | null;
  address?: string | null;
}

export const getParents = async (): Promise<Parent[]> => {
  const response = await api.get<Parent[]>("/parents");
  return response.data;
};

export const createParent = async (
  data: CreateParentData
): Promise<Parent> => {
  const response = await api.post<Parent>(
    "/parents/create-account",
    data
  );

  return response.data;
};

export const updateParent = async (
  id: number,
  data: UpdateParentData
): Promise<Parent> => {
  const response = await api.put<Parent>(
    `/parents/${id}`,
    data
  );

  return response.data;
};

export const deleteParent = async (
  id: number
): Promise<void> => {
  await api.delete(`/parents/${id}`);
};