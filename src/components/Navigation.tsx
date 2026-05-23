import { Activity, Droplets, Utensils, Dumbbell, Heart, Pill } from 'lucide-react';
import type { Tab } from '../types';

interface Props {
  active: Tab;
  onChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <Activity size={18} /> },
  { id: 'glucose', label: 'Glucose', icon: <Droplets size={18} /> },
  { id: 'food', label: 'Food', icon: <Utensils size={18} /> },
  { id: 'exercise', label: 'Exercise', icon: <Dumbbell size={18} /> },
  { id: 'symptoms', label: 'Symptoms', icon: <Heart size={18} /> },
  { id: 'medications', label: 'Meds', icon: <Pill size={18} /> },
];

export default function Navigation({ active, onChange }: Props) {
  return (
    <nav style={{
      display: 'flex',
      background: '#1e293b',
      borderTop: '1px solid #334155',
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 100,
    }}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            padding: '8px 4px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: active === tab.id ? '#38bdf8' : '#94a3b8',
            fontSize: 10,
            fontWeight: active === tab.id ? 600 : 400,
            borderTop: active === tab.id ? '2px solid #38bdf8' : '2px solid transparent',
            transition: 'color 0.15s',
          }}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
