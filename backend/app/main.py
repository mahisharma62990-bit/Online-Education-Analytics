from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.routers import auth, overview, students, courses, engagement, instructors

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Online Education Analytics API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(overview.router, prefix="/analytics", tags=["overview"])
app.include_router(students.router, prefix="/analytics/students", tags=["students"])
app.include_router(courses.router, prefix="/analytics/courses", tags=["courses"])
app.include_router(engagement.router, prefix="/analytics/engagement", tags=["engagement"])
app.include_router(instructors.router, prefix="/analytics/instructors", tags=["instructors"])


@app.get("/health")
def health():
    return {"status": "ok"}
