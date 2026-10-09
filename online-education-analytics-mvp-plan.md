# Online Education Analytics — MVP Plan

## Top-Level Overview

Build a full-stack, locally-hosted web application for Online Education Analytics.

- **Backend**: Python 3.11+ · FastAPI · SQLite (via SQLAlchemy ORM) · JWT authentication
- **Frontend**: React 18 · TypeScript · Recharts · Tailwind CSS
- **Auth**: Role-based login — Admin, Instructor, Student — each with a separate dashboard view
- **Data**: A Python seed script populates SQLite with realistic sample data on first run
- **Hosting**: Fully local — backend on `http://localhost:8000`, frontend on `http://localhost:5173`
- **No AI/ML features**

### Scope Boundaries (MVP)
- Three role-based dashboard views (Admin, Instructor, Student)
- Five core analytics modules: Overview KPIs, Student Performance, Course Analytics, Engagement, Instructor Insights
- Seed data covering students, courses, enrollments, lesson progress, quiz results, payments
- No deployment, no cloud, no external services

---

## Project Structure

```
online-education-analytics/
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI app entry point
│   │   ├── database.py           # SQLAlchemy engine + session
│   │   ├── models.py             # ORM models
│   │   ├── schemas.py            # Pydantic request/response schemas
│   │   ├── auth.py               # JWT creation + dependency
│   │   ├── seed.py               # Sample data seeder
│   │   └── routers/
│   │       ├── auth.py           # POST /auth/login
│   │       ├── overview.py       # GET /analytics/overview
│   │       ├── students.py       # GET /analytics/students/*
│   │       ├── courses.py        # GET /analytics/courses/*
│   │       ├── engagement.py     # GET /analytics/engagement/*
│   │       └── instructors.py    # GET /analytics/instructors/*
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── api/                  # Axios API client + typed hooks
│   │   ├── auth/                 # Login page + AuthContext
│   │   ├── components/           # Shared UI components (KPICard, ChartCard, etc.)
│   │   ├── pages/
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── InstructorDashboard.tsx
│   │   │   └── StudentDashboard.tsx
│   │   └── types/                # Shared TypeScript interfaces
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
└── README.md
```

---

## Sub-Tasks

---

### Sub-Task 1 — Project Scaffolding & Environment Setup

**Status**: `[ ] pending`

**Intent**
Create the physical folder structure, install all dependencies, and verify both servers start cleanly before any feature code is written.

**Expected Outcomes**
- `backend/` folder with a virtual environment, `requirements.txt`, and a working `uvicorn` server returning `{"status":"ok"}` at `GET /health`
- `frontend/` folder bootstrapped with Vite + React + TypeScript, Tailwind CSS configured, Recharts installed, and `npm run dev` opening a blank page at `http://localhost:5173`

**Todo List**
1. Create root folder `online-education-analytics/`
2. Create `backend/` sub-folder; initialise Python virtual environment (`python -m venv venv`)
3. Create `requirements.txt` with: `fastapi`, `uvicorn[standard]`, `sqlalchemy`, `python-jose[cryptography]`, `passlib[bcrypt]`, `python-dotenv`, `pydantic`, `pydantic-settings`
4. Install backend dependencies (`pip install -r requirements.txt`)
5. Create `backend/app/main.py` with a minimal FastAPI app and `GET /health` route
6. Confirm `uvicorn app.main:app --reload` starts without errors
7. Scaffold `frontend/` using Vite: `npm create vite@latest frontend -- --template react-ts`
8. Install frontend dependencies: `npm install recharts axios react-router-dom @types/react-router-dom tailwindcss postcss autoprefixer`
9. Initialise Tailwind CSS (`npx tailwindcss init -p`) and configure `tailwind.config.js`
10. Confirm `npm run dev` starts at `http://localhost:5173`
11. Create root `README.md` with setup and run instructions

**Relevant Context**
- Backend entry point: `backend/app/main.py`
- Frontend entry point: `frontend/src/main.tsx`
- Vite dev server proxies API calls: configure `server.proxy` in `vite.config.ts` to forward `/api/*` → `http://localhost:8000`

