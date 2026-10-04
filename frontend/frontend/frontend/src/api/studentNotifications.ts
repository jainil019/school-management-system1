import api from "./axios";

export interface StudentNotification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
}

export const getMyNotifications =
  async (): Promise<StudentNotification[]> => {
    const response =
      await api.get<StudentNotification[]>(
        "/notifications/me"
      );

    return response.data;
  };


export const markNotificationAsRead =
  async (
    notificationId: number
  ): Promise<StudentNotification> => {
    const response =
      await api.patch<StudentNotification>(
        `/notifications/${notificationId}/read`
      );

    return response.data;
  };