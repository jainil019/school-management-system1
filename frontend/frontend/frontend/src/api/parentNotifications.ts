import api from "./axios";

export interface ParentNotification {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export const getParentNotifications = async (): Promise<
  ParentNotification[]
> => {
  const response = await api.get<ParentNotification[]>(
    "/notifications/me"
  );

  return response.data;
};