---

### Sub-Task 2 — Database Models & Seed Data

**Status**: `[ ] pending`

**Intent**
Define all SQLAlchemy ORM models that represent the education domain and populate SQLite with enough realistic sample data to make every chart meaningful on first run.

**Expected Outcomes**
- `backend/app/models.py` defines all tables: `users`, `courses`, `enrollments`, `lessons`, `lesson_progress`, `quiz_results`, `payments`
- `backend/app/database.py` creates the SQLite file (`edu_analytics.db`) and all tables on startup
- Running `python -m app.seed` inserts at minimum: 3 instructors, 50 students, 10 courses, 200 enrollments, 500 lesson progress records, 300 quiz results, 150 payments
- Seeded data spans 12 months of activity to support trend charts

**Todo List**
1. Create `backend/app/database.py` — SQLAlchemy engine pointing to `sqlite:///./edu_analytics.db`, `SessionLocal` factory, `Base` declarative base, `get_db` dependency
2. Create `backend/app/models.py` with the following tables:
   - `users` (id, name, email, hashed_password, role: admin/instructor/student, created_at)
   - `courses` (id, title, category, instructor_id FK→users, price, created_at)
   - `enrollments` (id, student_id FK→users, course_id FK→courses, enrolled_at, completed_at, status)
   - `lessons` (id, course_id FK→courses, title, order_index, duration_minutes)
   - `lesson_progress` (id, student_id FK→users, lesson_id FK→lessons, watched_percent, last_accessed)
   - `quiz_results` (id, student_id FK→users, course_id FK→courses, score, max_score, taken_at)
   - `payments` (id, student_id FK→users, course_id FK→courses, amount, payment_date, status)
3. Call `Base.metadata.create_all(bind=engine)` on app startup
4. Create `backend/app/seed.py` — deterministic seed using `random.seed(42)` so re-runs produce the same data
5. Seed users: 1 admin, 3 instructors, 50 students (hashed passwords via passlib)
6. Seed 10 courses across 4 categories (Programming, Design, Business, Data)
7. Seed enrollments with realistic distribution — some completed, some in-progress, some dropped
8. Seed lesson progress, quiz results, payments with timestamps spread across the past 12 months
9. Add a guard in seed script: skip seeding if data already exists
10. Document how to run the seeder in `README.md`

**Relevant Context**
- ORM models: `backend/app/models.py`
- DB session dependency: `backend/app/database.py` → `get_db`
- Seed script: `backend/app/seed.py` — run as `cd backend && python -m app.seed`

---

### Sub-Task 3 — Authentication (Backend + Frontend)

**Status**: `[ ] pending`

**Intent**
Implement JWT-based login so the three user roles (Admin, Instructor, Student) each receive a token that gates API access and routes the user to the correct dashboard view.

**Expected Outcomes**
- `POST /auth/login` accepts `{email, password}`, returns `{access_token, token_type, role}`
- All analytics routes require a valid `Authorization: Bearer <token>` header
- Frontend `LoginPage` sends credentials, stores the JWT in `localStorage`, and redirects to the correct role dashboard
- Protected React routes redirect unauthenticated users back to `/login`
- Three pre-seeded test accounts: `admin@edu.local`, `instructor@edu.local`, `student@edu.local` — all with password `password123`

**Todo List**
1. Create `backend/.env` with `SECRET_KEY` (random 32-char hex string) and `ALGORITHM=HS256`
2. Create `backend/app/auth.py`:
   - `verify_password` / `get_password_hash` using passlib bcrypt
   - `create_access_token` using python-jose
   - `get_current_user` FastAPI dependency that decodes JWT and returns the user
