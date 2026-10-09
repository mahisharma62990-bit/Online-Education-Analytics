import { useEffect, useState } from 'react';
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import PageLayout from '../components/PageLayout';
import KPICard from '../components/KPICard';
import ChartCard from '../components/ChartCard';
import { useAuth } from '../auth/AuthContext';
import {
  getInstructorSummary,
  getStudentPerformance,
  getTopCourses,
  getMonthlyActive,
} from '../api/analytics';
import type {
  InstructorSummary,
  StudentPerformance,
  TopCourse,
  MonthlyActive,
} from '../types/analytics';

type SortKey = 'student_name' | 'avg_score' | 'completion_rate';

export default function InstructorDashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<InstructorSummary | null>(null);
  const [students, setStudents] = useState<StudentPerformance[]>([]);
  const [topCourses, setTopCourses] = useState<TopCourse[]>([]);
  const [monthlyActive, setMonthlyActive] = useState<MonthlyActive[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('avg_score');
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    Promise.all([
      getInstructorSummary(),
      getStudentPerformance(user?.id),
      getTopCourses(),
      getMonthlyActive(),
    ])
      .then(([summaries, perf, top, monthly]) => {
        const self = summaries.find((s) => s.instructor_id === user?.id) ?? summaries[0] ?? null;
        setSummary(self);
        setStudents(perf);
        setTopCourses(top);
        setMonthlyActive(monthly);
      })
      .catch(() => setError('Failed to load dashboard data. Is the backend running?'))
      .finally(() => setLoading(false));
  }, [user?.id]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc((a) => !a);
    else { setSortKey(key); setSortAsc(false); }
  }

  const sortedStudents = [...students].sort((a, b) => {
    const av = a[sortKey], bv = b[sortKey];
    if (typeof av === 'string') return sortAsc ? av.localeCompare(bv as string) : (bv as string).localeCompare(av);
    return sortAsc ? (av as number) - (bv as number) : (bv as number) - (av as number);
  });

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

  const sortIndicator = (key: SortKey) =>
    sortKey === key ? (sortAsc ? ' ▲' : ' ▼') : '';

  return (
    <PageLayout>
      <h2 className="text-xl font-bold text-gray-800 mb-5">Instructor Dashboard</h2>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <KPICard label="Total Students" value={summary?.total_students ?? 0} color="blue" />
        <KPICard label="Courses" value={summary?.courses_count ?? 0} color="purple" />
        <KPICard
          label="Avg Course Rating"
          value={`${summary?.avg_rating?.toFixed(1) ?? '—'} / 5.0`}
          color="orange"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <ChartCard title="Top Courses by Enrollment">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topCourses} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="course_title" tick={{ fontSize: 10 }} width={130} />
              <Tooltip />
              <Bar dataKey="enrollment_count" name="Enrollments" fill="#3b82f6" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly Active Students">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyActive} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="activeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area type="monotone" dataKey="active_students" name="Active Students" stroke="#3b82f6" fill="url(#activeGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Student Performance Table */}
      <ChartCard title="Student Performance">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-500 font-semibold uppercase tracking-wider">
                <th className="pb-2 pr-4 cursor-pointer select-none" onClick={() => toggleSort('student_name')}>
                  Name{sortIndicator('student_name')}
                </th>
                <th className="pb-2 pr-4 cursor-pointer select-none" onClick={() => toggleSort('avg_score')}>
                  Avg Score{sortIndicator('avg_score')}
                </th>
                <th className="pb-2 cursor-pointer select-none" onClick={() => toggleSort('completion_rate')}>
                  Completion %{sortIndicator('completion_rate')}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedStudents.map((s) => (
                <tr key={s.student_id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-2 pr-4 font-medium text-gray-800">{s.student_name}</td>
                  <td className="py-2 pr-4">
                    <span
                      className={`font-semibold ${
                        s.avg_score >= 70 ? 'text-green-600' : s.avg_score >= 50 ? 'text-yellow-600' : 'text-red-500'
                      }`}
                    >
                      {s.avg_score.toFixed(1)}
                    </span>
                    <span className="text-gray-400 text-xs"> / 100</span>
                  </td>
                  <td className="py-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5 max-w-[100px]">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full"
                          style={{ width: `${s.completion_rate}%` }}
                        />
                      </div>
                      <span className="text-gray-600 text-xs">{s.completion_rate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </PageLayout>
  );
}
