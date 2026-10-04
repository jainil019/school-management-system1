from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.admin import router as admin_router
from app.api.v1.students import router as students_router
from app.api.v1.teachers import router as teachers_router
from app.api.v1.academic_years import router as academic_years_router
from app.api.v1.classes import router as classes_router
from app.api.v1.sections import router as sections_router
from app.api.v1.student_enrollments import router as student_enrollments_router
from app.api.v1.subjects import router as subjects_router
from app.api.v1.class_subjects import router as class_subjects_router
from app.api.v1.users import router as users_router
from app.api.v1.teacher_assignments import (
    router as teacher_assignments_router,
)
from app.api.v1.parents import router as parents_router
from app.api.v1.parent_student_links import (
    router as parent_student_links_router,
)
from app.api.v1.attendance import router as attendance_router
from app.api.v1.homework import router as homework_router
from app.api.v1.homework_submissions import (
    router as homework_submissions_router,
)
from app.api.v1.exam_subjects import router as exam_subjects_router
from app.api.v1.marks import router as marks_router
from app.api.v1.fee_structures import (
    router as fee_structures_router,
)
from app.api.v1.student_fees import (
    router as student_fees_router,
)
from app.api.v1.payments import router as payments_router
from app.api.v1.timetables import router as timetables_router
from app.api.v1.announcements import (
    router as announcements_router,
)
from app.api.v1.notifications import (
    router as notifications_router,
)
from app.api.v1.examinations import (
    router as examinations_router,
)

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth_router)
api_router.include_router(payments_router)
api_router.include_router(examinations_router)
api_router.include_router(admin_router)
api_router.include_router(notifications_router)
api_router.include_router(announcements_router)
api_router.include_router(timetables_router)
api_router.include_router(student_fees_router)
api_router.include_router(students_router)
api_router.include_router(teachers_router)
api_router.include_router(fee_structures_router)
api_router.include_router(academic_years_router)
api_router.include_router(marks_router)
api_router.include_router(classes_router)
api_router.include_router(sections_router)
api_router.include_router(student_enrollments_router)
api_router.include_router(subjects_router)
api_router.include_router(users_router)
api_router.include_router(class_subjects_router)
api_router.include_router(
    teacher_assignments_router
)
api_router.include_router(parents_router)
api_router.include_router(
    parent_student_links_router
)
api_router.include_router(attendance_router)
api_router.include_router(homework_router)
api_router.include_router(
    homework_submissions_router
)
api_router.include_router(exam_subjects_router)