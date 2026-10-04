import api from "./axios";

export interface Announcement {
  id: number;
  title: string;
  description: string;
  audience: string;
  class_id: number | null;
  section_id: number | null;
  created_by: number;
  expires_at: string | null;
  created_at: string;
}

export interface CreateAnnouncement {
  title: string;
  description: string;
  audience: string;
  class_id: number | null;
  section_id: number | null;
  expires_at: string | null;
}

export const getAnnouncements = async (): Promise<
  Announcement[]
> => {
  const response = await api.get("/announcements");
  return response.data;
};

export const createAnnouncement = async (
  data: CreateAnnouncement
): Promise<Announcement> => {
  const response = await api.post(
    "/announcements",
    data
  );

  return response.data;
};

export const updateAnnouncement = async (
  id: number,
  data: CreateAnnouncement
): Promise<Announcement> => {
  const response = await api.put(
    `/announcements/${id}`,
    data
  );

  return response.data;
};

export const deleteAnnouncement = async (
  id: number
): Promise<void> => {
  await api.delete(`/announcements/${id}`);
};