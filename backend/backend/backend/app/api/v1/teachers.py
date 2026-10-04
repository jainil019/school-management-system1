from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, delete
from sqlalchemy.orm import Session
from app.core.permissions import require_roles
from app.core.security import hash_password
from app.db.session import get_db
from app.models.teacher import Teacher
from app.models.user import User
from app.models.role import Role
from app.models.teacher_assignment import TeacherAssignment
from app.models.attendance import Attendance
from app.models.homework import Homework
from app.models.homework_submission import HomeworkSubmission
from app.models.timetable import Timetable
from app.schemas.teacher import TeacherCreate, TeacherUpdate, TeacherResponse, TeacherAccountCreate
router=APIRouter(prefix="/teachers",tags=["Teachers"])

def _role(db,name):
    role=db.scalar(select(Role).where(Role.name==name))
    if role is None: raise HTTPException(500,f"{name} role is not configured")
    return role

@router.post("/create-account",response_model=TeacherResponse,status_code=201)
def create_teacher_account(data:TeacherAccountCreate,db:Session=Depends(get_db),current_user=Depends(require_roles("ADMIN","PRINCIPAL"))):
    email=data.email.strip().lower()
    if db.scalar(select(User).where(User.email==email)): raise HTTPException(409,"Email address is already registered")
    if db.scalar(select(Teacher).where(Teacher.employee_id==data.employee_id)): raise HTTPException(409,"Employee ID already exists")
    role=_role(db,"TEACHER")
    user=User(email=email,password_hash=hash_password(data.password),role_id=role.id,is_active=True); db.add(user); db.flush()
    teacher=Teacher(user_id=user.id,employee_id=data.employee_id,first_name=data.first_name,last_name=data.last_name,phone=data.phone,address=data.address,dob=data.dob,gender=data.gender,qualification=data.qualification,joining_date=data.joining_date,photo_url=data.photo_url,status=data.status)
    db.add(teacher)
    try: db.commit(); db.refresh(teacher)
    except Exception: db.rollback(); raise HTTPException(400,"Unable to create teacher. Check the submitted details.")
    return teacher

@router.post("",response_model=TeacherResponse,status_code=201)
def create_teacher(data:TeacherCreate,db:Session=Depends(get_db),current_user=Depends(require_roles("ADMIN","PRINCIPAL"))):
    user=db.get(User,data.user_id)
    if user is None: raise HTTPException(404,"User not found")
    role=db.get(Role,user.role_id)
    if role is None or role.name!="TEACHER": raise HTTPException(400,"Selected user does not have TEACHER role")
    if db.scalar(select(Teacher).where(Teacher.user_id==data.user_id)): raise HTTPException(409,"Teacher profile already exists for this user")
    if db.scalar(select(Teacher).where(Teacher.employee_id==data.employee_id)): raise HTTPException(409,"Employee ID already exists")
    teacher=Teacher(**data.model_dump()); db.add(teacher); db.commit(); db.refresh(teacher); return teacher

@router.get("",response_model=list[TeacherResponse])
def get_teachers(db:Session=Depends(get_db),current_user=Depends(require_roles("ADMIN","PRINCIPAL"))): return db.scalars(select(Teacher).order_by(Teacher.id.desc())).all()

@router.get("/{teacher_id}",response_model=TeacherResponse)
def get_teacher(teacher_id:int,db:Session=Depends(get_db),current_user=Depends(require_roles("ADMIN","PRINCIPAL","TEACHER"))):
    teacher=db.get(Teacher,teacher_id)
    if teacher is None: raise HTTPException(404,"Teacher not found")
    return teacher

@router.put("/{teacher_id}",response_model=TeacherResponse)
def update_teacher(teacher_id:int,data:TeacherUpdate,db:Session=Depends(get_db),current_user=Depends(require_roles("ADMIN","PRINCIPAL"))):
    teacher=db.get(Teacher,teacher_id)
    if teacher is None: raise HTTPException(404,"Teacher not found")
    duplicate=db.scalar(select(Teacher).where(Teacher.employee_id==data.employee_id,Teacher.id!=teacher_id))
    if duplicate: raise HTTPException(409,"Employee ID already exists")
    for key,value in data.model_dump().items(): setattr(teacher,key,value)
    db.commit(); db.refresh(teacher); return teacher

@router.delete("/{teacher_id}")
def delete_teacher(teacher_id:int,db:Session=Depends(get_db),current_user=Depends(require_roles("ADMIN"))):
    teacher=db.get(Teacher,teacher_id)
    if teacher is None: raise HTTPException(404,"Teacher not found")
    tid=teacher.id; uid=teacher.user_id
    homework_ids=[x[0] for x in db.execute(select(Homework.id).where(Homework.teacher_id==tid)).all()]
    if homework_ids: db.execute(delete(HomeworkSubmission).where(HomeworkSubmission.homework_id.in_(homework_ids)))
    db.execute(delete(TeacherAssignment).where(TeacherAssignment.teacher_id==tid))
    db.execute(delete(Attendance).where(Attendance.marked_by==tid))
    db.execute(delete(HomeworkSubmission).where(HomeworkSubmission.reviewed_by==tid))
    db.execute(delete(Homework).where(Homework.teacher_id==tid))
    db.execute(delete(Timetable).where(Timetable.teacher_id==tid))
    db.delete(teacher); db.flush()
    user=db.get(User,uid)
    if user is not None: user.is_active=False
    db.commit()
    return {"message":"Teacher deleted successfully","teacher_id":teacher_id}
