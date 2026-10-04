from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

from app.core.permissions import require_roles
from app.db.session import get_db

from app.models.announcement import Announcement
from app.models.class_model import Class
from app.models.parent import Parent
from app.models.parent_student_link import ParentStudentLink
from app.models.section import Section
from app.models.student import Student
from app.models.student_enrollment import StudentEnrollment

from app.schemas.announcement import (
    AnnouncementCreate,
    AnnouncementUpdate,
    AnnouncementResponse,
)


router = APIRouter(
    prefix="/announcements",
    tags=["Announcements"],
)


VALID_AUDIENCES = {
    "ALL",
    "STUDENT",
    "PARENT",
    "TEACHER",
    "CLASS",
    "SECTION",
}


# ============================================================
# CREATE ANNOUNCEMENT
# ============================================================

@router.post(
    "",
    response_model=AnnouncementResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_announcement(
    data: AnnouncementCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "ADMIN",
            "PRINCIPAL",
            "TEACHER",
        )
    ),
):
    audience = data.audience.upper()

    if audience not in VALID_AUDIENCES:
        raise HTTPException(
            status_code=400,
            detail="Invalid announcement audience",
        )

    # --------------------------------------------------------
    # Check class
    # --------------------------------------------------------

    if data.class_id is not None:
        class_obj = db.get(
            Class,
            data.class_id,
        )

        if class_obj is None:
            raise HTTPException(
                status_code=404,
                detail="Class not found",
            )

    # --------------------------------------------------------
    # Check section
    # --------------------------------------------------------

    if data.section_id is not None:
        section = db.get(
            Section,
            data.section_id,
        )

        if section is None:
            raise HTTPException(
                status_code=404,
                detail="Section not found",
            )

        if (
            data.class_id is not None
            and section.class_id != data.class_id
        ):
            raise HTTPException(
                status_code=400,
                detail="Section does not belong to this class",
            )

    # --------------------------------------------------------
    # Create announcement
    # --------------------------------------------------------

    announcement = Announcement(
        title=data.title,
        description=data.description,
        audience=audience,
        class_id=data.class_id,
        section_id=data.section_id,
        created_by=current_user.id,
        expires_at=data.expires_at,
    )

    db.add(announcement)
    db.commit()
    db.refresh(announcement)

    return announcement


# ============================================================
# ADMIN / PRINCIPAL / TEACHER
# ALL ACTIVE ANNOUNCEMENTS
# ============================================================

@router.get(
    "",
    response_model=list[AnnouncementResponse],
)
def get_announcements(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "ADMIN",
            "PRINCIPAL",
            "TEACHER",
        )
    ),
):
    now = datetime.now(timezone.utc)

    return (
        db.query(Announcement)
        .filter(
            or_(
                Announcement.expires_at.is_(None),
                Announcement.expires_at >= now,
            )
        )
        .order_by(
            Announcement.created_at.desc()
        )
        .all()
    )


# ============================================================
# STUDENT
# MY ANNOUNCEMENTS
# ============================================================

