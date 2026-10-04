import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  GraduationCap,
  RefreshCw,
  Users,
  ClipboardCheck,
} from "lucide-react";

import { getTeacherAssignments } from "../../api/teacherAssignments";
import type { TeacherAssignment } from "../../api/teacherAssignments";

import { getClasses } from "../../api/classes";
import type { SchoolClass } from "../../api/classes";

import { getSections } from "../../api/sections";
import type { Section } from "../../api/sections";

import { getSubjects } from "../../api/subjects";
import type { Subject } from "../../api/subjects";

import { getAcademicYears } from "../../api/academicYears";
import type { AcademicYear } from "../../api/academicYears";

import { getStudents } from "../../api/students";
import type { Student } from "../../api/students";

import { getStudentEnrollments } from "../../api/studentEnrollments";
import type { StudentEnrollment } from "../../api/studentEnrollments";

export default function MyClasses() {
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([]);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        assignmentData,
        classData,
        sectionData,
        subjectData,
        yearData,
        studentData,
        enrollmentData,
      ] = await Promise.all([
        getTeacherAssignments(),
        getClasses(),
        getSections(),
        getSubjects(),
        getAcademicYears(),
        getStudents(),
        getStudentEnrollments(),
      ]);

      setAssignments(assignmentData);
      setClasses(classData);
      setSections(sectionData);
      setSubjects(subjectData);
      setAcademicYears(yearData);
      setStudents(studentData);
      setEnrollments(enrollmentData);
    } catch (e: any) {
      console.error(e);

      setError(
        e?.response?.data?.detail ||
          "Unable to load your classes."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const getClassName = (id: number) =>
    classes.find((item) => item.id === id)?.name ||
    `Class #${id}`;

  const getSectionName = (id: number) =>
    sections.find((item) => item.id === id)?.name ||
    `Section #${id}`;

  const getSubjectName = (id: number) =>
    subjects.find((item) => item.id === id)?.name ||
    `Subject #${id}`;

  const getAcademicYearName = (id: number) =>
    academicYears.find((item) => item.id === id)?.name ||
    `Year #${id}`;

  const getStudentCount = (
    classId: number,
    sectionId: number,
    academicYearId: number
  ) => {
    const studentIds = new Set(
      enrollments
        .filter(
          (enrollment) =>
            enrollment.class_id === classId &&
            enrollment.section_id === sectionId &&
            enrollment.academic_year_id === academicYearId &&
            enrollment.status.toUpperCase() === "ACTIVE"
        )
        .map((enrollment) => enrollment.student_id)
    );

    return students.filter((student) =>
      studentIds.has(student.id)
    ).length;
  };

  const filteredAssignments = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return assignments;

    return assignments.filter((assignment) => {
      const text = [
        getClassName(assignment.class_id),
        getSectionName(assignment.section_id),
        getSubjectName(assignment.subject_id),
        getAcademicYearName(assignment.academic_year_id),
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(value);
    });
  }, [
    assignments,
    search,
    classes,
    sections,
    subjects,
    academicYears,
  ]);

  const totalStudents = useMemo(() => {
    const ids = new Set<number>();

    assignments.forEach((assignment) => {
      enrollments
        .filter(
          (enrollment) =>
            enrollment.class_id === assignment.class_id &&
            enrollment.section_id === assignment.section_id &&
            enrollment.academic_year_id === assignment.academic_year_id &&
            enrollment.status.toUpperCase() === "ACTIVE"
        )
        .forEach((enrollment) => {
          ids.add(enrollment.student_id);
        });
    });

    return ids.size;
  }, [assignments, enrollments]);

  const uniqueSubjects = new Set(
    assignments.map((item) => item.subject_id)
  ).size;

  return (
    <div className="space-y-7 p-4 sm:p-6">

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-blue-600">
            Teacher Portal
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            My Classes
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View your assigned classes, subjects and students.
          </p>
        </div>

        <button
          onClick={() => void load()}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-5 sm:grid-cols-3">

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <BookOpen size={21} />
          </div>

          <p className="mt-5 text-sm font-medium text-slate-500">
            Assigned Classes
          </p>

          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            {loading ? "..." : assignments.length}
          </h2>

          <p className="mt-2 text-xs text-emerald-600">
            Live database data
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
            <GraduationCap size={21} />
          </div>

          <p className="mt-5 text-sm font-medium text-slate-500">
            Students
          </p>

          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            {loading ? "..." : totalStudents}
          </h2>

          <p className="mt-2 text-xs text-emerald-600">
            Active enrollments
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <BookOpen size={21} />
          </div>

          <p className="mt-5 text-sm font-medium text-slate-500">
            Subjects
          </p>

          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            {loading ? "..." : uniqueSubjects}
          </h2>

          <p className="mt-2 text-xs text-emerald-600">
            Assigned subjects
          </p>
        </div>

      </div>

      {/* Search */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <input
          type="text"
          placeholder="Search class, section, subject..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* Classes */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <RefreshCw className="mx-auto mb-3 animate-spin text-blue-600" />
          <p className="text-sm text-slate-500">
            Loading your classes...
          </p>
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <BookOpen className="mx-auto mb-3 text-slate-400" />
          <h3 className="font-semibold text-slate-800">
            No classes found
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            No teacher assignments match your search.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">

          {filteredAssignments.map((assignment) => {
            const studentCount = getStudentCount(
              assignment.class_id,
              assignment.section_id,
              assignment.academic_year_id
            );

            return (
              <div
                key={assignment.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">

                  <div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <BookOpen size={22} />
                      </div>

                      <div>
                        <h2 className="text-lg font-bold text-slate-900">
                          {getClassName(assignment.class_id)} -{" "}
                          {getSectionName(assignment.section_id)}
                        </h2>

                        <p className="text-sm text-blue-600">
                          {getSubjectName(assignment.subject_id)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Assigned
                  </span>
                </div>

                <div className="mt-5 space-y-3">

                  <div className="flex justify-between border-b border-slate-100 pb-3">
                    <span className="text-sm text-slate-500">
                      Academic Year
                    </span>

                    <span className="text-sm font-medium text-slate-800">
                      {getAcademicYearName(
                        assignment.academic_year_id
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-slate-100 pb-3">
                    <span className="text-sm text-slate-500">
                      Students
                    </span>

                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                      <Users size={16} />
                      {studentCount}
                    </span>
                  </div>

                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">

                  <Link
                    to={`/teacher/classes/${assignment.id}`}
                    className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    <Users size={16} />
                    View Students
                  </Link>

                  <Link
                    to={`/teacher/attendance?assignment=${assignment.id}`}
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <ClipboardCheck size={16} />
                    Attendance
                  </Link>

                </div>
              </div>
            );
          })}

        </div>
      )}
    </div>
  );
}