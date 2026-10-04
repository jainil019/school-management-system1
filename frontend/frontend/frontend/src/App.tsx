import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import ParentDashboard from "./pages/ParentDashboard";
import AccountantDashboard from "./pages/AccountantDashboard";

// Teacher
import TeacherAttendance from "./pages/teacher/TeacherAttendance";
import TeacherAnnouncements from "./pages/teacher/TeacherAnnouncements";
import TeacherNotifications from "./pages/teacher/TeacherNotifications";
import TeacherExaminations from "./pages/teacher/TeacherExaminations";
import TeacherMarks from "./pages/teacher/TeacherMarks";
import TeacherHomework from "./pages/teacher/TeacherHomework";
import TeacherHomeworkSubmissions from "./pages/teacher/TeacherHomeworkSubmissions";
import MyClasses from "./pages/teacher/MyClasses";
import TeacherClassDetails from "./pages/teacher/TeacherClassDetails";
import TeacherStudents from "./pages/teacher/TeacherStudents";

// Student
import StudentHomework from "./pages/student/StudentHomework";
import StudentHomeworkSubmissions from "./pages/student/StudentHomeworkSubmissions";
import StudentAnnouncements from "./pages/student/StudentAnnouncements";
import ParentHomework from "./pages/parent/ParentHomework";
import ParentHomeworkSubmissions from "./pages/parent/ParentHomeworkSubmissions";
import StudentNotifications from "./pages/student/StudentNotifications";
import StudentExaminations from "./pages/student/StudentExaminations";
import StudentMarks from "./pages/student/StudentMarks";
import StudentProfile from "./pages/student/StudentProfile";
import StudentClasses from "./pages/student/StudentClasses";
import StudentAttendance from "./pages/student/StudentAttendance";

// Parent
import ParentChildren from "./pages/parent/ParentChildren";

// Admin
import Parents from "./pages/parents/Parents";
import Students from "./pages/students/Students";
import Reports from "./pages/reports/Reports";
import Teachers from "./pages/teachers/Teachers";
import AcademicYears from "./pages/academicYears/AcademicYears";
import Sections from "./pages/sections/Sections";
import Classes from "./pages/classes/Classes";
import Subjects from "./pages/subjects/Subjects";
import ParentExaminations from "./pages/parent/ParentExaminations";
import ParentMarks from "./pages/parent/ParentMarks";
import Users from "./pages/users/Users";
import ParentFees from "./pages/parent/ParentFees";
import StudentEnrollments from "./pages/studentEnrollments/StudentEnrollments";
import ClassSubjects from "./pages/classSubjects/ClassSubjects";
import TeacherAssignments from "./pages/teacherAssignments/TeacherAssignments";
import ParentAttendance from "./pages/parent/ParentAttendance";
import ParentNotifications from "./pages/parent/ParentNotifications";
import ParentAnnouncements from "./pages/parent/ParentAnnouncements";
import Attendance from "./pages/attendance/Attendance";
import Homework from "./pages/homework/Homework";
import HomeworkSubmissions from "./pages/homeworkSubmissions/HomeworkSubmissions";
import Examinations from "./pages/examinations/Examinations";
import ExamSubjects from "./pages/examSubjects/ExamSubjects";
import Marks from "./pages/marks/Marks";
import ParentChildProfile from "./pages/parent/ParentChildProfile";
import ParentLayout from "./components/layout/ParentLayout";
import FeeStructures from "./pages/feeStructures/FeeStructures";
import StudentFees from "./pages/studentFees/StudentFees";
import Payments from "./pages/payments/Payments";
import Notifications from "./pages/notifications/Notifications";
import Timetables from "./pages/timetables/Timetables";
import ParentStudentLinks from "./pages/parentStudentLinks/ParentStudentLinks";
import Announcements from "./pages/announcements/Announcements";

