from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from app.database import get_db
from app import models, schemas
from app.auth import get_current_user

router = APIRouter()


@router.get("/performance", response_model=List[schemas.StudentPerformance])
def get_student_performance(
    instructor_id: int = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Instructors are scoped to their own courses
    if current_user.role == "instructor":
        instructor_id = current_user.id

    query = (
        db.query(
            models.User.id.label("student_id"),
            models.User.name.label("student_name"),
            func.avg(models.QuizResult.score).label("avg_score"),
        )
        .join(models.QuizResult, models.User.id == models.QuizResult.student_id)
        .filter(models.User.role == "student")
    )

    if instructor_id:
        query = query.join(
            models.Course, models.QuizResult.course_id == models.Course.id
        ).filter(models.Course.instructor_id == instructor_id)

    rows = query.group_by(models.User.id, models.User.name).all()

    result = []
    for row in rows:
        # Completion rate for this student
        total_enr = db.query(models.Enrollment).filter(
            models.Enrollment.student_id == row.student_id
        ).count()
        completed_enr = db.query(models.Enrollment).filter(
            models.Enrollment.student_id == row.student_id,
            models.Enrollment.status == "completed",
        ).count()
        comp_rate = round(completed_enr / total_enr * 100, 1) if total_enr > 0 else 0.0
        result.append(
            schemas.StudentPerformance(
                student_id=row.student_id,
                student_name=row.student_name,
                avg_score=round(row.avg_score or 0, 1),
                completion_rate=comp_rate,
            )
        )
    return result


@router.get("/score-distribution", response_model=List[schemas.ScoreBucket])
def get_score_distribution(
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    buckets = [
        ("0-20", 0, 20),
        ("21-40", 21, 40),
        ("41-60", 41, 60),
        ("61-80", 61, 80),
        ("81-100", 81, 100),
    ]
    result = []
    for label, low, high in buckets:
        count = db.query(models.QuizResult).filter(
            models.QuizResult.score >= low,
            models.QuizResult.score <= high,
        ).count()
        result.append(schemas.ScoreBucket(range=label, count=count))
    return result


@router.get("/progress/{student_id}", response_model=List[schemas.CourseProgress])
def get_student_progress(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Students can only see their own progress
    if current_user.role == "student" and current_user.id != student_id:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Access denied")

    enrollments = (
        db.query(models.Enrollment)
        .filter(models.Enrollment.student_id == student_id)
        .all()
    )

    result = []
    for enr in enrollments:
        course = db.query(models.Course).filter(models.Course.id == enr.course_id).first()
        lessons = db.query(models.Lesson).filter(models.Lesson.course_id == enr.course_id).all()
        if not lessons:
            continue
        progress_rows = db.query(models.LessonProgress).filter(
            models.LessonProgress.student_id == student_id,
            models.LessonProgress.lesson_id.in_([l.id for l in lessons]),
        ).all()
        avg_watched = sum(p.watched_percent for p in progress_rows) / len(lessons)
        result.append(
            schemas.CourseProgress(
                course_id=course.id,
                course_title=course.title,
                completion_percent=round(avg_watched, 1),
            )
        )
    return result
