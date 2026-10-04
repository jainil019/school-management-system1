import api from "./axios";

export interface ParentProfile {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  phone: string | null;
  address: string | null;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const getMyParentProfile = async (): Promise<ParentProfile> => {
  const response = await api.get<ParentProfile>("/parents/me");

  return response.data;
};