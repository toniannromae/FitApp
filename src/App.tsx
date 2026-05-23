import { useState, useEffect, useCallback } from 'react';
import type { Tab, AppData } from './types';
import { loadData, saveData } from './utils/storage';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import GlucoseTracker from './components/GlucoseTracker';
import FoodLog from './components/FoodLog';
import ExerciseLog from './components/ExerciseLog';
import SymptomTracker from './components/SymptomTracker';
import MedicationLog from './components/MedicationLog';

export default function App() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [data, setData] = useState<AppData>(loadData);

  const handleDataChange = useCallback((newData: AppData) => {
    setData(newData);
    saveData(newData);
  }, []);

  useEffect(() => {
    saveData(data);
  }, [data]);

  const tabTitles: Record<Tab, string> = {
    dashboard: 'FitApp',
    glucose: 'Blood Glucose',
    food: 'Food Log',
    exercise: 'Exercise',
    symptoms: 'Symptoms',
    medications: 'Medications',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f172a',
      color: '#f1f5f9',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      maxWidth: 480,
      margin: '0 auto',
      position: 'relative',
    }}>
      {/* Header */}
      <header style={{
        background: '#1e293b',
        borderBottom: '1px solid #334155',
        padding: '12px 16px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #0ea5e9, #a78bfa)', flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', lineHeight: 1 }}>
            {tabTitles[tab]}
          </div>
          {tab === 'dashboard' && (
            <div style={{ fontSize: 10, color: '#64748b', marginTop: 1 }}>
              Diabetes + UCTD Health Tracker
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <main style={{ paddingBottom: 80 }}>
        {tab === 'dashboard' && <Dashboard data={data} />}
        {tab === 'glucose' && <GlucoseTracker data={data} onChange={handleDataChange} />}
        {tab === 'food' && <FoodLog data={data} onChange={handleDataChange} />}
        {tab === 'exercise' && <ExerciseLog data={data} onChange={handleDataChange} />}
        {tab === 'symptoms' && <SymptomTracker data={data} onChange={handleDataChange} />}
        {tab === 'medications' && <MedicationLog data={data} onChange={handleDataChange} />}
      </main>

      <Navigation active={tab} onChange={setTab} />
    </div>
  );
}
