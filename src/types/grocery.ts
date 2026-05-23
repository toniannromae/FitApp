export type GroceryCategory =
  | 'produce'
  | 'protein'
  | 'dairy-eggs'
  | 'grains'
  | 'fats-oils'
  | 'legumes'
  | 'frozen'
  | 'beverages'
  | 'condiments'
  | 'snacks'
  | 'other';

export type RecommendationStatus = 'recommend' | 'caution' | 'avoid';

export interface GroceryItemAnalysis {
  status: RecommendationStatus;
  reasons: string[];
  alternatives: { name: string; reason: string }[];
  diabetesFriendly: boolean;
  uctdFriendly: boolean;
  glycemicIndex: number | null;
  antiInflammatoryScore: number | null;
  weeklyContext?: string;
}

export interface GroceryItem {
  id: string;
  name: string;
  quantity: string;
  category: GroceryCategory;
  checked: boolean;
  addedAt: string;
  analysis: GroceryItemAnalysis | null;
}

export interface WeeklyInsight {
  avgDailyCarbs: number | null;
  avgAntiInflamScore: number | null;
  avgGlucose: number | null;
  recentFlareUp: boolean;
  omega3Count: number;
  leafyGreenCount: number;
  highGIFoodCount: number;
  highCarbDays: number;
}