3. Create `backend/app/routers/auth.py` — `POST /auth/login` route using OAuth2PasswordRequestForm
4. Add CORS middleware to `main.py` allowing `http://localhost:5173`
5. Create `backend/app/schemas.py` — `Token`, `TokenData`, `UserOut` Pydantic schemas
6. Create `frontend/src/auth/AuthContext.tsx` — React context holding `user`, `token`, `login()`, `logout()`
7. Create `frontend/src/auth/LoginPage.tsx` — email/password form, calls `POST /api/auth/login`, stores token
8. Create `frontend/src/auth/ProtectedRoute.tsx` — wraps routes, redirects to `/login` if no token
9. Wire up React Router in `App.tsx`: `/login` → LoginPage; `/admin` → AdminDashboard; `/instructor` → InstructorDashboard; `/student` → StudentDashboard — all protected
10. After login, decode the JWT role claim on the frontend and redirect to the matching dashboard route

**Relevant Context**
- Backend auth router: `backend/app/routers/auth.py`
- JWT dependency: `backend/app/auth.py` → `get_current_user`
- Frontend auth context: `frontend/src/auth/AuthContext.tsx`
- Vite proxy: `/api/*` → `http://localhost:8000` (set in Sub-Task 1)

---

### Sub-Task 4 — Analytics API Endpoints (Backend)

**Status**: `[ ] pending`

**Intent**
Build all the aggregation query endpoints that the frontend dashboards will consume. Each endpoint reads from SQLite, aggregates with SQLAlchemy, and returns clean JSON.

**Expected Outcomes**
- All five routers (`overview`, `students`, `courses`, `engagement`, `instructors`) are registered in `main.py`
- Every endpoint is protected by `get_current_user` and scoped by role where applicable
- Responses are typed with Pydantic schemas

**Endpoints to build:**

| Router | Endpoint | Response |
|---|---|---|
| overview | `GET /analytics/overview` | total_students, total_courses, avg_completion_rate, total_revenue |
| students | `GET /analytics/students/performance` | list of {student_name, avg_score, completion_rate} |
| students | `GET /analytics/students/score-distribution` | histogram buckets {range, count} |
| students | `GET /analytics/students/progress/{student_id}` | per-student lesson completion % per course |
| courses | `GET /analytics/courses/enrollment-trend` | monthly enrollment counts over 12 months |
| courses | `GET /analytics/courses/completion-rates` | per-course {course_title, completion_rate, dropout_rate} |
| courses | `GET /analytics/courses/top-courses` | top 5 courses by enrollment |
| engagement | `GET /analytics/engagement/activity-heatmap` | {day_of_week, hour, count} for lesson accesses |
| engagement | `GET /analytics/engagement/monthly-active` | monthly active student counts |
| instructors | `GET /analytics/instructors/summary` | per-instructor {name, courses_count, avg_rating, total_students} |

**Todo List**
1. Create `backend/app/schemas.py` entries for every response shape listed above
2. Create `backend/app/routers/overview.py` — single KPI aggregation query
3. Create `backend/app/routers/students.py` — performance list, score histogram, per-student progress
4. Create `backend/app/routers/courses.py` — enrollment trend (group by month), completion rates, top courses
5. Create `backend/app/routers/engagement.py` — activity heatmap (group by weekday+hour), monthly active users
6. Create `backend/app/routers/instructors.py` — instructor summary joined with courses and enrollments
7. Register all routers in `backend/app/main.py` with prefix `/analytics`
8. Manually test each endpoint with the FastAPI interactive docs at `http://localhost:8000/docs`

**Relevant Context**
- All routers live in `backend/app/routers/`
- SQLAlchemy session via `get_db` dependency from `backend/app/database.py`
- Auth guard via `get_current_user` from `backend/app/auth.py`
- FastAPI docs auto-generated at `/docs` — use this for manual endpoint testing

---

### Sub-Task 5 — Frontend API Client & Shared Components

**Status**: `[ ] pending`

**Intent**
Create a typed Axios client and a library of reusable React components (KPI cards, chart wrappers, layout shell) so all three dashboard pages can be built quickly and consistently.

