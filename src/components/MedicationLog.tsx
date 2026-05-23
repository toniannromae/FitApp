import { useState } from 'react';
import { format } from 'date-fns';
import { Plus, Trash2, Check } from 'lucide-react';
import type { MedicationEntry, MedicationSchedule, MedicationType, AppData } from '../types';
import { generateId } from '../utils/storage';

interface Props {
  data: AppData;
  onChange: (data: AppData) => void;
}

const typeColors: Record<MedicationType, string> = {
  diabetes: '#38bdf8',
  uctd: '#a78bfa',
  supplement: '#22c55e',
  other: '#94a3b8',
};

const typeLabels: Record<MedicationType, string> = {
  diabetes: 'Diabetes',
  uctd: 'UCTD',
  supplement: 'Supplement',
  other: 'Other',
};

const commonMeds = [
  { name: 'Metformin', dose: '500mg', type: 'diabetes' as MedicationType },
  { name: 'Insulin (rapid)', dose: '10 units', type: 'diabetes' as MedicationType },
  { name: 'Insulin (long-acting)', dose: '20 units', type: 'diabetes' as MedicationType },
  { name: 'Hydroxychloroquine (Plaquenil)', dose: '200mg', type: 'uctd' as MedicationType },
  { name: 'Prednisone', dose: '5mg', type: 'uctd' as MedicationType },
  { name: 'Naproxen', dose: '500mg', type: 'uctd' as MedicationType },
  { name: 'Vitamin D3', dose: '2000 IU', type: 'supplement' as MedicationType },
  { name: 'Omega-3 Fish Oil', dose: '1000mg', type: 'supplement' as MedicationType },
  { name: 'Folic Acid', dose: '400mcg', type: 'supplement' as MedicationType },
  { name: 'Magnesium', dose: '400mg', type: 'supplement' as MedicationType },
];

type ActiveTab = 'log' | 'schedule';

