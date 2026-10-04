import api from "./axios";

export interface ParentChild {
  link_id: number;
  student_id: number;
  relationship: string;
  admission_no: string;
  first_name: string;
  last_name: string;
  dob: string | null;
  gender: string | null;
  phone: string | null;
  address: string | null;
  admission_date: string | null;
  photo_url: string | null;
  status: string;
}

export const getMyChildren = async (): Promise<ParentChild[]> => {
  const response = await api.get<ParentChild[]>(
    "/parent-student-links/me"
  );

  return response.data;
};