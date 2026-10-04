from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.permissions import require_roles
from app.db.session import get_db

from app.models.mark import Mark
from app.models.exam_subject import ExamSubject
from app.models.examination import Examination
from app.models.student import Student
from app.models.student_enrollment import StudentEnrollment
from app.models.subject import Subject
from app.models.parent import Parent
from app.models.parent_student_link import ParentStudentLink

from app.schemas.mark import (
    MarkCreate,
    MarkUpdate,
    MarkResponse,
)


router = APIRouter(
    prefix="/marks",
    tags=["Marks"],
)


# ============================================================
# CREATE MARK
# ============================================================

@router.post(
    "",
    response_model=MarkResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_mark(
    data: MarkCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "ADMIN",
            "PRINCIPAL",
            "TEACHER",
        )
    ),
):
    exam_subject = db.get(
        ExamSubject,
        data.exam_subject_id,
    )

    if exam_subject is None:
        raise HTTPException(
            status_code=404,
            detail="Exam subject not found",
        )

    examination = db.get(
        Examination,
        exam_subject.examination_id,
    )

    if examination is None:
        raise HTTPException(
            status_code=404,
            detail="Examination not found",
        )

    student = db.get(
        Student,
        data.student_id,
    )

    if student is None:
        raise HTTPException(
            status_code=404,
            detail="Student not found",
        )

    enrollment = (
        db.query(StudentEnrollment)
        .filter(
            StudentEnrollment.student_id
            == data.student_id,
            StudentEnrollment.class_id
            == exam_subject.class_id,
            StudentEnrollment.academic_year_id
            == examination.academic_year_id,
            StudentEnrollment.status == "ACTIVE",
        )
        .first()
    )

    if enrollment is None:
        raise HTTPException(
            status_code=400,
            detail=(
                "Student is not actively enrolled in this "
                "class for the examination academic year"
            ),
        )

    if data.marks_obtained < 0:
        raise HTTPException(
            status_code=400,
            detail="Marks cannot be negative",
        )

    if data.marks_obtained > exam_subject.max_marks:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Marks cannot be greater than "
                f"{exam_subject.max_marks}"
            ),
        )

    existing = (
        db.query(Mark)
        .filter(
            Mark.exam_subject_id
            == data.exam_subject_id,
            Mark.student_id
            == data.student_id,
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Marks already entered for this student",
        )

    mark = Mark(
        exam_subject_id=data.exam_subject_id,
        student_id=data.student_id,
        marks_obtained=data.marks_obtained,
        grade=data.grade,
        remarks=data.remarks,
    )

    db.add(mark)
    db.commit()
    db.refresh(mark)

    return mark


# ============================================================
# GET ALL MARKS
# ============================================================

@router.get(
    "",
    response_model=list[MarkResponse],
)
def get_marks(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "ADMIN",
            "PRINCIPAL",
            "TEACHER",
        )
    ),
):
    return (
        db.query(Mark)
        .order_by(Mark.id.desc())
        .all()
    )


# ============================================================
# STUDENT - MY MARKS / RESULTS
# ============================================================

@router.get(
    "/me",
)
def get_my_marks(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("STUDENT")
    ),
):
    # --------------------------------------------------------
    # Find student profile
    # --------------------------------------------------------

    student = (
        db.query(Student)
        .filter(
            Student.user_id == current_user.id
        )
        .first()
    )

    if student is None:
        raise HTTPException(
            status_code=404,
            detail="Student profile not found for this account",
        )

    # --------------------------------------------------------
    # Find active enrollment
    # --------------------------------------------------------

    enrollment = (
        db.query(StudentEnrollment)
        .filter(
            StudentEnrollment.student_id == student.id,
            StudentEnrollment.status == "ACTIVE",
        )
        .order_by(
            StudentEnrollment.id.desc()
        )
        .first()
    )

    if enrollment is None:
        return []

    # --------------------------------------------------------
    # Get marks for student's active class
    # --------------------------------------------------------

    rows = (
        db.query(
            Mark,
            ExamSubject,
            Examination,
            Subject,
        )
        .join(
            ExamSubject,
            ExamSubject.id == Mark.exam_subject_id,
        )
        .join(
            Examination,
            Examination.id == ExamSubject.examination_id,
        )
        .join(
            Subject,
            Subject.id == ExamSubject.subject_id,
        )
        .filter(
            Mark.student_id == student.id,
            ExamSubject.class_id == enrollment.class_id,
            Examination.academic_year_id
            == enrollment.academic_year_id,
        )
        .order_by(
            Examination.start_date.desc(),
            ExamSubject.exam_date.asc(),
            Mark.id.asc(),
        )
        .all()
    )

    result = []

    for (
        mark,
        exam_subject,
        examination,
        subject,
    ) in rows:

        percentage = (
            mark.marks_obtained
            / exam_subject.max_marks
            * 100
            if exam_subject.max_marks > 0
            else 0
        )

        result.append(
            {
                "mark_id": mark.id,
                "exam_subject_id": exam_subject.id,

                "examination_id": examination.id,
                "examination_name": examination.name,
                "examination_status": examination.status,
                "start_date": examination.start_date,
                "end_date": examination.end_date,

                "subject_id": subject.id,
                "subject_name": subject.name,

                "marks_obtained": mark.marks_obtained,
                "max_marks": exam_subject.max_marks,
                "passing_marks": exam_subject.passing_marks,

                "percentage": round(
                    percentage,
                    2,
                ),

                "grade": mark.grade,
                "remarks": mark.remarks,

                "result_status": (
                    "PASS"
                    if mark.marks_obtained
                    >= exam_subject.passing_marks
                    else "FAIL"
                ),
            }
        )

    return result


