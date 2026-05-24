import { useState } from "react";

const METHOD_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  GET:    { bg:"#0a2e1a", border:"#1a6a3a", text:"#5dba80" },
  POST:   { bg:"#0a1e2e", border:"#1a4a7a", text:"#4a9fd4" },
  PUT:    { bg:"#2e2008", border:"#7a5010", text:"#d4a040" },
  PATCH:  { bg:"#1e1a08", border:"#5a5010", text:"#d4c040" },
  DELETE: { bg:"#2e0808", border:"#7a1010", text:"#e05050" },
};

const ROLE_COLORS: Record<string, string> = {
  principal:"#5dba80", vice_principal:"#4aaa70", form_teacher:"#4a9fd4",
  subject_teacher:"#a07ada", counsellor:"#d4c040", bursar:"#d4904a",
  parent:"#d46a8a", platform_admin:"#808080", all:"#5dba80",
};

const API_GROUPS = [
  {
    id:"auth", label:"Authentication", icon:"🔑",
    description:"Cognito-backed auth. All endpoints except /auth/* require Bearer JWT in Authorization header.",
    endpoints:[
      { method:"POST", path:"/auth/login", summary:"Authenticate user, return JWT + refresh token", auth:false, roles:[], notes:"Sets app.tenant_id and app.user_id in DB session context for RLS. Returns 401 if inactive." },
      { method:"POST", path:"/auth/refresh", summary:"Exchange refresh token for new access token", auth:false, roles:[], notes:"" },
      { method:"POST", path:"/auth/logout", summary:"Revoke refresh token, end session", auth:true, roles:["all"], notes:"" },
      { method:"POST", path:"/auth/forgot-password", summary:"Trigger password reset email via Cognito", auth:false, roles:[], notes:"Deliberately vague response to prevent account enumeration." },
      { method:"POST", path:"/auth/mfa/setup", summary:"Initiate MFA setup (TOTP)", auth:true, roles:["all"], notes:"" },
    ],
  },
  {
    id:"tenants", label:"Tenants (Schools)", icon:"🏫",
    description:"School onboarding and management. Only platform admins can create tenants.",
    endpoints:[
      { method:"POST",  path:"/tenants", summary:"Onboard a new school", auth:true, roles:["platform_admin"], notes:"Creates tenant record, provisions DB schema with RLS policies, sends admin invite email." },
      { method:"GET",   path:"/tenants/:tenant_id", summary:"Get school profile", auth:true, roles:["principal","platform_admin"], notes:"" },
      { method:"PATCH", path:"/tenants/:tenant_id", summary:"Update school settings", auth:true, roles:["principal","platform_admin"], notes:"" },
    ],
  },
  {
    id:"students", label:"Students", icon:"🎓",
    description:"Core student registry. All queries automatically tenant-scoped via RLS.",
    endpoints:[
      { method:"GET",   path:"/students", summary:"List students (paginated, filterable)", auth:true, roles:["principal","vice_principal","form_teacher"], notes:"Form teachers see only their form. Subject teachers cannot access this endpoint." },
      { method:"POST",  path:"/students", summary:"Enrol a new student", auth:true, roles:["principal","vice_principal"], notes:"" },
      { method:"GET",   path:"/students/:student_id", summary:"Get full student profile", auth:true, roles:["principal","vice_principal","form_teacher"], notes:"Subject teachers receive 403. Response shape varies by role — form teachers don't see health data." },
      { method:"PATCH", path:"/students/:student_id", summary:"Update student profile", auth:true, roles:["principal","vice_principal"], notes:"" },
      { method:"DELETE",path:"/students/:student_id", summary:"Soft-delete (withdraw) student", auth:true, roles:["principal"], notes:"Sets status = withdrawn. Hard delete scheduled per DPA retention policy." },
    ],
  },
  {
    id:"attendance", label:"Attendance", icon:"📅",
    description:"Attendance recording with offline-first sync support.",
    endpoints:[
      { method:"POST", path:"/attendance/bulk", summary:"Record attendance for a session (batch)", auth:true, roles:["form_teacher","subject_teacher","principal"], notes:"Accepts array of records. Idempotent — safe to retry. Offline queue drains to this endpoint." },
      { method:"GET",  path:"/students/:student_id/attendance", summary:"Get student attendance history", auth:true, roles:["principal","vice_principal","form_teacher","parent"], notes:"Parents see only their own child." },
      { method:"GET",  path:"/attendance/summary", summary:"School-wide attendance summary by date", auth:true, roles:["principal","vice_principal"], notes:"" },
      { method:"PATCH",path:"/attendance/:record_id", summary:"Amend a single attendance record", auth:true, roles:["principal","vice_principal","form_teacher"], notes:"" },
    ],
  },
  {
    id:"grades", label:"Grades", icon:"📊",
    description:"Grade entry and academic record management.",
    endpoints:[
      { method:"POST",  path:"/grades",   summary:"Enter assessment grades (batch)", auth:true, roles:["subject_teacher","form_teacher","principal"], notes:"Subject teachers can only enter grades for their own classes." },
      { method:"GET",   path:"/students/:student_id/grades", summary:"Get student academic record", auth:true, roles:["principal","vice_principal","form_teacher","parent"], notes:"" },
      { method:"PATCH", path:"/grades/:grade_id", summary:"Amend a grade entry", auth:true, roles:["subject_teacher","principal"], notes:"Logged in audit_logs." },
      { method:"GET",   path:"/grades/report",   summary:"Generate class grade report", auth:true, roles:["principal","subject_teacher"], notes:"" },
    ],
  },
  {
    id:"behaviour", label:"Behaviour", icon:"📋",
    description:"Behaviour incident logging and counsellor flag management.",
    endpoints:[
      { method:"POST", path:"/behaviour/incidents", summary:"Log a behaviour incident", auth:true, roles:["form_teacher","subject_teacher","vice_principal","principal"], notes:"Setting flag_counsellor=true creates a counsellor_flags record." },
      { method:"GET",  path:"/students/:student_id/behaviour", summary:"Get student behaviour log", auth:true, roles:["principal","vice_principal","form_teacher","counsellor"], notes:"Counsellors see only flagged students." },
      { method:"POST", path:"/behaviour/counsellor-flags", summary:"Create a counsellor referral flag", auth:true, roles:["principal","vice_principal","form_teacher"], notes:"" },
      { method:"PATCH",path:"/behaviour/counsellor-flags/:flag_id", summary:"Update flag status / resolution", auth:true, roles:["counsellor","principal"], notes:"" },
    ],
  },
  {
    id:"alerts", label:"Alerts", icon:"🔔",
    description:"Alert instance management and rule configuration.",
    endpoints:[
      { method:"GET",   path:"/alerts", summary:"List all open alerts for tenant", auth:true, roles:["principal","vice_principal"], notes:"" },
      { method:"GET",   path:"/students/:student_id/alerts", summary:"Get alerts for a student", auth:true, roles:["principal","form_teacher","counsellor","parent"], notes:"" },
      { method:"POST",  path:"/alerts", summary:"Manually raise an alert", auth:true, roles:["principal","vice_principal","counsellor"], notes:"" },
      { method:"PATCH", path:"/alerts/:alert_id/resolve", summary:"Mark alert as resolved", auth:true, roles:["principal","vice_principal","counsellor"], notes:"" },
      { method:"GET",   path:"/alert-rules", summary:"List alert rule definitions", auth:true, roles:["principal"], notes:"" },
    ],
  },
  {
    id:"learning", label:"Learning & IEP", icon:"🧠",
    description:"Learning profiles, IEP plan management, and accommodations.",
    endpoints:[
      { method:"GET",   path:"/students/:student_id/learning-profile", summary:"Get student learning profile", auth:true, roles:["principal","form_teacher","counsellor"], notes:"" },
      { method:"PUT",   path:"/students/:student_id/learning-profile", summary:"Create or update learning profile", auth:true, roles:["principal","counsellor"], notes:"" },
      { method:"POST",  path:"/students/:student_id/iep", summary:"Create IEP plan", auth:true, roles:["principal","counsellor"], notes:"" },
      { method:"GET",   path:"/students/:student_id/iep/active", summary:"Get active IEP", auth:true, roles:["principal","form_teacher","counsellor","parent"], notes:"Parents see IEP content but not clinical notes." },
      { method:"PATCH", path:"/iep/:iep_id", summary:"Update IEP plan", auth:true, roles:["principal","counsellor"], notes:"" },
    ],
  },
  {
    id:"interventions", label:"Interventions", icon:"🛠",
    description:"Support intervention logging and progress tracking.",
    endpoints:[
      { method:"POST",  path:"/interventions", summary:"Log a new intervention", auth:true, roles:["principal","counsellor","form_teacher"], notes:"" },
      { method:"GET",   path:"/students/:student_id/interventions", summary:"Get interventions for a student", auth:true, roles:["principal","counsellor","form_teacher"], notes:"" },
      { method:"PATCH", path:"/interventions/:id", summary:"Update intervention outcome/status", auth:true, roles:["principal","counsellor"], notes:"" },
    ],
  },
  {
    id:"documents", label:"Documents", icon:"🗂",
    description:"Document upload and retrieval via S3 pre-signed URLs.",
    endpoints:[
      { method:"POST", path:"/documents/upload-url", summary:"Get S3 pre-signed upload URL", auth:true, roles:["principal","vice_principal","counsellor","form_teacher"], notes:"Client uploads directly to S3. Metadata record created on completion." },
      { method:"GET",  path:"/documents/:doc_id/download-url", summary:"Get pre-signed download URL (15-min TTL)", auth:true, roles:["principal","vice_principal","counsellor","form_teacher","parent"], notes:"Sensitive documents have shorter TTL. Access logged." },
      { method:"GET",  path:"/students/:student_id/documents", summary:"List documents for a student", auth:true, roles:["principal","vice_principal","counsellor","form_teacher"], notes:"" },
      { method:"DELETE",path:"/documents/:doc_id", summary:"Soft-delete document", auth:true, roles:["principal"], notes:"" },
    ],
  },
];

