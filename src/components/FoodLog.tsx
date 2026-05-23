import { useState } from 'react';
import { format } from 'date-fns';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import type { FoodEntry, MealType, AppData } from '../types';
import { generateId } from '../utils/storage';
import { glycemicLoad } from '../utils/calculations';

interface Props {
  data: AppData;
  onChange: (data: AppData) => void;
}

const mealLabels: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

const aiLabels: Record<string, { label: string; color: string }> = {
  '-3': { label: 'Very Inflammatory', color: '#dc2626' },
  '-2': { label: 'Inflammatory', color: '#ef4444' },
  '-1': { label: 'Mildly Inflammatory', color: '#f97316' },
  '0': { label: 'Neutral', color: '#94a3b8' },
  '1': { label: 'Mildly Anti-Inflam.', color: '#84cc16' },
  '2': { label: 'Anti-Inflammatory', color: '#22c55e' },
  '3': { label: 'Strongly Anti-Inflam.', color: '#10b981' },
};

const commonFoods = [
  { name: 'Grilled Salmon', carbs: 0, protein: 30, fat: 12, calories: 230, gi: 0, ai: 3 },
  { name: 'Brown Rice (1 cup)', carbs: 45, protein: 5, fat: 2, calories: 218, gi: 55, ai: 0 },
  { name: 'Spinach Salad', carbs: 3, protein: 2, fat: 0, calories: 20, gi: 15, ai: 3 },
  { name: 'Blueberries (1 cup)', carbs: 21, protein: 1, fat: 0, calories: 84, gi: 53, ai: 2 },
  { name: 'Chicken Breast', carbs: 0, protein: 31, fat: 3, calories: 165, gi: 0, ai: 1 },
  { name: 'Avocado (half)', carbs: 8, protein: 2, fat: 15, calories: 160, gi: 15, ai: 2 },
  { name: 'Whole Wheat Bread', carbs: 24, protein: 4, fat: 2, calories: 138, gi: 71, ai: -1 },
  { name: 'White Rice (1 cup)', carbs: 45, protein: 4, fat: 0, calories: 206, gi: 73, ai: -1 },
  { name: 'Soda (12 oz)', carbs: 39, protein: 0, fat: 0, calories: 140, gi: 63, ai: -3 },
  { name: 'Walnuts (1 oz)', carbs: 4, protein: 4, fat: 18, calories: 185, gi: 15, ai: 3 },
  { name: 'Sweet Potato', carbs: 26, protein: 2, fat: 0, calories: 112, gi: 63, ai: 2 },
  { name: 'Oatmeal (1 cup)', carbs: 27, protein: 5, fat: 3, calories: 154, gi: 55, ai: 1 },
  { name: 'Greek Yogurt (plain)', carbs: 9, protein: 17, fat: 0, calories: 100, gi: 36, ai: 1 },
  { name: 'Broccoli (1 cup)', carbs: 11, protein: 3, fat: 0, calories: 55, gi: 10, ai: 3 },
  { name: 'Egg (1 large)', carbs: 1, protein: 6, fat: 5, calories: 72, gi: 0, ai: 1 },
];

