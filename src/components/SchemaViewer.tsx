import { useState } from "react";

const DOMAINS: Record<string, { label: string; color: string; bg: string }> = {
  tenant:       { label:"Tenant & Auth",      color:"#4a9fd4", bg:"#0a1e2e" },
  student:      { label:"Student Core",       color:"#5dba80", bg:"#0a1e12" },
  academic:     { label:"Academic",           color:"#a07ada", bg:"#160e2e" },
  attendance:   { label:"Attendance",         color:"#d4904a", bg:"#2e1a08" },
  behaviour:    { label:"Behaviour",          color:"#d45050", bg:"#2e0808" },
  learning:     { label:"Learning & IEP",     color:"#d4c040", bg:"#2e2808" },
  intervention: { label:"Interventions",      color:"#4ac4b0", bg:"#082e2a" },
  alerts:       { label:"Alerts & Rules",     color:"#d480a0", bg:"#2e0820" },
  documents:    { label:"Documents",          color:"#9aa0d4", bg:"#10102e" },
  audit:        { label:"Audit & Compliance", color:"#808080", bg:"#181818" },
};

const TABLES = [
  { name:"tenants", domain:"tenant", description:"One record per school. Root of all multi-tenant isolation.", sensitive:false,
    columns:[
      {name:"id",type:"UUID",pk:true,nullable:false,notes:"Primary key"},
      {name:"school_name",type:"VARCHAR(200)",nullable:false,notes:"Full legal name of the school"},
      {name:"short_name",type:"VARCHAR(50)",nullable:false,notes:"Display name / abbreviation"},
      {name:"school_type",type:"ENUM",nullable:false,notes:"traditional_high | technical | all_age | primary | infant"},
      {name:"parish",type:"VARCHAR(50)",nullable:false,notes:"One of 14 Jamaican parishes"},
      {name:"address",type:"TEXT",nullable:false,notes:""},
      {name:"location_type",type:"ENUM",nullable:false,notes:"urban | semi_urban | rural | remote"},
      {name:"principal_name",type:"VARCHAR(100)",nullable:true,notes:""},
      {name:"subscription_tier",type:"ENUM",nullable:false,notes:"seed | basic | standard | premium | enterprise"},
      {name:"subscription_status",type:"ENUM",nullable:false,notes:"active | suspended | trial | cancelled"},
      {name:"trial_ends_at",type:"TIMESTAMPTZ",nullable:true,notes:""},
      {name:"timezone",type:"VARCHAR(50)",nullable:false,default:"America/Jamaica",notes:""},
      {name:"created_at",type:"TIMESTAMPTZ",nullable:false,default:"NOW()",notes:""},
      {name:"deleted_at",type:"TIMESTAMPTZ",nullable:true,notes:"Soft delete — DPA compliant data lifecycle"},
    ],
    indexes:["parish","subscription_status","moe_school_id"],
    rls:"Tenant table is accessible only by platform admins. No school user sees another school's record.",
  },
  { name:"users", domain:"tenant", description:"All system users — teachers, principals, counsellors, parents, platform admins.", sensitive:false,
    columns:[
      {name:"id",type:"UUID",pk:true,nullable:false,notes:""},
      {name:"tenant_id",type:"UUID",fk:"tenants.id",nullable:true,notes:"NULL for platform admins only"},
      {name:"email",type:"VARCHAR(200)",nullable:false,unique:true,notes:""},
      {name:"first_name",type:"VARCHAR(100)",nullable:false,notes:""},
      {name:"last_name",type:"VARCHAR(100)",nullable:false,notes:""},
      {name:"cognito_sub",type:"VARCHAR(100)",nullable:false,unique:true,notes:"AWS Cognito subject ID"},
      {name:"is_active",type:"BOOLEAN",nullable:false,default:"true",notes:""},
      {name:"mfa_enabled",type:"BOOLEAN",nullable:false,default:"false",notes:""},
      {name:"created_at",type:"TIMESTAMPTZ",nullable:false,default:"NOW()",notes:""},
      {name:"deleted_at",type:"TIMESTAMPTZ",nullable:true,notes:""},
    ],
    indexes:["tenant_id","email","cognito_sub","is_active"],
    rls:"Users can only see other users within their own tenant_id. Platform admins see all.",
  },
  { name:"students", domain:"student", description:"Core student record. Central entity — most other tables reference this.", sensitive:false,
    columns:[
      {name:"id",type:"UUID",pk:true,nullable:false,notes:""},
      {name:"tenant_id",type:"UUID",fk:"tenants.id",nullable:false,notes:""},
      {name:"student_number",type:"VARCHAR(30)",nullable:false,unique:true,notes:"School-issued ID e.g. ARD-2022-0341"},
      {name:"first_name",type:"VARCHAR(100)",nullable:false,notes:""},
      {name:"last_name",type:"VARCHAR(100)",nullable:false,notes:""},
      {name:"dob",type:"DATE",nullable:false,notes:""},
      {name:"gender",type:"ENUM",nullable:false,notes:"male | female | other | prefer_not_to_say"},
      {name:"parish",type:"VARCHAR(50)",nullable:false,notes:""},
      {name:"current_form",type:"SMALLINT",nullable:false,notes:"1-5"},
      {name:"admission_date",type:"DATE",nullable:false,notes:""},
      {name:"status",type:"ENUM",nullable:false,notes:"active | transferred | graduated | withdrawn | deceased"},
      {name:"data_consent_given",type:"BOOLEAN",nullable:false,default:"false",notes:"DPA: parental consent for data processing"},
      {name:"created_at",type:"TIMESTAMPTZ",nullable:false,notes:""},
      {name:"deleted_at",type:"TIMESTAMPTZ",nullable:true,notes:"Soft delete. Hard delete scheduled per retention policy."},
    ],
    indexes:["tenant_id","student_number","current_form","parish","status"],
    rls:"ALL queries automatically filtered by tenant_id via RLS policy. Users further restricted by role scope.",
  },
  { name:"student_health", domain:"student", description:"Sensitive health data. Special category under DPA — requires explicit consent.", sensitive:true,
    columns:[
      {name:"id",type:"UUID",pk:true,nullable:false,notes:""},
      {name:"tenant_id",type:"UUID",fk:"tenants.id",nullable:false,notes:""},
      {name:"student_id",type:"UUID",fk:"students.id",nullable:false,unique:true,notes:""},
      {name:"blood_type",type:"VARCHAR(5)",nullable:true,notes:""},
      {name:"allergies",type:"TEXT[]",nullable:true,notes:""},
      {name:"conditions",type:"TEXT[]",nullable:true,notes:"Stored encrypted at rest"},
      {name:"medications",type:"TEXT[]",nullable:true,notes:"Stored encrypted at rest"},
      {name:"medical_notes",type:"TEXT",nullable:true,notes:"Encrypted — accessible only by principal"},
      {name:"last_medical_date",type:"DATE",nullable:true,notes:""},
    ],
    indexes:["tenant_id","student_id"],
    rls:"Accessible only to principal and users with explicit health_data permission. Encrypted columns use pgcrypto.",
  },
  { name:"grades", domain:"academic", description:"Assessment results per student per class per term. Core academic record.", sensitive:false,
    columns:[
      {name:"id",type:"UUID",pk:true,nullable:false,notes:""},
      {name:"tenant_id",type:"UUID",fk:"tenants.id",nullable:false,notes:""},
      {name:"student_id",type:"UUID",fk:"students.id",nullable:false,notes:""},
      {name:"class_id",type:"UUID",fk:"classes.id",nullable:false,notes:""},
      {name:"term_id",type:"UUID",fk:"terms.id",nullable:false,notes:""},
      {name:"assessment_type",type:"ENUM",nullable:false,notes:"classwork | homework | test | exam | project | oral | practical"},
      {name:"score",type:"NUMERIC(5,2)",nullable:true,notes:""},
      {name:"max_score",type:"NUMERIC(5,2)",nullable:false,notes:""},
      {name:"percentage",type:"NUMERIC(5,2)",nullable:true,notes:"Computed: (score/max_score)*100"},
      {name:"term_average",type:"NUMERIC(5,2)",nullable:true,notes:"Computed term aggregate — materialised"},
      {name:"entered_by",type:"UUID",fk:"users.id",nullable:false,notes:""},
      {name:"entered_at",type:"TIMESTAMPTZ",nullable:false,notes:""},
    ],
    indexes:["tenant_id","student_id","class_id","term_id"],
    rls:"Teachers read/write only grades in their own classes. Principals read all. Parents read only their child's grades.",
  },
  { name:"attendance_records", domain:"attendance", description:"Daily attendance record per student per session. Offline writes queue here via sync.", sensitive:false,
    columns:[
      {name:"id",type:"UUID",pk:true,nullable:false,notes:""},
      {name:"tenant_id",type:"UUID",fk:"tenants.id",nullable:false,notes:""},
      {name:"student_id",type:"UUID",fk:"students.id",nullable:false,notes:""},
      {name:"date",type:"DATE",nullable:false,notes:""},
      {name:"status",type:"ENUM",nullable:false,notes:"present | absent | late | excused | suspended"},
      {name:"recorded_by",type:"UUID",fk:"users.id",nullable:false,notes:""},
      {name:"recorded_at",type:"TIMESTAMPTZ",nullable:false,notes:""},
      {name:"synced_at",type:"TIMESTAMPTZ",nullable:true,notes:"NULL = recorded offline, not yet synced"},
      {name:"is_offline_entry",type:"BOOLEAN",nullable:false,default:"false",notes:""},
      {name:"conflict_flag",type:"BOOLEAN",nullable:false,default:"false",notes:"Set if offline/online conflict detected on sync"},
    ],
    indexes:["tenant_id","student_id","date","status"],
    rls:"Form teachers record for their form. Subject teachers record for their class period. Principals read all.",
    unique_constraint:"(tenant_id, student_id, session_id, date)",
  },
  { name:"behaviour_incidents", domain:"behaviour", description:"All behaviour events — positive recognitions and disciplinary incidents.", sensitive:false,
    columns:[
      {name:"id",type:"UUID",pk:true,nullable:false,notes:""},
      {name:"tenant_id",type:"UUID",fk:"tenants.id",nullable:false,notes:""},
      {name:"student_id",type:"UUID",fk:"students.id",nullable:false,notes:""},
      {name:"incident_date",type:"DATE",nullable:false,notes:""},
      {name:"type",type:"ENUM",nullable:false,notes:"positive | minor | major | critical"},
      {name:"category",type:"VARCHAR(80)",nullable:false,notes:"truancy | disruptive | bullying | violence | positive_achievement | other"},
      {name:"description",type:"TEXT",nullable:false,notes:""},
      {name:"reported_by",type:"UUID",fk:"users.id",nullable:false,notes:""},
      {name:"action_taken",type:"TEXT",nullable:true,notes:""},
      {name:"suspension_days",type:"SMALLINT",nullable:true,notes:""},
      {name:"parent_notified",type:"BOOLEAN",nullable:false,default:"false",notes:""},
    ],
    indexes:["tenant_id","student_id","incident_date","type"],
    rls:"Teachers create incidents. Counsellors see only when flag_counsellor = true. Principals see all.",
  },
  { name:"iep_plans", domain:"learning", description:"Individual Education Plans. Each plan has a review cycle and is linked to specific accommodations.", sensitive:true,
    columns:[
      {name:"id",type:"UUID",pk:true,nullable:false,notes:""},
      {name:"tenant_id",type:"UUID",fk:"tenants.id",nullable:false,notes:""},
      {name:"student_id",type:"UUID",fk:"students.id",nullable:false,notes:""},
      {name:"status",type:"ENUM",nullable:false,notes:"draft | active | under_review | expired"},
      {name:"goals",type:"TEXT",nullable:false,notes:""},
      {name:"review_date",type:"DATE",nullable:false,notes:""},
      {name:"created_by",type:"UUID",fk:"users.id",nullable:false,notes:""},
      {name:"parent_acknowledged",type:"BOOLEAN",nullable:false,default:"false",notes:""},
    ],
    indexes:["tenant_id","student_id","status"],
    rls:"Principal and form teacher access. Counsellor access when behaviour flag exists.",
  },
  { name:"interventions", domain:"intervention", description:"Support measures logged against a student.", sensitive:false,
    columns:[
      {name:"id",type:"UUID",pk:true,nullable:false,notes:""},
      {name:"tenant_id",type:"UUID",fk:"tenants.id",nullable:false,notes:""},
      {name:"student_id",type:"UUID",fk:"students.id",nullable:false,notes:""},
      {name:"type",type:"VARCHAR(100)",nullable:false,notes:"remediation | counselling | parent_meeting | referral | iep | external | other"},
      {name:"description",type:"TEXT",nullable:false,notes:""},
      {name:"trigger",type:"ENUM",nullable:true,notes:"attendance | academic | behaviour | learning | alert | proactive"},
      {name:"provider",type:"VARCHAR(150)",nullable:false,notes:""},
      {name:"start_date",type:"DATE",nullable:false,notes:""},
      {name:"status",type:"ENUM",nullable:false,notes:"planned | active | completed | cancelled"},
      {name:"outcome",type:"ENUM",nullable:true,notes:"positive | improving | moderate | slow_progress | no_change | awaiting"},
    ],
    indexes:["tenant_id","student_id","status"],
    rls:"Principal sees all. Counsellor sees interventions they initiated. Subject teachers cannot see.",
  },
  { name:"alerts", domain:"alerts", description:"Alert instances generated by the rules engine or manually raised.", sensitive:false,
    columns:[
      {name:"id",type:"UUID",pk:true,nullable:false,notes:""},
      {name:"tenant_id",type:"UUID",fk:"tenants.id",nullable:false,notes:""},
      {name:"student_id",type:"UUID",fk:"students.id",nullable:false,notes:""},
      {name:"rule_id",type:"UUID",fk:"alert_rules.id",nullable:true,notes:"NULL if manually raised"},
      {name:"severity",type:"ENUM",nullable:false,notes:"info | watch | warning | critical"},
      {name:"domain",type:"ENUM",nullable:false,notes:"attendance | academic | behaviour | learning | intervention"},
      {name:"message",type:"TEXT",nullable:false,notes:""},
      {name:"recommended_action",type:"TEXT",nullable:true,notes:""},
      {name:"raised_by",type:"ENUM",nullable:false,notes:"system | manual"},
      {name:"raised_at",type:"TIMESTAMPTZ",nullable:false,notes:""},
      {name:"resolved",type:"BOOLEAN",nullable:false,default:"false",notes:""},
    ],
    indexes:["tenant_id","student_id","severity","resolved"],
    rls:"Principals see all. Form teachers see alerts for their form.",
  },
  { name:"audit_logs", domain:"audit", description:"Immutable audit trail. Every data read, write, and delete is logged. DPA obligation.", sensitive:false,
    columns:[
      {name:"id",type:"UUID",pk:true,nullable:false,notes:""},
      {name:"tenant_id",type:"UUID",nullable:true,notes:""},
      {name:"user_id",type:"UUID",nullable:false,notes:""},
      {name:"action",type:"ENUM",nullable:false,notes:"read | create | update | delete | export | login | logout | failed_login"},
      {name:"resource",type:"VARCHAR(50)",nullable:false,notes:"Table/entity name"},
      {name:"resource_id",type:"UUID",nullable:true,notes:""},
      {name:"ip_address",type:"INET",nullable:true,notes:""},
      {name:"old_values",type:"JSONB",nullable:true,notes:"Previous state before update/delete"},
      {name:"new_values",type:"JSONB",nullable:true,notes:"New state after update/create"},
      {name:"created_at",type:"TIMESTAMPTZ",nullable:false,notes:""},
    ],
    indexes:["tenant_id","user_id","resource","action","created_at"],
    rls:"Read-only. Only platform admins can query. No UPDATE or DELETE permitted.",
  },
];

