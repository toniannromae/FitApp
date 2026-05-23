import { subDays, startOfDay } from 'date-fns';
import type { AppData } from '../types';
import type { GroceryItemAnalysis, WeeklyInsight } from '../types/grocery';
import { findFoodProfile } from './foodDatabase';

export function buildWeeklyInsight(data: AppData): WeeklyInsight {
  const now = new Date();
  const cutoff = startOfDay(subDays(now, 7)).getTime();

  const weekFoodEntries = data.foodEntries.filter(
    e => new Date(e.timestamp).getTime() >= cutoff
  );
  const weekGlucoseReadings = data.glucoseReadings.filter(
    e => new Date(e.timestamp).getTime() >= cutoff
  );
  const weekSymptoms = data.symptomEntries.filter(
    e => new Date(e.timestamp).getTime() >= cutoff
  );

  // Average daily carbs
  let avgDailyCarbs: number | null = null;
  if (weekFoodEntries.length > 0) {
    const totalCarbs = weekFoodEntries.reduce((s, e) => s + e.carbs, 0);
    avgDailyCarbs = Math.round(totalCarbs / 7);
  }

  // Average anti-inflammatory score
  let avgAntiInflamScore: number | null = null;
  if (weekFoodEntries.length > 0) {
    const total = weekFoodEntries.reduce((s, e) => s + e.antiInflammatoryScore, 0);
    avgAntiInflamScore = Math.round((total / weekFoodEntries.length) * 10) / 10;
  }

  // Average glucose
  let avgGlucose: number | null = null;
  if (weekGlucoseReadings.length > 0) {
    const total = weekGlucoseReadings.reduce((s, r) => s + r.value, 0);
    avgGlucose = Math.round(total / weekGlucoseReadings.length);
  }

  // Recent flare-up in last 7 days
  const recentFlareUp = weekSymptoms.some(s => s.flareUp);

  // Count omega-3 sources logged this week
  const omega3Keywords = ['salmon', 'sardine', 'mackerel', 'tuna', 'walnuts', 'chia', 'flaxseed', 'fish oil', 'omega'];
  const omega3Count = weekFoodEntries.filter(e =>
    omega3Keywords.some(kw => e.name.toLowerCase().includes(kw))
  ).length;

  // Count leafy green servings
  const leafyKeywords = ['spinach', 'kale', 'arugula', 'chard', 'collard', 'lettuce', 'mixed greens', 'salad', 'bok choy'];
  const leafyGreenCount = weekFoodEntries.filter(e =>
    leafyKeywords.some(kw => e.name.toLowerCase().includes(kw))
  ).length;

  // Count high-GI foods logged
  const highGIFoodCount = weekFoodEntries.filter(
    e => (e.glycemicIndex ?? 0) > 70
  ).length;

  // Count days where carbs exceeded 150g
  const dailyCarbMap: Record<string, number> = {};
  for (const entry of weekFoodEntries) {
    const day = entry.timestamp.slice(0, 10);
    dailyCarbMap[day] = (dailyCarbMap[day] ?? 0) + entry.carbs;
  }
  const highCarbDays = Object.values(dailyCarbMap).filter(c => c > 150).length;

  return {
    avgDailyCarbs,
    avgAntiInflamScore,
    avgGlucose,
    recentFlareUp,
    omega3Count,
    leafyGreenCount,
    highGIFoodCount,
    highCarbDays,
  };
}

