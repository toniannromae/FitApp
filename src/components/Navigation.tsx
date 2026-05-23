import { Activity, Droplets, Utensils, Dumbbell, Heart, Pill, ShoppingCart } from 'lucide-react';
import type { Tab } from '../types';

interface Props {
  active: Tab;
  onChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Home', icon: <Activity size={17} /> },
  { id: 'glucose', label: 'Glucose', icon: <Droplets size={17} /> },
  { id: 'food', label: 'Food', icon: <Utensils size={17} /> },
  { id: 'exercise', label: 'Exercise', icon: <Dumbbell size={17} /> },
  { id: 'symptoms', label: 'Symptoms', icon: <Heart size={17} /> },
  { id: 'medications', label: 'Meds', icon: <Pill size={17} /> },
  { id: 'grocery', label: 'Grocery', icon: <ShoppingCart size={17} /> },
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
      overflowX: 'auto',
      scrollbarWidth: 'none',
    }}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          style={{
            flex: '0 0 auto',
            minWidth: 64,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            padding: '8px 6px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: active === tab.id ? '#38bdf8' : '#94a3b8',
            fontSize: 9,
            fontWeight: active === tab.id ? 600 : 400,
            borderTop: active === tab.id ? '2px solid #38bdf8' : '2px solid transparent',
            transition: 'color 0.15s',
            whiteSpace: 'nowrap',
          }}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