const RBAC_MATRIX = {
  resources:["Student Profile","Guardian Contacts","Health Records","Attendance","Grades","Learning Profile","IEP","Behaviour Incidents","Counsellor Flags","Interventions","Alerts","Documents","Users & Roles","Audit Logs","Reports"],
  roles:[
    { name:"Platform Admin",    short:"Plt",  color:"#808080" },
    { name:"Principal",         short:"Pri",  color:"#5dba80" },
    { name:"Vice Principal",    short:"VP",   color:"#4aaa70" },
    { name:"Form Teacher",      short:"FT",   color:"#4a9fd4" },
    { name:"Subject Teacher",   short:"ST",   color:"#a07ada" },
    { name:"Counsellor",        short:"Csl",  color:"#d4c040" },
    { name:"Bursar / Admin",    short:"Bur",  color:"#d4904a" },
    { name:"Parent / Guardian", short:"Par",  color:"#d46a8a" },
  ],
  permissions:[
    ["Student Profile",     "CRUD","CRUD","CRU","R",   "—",    "R*",   "R",   "R*"],
    ["Guardian Contacts",   "CRUD","CRUD","CRU","R",   "—",    "R",    "R",   "R*"],
    ["Health Records",      "CRUD","CRUD","R",  "—",   "—",    "—",    "—",   "R*"],
    ["Attendance",          "CRUD","CRUD","CRUD","CRU","CRU*", "R*",   "—",   "R*"],
    ["Grades",              "CRUD","CRUD","R",  "CRU*","CRU*", "—",    "—",   "R*"],
    ["Learning Profile",    "CRUD","CRUD","R",  "R*",  "—",    "R*",   "—",   "—" ],
    ["IEP",                 "CRUD","CRUD","CRU","R*",  "—",    "R*",   "—",   "R*"],
    ["Behaviour Incidents", "CRUD","CRUD","CRUD","CRU","—",    "R*",   "—",   "R*"],
    ["Counsellor Flags",    "CRUD","CRUD","CRU","CR",  "—",    "CRUD*","—",   "—" ],
    ["Interventions",       "CRUD","CRUD","R",  "—",   "—",    "CRUD*","—",   "R*"],
    ["Alerts",              "CRUD","CRUD","CRUD","R*", "—",    "R*",   "—",   "R*"],
    ["Documents",           "CRUD","CRUD","CRU","R*",  "—",    "R*",   "R",   "R*"],
    ["Users & Roles",       "CRUD","CRUD","R",  "—",   "—",    "—",    "—",   "—" ],
    ["Audit Logs",          "R",   "—",   "—",  "—",   "—",    "—",    "—",   "—" ],
    ["Reports",             "RE",  "RE",  "RE", "R*",  "—",    "R*",   "R*",  "R*"],
  ],
};

