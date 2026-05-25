import { useState } from "react";
import { STUDENTS } from "./data/students";
import { NAV_ITEMS, EXT_NAV_ITEMS, ALERT_C } from "./data/constants";
import Dashboard from "./components/Dashboard";
import StudentList from "./components/StudentList";
import StudentDetail from "./components/StudentDetail";
import SchemaViewer from "./components/SchemaViewer";
import BillingModel from "./components/BillingModel";
import ApiDesign from "./components/ApiDesign";
import MoESYIPolicy from "./components/MoESYIPolicy";

const PLACEHOLDER_NAV = ["attendance","academic","learning","behaviour","interventions","alerts","reports","documents"];

export default function App() {
  const [nav, setNav] = useState("dashboard");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const handleSelectStudent = (s: any) => { setSelectedStudent(s); setNav("student-detail"); };
  const handleBack = () => { setSelectedStudent(null); setNav("students"); };

  const totalAlerts = STUDENTS.flatMap(s => s.alerts.filter((a: any) => !a.resolved)).length;
  const criticalCount = STUDENTS.filter(s => s.riskLevel === "critical").length;

  const allNavItems = [...NAV_ITEMS, ...EXT_NAV_ITEMS];

  return (
    <div style={{ minHeight:"100vh", height:"100vh", background:"#07100a", fontFamily:"'Georgia',serif", color:"#d8e8d8", display:"flex", flexDirection:"column", overflow:"hidden" }}>
      {/* Top bar */}
      <div style={{ background:"#0a1a0d", borderBottom:"1px solid #1a3a20", padding:"10px 18px", display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
        <div style={{ width:30, height:30, background:"linear-gradient(135deg,#2d7a4f,#1a4a2e)", borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, border:"1px solid #3a9a60", flexShrink:0 }}>🇯🇲</div>
        <div>
          <div style={{ fontSize:13, fontWeight:"bold", color:"#8ad8a0", letterSpacing:0.5 }}>EduTrack Jamaica</div>
          <div style={{ fontSize:9, color:"#3a6a4a", letterSpacing:2, textTransform:"uppercase" }}>Student Information System</div>
        </div>
        <div style={{ marginLeft:"auto", display:"flex", gap:6 }}>
          {([{l:"Students",v:STUDENTS.length,c:"#5dba80"},{l:"Critical",v:criticalCount,c:"#e05050"},{l:"Alerts",v:totalAlerts,c:"#d4904a"}] as {l:string;v:number;c:string}[]).map(s => (
            <div key={s.l} style={{ background:"#0d1f10", border:"1px solid #1a3a20", borderRadius:7, padding:"3px 10px", textAlign:"center" }}>
              <div style={{ fontSize:14, fontWeight:"bold", color:s.c }}>{s.v}</div>
              <div style={{ fontSize:8, color:"#3a6a4a", textTransform:"uppercase", letterSpacing:1 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display:"flex", flex:1, overflow:"hidden" }}>
        {/* Sidebar */}
        <div style={{ width:52, background:"#09150b", borderRight:"1px solid #1a3a20", display:"flex", flexDirection:"column", alignItems:"center", paddingTop:8, gap:1, flexShrink:0, overflowY:"auto" }}>
          {/* Main nav */}
          {NAV_ITEMS.map(item => {
            const isActive = nav === item.id || (nav === "student-detail" && item.id === "students");
            return (
              <button key={item.id} onClick={() => { setNav(item.id); setSelectedStudent(null); }} title={item.label}
                style={{ width:40, height:40, borderRadius:8, background:isActive ? "#0d2010" : "transparent", border:`1px solid ${isActive ? "#2d5e3a" : "transparent"}`, color:isActive ? "#5dba80" : "#2d5e3a", fontSize:16, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", position:"relative" }}>
                {item.icon}
                {item.id === "alerts" && totalAlerts > 0 && <span style={{ position:"absolute", top:4, right:4, width:8, height:8, background:"#e05050", borderRadius:"50%", border:"1px solid #07100a" }} />}
              </button>
            );
          })}

          {/* Divider */}
          <div style={{ width:28, height:1, background:"#1a3a20", margin:"6px 0" }} />

          {/* Extended nav */}
          {EXT_NAV_ITEMS.map(item => {
            const isActive = nav === item.id;
            return (
              <button key={item.id} onClick={() => { setNav(item.id); setSelectedStudent(null); }} title={item.label}
                style={{ width:40, height:40, borderRadius:8, background:isActive ? "#0d2010" : "transparent", border:`1px solid ${isActive ? "#2d5e3a" : "transparent"}`, color:isActive ? "#5dba80" : "#2a4a35", fontSize:15, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                {item.icon}
              </button>
            );
          })}
        </div>

        {/* Main content */}
        <div style={{ flex:1, overflowY:"auto", padding:"18px 20px" }}>
          {/* Section title */}
          <div style={{ marginBottom:16 }}>
            {nav === "student-detail" && selectedStudent ? (
              <div style={{ fontSize:11, color:"#2d5e3a", textTransform:"uppercase", letterSpacing:2 }}>
                Students / {selectedStudent.firstName} {selectedStudent.lastName}
              </div>
            ) : (
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ fontSize:11, color:"#2d5e3a", textTransform:"uppercase", letterSpacing:2 }}>
                  {allNavItems.find(n => n.id === nav)?.label || "EduTrack Jamaica SIS"}
                </div>
              </div>
            )}
          </div>

          {nav === "dashboard" && <Dashboard students={STUDENTS} />}
          {nav === "students" && <StudentList students={STUDENTS} onSelect={handleSelectStudent} />}
          {nav === "student-detail" && selectedStudent && <StudentDetail student={selectedStudent} onBack={handleBack} />}

          {/* Schema / Billing / API / Policies sections */}
          {nav === "schema" && <SchemaViewer />}
          {nav === "billing" && <BillingModel />}
          {nav === "api" && <ApiDesign />}
          {nav === "policies" && <MoESYIPolicy />}

          {/* Placeholder sections */}
          {PLACEHOLDER_NAV.includes(nav) && (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:300, color:"#2d5e3a", textAlign:"center", gap:16 }}>
              <div style={{ fontSize:48 }}>{NAV_ITEMS.find(n => n.id === nav)?.icon}</div>
              <div>
                <div style={{ fontSize:18, color:"#4a8a6a", marginBottom:8 }}>{NAV_ITEMS.find(n => n.id === nav)?.label}</div>
                <div style={{ fontSize:13, color:"#2d5e3a", lineHeight:1.7 }}>
                  System-wide {NAV_ITEMS.find(n => n.id === nav)?.label?.toLowerCase()} view.<br />
                  Select a student from the{" "}
                  <span onClick={() => setNav("students")} style={{ color:"#5dba80", cursor:"pointer", textDecoration:"underline" }}>Students</span>{" "}
                  directory to view individual records.
                </div>
              </div>
              {nav === "alerts" && (
                <div style={{ display:"flex", flexDirection:"column", gap:8, width:"100%", maxWidth:500 }}>
                  <div style={{ fontSize:11, color:"#3a6a4a", textTransform:"uppercase", letterSpacing:2, marginBottom:4 }}>System-wide Open Alerts ({totalAlerts})</div>
                  {STUDENTS.flatMap(s => s.alerts.filter((a: any) => !a.resolved).map((a: any) => ({ ...a, student:s.firstName + " " + s.lastName }))).map((al: any, i: number) => {
                    const ac = ALERT_C[al.level];
                    return (
                      <div key={i} style={{ background:`${ac.c}08`, border:`1px solid ${ac.b}`, borderRadius:8, padding:"10px 14px", display:"flex", gap:10, alignItems:"flex-start", textAlign:"left" }}>
                        <span style={{ color:ac.c, fontSize:14 }}>{ac.icon}</span>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:12, color:"#c8d8c8", marginBottom:2 }}>{al.student} <span style={{ fontSize:10, color:ac.c }}>· {al.level.toUpperCase()}</span></div>
                          <div style={{ fontSize:11, color:"#7a9a7a" }}>{al.msg}</div>
                        </div>
                        <div style={{ fontSize:10, color:"#3a6a4a" }}>{al.date}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Status bar */}
      <div style={{ background:"#09150b", borderTop:"1px solid #1a3a20", padding:"5px 18px", fontSize:9, color:"#2a5a3a", display:"flex", justifyContent:"space-between", flexShrink:0 }}>
        <span>EduTrack Jamaica SIS · Ministry of Education, Skills, Youth &amp; Information · Prototype</span>
        <span>{STUDENTS.length} students · {criticalCount} critical · {totalAlerts} open alerts · v0.1</span>
      </div>
    </div>
  );
}
