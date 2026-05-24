export const RISK: Record<string, { c: string; bg: string; border: string; label: string; icon: string }> = {
  stable:  { c:"#5dba80", bg:"#0d2010", border:"#2d5e3a", label:"Stable",   icon:"✓" },
  watch:   { c:"#d4c040", bg:"#201e08", border:"#5a5010", label:"Watch",    icon:"◉" },
  warning: { c:"#d4904a", bg:"#201408", border:"#6a3a10", label:"At Risk",  icon:"▲" },
  critical:{ c:"#e05050", bg:"#200808", border:"#6a1010", label:"Critical", icon:"⚠" },
};

export const ALERT_C: Record<string, { c: string; b: string; icon: string }> = {
  info:    { c:"#5dba80", b:"#1a3a20", icon:"ℹ" },
  watch:   { c:"#d4c040", b:"#3a3a08", icon:"◉" },
  warning: { c:"#d4904a", b:"#4a2808", icon:"▲" },
  critical:{ c:"#e05050", b:"#4a0808", icon:"⚠" },
};

export const SUBJ_C: Record<string, string> = {
  "English Language":"#5dba80",
  "Mathematics":"#a07ada",
  "Science":"#4a9fd4",
  "Social Studies":"#d4904a",
  "History":"#d4c040",
  "Geography":"#4ac4b0",
  "Spanish":"#d46a8a",
  "Physical Education":"#80d4a0",
  "Technical Drawing":"#6aa0d4",
  "Woodwork":"#d4a06a",
  "Information Technology":"#a0a0d4",
  "Visual Arts":"#d480a0",
};

export const NAV_ITEMS = [
  { id:"dashboard",     icon:"⊞", label:"Dashboard" },
  { id:"students",      icon:"👥", label:"Students" },
  { id:"attendance",    icon:"📅", label:"Attendance" },
  { id:"academic",      icon:"📊", label:"Academic" },
  { id:"learning",      icon:"🧠", label:"Learning Profile" },
  { id:"behaviour",     icon:"📋", label:"Behaviour" },
  { id:"interventions", icon:"🛠", label:"Interventions" },
  { id:"alerts",        icon:"🔔", label:"Alerts" },
  { id:"reports",       icon:"📄", label:"Reports" },
  { id:"documents",     icon:"🗂", label:"Documents" },
];

export const EXT_NAV_ITEMS = [
  { id:"schema",   icon:"🗄", label:"Database Schema" },
  { id:"billing",  icon:"💳", label:"Billing Model" },
  { id:"api",      icon:"🔌", label:"API Design" },
  { id:"policies", icon:"📜", label:"MoESYI Policies" },
];

export const gradeColor = (s: number) => s >= 70 ? "#5dba80" : s >= 50 ? "#d4a040" : "#e05050";
