import { useState } from 'react';
import { format } from 'date-fns';
import { Plus, Trash2 } from 'lucide-react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip,
} from 'recharts';
import type { SymptomEntry, AppData } from '../types';
import { generateId } from '../utils/storage';

interface Props {
  data: AppData;
  onChange: (data: AppData) => void;
}

function ScaleInput({ label, value, onChange, color, hint }: {
  label: string; value: number; onChange: (v: number) => void; color: string; hint?: string;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ ...labelStyle, marginBottom: 4 }}>
        {label}: <span style={{ color, fontWeight: 700 }}>{value}/10</span>
        {hint && <span style={{ color: '#64748b', fontWeight: 400 }}> — {hint}</span>}
      </label>
      <input type="range" min={0} max={10} value={value} onChange={e => onChange(parseInt(e.target.value))} style={{ width: '100%', accentColor: color }} />
    </div>
  );
}

export default function SymptomTracker({ data, onChange }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    jointPain: 0,
    jointStiffness: 0,
    fatigue: 0,
    skinSymptoms: 0,
    raynaudsSymptoms: 0,
    muscleWeakness: 0,
    hypoglycemiaSymptoms: false,
    hyperglycemiaSymptoms: false,
    overallWellbeing: 7,
    flareUp: false,
    notes: '',
    timestamp: new Date().toISOString().slice(0, 16),
  });

  const sorted = [...data.symptomEntries].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const latest = sorted[0];

  function handleAdd() {
    const entry: SymptomEntry = {
      id: generateId(),
      timestamp: new Date(form.timestamp).toISOString(),
      jointPain: form.jointPain,
      jointStiffness: form.jointStiffness,
      fatigue: form.fatigue,
      skinSymptoms: form.skinSymptoms,
      raynaudsSymptoms: form.raynaudsSymptoms,
      muscleWeakness: form.muscleWeakness,
      hypoglycemiaSymptoms: form.hypoglycemiaSymptoms,
      hyperglycemiaSymptoms: form.hyperglycemiaSymptoms,
      overallWellbeing: form.overallWellbeing,
      flareUp: form.flareUp,
      notes: form.notes || undefined,
    };
    onChange({ ...data, symptomEntries: [entry, ...data.symptomEntries] });
    setForm({
      jointPain: 0, jointStiffness: 0, fatigue: 0, skinSymptoms: 0,
      raynaudsSymptoms: 0, muscleWeakness: 0,
      hypoglycemiaSymptoms: false, hyperglycemiaSymptoms: false,
      overallWellbeing: 7, flareUp: false, notes: '',
      timestamp: new Date().toISOString().slice(0, 16),
    });
    setShowForm(false);
  }

  function handleDelete(id: string) {
    onChange({ ...data, symptomEntries: data.symptomEntries.filter(e => e.id !== id) });
  }

  const radarData = latest ? [
    { subject: 'Joint Pain', A: latest.jointPain },
    { subject: 'Stiffness', A: latest.jointStiffness },
    { subject: 'Fatigue', A: latest.fatigue },
    { subject: 'Skin', A: latest.skinSymptoms },
    { subject: 'Raynaud\'s', A: latest.raynaudsSymptoms },
    { subject: 'Weakness', A: latest.muscleWeakness },
  ] : [];

  return (
    <div style={{ padding: '16px 16px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#f1f5f9' }}>Symptoms</h2>
          <p style={{ margin: '2px 0 0', fontSize: 11, color: '#64748b' }}>UCTD & Diabetes Tracking</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={primaryBtn}>
          <Plus size={16} /> Log Today
        </button>
      </div>

      {/* Radar chart of latest symptoms */}
      {latest && !showForm && (
        <div style={{ background: '#1e293b', borderRadius: 12, padding: '14px 12px', marginBottom: 16, border: '1px solid #334155' }}>
          <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginBottom: 4 }}>
            Latest Symptom Profile
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>
            {format(new Date(latest.timestamp), 'MMM d, yyyy h:mm a')}
            {latest.flareUp && <span style={{ color: '#ef4444', marginLeft: 8, fontWeight: 700 }}>⚠ FLARE-UP</span>}
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
              <Radar name="Symptoms" dataKey="A" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.3} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155' }} itemStyle={{ color: '#a78bfa' }} />
            </RadarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 4 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: latest.overallWellbeing >= 7 ? '#22c55e' : latest.overallWellbeing >= 4 ? '#f59e0b' : '#ef4444' }}>
                {latest.overallWellbeing}/10
              </div>
              <div style={{ fontSize: 10, color: '#64748b' }}>Overall Wellbeing</div>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div style={{ background: '#1e293b', borderRadius: 12, padding: 16, marginBottom: 16, border: '1px solid #334155' }}>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Date & Time</label>
            <input type="datetime-local" value={form.timestamp} onChange={e => setForm({ ...form, timestamp: e.target.value })} style={inputStyle} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: '#a78bfa', fontWeight: 700, marginBottom: 12 }}>
              UCTD Symptoms
            </div>
            <ScaleInput label="Joint Pain" value={form.jointPain} onChange={v => setForm({ ...form, jointPain: v })} color="#ef4444" hint="0=none, 10=severe" />
            <ScaleInput label="Morning Stiffness" value={form.jointStiffness} onChange={v => setForm({ ...form, jointStiffness: v })} color="#f97316" hint="duration & severity" />
            <ScaleInput label="Fatigue" value={form.fatigue} onChange={v => setForm({ ...form, fatigue: v })} color="#a78bfa" hint="0=none, 10=debilitating" />
            <ScaleInput label="Skin Symptoms" value={form.skinSymptoms} onChange={v => setForm({ ...form, skinSymptoms: v })} color="#f59e0b" hint="rash, sensitivity" />
            <ScaleInput label="Raynaud's Symptoms" value={form.raynaudsSymptoms} onChange={v => setForm({ ...form, raynaudsSymptoms: v })} color="#38bdf8" hint="finger/toe color changes" />
            <ScaleInput label="Muscle Weakness" value={form.muscleWeakness} onChange={v => setForm({ ...form, muscleWeakness: v })} color="#94a3b8" hint="0=none, 10=significant" />
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: '#38bdf8', fontWeight: 700, marginBottom: 12 }}>
              Diabetes Symptoms
            </div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              {[
                { key: 'hypoglycemiaSymptoms', label: 'Hypoglycemia', desc: 'Shaky, sweaty, confused', color: '#ef4444' },
                { key: 'hyperglycemiaSymptoms', label: 'Hyperglycemia', desc: 'Thirsty, frequent urination', color: '#f97316' },
              ].map(({ key, label, desc, color }) => (
                <button
                  key={key}
                  onClick={() => setForm({ ...form, [key]: !form[key as keyof typeof form] })}
                  style={{
                    flex: 1, padding: '10px 8px', borderRadius: 8,
                    border: `1px solid ${form[key as keyof typeof form] ? color : '#334155'}`,
                    background: form[key as keyof typeof form] ? `${color}22` : '#0f172a',
                    cursor: 'pointer', textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: form[key as keyof typeof form] ? color : '#94a3b8' }}>{label}</div>
                  <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>{desc}</div>
                </button>
              ))}
            </div>
          </div>

          <ScaleInput
            label="Overall Wellbeing"
            value={form.overallWellbeing}
            onChange={v => setForm({ ...form, overallWellbeing: v })}
            color={form.overallWellbeing >= 7 ? '#22c55e' : form.overallWellbeing >= 4 ? '#f59e0b' : '#ef4444'}
            hint="10=feeling great"
          />

          <div style={{ marginBottom: 14 }}>
            <button
              onClick={() => setForm({ ...form, flareUp: !form.flareUp })}
              style={{
                width: '100%', padding: '10px', borderRadius: 8, border: `1px solid ${form.flareUp ? '#ef4444' : '#334155'}`,
                background: form.flareUp ? '#ef444422' : '#0f172a', cursor: 'pointer',
                color: form.flareUp ? '#ef4444' : '#94a3b8', fontWeight: 600, fontSize: 13,
              }}
            >
              {form.flareUp ? '⚠ Flare-Up Marked' : 'Mark as Flare-Up Day'}
            </button>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Notes</label>
            <textarea
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              placeholder="Describe symptoms in more detail..."
              style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleAdd} style={{ ...primaryBtn, flex: 1, justifyContent: 'center' }}>Save Entry</button>
            <button onClick={() => setShowForm(false)} style={secondaryBtn}>Cancel</button>
          </div>
        </div>
      )}

      {sorted.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#64748b', padding: 32 }}>
          No symptom entries yet. Log your first entry above.
        </div>
      ) : (
        sorted.map(entry => (
          <div key={entry.id} style={{
            background: '#1e293b', borderRadius: 12, padding: '12px 14px',
            marginBottom: 8, border: `1px solid ${entry.flareUp ? '#ef444444' : '#334155'}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>
                    {format(new Date(entry.timestamp), 'MMM d, yyyy h:mm a')}
                  </span>
                  {entry.flareUp && (
                    <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 99, background: '#ef444422', color: '#ef4444', fontWeight: 700 }}>
                      FLARE
                    </span>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px 12px' }}>
                  {[
                    { label: 'Pain', value: entry.jointPain, color: '#ef4444' },
                    { label: 'Stiffness', value: entry.jointStiffness, color: '#f97316' },
                    { label: 'Fatigue', value: entry.fatigue, color: '#a78bfa' },
                    { label: 'Skin', value: entry.skinSymptoms, color: '#f59e0b' },
                    { label: 'Raynaud\'s', value: entry.raynaudsSymptoms, color: '#38bdf8' },
                    { label: 'Wellbeing', value: entry.overallWellbeing, color: entry.overallWellbeing >= 7 ? '#22c55e' : '#f59e0b' },
                  ].map(m => (
                    <div key={m.label}>
                      <span style={{ fontSize: 10, color: '#64748b' }}>{m.label}: </span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: m.color }}>{m.value}</span>
                    </div>
                  ))}
                </div>
                {(entry.hypoglycemiaSymptoms || entry.hyperglycemiaSymptoms) && (
                  <div style={{ marginTop: 4, display: 'flex', gap: 6 }}>
                    {entry.hypoglycemiaSymptoms && <span style={{ fontSize: 10, color: '#ef4444' }}>⚠ Low glucose symptoms</span>}
                    {entry.hyperglycemiaSymptoms && <span style={{ fontSize: 10, color: '#f97316' }}>⚠ High glucose symptoms</span>}
                  </div>
                )}
                {entry.notes && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{entry.notes}</div>}
              </div>
              <button onClick={() => handleDelete(entry.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 4 }}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 4, fontWeight: 600 };
const inputStyle: React.CSSProperties = { width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: '8px 10px', color: '#f1f5f9', fontSize: 14, boxSizing: 'border-box' };
const primaryBtn: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 4, background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontWeight: 600, fontSize: 13 };
const secondaryBtn: React.CSSProperties = { background: '#334155', color: '#f1f5f9', border: 'none', borderRadius: 8, padding: '10px 16px', cursor: 'pointer', fontWeight: 600, fontSize: 14 };
