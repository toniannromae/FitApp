import type { AppData } from '../types';

const STORAGE_KEY = 'fitapp_data';

const defaultData: AppData = {
  glucoseReadings: [],
  foodEntries: [],
  exerciseEntries: [],
  symptomEntries: [],
  medicationLogs: [],
  medicationSchedules: [],
};

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData;
    return { ...defaultData, ...JSON.parse(raw) };
  } catch {
    return defaultData;
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
