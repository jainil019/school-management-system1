from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
    status,
)
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.permissions import require_roles
from app.db.session import get_db

from app.models.homework import Homework
from app.models.homework_submission import HomeworkSubmission
from app.models.student import Student
from app.models.teacher import Teacher
from app.models.parent import Parent
from app.models.parent_student_link import ParentStudentLink

from app.schemas.homework_submission import (
    HomeworkSubmissionCreate,
    HomeworkSubmissionUpdate,
    HomeworkSubmissionResponse,
)

router = APIRouter(
    prefix="/homework-submissions",
    tags=["Homework Submissions"],
)


# ============================================================
# UPLOAD DIRECTORY
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[3]

HOMEWORK_UPLOAD_DIR = (
    BASE_DIR / "uploads" / "homework"
)

HOMEWORK_UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


# Maximum PDF size = 10 MB
MAX_FILE_SIZE = 10 * 1024 * 1024


# ============================================================
# CREATE SUBMISSION
# ============================================================

@router.post(
    "",
    response_model=HomeworkSubmissionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_submission(
    data: HomeworkSubmissionCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "ADMIN",
            "PRINCIPAL",
            "TEACHER",
            "STUDENT",
        )
    ),
):
    homework = db.get(
        Homework,
        data.homework_id,
    )

    if homework is None:
        raise HTTPException(
            status_code=404,
            detail="Homework not found",
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

    # --------------------------------------------------------
    # STUDENT SECURITY
    # --------------------------------------------------------

    if current_user.role.name == "STUDENT":

        current_student = db.scalar(
            select(Student).where(
                Student.user_id == current_user.id
            )
        )

        if current_student is None:
            raise HTTPException(
                status_code=404,
                detail="Student profile not found for this account",
            )

        if current_student.id != data.student_id:
            raise HTTPException(
                status_code=403,
                detail="You can only submit homework for your own account",
            )

    # --------------------------------------------------------
    # PREVENT DUPLICATE
    # --------------------------------------------------------

    existing = db.scalar(
        select(HomeworkSubmission).where(
            HomeworkSubmission.homework_id
            == data.homework_id,
            HomeworkSubmission.student_id
            == data.student_id,
        )
    )

    if existing is not None:
        raise HTTPException(
            status_code=400,
            detail="Student has already submitted this homework",
        )

    submission = HomeworkSubmission(
        homework_id=data.homework_id,
        student_id=data.student_id,
        file_url=data.file_url,
        submitted_at=datetime.now(timezone.utc),
        status="SUBMITTED",
    )

    db.add(submission)
    db.commit()
    db.refresh(submission)

    return submission


# ============================================================
# UPLOAD PDF
# ============================================================

@router.post(
    "/upload",
)
async def upload_homework_pdf(
    file: UploadFile = File(...),
    current_user=Depends(
        require_roles("STUDENT")
    ),
):
    """
    Upload a PDF homework submission.

    Only logged-in students can upload.
    Maximum file size: 10 MB.
    """

    # --------------------------------------------------------
    # CHECK FILE NAME
    # --------------------------------------------------------

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file selected",
        )

    # --------------------------------------------------------
    # CHECK EXTENSION
    # --------------------------------------------------------

    extension = Path(file.filename).suffix.lower()

    if extension != ".pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed",
        )

    # --------------------------------------------------------
    # CHECK CONTENT TYPE
    # --------------------------------------------------------

    if file.content_type not in (
        "application/pdf",
        "application/octet-stream",
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid PDF file type",
        )

    # --------------------------------------------------------
    # READ FILE
    # --------------------------------------------------------

    file_data = await file.read()

    # --------------------------------------------------------
    # CHECK SIZE
    # --------------------------------------------------------

    if len(file_data) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="PDF file size must not exceed 10 MB",
        )

    if len(file_data) == 0:
        raise HTTPException(
            status_code=400,
            detail="PDF file is empty",
        )

    # --------------------------------------------------------
    # CHECK PDF SIGNATURE
    # --------------------------------------------------------

    if not file_data.startswith(b"%PDF-"):
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is not a valid PDF",
        )

    # --------------------------------------------------------
    # CREATE UNIQUE FILE NAME
    # --------------------------------------------------------

    filename = f"{uuid4().hex}.pdf"

    file_path = (
        HOMEWORK_UPLOAD_DIR / filename
    )

    # --------------------------------------------------------
    # SAVE FILE
    # --------------------------------------------------------

    file_path.write_bytes(file_data)

    # --------------------------------------------------------
    # RETURN URL
    # --------------------------------------------------------

    return {
        "message": "PDF uploaded successfully",
        "file_url": f"/uploads/homework/{filename}",
        "filename": filename,
        "size": len(file_data),
    }


# ============================================================
# STUDENT: MY SUBMISSIONS
# ============================================================

