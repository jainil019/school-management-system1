import api from "./axios";

export interface AdminDashboardStats {
  total_students: number;
  total_teachers: number;
  total_parents: number;
  fees_collected: number;

  attendance: {
    total_records: number;
    present: number;
    late: number;
    absent: number;
    leave: number;
    attendance_rate: number;
    from: string;
    to: string;
  };

  recent_activity: {
    id: string;
    type: string;
    title: string;
    description: string;
    occurred_at: string;
  }[];

  upcoming_exams: {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
    status: string;
  }[];
}

export const getAdminDashboard =
  async (): Promise<AdminDashboardStats> => {
    const response = await api.get<AdminDashboardStats>(
      "/admin/dashboard"
    );

    return response.data;
  };