const ALERT_RULES = [
  { domain:"Attendance", severity:"watch",    trigger:"Attendance rate drops below 85% in any 4-week rolling window",                                     action:"Notify form teacher", auto_flag:false },
  { domain:"Attendance", severity:"warning",  trigger:"Attendance rate drops below 75%",                                                                   action:"Notify principal + form teacher", auto_flag:false },
  { domain:"Attendance", severity:"critical", trigger:"Attendance rate drops below 65% OR 3+ consecutive unexplained absences",                            action:"Notify principal, contact guardian, consider social work referral", auto_flag:false },
  { domain:"Academic",   severity:"watch",    trigger:"Any subject score below 50% for 2 consecutive terms",                                               action:"Notify subject teacher + form teacher", auto_flag:false },
  { domain:"Academic",   severity:"warning",  trigger:"Any subject score below 40% OR declining trend across 3 terms",                                     action:"Notify principal, initiate remediation referral", auto_flag:false },
  { domain:"Academic",   severity:"critical", trigger:"Any subject score below 30% OR declining trend across all subjects 4+ terms",                       action:"Emergency meeting: principal, counsellor, parent, HOD", auto_flag:true },
  { domain:"Behaviour",  severity:"watch",    trigger:"2 minor incidents within one term",                                                                 action:"Notify form teacher + counsellor", auto_flag:true },
  { domain:"Behaviour",  severity:"warning",  trigger:"1 major incident OR 4 minor incidents within one term",                                            action:"Notify principal, parent conference", auto_flag:true },
  { domain:"Behaviour",  severity:"critical", trigger:"Physical violence, safeguarding concern, or criminal matter",                                       action:"Immediate principal escalation, external referral if required", auto_flag:true },
  { domain:"Learning",   severity:"info",     trigger:"Student has active IEP with no review in 6+ months",                                               action:"Notify principal + form teacher", auto_flag:false },
  { domain:"Composite",  severity:"critical", trigger:"Student triggered alerts in 3+ domains simultaneously",                                             action:"Full student review meeting — all stakeholders", auto_flag:true },
];

