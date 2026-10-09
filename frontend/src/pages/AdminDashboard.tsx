import { useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import PageLayout from '../components/PageLayout';
import KPICard from '../components/KPICard';
import ChartCard from '../components/ChartCard';
import {
  getOverview,
  getEnrollmentTrend,
  getCourseCompletionRates,
  getScoreDistribution,
  getActivityHeatmap,
} from '../api/analytics';
import type {
  OverviewStats,
  EnrollmentTrendPoint,
  CourseCompletionRate,
  ScoreBucket,
  HeatmapCell,
} from '../types/analytics';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function ActivityHeatmap({ cells }: { cells: HeatmapCell[] }) {
  const maxCount = Math.max(...cells.map((c) => c.count), 1);
  const grid: Record<string, number> = {};
  cells.forEach((c) => { grid[`${c.day_of_week}-${c.hour}`] = c.count; });

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1 mb-1 ml-10">
        {Array.from({ length: 24 }, (_, h) => (
          <span key={h} className="w-5 text-center text-xs text-gray-400" style={{ minWidth: '1.25rem' }}>
            {h % 6 === 0 ? h : ''}
          </span>
        ))}
      </div>
      {DAYS.map((day, d) => (
        <div key={d} className="flex items-center gap-1 mb-1">
          <span className="w-8 text-xs text-gray-500 text-right mr-2">{day}</span>
          {Array.from({ length: 24 }, (_, h) => {
            const count = grid[`${d}-${h}`] ?? 0;
            const intensity = count / maxCount;
            const bg = count === 0
              ? 'bg-gray-100'
              : intensity < 0.25
              ? 'bg-blue-100'
              : intensity < 0.5
              ? 'bg-blue-300'
              : intensity < 0.75
              ? 'bg-blue-500'
              : 'bg-blue-700';
            return (
              <div
                key={h}
                title={`${day} ${h}:00 — ${count} accesses`}
                className={`w-5 h-5 rounded-sm ${bg}`}
                style={{ minWidth: '1.25rem' }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [trend, setTrend] = useState<EnrollmentTrendPoint[]>([]);
  const [completionRates, setCompletionRates] = useState<CourseCompletionRate[]>([]);
  const [scoreDistrib, setScoreDistrib] = useState<ScoreBucket[]>([]);
  const [heatmap, setHeatmap] = useState<HeatmapCell[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      getOverview(),
      getEnrollmentTrend(),
      getCourseCompletionRates(),
      getScoreDistribution(),
      getActivityHeatmap(),
    ])
      .then(([ov, tr, cr, sd, hm]) => {
        setOverview(ov);
        setTrend(tr);
        setCompletionRates(cr);
        setScoreDistrib(sd);
        setHeatmap(hm);
      })
      .catch(() => setError('Failed to load dashboard data. Is the backend running?'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Loading…</div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-sm">{error}</div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <h2 className="text-xl font-bold text-gray-800 mb-5">Admin Dashboard</h2>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard
          label="Total Students"
          value={overview?.total_students ?? 0}
          color="blue"
        />
        <KPICard
          label="Total Courses"
          value={overview?.total_courses ?? 0}
          color="purple"
        />
        <KPICard
          label="Avg Completion"
          value={`${overview?.avg_completion_rate ?? 0}%`}
          color="green"
        />
        <KPICard
          label="Total Revenue"
          value={`$${(overview?.total_revenue ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          color="orange"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <ChartCard title="Monthly Enrollment Trend">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" name="Enrollments" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Course Completion vs Dropout Rates">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={completionRates} margin={{ top: 5, right: 20, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="course_title" tick={{ fontSize: 9 }} angle={-35} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 11 }} unit="%" />
              <Tooltip formatter={(v) => `${v}%`} />
              <Legend verticalAlign="top" />
              <Bar dataKey="completion_rate" name="Completion %" fill="#22c55e" radius={[3, 3, 0, 0]} />
              <Bar dataKey="dropout_rate" name="Dropout %" fill="#ef4444" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Quiz Score Distribution">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={scoreDistrib} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="range" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" name="Students" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Lesson Access Heatmap (Day × Hour)">
          <ActivityHeatmap cells={heatmap} />
          <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
            <span>Low</span>
            <div className="flex gap-1">
              {['bg-gray-100', 'bg-blue-100', 'bg-blue-300', 'bg-blue-500', 'bg-blue-700'].map((c) => (
                <div key={c} className={`w-4 h-4 rounded-sm ${c}`} />
              ))}
            </div>
            <span>High</span>
          </div>
        </ChartCard>
      </div>
    </PageLayout>
  );
}