// Layout
import AdminLayout from "./components/layout/AdminLayout";
import TeacherLayout from "./components/layout/TeacherLayout";
import StudentLayout from "./components/layout/StudentLayout";
import ParentProfile from "./pages/parent/ParentProfile";
// Routes
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================================================= */}
        {/* PUBLIC ROUTES */}
        {/* ================================================= */}

        <Route path="/login" element={<Login />} />

        {/* ================================================= */}
        {/* PROTECTED ROUTES */}
        {/* ================================================= */}

        <Route element={<ProtectedRoute />}>
          {/* Common dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* ================================================= */}
          {/* ADMIN */}
          {/* ================================================= */}

          <Route element={<RoleRoute allowedRoles={["ADMIN"]} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />

              <Route path="/admin/students" element={<Students />} />

              <Route path="/admin/teachers" element={<Teachers />} />

              <Route path="/admin/parents" element={<Parents />} />
              <Route
                path="/admin/parent-student-links"
                element={<ParentStudentLinks />}
              />
              <Route
                path="/admin/student-enrollments"
                element={<StudentEnrollments />}
              />

              <Route path="/admin/classes" element={<Classes />} />

              <Route path="/admin/sections" element={<Sections />} />

              <Route path="/admin/subjects" element={<Subjects />} />

              <Route path="/admin/class-subjects" element={<ClassSubjects />} />

              <Route
                path="/admin/teacher-assignments"
                element={<TeacherAssignments />}
              />

              <Route path="/admin/attendance" element={<Attendance />} />

              <Route path="/admin/homework" element={<Homework />} />

              <Route
                path="/admin/homework-submissions"
                element={<HomeworkSubmissions />}
              />

              <Route path="/admin/exams" element={<Examinations />} />

              <Route path="/admin/exam-subjects" element={<ExamSubjects />} />

              <Route path="/admin/marks" element={<Marks />} />

              <Route path="/admin/fee-structures" element={<FeeStructures />} />

              <Route path="/admin/student-fees" element={<StudentFees />} />

              <Route path="/admin/payments" element={<Payments />} />

              <Route path="/admin/reports" element={<Reports />} />

              <Route path="/admin/timetable" element={<Timetables />} />

              <Route path="/admin/notifications" element={<Notifications />} />

              <Route path="/admin/users" element={<Users />} />

              <Route path="/admin/academic-years" element={<AcademicYears />} />

              <Route path="/admin/announcements" element={<Announcements />} />
            </Route>
          </Route>

          {/* ================================================= */}
          {/* TEACHER */}
          {/* ================================================= */}

          <Route element={<RoleRoute allowedRoles={["TEACHER"]} />}>
            <Route element={<TeacherLayout />}>
              <Route path="/teacher" element={<TeacherDashboard />} />

              <Route path="/teacher/classes" element={<MyClasses />} />

              <Route
                path="/teacher/homework-submissions"
                element={<TeacherHomeworkSubmissions />}
              />

              <Route
                path="/teacher/classes/:assignmentId"
                element={<TeacherClassDetails />}
              />

              <Route
                path="/teacher/examinations"
                element={<TeacherExaminations />}
              />

              <Route path="/teacher/students" element={<TeacherStudents />} />

              <Route path="/teacher/homework" element={<TeacherHomework />} />

              <Route
                path="/teacher/attendance"
                element={<TeacherAttendance />}
              />

              <Route path="/teacher/marks" element={<TeacherMarks />} />

              <Route
                path="/teacher/notifications"
                element={<TeacherNotifications />}
              />

              <Route
                path="/teacher/announcements"
                element={<TeacherAnnouncements />}
              />
            </Route>
          </Route>

          {/* ================================================= */}
          {/* STUDENT */}
          {/* ================================================= */}

          <Route element={<RoleRoute allowedRoles={["STUDENT"]} />}>
            <Route element={<StudentLayout />}>
              <Route path="/student" element={<StudentDashboard />} />

              <Route path="/student/profile" element={<StudentProfile />} />

              <Route path="/student/classes" element={<StudentClasses />} />

              <Route
                path="/student/attendance"
                element={<StudentAttendance />}
              />

              <Route path="/student/homework" element={<StudentHomework />} />

              <Route
                path="/student/homework-submissions"
                element={<StudentHomeworkSubmissions />}
              />

              <Route
                path="/student/examinations"
                element={<StudentExaminations />}
              />

              <Route path="/student/marks" element={<StudentMarks />} />

              <Route
                path="/student/announcements"
                element={<StudentAnnouncements />}
              />

              <Route
                path="/student/notifications"
                element={<StudentNotifications />}
              />
            </Route>
          </Route>

          {/* ================================================= */}
          {/* PARENT */}
          {/* ================================================= */}
          <Route element={<RoleRoute allowedRoles={["PARENT"]} />}>
            <Route element={<ParentLayout />}>
              <Route path="/parent" element={<ParentDashboard />} />
              <Route path="/parent/children" element={<ParentChildren />} />
              <Route
                path="/parent/profile/:studentId"
                element={<ParentChildProfile />}
              />
              <Route
                path="/parent/marks/:studentId"
                element={<ParentMarks />}
              />
              <Route
  path="/parent/profile"
  element={<ParentProfile />}
/>
              <Route
                path="/parent/notifications"
                element={<ParentNotifications />}
              />
              <Route
                path="/parent/homework/:studentId"
                element={<ParentHomework />}
              />
              <Route
                path="/parent/homework-submissions/:studentId"
                element={<ParentHomeworkSubmissions />}
              />
              <Route path="/parent/fees/:studentId" element={<ParentFees />} />
              <Route
                path="/parent/announcements"
                element={<ParentAnnouncements />}
              />
              <Route
                path="/parent/examinations/:studentId"
                element={<ParentExaminations />}
              />
              <Route
                path="/parent/attendance/:studentId"
                element={<ParentAttendance />}
              />
            </Route>
          </Route>

          {/* ================================================= */}
          {/* ACCOUNTANT */}
          {/* ================================================= */}

          <Route element={<RoleRoute allowedRoles={["ACCOUNTANT"]} />}>
            <Route path="/accountant" element={<AccountantDashboard />} />
          </Route>
        </Route>

        {/* ================================================= */}
        {/* FALLBACK */}
        {/* ================================================= */}

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