const RLS_POLICIES = [
  {
    policy:"tenant_isolation", table:"All student-scoped tables",
    sql:`CREATE POLICY tenant_isolation ON students
  USING (tenant_id = current_setting('app.tenant_id')::uuid);`,
    notes:"Applied to: students, grades, attendance_records, behaviour_incidents, interventions, alerts, documents, iep_plans, student_health, and all other tenant-scoped tables.",
  },
  {
    policy:"teacher_own_classes_grades", table:"grades",
    sql:`CREATE POLICY teacher_class_scope ON grades
  USING (
    tenant_id = current_setting('app.tenant_id')::uuid
    AND (
      current_setting('app.role') = 'principal'
      OR class_id IN (
        SELECT id FROM classes
        WHERE teacher_id = current_setting('app.user_id')::uuid
      )
    )
  );`,
    notes:"Subject teachers only see grade rows for classes they teach. Principals bypass the class filter.",
  },
  {
    policy:"counsellor_flagged_access", table:"behaviour_incidents, student_learning_profiles, iep_plans, interventions",
    sql:`CREATE POLICY counsellor_flag_access ON behaviour_incidents
  USING (
    tenant_id = current_setting('app.tenant_id')::uuid
    AND (
      current_setting('app.role') IN ('principal','vice_principal')
      OR (
        current_setting('app.role') = 'counsellor'
        AND student_id IN (
          SELECT student_id FROM counsellor_flags
          WHERE assigned_to = current_setting('app.user_id')::uuid
          AND status != 'resolved'
        )
      )
    )
  );`,
    notes:"Counsellors only access student data when an active flag exists and is assigned to them.",
  },
  {
    policy:"parent_own_child_only", table:"students, grades, attendance_records, alerts",
    sql:`CREATE POLICY parent_child_scope ON students
  USING (
    tenant_id = current_setting('app.tenant_id')::uuid
    AND (
      current_setting('app.role') != 'parent'
      OR id IN (
        SELECT student_id FROM student_guardians
        WHERE user_id = current_setting('app.user_id')::uuid
      )
    )
  );`,
    notes:"Parents are filtered to only their own children via the student_guardians relationship.",
  },
  {
    policy:"audit_log_immutable", table:"audit_logs",
    sql:`-- No UPDATE or DELETE permitted on audit_logs
CREATE RULE no_update_audit AS ON UPDATE TO audit_logs DO INSTEAD NOTHING;
CREATE RULE no_delete_audit AS ON DELETE TO audit_logs DO INSTEAD NOTHING;

-- Read policy: platform admins only
CREATE POLICY audit_admin_only ON audit_logs
  USING (current_setting('app.role') = 'platform_admin');`,
    notes:"Audit logs are append-only. Neither school admins nor principals can read, update, or delete them.",
  },
];

