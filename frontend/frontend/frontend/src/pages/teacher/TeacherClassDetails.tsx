import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Search,
  Users,
  RefreshCw,
  User,
  Hash,
  CalendarDays,
} from "lucide-react";

import {
  getTeacherAssignment,
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
  getStudentEnrollments,
  type StudentEnrollment,
} from "../../api/studentEnrollments";

import {
  getStudents,
  type Student,
} from "../../api/students";

export default function TeacherClassDetails() {
  const { assignmentId } = useParams<{ assignmentId: string }>();

  const [assignment, setAssignment] =
    useState<TeacherAssignment | null>(null);

const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      if (!assignmentId) {
        throw new Error("Assignment ID is missing.");
      }

      const id = Number(assignmentId);

      if (Number.isNaN(id)) {
        throw new Error("Invalid assignment ID.");
      }

      const [
        assignmentData,
        classesData,
        sectionsData,
        subjectsData,
        academicYearsData,
        enrollmentsData,
        studentsData,
      ] = await Promise.all([
        getTeacherAssignment(id),
        getClasses(),
        getSections(),
        getSubjects(),
        getAcademicYears(),
        getStudentEnrollments(),
        getStudents(),
      ]);

      setAssignment(assignmentData);
      setClasses(classesData);
      setSections(sectionsData);
      setSubjects(subjectsData);
      setAcademicYears(academicYearsData);
      setEnrollments(enrollmentsData);
      setStudents(studentsData);
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "Failed to load class details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [assignmentId]);

  const className = useMemo(() => {
    if (!assignment) return "Class";

    const item = classes.find(
      (item) => item.id === assignment.class_id
    );

    return item?.name || `Class ${assignment.class_id}`;
  }, [assignment, classes]);

  const sectionName = useMemo(() => {
    if (!assignment) return "Section";

    const item = sections.find(
      (item) => item.id === assignment.section_id
    );

    return item?.name || `Section ${assignment.section_id}`;
  }, [assignment, sections]);

  const subjectName = useMemo(() => {
    if (!assignment) return "Subject";

    const item = subjects.find(
      (item) => item.id === assignment.subject_id
    );

    return item?.name || `Subject ${assignment.subject_id}`;
  }, [assignment, subjects]);

  const academicYearName = useMemo(() => {
    if (!assignment) return "Academic Year";

    const item = academicYears.find(
      (item) => item.id === assignment.academic_year_id
    );

   return (
  item?.name ||
  `Academic Year ${assignment.academic_year_id}`
);
  }, [assignment, academicYears]);

  /*
   * IMPORTANT:
   *
   * Students do not contain class_id / section_id.
   * Enrollment contains:
   * student_id
   * class_id
   * section_id
   * academic_year_id
   *
   * Therefore we first find the correct enrollments,
   * then connect those enrollment.student_id values
   * with the actual Student records.
   */
  const classStudents = useMemo(() => {
    if (!assignment) return [];

    const matchingEnrollments = enrollments.filter(
      (enrollment) =>
        enrollment.class_id === assignment.class_id &&
        enrollment.section_id === assignment.section_id &&
        enrollment.academic_year_id === assignment.academic_year_id &&
        enrollment.status.toLowerCase() === "active"
    );

    const studentMap = new Map(
      students.map((student) => [student.id, student])
    );

    return matchingEnrollments
      .map((enrollment) => ({
        enrollment,
        student: studentMap.get(enrollment.student_id),
      }))
      .filter(
        (
          item
        ): item is {
          enrollment: StudentEnrollment;
          student: Student;
        } => Boolean(item.student)
      )
      .sort((a, b) => {
        if (
          a.enrollment.roll_no !== null &&
          b.enrollment.roll_no !== null
        ) {
          return a.enrollment.roll_no - b.enrollment.roll_no;
        }

        return `${a.student.first_name} ${a.student.last_name}`.localeCompare(
          `${b.student.first_name} ${b.student.last_name}`
        );
      });
  }, [assignment, enrollments, students]);

  const filteredStudents = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return classStudents;

    return classStudents.filter(({ student, enrollment }) => {
      const fullName =
        `${student.first_name} ${student.last_name}`.toLowerCase();

      return (
        fullName.includes(value) ||
        student.admission_no.toLowerCase().includes(value) ||
        String(enrollment.roll_no ?? "").includes(value)
      );
    });
  }, [classStudents, search]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <RefreshCw className="mx-auto mb-3 animate-spin text-blue-600" />
            <p className="text-gray-600">
              Loading class details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          <Link
            to="/teacher/classes"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft size={18} />
            Back to My Classes
          </Link>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            <h2 className="mb-2 text-lg font-semibold">
              Unable to load class
            </h2>

            <p>{error}</p>

            <button
              onClick={loadData}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">

        {/* Back */}
        <Link
          to="/teacher/classes"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft size={18} />
          Back to My Classes
        </Link>

        {/* Header */}
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

            <div>
              <div className="mb-2 flex items-center gap-3">
                <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                  <BookOpen size={24} />
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {className} - {sectionName}
                  </h1>

                  <p className="text-sm text-gray-500">
                    {subjectName}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={loadData}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          {/* Class information */}
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">

            <div className="rounded-xl bg-gray-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-gray-500">
                <BookOpen size={17} />
                <span className="text-sm">Class</span>
              </div>

              <p className="font-semibold text-gray-900">
                {className}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-gray-500">
                <Users size={17} />
                <span className="text-sm">Section</span>
              </div>

              <p className="font-semibold text-gray-900">
                {sectionName}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-gray-500">
                <BookOpen size={17} />
                <span className="text-sm">Subject</span>
              </div>

              <p className="font-semibold text-gray-900">
                {subjectName}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-gray-500">
                <CalendarDays size={17} />
                <span className="text-sm">Academic Year</span>
              </div>

              <p className="font-semibold text-gray-900">
                {academicYearName}
              </p>
            </div>

          </div>
        </div>

        {/* Student section */}
        <div className="rounded-2xl bg-white shadow-sm">

          <div className="border-b border-gray-200 p-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  My Students
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Students enrolled in this assigned class.
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2">
                <Users size={18} className="text-blue-600" />

                <span className="font-semibold text-blue-700">
                  {classStudents.length} Students
                </span>
              </div>

            </div>

            {/* Search */}
            <div className="relative mt-5 max-w-md">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search student name, admission no..."
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* Students */}
          <div className="p-6">

            {filteredStudents.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center">
                <Users
                  size={40}
                  className="mx-auto mb-3 text-gray-400"
                />

                <h3 className="font-semibold text-gray-800">
                  No students found
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  {search
                    ? "Try another search."
                    : "No active students are enrolled in this class."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-sm text-gray-500">
                      <th className="px-4 py-3 font-medium">
                        Roll No
                      </th>

                      <th className="px-4 py-3 font-medium">
                        Student
                      </th>

                      <th className="px-4 py-3 font-medium">
                        Admission No
                      </th>

                      <th className="px-4 py-3 font-medium">
                        Gender
                      </th>

                      <th className="px-4 py-3 font-medium">
                        Phone
                      </th>

                      <th className="px-4 py-3 font-medium">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredStudents.map(
                      ({ student, enrollment }) => (
                        <tr
                          key={enrollment.id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2 font-semibold text-gray-800">
                              <Hash size={16} className="text-gray-400" />
                              {enrollment.roll_no ?? "-"}
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                <User size={18} />
                              </div>

                              <div>
                                <p className="font-semibold text-gray-900">
                                  {student.first_name}{" "}
                                  {student.last_name}
                                </p>

                                <p className="text-xs text-gray-500">
                                  Student ID: {student.id}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4 text-sm text-gray-700">
                            {student.admission_no}
                          </td>

                          <td className="px-4 py-4 text-sm text-gray-700">
                            {student.gender || "-"}
                          </td>

                          <td className="px-4 py-4 text-sm text-gray-700">
                            {student.phone || "-"}
                          </td>

                          <td className="px-4 py-4">
                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                              {student.status}
                            </span>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}