from pydantic import BaseModel
from typing import Optional, List


# ── Auth ──────────────────────────────────────────────────────────────────────
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_id: int
    name: str


class TokenData(BaseModel):
    user_id: Optional[int] = None


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str

    class Config:
        from_attributes = True


# ── Overview ──────────────────────────────────────────────────────────────────
class OverviewStats(BaseModel):
    total_students: int
    total_courses: int
    avg_completion_rate: float
    total_revenue: float


# ── Students ──────────────────────────────────────────────────────────────────
class StudentPerformance(BaseModel):
    student_id: int
    student_name: str
    avg_score: float
    completion_rate: float


class ScoreBucket(BaseModel):
    range: str
    count: int


class CourseProgress(BaseModel):
    course_id: int
    course_title: str
    completion_percent: float


# ── Courses ───────────────────────────────────────────────────────────────────
class EnrollmentTrendPoint(BaseModel):
    month: str
    count: int


class CourseCompletionRate(BaseModel):
    course_id: int
    course_title: str
    completion_rate: float
    dropout_rate: float
    total_enrolled: int


class TopCourse(BaseModel):
    course_id: int
    course_title: str
    category: str
    enrollment_count: int


# ── Engagement ────────────────────────────────────────────────────────────────
class HeatmapCell(BaseModel):
    day_of_week: int   # 0=Mon … 6=Sun
    hour: int          # 0-23
    count: int


class MonthlyActive(BaseModel):
    month: str
    active_students: int


# ── Instructors ───────────────────────────────────────────────────────────────
class InstructorSummary(BaseModel):
    instructor_id: int
    name: str
    courses_count: int
    avg_rating: float
    total_students: int