const COMPLIANCE = [
  {
    law:"Jamaica Data Protection Act (DPA) 2020", icon:"🇯🇲", color:"#5dba80",
    items:[
      ["Lawful basis for processing","School-parent contract + explicit consent form at enrolment. Tracked in students.data_consent_given with timestamp.","✓"],
      ["Special category data","Health, learning challenges, and behavioural data stored encrypted. Column-level encryption via pgcrypto + AWS KMS.","✓"],
      ["Data subject rights","data_requests table tracks access, rectification, erasure, and portability requests. 30-day SLA enforced.","✓"],
      ["Data retention","Academic records: 7 years post-graduation. Health records: 3 years post-departure. Automated deletion jobs.","✓"],
      ["Data Protection Officer","DPO role defined in company org structure. Contact published in privacy policy.","Required"],
    ],
  },
  {
    law:"ISO 27001 — Information Security", icon:"🔒", color:"#4a9fd4",
    items:[
      ["Access control","RBAC enforced at application and database layer. Principle of least privilege. All access logged.","✓"],
      ["Cryptography","TLS 1.3 in transit. AES-256 at rest (AWS default). Column-level encryption for sensitive fields.","✓"],
      ["Business continuity","RDS automated backups (daily, 30-day retention). Multi-AZ deployment for production. RTO: 4 hours.","✓"],
    ],
  },
  {
    law:"OWASP Top 10 — Application Security", icon:"🛡", color:"#a07ada",
    items:[
      ["Broken Access Control","RBAC + RLS enforced at both app and DB layers. Direct object reference uses UUIDs.","✓"],
      ["SQL Injection","Parameterised queries only (ORM enforced). No raw SQL with user input.","✓"],
      ["Sensitive Data Exposure","No PII in logs. No sensitive data in URLs. S3 documents via pre-signed URLs with 15-minute TTL.","✓"],
    ],
  },
];

const PERM_COLORS: Record<string, string> = { C:"#4a9fd4", R:"#5dba80", U:"#d4c040", D:"#e05050", E:"#d4904a", "—":"#1a2a1a", "*":"#a07ada" };

