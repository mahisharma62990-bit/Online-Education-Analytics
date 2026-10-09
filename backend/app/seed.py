"""
Seed script — populates SQLite with realistic sample data.
Run from the backend/ directory:  py -m app.seed
Uses random.seed(42) for deterministic output.
"""
import random
import sys
import os
from datetime import datetime, timedelta

# Allow running as a script from the backend/ directory
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, engine, Base
from app import models

# Ensure tables exist
Base.metadata.create_all(bind=engine)

random.seed(42)

CATEGORIES = ["Programming", "Design", "Business", "Data"]

COURSE_DATA = [
    ("Python for Beginners", "Programming", 49.99),
    ("Advanced JavaScript", "Programming", 59.99),
    ("UI/UX Design Fundamentals", "Design", 44.99),
    ("Figma Masterclass", "Design", 39.99),
    ("Business Strategy Essentials", "Business", 54.99),
    ("Digital Marketing 101", "Business", 34.99),
    ("Data Analysis with Pandas", "Data", 64.99),
    ("SQL for Data Analysts", "Data", 49.99),
    ("React & TypeScript", "Programming", 69.99),
    ("Machine Learning Concepts", "Data", 74.99),
]

INSTRUCTOR_NAMES = ["Alice Johnson", "Bob Martinez", "Carol Williams"]
INSTRUCTOR_EMAILS = ["instructor1@edu.local", "instructor2@edu.local", "instructor3@edu.local"]

STUDENT_FIRST = ["James", "Maria", "Lucas", "Sophie", "Ethan", "Olivia", "Noah", "Emma",
                 "Liam", "Ava", "Mason", "Isabella", "Logan", "Mia", "Elijah", "Amelia",
                 "Oliver", "Harper", "Benjamin", "Evelyn", "Aiden", "Abigail", "Jackson",
                 "Emily", "Sebastian", "Elizabeth", "Mateo", "Mila", "Jack", "Ella",
                 "Owen", "Avery", "Theodore", "Sofia", "Caleb", "Camila", "Henry", "Aria",
                 "Samuel", "Scarlett", "David", "Victoria", "Wyatt", "Madison", "John",
                 "Luna", "Luke", "Grace", "Gabriel", "Chloe"]
STUDENT_LAST = ["Smith", "Jones", "Brown", "Davis", "Miller", "Wilson", "Moore", "Taylor",
                "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin", "Garcia",
                "Martinez", "Robinson", "Clark", "Rodriguez", "Lewis", "Lee", "Walker",
                "Hall", "Allen", "Young", "Hernandez", "King", "Wright", "Lopez", "Hill",
                "Scott", "Green", "Adams", "Baker", "Gonzalez", "Nelson", "Carter", "Mitchell",
                "Perez", "Roberts", "Turner", "Phillips", "Campbell", "Parker", "Evans",
                "Edwards", "Collins", "Stewart", "Sanchez", "Morris"]


def random_past_date(days_back_min: int, days_back_max: int) -> datetime:
    delta = random.randint(days_back_min, days_back_max)
    return datetime.utcnow() - timedelta(days=delta)