**Expected Outcomes**
- `frontend/src/api/client.ts` — Axios instance with base URL `/api` and automatic `Authorization` header injection from localStorage token
- Typed async hooks (or plain async functions) for each analytics endpoint
- Shared `KPICard`, `ChartCard`, `Navbar`, `Sidebar`, and `PageLayout` components ready to use

**Todo List**
1. Create `frontend/src/api/client.ts` — Axios instance with interceptor that attaches JWT header
2. Create `frontend/src/api/analytics.ts` — one typed async function per analytics endpoint
3. Create `frontend/src/types/analytics.ts` — TypeScript interfaces matching every API response schema
4. Create `frontend/src/components/KPICard.tsx` — displays a label, large numeric value, and optional % change badge
5. Create `frontend/src/components/ChartCard.tsx` — white card wrapper with a title and a Recharts chart slot
6. Create `frontend/src/components/Navbar.tsx` — top bar with app name, current user, and logout button
7. Create `frontend/src/components/Sidebar.tsx` — left nav with role-appropriate menu links
8. Create `frontend/src/components/PageLayout.tsx` — composes Navbar + Sidebar + main content area
9. Apply Tailwind CSS throughout for consistent styling

**Relevant Context**
- Axios client: `frontend/src/api/client.ts`
- Typed API calls: `frontend/src/api/analytics.ts`
- Shared types: `frontend/src/types/analytics.ts`
- Components folder: `frontend/src/components/`

---

### Sub-Task 6 — Admin Dashboard Page

**Status**: `[ ] pending`

**Intent**
Build the Admin dashboard that provides a platform-wide view: KPI summary, enrollment trend, course completion rates, and engagement heatmap.

**Expected Outcomes**
- `AdminDashboard.tsx` renders four KPI cards and four charts using real API data
- All charts use Recharts components and display correctly with seed data
- Page is accessible only to users with role `admin`

**Charts & Components to render:**

| Section | Component | Data Source |
|---|---|---|
| KPIs row | 4x KPICard | `GET /analytics/overview` |
| Enrollment Trend | LineChart (monthly) | `GET /analytics/courses/enrollment-trend` |
| Course Completion Rates | BarChart (per course) | `GET /analytics/courses/completion-rates` |
| Score Distribution | BarChart histogram | `GET /analytics/students/score-distribution` |
| Activity Heatmap | custom grid or ScatterChart | `GET /analytics/engagement/activity-heatmap` |

**Todo List**
1. Create `frontend/src/pages/AdminDashboard.tsx`
2. Fetch and display the four KPI cards (total students, total courses, avg completion rate, total revenue)
3. Render monthly enrollment LineChart using `ResponsiveContainer` + Recharts `LineChart`
4. Render course completion BarChart (one bar per course, completion % vs dropout %)
5. Render score distribution histogram BarChart
6. Render activity heatmap as a CSS grid of coloured cells (intensity = access count)
7. Add loading skeleton state while API calls are in-flight
8. Add error boundary / error message if an API call fails

**Relevant Context**
- Page file: `frontend/src/pages/AdminDashboard.tsx`
- Recharts components: `LineChart`, `BarChart`, `ResponsiveContainer`, `Tooltip`, `Legend`, `XAxis`, `YAxis`
- Shared components: `KPICard`, `ChartCard`, `PageLayout` from Sub-Task 5

---

### Sub-Task 7 — Instructor Dashboard Page

**Status**: `[ ] pending`

**Intent**
Build the Instructor dashboard that shows per-instructor data: their own courses, student performance in those courses, and a quiz score breakdown.

**Expected Outcomes**
- `InstructorDashboard.tsx` renders course-level KPIs and student performance charts scoped to the logged-in instructor's courses
- Page is accessible only to users with role `instructor`

**Charts & Components to render:**

| Section | Component | Data Source |
|---|---|---|
| KPIs row | 3x KPICard | `GET /analytics/instructors/summary` filtered to self |
| Student Performance Table | sortable HTML table | `GET /analytics/students/performance` |
| Top Courses BarChart | BarChart | `GET /analytics/courses/top-courses` |
| Monthly Active Students | AreaChart | `GET /analytics/engagement/monthly-active` |

