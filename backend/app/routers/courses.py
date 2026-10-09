from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import List
from datetime import datetime, timedelta

from app.database import get_db
from app import models, schemas
from app.auth import get_current_user

router = APIRouter()


@router.get("/enrollment-trend", response_model=List[schemas.EnrollmentTrendPoint])
def get_enrollment_trend(
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    # Build last 12 months list
    now = datetime.utcnow()
    result = []
    for i in range(11, -1, -1):
        # first day of target month
        target = now - timedelta(days=30 * i)
        year, month = target.year, target.month
        count = db.query(models.Enrollment).filter(
            extract("year", models.Enrollment.enrolled_at) == year,
            extract("month", models.Enrollment.enrolled_at) == month,
        ).count()
        result.append(schemas.EnrollmentTrendPoint(
            month=f"{year}-{month:02d}",
            count=count,
        ))
    return result


@router.get("/completion-rates", response_model=List[schemas.CourseCompletionRate])
def get_completion_rates(
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    courses = db.query(models.Course).all()
    result = []
    for course in courses:
        total = db.query(models.Enrollment).filter(
            models.Enrollment.course_id == course.id
        ).count()
        if total == 0:
            continue
        completed = db.query(models.Enrollment).filter(
            models.Enrollment.course_id == course.id,
            models.Enrollment.status == "completed",
        ).count()
        dropped = db.query(models.Enrollment).filter(
            models.Enrollment.course_id == course.id,
            models.Enrollment.status == "dropped",
        ).count()
        result.append(schemas.CourseCompletionRate(
            course_id=course.id,
            course_title=course.title,
            completion_rate=round(completed / total * 100, 1),
            dropout_rate=round(dropped / total * 100, 1),
            total_enrolled=total,
        ))
    return result


@router.get("/top-courses", response_model=List[schemas.TopCourse])
def get_top_courses(
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    rows = (
        db.query(
            models.Course.id,
            models.Course.title,
            models.Course.category,
            func.count(models.Enrollment.id).label("enrollment_count"),
        )
        .join(models.Enrollment, models.Course.id == models.Enrollment.course_id)
        .group_by(models.Course.id)
        .order_by(func.count(models.Enrollment.id).desc())
        .limit(5)
        .all()
    )
    return [
        schemas.TopCourse(
            course_id=r.id,
            course_title=r.title,
            category=r.category,
            enrollment_count=r.enrollment_count,
        )
        for r in rows
    ]