def seed():
    db = SessionLocal()
    try:
        # Guard: skip if already seeded
        if db.query(models.User).first():
            print("Database already seeded. Skipping.")
            return

        print("Seeding database...")

        # ── Admin ──────────────────────────────────────────────────────────────
        import bcrypt as _bcrypt

        def _hash(pw: str) -> str:
            return _bcrypt.hashpw(pw.encode("utf-8"), _bcrypt.gensalt()).decode("utf-8")

        admin = models.User(
            name="Admin User",
            email="admin@edu.local",
            hashed_password=_hash("password123"),
            role="admin",
            created_at=random_past_date(400, 400),
        )
        db.add(admin)
        db.flush()

        # ── Instructors ────────────────────────────────────────────────────────
        instructors = []
        for name, email in zip(INSTRUCTOR_NAMES, INSTRUCTOR_EMAILS):
            inst = models.User(
                name=name,
                email=email,
                hashed_password=_hash("password123"),
                role="instructor",
                created_at=random_past_date(380, 400),
            )
            db.add(inst)
            db.flush()
            instructors.append(inst)

        # Convenience: one known instructor@edu.local alias (first instructor)
        # Already covered above by INSTRUCTOR_EMAILS[0] = instructor1@edu.local
        # Add a shortcut account
        shortcut_instructor = models.User(
            name="Instructor Demo",
            email="instructor@edu.local",
            hashed_password=_hash("password123"),
            role="instructor",
            created_at=random_past_date(380, 400),
        )
        db.add(shortcut_instructor)
        db.flush()
        instructors.append(shortcut_instructor)

        # ── Courses ────────────────────────────────────────────────────────────
        courses = []
        for i, (title, category, price) in enumerate(COURSE_DATA):
            instructor = instructors[i % len(instructors)]
            course = models.Course(
                title=title,
                category=category,
                instructor_id=instructor.id,
                price=price,
                created_at=random_past_date(300, 360),
            )
            db.add(course)
            db.flush()
            courses.append(course)

            # Add 5-8 lessons per course
            for lesson_idx in range(random.randint(5, 8)):
                lesson = models.Lesson(
                    course_id=course.id,
                    title=f"{title} — Lesson {lesson_idx + 1}",
                    order_index=lesson_idx + 1,
                    duration_minutes=random.randint(10, 45),
                )
                db.add(lesson)

        db.flush()

        # ── Students ───────────────────────────────────────────────────────────
        students = []
        used_emails = set()
        for i in range(50):
            first = STUDENT_FIRST[i]
            last = STUDENT_LAST[i]
            email = f"{first.lower()}.{last.lower()}@student.edu"
            if email in used_emails:
                email = f"{first.lower()}.{last.lower()}{i}@student.edu"
            used_emails.add(email)
            student = models.User(
                name=f"{first} {last}",
                email=email,
                hashed_password=_hash("password123"),
                role="student",
                created_at=random_past_date(30, 365),
            )
            db.add(student)
            db.flush()
            students.append(student)

        # Shortcut student account
        demo_student = models.User(
            name="Student Demo",
            email="student@edu.local",
            hashed_password=_hash("password123"),
            role="student",
            created_at=random_past_date(200, 300),
        )
        db.add(demo_student)
        db.flush()
        students.append(demo_student)

        db.flush()

        # Fetch all lessons grouped by course
        all_lessons = db.query(models.Lesson).all()
        lessons_by_course = {}
        for lesson in all_lessons:
            lessons_by_course.setdefault(lesson.course_id, []).append(lesson)

        # ── Enrollments, Progress, Quizzes, Payments, Ratings ─────────────────
        for student in students:
            # Each student enrolls in 2-6 courses
            enrolled_courses = random.sample(courses, k=random.randint(2, 6))
            for course in enrolled_courses:
                enrolled_at = random_past_date(30, 330)
                status_roll = random.random()
                if status_roll < 0.55:
                    status = "completed"
                    completed_at = enrolled_at + timedelta(days=random.randint(14, 90))
                elif status_roll < 0.80:
                    status = "active"
                    completed_at = None
                else:
                    status = "dropped"
                    completed_at = None

                enrollment = models.Enrollment(
                    student_id=student.id,
                    course_id=course.id,
                    enrolled_at=enrolled_at,
                    completed_at=completed_at,
                    status=status,
                )
                db.add(enrollment)

                # Payment
                payment = models.Payment(
                    student_id=student.id,
                    course_id=course.id,
                    amount=course.price,
                    payment_date=enrolled_at,
                    status="completed",
                )
                db.add(payment)

                # Lesson progress
                course_lessons = lessons_by_course.get(course.id, [])
                for lesson in course_lessons:
                    if status == "completed":
                        watched = random.uniform(85.0, 100.0)
                    elif status == "active":
                        watched = random.uniform(0.0, 80.0)
                    else:  # dropped
                        watched = random.uniform(0.0, 30.0)

                    access_date = enrolled_at + timedelta(days=random.randint(1, 60))
                    lp = models.LessonProgress(
                        student_id=student.id,
                        lesson_id=lesson.id,
                        watched_percent=watched,
                        last_accessed=access_date,
                    )
                    db.add(lp)

                # 1-3 quiz attempts per course
                for _ in range(random.randint(1, 3)):
                    score = random.uniform(40.0, 100.0) if status != "dropped" else random.uniform(20.0, 60.0)
                    taken_at = enrolled_at + timedelta(days=random.randint(7, 80))
                    qr = models.QuizResult(
                        student_id=student.id,
                        course_id=course.id,
                        score=round(score, 1),
                        max_score=100.0,
                        taken_at=taken_at,
                    )
                    db.add(qr)

                # Rating (only for completed enrollments)
                if status == "completed":
                    rating = models.CourseRating(
                        student_id=student.id,
                        course_id=course.id,
                        rating=round(random.uniform(3.0, 5.0), 1),
                        created_at=completed_at or enrolled_at,
                    )
                    db.add(rating)

        db.commit()
        print(f"Seed complete!")
        print(f"  Users   : 1 admin + {len(instructors)} instructors + {len(students)} students")
        print(f"  Courses : {len(courses)}")
        print("  Enrollments, payments, progress, quizzes, ratings seeded.")
        print("\nTest accounts (all use password: password123)")
        print("  admin@edu.local")
        print("  instructor@edu.local")
        print("  student@edu.local")

    except Exception as e:
        db.rollback()
        print(f"Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
