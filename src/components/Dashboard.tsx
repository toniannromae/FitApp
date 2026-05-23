import { useMemo } from 'react';
import { format, subDays } from 'date-fns';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import type { AppData } from '../types';
import {
  glucoseStatus, avgLast7Days, estimatedA1C, dailyCarbs, dailyCalories,
  antiInflammatoryScore, latestSymptomTrend, todayISO,
} from '../utils/calculations';

interface Props {
  data: AppData;
}

function StatCard({
  title, value, subtitle, color, bg,
}: {
  title: string;
  value: string;
  subtitle?: string;
  color: string;
  bg: string;
}) {
  return (
    <div style={{
      background: bg,
      borderRadius: 12,
      padding: '14px 16px',
      border: `1px solid ${color}33`,
    }}>
      <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color }}>{value}</div>
      {subtitle && <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{subtitle}</div>}
    </div>
  );
}

export default function Dashboard({ data }: Props) {
  const today = todayISO();
  const avg7 = avgLast7Days(data.glucoseReadings);
  const latestGlucose = [...data.glucoseReadings]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
  const glucoseInfo = latestGlucose ? glucoseStatus(latestGlucose.value) : null;

  const todayCarbs = dailyCarbs(data.foodEntries, today);
  const todayCals = dailyCalories(data.foodEntries, today);
  const aiScore = antiInflammatoryScore(data.foodEntries, today);
  const symptoms = latestSymptomTrend(data.symptomEntries);

  const chartData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayReadings = data.glucoseReadings.filter(r => r.timestamp.startsWith(dateStr));
      const avg = dayReadings.length
        ? Math.round(dayReadings.reduce((s, r) => s + r.value, 0) / dayReadings.length)
        : null;
      return { date: format(date, 'MM/dd'), avg };
    });
  }, [data.glucoseReadings]);

  const aiColor = aiScore > 1 ? '#22c55e' : aiScore < -1 ? '#ef4444' : '#f59e0b';

  return (
    <div style={{ padding: '16px 16px 0' }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#f1f5f9' }}>
          Today's Summary
        </h2>
        <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      {/* Glucose stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <StatCard
          title="Latest Glucose"
          value={latestGlucose ? `${latestGlucose.value}` : '–'}
          subtitle={glucoseInfo ? `${glucoseInfo.label} mg/dL` : 'No reading yet'}
          color={glucoseInfo?.color ?? '#94a3b8'}
          bg="#1e293b"
        />
        <StatCard
          title="7-Day Avg Glucose"
          value={avg7 ? `${avg7}` : '–'}
          subtitle={avg7 ? `Est. A1C: ${estimatedA1C(avg7)}%` : 'No data'}
          color="#38bdf8"
          bg="#1e293b"
        />
      </div>

      {/* Nutrition */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <StatCard
          title="Carbs Today"
          value={todayCarbs ? `${todayCarbs}g` : '–'}
          subtitle="Target: <150g/day"
          color={todayCarbs > 150 ? '#f97316' : '#a78bfa'}
          bg="#1e293b"
        />
        <StatCard
          title="Calories Today"
          value={todayCals ? `${todayCals}` : '–'}
          subtitle="kcal logged"
          color="#a78bfa"
          bg="#1e293b"
        />
      </div>

      {/* Anti-inflammatory + wellbeing */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        <StatCard
          title="Anti-Inflam. Score"
          value={data.foodEntries.some(e => e.timestamp.startsWith(today)) ? `${aiScore > 0 ? '+' : ''}${aiScore}` : '–'}
          subtitle="Today's diet score"
          color={aiColor}
          bg="#1e293b"
        />
        <StatCard
          title="Wellbeing"
          value={symptoms.wellbeing !== null ? `${symptoms.wellbeing}/10` : '–'}
          subtitle={symptoms.pain !== null ? `Pain: ${symptoms.pain}/10` : 'No entry yet'}
          color={symptoms.wellbeing !== null && symptoms.wellbeing >= 7 ? '#22c55e' : '#f59e0b'}
          bg="#1e293b"
        />
      </div>

      {/* Glucose trend chart */}
      <div style={{
        background: '#1e293b',
        borderRadius: 12,
        padding: '14px 12px',
        marginBottom: 16,
        border: '1px solid #334155',
      }}>
        <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 10, fontWeight: 600 }}>
          7-Day Glucose Trend (avg mg/dL)
        </div>
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} />
            <YAxis domain={[60, 240]} tick={{ fill: '#64748b', fontSize: 10 }} />
            <Tooltip
              contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }}
              labelStyle={{ color: '#94a3b8' }}
              itemStyle={{ color: '#38bdf8' }}
            />
            <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="4 2" label={{ value: '70', fill: '#ef4444', fontSize: 9 }} />
            <ReferenceLine y={140} stroke="#f59e0b" strokeDasharray="4 2" label={{ value: '140', fill: '#f59e0b', fontSize: 9 }} />
            <Line
              type="monotone"
              dataKey="avg"
              stroke="#38bdf8"
              strokeWidth={2}
              dot={{ fill: '#38bdf8', r: 3 }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Tips section */}
      <div style={{
        background: '#1e293b',
        borderRadius: 12,
        padding: '14px 16px',
        marginBottom: 16,
        border: '1px solid #334155',
      }}>
        <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 10, fontWeight: 600 }}>
          Daily Reminders
        </div>
        {[
          { text: 'Check blood glucose before meals and at bedtime', icon: '💉' },
          { text: 'Stay hydrated — aim for 8+ cups of water', icon: '💧' },
          { text: 'Anti-inflammatory foods: fatty fish, leafy greens, berries, turmeric', icon: '🥗' },
          { text: 'Low-impact exercise helps both insulin sensitivity and joints', icon: '🚶' },
          { text: 'Log symptoms daily to track UCTD flares', icon: '📊' },
        ].map((tip, i) => (
          <div key={i} style={{
            display: 'flex', gap: 8, alignItems: 'flex-start',
            padding: '4px 0', borderBottom: i < 4 ? '1px solid #1e293b' : 'none',
          }}>
            <span style={{ fontSize: 14 }}>{tip.icon}</span>
            <span style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.5 }}>{tip.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
