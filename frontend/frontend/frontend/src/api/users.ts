import api from "./axios";

export interface User {
  id: number;
  email: string;
  role_id: number;
  role_name: string;
  is_active: boolean;
}

export const getUsers = async (): Promise<User[]> =>
  (await api.get("/users")).data;

export const updateUserStatus = async (
  id: number,
  isActive: boolean
): Promise<User> =>
  (
    await api.patch(
      `/users/${id}/status`,
      null,
      {
        params: {
          is_active: isActive,
        },
      }
    )
  ).data;