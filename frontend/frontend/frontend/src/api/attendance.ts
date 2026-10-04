import api from "./axios";

export interface Attendance {
  id: number;
  student_id: number;
  enrollment_id: number;
  date: string;
  status: string;
  marked_by: number;
}

export interface CreateAttendance {
  student_id: number;
  enrollment_id: number;
  date: string;
  status: string;
  // marked_by is optional because TEACHER requests
  // do not need to send it.
  marked_by?: number;
}

export interface UpdateAttendance {
  status: string;
}

/* =========================
   ADMIN / TEACHER APIs
========================= */

export const getAttendance = async (): Promise<Attendance[]> => {
  const response = await api.get<Attendance[]>("/attendance");
  return response.data;
};

export const getAttendanceRecord = async (
  id: number
): Promise<Attendance> => {
  const response = await api.get<Attendance>(
    `/attendance/${id}`
  );

  return response.data;
};

export const createAttendance = async (
  data: CreateAttendance
): Promise<Attendance> => {
  const response = await api.post<Attendance>(
    "/attendance",
    data
  );

  return response.data;
};

export const updateAttendance = async (
  id: number,
  status: string
): Promise<Attendance> => {
  const response = await api.put<Attendance>(
    `/attendance/${id}`,
    {
      status,
    }
  );

  return response.data;
};

export const deleteAttendance = async (
  id: number
): Promise<void> => {
  await api.delete(`/attendance/${id}`);
};

/* =========================
   STUDENT API
========================= */

export const getMyAttendance = async (): Promise<Attendance[]> => {
  const response = await api.get<Attendance[]>(
    "/attendance/me"
  );

  return response.data;
};