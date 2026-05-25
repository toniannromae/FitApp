import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { RISK, ALERT_C } from "../data/constants";
import StatCard from "./ui/StatCard";
import SectionHeader from "./ui/SectionHeader";

interface Props {
  students: any[];
}

export default function Dashboard({ students }: Props) {
  const critical = students.filter(s => s.riskLevel === "critical").length;
  const watch    = students.filter(s => s.riskLevel === "watch").length;
  const stable   = students.filter(s => s.riskLevel === "stable").length;
  const avgAtt   = Math.round(students.reduce((a, s) => a + s.attendance.rate, 0) / students.length);
  const allAlerts = students.flatMap(s =>
    s.alerts.filter((a: any) => !a.resolved).map((a: any) => ({ ...a, student: s.firstName + " " + s.lastName, risk: s.riskLevel }))
  );

  const pieData = [
    { name:"Stable",   value:stable,   color:"#5dba80" },
    { name:"Watch",    value:watch,    color:"#d4c040" },
    { name:"Critical", value:critical, color:"#e05050" },
  ];

  const attData = students[0].attendance.monthly.map((m: any, i: number) => ({
    month: m.m,
    "Danielle": Math.round(students[0].attendance.monthly[i].p / (students[0].attendance.monthly[i].p + students[0].attendance.monthly[i].a) * 100),
    "Marcus":   Math.round(students[1].attendance.monthly[i].p / (students[1].attendance.monthly[i].p + students[1].attendance.monthly[i].a) * 100),
    "Kezia":    Math.round(students[2].attendance.monthly[i].p / (students[2].attendance.monthly[i].p + students[2].attendance.monthly[i].a) * 100),
  }));

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))", gap:10 }}>
        <StatCard label="Total Students" value={students.length} sub="Active enrolment" />
        <StatCard label="Critical" value={critical} sub="Immediate action needed" color="#e05050" />
        <StatCard label="Watch" value={watch} sub="Monitor closely" color="#d4c040" />
        <StatCard label="Avg Attendance" value={`${avgAtt}%`} sub="Across all students" color={avgAtt >= 85 ? "#5dba80" : "#d4a040"} />
        <StatCard label="Open Alerts" value={allAlerts.length} sub="Unresolved" color="#d4904a" />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <div style={{ background:"#0d1a0e", border:"1px solid #1a3a20", borderRadius:12, padding:16 }}>
          <SectionHeader title="Risk Distribution" />
          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            <PieChart width={130} height={130}>
              <Pie data={pieData} cx={60} cy={60} innerRadius={35} outerRadius={60} dataKey="value" stroke="none">
                {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
            </PieChart>
            <div style={{ flex:1 }}>
              {pieData.map(p => (
                <div key={p.name} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                  <div style={{ width:10, height:10, borderRadius:"50%", background:p.color, flexShrink:0 }} />
                  <div style={{ flex:1, fontSize:12, color:"#8aaa8a" }}>{p.name}</div>
                  <div style={{ fontSize:14, color:p.color, fontWeight:"bold" }}>{p.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ background:"#0d1a0e", border:"1px solid #1a3a20", borderRadius:12, padding:16 }}>
          <SectionHeader title="Monthly Attendance %" />
          <ResponsiveContainer width="100%" height={130}>
            <LineChart data={attData} margin={{ top:4, right:4, bottom:0, left:-20 }}>
              <CartesianGrid strokeDasharray="2 2" stroke="#1a3a20" />
              <XAxis dataKey="month" tick={{ fill:"#4a7a5a", fontSize:9 }} axisLine={false} tickLine={false} />
              <YAxis domain={[40, 100]} tick={{ fill:"#4a7a5a", fontSize:9 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background:"#0d1f10", border:"1px solid #2d5e3a", fontSize:11, fontFamily:"Georgia,serif" }} />
              <Line type="monotone" dataKey="Danielle" stroke="#d4c040" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="Marcus"   stroke="#e05050" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="Kezia"    stroke="#5dba80" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ display:"flex", gap:14, marginTop:8 }}>
            {([ ["Danielle","#d4c040"],["Marcus","#e05050"],["Kezia","#5dba80"] ] as [string,string][]).map(([n,c]) => (
              <span key={n} style={{ fontSize:10, color:c }}>● {n}</span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background:"#0d1a0e", border:"1px solid #1a3a20", borderRadius:12, padding:16 }}>
        <SectionHeader title="Active System Alerts" />
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {allAlerts
            .sort((a: any, b: any) => ["critical","warning","watch","info"].indexOf(a.level) - ["critical","warning","watch","info"].indexOf(b.level))
            .slice(0, 6)
            .map((al: any, i: number) => {
              const ac = ALERT_C[al.level];
              return (
                <div key={i} style={{ background:`${ac.c}08`, border:`1px solid ${ac.b}`, borderRadius:8, padding:"10px 14px", display:"flex", gap:10, alignItems:"flex-start" }}>
                  <span style={{ color:ac.c, fontSize:14, flexShrink:0 }}>{ac.icon}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", gap:8, marginBottom:2, flexWrap:"wrap" }}>
                      <span style={{ fontSize:12, color:"#c8d8c8" }}>{al.student}</span>
                      <span style={{ fontSize:10, color:ac.c, background:ac.b + "44", borderRadius:4, padding:"1px 6px" }}>{al.level.toUpperCase()}</span>
                    </div>
                    <div style={{ fontSize:12, color:"#7a9a7a" }}>{al.msg}</div>
                  </div>
                  <div style={{ fontSize:10, color:"#3a6a4a", flexShrink:0 }}>{al.date}</div>
                </div>
              );
            })}
        </div>
      </div>

      <div style={{ background:"#0d1a0e", border:"1px solid #1a3a20", borderRadius:12, padding:16 }}>
        <SectionHeader title="Student Risk Overview" />
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {students.map(s => {
            const r = RISK[s.riskLevel];
            return (
              <div key={s.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"8px 10px", background:"#091208", borderRadius:8 }}>
                <div style={{ width:36, height:36, borderRadius:"50%", background:`${r.c}22`, border:`1px solid ${r.c}55`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:r.c, fontWeight:"bold", flexShrink:0 }}>{s.photo}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, color:"#c8d8c8" }}>{s.firstName} {s.lastName}</div>
                  <div style={{ fontSize:11, color:"#3a6a4a" }}>{s.school} · Form {s.currentForm} · {s.parish}</div>
                </div>
                <div style={{ textAlign:"right", marginRight:8 }}>
                  <div style={{ fontSize:13, color:s.attendance.rate >= 85 ? "#5dba80" : s.attendance.rate >= 70 ? "#d4a040" : "#e05050" }}>{s.attendance.rate}%</div>
                  <div style={{ fontSize:10, color:"#3a6a4a" }}>attendance</div>
                </div>
                <span style={{ color:r.c, background:r.bg, border:`1px solid ${r.border}`, borderRadius:6, padding:"2px 10px", fontSize:11, flexShrink:0 }}>{r.icon} {r.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