export default function MedicationLog({ data, onChange }: Props) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('schedule');
  const [showLogForm, setShowLogForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);

  const [logForm, setLogForm] = useState({
    name: '',
    dose: '',
    type: 'diabetes' as MedicationType,
    taken: true,
    notes: '',
    timestamp: new Date().toISOString().slice(0, 16),
  });

  const [schedForm, setSchedForm] = useState({
    name: '',
    dose: '',
    type: 'diabetes' as MedicationType,
    timesPerDay: '1',
    scheduledTimes: ['08:00'],
    notes: '',
  });

  function handleAddLog() {
    if (!logForm.name.trim()) return;
    const entry: MedicationEntry = {
      id: generateId(),
      timestamp: new Date(logForm.timestamp).toISOString(),
      name: logForm.name.trim(),
      dose: logForm.dose.trim(),
      type: logForm.type,
      taken: logForm.taken,
      notes: logForm.notes || undefined,
    };
    onChange({ ...data, medicationLogs: [entry, ...data.medicationLogs] });
    setLogForm({ name: '', dose: '', type: 'diabetes', taken: true, notes: '', timestamp: new Date().toISOString().slice(0, 16) });
    setShowLogForm(false);
  }

  function handleAddSchedule() {
    if (!schedForm.name.trim()) return;
    const sched: MedicationSchedule = {
      id: generateId(),
      name: schedForm.name.trim(),
      dose: schedForm.dose.trim(),
      type: schedForm.type,
      timesPerDay: parseInt(schedForm.timesPerDay),
      scheduledTimes: schedForm.scheduledTimes.slice(0, parseInt(schedForm.timesPerDay)),
      notes: schedForm.notes || undefined,
    };
    onChange({ ...data, medicationSchedules: [sched, ...data.medicationSchedules] });
    setSchedForm({ name: '', dose: '', type: 'diabetes', timesPerDay: '1', scheduledTimes: ['08:00'], notes: '' });
    setShowScheduleForm(false);
  }

  function handleDeleteLog(id: string) {
    onChange({ ...data, medicationLogs: data.medicationLogs.filter(e => e.id !== id) });
  }

  function handleDeleteSchedule(id: string) {
    onChange({ ...data, medicationSchedules: data.medicationSchedules.filter(e => e.id !== id) });
  }

  function logFromSchedule(sched: MedicationSchedule) {
    const entry: MedicationEntry = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      name: sched.name,
      dose: sched.dose,
      type: sched.type,
      taken: true,
    };
    onChange({ ...data, medicationLogs: [entry, ...data.medicationLogs] });
  }

  const todayLogs = data.medicationLogs.filter(l =>
    l.timestamp.startsWith(new Date().toISOString().slice(0, 10))
  );

  function updateScheduledTime(idx: number, value: string) {
    const updated = [...schedForm.scheduledTimes];
    updated[idx] = value;
    setSchedForm({ ...schedForm, scheduledTimes: updated });
  }

  const timesCount = parseInt(schedForm.timesPerDay) || 1;

  return (
    <div style={{ padding: '16px 16px 0' }}>
      <h2 style={{ margin: '0 0 12px', fontSize: 20, fontWeight: 700, color: '#f1f5f9' }}>Medications</h2>

      {/* Tab switcher */}
      <div style={{ display: 'flex', background: '#0f172a', borderRadius: 10, padding: 3, marginBottom: 16 }}>
        {(['schedule', 'log'] as ActiveTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1, padding: '8px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: activeTab === tab ? '#334155' : 'transparent',
              color: activeTab === tab ? '#f1f5f9' : '#64748b',
              fontSize: 13, fontWeight: activeTab === tab ? 600 : 400,
            }}
          >
            {tab === 'schedule' ? 'My Medications' : 'Today\'s Log'}
          </button>
        ))}
      </div>

      {activeTab === 'schedule' && (
        <>
          <button onClick={() => setShowScheduleForm(!showScheduleForm)} style={{ ...primaryBtn, marginBottom: 12 }}>
            <Plus size={16} /> Add Medication
          </button>

          {showScheduleForm && (
            <div style={{ background: '#1e293b', borderRadius: 12, padding: 16, marginBottom: 16, border: '1px solid #334155' }}>
              <div style={{ marginBottom: 10 }}>
                <label style={labelStyle}>Quick Select</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {commonMeds.map(m => (
                    <button key={m.name} onClick={() => setSchedForm(f => ({ ...f, name: m.name, dose: m.dose, type: m.type }))}
                      style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 6, padding: '4px 8px', fontSize: 11, color: '#94a3b8', cursor: 'pointer' }}>
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={labelStyle}>Medication Name</label>
                  <input type="text" value={schedForm.name} onChange={e => setSchedForm({ ...schedForm, name: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Dose</label>
                  <input type="text" value={schedForm.dose} onChange={e => setSchedForm({ ...schedForm, dose: e.target.value })} placeholder="e.g. 500mg" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Type</label>
                  <select value={schedForm.type} onChange={e => setSchedForm({ ...schedForm, type: e.target.value as MedicationType })} style={inputStyle}>
                    {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Times Per Day</label>
                  <select value={schedForm.timesPerDay} onChange={e => {
                    const n = parseInt(e.target.value);
                    const times = Array.from({ length: n }, (_, i) => schedForm.scheduledTimes[i] ?? `0${8 + i * 6}:00`.slice(-5));
                    setSchedForm({ ...schedForm, timesPerDay: e.target.value, scheduledTimes: times });
                  }} style={inputStyle}>
                    {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}x daily</option>)}
                  </select>
                </div>
                {Array.from({ length: timesCount }, (_, i) => (
                  <div key={i}>
                    <label style={labelStyle}>Time {i + 1}</label>
                    <input type="time" value={schedForm.scheduledTimes[i] ?? '08:00'} onChange={e => updateScheduledTime(i, e.target.value)} style={inputStyle} />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={handleAddSchedule} style={{ ...primaryBtn, flex: 1, justifyContent: 'center' }}>Add</button>
                <button onClick={() => setShowScheduleForm(false)} style={secondaryBtn}>Cancel</button>
              </div>
            </div>
          )}

          {data.medicationSchedules.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#64748b', padding: 32 }}>
              No medications added yet. Add your first medication above.
            </div>
          ) : (
            data.medicationSchedules.map(sched => (
              <div key={sched.id} style={{ background: '#1e293b', borderRadius: 12, padding: '12px 14px', marginBottom: 8, border: '1px solid #334155' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>{sched.name}</span>
                      <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 99, background: `${typeColors[sched.type]}22`, color: typeColors[sched.type] }}>
                        {typeLabels[sched.type]}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>{sched.dose} • {sched.timesPerDay}x daily</div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{sched.scheduledTimes.join(', ')}</div>
                    {sched.notes && <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{sched.notes}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    <button
                      onClick={() => logFromSchedule(sched)}
                      title="Mark as taken"
                      style={{ background: '#22c55e22', border: '1px solid #22c55e44', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: '#22c55e', fontSize: 11, fontWeight: 600 }}
                    >
                      <Check size={13} />
                    </button>
                    <button onClick={() => handleDeleteSchedule(sched.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 4 }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </>
      )}

      {activeTab === 'log' && (
        <>
          <button onClick={() => setShowLogForm(!showLogForm)} style={{ ...primaryBtn, marginBottom: 12 }}>
            <Plus size={16} /> Log Dose
          </button>

          {showLogForm && (
            <div style={{ background: '#1e293b', borderRadius: 12, padding: 16, marginBottom: 16, border: '1px solid #334155' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={labelStyle}>Medication Name</label>
                  <input type="text" value={logForm.name} onChange={e => setLogForm({ ...logForm, name: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Dose</label>
                  <input type="text" value={logForm.dose} onChange={e => setLogForm({ ...logForm, dose: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Type</label>
                  <select value={logForm.type} onChange={e => setLogForm({ ...logForm, type: e.target.value as MedicationType })} style={inputStyle}>
                    {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={labelStyle}>Date & Time</label>
                  <input type="datetime-local" value={logForm.timestamp} onChange={e => setLogForm({ ...logForm, timestamp: e.target.value })} style={inputStyle} />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <button
                    onClick={() => setLogForm({ ...logForm, taken: !logForm.taken })}
                    style={{ width: '100%', padding: 10, borderRadius: 8, border: `1px solid ${logForm.taken ? '#22c55e' : '#ef4444'}`, background: logForm.taken ? '#22c55e22' : '#ef444422', cursor: 'pointer', color: logForm.taken ? '#22c55e' : '#ef4444', fontWeight: 600, fontSize: 13 }}>
                    {logForm.taken ? '✓ Taken' : '✗ Missed'}
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={handleAddLog} style={{ ...primaryBtn, flex: 1, justifyContent: 'center' }}>Save Log</button>
                <button onClick={() => setShowLogForm(false)} style={secondaryBtn}>Cancel</button>
              </div>
            </div>
          )}

          <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginBottom: 8 }}>
            Today ({todayLogs.length} logged)
          </div>

          {data.medicationLogs.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#64748b', padding: 32 }}>No medication logs yet.</div>
          ) : (
            [...data.medicationLogs]
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .map(log => (
                <div key={log.id} style={{ background: '#1e293b', borderRadius: 12, padding: '10px 14px', marginBottom: 8, border: '1px solid #334155', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                    background: log.taken ? '#22c55e22' : '#ef444422',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14,
                  }}>
                    {log.taken ? '✓' : '✗'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{log.name}</span>
                      <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 99, background: `${typeColors[log.type]}22`, color: typeColors[log.type] }}>
                        {typeLabels[log.type]}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>
                      {log.dose && `${log.dose} • `}{format(new Date(log.timestamp), 'MMM d, h:mm a')}
                    </div>
                  </div>
                  <button onClick={() => handleDeleteLog(log.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 4 }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
          )}
        </>
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 4, fontWeight: 600 };
const inputStyle: React.CSSProperties = { width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: '8px 10px', color: '#f1f5f9', fontSize: 14, boxSizing: 'border-box' };
const primaryBtn: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 4, background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontWeight: 600, fontSize: 13 };
const secondaryBtn: React.CSSProperties = { background: '#334155', color: '#f1f5f9', border: 'none', borderRadius: 8, padding: '10px 16px', cursor: 'pointer', fontWeight: 600, fontSize: 14 };
