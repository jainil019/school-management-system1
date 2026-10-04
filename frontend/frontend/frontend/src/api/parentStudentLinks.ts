import api from "./axios";

export interface ParentStudentLink {
  id: number;
  parent_id: number;
  student_id: number;
  relationship: string;
}

export interface CreateParentStudentLink {
  parent_id: number;
  student_id: number;
  relationship: string;
}

export const getParentStudentLinks = async (): Promise<
  ParentStudentLink[]
> => {
  const response = await api.get<ParentStudentLink[]>(
    "/parent-student-links"
  );

  return response.data;
};

export const createParentStudentLink = async (
  data: CreateParentStudentLink
): Promise<ParentStudentLink> => {
  const response = await api.post<ParentStudentLink>(
    "/parent-student-links",
    data
  );

  return response.data;
};

export const deleteParentStudentLink = async (
  id: number
): Promise<void> => {
  await api.delete(`/parent-student-links/${id}`);
};