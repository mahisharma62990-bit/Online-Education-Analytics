from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import List
from datetime import datetime, timedelta

from app.database import get_db
from app import models, schemas
from app.auth import get_current_user

router = APIRouter()


@router.get("/activity-heatmap", response_model=List[schemas.HeatmapCell])
def get_activity_heatmap(
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    # SQLite strftime: %w = day of week (0=Sun), %H = hour
    rows = (
        db.query(
            func.cast(func.strftime("%w", models.LessonProgress.last_accessed), func.Integer()).label("dow"),
            func.cast(func.strftime("%H", models.LessonProgress.last_accessed), func.Integer()).label("hour"),
            func.count(models.LessonProgress.id).label("count"),
        )
        .group_by(
            func.strftime("%w", models.LessonProgress.last_accessed),
            func.strftime("%H", models.LessonProgress.last_accessed),
        )
        .all()
    )
    # Convert SQLite Sunday=0 to Monday=0 convention
    result = []
    for row in rows:
        dow = (row.dow - 1) % 7  # Sun(0)->6, Mon(1)->0
        result.append(schemas.HeatmapCell(day_of_week=dow, hour=row.hour, count=row.count))
    return result


@router.get("/monthly-active", response_model=List[schemas.MonthlyActive])
def get_monthly_active(
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    now = datetime.utcnow()
    result = []
    for i in range(11, -1, -1):
        target = now - timedelta(days=30 * i)
        year, month = target.year, target.month
        active = (
            db.query(func.count(func.distinct(models.LessonProgress.student_id)))
            .filter(
                extract("year", models.LessonProgress.last_accessed) == year,
                extract("month", models.LessonProgress.last_accessed) == month,
            )
            .scalar()
        ) or 0
        result.append(schemas.MonthlyActive(month=f"{year}-{month:02d}", active_students=active))
    return result
