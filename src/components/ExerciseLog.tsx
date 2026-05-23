import { useState } from 'react';
import { format } from 'date-fns';
import { Plus, Trash2 } from 'lucide-react';
import type { ExerciseEntry, ExerciseType, AppData } from '../types';
import { generateId } from '../utils/storage';

interface Props {
  data: AppData;
  onChange: (data: AppData) => void;
}

const exerciseLabels: Record<ExerciseType, string> = {
  walking: 'Walking',
  swimming: 'Swimming',
  cycling: 'Cycling (gentle)',
  yoga: 'Yoga / Tai Chi',
  stretching: 'Stretching',
  'water-aerobics': 'Water Aerobics',
  strength: 'Light Strength',
  other: 'Other',
};

const exerciseIcons: Record<ExerciseType, string> = {
  walking: '🚶',
  swimming: '🏊',
  cycling: '🚴',
  yoga: '🧘',
  stretching: '🤸',
  'water-aerobics': '💧',
  strength: '🏋️',
  other: '⭐',
};

const exerciseTips: Record<ExerciseType, string> = {
  walking: 'Great for blood sugar control. Start with 10-min walks after meals.',
  swimming: 'Low-impact, reduces joint stress. Ideal for UCTD flares.',
  cycling: 'Gentle cycling protects joints while improving insulin sensitivity.',
  yoga: 'Reduces inflammation and stress. Modify poses for joint comfort.',
  stretching: 'Helps morning stiffness. Do gently, especially during flares.',
  'water-aerobics': 'Excellent — water buoyancy protects inflamed joints.',
  strength: 'Light resistance training improves glucose uptake. Avoid joint strain.',
  other: 'Track any movement — it all counts.',
};

function ScaleInput({ label, value, onChange, color }: { label: string; value: number; onChange: (v: number) => void; color: string }) {
  return (
    <div>
      <label style={{ ...labelStyle, marginBottom: 6 }}>{label}: <span style={{ color }}>{value}/10</span></label>
      <input
        type="range" min={0} max={10} value={value}
        onChange={e => onChange(parseInt(e.target.value))}
        style={{ width: '100%', accentColor: color }}
      />
    </div>
  );
}

