import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { RISK, ALERT_C, SUBJ_C, gradeColor } from "../data/constants";
import StatCard from "./ui/StatCard";
import SectionHeader from "./ui/SectionHeader";
import BarProgress from "./ui/BarProgress";

interface Props {
  student: any;
  onBack: () => void;
}

export default function StudentDetail({ student: s, onBack }: Props) {
  const [tab, setTab] = useState("profile");
  const r = RISK[s.riskLevel];
  const openAlerts = s.alerts.filter((a: any) => !a.resolved);

  const tabs = [
    { id:"profile",       label:"Profile" },
    { id:"attendance",    label:"Attendance" },
    { id:"academic",      label:"Academic" },
    { id:"learning",      label:"Learning Profile" },
    { id:"behaviour",     label:"Behaviour" },
    { id:"interventions", label:"Interventions" },
    { id:"alerts",        label:"Alerts", badge: openAlerts.length },
    { id:"timetable",     label:"Timetable" },
    { id:"documents",     label:"Documents" },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14, flexWrap:"wrap" }}>
        <button onClick={onBack} style={{ background:"transparent", border:"1px solid #1a3a20", borderRadius:6, color:"#3a6a4a", padding:"5px 12px", cursor:"pointer", fontSize:12, fontFamily:"Georgia,serif" }}>← Back</button>
        <div style={{ flex:1, background:`linear-gradient(135deg,${r.bg},#091208)`, border:`1px solid ${r.c}44`, borderRadius:12, padding:"14px 18px", display:"flex", gap:14, alignItems:"center", flexWrap:"wrap" }}>
          <div style={{ width:48, height:48, borderRadius:"50%", background:`${r.c}22`, border:`2px solid ${r.c}66`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, color:r.c, fontWeight:"bold", flexShrink:0 }}>{s.photo}</div>
          <div style={{ flex:1 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
              <span style={{ fontSize:18, color:"#d8e8d8" }}>{s.firstName} {s.lastName}</span>
              <span style={{ fontSize:11, color:r.c, background:r.bg, border:`1px solid ${r.c}55`, borderRadius:6, padding:"2px 8px" }}>{r.icon} {r.label}</span>
              {s.iep && <span style={{ fontSize:10, color:"#d4a040", background:"#201810", border:"1px solid #5a4010", borderRadius:4, padding:"2px 6px" }}>IEP Active</span>}
            </div>
            <div style={{ display:"flex", gap:16, marginTop:5, flexWrap:"wrap" }}>
              {([["ID",s.studentId],["Form",`${s.currentForm}/5`],["School",s.school],["Parish",s.parish],["Attendance",`${s.attendance.rate}%`]] as [string,string][]).map(([k,v]) => (
                <span key={k} style={{ fontSize:11 }}><span style={{ color:"#3a6a4a" }}>{k}: </span><span style={{ color:"#8aaa8a" }}>{v}</span></span>
              ))}
            </div>
          </div>
          <div style={{ display:"flex", gap:4, flexShrink:0 }}>
            {[1,2,3,4,5].map(f => (
              <div key={f} style={{ width:24, height:24, borderRadius:5, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, background:f < s.currentForm ? "#1a4a2a" : f === s.currentForm ? r.bg : "#0a150b", border:`1px solid ${f < s.currentForm ? "#2d7a4f" : f === s.currentForm ? r.c : "#1a2a1a"}`, color:f < s.currentForm ? "#5dba80" : f === s.currentForm ? r.c : "#2a4a2a" }}>{f}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:2, borderBottom:"1px solid #1a3a20", marginBottom:16, overflowX:"auto", paddingBottom:0 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding:"7px 14px", background:tab === t.id ? "#0d2010" : "transparent", border:"none", borderBottom:tab === t.id ? "2px solid #2d7a4f" : "2px solid transparent", color:tab === t.id ? "#5dba80" : "#3a6a4a", fontSize:12, cursor:"pointer", fontFamily:"Georgia,serif", marginBottom:-1, whiteSpace:"nowrap", position:"relative", flexShrink:0 }}>
            {t.label}
            {(t as any).badge > 0 && <span style={{ marginLeft:4, background:"#e05050", color:"#fff", borderRadius:"50%", fontSize:9, padding:"0 4px" }}>{(t as any).badge}</span>}
          </button>
        ))}
      </div>

      {/* PROFILE */}
      {tab === "profile" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          <div style={{ background:"#0d1a0e", border:"1px solid #1a3a20", borderRadius:12, padding:16 }}>
            <SectionHeader title="Personal Information" />
            {([["Full Name",`${s.firstName} ${s.lastName}`],["Date of Birth",s.dob],["Gender",s.gender],["Nationality",s.nationality],["Religion",s.religion],["Community",s.community],["Address",s.address],["Parish",s.parish]] as [string,string][]).map(([k,v]) => (
              <div key={k} style={{ display:"flex", gap:8, paddingBottom:8, borderBottom:"1px solid #0f200f", marginBottom:8 }}>
                <span style={{ width:120, fontSize:11, color:"#3a6a4a", flexShrink:0 }}>{k}</span>
                <span style={{ fontSize:12, color:"#9abaa4" }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div style={{ background:"#0d1a0e", border:"1px solid #1a3a20", borderRadius:12, padding:16 }}>
              <SectionHeader title="Primary Guardian" />
              {([["Name",s.guardian.name],["Relation",s.guardian.relation],["Phone",s.guardian.phone],["Email",s.guardian.email || "—"],["Occupation",s.guardian.occupation],["Address",s.guardian.address]] as [string,string][]).map(([k,v]) => (
                <div key={k} style={{ display:"flex", gap:8, paddingBottom:7, borderBottom:"1px solid #0f200f", marginBottom:7 }}>
                  <span style={{ width:80, fontSize:11, color:"#3a6a4a", flexShrink:0 }}>{k}</span>
                  <span style={{ fontSize:12, color:"#9abaa4" }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ background:"#0d1a0e", border:"1px solid #1a3a20", borderRadius:12, padding:16 }}>
              <SectionHeader title="Health Summary" />
              {([["Blood Type",s.health.bloodType],["Allergies",s.health.allergies.join(", ") || "None"],["Conditions",s.health.conditions.join(", ") || "None"],["Medications",s.health.medications.join(", ") || "None"],["Vision",s.health.vision],["Hearing",s.health.hearing],["Last Medical",s.health.lastMedical]] as [string,string][]).map(([k,v]) => (
                <div key={k} style={{ display:"flex", gap:8, paddingBottom:7, borderBottom:"1px solid #0f200f", marginBottom:7 }}>
                  <span style={{ width:100, fontSize:11, color:"#3a6a4a", flexShrink:0 }}>{k}</span>
                  <span style={{ fontSize:12, color:"#9abaa4" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ATTENDANCE */}
      {tab === "attendance" && (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(110px,1fr))", gap:10 }}>
            <StatCard label="Present" value={s.attendance.present} color="#5dba80" />
            <StatCard label="Absent" value={s.attendance.absent} color="#e05050" />
            <StatCard label="Late" value={s.attendance.late} color="#d4c040" />
            <StatCard label="Rate" value={`${s.attendance.rate}%`} color={s.attendance.rate >= 85 ? "#5dba80" : s.attendance.rate >= 70 ? "#d4a040" : "#e05050"} />
          </div>
          <div style={{ background:"#0d1a0e", border:"1px solid #1a3a20", borderRadius:12, padding:16 }}>
            <SectionHeader title="Monthly Attendance" />
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={s.attendance.monthly} margin={{ top:4, right:4, bottom:0, left:-10 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#1a3a20" />
                <XAxis dataKey="m" tick={{ fill:"#4a7a5a", fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:"#4a7a5a", fontSize:11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background:"#0d1f10", border:"1px solid #2d5e3a", fontSize:11, fontFamily:"Georgia,serif" }} />
                <Bar dataKey="p" name="Present" fill="#2d7a4f" radius={[3,3,0,0]} />
                <Bar dataKey="a" name="Absent" fill="#6a1010" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ background:"#0d1a0e", border:"1px solid #1a3a20", borderRadius:12, padding:16 }}>
            <SectionHeader title="Recent Attendance (March 2025)" />
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {Object.entries(s.attendance.calendar).map(([date, status]) => (
                <div key={date} style={{ textAlign:"center", minWidth:44 }}>
                  <div style={{ fontSize:10, color:"#3a6a4a", marginBottom:3 }}>{new Date(date).toLocaleDateString("en-JM", { weekday:"short" })}</div>
                  <div style={{ width:40, height:40, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", background:status === "P" ? "#1a4a2a" : status === "A" ? "#4a1010" : "#2a2a10", border:`1px solid ${status === "P" ? "#2d7a4f" : status === "A" ? "#7a1010" : "#5a5010"}`, color:status === "P" ? "#5dba80" : status === "A" ? "#e05050" : "#d4c040", fontSize:12, fontWeight:"bold" }}>{status as string}</div>
                  <div style={{ fontSize:9, color:"#2a5a3a", marginTop:2 }}>{(date as string).slice(8)}</div>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:16, marginTop:14, fontSize:11 }}>
              {([["P","Present","#5dba80"],["A","Absent","#e05050"],["L","Late","#d4c040"]] as [string,string,string][]).map(([k,v,c]) => (
                <span key={k}><span style={{ color:c, fontWeight:"bold" }}>{k}</span> <span style={{ color:"#3a6a4a" }}>= {v}</span></span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ACADEMIC */}
      {tab === "academic" && (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ background:"#0d1a0e", border:"1px solid #1a3a20", borderRadius:12, padding:16, overflowX:"auto" }}>
            <SectionHeader title="Subject Grades by Term" />
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
              <thead>
                <tr>
                  <th style={{ padding:"7px 10px", textAlign:"left", color:"#3a6a4a", fontWeight:"normal", fontSize:10, textTransform:"uppercase", borderBottom:"1px solid #1a3a20" }}>Subject</th>
                  {(Object.values(s.grades)[0] as any[]).map((g: any) => (
                    <th key={g.t} style={{ padding:"7px 10px", color:"#3a6a4a", fontWeight:"normal", fontSize:10, textTransform:"uppercase", borderBottom:"1px solid #1a3a20", whiteSpace:"nowrap" }}>{g.t}</th>
                  ))}
                  <th style={{ padding:"7px 10px", color:"#3a6a4a", fontWeight:"normal", fontSize:10, textTransform:"uppercase", borderBottom:"1px solid #1a3a20" }}>Avg</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(s.grades).map(([subj, terms]: [string, any]) => {
                  const avg = Math.round(terms.reduce((a: number, t: any) => a + t.s, 0) / terms.length);
                  return (
                    <tr key={subj} style={{ borderBottom:"1px solid #0f1f0f" }}>
                      <td style={{ padding:"8px 10px", color:SUBJ_C[subj] || "#5dba80" }}>{subj}</td>
                      {terms.map((g: any, i: number) => (
                        <td key={i} style={{ padding:"8px 10px", textAlign:"center", color:gradeColor(g.s), fontWeight:g.s < 50 ? "bold" : "normal" }}>{g.s}%</td>
                      ))}
                      <td style={{ padding:"8px 10px", textAlign:"center", color:gradeColor(avg), fontWeight:"bold" }}>{avg}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ background:"#0d1a0e", border:"1px solid #1a3a20", borderRadius:12, padding:16 }}>
            <SectionHeader title="Performance Trend" />
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={(Object.values(s.grades)[0] as any[]).map((_: any, i: number) => {
                const pt: any = { term: (Object.values(s.grades)[0] as any[])[i].t };
                Object.entries(s.grades).forEach(([subj, terms]: [string, any]) => { if (terms[i]) pt[subj] = terms[i].s; });
                return pt;
              })}>
                <CartesianGrid strokeDasharray="2 2" stroke="#1a3a20" />
                <XAxis dataKey="term" tick={{ fill:"#4a7a5a", fontSize:10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill:"#4a7a5a", fontSize:10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                <Tooltip contentStyle={{ background:"#0d1f10", border:"1px solid #2d5e3a", fontSize:11, fontFamily:"Georgia,serif" }} />
                {Object.keys(s.grades).map(subj => (
                  <Line key={subj} type="monotone" dataKey={subj} stroke={SUBJ_C[subj] || "#5dba80"} strokeWidth={1.5} dot={{ r:3 }} activeDot={{ r:5 }} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background:"#0d1a0e", border:"1px solid #1a3a20", borderRadius:12, padding:16 }}>
            <SectionHeader title="CSEC Pass Probability (Projected)" />
            <div style={{ fontSize:11, color:"#3a6a4a", marginBottom:12, fontStyle:"italic" }}>Based on current trajectory. Not a guarantee of results.</div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {Object.entries(s.csecPrediction).map(([subj, pct]: [string, any]) => (
                <div key={subj}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                    <span style={{ fontSize:12, color:SUBJ_C[subj] || "#5dba80" }}>{subj}</span>
                    <span style={{ fontSize:12, color:pct >= 70 ? "#5dba80" : pct >= 50 ? "#d4a040" : "#e05050", fontWeight:"bold" }}>{pct}%</span>
                  </div>
                  <BarProgress val={pct} color={pct >= 70 ? "#2d7a4f" : pct >= 50 ? "#7a5020" : "#7a1010"} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* LEARNING PROFILE */}
      {tab === "learning" && (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ background:"#0d1a0e", border:"1px solid #1a3a20", borderRadius:12, padding:16 }}>
            <SectionHeader title="Identified Learning Challenges" />
            {s.challenges.length === 0
              ? <div style={{ color:"#3a6a4a", fontSize:13 }}>No learning challenges identified.</div>
              : s.challenges.map((c: string) => (
                <div key={c} style={{ background:"#091208", border:"1px solid #2a3a20", borderRadius:8, padding:"12px 14px", marginBottom:8 }}>
                  <div style={{ fontSize:14, color:"#d4a040", marginBottom:6 }}>⚙ {c}</div>
                  <div style={{ fontSize:12, color:"#7a9a7a", lineHeight:1.7 }}>
                    {c === "Dyslexia" && "Affects reading, writing and spelling. Student requires phonics support, extended time, and dyslexia-adapted materials."}
                    {c === "Anxiety" && "Academic and social anxiety impacting performance under test conditions. Counselling support and low-pressure assessment approaches recommended."}
                    {c === "ADHD" && "Attention deficit impacts task completion, organisation and impulse control. Structured environment, task chunking, and movement breaks are essential."}
                    {c === "Dyscalculia" && "Significant difficulty with number concepts and arithmetic operations. Requires manipulatives, visual number lines and structured numeracy support."}
                    {c.includes("Hearing") && "Mild hearing impairment in left ear. Preferential seating required. Teacher should face student when speaking. FM system recommended if available."}
                  </div>
                </div>
              ))
            }
          </div>
          <div style={{ background:"#0d1a0e", border:"1px solid #1a3a20", borderRadius:12, padding:16 }}>
            <SectionHeader title={`Individual Education Plan (IEP) — ${s.iep ? "Active" : "Not Required"}`} />
            {s.iep
              ? <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {([["Extended Time","Student receives 25% additional time on all written assessments"],["Accommodation — Reading","Materials provided in dyslexia-friendly format (Arial font, 1.5 spacing)"],["Assessment Modifications","Oral alternatives available for written tasks"],["Seating Arrangement","Front-centre seating in all classrooms"],["Resource Support","Weekly sessions with Special Education Unit"],["Review Date","June 2025"]] as [string,string][]).map(([k,v]) => (
                    <div key={k} style={{ display:"flex", gap:10, background:"#091208", borderRadius:8, padding:"10px 12px" }}>
                      <span style={{ width:160, fontSize:11, color:"#2d7a4f", flexShrink:0 }}>▸ {k}</span>
                      <span style={{ fontSize:12, color:"#8aaa8a" }}>{v}</span>
                    </div>
                  ))}
                </div>
              : <div style={{ color:"#3a6a4a", fontSize:13 }}>No IEP required at this time. Student accommodated through standard classroom adjustments.</div>
            }
          </div>
        </div>
      )}

      {/* BEHAVIOUR */}
      {tab === "behaviour" && (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <SectionHeader title="Behaviour & Discipline Log" action={{ label:"+ Log Incident", fn:() => {} }} />
          {s.behaviour.map((b: any, i: number) => {
            const col = b.severity === "positive" ? "#5dba80" : b.severity === "minor" ? "#d4c040" : "#e05050";
            return (
              <div key={i} style={{ background:`${col}08`, border:`1px solid ${col}33`, borderRadius:10, padding:"14px 16px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:6 }}>
                  <div>
                    <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:4 }}>
                      <span style={{ fontSize:13, color:"#c8d8c8" }}>{b.type}</span>
                      <span style={{ fontSize:10, color:col, background:`${col}22`, border:`1px solid ${col}44`, borderRadius:4, padding:"1px 6px" }}>{b.severity.toUpperCase()}</span>
                    </div>
                    <div style={{ fontSize:12, color:"#7a9a7a" }}>{b.detail}</div>
                    <div style={{ fontSize:11, color:"#3a6a4a", marginTop:4 }}>Reported by: {b.teacher}</div>
                  </div>
                  <div style={{ fontSize:11, color:"#3a6a4a" }}>{b.date}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* INTERVENTIONS */}
      {tab === "interventions" && (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <SectionHeader title="Support Interventions" action={{ label:"+ New Intervention", fn:() => {} }} />
          {s.interventions.map((iv: any) => (
            <div key={iv.id} style={{ background:"#0d1a0e", border:"1px solid #1a3a20", borderRadius:12, padding:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
                <div>
                  <div style={{ fontSize:14, color:"#c8d8c8", marginBottom:4 }}>{iv.type}</div>
                  <div style={{ fontSize:11, color:"#3a6a4a" }}>Provider: {iv.provider} · {iv.frequency}</div>
                  <div style={{ fontSize:11, color:"#3a6a4a" }}>Started: {iv.start}{iv.end ? ` · Ended: ${iv.end}` : ""}</div>
                </div>
                <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                  <span style={{ fontSize:11, padding:"2px 8px", borderRadius:20, background:iv.status === "Active" ? "#1a3a20" : "#1a1a2a", color:iv.status === "Active" ? "#5dba80" : "#8888aa", border:`1px solid ${iv.status === "Active" ? "#2d5e3a" : "#3a3a5a"}` }}>{iv.status}</span>
                  <span style={{ fontSize:11, padding:"2px 8px", borderRadius:20, background:"#1a2e1a", color:["Positive","Improving"].includes(iv.outcome) ? "#5dba80" : iv.outcome === "Moderate" ? "#4ab8b0" : "#d4a040", border:"1px solid #2a3a2a" }}>{iv.outcome}</span>
                </div>
              </div>
              {iv.notes && <div style={{ marginTop:10, fontSize:12, color:"#5a8a6a", fontStyle:"italic", background:"#091208", borderRadius:6, padding:"8px 10px" }}>"{iv.notes}"</div>}
            </div>
          ))}
        </div>
      )}

      {/* ALERTS */}
      {tab === "alerts" && (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <SectionHeader title="Alert History" />
          {s.alerts.map((al: any) => {
            const ac = ALERT_C[al.level];
            return (
              <div key={al.id} style={{ background:`${ac.c}08`, border:`1px solid ${al.resolved ? "#1a3a20" : ac.b}`, borderRadius:10, padding:"14px 16px", opacity:al.resolved ? 0.6 : 1 }}>
                <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                  <span style={{ color:al.resolved ? "#3a6a4a" : ac.c, fontSize:16, flexShrink:0 }}>{al.resolved ? "✓" : ac.icon}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, color:al.resolved ? "#5a8a5a" : "#c8d8c8", marginBottom:4 }}>{al.msg}</div>
                    {al.action && !al.resolved && <div style={{ fontSize:11, color:"#2d7a4f", background:"#0d2010", borderRadius:6, padding:"4px 8px", display:"inline-block", marginBottom:4 }}>→ {al.action}</div>}
                    <div style={{ display:"flex", gap:10, marginTop:4 }}>
                      <span style={{ fontSize:11, color:"#3a6a4a" }}>{al.date}</span>
                      <span style={{ fontSize:10, color:al.resolved ? "#5dba80" : ac.c, background:al.resolved ? "#1a3a20" : ac.b + "44", borderRadius:4, padding:"0 6px" }}>{al.resolved ? "Resolved" : "Active"}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TIMETABLE */}
      {tab === "timetable" && (
        <div style={{ background:"#0d1a0e", border:"1px solid #1a3a20", borderRadius:12, padding:16, overflowX:"auto" }}>
          <SectionHeader title="Weekly Timetable" />
          <table style={{ width:"100%", borderCollapse:"collapse", minWidth:400 }}>
            <thead>
              <tr>
                <th style={{ padding:"8px 10px", textAlign:"left", color:"#3a6a4a", fontWeight:"normal", fontSize:10, textTransform:"uppercase", letterSpacing:1, borderBottom:"1px solid #1a3a20" }}>Period</th>
                {Object.keys(s.timetable).map((d: string) => (
                  <th key={d} style={{ padding:"8px 10px", color:"#3a6a4a", fontWeight:"normal", fontSize:10, textTransform:"uppercase", letterSpacing:1, borderBottom:"1px solid #1a3a20" }}>{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[0,1,2,3,4,5].map(i => (
                <tr key={i} style={{ borderBottom:"1px solid #0f1f0f" }}>
                  <td style={{ padding:"8px 10px", color:"#3a6a4a", fontSize:11 }}>{i === 3 ? "🍽 Lunch" : `Period ${i + 1}`}</td>
                  {Object.values(s.timetable).map((periods: any, j: number) => (
                    <td key={j} style={{ padding:"8px 10px", fontSize:11, color:i === 3 ? "#3a6a4a" : SUBJ_C[periods[i]] || "#8aaa8a", background:i === 3 ? "#091208" : "transparent", textAlign:"center" }}>{periods[i]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* DOCUMENTS */}
      {tab === "documents" && (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <SectionHeader title="Student Documents" action={{ label:"+ Upload", fn:() => {} }} />
          {s.documents.map((doc: any, i: number) => (
            <div key={i} style={{ background:"#0d1a0e", border:"1px solid #1a3a20", borderRadius:10, padding:"12px 16px", display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ width:36, height:36, background:"#1a2e1a", border:"1px solid #2d5e3a", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>📄</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, color:"#c8d8c8" }}>{doc.name}</div>
                <div style={{ fontSize:11, color:"#3a6a4a" }}>Type: {doc.type} · Uploaded: {doc.uploaded}</div>
              </div>
              <button style={{ background:"transparent", border:"1px solid #1a3a20", borderRadius:6, color:"#3a6a4a", padding:"4px 10px", cursor:"pointer", fontSize:11, fontFamily:"Georgia,serif" }}>View</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