const SPRINT_ROADMAP = [
  { sprint:"S0", name:"Foundation",       weeks:"Wk 1–2",   theme:"Infrastructure", color:"#808080", items:["AWS VPC, RDS, ECS setup","CI/CD pipelines (GitHub Actions)","Terraform modules","Local dev environment","Base API scaffold (Express/Fastify)","DB migrations tooling"] },
  { sprint:"S1", name:"Authentication",   weeks:"Wk 3–4",   theme:"Auth", color:"#4a9fd4", items:["Cognito User Pool setup","JWT validation middleware","RLS session context injection","Tenant resolution middleware","/auth/* endpoints","Role assignment API"] },
  { sprint:"S2", name:"Student Registry", weeks:"Wk 5–7",   theme:"Core", color:"#5dba80", items:["Student CRUD endpoints","Guardian management","Health record endpoints","Student list with filters","Basic React frontend scaffold","Student profile UI"] },
  { sprint:"S3", name:"Attendance",       weeks:"Wk 8–10",  theme:"Offline", color:"#d4904a", items:["Attendance session endpoints","Bulk attendance POST","Offline queue (Dexie)","Service Worker / PWA","Sync conflict detection","Attendance calendar UI"] },
  { sprint:"S4", name:"Academic",         weeks:"Wk 11–12", theme:"Grades", color:"#a07ada", items:["Grade entry endpoints","Term average computation","Academic report endpoint","Grade table + trend chart UI","CSEC prediction display"] },
  { sprint:"S5", name:"Behaviour & Alerts",weeks:"Wk 13–15",theme:"Safety", color:"#e05050", items:["Behaviour incident API","Counsellor flag system","Alert rules engine (nightly cron)","Real-time alert triggers","Alert management UI","Dashboard alert panel"] },
  { sprint:"S6", name:"Learning & Docs",  weeks:"Wk 15–16", theme:"IEP", color:"#d4c040", items:["Learning profile API","IEP plan CRUD","Accommodation management","Document upload/download (S3)","IEP tab in student detail"] },
  { sprint:"S7", name:"Parent Portal & Polish",weeks:"Wk 17",theme:"Launch", color:"#4ac4b0", items:["Parent read-only portal","MFA enforcement for parents","Mobile-responsive tweaks","Performance audit","Security pen-test","Staging UAT with pilot schools"] },
];

