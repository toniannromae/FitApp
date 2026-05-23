import { useState } from 'react';
import { format } from 'date-fns';
import { Plus, Trash2 } from 'lucide-react';
import type { GlucoseReading, GlucoseContext, AppData } from '../types';
import { glucoseStatus } from '../utils/calculations';
import { generateId } from '../utils/storage';

interface Props {
  data: AppData;
  onChange: (data: AppData) => void;
}

const contextLabels: Record<GlucoseContext, string> = {
  fasting: 'Fasting',
  'pre-meal': 'Pre-Meal',
  'post-meal': 'Post-Meal (2h)',
  bedtime: 'Bedtime',
  exercise: 'During/After Exercise',
  random: 'Random',
};

const targetRanges: Record<GlucoseContext, string> = {
  fasting: 'Target: 80–130 mg/dL',
  'pre-meal': 'Target: 80–130 mg/dL',
  'post-meal': 'Target: <180 mg/dL',
  bedtime: 'Target: 100–140 mg/dL',
  exercise: 'Check: 100–250 mg/dL',
  random: '–',
};

function GlucoseBadge({ value }: { value: number }) {
  const { label, color } = glucoseStatus(value);
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 99,
      background: `${color}22`, color,
    }}>
      {label}
    </span>
  );
}

export default function GlucoseTracker({ data, onChange }: Props) {
  const [form, setForm] = useState({
    value: '',
    context: 'fasting' as GlucoseContext,
    notes: '',
    timestamp: new Date().toISOString().slice(0, 16),
  });
  const [showForm, setShowForm] = useState(false);

  const sorted = [...data.glucoseReadings].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  function handleAdd() {
    const value = parseFloat(form.value);
    if (isNaN(value) || value < 20 || value > 600) return;
    const entry: GlucoseReading = {
      id: generateId(),
      timestamp: new Date(form.timestamp).toISOString(),
      value,
      context: form.context,
      notes: form.notes || undefined,
    };
    onChange({ ...data, glucoseReadings: [entry, ...data.glucoseReadings] });
    setForm({ value: '', context: 'fasting', notes: '', timestamp: new Date().toISOString().slice(0, 16) });
    setShowForm(false);
  }

  function handleDelete(id: string) {
    onChange({ ...data, glucoseReadings: data.glucoseReadings.filter(r => r.id !== id) });
  }

  return (
    <div style={{ padding: '16px 16px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#f1f5f9' }}>Blood Glucose</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: '#0ea5e9', color: '#fff', border: 'none',
            borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontWeight: 600, fontSize: 13,
          }}
        >
          <Plus size={16} /> Log Reading
        </button>
      </div>

      {showForm && (
        <div style={{
          background: '#1e293b', borderRadius: 12, padding: 16, marginBottom: 16,
          border: '1px solid #334155',
        }}>
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Reading (mg/dL)</label>
            <input
              type="number"
              value={form.value}
              onChange={e => setForm({ ...form, value: e.target.value })}
              placeholder="e.g. 120"
              style={inputStyle}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Context</label>
            <select
              value={form.context}
              onChange={e => setForm({ ...form, context: e.target.value as GlucoseContext })}
              style={inputStyle}
            >
              {Object.entries(contextLabels).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
              {targetRanges[form.context]}
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Date & Time</label>
            <input
              type="datetime-local"
              value={form.timestamp}
              onChange={e => setForm({ ...form, timestamp: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Notes (optional)</label>
            <input
              type="text"
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              placeholder="e.g. felt dizzy, had snack earlier"
              style={inputStyle}
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleAdd} style={primaryBtn}>Save Reading</button>
            <button onClick={() => setShowForm(false)} style={secondaryBtn}>Cancel</button>
          </div>
        </div>
      )}

      {/* Reference guide */}
      <div style={{
        background: '#1e293b', borderRadius: 12, padding: '12px 14px', marginBottom: 16,
        border: '1px solid #334155',
      }}>
        <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 8 }}>
          Glucose Reference Ranges
        </div>
        {[
          { range: '< 70', label: 'Low (Hypoglycemia)', color: '#ef4444' },
          { range: '70–99', label: 'Normal / Fasting target', color: '#22c55e' },
          { range: '100–140', label: 'Elevated / Post-meal OK', color: '#f59e0b' },
          { range: '141–180', label: 'High — monitor closely', color: '#f97316' },
          { range: '> 180', label: 'Very High — take action', color: '#dc2626' },
        ].map(({ range, label, color }) => (
          <div key={range} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid #0f172a' }}>
            <span style={{ fontSize: 12, color, fontWeight: 600 }}>{range} mg/dL</span>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Readings list */}
      <div>
        {sorted.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#64748b', padding: 32 }}>
            No glucose readings yet. Log your first reading above.
          </div>
        ) : (
          sorted.map(r => {
            const { color } = glucoseStatus(r.value);
            return (
              <div key={r.id} style={{
                background: '#1e293b', borderRadius: 12, padding: '12px 14px',
                marginBottom: 8, border: '1px solid #334155',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 10, background: `${color}22`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <span style={{ fontSize: 18, fontWeight: 700, color }}>{r.value}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>
                      {contextLabels[r.context]}
                    </span>
                    <GlucoseBadge value={r.value} />
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>
                    {format(new Date(r.timestamp), 'MMM d, yyyy h:mm a')}
                  </div>
                  {r.notes && (
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{r.notes}</div>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(r.id)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#475569', padding: 4, borderRadius: 6,
                  }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 4, fontWeight: 600,
};

const inputStyle: React.CSSProperties = {
  width: '100%', background: '#0f172a', border: '1px solid #334155',
  borderRadius: 8, padding: '8px 10px', color: '#f1f5f9', fontSize: 14,
  boxSizing: 'border-box',
};

const primaryBtn: React.CSSProperties = {
  background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: 8,
  padding: '10px 16px', cursor: 'pointer', fontWeight: 600, fontSize: 14, flex: 1,
};

const secondaryBtn: React.CSSProperties = {
  background: '#334155', color: '#f1f5f9', border: 'none', borderRadius: 8,
  padding: '10px 16px', cursor: 'pointer', fontWeight: 600, fontSize: 14,
};
