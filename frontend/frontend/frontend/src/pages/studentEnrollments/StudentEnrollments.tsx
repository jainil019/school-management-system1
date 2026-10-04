import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  deleteStudentEnrollment,
  getStudentEnrollments,
  type StudentEnrollment,
} from "../../api/studentEnrollments";

import {
  getAcademicYears,
  getClasses,
  getSections,
  getStudents,
  type AcademicYear,
  type ClassItem,
  type SectionItem,
  type StudentLookup,
} from "../../api/lookups";

import StudentEnrollmentForm from "../../components/studentEnrollments/StudentEnrollmentForm";

import {
  DangerButton,
  EmptyState,
  PageHeader,
  PrimaryButton,
} from "../../components/common/ModuleUi";

export default function StudentEnrollments() {
  const [items, setItems] = useState<StudentEnrollment[]>([]);
  const [students, setStudents] = useState<StudentLookup[]>([]);
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [sections, setSections] = useState<SectionItem[]>([]);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const [editingEnrollment, setEditingEnrollment] =
    useState<StudentEnrollment | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        enrollmentData,
        studentData,
        yearData,
        classData,
        sectionData,
      ] = await Promise.all([
        getStudentEnrollments(),
        getStudents(),
        getAcademicYears(),
        getClasses(),
        getSections(),
      ]);

      setItems(enrollmentData);
      setStudents(studentData);
      setYears(yearData);
      setClasses(classData);
      setSections(sectionData);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ??
          "Unable to load student enrollments."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const getStudentName = (id: number) => {
    const student = students.find(
      (item) => item.id === id
    );

    return student
      ? `${student.first_name} ${student.last_name}`
      : `Student #${id}`;
  };

  const getName = (
    id: number,
    data: any[],
    label: string
  ) => {
    return (
      data.find((item) => item.id === id)?.name ??
      `${label} #${id}`
    );
  };

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const text = `
        ${getStudentName(item.student_id)}
        ${getName(item.academic_year_id, years, "Year")}
        ${getName(item.class_id, classes, "Class")}
        ${getName(item.section_id, sections, "Section")}
        ${item.roll_no ?? ""}
        ${item.status}
        ${item.enrollment_date}
      `.toLowerCase();

      return text.includes(query.toLowerCase());
    });
  }, [
    items,
    students,
    years,
    classes,
    sections,
    query,
  ]);

  const handleAdd = () => {
    setEditingEnrollment(null);
    setOpen(true);
  };

  const handleEdit = (
    enrollment: StudentEnrollment
  ) => {
    setEditingEnrollment(enrollment);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingEnrollment(null);
  };

  const handleDelete = async (
    enrollment: StudentEnrollment
  ) => {
    if (deletingId !== null) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this enrollment?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(enrollment.id);
      setError("");

      await deleteStudentEnrollment(enrollment.id);

      await load();
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ??
          "Unable to delete enrollment."
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        title="Student Enrollments"
        description="Assign students to academic years, classes and sections."
        action={
          <PrimaryButton onClick={handleAdd}>
            + Enroll Student
          </PrimaryButton>
        }
      />

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input
          className="w-full max-w-lg rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-500"
          placeholder="Search student, class, section or status..."
          value={query}
          onChange={(event) =>
            setQuery(event.target.value)
          }
        />

        <button
          type="button"
          onClick={() => void load()}
          className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Loading...
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState message="No student enrollments found." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Student</th>
                  <th className="px-5 py-3">Academic Year</th>
                  <th className="px-5 py-3">Class</th>
                  <th className="px-5 py-3">Section</th>
                  <th className="px-5 py-3">Roll No</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Enrollment Date</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-5 py-4 font-medium text-slate-900">
                      {getStudentName(item.student_id)}
                    </td>

                    <td className="px-5 py-4">
                      {getName(
                        item.academic_year_id,
                        years,
                        "Year"
                      )}
                    </td>

                    <td className="px-5 py-4">
                      {getName(
                        item.class_id,
                        classes,
                        "Class"
                      )}
                    </td>

                    <td className="px-5 py-4">
                      {getName(
                        item.section_id,
                        sections,
                        "Section"
                      )}
                    </td>

                    <td className="px-5 py-4">
                      {item.roll_no ?? "-"}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold">
                        {item.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {item.enrollment_date}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(item)
                          }
                          className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          Edit
                        </button>

                        <DangerButton
                          onClick={() =>
                            void handleDelete(item)
                          }
                        >
                          {deletingId === item.id
                            ? "Deleting..."
                            : "Delete"}
                        </DangerButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {open && (
        <StudentEnrollmentForm
          onClose={handleClose}
          onSuccess={load}
          editingEnrollment={editingEnrollment}
        />
      )}
    </div>
  );
}