from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.permissions import require_roles
from app.db.session import get_db

from app.models.timetable import Timetable
from app.models.academic_year import AcademicYear
from app.models.class_model import Class
from app.models.section import Section
from app.models.subject import Subject
from app.models.teacher import Teacher
from app.models.class_subject import ClassSubject

from app.schemas.timetable import (
    TimetableCreate,
    TimetableUpdate,
    TimetableResponse,
)


router = APIRouter(
    prefix="/timetables",
    tags=["Timetables"],
)


@router.post(
    "",
    response_model=TimetableResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_timetable(
    data: TimetableCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("ADMIN", "PRINCIPAL")
    ),
):
    academic_year = db.get(
        AcademicYear,
        data.academic_year_id,
    )

    if academic_year is None:
        raise HTTPException(
            status_code=404,
            detail="Academic year not found",
        )

    class_obj = db.get(Class, data.class_id)

    if class_obj is None:
        raise HTTPException(
            status_code=404,
            detail="Class not found",
        )

    if class_obj.academic_year_id != data.academic_year_id:
        raise HTTPException(
            status_code=400,
            detail="Class does not belong to this academic year",
        )

    section = db.get(Section, data.section_id)

    if section is None:
        raise HTTPException(
            status_code=404,
            detail="Section not found",
        )

    if section.class_id != data.class_id:
        raise HTTPException(
            status_code=400,
            detail="Section does not belong to this class",
        )

    subject = db.get(Subject, data.subject_id)

    if subject is None:
        raise HTTPException(
            status_code=404,
            detail="Subject not found",
        )

    class_subject = (
        db.query(ClassSubject)
        .filter(
            ClassSubject.class_id == data.class_id,
            ClassSubject.subject_id == data.subject_id,
        )
        .first()
    )

    if class_subject is None:
        raise HTTPException(
            status_code=400,
            detail="Subject is not assigned to this class",
        )

    teacher = db.get(Teacher, data.teacher_id)

    if teacher is None:
        raise HTTPException(
            status_code=404,
            detail="Teacher not found",
        )

    if not data.start_time or not data.end_time:
        raise HTTPException(
            status_code=400,
            detail="Start time and end time are required",
        )

    if data.start_time >= data.end_time:
        raise HTTPException(
            status_code=400,
            detail="End time must be after start time",
        )

    valid_days = {
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
        "SUNDAY",
    }

    if data.day_of_week.upper() not in valid_days:
        raise HTTPException(
            status_code=400,
            detail="Invalid day of week",
        )

    timetable = Timetable(
        academic_year_id=data.academic_year_id,
        class_id=data.class_id,
        section_id=data.section_id,
        subject_id=data.subject_id,
        teacher_id=data.teacher_id,
        day_of_week=data.day_of_week.upper(),
        start_time=data.start_time,
        end_time=data.end_time,
        room=data.room,
    )

    db.add(timetable)
    db.commit()
    db.refresh(timetable)

    return timetable


@router.get(
    "",
    response_model=list[TimetableResponse],
)
def get_timetables(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "ADMIN",
            "PRINCIPAL",
            "TEACHER",
        )
    ),
):
    return db.query(Timetable).all()


@router.get(
    "/{timetable_id}",
    response_model=TimetableResponse,
)
def get_timetable(
    timetable_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "ADMIN",
            "PRINCIPAL",
            "TEACHER",
        )
    ),
):
    timetable = db.get(Timetable, timetable_id)

    if timetable is None:
        raise HTTPException(
            status_code=404,
            detail="Timetable not found",
        )

    return timetable


@router.put(
    "/{timetable_id}",
    response_model=TimetableResponse,
)
def update_timetable(
    timetable_id: int,
    data: TimetableUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("ADMIN", "PRINCIPAL")
    ),
):
    timetable = db.get(Timetable, timetable_id)

    if timetable is None:
        raise HTTPException(
            status_code=404,
            detail="Timetable not found",
        )

    if data.start_time >= data.end_time:
        raise HTTPException(
            status_code=400,
            detail="End time must be after start time",
        )

    timetable.day_of_week = data.day_of_week.upper()
    timetable.start_time = data.start_time
    timetable.end_time = data.end_time
    timetable.room = data.room

    db.commit()
    db.refresh(timetable)

    return timetable


@router.delete("/{timetable_id}")
def delete_timetable(
    timetable_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("ADMIN")
    ),
):
    timetable = db.get(Timetable, timetable_id)

    if timetable is None:
        raise HTTPException(
            status_code=404,
            detail="Timetable not found",
        )

    db.delete(timetable)
    db.commit()

    return {
        "message": "Timetable deleted successfully"
    }