@router.get(
    "/me",
    response_model=list[HomeworkSubmissionResponse],
)
def get_my_submissions(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("STUDENT")
    ),
):
    student = db.scalar(
        select(Student).where(
            Student.user_id == current_user.id
        )
    )

    if student is None:
        raise HTTPException(
            status_code=404,
            detail="Student profile not found for this account",
        )

    statement = (
        select(HomeworkSubmission)
        .where(
            HomeworkSubmission.student_id
            == student.id
        )
        .order_by(
            HomeworkSubmission.id.desc()
        )
    )

    return db.scalars(statement).all()


# ============================================================
# PARENT: CHILD SUBMISSIONS
# ============================================================

@router.get(
    "/parent/{student_id}",
    response_model=list[HomeworkSubmissionResponse],
)
def get_child_submissions(
    student_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("PARENT")
    ),
):
    """
    Return homework submissions for a child linked
    to the currently logged-in parent.
    """

    # --------------------------------------------------------
    # 1. Find parent profile
    # --------------------------------------------------------

    parent = db.scalar(
        select(Parent).where(
            Parent.user_id == current_user.id
        )
    )

    if parent is None:
        raise HTTPException(
            status_code=404,
            detail="Parent profile not found for this account",
        )

    # --------------------------------------------------------
    # 2. Verify parent-child relationship
    # --------------------------------------------------------

    link = db.scalar(
        select(ParentStudentLink).where(
            ParentStudentLink.parent_id == parent.id,
            ParentStudentLink.student_id == student_id,
        )
    )

    if link is None:
        raise HTTPException(
            status_code=403,
            detail=(
                "You are not authorized to view "
                "this student's homework submissions"
            ),
        )

    # --------------------------------------------------------
    # 3. Verify student exists
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
    # 4. Get child's submissions
    # --------------------------------------------------------

    statement = (
        select(HomeworkSubmission)
        .where(
            HomeworkSubmission.student_id
            == student_id
        )
        .order_by(
            HomeworkSubmission.id.desc()
        )
    )

    return db.scalars(statement).all()


# ============================================================
# ADMIN / PRINCIPAL / TEACHER
# ============================================================

@router.get(
    "",
    response_model=list[HomeworkSubmissionResponse],
)
def get_submissions(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "ADMIN",
            "PRINCIPAL",
            "TEACHER",
        )
    ),
):
    statement = (
        select(HomeworkSubmission)
        .order_by(
            HomeworkSubmission.id.desc()
        )
    )

    return db.scalars(statement).all()


# ============================================================
# SINGLE SUBMISSION
# ============================================================

@router.get(
    "/{submission_id}",
    response_model=HomeworkSubmissionResponse,
)
def get_submission(
    submission_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "ADMIN",
            "PRINCIPAL",
            "TEACHER",
            "STUDENT",
        )
    ),
):
    submission = db.get(
        HomeworkSubmission,
        submission_id,
    )

    if submission is None:
        raise HTTPException(
            status_code=404,
            detail="Homework submission not found",
        )

    # --------------------------------------------------------
    # Student can only view their own submission
    # --------------------------------------------------------

    if current_user.role.name == "STUDENT":

        student = db.scalar(
            select(Student).where(
                Student.user_id == current_user.id
            )
        )

        if student is None:
            raise HTTPException(
                status_code=404,
                detail="Student profile not found for this account",
            )

        if submission.student_id != student.id:
            raise HTTPException(
                status_code=403,
                detail="You can only view your own submissions",
            )

    return submission


# ============================================================
# REVIEW SUBMISSION
# ============================================================

@router.put(
    "/{submission_id}",
    response_model=HomeworkSubmissionResponse,
)
def review_submission(
    submission_id: int,
    data: HomeworkSubmissionUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "ADMIN",
            "PRINCIPAL",
            "TEACHER",
        )
    ),
):
    submission = db.get(
        HomeworkSubmission,
        submission_id,
    )

    if submission is None:
        raise HTTPException(
            status_code=404,
            detail="Homework submission not found",
        )

    allowed_statuses = [
        "SUBMITTED",
        "REVIEWED",
        "LATE",
        "REJECTED",
    ]

    if data.status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Invalid submission status",
        )

    teacher = db.scalar(
        select(Teacher).where(
            Teacher.user_id == current_user.id
        )
    )

    if teacher is None:
        raise HTTPException(
            status_code=400,
            detail="Current user is not linked to a teacher account",
        )

    submission.status = data.status
    submission.feedback = data.feedback
    submission.reviewed_by = teacher.id

    db.commit()
    db.refresh(submission)

    return submission


# ============================================================
# DELETE
# ============================================================

@router.delete(
    "/{submission_id}"
)
def delete_submission(
    submission_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "ADMIN",
            "PRINCIPAL",
        )
    ),
):
    submission = db.get(
        HomeworkSubmission,
        submission_id,
    )

    if submission is None:
        raise HTTPException(
            status_code=404,
            detail="Homework submission not found",
        )

    db.delete(submission)
    db.commit()

    return {
        "message": "Homework submission deleted successfully",
        "submission_id": submission_id,
    }