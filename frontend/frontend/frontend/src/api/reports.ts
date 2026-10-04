import api from "./axios";

export interface ReportStudent {
  id: number;
  [key: string]: any;
}

export interface ReportRecord {
  id: number;
  [key: string]: any;
}

export const getReportStudents = async (): Promise<ReportStudent[]> =>
  (await api.get("/students")).data;

export const getReportTeachers = async (): Promise<ReportRecord[]> =>
  (await api.get("/teachers")).data;

export const getReportParents = async (): Promise<ReportRecord[]> =>
  (await api.get("/parents")).data;

export const getReportAttendance = async (): Promise<ReportRecord[]> =>
  (await api.get("/attendance")).data;

export const getReportMarks = async (): Promise<ReportRecord[]> =>
  (await api.get("/marks")).data;

export const getReportStudentFees = async (): Promise<ReportRecord[]> =>
  (await api.get("/student-fees")).data;

export const getReportPayments = async (): Promise<ReportRecord[]> =>
  (await api.get("/payments")).data;