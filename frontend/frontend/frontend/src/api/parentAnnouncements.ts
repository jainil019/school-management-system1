import api from "./axios";

export interface ParentAnnouncement {
  id: number;
  title: string;
  description: string;
  audience: string;
  class_id: number | null;
  section_id: number | null;
  expires_at: string | null;
  created_at: string;
}

export const getParentAnnouncements = async (): Promise<
  ParentAnnouncement[]
> => {
  const response = await api.get<ParentAnnouncement[]>(
    "/announcements/parent/me"
  );

  return response.data;
};