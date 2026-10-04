import api from "./axios";

export interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface CreateNotification {
  user_id: number;
  type: string;
  title: string;
  message: string;
}

export const getMyNotifications = async (): Promise<Notification[]> => {
  const response = await api.get("/notifications/me");
  return response.data;
};

export const createNotification = async (
  data: CreateNotification
): Promise<Notification> => {
  const response = await api.post("/notifications", data);
  return response.data;
};

export const markNotificationRead = async (
  id: number
): Promise<Notification> => {
  const response = await api.patch(`/notifications/${id}/read`);
  return response.data;
};

export const deleteNotification = async (id: number): Promise<void> => {
  await api.delete(`/notifications/${id}`);
};