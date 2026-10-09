# Online Education Analytics

A full-stack, locally-hosted web application for online education analytics with role-based dashboards for Admin, Instructor, and Student roles.

## Prerequisites

- **Python 3.11+** — [python.org](https://www.python.org/downloads/)
- **Node.js 18+** — [nodejs.org](https://nodejs.org/)

---

## Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Seed the database

```bash
# From the backend/ directory (with venv active)
python -m app.seed
```

Expected output:
```
Seeding database...
Seed complete!
  Users   : 1 admin + 4 instructors + 51 students
  Courses : 10
  Enrollments, payments, progress, quizzes, ratings seeded.
```

> Re-running the seed script is safe — it skips if data already exists.

### Start the backend server

```bash
# From the backend/ directory (with venv active)
uvicorn app.main:app --reload
```

Backend will be available at **http://localhost:8000**  
Interactive API docs: **http://localhost:8000/docs**

---

## Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Frontend will be available at **http://localhost:5173**

> API calls from the frontend are proxied to `http://localhost:8000` via the Vite dev server — no CORS issues.

---

## Test Accounts

All accounts use password: `password123`

| Role       | Email                    | Dashboard          |
|------------|--------------------------|--------------------|
| Admin      | admin@edu.local          | `/admin`           |
| Instructor | instructor@edu.local     | `/instructor`      |
| Student    | student@edu.local        | `/student`         |

---

## Project Structure

```
online-education-analytics/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI app, CORS, router registration
│   │   ├── database.py       # SQLAlchemy engine + session
│   │   ├── models.py         # ORM models (users, courses, enrollments, …)
│   │   ├── schemas.py        # Pydantic request/response schemas
│   │   ├── auth.py           # JWT creation + get_current_user dependency
│   │   ├── seed.py           # Deterministic sample data seeder
│   │   └── routers/
│   │       ├── auth.py       # POST /auth/login
│   │       ├── overview.py   # GET /analytics/overview
│   │       ├── students.py   # GET /analytics/students/*
│   │       ├── courses.py    # GET /analytics/courses/*
│   │       ├── engagement.py # GET /analytics/engagement/*
│   │       └── instructors.py# GET /analytics/instructors/*
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx           # React Router setup
│   │   ├── api/
│   │   │   ├── client.ts     # Axios instance with JWT interceptor
│   │   │   └── analytics.ts  # Typed async API functions
│   │   ├── auth/
│   │   │   ├── AuthContext.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── components/
│   │   │   ├── KPICard.tsx
│   │   │   ├── ChartCard.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── PageLayout.tsx
│   │   ├── pages/
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── InstructorDashboard.tsx
│   │   │   └── StudentDashboard.tsx
│   │   └── types/
│   │       └── analytics.ts  # TypeScript interfaces for all API responses
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── tsconfig.json
└── README.md
```

---

## Analytics API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | JWT login — returns `access_token`, `role`, `user_id` |
| GET | `/analytics/overview` | Platform KPIs |
| GET | `/analytics/students/performance` | Per-student avg score & completion rate |
| GET | `/analytics/students/score-distribution` | Quiz score histogram |
| GET | `/analytics/students/progress/{id}` | Per-student course progress |
| GET | `/analytics/courses/enrollment-trend` | Monthly enrollment counts (12 months) |
| GET | `/analytics/courses/completion-rates` | Per-course completion & dropout rates |
| GET | `/analytics/courses/top-courses` | Top 5 courses by enrollment |
| GET | `/analytics/engagement/activity-heatmap` | Lesson access by day × hour |
| GET | `/analytics/engagement/monthly-active` | Monthly active student counts |
| GET | `/analytics/instructors/summary` | Per-instructor courses, students, rating |

All analytics endpoints require `Authorization: Bearer <token>`.

---

## Quick Start (all together)

```bash
# Terminal 1 — Backend
cd backend && python -m venv venv && venv\Scripts\activate
pip install -r requirements.txt
python -m app.seed
uvicorn app.main:app --reload

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev
```

Then open **http://localhost:5173** and log in with any test account above.