export function analyzeGroceryItem(
  name: string,
  insight: WeeklyInsight
): GroceryItemAnalysis {
  const profile = findFoodProfile(name);

  if (!profile) {
    return {
      status: 'caution',
      reasons: ['Item not found in food database — manually check GI and anti-inflammatory properties'],
      alternatives: [],
      diabetesFriendly: true,
      uctdFriendly: true,
      glycemicIndex: null,
      antiInflammatoryScore: null,
    };
  }

  const reasons: string[] = [];
  const warnings: string[] = [];
  let statusScore = 0; // positive = recommend, negative = avoid

  // ── GI analysis ──────────────────────────────────────
  if (profile.glycemicIndex > 0) {
    if (profile.glycemicIndex <= 55) {
      reasons.push(`Low GI (${profile.glycemicIndex}) — gentle on blood sugar`);
      statusScore += 1;
    } else if (profile.glycemicIndex <= 70) {
      const contextNote =
        (insight.avgGlucose ?? 0) > 140
          ? '; your weekly glucose average is elevated — pair with protein/fat to blunt spike'
          : ' — pair with protein or fiber to moderate glucose impact';
      warnings.push(`Medium GI (${profile.glycemicIndex})${contextNote}`);
      statusScore -= 1;
    } else {
      const severityNote =
        (insight.highCarbDays ?? 0) >= 3
          ? `; you've already had ${insight.highCarbDays} high-carb days this week`
          : '';
      warnings.push(`High GI (${profile.glycemicIndex}) — causes rapid blood glucose spikes${severityNote}`);
      statusScore -= 2;
    }
  }

  // ── Anti-inflammatory analysis ────────────────────────
  if (profile.antiInflammatoryScore >= 2) {
    reasons.push(
      `Strongly anti-inflammatory (score: +${profile.antiInflammatoryScore})${
        (insight.avgAntiInflamScore ?? 1) < 0
          ? ' — your diet this week has been inflammatory; this helps correct that'
          : ''
      }`
    );
    statusScore += 2;
  } else if (profile.antiInflammatoryScore === 1) {
    reasons.push('Mildly anti-inflammatory');
    statusScore += 1;
  } else if (profile.antiInflammatoryScore === 0) {
    reasons.push('Neutral inflammatory profile');
  } else if (profile.antiInflammatoryScore === -1) {
    const flareNote = insight.recentFlareUp ? ' — especially important to avoid during recent flare' : '';
    warnings.push(`Mildly inflammatory${flareNote}`);
    statusScore -= 1;
  } else if (profile.antiInflammatoryScore <= -2) {
    const flareNote = insight.recentFlareUp
      ? ' — a flare-up was recorded this week; inflammatory foods worsen UCTD symptoms'
      : '';
    warnings.push(
      `${profile.antiInflammatoryScore === -3 ? 'Strongly' : 'Significantly'} inflammatory (score: ${profile.antiInflammatoryScore})${flareNote}`
    );
    statusScore -= 3;
  }

  // ── UCTD-specific warnings ────────────────────────────
  if (!profile.uctdFriendly && profile.warningForUCTD) {
    warnings.push(`UCTD: ${profile.warningForUCTD}`);
    statusScore -= 1;
  }

  // ── Diabetes-specific warnings ────────────────────────
  if (!profile.diabetesFriendly && profile.warningForDiabetes) {
    warnings.push(`Diabetes: ${profile.warningForDiabetes}`);
    statusScore -= 1;
  }

  // ── Weekly gap correction bonuses ─────────────────────
  if (profile.isOmega3Source && insight.omega3Count < 2) {
    reasons.push(
      `Omega-3 source — you've only had ${insight.omega3Count} omega-3-rich meal(s) this week; aim for 3+`
    );
    statusScore += 2;
  }

  if (profile.isLeafyGreen && insight.leafyGreenCount < 3) {
    reasons.push(
      `Leafy green — only ${insight.leafyGreenCount} serving(s) this week; target 5+ for UCTD management`
    );
    statusScore += 1;
  }

  // ── High-carb week adjustment ─────────────────────────
  if (
    (insight.avgDailyCarbs ?? 0) > 150 &&
    profile.carbsPer100g > 20 &&
    profile.glycemicIndex > 55
  ) {
    warnings.push(
      `Your avg daily carbs this week are ${insight.avgDailyCarbs}g — above the 150g/day target for diabetes management; prioritize lower-carb alternatives`
    );
    statusScore -= 1;
  }

  // ── Derive final status ───────────────────────────────
  let status: 'recommend' | 'caution' | 'avoid';
  if (statusScore >= 2) {
    status = 'recommend';
  } else if (statusScore >= -1) {
    status = 'caution';
  } else {
    status = 'avoid';
  }

  const allReasons = [...reasons, ...warnings];

  // Build weekly context summary string
  const weeklyContextParts: string[] = [];
  if (insight.avgDailyCarbs !== null)
    weeklyContextParts.push(`Avg carbs: ${insight.avgDailyCarbs}g/day`);
  if (insight.avgAntiInflamScore !== null)
    weeklyContextParts.push(`Diet AI score: ${insight.avgAntiInflamScore > 0 ? '+' : ''}${insight.avgAntiInflamScore}`);
  if (insight.recentFlareUp) weeklyContextParts.push('Flare-up this week');

  return {
    status,
    reasons: allReasons,
    alternatives: profile.alternatives,
    diabetesFriendly: profile.diabetesFriendly,
    uctdFriendly: profile.uctdFriendly,
    glycemicIndex: profile.glycemicIndex || null,
    antiInflammatoryScore: profile.antiInflammatoryScore,
    weeklyContext: weeklyContextParts.length > 0 ? weeklyContextParts.join(' · ') : undefined,
  };
}

export function generateSmartSuggestions(insight: WeeklyInsight): string[] {
  const suggestions: string[] = [];

  if (insight.omega3Count < 2)
    suggestions.push('Salmon, sardines, or walnuts — omega-3s are low this week');
  if (insight.leafyGreenCount < 3)
    suggestions.push('Spinach or kale — leafy greens are under-represented this week');
  if ((insight.avgAntiInflamScore ?? 1) < 0)
    suggestions.push('Blueberries or cherries — powerful antioxidants to counter this week\'s inflammatory diet');
  if ((insight.avgDailyCarbs ?? 0) > 150)
    suggestions.push('Cauliflower rice or zucchini noodles — low-carb swaps to bring weekly average down');
  if (insight.recentFlareUp)
    suggestions.push('Turmeric + ginger — anti-inflammatory compounds; consider adding to meals during flare');
  if ((insight.avgGlucose ?? 100) > 150)
    suggestions.push('Cinnamon — may help improve insulin sensitivity; add to oatmeal or yogurt');
  if (insight.highGIFoodCount > 5)
    suggestions.push('Lentils or chickpeas — swap high-GI foods; low GI and anti-inflammatory');

  return suggestions;
}
