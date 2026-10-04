from datetime import date, datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.permissions import require_roles
from app.db.session import get_db

from app.models.announcement import Announcement
from app.models.attendance import Attendance
from app.models.examination import Examination
from app.models.parent import Parent
from app.models.payment import Payment
from app.models.student import Student
from app.models.teacher import Teacher
from app.models.user import User


router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
)


def _count_active(db: Session, model) -> int:
    """
    Count active records when the model has a status column.
    """

    return int(
        db.query(func.count(model.id))
        .filter(model.status == "ACTIVE")
        .scalar()
        or 0
    )


def _time_value(
    value: datetime | date | None,
) -> str:

    if value is None:
        return ""

    if isinstance(value, datetime):
        return value.isoformat()

    return value.isoformat()


@router.get("/dashboard")
def admin_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("ADMIN")
    ),
):

    # ========================================================
    # DATE RANGE
    # ========================================================

    today = date.today()

    week_start = today - timedelta(
        days=today.weekday()
    )


    # ========================================================
    # PEOPLE COUNTS
    # ========================================================

    total_students = _count_active(
        db,
        Student,
    )

    total_teachers = _count_active(
        db,
        Teacher,
    )

    total_parents = int(
        db.query(
            func.count(Parent.id)
        ).scalar()
        or 0
    )


    # ========================================================
    # FEES
    # ========================================================

    fees_collected = float(
        db.query(
            func.coalesce(
                func.sum(Payment.amount),
                0,
            )
        ).scalar()
        or 0
    )


    # ========================================================
    # ATTENDANCE
    # ========================================================

    attendance_rows = (
        db.query(Attendance.status)
        .filter(
            Attendance.date >= week_start,
            Attendance.date <= today,
        )
        .all()
    )


    attendance_counts = {
        "PRESENT": 0,
        "LATE": 0,
        "ABSENT": 0,
        "LEAVE": 0,
    }


    for (status,) in attendance_rows:

        key = str(status).upper()

        if key in attendance_counts:
            attendance_counts[key] += 1


    total_attendance = sum(
        attendance_counts.values()
    )


    if total_attendance:

        attendance_rate = round(
            (
                attendance_counts["PRESENT"]
                / total_attendance
            )
            * 100,
            1,
        )

    else:

        attendance_rate = 0.0


    # ========================================================
    # RECENT ACTIVITY
    # ========================================================

    activities: list[dict] = []


    # --------------------------------------------------------
    # STUDENTS
    # --------------------------------------------------------

    students = (
        db.query(Student)
        .order_by(
            Student.created_at.desc()
        )
        .limit(5)
        .all()
    )


    for item in students:

        activities.append(
            {
                "id": f"student-{item.id}",
                "type": "student",
                "title": "New student registered",
                "description": (
                    f"{item.first_name} "
                    f"{item.last_name} was added"
                ),
                "occurred_at": _time_value(
                    item.created_at
                ),
            }
        )


    # --------------------------------------------------------
    # TEACHERS
    # --------------------------------------------------------

    teachers = (
        db.query(Teacher)
        .order_by(
            Teacher.created_at.desc()
        )
        .limit(5)
        .all()
    )


    for item in teachers:

        activities.append(
            {
                "id": f"teacher-{item.id}",
                "type": "teacher",
                "title": "New teacher added",
                "description": (
                    f"{item.first_name} "
                    f"{item.last_name} was added"
                ),
                "occurred_at": _time_value(
                    item.created_at
                ),
            }
        )


    # --------------------------------------------------------
    # PAYMENTS
    # --------------------------------------------------------

    payments = (
        db.query(Payment)
        .order_by(
            Payment.paid_at.desc()
        )
        .limit(5)
        .all()
    )


    for item in payments:

        activities.append(
            {
                "id": f"payment-{item.id}",
                "type": "payment",
                "title": "Fee payment received",
                "description": (
                    f"₹{float(item.amount):,.2f}"
                    f" • Receipt {item.receipt_no}"
                ),
                "occurred_at": _time_value(
                    item.paid_at
                ),
            }
        )


    # --------------------------------------------------------
    # ATTENDANCE ACTIVITY
    # --------------------------------------------------------

    attendance_activity = (
        db.query(Attendance)
        .order_by(
            Attendance.created_at.desc()
        )
        .limit(5)
        .all()
    )


    for item in attendance_activity:

        activities.append(
            {
                "id": f"attendance-{item.id}",
                "type": "attendance",
                "title": "Attendance updated",
                "description": (
                    f"Student #{item.student_id} "
                    f"marked {item.status}"
                ),
                "occurred_at": _time_value(
                    item.created_at
                ),
            }
        )


    # --------------------------------------------------------
    # ANNOUNCEMENTS
    # --------------------------------------------------------

    announcements = (
        db.query(Announcement)
        .order_by(
            Announcement.created_at.desc()
        )
        .limit(5)
        .all()
    )


    for item in announcements:

        activities.append(
            {
                "id": f"announcement-{item.id}",
                "type": "announcement",
                "title": "New announcement",
                "description": item.title,
                "occurred_at": _time_value(
                    item.created_at
                ),
            }
        )


    # Sort all activity together

    activities.sort(
        key=lambda item: item["occurred_at"],
        reverse=True,
    )


    # ========================================================
    # UPCOMING EXAMS
    # ========================================================

    upcoming_exams = (
        db.query(Examination)
        .filter(
            Examination.end_date >= today
        )
        .order_by(
            Examination.start_date.asc()
        )
        .limit(5)
        .all()
    )


    # ========================================================
    # RESPONSE
    # ========================================================

    return {
        "message": "Welcome to the Admin Dashboard",

        "user_id": current_user.id,

        "email": current_user.email,

        "role": current_user.role.name,

        "total_students": total_students,

        "total_teachers": total_teachers,

        "total_parents": total_parents,

        "fees_collected": round(
            fees_collected,
            2,
        ),

        "attendance": {
            "total_records": total_attendance,

            "present": attendance_counts[
                "PRESENT"
            ],

            "late": attendance_counts[
                "LATE"
            ],

            "absent": attendance_counts[
                "ABSENT"
            ],

            "leave": attendance_counts[
                "LEAVE"
            ],

            "attendance_rate": attendance_rate,

            "from": week_start.isoformat(),

            "to": today.isoformat(),
        },

        "recent_activity": activities[:6],

        "upcoming_exams": [
            {
                "id": item.id,

                "name": item.name,

                "start_date": (
                    item.start_date.isoformat()
                ),

                "end_date": (
                    item.end_date.isoformat()
                ),

                "status": item.status,
            }

            for item in upcoming_exams
        ],
    }