@router.get(
    "/me",
    response_model=list[AnnouncementResponse],
)
def get_my_announcements(
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
    # Current time
    # --------------------------------------------------------

    now = datetime.now(timezone.utc)

    # --------------------------------------------------------
    # Student-visible announcements
    #
    # ALL       -> Everyone
    # STUDENT   -> All students
    # CLASS     -> Student's class
    # SECTION   -> Student's section
    # --------------------------------------------------------

    audience_filter = or_(
        Announcement.audience == "ALL",

        Announcement.audience == "STUDENT",

        and_(
            Announcement.audience == "CLASS",
            Announcement.class_id == enrollment.class_id,
        ),

        and_(
            Announcement.audience == "SECTION",
            Announcement.section_id == enrollment.section_id,
        ),
    )

    announcements = (
        db.query(Announcement)
        .filter(
            or_(
                Announcement.expires_at.is_(None),
                Announcement.expires_at >= now,
            ),
            audience_filter,
        )
        .order_by(
            Announcement.created_at.desc()
        )
        .all()
    )

    return announcements


# ============================================================
# PARENT
# MY CHILDREN'S ANNOUNCEMENTS
# ============================================================

@router.get(
    "/parent/me",
    response_model=list[AnnouncementResponse],
)
def get_parent_announcements(
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
    # Find children linked to parent
    # --------------------------------------------------------

    links = (
        db.query(ParentStudentLink)
        .filter(
            ParentStudentLink.parent_id == parent.id
        )
        .all()
    )

    if not links:
        return []

    student_ids = [
        link.student_id
        for link in links
    ]

    # --------------------------------------------------------
    # Find active enrollments
    # --------------------------------------------------------

    enrollments = (
        db.query(StudentEnrollment)
        .filter(
            StudentEnrollment.student_id.in_(student_ids),
            StudentEnrollment.status == "ACTIVE",
        )
        .order_by(
            StudentEnrollment.id.desc()
        )
        .all()
    )

    if not enrollments:
        return []

    # --------------------------------------------------------
    # Keep latest active enrollment per child
    # --------------------------------------------------------

    latest_enrollment_by_student = {}

    for enrollment in enrollments:
        if enrollment.student_id not in latest_enrollment_by_student:
            latest_enrollment_by_student[
                enrollment.student_id
            ] = enrollment

    # --------------------------------------------------------
    # Collect children's classes and sections
    # --------------------------------------------------------

    class_ids = {
        enrollment.class_id
        for enrollment in latest_enrollment_by_student.values()
    }

    section_ids = {
        enrollment.section_id
        for enrollment in latest_enrollment_by_student.values()
        if enrollment.section_id is not None
    }

    # --------------------------------------------------------
    # Current time
    # --------------------------------------------------------

    now = datetime.now(timezone.utc)

    # --------------------------------------------------------
    # Parent-visible announcements
    #
    # ALL       -> Everyone
    # PARENT    -> All parents
    # CLASS     -> Any child's class
    # SECTION   -> Any child's section
    #
    # Expired announcements are excluded.
    # --------------------------------------------------------

    audience_conditions = [
        Announcement.audience == "ALL",
        Announcement.audience == "PARENT",
    ]

    if class_ids:
        audience_conditions.append(
            and_(
                Announcement.audience == "CLASS",
                Announcement.class_id.in_(class_ids),
            )
        )

    if section_ids:
        audience_conditions.append(
            and_(
                Announcement.audience == "SECTION",
                Announcement.section_id.in_(section_ids),
            )
        )

    announcements = (
        db.query(Announcement)
        .filter(
            or_(
                Announcement.expires_at.is_(None),
                Announcement.expires_at >= now,
            ),
            or_(*audience_conditions),
        )
        .order_by(
            Announcement.created_at.desc()
        )
        .all()
    )

    return announcements


# ============================================================
# GET SINGLE ANNOUNCEMENT
# ============================================================

@router.get(
    "/{announcement_id}",
    response_model=AnnouncementResponse,
)
def get_announcement(
    announcement_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "ADMIN",
            "PRINCIPAL",
            "TEACHER",
            "STUDENT",
            "PARENT",
        )
    ),
):
    announcement = db.get(
        Announcement,
        announcement_id,
    )

    if announcement is None:
        raise HTTPException(
            status_code=404,
            detail="Announcement not found",
        )

    return announcement


# ============================================================
# UPDATE ANNOUNCEMENT
# ============================================================

@router.put(
    "/{announcement_id}",
    response_model=AnnouncementResponse,
)
def update_announcement(
    announcement_id: int,
    data: AnnouncementUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "ADMIN",
            "PRINCIPAL",
            "TEACHER",
        )
    ),
):
    announcement = db.get(
        Announcement,
        announcement_id,
    )

    if announcement is None:
        raise HTTPException(
            status_code=404,
            detail="Announcement not found",
        )

    audience = data.audience.upper()

    if audience not in VALID_AUDIENCES:
        raise HTTPException(
            status_code=400,
            detail="Invalid announcement audience",
        )

    # --------------------------------------------------------
    # Check class
    # --------------------------------------------------------

    if data.class_id is not None:
        class_obj = db.get(
            Class,
            data.class_id,
        )

        if class_obj is None:
            raise HTTPException(
                status_code=404,
                detail="Class not found",
            )

    # --------------------------------------------------------
    # Check section
    # --------------------------------------------------------

    if data.section_id is not None:
        section = db.get(
            Section,
            data.section_id,
        )

        if section is None:
            raise HTTPException(
                status_code=404,
                detail="Section not found",
            )

        if (
            data.class_id is not None
            and section.class_id != data.class_id
        ):
            raise HTTPException(
                status_code=400,
                detail="Section does not belong to this class",
            )

    # --------------------------------------------------------
    # Update announcement
    # --------------------------------------------------------

    announcement.title = data.title
    announcement.description = data.description
    announcement.audience = audience
    announcement.class_id = data.class_id
    announcement.section_id = data.section_id
    announcement.expires_at = data.expires_at

    db.commit()
    db.refresh(announcement)

    return announcement


# ============================================================
# DELETE ANNOUNCEMENT
# ============================================================

@router.delete(
    "/{announcement_id}"
)
def delete_announcement(
    announcement_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("ADMIN")
    ),
):
    announcement = db.get(
        Announcement,
        announcement_id,
    )

    if announcement is None:
        raise HTTPException(
            status_code=404,
            detail="Announcement not found",
        )

    db.delete(announcement)
    db.commit()

    return {
        "message": "Announcement deleted successfully"
    }