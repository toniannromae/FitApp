import type { GlucoseReading, FoodEntry, SymptomEntry } from '../types';

export function glucoseStatus(value: number): { label: string; color: string } {
  if (value < 70) return { label: 'Low', color: '#ef4444' };
  if (value <= 99) return { label: 'Normal', color: '#22c55e' };
  if (value <= 140) return { label: 'Elevated', color: '#f59e0b' };
  if (value <= 180) return { label: 'High', color: '#f97316' };
  return { label: 'Very High', color: '#dc2626' };
}

export function avgLast7Days(readings: GlucoseReading[]): number | null {
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recent = readings.filter(r => new Date(r.timestamp).getTime() > cutoff);
  if (!recent.length) return null;
  return Math.round(recent.reduce((s, r) => s + r.value, 0) / recent.length);
}

export function estimatedA1C(avgGlucose: number): number {
  // Nathan formula: eA1C = (avgGlucose + 46.7) / 28.7
  return Math.round(((avgGlucose + 46.7) / 28.7) * 10) / 10;
}

export function dailyCarbs(entries: FoodEntry[], date: string): number {
  return entries
    .filter(e => e.timestamp.startsWith(date))
    .reduce((s, e) => s + e.carbs, 0);
}

export function dailyCalories(entries: FoodEntry[], date: string): number {
  return entries
    .filter(e => e.timestamp.startsWith(date))
    .reduce((s, e) => s + e.calories, 0);
}

export function antiInflammatoryScore(entries: FoodEntry[], date: string): number {
  const dayEntries = entries.filter(e => e.timestamp.startsWith(date));
  if (!dayEntries.length) return 0;
  return Math.round(
    (dayEntries.reduce((s, e) => s + e.antiInflammatoryScore, 0) / dayEntries.length) * 10
  ) / 10;
}

export function latestSymptomTrend(entries: SymptomEntry[]): {
  pain: number | null;
  fatigue: number | null;
  wellbeing: number | null;
} {
  const sorted = [...entries].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  const latest = sorted[0];
  if (!latest) return { pain: null, fatigue: null, wellbeing: null };
  return {
    pain: latest.jointPain,
    fatigue: latest.fatigue,
    wellbeing: latest.overallWellbeing,
  };
}

export function glycemicLoad(carbs: number, gi: number): number {
  return Math.round((gi * carbs) / 100);
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
