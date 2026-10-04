import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";

import {
  getTeacherAssignments,
  type TeacherAssignment,
} from "../../api/teacherAssignments";

import {
  getClasses,
  type SchoolClass,
} from "../../api/classes";

import {
  getSections,
  type Section,
} from "../../api/sections";

import {
  getSubjects,
  type Subject,
} from "../../api/subjects";

import {
  getAcademicYears,
  type AcademicYear,
} from "../../api/academicYears";

import {
  getStudents,
  type Student,
} from "../../api/students";

import {
  getStudentEnrollments,
  type StudentEnrollment,
} from "../../api/studentEnrollments";

interface TeacherStudent {
  student: Student;
  enrollment: StudentEnrollment;
  assignment: TeacherAssignment;
}

export default function TeacherStudents() {
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

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        assignmentData,
        classData,
        sectionData,
        subjectData,
        academicYearData,
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
      setAcademicYears(academicYearData);
      setStudents(studentData);
      setEnrollments(enrollmentData);
    } catch (err: any) {
      console.error("Teacher students error:", err);

      setError(
        err?.response?.data?.detail ||
          "Unable to load your students."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const classMap = useMemo(
    () => new Map(classes.map((item) => [item.id, item])),
    [classes]
  );

  const sectionMap = useMemo(
    () => new Map(sections.map((item) => [item.id, item])),
    [sections]
  );

  const subjectMap = useMemo(
    () => new Map(subjects.map((item) => [item.id, item])),
    [subjects]
  );

  const academicYearMap = useMemo(
    () => new Map(academicYears.map((item) => [item.id, item])),
    [academicYears]
  );

  /*
   * Build the teacher's student list.
   *
   * Teacher assignment tells us:
   * class + section + academic year
   *
   * Enrollment tells us:
   * student + class + section + academic year
   *
   * Therefore a student belongs to this teacher's
   * student list when the enrollment matches one
   * of the teacher's assignments.
   */
  const teacherStudents = useMemo<TeacherStudent[]>(() => {
    const studentMap = new Map(
      students.map((student) => [student.id, student])
    );

    const result: TeacherStudent[] = [];
    const uniqueStudentAssignment = new Set<string>();

    for (const assignment of assignments) {
      const matchingEnrollments = enrollments.filter(
        (enrollment) =>
          enrollment.class_id === assignment.class_id &&
          enrollment.section_id === assignment.section_id &&
          enrollment.academic_year_id === assignment.academic_year_id &&
          enrollment.status.toUpperCase() === "ACTIVE"
      );

      for (const enrollment of matchingEnrollments) {
        const student = studentMap.get(enrollment.student_id);

        if (!student) continue;

        /*
         * The same student can be assigned to the teacher
         * for multiple subjects.
         *
         * Keep one row per student + class + section,
         * not one row per subject.
         */
        const uniqueKey = [
          student.id,
          enrollment.class_id,
          enrollment.section_id,
          enrollment.academic_year_id,
        ].join("-");

        if (uniqueStudentAssignment.has(uniqueKey)) {
          continue;
        }

        uniqueStudentAssignment.add(uniqueKey);

        result.push({
          student,
          enrollment,
          assignment,
        });
      }
    }

    return result.sort((a, b) => {
      const rollA = a.enrollment.roll_no;
      const rollB = b.enrollment.roll_no;

      if (rollA !== null && rollB !== null) {
        return rollA - rollB;
      }

      return `${a.student.first_name} ${a.student.last_name}`.localeCompare(
        `${b.student.first_name} ${b.student.last_name}`
      );
    });
  }, [assignments, enrollments, students]);

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return teacherStudents;
    }

    return teacherStudents.filter(
      ({ student, enrollment, assignment }) => {
        const fullName =
          `${student.first_name} ${student.last_name}`.toLowerCase();

        const className =
          classMap.get(assignment.class_id)?.name?.toLowerCase() || "";

        const sectionName =
          sectionMap
            .get(assignment.section_id)
            ?.name?.toLowerCase() || "";

        const subjectName =
          subjectMap
            .get(assignment.subject_id)
            ?.name?.toLowerCase() || "";

        return (
          fullName.includes(query) ||
          student.admission_no.toLowerCase().includes(query) ||
          String(enrollment.roll_no ?? "").includes(query) ||
          className.includes(query) ||
          sectionName.includes(query) ||
          subjectName.includes(query)
        );
      }
    );
  }, [
    teacherStudents,
    search,
    classMap,
    sectionMap,
    subjectMap,
  ]);

  const uniqueStudents = new Set(
    teacherStudents.map((item) => item.student.id)
  ).size;

  const uniqueClasses = new Set(
    teacherStudents.map(
      (item) =>
        `${item.enrollment.class_id}-${item.enrollment.section_id}`
    )
  ).size;

  return (
    <div className="space-y-7">

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

        <div>
          <p className="text-sm font-medium text-blue-600">
            Teacher Portal
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            My Students
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Students from your assigned classes.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadData()}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <RefreshCw size={17} />
          Refresh
        </button>

      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-5 md:grid-cols-3">

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Users size={21} />
          </div>

          <p className="mt-5 text-sm font-medium text-slate-500">
            Total Students
          </p>

          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            {loading ? "..." : uniqueStudents}
          </h2>

          <p className="mt-2 text-xs text-emerald-600">
            Active students
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
            <BookOpen size={21} />
          </div>

          <p className="mt-5 text-sm font-medium text-slate-500">
            My Classes
          </p>

          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            {loading ? "..." : uniqueClasses}
          </h2>

          <p className="mt-2 text-xs text-emerald-600">
            Assigned classes
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <GraduationCap size={21} />
          </div>

          <p className="mt-5 text-sm font-medium text-slate-500">
            Assignments
          </p>

          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            {loading ? "..." : assignments.length}
          </h2>

          <p className="mt-2 text-xs text-emerald-600">
            Teaching assignments
          </p>
        </div>

      </div>

      {/* Search */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="relative">
          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search student name, admission number, class..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </div>

      </div>

      {/* Student Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="font-semibold text-slate-900">
            Student List
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {filteredStudents.length} student
            {filteredStudents.length === 1 ? "" : "s"} shown
          </p>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw
              size={30}
              className="mx-auto animate-spin text-blue-600"
            />

            <p className="mt-3 text-sm text-slate-500">
              Loading students...
            </p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-12 text-center">

            <Users
              size={42}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-4 font-semibold text-slate-800">
              No students found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {search
                ? "Try a different search."
                : "No active students are enrolled in your assigned classes."}
            </p>

          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full min-w-[900px]">

              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left">

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Roll No
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Student
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Admission No
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Class
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Subject
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>

                </tr>
              </thead>

              <tbody>

                {filteredStudents.map(
                  ({
                    student,
                    enrollment,
                    assignment,
                  }) => {
                    const classItem = classMap.get(
                      assignment.class_id
                    );

                    const sectionItem =
                      sectionMap.get(
                        assignment.section_id
                      );

                    const subjectItem =
                      subjectMap.get(
                        assignment.subject_id
                      );

                    const academicYearItem =
                      academicYearMap.get(
                        assignment.academic_year_id
                      );

                    return (
                      <tr
                        key={`${student.id}-${enrollment.id}`}
                        className="border-b border-slate-100 transition hover:bg-slate-50"
                      >

                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-800">
                            {enrollment.roll_no ?? "-"}
                          </span>
                        </td>

                        <td className="px-6 py-4">

                          <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 font-semibold text-blue-600">
                              {student.first_name
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <p className="font-semibold text-slate-900">
                                {student.first_name}{" "}
                                {student.last_name}
                              </p>

                              <p className="text-xs text-slate-400">
                                ID: {student.id}
                              </p>
                            </div>

                          </div>

                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {student.admission_no}
                        </td>

                        <td className="px-6 py-4">

                          <p className="text-sm font-semibold text-slate-800">
                            {classItem?.name ||
                              `Class #${assignment.class_id}`}
                            {" - "}
                            {sectionItem?.name ||
                              `Section #${assignment.section_id}`}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {academicYearItem?.name || ""}
                          </p>

                        </td>

                        <td className="px-6 py-4">
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                            {subjectItem?.name ||
                              `Subject #${assignment.subject_id}`}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                            {student.status}
                          </span>
                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* Bottom link */}
      <div className="flex justify-end">

        <Link
          to="/teacher/classes"
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          View My Classes
          <ArrowRight size={16} />
        </Link>

      </div>

    </div>
  );
}