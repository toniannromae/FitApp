import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";

const csecData = [
  { year:"2021", english:74, math:42 },
  { year:"2022", english:71, math:37 },
  { year:"2023", english:78, math:43 },
  { year:"2024", english:76, math:39 },
  { year:"2025", english:85, math:44 },
];

const csecSubjects2025 = [
  { subject:"Food, Nutrition & Health", rate:93 },
  { subject:"Theatre Arts", rate:92 },
  { subject:"Principles of Business", rate:90 },
  { subject:"Information Technology", rate:88 },
  { subject:"Agricultural Science", rate:86 },
  { subject:"English A", rate:85 },
  { subject:"Visual Arts", rate:83 },
  { subject:"Biology", rate:84 },
  { subject:"Mathematics", rate:44 },
];

const categories = [
  {
    id:"core", label:"Core / Legacy Policies", icon:"🏛️", color:"#1a3a2a", accent:"#2d7a4f",
    docs:[
      { title:"Legacy Policies of the MoEY (Revised Aug 2022)", description:"A consolidated compendium of the ministry's historical and standing policies.", date:"August 2022", type:"PDF" },
    ],
  },
  {
    id:"official", label:"Official Policy Documents", icon:"📜", color:"#1a2a3a", accent:"#2d5f9e",
    docs:[
      { title:"National Youth Policy 2023 (Popular Version, 2017–2030)", description:"The national policy framework guiding youth development in Jamaica.", date:"October 2023", type:"PDF" },
      { title:"Guidelines for Devotions in Schools", description:"Standards and guidelines for the conduct of devotional activities in schools.", date:"August 2023", type:"PDF" },
      { title:"Student Dress & Grooming Policy — Draft", description:"Draft policy establishing standards for student dress and personal grooming.", date:"August 2023", type:"PDF" },
      { title:"Environmental and Social Commitment Plan (ESCP)", description:"Commitment plan covering environmental and social obligations under the education project.", date:"May 2023", type:"PDF" },
      { title:"Records and Information Management Policy", description:"Policy governing the management and governance of ministry records.", date:"2019", type:"PDF" },
      { title:"National Policy — Reintegration of School-age Mothers", description:"Policy framework for the reintegration of teenage mothers into the school system.", date:"2014", type:"PDF" },
    ],
  },
  {
    id:"curriculum", label:"Curriculum & Subject Policies", icon:"📐", color:"#2a1a3a", accent:"#7a3d9e",
    docs:[
      { title:"National Mathematics Policy Guidelines", description:"Guidelines and standards for mathematics teaching and learning across all levels.", date:"2013", type:"PDF" },
      { title:"Draft National School Nutrition Policy & Standards", description:"Standards for school feeding and student nutritional requirements.", date:"August 2023", type:"PDF" },
      { title:"ICT in Education Policy", description:"Policy framework for the integration of information and communications technology in Jamaica's education system.", date:"2022", type:"PDF" },
    ],
  },
  {
    id:"green", label:"Green Papers & Consultations", icon:"🌿", color:"#1f2e1a", accent:"#5a8a3a",
    docs:[
      { title:"Green Paper — Restorative Justice Policy (Revised)", description:"Consultation paper proposing restorative justice approaches in schools.", date:"2023", type:"PDF" },
    ],
  },
  {
    id:"jep", label:"Jamaica Education Project (JEP) Frameworks", icon:"🏗️", color:"#2a2010", accent:"#b07020",
    docs:[
      { title:"JEP Labour Management Procedures", description:"Procedures for managing labour and employment practices under the Jamaica Education Project.", date:"2022", type:"PDF" },
      { title:"JEP Stakeholder Engagement Plan", description:"Framework for stakeholder participation in the Jamaica Education Project.", date:"2023", type:"PDF" },
      { title:"JEP Environmental & Social Management Framework", description:"Framework for environmental and social risk management under JEP.", date:"2022", type:"PDF" },
    ],
  },
  {
    id:"emergency", label:"Emergency & Crisis Policies", icon:"🚨", color:"#2e0a0a", accent:"#9e3030",
    docs:[
      { title:"Schools Emergency Management Plan (Template)", description:"Template plan for school-level emergency preparedness and response.", date:"2021", type:"PDF" },
      { title:"COVID-19 Education Response Framework", description:"MoESYI's operational framework for education continuity during the COVID-19 pandemic.", date:"2020", type:"PDF" },
    ],
  },
  {
    id:"performance", label:"Performance & Accountability", icon:"📈", color:"#101e2e", accent:"#3060a0",
    docs:[
      { title:"School Improvement Plan (SIP) Template", description:"Standardised template for annual school improvement planning.", date:"2022", type:"PDF" },
      { title:"Principal Performance Management Framework", description:"Framework for evaluating and supporting school principal performance.", date:"2020", type:"PDF" },
    ],
  },
  {
    id:"repositories", label:"Policy Repositories", icon:"🗃️", color:"#1a1a1a", accent:"#4a4a4a",
    docs:[
      { title:"MoESYI Official Website — Policies", description:"The official Ministry of Education, Skills, Youth and Information policy portal.", date:"Ongoing", type:"Web" },
      { title:"EdTax Policy Database", description:"Independent curated repository of Jamaican education legislation and policy.", date:"Ongoing", type:"Web" },
    ],
  },
];

