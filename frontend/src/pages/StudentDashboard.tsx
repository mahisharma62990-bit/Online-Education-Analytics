import { useEffect, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import PageLayout from '../components/PageLayout';
import KPICard from '../components/KPICard';
import ChartCard from '../components/ChartCard';
import { useAuth } from '../auth/AuthContext';
import { getStudentProgress, getStudentPerformance } from '../api/analytics';
import type { CourseProgress, StudentPerformance } from '../types/analytics';

const PIE_COLORS = ['#3b82f6', '#e5e7eb'];

export default function StudentDashboard() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<CourseProgress[]>([]);
  const [performance, setPerformance] = useState<StudentPerformance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getStudentProgress(user.id),
      getStudentPerformance(),
    ])
      .then(([prog, allPerf]) => {
        setProgress(prog);
        const self = allPerf.find((p) => p.student_id === user.id) ?? null;
        setPerformance(self);
      })
      .catch(() => setError('Failed to load dashboard data. Is the backend running?'))
      .finally(() => setLoading(false));
  }, [user]);

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

  const enrolledCount = progress.length;
  const completedCount = progress.filter((p) => p.completion_percent >= 85).length;
  const avgScore = performance?.avg_score ?? 0;

  // Completion donut data
  const totalLessons = progress.length > 0 ? 100 : 1;
  const overallCompletion = progress.length > 0
    ? Math.round(progress.reduce((sum, p) => sum + p.completion_percent, 0) / progress.length)
    : 0;
  const pieData = [
    { name: 'Completed', value: overallCompletion },
    { name: 'Remaining', value: Math.max(0, totalLessons - overallCompletion) },
  ];

  // Mock quiz history from performance data (static sparkline)
  const quizHistory = progress.slice(0, 8).map((p, i) => ({
    label: `Q${i + 1}`,
    score: Math.round(50 + (p.completion_percent / 2)),
  }));

  return (
    <PageLayout>
      <h2 className="text-xl font-bold text-gray-800 mb-5">My Dashboard</h2>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <KPICard label="Courses Enrolled" value={enrolledCount} color="blue" />
        <KPICard label="Courses Completed" value={completedCount} color="green" />
        <KPICard
          label="Avg Quiz Score"
          value={avgScore > 0 ? `${avgScore.toFixed(1)} / 100` : '—'}
          color="purple"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <ChartCard title="Course Progress">
          {progress.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">No enrolled courses yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(200, progress.length * 36)}>
              <BarChart data={progress} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                <YAxis type="category" dataKey="course_title" tick={{ fontSize: 10 }} width={140} />
                <Tooltip formatter={(v) => `${v}%`} />
                <Bar dataKey="completion_percent" name="Progress" fill="#3b82f6" radius={[0, 3, 3, 0]}>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Overall Completion">
          <div className="flex flex-col items-center justify-center h-48">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
            <p className="text-2xl font-bold text-gray-800 -mt-16">{overallCompletion}%</p>
            <p className="text-xs text-gray-500 mt-1">Overall Completion</p>
          </div>
        </ChartCard>
      </div>

      {/* Quiz Score History */}
      <ChartCard title="Quiz Score History">
        {quizHistory.length === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center">No quiz data available.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={quizHistory} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="score" name="Score" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </PageLayout>
  );
}
