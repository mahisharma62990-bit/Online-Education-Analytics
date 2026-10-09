import client from './client';
import type {
  TokenResponse,
  OverviewStats,
  StudentPerformance,
  ScoreBucket,
  CourseProgress,
  EnrollmentTrendPoint,
  CourseCompletionRate,
  TopCourse,
  HeatmapCell,
  MonthlyActive,
  InstructorSummary,
} from '../types/analytics';

export async function login(email: string, password: string): Promise<TokenResponse> {
  const params = new URLSearchParams();
  params.append('username', email);
  params.append('password', password);
  const res = await client.post<TokenResponse>('/auth/login', params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  return res.data;
}

export async function getOverview(): Promise<OverviewStats> {
  const res = await client.get<OverviewStats>('/analytics/overview');
  return res.data;
}

export async function getStudentPerformance(instructorId?: number): Promise<StudentPerformance[]> {
  const params = instructorId ? { instructor_id: instructorId } : {};
  const res = await client.get<StudentPerformance[]>('/analytics/students/performance', { params });
  return res.data;
}

export async function getScoreDistribution(): Promise<ScoreBucket[]> {
  const res = await client.get<ScoreBucket[]>('/analytics/students/score-distribution');
  return res.data;
}

export async function getStudentProgress(studentId: number): Promise<CourseProgress[]> {
  const res = await client.get<CourseProgress[]>(`/analytics/students/progress/${studentId}`);
  return res.data;
}

export async function getEnrollmentTrend(): Promise<EnrollmentTrendPoint[]> {
  const res = await client.get<EnrollmentTrendPoint[]>('/analytics/courses/enrollment-trend');
  return res.data;
}

export async function getCourseCompletionRates(): Promise<CourseCompletionRate[]> {
  const res = await client.get<CourseCompletionRate[]>('/analytics/courses/completion-rates');
  return res.data;
}

export async function getTopCourses(): Promise<TopCourse[]> {
  const res = await client.get<TopCourse[]>('/analytics/courses/top-courses');
  return res.data;
}

export async function getActivityHeatmap(): Promise<HeatmapCell[]> {
  const res = await client.get<HeatmapCell[]>('/analytics/engagement/activity-heatmap');
  return res.data;
}

export async function getMonthlyActive(): Promise<MonthlyActive[]> {
  const res = await client.get<MonthlyActive[]>('/analytics/engagement/monthly-active');
  return res.data;
}

export async function getInstructorSummary(): Promise<InstructorSummary[]> {
  const res = await client.get<InstructorSummary[]>('/analytics/instructors/summary');
  return res.data;
}