# ============================================================
# PARENT - CHILD MARKS / RESULTS
# ============================================================

@router.get(
    "/parent/{student_id}",
)
def get_child_marks(
    student_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("PARENT")
    ),
):
    # --------------------------------------------------------
    # Find parent profile
    # --------------------------------------------------------

    parent = (
        db.query(Parent)
        .filter(
            Parent.user_id == current_user.id
        )
        .first()
    )

    if parent is None:
        raise HTTPException(
            status_code=404,
            detail="Parent profile not found for this account",
        )

    # --------------------------------------------------------
    # Verify parent-child relationship
    # --------------------------------------------------------

    link = (
        db.query(ParentStudentLink)
        .filter(
            ParentStudentLink.parent_id == parent.id,
            ParentStudentLink.student_id == student_id,
        )
        .first()
    )

    if link is None:
        raise HTTPException(
            status_code=403,
            detail=(
                "You are not authorized to view "
                "this student's marks"
            ),
        )

    # --------------------------------------------------------
    # Find student
    # --------------------------------------------------------

    student = db.get(
        Student,
        student_id,
    )

    if student is None:
        raise HTTPException(
            status_code=404,
            detail="Student not found",
        )

    # --------------------------------------------------------
    # Find active enrollment
    # --------------------------------------------------------

    enrollment = (
        db.query(StudentEnrollment)
        .filter(
            StudentEnrollment.student_id == student_id,
            StudentEnrollment.status == "ACTIVE",
        )
        .order_by(
            StudentEnrollment.id.desc()
        )
        .first()
    )

    if enrollment is None:
        return []

    # --------------------------------------------------------
    # Get marks for child's active class/year
    # --------------------------------------------------------

    rows = (
        db.query(
            Mark,
            ExamSubject,
            Examination,
            Subject,
        )
        .join(
            ExamSubject,
            ExamSubject.id == Mark.exam_subject_id,
        )
        .join(
            Examination,
            Examination.id == ExamSubject.examination_id,
        )
        .join(
            Subject,
            Subject.id == ExamSubject.subject_id,
        )
        .filter(
            Mark.student_id == student_id,
            ExamSubject.class_id == enrollment.class_id,
            Examination.academic_year_id
            == enrollment.academic_year_id,
        )
        .order_by(
            Examination.start_date.desc(),
            ExamSubject.exam_date.asc(),
            Mark.id.asc(),
        )
        .all()
    )

    result = []

    for (
        mark,
        exam_subject,
        examination,
        subject,
    ) in rows:

        percentage = (
            mark.marks_obtained
            / exam_subject.max_marks
            * 100
            if exam_subject.max_marks > 0
            else 0
        )

        result.append(
            {
                "mark_id": mark.id,
                "exam_subject_id": exam_subject.id,

                "examination_id": examination.id,
                "examination_name": examination.name,
                "examination_status": examination.status,
                "start_date": examination.start_date,
                "end_date": examination.end_date,

                "subject_id": subject.id,
                "subject_name": subject.name,

                "marks_obtained": mark.marks_obtained,
                "max_marks": exam_subject.max_marks,
                "passing_marks": exam_subject.passing_marks,

                "percentage": round(
                    percentage,
                    2,
                ),

                "grade": mark.grade,
                "remarks": mark.remarks,

                "result_status": (
                    "PASS"
                    if mark.marks_obtained
                    >= exam_subject.passing_marks
                    else "FAIL"
                ),
            }
        )

    return result


# ============================================================
# GET SINGLE MARK
# ============================================================

@router.get(
    "/{mark_id}",
    response_model=MarkResponse,
)
def get_mark(
    mark_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "ADMIN",
            "PRINCIPAL",
            "TEACHER",
        )
    ),
):
    mark = db.get(
        Mark,
        mark_id,
    )

    if mark is None:
        raise HTTPException(
            status_code=404,
            detail="Mark not found",
        )

    return mark


# ============================================================
# UPDATE MARK
# ============================================================

@router.put(
    "/{mark_id}",
    response_model=MarkResponse,
)
def update_mark(
    mark_id: int,
    data: MarkUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "ADMIN",
            "PRINCIPAL",
            "TEACHER",
        )
    ),
):
    mark = db.get(
        Mark,
        mark_id,
    )

    if mark is None:
        raise HTTPException(
            status_code=404,
            detail="Mark not found",
        )

    exam_subject = db.get(
        ExamSubject,
        mark.exam_subject_id,
    )

    if exam_subject is None:
        raise HTTPException(
            status_code=404,
            detail="Exam subject not found",
        )

    if data.marks_obtained < 0:
        raise HTTPException(
            status_code=400,
            detail="Marks cannot be negative",
        )

    if data.marks_obtained > exam_subject.max_marks:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Marks cannot be greater than "
                f"{exam_subject.max_marks}"
            ),
        )

    mark.marks_obtained = data.marks_obtained
    mark.grade = data.grade
    mark.remarks = data.remarks

    db.commit()
    db.refresh(mark)

    return mark


# ============================================================
# DELETE MARK
# ============================================================

@router.delete(
    "/{mark_id}"
)
def delete_mark(
    mark_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("ADMIN")
    ),
):
    mark = db.get(
        Mark,
        mark_id,
    )

    if mark is None:
        raise HTTPException(
            status_code=404,
            detail="Mark not found",
        )

    db.delete(mark)
    db.commit()

    return {
        "message": "Mark deleted successfully"
    }