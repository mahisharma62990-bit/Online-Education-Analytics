// ── Auth ──────────────────────────────────────────────────────────────────────
export interface TokenResponse {
  access_token: string;
  token_type: string;
  role: 'admin' | 'instructor' | 'student';
  user_id: number;
  name: string;
}

export interface AuthUser {
  id: number;
  name: string;
  role: 'admin' | 'instructor' | 'student';
}

// ── Overview ──────────────────────────────────────────────────────────────────
export interface OverviewStats {
  total_students: number;
  total_courses: number;
  avg_completion_rate: number;
  total_revenue: number;
}

// ── Students ──────────────────────────────────────────────────────────────────
export interface StudentPerformance {
  student_id: number;
  student_name: string;
  avg_score: number;
  completion_rate: number;
}

export interface ScoreBucket {
  range: string;
  count: number;
}

export interface CourseProgress {
  course_id: number;
  course_title: string;
  completion_percent: number;
}

// ── Courses ───────────────────────────────────────────────────────────────────
export interface EnrollmentTrendPoint {
  month: string;
  count: number;
}

export interface CourseCompletionRate {
  course_id: number;
  course_title: string;
  completion_rate: number;
  dropout_rate: number;
  total_enrolled: number;
}

export interface TopCourse {
  course_id: number;
  course_title: string;
  category: string;
  enrollment_count: number;
}

// ── Engagement ────────────────────────────────────────────────────────────────
export interface HeatmapCell {
  day_of_week: number;
  hour: number;
  count: number;
}

export interface MonthlyActive {
  month: string;
  active_students: number;
}

// ── Instructors ───────────────────────────────────────────────────────────────
export interface InstructorSummary {
  instructor_id: number;
  name: string;
  courses_count: number;
  avg_rating: number;
  total_students: number;
}
