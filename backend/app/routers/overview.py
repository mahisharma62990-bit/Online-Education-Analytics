from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app import models, schemas
from app.auth import get_current_user

router = APIRouter()


@router.get("/overview", response_model=schemas.OverviewStats)
def get_overview(db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    total_students = db.query(models.User).filter(models.User.role == "student").count()
    total_courses = db.query(models.Course).count()

    total_enrollments = db.query(models.Enrollment).count()
    completed_enrollments = db.query(models.Enrollment).filter(
        models.Enrollment.status == "completed"
    ).count()
    avg_completion_rate = (
        round(completed_enrollments / total_enrollments * 100, 1) if total_enrollments > 0 else 0.0
    )

    total_revenue = db.query(func.sum(models.Payment.amount)).filter(
        models.Payment.status == "completed"
    ).scalar() or 0.0

    return schemas.OverviewStats(
        total_students=total_students,
        total_courses=total_courses,
        avg_completion_rate=avg_completion_rate,
        total_revenue=round(total_revenue, 2),
    )
