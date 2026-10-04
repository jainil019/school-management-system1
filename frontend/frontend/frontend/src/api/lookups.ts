import api from "./axios";

export interface AcademicYear {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
}

export interface ClassItem {
  id: number;
  name: string;
  academic_year_id: number;
}

export interface SectionItem {
  id: number;
  name: string;
  class_id: number;
}

export interface TeacherLookup {
  id: number;
  employee_id: string;
  first_name: string;
  last_name: string;
  status: string;
}

export interface StudentLookup {
  id: number;
  admission_no: string;
  first_name: string;
  last_name: string;
  status: string;
}

export interface SubjectLookup {
  id: number;
  name: string;
  code: string;
}

export interface EnrollmentLookup {
  id: number;
  student_id: number;
  academic_year_id: number;
  class_id: number;
  section_id: number;
  roll_no?: number | null;
  enrollment_date?: string | null;
  status: string;
}

export const getAcademicYears = async (): Promise<AcademicYear[]> =>
  (await api.get("/academic-years")).data;

export const getClasses = async (): Promise<ClassItem[]> =>
  (await api.get("/classes")).data;

export const getSections = async (): Promise<SectionItem[]> =>
  (await api.get("/sections")).data;

export const getTeachers = async (): Promise<TeacherLookup[]> =>
  (await api.get("/teachers")).data;

export const getStudents = async (): Promise<StudentLookup[]> =>
  (await api.get("/students")).data;

export const getSubjects = async (): Promise<SubjectLookup[]> =>
  (await api.get("/subjects")).data;

export const getEnrollments = async (): Promise<EnrollmentLookup[]> =>
  (await api.get("/student-enrollments")).data;