**Todo List**
1. Create `frontend/src/pages/InstructorDashboard.tsx`
2. Fetch instructor summary and render KPI cards (total students taught, courses count, avg quiz score)
3. Render student performance as a sortable table (name, avg score, completion %)
4. Render top courses BarChart
5. Render monthly active students AreaChart
6. Add loading and error states

**Relevant Context**
- Page file: `frontend/src/pages/InstructorDashboard.tsx`
- Recharts `AreaChart` for the monthly active trend
- Shared components from Sub-Task 5

---

### Sub-Task 8 — Student Dashboard Page

**Status**: `[ ] pending`

**Intent**
Build the Student dashboard showing personal progress: enrolled courses, lesson completion per course, and quiz score history.

**Expected Outcomes**
- `StudentDashboard.tsx` renders personal KPIs and charts scoped entirely to the logged-in student
- Page is accessible only to users with role `student`

**Charts & Components to render:**

| Section | Component | Data Source |
|---|---|---|
| KPIs row | 3x KPICard | derived from student's own enrollments |
| My Courses Progress | horizontal BarChart | `GET /analytics/students/progress/{student_id}` |
| Quiz Score History | LineChart over time | `GET /analytics/students/performance` (self) |
| Completion Donut | PieChart / RadialBarChart | completion vs remaining lessons |

**Todo List**
1. Create `frontend/src/pages/StudentDashboard.tsx`
2. Fetch the logged-in student's progress data using the student_id from the decoded JWT
3. Render KPI cards: courses enrolled, courses completed, avg quiz score
4. Render horizontal BarChart showing lesson completion % per enrolled course
5. Render quiz score LineChart over time
6. Render a PieChart / RadialBarChart showing overall completion vs remaining
7. Add loading and error states

**Relevant Context**
- Page file: `frontend/src/pages/StudentDashboard.tsx`
- Student ID extracted from decoded JWT payload in `AuthContext`
- Recharts `PieChart`, `RadialBarChart`, `LineChart`

---

### Sub-Task 9 — Integration, Final Wiring & README

**Status**: `[ ] pending`

**Intent**
Connect all moving parts, verify the full user journey end-to-end, and write a complete README so any developer can clone and run the project in under 5 minutes.

**Expected Outcomes**
- Full round-trip works: seed → login as any role → see populated dashboard
- CORS, proxy, JWT, and routing all work seamlessly together
- `README.md` has exact copy-paste commands to install, seed, and run both servers

**Todo List**
1. Verify Vite proxy (`/api/*` → `http://localhost:8000`) forwards all API calls correctly
2. Confirm CORS middleware in FastAPI allows `http://localhost:5173`
3. Test login as `admin@edu.local` → redirected to `/admin` with charts populated
4. Test login as `instructor@edu.local` → redirected to `/instructor` with charts populated
5. Test login as `student@edu.local` → redirected to `/student` with charts populated
6. Confirm logout clears token and redirects to `/login`
7. Confirm protected routes block unauthenticated access
8. Write `README.md` with:
   - Prerequisites (Python 3.11+, Node.js 18+)
   - Backend setup and run commands
   - Seed data command
   - Frontend setup and run commands
   - Test account credentials table
   - Link to FastAPI docs at `http://localhost:8000/docs`

---

## Test Accounts (Post-Seed)

| Role | Email | Password |
|---|---|---|
| Admin | admin@edu.local | password123 |
| Instructor | instructor@edu.local | password123 |
| Student | student@edu.local | password123 |

---

## Local Run Commands (Summary)

```bash
# Backend
cd backend
python -m venv venv && venv\Scripts\activate   # Windows
pip install -r requirements.txt
python -m app.seed
uvicorn app.main:app --reload

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

- Backend API: `http://localhost:8000`
- FastAPI Docs: `http://localhost:8000/docs`
- Frontend App: `http://localhost:5173`