export default function ApiDesign() {
  const [selectedGroup, setSelectedGroup] = useState("auth");
  const [tab, setTab] = useState("endpoints");
  const [expandedEndpoints, setExpandedEndpoints] = useState<Set<string>>(new Set());

  const group = API_GROUPS.find(g => g.id === selectedGroup)!;

  const toggleEndpoint = (key: string) => {
    setExpandedEndpoints(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const API_TABS = [
    { id:"endpoints", label:"API Endpoints" },
    { id:"roadmap",   label:"Sprint Roadmap" },
    { id:"principles",label:"Design Principles" },
  ];

  return (
    <div>
      <div style={{ display:"flex", gap:2, borderBottom:"1px solid #1a3a20", marginBottom:20, overflowX:"auto" }}>
        {API_TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding:"7px 16px", background:tab === t.id ? "#0d2010" : "transparent", border:"none", borderBottom:tab === t.id ? "2px solid #2d7a4f" : "2px solid transparent", color:tab === t.id ? "#5dba80" : "#3a6a4a", fontSize:12, cursor:"pointer", fontFamily:"Georgia,serif", marginBottom:-1, whiteSpace:"nowrap" }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "endpoints" && (
        <div style={{ display:"flex", gap:16 }}>
          {/* Sidebar */}
          <div style={{ width:180, flexShrink:0 }}>
            <div style={{ fontSize:10, color:"#2a5a3a", textTransform:"uppercase", letterSpacing:2, marginBottom:8 }}>API Groups</div>
            {API_GROUPS.map(g => (
              <button key={g.id} onClick={() => setSelectedGroup(g.id)} style={{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:"8px 10px", background:selectedGroup === g.id ? "#0d2010" : "transparent", border:`1px solid ${selectedGroup === g.id ? "#2d5e3a" : "transparent"}`, borderRadius:8, color:selectedGroup === g.id ? "#5dba80" : "#3a6a4a", fontSize:12, cursor:"pointer", fontFamily:"Georgia,serif", textAlign:"left", marginBottom:3 }}>
                <span style={{ fontSize:14 }}>{g.icon}</span>
                <span>{g.label}</span>
                <span style={{ marginLeft:"auto", fontSize:10, color:"#2a4a2a" }}>{g.endpoints.length}</span>
              </button>
            ))}
          </div>

          {/* Endpoints */}
          <div style={{ flex:1 }}>
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:16, color:"#c8d8c8", marginBottom:4 }}>{group.icon} {group.label}</div>
              <div style={{ fontSize:12, color:"#5a8a6a" }}>{group.description}</div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {group.endpoints.map((ep, i) => {
                const key = `${group.id}-${i}`;
                const mc = METHOD_COLORS[ep.method];
                const isOpen = expandedEndpoints.has(key);
                return (
                  <div key={i} style={{ background:"#0d1a0e", border:"1px solid #1a3a20", borderRadius:10, overflow:"hidden" }}>
                    <button onClick={() => toggleEndpoint(key)} style={{ width:"100%", padding:"12px 16px", background:"transparent", border:"none", display:"flex", alignItems:"center", gap:12, cursor:"pointer", fontFamily:"Georgia,serif" }}>
                      <span style={{ fontSize:11, fontWeight:"bold", color:mc.text, background:mc.bg, border:`1px solid ${mc.border}`, borderRadius:4, padding:"2px 8px", fontFamily:"monospace", flexShrink:0 }}>{ep.method}</span>
                      <span style={{ fontFamily:"monospace", fontSize:12, color:"#9abaa4", flex:1, textAlign:"left" }}>{ep.path}</span>
                      <span style={{ fontSize:12, color:"#5a8a6a", flex:2, textAlign:"left" }}>{ep.summary}</span>
                      {ep.auth && <span style={{ fontSize:10, color:"#3a6a4a", background:"#0a1508", borderRadius:4, padding:"1px 6px", flexShrink:0 }}>🔐 Auth</span>}
                      <span style={{ color:"#2a4a2a", fontSize:12, flexShrink:0 }}>{isOpen ? "▲" : "▼"}</span>
                    </button>
                    {isOpen && (
                      <div style={{ borderTop:"1px solid #0f200f", padding:"12px 16px" }}>
                        {ep.roles.length > 0 && (
                          <div style={{ marginBottom:10 }}>
                            <div style={{ fontSize:10, color:"#2d5e3a", marginBottom:6 }}>ALLOWED ROLES</div>
                            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                              {ep.roles.map(r => <span key={r} style={{ fontSize:11, color:ROLE_COLORS[r] || "#5dba80", background:`${ROLE_COLORS[r] || "#5dba80"}18`, border:`1px solid ${ROLE_COLORS[r] || "#5dba80"}44`, borderRadius:4, padding:"1px 8px" }}>{r}</span>)}
                            </div>
                          </div>
                        )}
                        {ep.notes && <div style={{ fontSize:12, color:"#5a8a6a", fontStyle:"italic", background:"#091208", borderRadius:6, padding:"8px 10px" }}>ℹ {ep.notes}</div>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === "roadmap" && (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div style={{ background:"#0d1a0e", border:"1px solid #1a3a20", borderRadius:12, padding:14, fontSize:12, color:"#5a8a6a" }}>
            17-week MVP roadmap across 8 sprints. Each sprint delivers a shippable increment. Pilot schools begin onboarding from Sprint 3.
          </div>
          {SPRINT_ROADMAP.map(s => (
            <div key={s.sprint} style={{ background:"#09130a", border:`1px solid ${s.color}33`, borderRadius:12, overflow:"hidden" }}>
              <div style={{ background:`${s.color}0f`, padding:"12px 16px", display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                <div style={{ width:36, height:36, borderRadius:"50%", background:`${s.color}22`, border:`1px solid ${s.color}55`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:s.color, fontWeight:"bold", flexShrink:0 }}>{s.sprint}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, color:s.color }}>{s.name}</div>
                  <div style={{ fontSize:11, color:"#3a6a4a" }}>{s.weeks} · Theme: {s.theme}</div>
                </div>
              </div>
              <div style={{ padding:"12px 16px", display:"flex", flexWrap:"wrap", gap:8 }}>
                {s.items.map((item, i) => (
                  <span key={i} style={{ fontSize:11, color:"#7a9a7a", background:"#0a150b", border:"1px solid #1a2a1a", borderRadius:6, padding:"3px 10px" }}>{item}</span>
                ))}
              </div>
            </div>
          ))}
          <div style={{ background:"#0d1a0e", border:"1px solid #1a3a20", borderRadius:12, padding:14 }}>
            <div style={{ fontSize:11, color:"#3a6a4a", textTransform:"uppercase", letterSpacing:2, marginBottom:10 }}>Excluded from MVP</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
              {["Timetable builder","Fee management / Bursar module","SMS notifications","MoESYI data integration","Native mobile app","BI dashboards","Student self-service portal","Multi-school rollup","CAPE examination management"].map(item => (
                <span key={item} style={{ fontSize:11, color:"#4a5a4a", background:"#0a100a", border:"1px solid #1a2a1a", borderRadius:6, padding:"3px 10px", textDecoration:"line-through" }}>{item}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "principles" && (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {[
            { title:"REST + JSON", icon:"🔧", desc:"All endpoints return JSON. Standard HTTP verbs. Versioned at /v1/. Content-Type: application/json enforced." },
            { title:"Tenant isolation via RLS", icon:"🏫", desc:"The API sets app.tenant_id and app.user_id in the PostgreSQL session context on every request. Row-Level Security enforces tenant boundaries at the DB layer — not just the application layer." },
            { title:"JWT Bearer Authentication", icon:"🔑", desc:"AWS Cognito issues JWTs. All protected endpoints require Authorization: Bearer <token>. Token expiry: 1 hour. Refresh tokens: 30 days. MFA enforced for principal and above." },
            { title:"Role-scoped responses", icon:"👥", desc:"The same endpoint returns different fields depending on the caller's role. A form teacher calling GET /students/:id receives a profile without health data. A principal receives everything." },
            { title:"Idempotent writes", icon:"🔄", desc:"Bulk attendance POST is idempotent — re-submitting the same records is safe (UPSERT semantics). Designed for offline sync scenarios where the client may retry after connection loss." },
            { title:"Audit everything", icon:"📝", desc:"Every write to any student-related resource is logged in audit_logs before the response is returned. The audit log is immutable — even platform admins cannot delete entries." },
            { title:"Pagination & filtering", icon:"📄", desc:"All list endpoints are paginated (default 25, max 100 per page). Filters are query parameters. Sort is column:direction. Total count is returned in meta.total." },
            { title:"Error format", icon:"⚠", desc:`All errors return { error: { code: \"ERROR_CODE\", message: \"Human readable\", field?: \"field_name\" } }. Standard HTTP status codes. 401 = unauthenticated, 403 = forbidden, 404 = not found, 422 = validation error.` },
          ].map(p => (
            <div key={p.title} style={{ background:"#0d1a0e", border:"1px solid #1a3a20", borderRadius:12, padding:16, display:"flex", gap:14 }}>
              <span style={{ fontSize:22, flexShrink:0 }}>{p.icon}</span>
              <div>
                <div style={{ fontSize:13, color:"#c8d8c8", marginBottom:6 }}>{p.title}</div>
                <div style={{ fontSize:12, color:"#5a8a6a", lineHeight:1.7 }}>{p.desc}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