function PermBadge({ val }: { val: string }) {
  if (val === "—") return <span style={{ color:"#2a4a2a", fontSize:13 }}>—</span>;
  if (val === "CRUD") return <span style={{ fontSize:11, color:"#5dba80", background:"#0d2010", border:"1px solid #2d5e3a", borderRadius:4, padding:"1px 5px", fontFamily:"monospace" }}>CRUD</span>;
  const cond = val.includes("*");
  const parts = val.replace("*","").split("");
  return (
    <span style={{ display:"inline-flex", gap:2, alignItems:"center" }}>
      {parts.map(p => <span key={p} style={{ fontSize:10, color:PERM_COLORS[p] || "#5dba80", background:`${PERM_COLORS[p] || "#5dba80"}22`, borderRadius:3, padding:"1px 4px", fontFamily:"monospace" }}>{p}</span>)}
      {cond && <span style={{ fontSize:9, color:"#a07ada" }} title="Conditional">*</span>}
    </span>
  );
}

export default function SchemaViewer() {
  const [tab, setTab]             = useState("schema");
  const [domainFilter, setDomainFilter] = useState("all");
  const [search, setSearch]       = useState("");

  const filteredTables = TABLES.filter(t => {
    if (domainFilter !== "all" && t.domain !== domainFilter) return false;
    if (search && !t.name.includes(search.toLowerCase()) && !t.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const MAIN_TABS = [
    { id:"schema",     label:"Database Schema",   count:`${TABLES.length} tables` },
    { id:"rbac",       label:"RBAC Model",         count:`${RBAC_MATRIX.roles.length} roles` },
    { id:"rls",        label:"Row-Level Security",  count:"" },
    { id:"alerts",     label:"Alert Rules Engine",  count:`${ALERT_RULES.length} rules` },
    { id:"compliance", label:"DPA Compliance Map",  count:"" },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
      {/* Sub-tabs */}
      <div style={{ display:"flex", gap:2, borderBottom:"1px solid #1a3a20", marginBottom:20, overflowX:"auto" }}>
        {MAIN_TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding:"7px 16px", background:tab === t.id ? "#0d2010" : "transparent", border:"none", borderBottom:tab === t.id ? "2px solid #2d7a4f" : "2px solid transparent", color:tab === t.id ? "#5dba80" : "#3a6a4a", fontSize:12, cursor:"pointer", fontFamily:"Georgia,serif", marginBottom:-1, whiteSpace:"nowrap" }}>
            {t.label} {t.count && <span style={{ fontSize:10, color:tab === t.id ? "#2d7a4f" : "#2a4a2a" }}>· {t.count}</span>}
          </button>
        ))}
      </div>

      {/* SCHEMA TAB */}
      {tab === "schema" && (
        <div>
          <div style={{ display:"flex", gap:8, marginBottom:20, flexWrap:"wrap" }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tables..." style={{ background:"#0d1a0e", border:"1px solid #1a3a20", borderRadius:8, padding:"8px 12px", color:"#c8d8c8", fontSize:12, outline:"none", fontFamily:"Georgia,serif", width:220 }} />
            <select value={domainFilter} onChange={e => setDomainFilter(e.target.value)} style={{ background:"#0d1a0e", border:"1px solid #1a3a20", borderRadius:8, padding:"8px 12px", color:"#8aaa8a", fontSize:12, fontFamily:"Georgia,serif", outline:"none" }}>
              <option value="all">All Domains</option>
              {Object.entries(DOMAINS).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", alignItems:"center" }}>
              {Object.entries(DOMAINS).map(([k,v]) => (
                <span key={k} onClick={() => setDomainFilter(domainFilter === k ? "all" : k)} style={{ fontSize:10, color:v.color, background:`${v.color}18`, border:`1px solid ${domainFilter === k ? v.color : v.color + "44"}`, borderRadius:20, padding:"2px 8px", cursor:"pointer" }}>{v.label}</span>
              ))}
            </div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {filteredTables.map(t => {
              const d = DOMAINS[t.domain];
              return (
                <div key={t.name} style={{ background:"#09130a", border:`1px solid ${d.color}33`, borderRadius:12, overflow:"hidden" }}>
                  <div style={{ background:d.bg, borderBottom:`1px solid ${d.color}33`, padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8, flexWrap:"wrap" }}>
                    <div>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                        <span style={{ fontFamily:"monospace", fontSize:14, color:d.color, fontWeight:"bold" }}>{t.name}</span>
                        {t.sensitive && <span style={{ fontSize:9, color:"#d45050", background:"#2e0808", border:"1px solid #6a1010", borderRadius:4, padding:"1px 5px" }}>🔒 SENSITIVE</span>}
                      </div>
                      <div style={{ fontSize:12, color:"#5a8a6a", fontStyle:"italic" }}>{t.description}</div>
                    </div>
                    <span style={{ fontSize:10, color:d.color, background:`${d.color}22`, border:`1px solid ${d.color}44`, borderRadius:6, padding:"2px 8px", flexShrink:0 }}>{d.label}</span>
                  </div>
                  <div style={{ overflowX:"auto" }}>
                    <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                      <thead>
                        <tr style={{ background:"#0a1508" }}>
                          {["Column","Type","Constraints","Notes"].map(h => (
                            <th key={h} style={{ padding:"7px 12px", textAlign:"left", color:"#2d5e3a", fontWeight:"normal", fontSize:10, textTransform:"uppercase", letterSpacing:1, borderBottom:"1px solid #0f200f" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {t.columns.map((col: any) => (
                          <tr key={col.name} style={{ borderBottom:"1px solid #0a180a" }}>
                            <td style={{ padding:"7px 12px", fontFamily:"monospace", color:col.pk ? "#d4c040" : col.fk ? "#4a9fd4" : col.unique ? "#d4904a" : "#9abaa4", whiteSpace:"nowrap" }}>
                              {col.pk && <span style={{ fontSize:9, color:"#d4c040", marginRight:4 }}>PK</span>}
                              {col.fk && <span style={{ fontSize:9, color:"#4a9fd4", marginRight:4 }}>FK</span>}
                              {col.unique && !col.pk && <span style={{ fontSize:9, color:"#d4904a", marginRight:4 }}>UQ</span>}
                              {col.name}
                            </td>
                            <td style={{ padding:"7px 12px", fontFamily:"monospace", color:"#7a9a7a", whiteSpace:"nowrap", fontSize:11 }}>{col.type}</td>
                            <td style={{ padding:"7px 12px", whiteSpace:"nowrap" }}>
                              <div style={{ display:"flex", gap:4 }}>
                                {!col.nullable && <span style={{ fontSize:9, color:"#5dba80", background:"#0d2010", borderRadius:3, padding:"1px 4px" }}>NOT NULL</span>}
                                {col.default && <span style={{ fontSize:9, color:"#4a9fd4", background:"#0a1e2e", borderRadius:3, padding:"1px 4px" }}>DEFAULT {col.default}</span>}
                              </div>
                            </td>
                            <td style={{ padding:"7px 12px", color:"#4a7a5a", fontSize:11 }}>
                              {col.fk && <span style={{ color:"#3a6a9a", marginRight:6 }}>→ {col.fk}</span>}
                              {col.notes}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ background:"#0a1508", borderTop:"1px solid #0f200f", padding:"10px 16px", display:"flex", gap:20, flexWrap:"wrap" }}>
                    {t.indexes && <div style={{ fontSize:11 }}><span style={{ color:"#2d5e3a" }}>Indexes: </span><span style={{ color:"#5a8a6a", fontFamily:"monospace" }}>{t.indexes.join(", ")}</span></div>}
                    {(t as any).unique_constraint && <div style={{ fontSize:11 }}><span style={{ color:"#2d5e3a" }}>Unique: </span><span style={{ color:"#5a8a6a", fontFamily:"monospace" }}>{(t as any).unique_constraint}</span></div>}
                    {t.rls && <div style={{ fontSize:11, flex:1 }}><span style={{ color:"#2d5e3a" }}>RLS: </span><span style={{ color:"#5a8a6a" }}>{t.rls}</span></div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* RBAC TAB */}
      {tab === "rbac" && (
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:10 }}>
            {RBAC_MATRIX.roles.map(r => (
              <div key={r.name} style={{ background:"#0d1a0e", border:`1px solid ${r.color}44`, borderRadius:10, padding:"12px 14px" }}>
                <div style={{ fontSize:13, color:r.color, marginBottom:4 }}>{r.name}</div>
                <div style={{ fontSize:10, color:"#3a6a4a", fontFamily:"monospace" }}>{r.short}</div>
              </div>
            ))}
          </div>
          <div style={{ background:"#0d1a0e", border:"1px solid #1a3a20", borderRadius:12, overflow:"hidden" }}>
            <div style={{ padding:"12px 16px", borderBottom:"1px solid #1a3a20", fontSize:11, color:"#3a6a4a", textTransform:"uppercase", letterSpacing:2 }}>Permission Matrix</div>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:11 }}>
                <thead>
                  <tr style={{ background:"#091208" }}>
                    <th style={{ padding:"10px 14px", textAlign:"left", color:"#3a6a4a", fontWeight:"normal", fontSize:10, textTransform:"uppercase", borderBottom:"1px solid #1a3a20", minWidth:160 }}>Resource</th>
                    {RBAC_MATRIX.roles.map(r => (
                      <th key={r.name} style={{ padding:"10px 10px", color:r.color, fontWeight:"normal", fontSize:10, textTransform:"uppercase", borderBottom:"1px solid #1a3a20", whiteSpace:"nowrap", minWidth:70, textAlign:"center" }}>{r.short}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {RBAC_MATRIX.permissions.map(([resource, ...perms], i) => (
                    <tr key={resource} style={{ borderBottom:"1px solid #0a180a", background:i % 2 === 0 ? "transparent" : "#091208" }}>
                      <td style={{ padding:"8px 14px", color:"#9abaa4", whiteSpace:"nowrap" }}>{resource}</td>
                      {perms.map((p, j) => <td key={j} style={{ padding:"8px 10px", textAlign:"center" }}><PermBadge val={p} /></td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding:"10px 16px", background:"#091208", borderTop:"1px solid #1a3a20", display:"flex", gap:16, flexWrap:"wrap" }}>
              {([ ["C","Create","#4a9fd4"],["R","Read","#5dba80"],["U","Update","#d4c040"],["D","Delete","#e05050"],["E","Export","#d4904a"],["*","Conditional","#a07ada"],["—","No Access","#2a4a2a"] ] as [string,string,string][]).map(([k,v,c]) => (
                <span key={k} style={{ fontSize:11 }}><span style={{ color:c, fontFamily:"monospace" }}>{k}</span><span style={{ color:"#3a6a4a" }}> = {v}</span></span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* RLS TAB */}
      {tab === "rls" && (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ background:"#0d1a0e", border:"1px solid #1a3a20", borderRadius:12, padding:16 }}>
            <div style={{ fontSize:11, color:"#3a6a4a", textTransform:"uppercase", letterSpacing:2, marginBottom:12 }}>How Row-Level Security Works</div>
            <div style={{ fontSize:13, color:"#7a9a7a", lineHeight:1.8 }}>
              Every table has a <code style={{ background:"#0a1808", color:"#5dba80", borderRadius:4, padding:"1px 5px", fontSize:12 }}>tenant_id</code> column. PostgreSQL RLS policies automatically append a <code style={{ background:"#0a1808", color:"#5dba80", borderRadius:4, padding:"1px 5px", fontSize:12 }}>WHERE tenant_id = current_setting('app.tenant_id')</code> condition to every query — enforced at the database layer, not just the application layer. Even if there is a bug in the API, a query from School A can never return data belonging to School B.
            </div>
          </div>
          {RLS_POLICIES.map(p => (
            <div key={p.policy} style={{ background:"#0d1a0e", border:"1px solid #1a3a20", borderRadius:12, overflow:"hidden" }}>
              <div style={{ background:"#091208", padding:"10px 16px", display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:6 }}>
                <span style={{ fontFamily:"monospace", color:"#5dba80", fontSize:13 }}>{p.policy}</span>
                <span style={{ fontSize:11, color:"#3a6a4a" }}>Table: {p.table}</span>
              </div>
              <pre style={{ margin:0, padding:"14px 16px", background:"#07100a", color:"#7aaa8a", fontSize:11, overflowX:"auto", fontFamily:"'Courier New',monospace", lineHeight:1.6 }}>{p.sql}</pre>
              <div style={{ padding:"8px 16px", fontSize:11, color:"#4a7a5a", borderTop:"1px solid #0a180a" }}>ℹ {p.notes}</div>
            </div>
          ))}
        </div>
      )}

      {/* ALERTS TAB */}
      {tab === "alerts" && (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <div style={{ background:"#0d1a0e", border:"1px solid #1a3a20", borderRadius:12, padding:16, marginBottom:6 }}>
            <div style={{ fontSize:13, color:"#7a9a7a", lineHeight:1.8 }}>
              The rules engine evaluates triggers on a scheduled basis (nightly full sweep + real-time on data writes). When a rule fires, an alert record is inserted and notifications are dispatched to the configured roles.
            </div>
          </div>
          {["Attendance","Academic","Behaviour","Learning","Composite"].map(domain => (
            <div key={domain}>
              <div style={{ fontSize:11, color:"#3a6a4a", textTransform:"uppercase", letterSpacing:2, marginBottom:8, marginTop:4 }}>{domain}</div>
              {ALERT_RULES.filter(r => r.domain === domain).map((r, i) => {
                const sc = ({ info:"#5dba80", watch:"#d4c040", warning:"#d4904a", critical:"#e05050" } as any)[r.severity];
                return (
                  <div key={i} style={{ background:`${sc}08`, border:`1px solid ${sc}33`, borderRadius:10, padding:"12px 16px", marginBottom:8 }}>
                    <div style={{ display:"flex", gap:10, alignItems:"flex-start", flexWrap:"wrap" }}>
                      <span style={{ fontSize:10, color:sc, background:`${sc}22`, border:`1px solid ${sc}55`, borderRadius:4, padding:"2px 8px", flexShrink:0, textTransform:"uppercase" }}>{r.severity}</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:12, color:"#c8d8c8", marginBottom:4 }}>🔍 {r.trigger}</div>
                        <div style={{ fontSize:11, color:"#3a8a5a" }}>→ {r.action}</div>
                        {r.auto_flag && <div style={{ fontSize:10, color:"#d4c040", marginTop:4 }}>⚑ Auto-flags guidance counsellor</div>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* COMPLIANCE TAB */}
      {tab === "compliance" && (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {COMPLIANCE.map(section => (
            <div key={section.law} style={{ background:"#0d1a0e", border:`1px solid ${section.color}33`, borderRadius:12, overflow:"hidden" }}>
              <div style={{ background:`${section.color}0f`, padding:"12px 16px", borderBottom:`1px solid ${section.color}22`, display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:18 }}>{section.icon}</span>
                <span style={{ fontSize:13, color:section.color }}>{section.law}</span>
              </div>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                <tbody>
                  {section.items.map(([req, impl, status]) => (
                    <tr key={req} style={{ borderBottom:"1px solid #0a180a" }}>
                      <td style={{ padding:"10px 14px", color:"#9abaa4", width:"25%", verticalAlign:"top" }}>{req}</td>
                      <td style={{ padding:"10px 14px", color:"#5a8a6a", verticalAlign:"top" }}>{impl}</td>
                      <td style={{ padding:"10px 14px", verticalAlign:"top", whiteSpace:"nowrap" }}>
                        <span style={{ fontSize:11, color:status === "✓" ? "#5dba80" : "#d4c040", background:status === "✓" ? "#0d2010" : "#201e08", border:`1px solid ${status === "✓" ? "#2d5e3a" : "#5a5010"}`, borderRadius:6, padding:"2px 8px" }}>{status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