export default function ExerciseLog({ data, onChange }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    type: 'walking' as ExerciseType,
    durationMinutes: '30',
    intensityLevel: 1 as 1 | 2 | 3,
    jointPainBefore: 0,
    jointPainAfter: 0,
    fatigueBefore: 0,
    fatigueAfter: 0,
    notes: '',
    timestamp: new Date().toISOString().slice(0, 16),
  });

  const sorted = [...data.exerciseEntries].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  function handleAdd() {
    const duration = parseInt(form.durationMinutes);
    if (!duration || duration < 1) return;
    const entry: ExerciseEntry = {
      id: generateId(),
      timestamp: new Date(form.timestamp).toISOString(),
      type: form.type,
      durationMinutes: duration,
      intensityLevel: form.intensityLevel,
      jointPainBefore: form.jointPainBefore,
      jointPainAfter: form.jointPainAfter,
      fatigueBefore: form.fatigueBefore,
      fatigueAfter: form.fatigueAfter,
      notes: form.notes || undefined,
    };
    onChange({ ...data, exerciseEntries: [entry, ...data.exerciseEntries] });
    setForm({
      type: 'walking', durationMinutes: '30', intensityLevel: 1,
      jointPainBefore: 0, jointPainAfter: 0, fatigueBefore: 0, fatigueAfter: 0,
      notes: '', timestamp: new Date().toISOString().slice(0, 16),
    });
    setShowForm(false);
  }

  function handleDelete(id: string) {
    onChange({ ...data, exerciseEntries: data.exerciseEntries.filter(e => e.id !== id) });
  }

  const intensityColors = { 1: '#22c55e', 2: '#f59e0b', 3: '#ef4444' };
  const intensityLabels = { 1: 'Low', 2: 'Moderate', 3: 'High' };

  return (
    <div style={{ padding: '16px 16px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#f1f5f9' }}>Exercise</h2>
        <button onClick={() => setShowForm(!showForm)} style={primaryBtn}>
          <Plus size={16} /> Log Exercise
        </button>
      </div>

      <div style={{
        background: '#1e293b', borderRadius: 10, padding: '10px 12px', marginBottom: 14,
        border: '1px solid #334155', fontSize: 12, color: '#94a3b8',
      }}>
        <span style={{ color: '#38bdf8', fontWeight: 600 }}>UCTD tip:</span>{' '}
        Prioritize low-impact exercise. Check glucose before/after. Skip or modify during flares.
        Always warm up with gentle stretching.
      </div>

      {showForm && (
        <div style={{ background: '#1e293b', borderRadius: 12, padding: 16, marginBottom: 16, border: '1px solid #334155' }}>
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Exercise Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {(Object.entries(exerciseLabels) as [ExerciseType, string][]).map(([k, v]) => (
                <button
                  key={k}
                  onClick={() => setForm({ ...form, type: k })}
                  style={{
                    background: form.type === k ? '#0ea5e922' : '#0f172a',
                    border: `1px solid ${form.type === k ? '#0ea5e9' : '#334155'}`,
                    borderRadius: 8, padding: '8px 10px', cursor: 'pointer',
                    color: form.type === k ? '#38bdf8' : '#94a3b8',
                    fontSize: 12, textAlign: 'left',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  <span>{exerciseIcons[k]}</span> {v}
                </button>
              ))}
            </div>
            {form.type && (
              <div style={{ marginTop: 8, fontSize: 11, color: '#64748b', background: '#0f172a', borderRadius: 6, padding: '6px 10px' }}>
                {exerciseTips[form.type]}
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            <div>
              <label style={labelStyle}>Duration (minutes)</label>
              <input
                type="number" value={form.durationMinutes}
                onChange={e => setForm({ ...form, durationMinutes: e.target.value })}
                placeholder="30" style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Intensity Level</label>
              <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                {([1, 2, 3] as const).map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => setForm({ ...form, intensityLevel: lvl })}
                    style={{
                      flex: 1, padding: '6px 4px', borderRadius: 8, border: 'none',
                      cursor: 'pointer', fontSize: 12, fontWeight: 600,
                      background: form.intensityLevel === lvl ? intensityColors[lvl] : '#0f172a',
                      color: form.intensityLevel === lvl ? '#fff' : '#94a3b8',
                    }}
                  >
                    {intensityLabels[lvl]}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={labelStyle}>Date & Time</label>
              <input type="datetime-local" value={form.timestamp} onChange={e => setForm({ ...form, timestamp: e.target.value })} style={inputStyle} />
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginBottom: 8 }}>Before Exercise</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <ScaleInput label="Joint Pain" value={form.jointPainBefore} onChange={v => setForm({ ...form, jointPainBefore: v })} color="#f97316" />
              <ScaleInput label="Fatigue" value={form.fatigueBefore} onChange={v => setForm({ ...form, fatigueBefore: v })} color="#a78bfa" />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginBottom: 8 }}>After Exercise</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <ScaleInput label="Joint Pain" value={form.jointPainAfter} onChange={v => setForm({ ...form, jointPainAfter: v })} color="#f97316" />
              <ScaleInput label="Fatigue" value={form.fatigueAfter} onChange={v => setForm({ ...form, fatigueAfter: v })} color="#a78bfa" />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Notes</label>
            <input type="text" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="e.g. felt good, checked glucose after" style={inputStyle} />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleAdd} style={{ ...primaryBtn, flex: 1, justifyContent: 'center' }}>Save Exercise</button>
            <button onClick={() => setShowForm(false)} style={secondaryBtn}>Cancel</button>
          </div>
        </div>
      )}

      {sorted.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#64748b', padding: 32 }}>
          No exercise entries yet. Log your first session above.
        </div>
      ) : (
        sorted.map(entry => {
          const painChange = entry.jointPainAfter - entry.jointPainBefore;
          const fatigueChange = entry.fatigueAfter - entry.fatigueBefore;
          return (
            <div key={entry.id} style={{
              background: '#1e293b', borderRadius: 12, padding: '12px 14px',
              marginBottom: 8, border: '1px solid #334155',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10, background: '#0f172a',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, flexShrink: 0,
                }}>
                  {exerciseIcons[entry.type]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>
                      {exerciseLabels[entry.type]}
                    </span>
                    <span style={{
                      fontSize: 10, padding: '1px 6px', borderRadius: 99,
                      background: `${intensityColors[entry.intensityLevel]}22`,
                      color: intensityColors[entry.intensityLevel],
                    }}>
                      {intensityLabels[entry.intensityLevel]}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>
                    {format(new Date(entry.timestamp), 'MMM d, yyyy h:mm a')} • {entry.durationMinutes} min
                  </div>
                  <div style={{ display: 'flex', gap: 12, fontSize: 11 }}>
                    <span style={{ color: painChange > 1 ? '#ef4444' : painChange < -1 ? '#22c55e' : '#94a3b8' }}>
                      Joint pain: {entry.jointPainBefore}→{entry.jointPainAfter}
                      {painChange > 1 ? ' ↑' : painChange < -1 ? ' ↓' : ''}
                    </span>
                    <span style={{ color: fatigueChange > 1 ? '#f97316' : fatigueChange < -1 ? '#22c55e' : '#94a3b8' }}>
                      Fatigue: {entry.fatigueBefore}→{entry.fatigueAfter}
                      {fatigueChange > 1 ? ' ↑' : fatigueChange < -1 ? ' ↓' : ''}
                    </span>
                  </div>
                  {entry.notes && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{entry.notes}</div>}
                </div>
                <button onClick={() => handleDelete(entry.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 4 }}>
                  <Trash2 size={14} />
                </button>
              </div>
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
