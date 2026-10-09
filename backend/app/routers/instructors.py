from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from app.database import get_db
from app import models, schemas
from app.auth import get_current_user

router = APIRouter()


@router.get("/summary", response_model=List[schemas.InstructorSummary])
def get_instructor_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    instructors_query = db.query(models.User).filter(models.User.role == "instructor")
    # Instructors see only themselves
    if current_user.role == "instructor":
        instructors_query = instructors_query.filter(models.User.id == current_user.id)

    instructors = instructors_query.all()
    result = []
    for inst in instructors:
        courses = db.query(models.Course).filter(models.Course.instructor_id == inst.id).all()
        course_ids = [c.id for c in courses]

        total_students = (
            db.query(func.count(func.distinct(models.Enrollment.student_id)))
            .filter(models.Enrollment.course_id.in_(course_ids))
            .scalar()
        ) or 0 if course_ids else 0

        avg_rating = (
            db.query(func.avg(models.CourseRating.rating))
            .filter(models.CourseRating.course_id.in_(course_ids))
            .scalar()
        ) or 0.0 if course_ids else 0.0

        result.append(schemas.InstructorSummary(
            instructor_id=inst.id,
            name=inst.name,
            courses_count=len(courses),
            avg_rating=round(float(avg_rating), 2),
            total_students=total_students,
        ))
    return result
