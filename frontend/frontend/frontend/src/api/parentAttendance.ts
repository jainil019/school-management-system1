import api from "./axios";

export interface ParentAttendance {
  id: number;
  student_id: number;
  enrollment_id: number;
  date: string;
  status: string;
  marked_by: number;
}

export const getChildAttendance = async (
  studentId: number
): Promise<ParentAttendance[]> => {
  const response = await api.get<ParentAttendance[]>(
    `/attendance/parent/${studentId}`
  );

  return response.data;
};