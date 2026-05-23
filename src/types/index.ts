export type GlucoseContext = 'fasting' | 'pre-meal' | 'post-meal' | 'bedtime' | 'exercise' | 'random';

export interface GlucoseReading {
  id: string;
  timestamp: string;
  value: number; // mg/dL
  context: GlucoseContext;
  notes?: string;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface FoodEntry {
  id: string;
  timestamp: string;
  meal: MealType;
  name: string;
  carbs: number; // grams
  protein: number; // grams
  fat: number; // grams
  calories: number;
  glycemicIndex?: number; // 0-100
  antiInflammatoryScore: number; // -3 (inflammatory) to +3 (anti-inflammatory)
  notes?: string;
}

export type ExerciseType =
  | 'walking'
  | 'swimming'
  | 'cycling'
  | 'yoga'
  | 'stretching'
  | 'water-aerobics'
  | 'strength'
  | 'other';

export interface ExerciseEntry {
  id: string;
  timestamp: string;
  type: ExerciseType;
  durationMinutes: number;
  intensityLevel: 1 | 2 | 3; // 1=low, 2=moderate, 3=high
  jointPainBefore: number; // 0-10
  jointPainAfter: number; // 0-10
  fatigueBefore: number; // 0-10
  fatigueAfter: number; // 0-10
  notes?: string;
}

export interface SymptomEntry {
  id: string;
  timestamp: string;
  // UCTD symptoms
  jointPain: number; // 0-10
  jointStiffness: number; // 0-10 (especially morning)
  fatigue: number; // 0-10
  skinSymptoms: number; // 0-10 (rash, photosensitivity)
  raynaudsSymptoms: number; // 0-10
  muscleWeakness: number; // 0-10
  // Diabetes symptoms
  hypoglycemiaSymptoms: boolean;
  hyperglycemiaSymptoms: boolean;
  // Overall
  overallWellbeing: number; // 1-10 (10 = best)
  flareUp: boolean;
  notes?: string;
}

export type MedicationType = 'diabetes' | 'uctd' | 'supplement' | 'other';

export interface MedicationEntry {
  id: string;
  timestamp: string;
  name: string;
  dose: string;
  type: MedicationType;
  taken: boolean;
  notes?: string;
}

export interface MedicationSchedule {
  id: string;
  name: string;
  dose: string;
  type: MedicationType;
  timesPerDay: number;
  scheduledTimes: string[]; // HH:MM format
  notes?: string;
}

export type Tab = 'dashboard' | 'glucose' | 'food' | 'exercise' | 'symptoms' | 'medications' | 'grocery';

export interface AppData {
  glucoseReadings: GlucoseReading[];
  foodEntries: FoodEntry[];
  exerciseEntries: ExerciseEntry[];
  symptomEntries: SymptomEntry[];
  medicationLogs: MedicationEntry[];
  medicationSchedules: MedicationSchedule[];
  groceryItems: import('./grocery').GroceryItem[];
}
