import api from "./axios";

export interface StudentAnnouncement {
  id: number;
  title: string;
  description: string;
  audience: string;
  class_id: number | null;
  section_id: number | null;
  created_by: number;
  created_at: string;
  expires_at: string | null;
}

export const getMyAnnouncements =
  async (): Promise<StudentAnnouncement[]> => {
    const response =
      await api.get<StudentAnnouncement[]>(
        "/announcements/me"
      );

    return response.data;
  };