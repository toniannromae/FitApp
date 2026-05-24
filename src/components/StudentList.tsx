import { useState, useMemo } from "react";
import { RISK } from "../data/constants";

interface Props {
  students: any[];
  onSelect: (s: any) => void;
}

export default function StudentList({ students, onSelect }: Props) {
  const [search, setSearch]       = useState("");
  const [filterRisk, setFilterRisk] = useState("all");
  const [filterForm, setFilterForm] = useState("all");

  const filtered = useMemo(() => students.filter(s => {
    const name = (s.firstName + " " + s.lastName).toLowerCase();
    const q = search.toLowerCase();
    if (search && !name.includes(q) && !s.parish.toLowerCase().includes(q) && !s.school.toLowerCase().includes(q)) return false;
    if (filterRisk !== "all" && s.riskLevel !== filterRisk) return false;
    if (filterForm !== "all" && s.currentForm !== +filterForm) return false;
    return true;
  }), [students, search, filterRisk, filterForm]);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
        <div style={{ position:"relative", flex:1, minWidth:200 }}>
          <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#3a6a4a", fontSize:13 }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, parish, school..."
            style={{ width:"100%", background:"#0d1a0e", border:"1px solid #1a3a20", borderRadius:8, padding:"9px 12px 9px 32px", color:"#c8d8c8", fontSize:13, outline:"none", fontFamily:"Georgia,serif", boxSizing:"border-box" }}
          />
        </div>
        <select value={filterRisk} onChange={e => setFilterRisk(e.target.value)} style={{ background:"#0d1a0e", border:"1px solid #1a3a20", borderRadius:8, padding:"8px 12px", color:"#8aaa8a", fontSize:12, fontFamily:"Georgia,serif", outline:"none" }}>
          <option value="all">All Risk Levels</option>
          <option value="stable">Stable</option>
          <option value="watch">Watch</option>
          <option value="warning">At Risk</option>
          <option value="critical">Critical</option>
        </select>
        <select value={filterForm} onChange={e => setFilterForm(e.target.value)} style={{ background:"#0d1a0e", border:"1px solid #1a3a20", borderRadius:8, padding:"8px 12px", color:"#8aaa8a", fontSize:12, fontFamily:"Georgia,serif", outline:"none" }}>
          <option value="all">All Forms</option>
          {[1,2,3,4,5].map(f => <option key={f} value={f}>Form {f}</option>)}
        </select>
      </div>

      <div style={{ background:"#0d1a0e", border:"1px solid #1a3a20", borderRadius:12, overflow:"hidden" }}>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead>
              <tr style={{ background:"#091208" }}>
                {["Student","ID","Form","School","Parish","Attendance","Risk","Alerts"].map(h => (
                  <th key={h} style={{ padding:"10px 14px", textAlign:"left", color:"#3a6a4a", fontWeight:"normal", fontSize:10, textTransform:"uppercase", letterSpacing:1, borderBottom:"1px solid #1a3a20", whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => {
                const r = RISK[s.riskLevel];
                const open = s.alerts.filter((a: any) => !a.resolved).length;
                return (
                  <tr
                    key={s.id}
                    onClick={() => onSelect(s)}
                    style={{ cursor:"pointer", borderBottom:"1px solid #0f1f0f", transition:"background .1s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#0f2010")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding:"12px 14px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <div style={{ width:32, height:32, borderRadius:"50%", background:`${r.c}22`, border:`1px solid ${r.c}55`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:r.c, fontWeight:"bold", flexShrink:0 }}>{s.photo}</div>
                        <div>
                          <div style={{ color:"#c8d8c8" }}>{s.firstName} {s.lastName}</div>
                          <div style={{ fontSize:10, color:"#3a6a4a" }}>{s.gender} · DOB {s.dob}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding:"12px 14px", color:"#5a8a6a", fontSize:11 }}>{s.studentId}</td>
                    <td style={{ padding:"12px 14px", color:"#8aaa8a" }}>{s.currentForm}</td>
                    <td style={{ padding:"12px 14px", color:"#8aaa8a", maxWidth:160, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{s.school}</td>
                    <td style={{ padding:"12px 14px", color:"#8aaa8a" }}>{s.parish}</td>
                    <td style={{ padding:"12px 14px" }}>
                      <span style={{ color: s.attendance.rate >= 85 ? "#5dba80" : s.attendance.rate >= 70 ? "#d4a040" : "#e05050" }}>{s.attendance.rate}%</span>
                    </td>
                    <td style={{ padding:"12px 14px" }}>
                      <span style={{ color:r.c, background:r.bg, border:`1px solid ${r.border}`, borderRadius:6, padding:"2px 8px", fontSize:11, whiteSpace:"nowrap" }}>{r.icon} {r.label}</span>
                    </td>
                    <td style={{ padding:"12px 14px" }}>
                      {open > 0 && <span style={{ background:"#e05050", color:"#fff", borderRadius:"50%", fontSize:11, padding:"1px 6px", fontWeight:"bold" }}>{open}</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ padding:"10px 14px", fontSize:11, color:"#3a6a4a", borderTop:"1px solid #1a3a20" }}>
          {filtered.length} student{filtered.length !== 1 ? "s" : ""} found
        </div>
      </div>
    </div>
  );
}