export default function MoESYIPolicy() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);
  const [tab, setTab] = useState("policies");

  const displayCategories = activeCategory === "all" ? categories : categories.filter(c => c.id === activeCategory);

  const TABS = [
    { id:"policies", label:"Policy Browser" },
    { id:"csec",     label:"CSEC Performance Data" },
    { id:"about",    label:"About MoESYI" },
  ];

  return (
    <div>
      <div style={{ display:"flex", gap:2, borderBottom:"1px solid #1a3a20", marginBottom:20, overflowX:"auto" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding:"7px 16px", background:tab === t.id ? "#0d2010" : "transparent", border:"none", borderBottom:tab === t.id ? "2px solid #2d7a4f" : "2px solid transparent", color:tab === t.id ? "#5dba80" : "#3a6a4a", fontSize:12, cursor:"pointer", fontFamily:"Georgia,serif", marginBottom:-1, whiteSpace:"nowrap" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* POLICY BROWSER */}
      {tab === "policies" && (
        <div style={{ display:"flex", gap:16 }}>
          {/* Category sidebar */}
          <div style={{ width:190, flexShrink:0 }}>
            <div style={{ fontSize:10, color:"#2a5a3a", textTransform:"uppercase", letterSpacing:2, marginBottom:8 }}>Categories</div>
            <button onClick={() => setActiveCategory("all")} style={{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:"8px 10px", background:activeCategory === "all" ? "#0d2010" : "transparent", border:`1px solid ${activeCategory === "all" ? "#2d5e3a" : "transparent"}`, borderRadius:8, color:activeCategory === "all" ? "#5dba80" : "#3a6a4a", fontSize:12, cursor:"pointer", fontFamily:"Georgia,serif", textAlign:"left", marginBottom:3 }}>
              📂 All Policies <span style={{ marginLeft:"auto", fontSize:10, color:"#2a4a2a" }}>{categories.reduce((n,c) => n + c.docs.length, 0)}</span>
            </button>
            {categories.map(c => (
              <button key={c.id} onClick={() => setActiveCategory(c.id)} style={{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:"8px 10px", background:activeCategory === c.id ? "#0d2010" : "transparent", border:`1px solid ${activeCategory === c.id ? "#2d5e3a" : "transparent"}`, borderRadius:8, color:activeCategory === c.id ? "#5dba80" : "#3a6a4a", fontSize:12, cursor:"pointer", fontFamily:"Georgia,serif", textAlign:"left", marginBottom:3 }}>
                {c.icon} <span style={{ flex:1 }}>{c.label}</span> <span style={{ fontSize:10, color:"#2a4a2a" }}>{c.docs.length}</span>
              </button>
            ))}
          </div>

          {/* Document list */}
          <div style={{ flex:1, display:"flex", flexDirection:"column", gap:16 }}>
            {displayCategories.map(cat => (
              <div key={cat.id}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                  <span style={{ fontSize:16 }}>{cat.icon}</span>
                  <span style={{ fontSize:13, color:"#c8d8c8" }}>{cat.label}</span>
                  <span style={{ fontSize:10, color:"#2a4a2a", background:"#091208", border:"1px solid #1a2a1a", borderRadius:10, padding:"1px 8px" }}>{cat.docs.length} documents</span>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {cat.docs.map((doc, i) => {
                    const key = `${cat.id}-${i}`;
                    const isOpen = expandedDoc === key;
                    return (
                      <div key={i} style={{ background:"#0d1a0e", border:`1px solid ${isOpen ? cat.accent + "66" : "#1a3a20"}`, borderRadius:10, overflow:"hidden", transition:"border-color .2s" }}>
                        <button onClick={() => setExpandedDoc(isOpen ? null : key)} style={{ width:"100%", padding:"12px 16px", background:"transparent", border:"none", display:"flex", alignItems:"flex-start", gap:12, cursor:"pointer", fontFamily:"Georgia,serif", textAlign:"left" }}>
                          <div style={{ width:32, height:32, background:`${cat.accent}22`, border:`1px solid ${cat.accent}55`, borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, flexShrink:0 }}>
                            {doc.type === "Web" ? "🌐" : "📄"}
                          </div>
                          <div style={{ flex:1 }}>
                            <div style={{ fontSize:13, color:"#c8d8c8", marginBottom:3 }}>{doc.title}</div>
                            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                              <span style={{ fontSize:10, color:cat.accent, background:`${cat.accent}22`, border:`1px solid ${cat.accent}44`, borderRadius:4, padding:"1px 6px" }}>{doc.type}</span>
                              <span style={{ fontSize:11, color:"#3a6a4a" }}>{doc.date}</span>
                            </div>
                          </div>
                          <span style={{ color:"#2a4a2a", fontSize:12, flexShrink:0 }}>{isOpen ? "▲" : "▼"}</span>
                        </button>
                        {isOpen && (
                          <div style={{ borderTop:"1px solid #0f200f", padding:"12px 16px" }}>
                            <div style={{ fontSize:13, color:"#7a9a7a", lineHeight:1.7, marginBottom:12 }}>{doc.description}</div>
                            <div style={{ display:"flex", gap:8 }}>
                              <button style={{ padding:"6px 14px", background:`${cat.accent}22`, border:`1px solid ${cat.accent}55`, borderRadius:6, color:cat.accent, fontSize:12, cursor:"pointer", fontFamily:"Georgia,serif" }}>
                                {doc.type === "Web" ? "Visit Website" : "View Document"}
                              </button>
                              <span style={{ fontSize:11, color:"#2a4a2a", alignSelf:"center" }}>
                                {doc.type === "PDF" ? "Opens on MoESYI website" : "External link"}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CSEC DATA */}
      {tab === "csec" && (
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div style={{ background:"#0d1a0e", border:"1px solid #1a3a20", borderRadius:12, padding:16 }}>
            <div style={{ fontSize:11, color:"#3a6a4a", textTransform:"uppercase", letterSpacing:2, marginBottom:16 }}>CSEC Pass Rate Trend 2021–2025 (National Average)</div>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={csecData} margin={{ top:4, right:20, bottom:0, left:-10 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#1a3a20" />
                <XAxis dataKey="year" tick={{ fill:"#4a7a5a", fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[30, 100]} tick={{ fill:"#4a7a5a", fontSize:11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                <Tooltip contentStyle={{ background:"#0d1f14", border:"1px solid #2d5e3a", fontSize:13, fontFamily:"Georgia,serif" }} />
                <Legend formatter={v => v === "english" ? "English A" : "Mathematics"} wrapperStyle={{ fontSize:12, color:"#7a9a7a" }} />
                <ReferenceLine y={50} stroke="#3a4a3a" strokeDasharray="3 3" label={{ value:"50% pass threshold", fill:"#2d5e3a", fontSize:10 }} />
                <Line type="monotone" dataKey="english" stroke="#5dba80" strokeWidth={2} dot={{ r:4, fill:"#5dba80" }} />
                <Line type="monotone" dataKey="math"    stroke="#e05050" strokeWidth={2} dot={{ r:4, fill:"#e05050" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background:"#0d1a0e", border:"1px solid #1a3a20", borderRadius:12, padding:16 }}>
            <div style={{ fontSize:11, color:"#3a6a4a", textTransform:"uppercase", letterSpacing:2, marginBottom:14 }}>2025 CSEC Subject Pass Rates</div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {csecSubjects2025.sort((a,b) => b.rate - a.rate).map(s => (
                <div key={s.subject}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <span style={{ fontSize:12, color:"#9abaa4" }}>{s.subject}</span>
                    <span style={{ fontSize:12, color:s.rate >= 70 ? "#5dba80" : s.rate >= 50 ? "#d4a040" : "#e05050", fontWeight:"bold" }}>{s.rate}%</span>
                  </div>
                  <div style={{ height:6, background:"#1a3a20", borderRadius:3, overflow:"hidden" }}>
                    <div style={{ width:`${s.rate}%`, height:"100%", background:s.rate >= 70 ? "#2d7a4f" : s.rate >= 50 ? "#7a5020" : "#7a1010", borderRadius:3 }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop:16, padding:"10px 14px", background:"#091208", borderRadius:8, fontSize:12, color:"#5a8a6a" }}>
              <strong style={{ color:"#c8d8c8" }}>Key insight:</strong> Mathematics continues to lag significantly behind other subjects at 44%, despite improvements in most other areas. This is a critical focus area for EduTrack Jamaica's early warning system — flagging students at risk of CSEC Math failure as early as Form 2.
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <div style={{ background:"#0d1a0e", border:"1px solid #5dba8033", borderRadius:12, padding:16 }}>
              <div style={{ fontSize:11, color:"#3a6a4a", textTransform:"uppercase", letterSpacing:2, marginBottom:10 }}>2025 Highlights</div>
              {["English A at 85% — highest in 5 years","Theatre Arts 92% pass rate","Food, Nutrition & Health leads at 93%","IT pass rate jumped to 88%","All-time national record for CSEC passes"].map((item, i) => (
                <div key={i} style={{ display:"flex", gap:8, marginBottom:6 }}>
                  <span style={{ color:"#5dba80" }}>✓</span>
                  <span style={{ fontSize:12, color:"#7a9a7a" }}>{item}</span>
                </div>
              ))}
            </div>
            <div style={{ background:"#0d1a0e", border:"1px solid #e0505033", borderRadius:12, padding:16 }}>
              <div style={{ fontSize:11, color:"#3a6a4a", textTransform:"uppercase", letterSpacing:2, marginBottom:10 }}>Persistent Concerns</div>
              {["Mathematics at 44% — far below 50% threshold","Rural-urban achievement gap remains significant","Male underperformance in most core subjects","Schools without counsellors show higher dropout","IEP compliance rates vary widely by school type"].map((item, i) => (
                <div key={i} style={{ display:"flex", gap:8, marginBottom:6 }}>
                  <span style={{ color:"#e05050" }}>⚠</span>
                  <span style={{ fontSize:12, color:"#7a9a7a" }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ABOUT */}
      {tab === "about" && (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ background:"#0d1a0e", border:"1px solid #1a3a20", borderRadius:12, padding:20 }}>
            <div style={{ display:"flex", gap:14, marginBottom:16 }}>
              <span style={{ fontSize:32 }}>🇯🇲</span>
              <div>
                <div style={{ fontSize:16, color:"#c8d8c8", marginBottom:4 }}>Ministry of Education, Skills, Youth and Information (MoESYI)</div>
                <div style={{ fontSize:12, color:"#5a8a6a" }}>Government of Jamaica · Kingston, Jamaica</div>
              </div>
            </div>
            <div style={{ fontSize:13, color:"#7a9a7a", lineHeight:1.8 }}>
              The Ministry of Education, Skills, Youth and Information is responsible for formulating and implementing educational policy at all levels of the Jamaican education system — from early childhood through tertiary education. The Ministry oversees approximately 1,000 public schools across Jamaica's 14 parishes, serving over 500,000 students.
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            {[
              { title:"Key Education Statistics", items:[["Public Secondary Schools","~180"],["All-Age & Primary Schools","~820"],["Early Childhood Institutions","~2,000"],["Students (all levels)","~500,000+"],["Teaching staff","~25,000"],["Parishes","14"]] },
              { title:"Policy Priorities 2024–2030", items:[["Math achievement","Target 60% CSEC pass rate by 2028"],["Literacy","Universal reading proficiency by Grade 4"],["STEM","Increase ICT/STEM enrolment 40%"],["Inclusion","IEP compliance in all public schools"],["Safety","Restorative justice in all secondary schools"],["Digital","Paperless administration by 2027"]] },
            ].map(section => (
              <div key={section.title} style={{ background:"#0d1a0e", border:"1px solid #1a3a20", borderRadius:12, padding:16 }}>
                <div style={{ fontSize:11, color:"#3a6a4a", textTransform:"uppercase", letterSpacing:2, marginBottom:12 }}>{section.title}</div>
                {(section.items as [string,string][]).map(([k,v]) => (
                  <div key={k} style={{ display:"flex", gap:8, paddingBottom:7, borderBottom:"1px solid #0f200f", marginBottom:7 }}>
                    <span style={{ fontSize:11, color:"#3a6a4a", flex:1 }}>{k}</span>
                    <span style={{ fontSize:12, color:"#9abaa4", fontWeight:"bold" }}>{v}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div style={{ background:"#0d1a0e", border:"1px solid #1a3a20", borderRadius:12, padding:16 }}>
            <div style={{ fontSize:11, color:"#3a6a4a", textTransform:"uppercase", letterSpacing:2, marginBottom:12 }}>EduTrack Jamaica Alignment</div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {[
                ["Attendance monitoring","Directly supports MoESYI's chronic absenteeism reduction targets"],
                ["Early warning system","Aligns with the Ministry's Student Support Services framework"],
                ["IEP management","Supports inclusive education policy mandates"],
                ["CSEC trajectory tracking","Supports the Mathematics achievement improvement programme"],
                ["DPA 2020 compliance","Meets Ministry data governance requirements for school management systems"],
                ["Parish-level data","Supports Ministry's parish education performance monitoring"],
              ].map(([k,v]) => (
                <div key={k} style={{ display:"flex", gap:10, background:"#091208", borderRadius:8, padding:"10px 12px" }}>
                  <span style={{ color:"#5dba80", flexShrink:0 }}>✓</span>
                  <div>
                    <span style={{ fontSize:12, color:"#c8d8c8" }}>{k}</span>
                    <span style={{ fontSize:12, color:"#5a8a6a" }}> — {v}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
