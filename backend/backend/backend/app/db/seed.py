from sqlalchemy import select

from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.role import Role
from app.models.user import User


ROLES = [
    "ADMIN",
    "PRINCIPAL",
    "TEACHER",
    "STUDENT",
    "PARENT",
    "ACCOUNTANT",
]


def seed_roles(db):
    for role_name in ROLES:
        statement = select(Role).where(
            Role.name == role_name
        )

        existing_role = db.scalar(statement)

        if existing_role is None:
            db.add(Role(name=role_name))

    db.commit()


def seed_admin(db):
    statement = select(Role).where(
        Role.name == "ADMIN"
    )

    admin_role = db.scalar(statement)

    if admin_role is None:
        raise RuntimeError("ADMIN role was not created")

    statement = select(User).where(
        User.email == "admin@school.com"
    )

    existing_user = db.scalar(statement)

    if existing_user is not None:
        print("Admin user already exists.")
        return

    admin = User(
        email="admin@school.com",
        password_hash=hash_password("Admin@123"),
        role_id=admin_role.id,
        is_active=True,
    )

    db.add(admin)
    db.commit()

    print("Admin user created successfully.")


# 👇 ADD THIS FUNCTION HERE
def seed_teacher(db):
    
    statement = select(Role).where(
        Role.name == "TEACHER"
    )

    teacher_role = db.scalar(statement)

    if teacher_role is None:
        raise RuntimeError("TEACHER role was not created")

    statement = select(User).where(
        User.email == "teacher@school.com"
    )

    existing_user = db.scalar(statement)

    if existing_user is not None:
        print("Teacher user already exists.")
        return

    teacher = User(
        email="teacher@school.com",
        password_hash=hash_password("Teacher@123"),
        role_id=teacher_role.id,
        is_active=True,
    )

    db.add(teacher)
    db.commit()

    print("Teacher user created successfully.")
def seed_student(db):
    statement = select(Role).where(
        Role.name == "STUDENT"
    )

    student_role = db.scalar(statement)

    if student_role is None:
        raise RuntimeError("STUDENT role was not created")

    statement = select(User).where(
        User.email == "student@school.com"
    )

    existing_user = db.scalar(statement)

    if existing_user is not None:
        print("Student user already exists.")
        return

    student = User(
        email="student@school.com",
        password_hash=hash_password("Student@123"),
        role_id=student_role.id,
        is_active=True,
    )

    db.add(student)
    db.commit()

    print("Student user created successfully.")

def main():
    db = SessionLocal()

    try:
        seed_roles(db)
        seed_admin(db)

        # 👇 ADD THIS LINE
        seed_teacher(db)
        seed_student(db)
    finally:
        db.close()


if __name__ == "__main__":
    main()