export default function FoodLog({ data, onChange }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    meal: 'breakfast' as MealType,
    carbs: '',
    protein: '',
    fat: '',
    calories: '',
    gi: '',
    ai: '0',
    notes: '',
    timestamp: new Date().toISOString().slice(0, 16),
  });

  const sorted = [...data.foodEntries].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  function fillFromCommon(food: typeof commonFoods[0]) {
    setForm(f => ({
      ...f,
      name: food.name,
      carbs: String(food.carbs),
      protein: String(food.protein),
      fat: String(food.fat),
      calories: String(food.calories),
      gi: String(food.gi),
      ai: String(food.ai),
    }));
  }

  function handleAdd() {
    if (!form.name.trim()) return;
    const entry: FoodEntry = {
      id: generateId(),
      timestamp: new Date(form.timestamp).toISOString(),
      meal: form.meal,
      name: form.name.trim(),
      carbs: parseFloat(form.carbs) || 0,
      protein: parseFloat(form.protein) || 0,
      fat: parseFloat(form.fat) || 0,
      calories: parseFloat(form.calories) || 0,
      glycemicIndex: form.gi ? parseFloat(form.gi) : undefined,
      antiInflammatoryScore: parseInt(form.ai),
      notes: form.notes || undefined,
    };
    onChange({ ...data, foodEntries: [entry, ...data.foodEntries] });
    setForm({
      name: '', meal: 'breakfast', carbs: '', protein: '', fat: '',
      calories: '', gi: '', ai: '0', notes: '',
      timestamp: new Date().toISOString().slice(0, 16),
    });
    setShowForm(false);
  }

  function handleDelete(id: string) {
    onChange({ ...data, foodEntries: data.foodEntries.filter(e => e.id !== id) });
  }

  return (
    <div style={{ padding: '16px 16px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#f1f5f9' }}>Food Log</h2>
        <button onClick={() => setShowForm(!showForm)} style={primaryBtn}>
          <Plus size={16} /> Log Food
        </button>
      </div>

      {showForm && (
        <div style={{ background: '#1e293b', borderRadius: 12, padding: 16, marginBottom: 16, border: '1px solid #334155' }}>
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Quick Add (tap to fill)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {commonFoods.map(f => (
                <button
                  key={f.name}
                  onClick={() => fillFromCommon(f)}
                  style={{
                    background: '#0f172a', border: '1px solid #334155', borderRadius: 6,
                    padding: '4px 8px', fontSize: 11, color: '#94a3b8', cursor: 'pointer',
                  }}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={labelStyle}>Food Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Grilled Salmon"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Meal</label>
              <select value={form.meal} onChange={e => setForm({ ...form, meal: e.target.value as MealType })} style={inputStyle}>
                {Object.entries(mealLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Date & Time</label>
              <input type="datetime-local" value={form.timestamp} onChange={e => setForm({ ...form, timestamp: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Carbs (g)</label>
              <input type="number" value={form.carbs} onChange={e => setForm({ ...form, carbs: e.target.value })} placeholder="0" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Protein (g)</label>
              <input type="number" value={form.protein} onChange={e => setForm({ ...form, protein: e.target.value })} placeholder="0" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Fat (g)</label>
              <input type="number" value={form.fat} onChange={e => setForm({ ...form, fat: e.target.value })} placeholder="0" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Calories</label>
              <input type="number" value={form.calories} onChange={e => setForm({ ...form, calories: e.target.value })} placeholder="0" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Glycemic Index (0–100)</label>
              <input type="number" value={form.gi} onChange={e => setForm({ ...form, gi: e.target.value })} placeholder="optional" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Anti-Inflam. Score</label>
              <select value={form.ai} onChange={e => setForm({ ...form, ai: e.target.value })} style={inputStyle}>
                {[-3, -2, -1, 0, 1, 2, 3].map(v => (
                  <option key={v} value={v}>{v > 0 ? `+${v}` : v} — {aiLabels[String(v)].label}</option>
                ))}
              </select>
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={labelStyle}>Notes</label>
              <input type="text" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="optional" style={inputStyle} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleAdd} style={{ ...primaryBtn, flex: 1 }}>Save Entry</button>
            <button onClick={() => setShowForm(false)} style={secondaryBtn}>Cancel</button>
          </div>
        </div>
      )}

      {sorted.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#64748b', padding: 32 }}>
          No food entries yet. Log your first meal above.
        </div>
      ) : (
        sorted.map(entry => {
          const ai = aiLabels[String(entry.antiInflammatoryScore)];
          const gl = entry.glycemicIndex ? glycemicLoad(entry.carbs, entry.glycemicIndex) : null;
          const isExpanded = expandedId === entry.id;
          return (
            <div key={entry.id} style={{ background: '#1e293b', borderRadius: 12, marginBottom: 8, border: '1px solid #334155', overflow: 'hidden' }}>
              <div
                style={{ padding: '12px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}
                onClick={() => setExpandedId(isExpanded ? null : entry.id)}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>{entry.name}</span>
                    <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 99, background: '#334155', color: '#94a3b8' }}>
                      {mealLabels[entry.meal]}
                    </span>
                    <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 99, background: `${ai.color}22`, color: ai.color }}>
                      {ai.label}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>
                    {format(new Date(entry.timestamp), 'MMM d h:mm a')} •{' '}
                    {entry.carbs}g carbs • {entry.calories} kcal
                    {gl !== null && ` • GL: ${gl}`}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <button onClick={e => { e.stopPropagation(); handleDelete(entry.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 4 }}>
                    <Trash2 size={14} />
                  </button>
                  {isExpanded ? <ChevronUp size={14} color="#64748b" /> : <ChevronDown size={14} color="#64748b" />}
                </div>
              </div>
              {isExpanded && (
                <div style={{ padding: '0 14px 12px', borderTop: '1px solid #0f172a' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 10 }}>
                    {[
                      { label: 'Carbs', value: `${entry.carbs}g`, color: '#a78bfa' },
                      { label: 'Protein', value: `${entry.protein}g`, color: '#38bdf8' },
                      { label: 'Fat', value: `${entry.fat}g`, color: '#f59e0b' },
                      { label: 'Calories', value: String(entry.calories), color: '#e2e8f0' },
                    ].map(m => (
                      <div key={m.label} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: m.color }}>{m.value}</div>
                        <div style={{ fontSize: 10, color: '#64748b' }}>{m.label}</div>
                      </div>
                    ))}
                  </div>
                  {entry.glycemicIndex !== undefined && (
                    <div style={{ marginTop: 8, fontSize: 12, color: '#94a3b8' }}>
                      GI: {entry.glycemicIndex} •{' '}
                      {entry.glycemicIndex <= 55 ? '🟢 Low GI' : entry.glycemicIndex <= 70 ? '🟡 Medium GI' : '🔴 High GI'}
                      {gl !== null && ` | Glycemic Load: ${gl}`}
                    </div>
                  )}
                  {entry.notes && <div style={{ marginTop: 6, fontSize: 12, color: '#94a3b8' }}>{entry.notes}</div>}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 4, fontWeight: 600 };
const inputStyle: React.CSSProperties = { width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: '8px 10px', color: '#f1f5f9', fontSize: 14, boxSizing: 'border-box' };
const primaryBtn: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 4, background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontWeight: 600, fontSize: 13 };
const secondaryBtn: React.CSSProperties = { background: '#334155', color: '#f1f5f9', border: 'none', borderRadius: 8, padding: '10px 16px', cursor: 'pointer', fontWeight: 600, fontSize: 14 };
