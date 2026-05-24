import { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const TIERS = [
  {
    id:"seed", name:"Seed", tagline:"For small and emerging institutions",
    color:"#808080", bg:"#141414", border:"#2a2a2a",
    monthlyUSD:0, annualUSD:0, studentLimit:75, userLimit:5, storageGB:1,
    popular:false, cta:"Start Free",
    features:{ "Student Registry":true, "Guardian Contacts":true, "Attendance Tracking":true, "Grade Entry":true, "Basic Alerts":true, "Behaviour Log":false, "Learning Profiles & IEP":false, "Interventions Log":false, "Counsellor Module":false, "Parent Portal":false, "Document Storage":false, "PDF Report Cards":false, "Advanced Reports":false, "Offline Mode":false, "API Access":false, "Priority Support":false, "Custom Alert Rules":false, "Data Export (CSV)":true },
    limits:"Up to 75 students · 5 staff accounts · 1 GB storage",
    support:"Community forum only",
    notes:"Seed tier is permanent free — not a trial. Designed for small prep schools and early childhood institutions.",
  },
  {
    id:"basic", name:"Basic", tagline:"For small secondary and all-age schools",
    color:"#4a9fd4", bg:"#0a1e2e", border:"#1a4a7a",
    monthlyUSD:99, annualUSD:79, studentLimit:350, userLimit:20, storageGB:10,
    popular:false, cta:"Start 30-Day Trial",
    features:{ "Student Registry":true, "Guardian Contacts":true, "Attendance Tracking":true, "Grade Entry":true, "Basic Alerts":true, "Behaviour Log":true, "Learning Profiles & IEP":true, "Interventions Log":true, "Counsellor Module":false, "Parent Portal":false, "Document Storage":true, "PDF Report Cards":true, "Advanced Reports":false, "Offline Mode":true, "API Access":false, "Priority Support":false, "Custom Alert Rules":false, "Data Export (CSV)":true },
    limits:"Up to 350 students · 20 staff accounts · 10 GB storage",
    support:"Email support (48h response)",
    notes:"Suits rural and semi-urban schools with 1–5 forms. Offline mode critical for areas with unreliable internet.",
  },
  {
    id:"standard", name:"Standard", tagline:"For mid-size traditional and technical high schools",
    color:"#5dba80", bg:"#0a1e12", border:"#1a5a3a",
    monthlyUSD:199, annualUSD:159, studentLimit:750, userLimit:60, storageGB:30,
    popular:true, cta:"Start 30-Day Trial",
    features:{ "Student Registry":true, "Guardian Contacts":true, "Attendance Tracking":true, "Grade Entry":true, "Basic Alerts":true, "Behaviour Log":true, "Learning Profiles & IEP":true, "Interventions Log":true, "Counsellor Module":true, "Parent Portal":true, "Document Storage":true, "PDF Report Cards":true, "Advanced Reports":true, "Offline Mode":true, "API Access":false, "Priority Support":false, "Custom Alert Rules":true, "Data Export (CSV)":true },
    limits:"Up to 750 students · 60 staff accounts · 30 GB storage",
    support:"Email + live chat (24h response)",
    notes:"Most schools in Jamaica fall in this range. Counsellor module and parent portal unlock the full early warning system.",
  },
  {
    id:"premium", name:"Premium", tagline:"For large traditional high schools",
    color:"#a07ada", bg:"#160e2e", border:"#4a2a7a",
    monthlyUSD:349, annualUSD:279, studentLimit:1500, userLimit:150, storageGB:100,
    popular:false, cta:"Start 30-Day Trial",
    features:{ "Student Registry":true, "Guardian Contacts":true, "Attendance Tracking":true, "Grade Entry":true, "Basic Alerts":true, "Behaviour Log":true, "Learning Profiles & IEP":true, "Interventions Log":true, "Counsellor Module":true, "Parent Portal":true, "Document Storage":true, "PDF Report Cards":true, "Advanced Reports":true, "Offline Mode":true, "API Access":true, "Priority Support":true, "Custom Alert Rules":true, "Data Export (CSV)":true },
    limits:"Up to 1,500 students · 150 staff accounts · 100 GB storage",
    support:"Priority email + phone (4h response)",
    notes:"For schools like Campion, Ardenne, Jamaica College. API access allows integration with school website.",
  },
  {
    id:"enterprise", name:"Enterprise", tagline:"Multi-campus groups, school boards & large institutions",
    color:"#d4c040", bg:"#1e1a08", border:"#5a5010",
    monthlyUSD:null, annualUSD:null, studentLimit:null, userLimit:null, storageGB:null,
    popular:false, cta:"Contact Sales",
    features:{ "Student Registry":true, "Guardian Contacts":true, "Attendance Tracking":true, "Grade Entry":true, "Basic Alerts":true, "Behaviour Log":true, "Learning Profiles & IEP":true, "Interventions Log":true, "Counsellor Module":true, "Parent Portal":true, "Document Storage":true, "PDF Report Cards":true, "Advanced Reports":true, "Offline Mode":true, "API Access":true, "Priority Support":true, "Custom Alert Rules":true, "Data Export (CSV)":true },
    limits:"Unlimited students · Unlimited staff · Custom storage · Multi-campus rollup",
    support:"Dedicated account manager + SLA",
    notes:"Custom contract. Includes multi-school dashboard, district-level reporting, white-labelling option.",
  },
];

const ALL_FEATURES = ["Student Registry","Guardian Contacts","Attendance Tracking","Grade Entry","Basic Alerts","Behaviour Log","Learning Profiles & IEP","Interventions Log","Counsellor Module","Parent Portal","Document Storage","PDF Report Cards","Advanced Reports","Offline Mode","API Access","Priority Support","Custom Alert Rules","Data Export (CSV)"];

const ADDONS = [
  { id:"sms", name:"SMS Notifications", desc:"Push attendance alerts and grade updates to parents via SMS.", price:"$29/month", unit:"up to 1,000 SMS/month", icon:"💬" },
  { id:"extra_storage", name:"Extra Storage", desc:"Additional document storage beyond plan limit.", price:"$10/month", unit:"per 20 GB", icon:"💾" },
  { id:"implementation", name:"Implementation Package", desc:"Dedicated onboarding: data migration, staff training (2 sessions), go-live support.", price:"$499 one-time", unit:"per school", icon:"🚀" },
  { id:"training", name:"Additional Training", desc:"Live virtual training session for staff (up to 30 participants).", price:"$149 one-time", unit:"per session", icon:"🎓" },
  { id:"custom_reports", name:"Custom Report Templates", desc:"Bespoke report card or ministry report template built to your school's design.", price:"$299 one-time", unit:"per template", icon:"📄" },
  { id:"data_migration", name:"Historical Data Migration", desc:"We migrate up to 5 years of historical student, attendance, and grade records.", price:"$199 one-time", unit:"per school", icon:"📦" },
];

const BILLING_POLICIES = [
  { q:"How does billing work?", a:"Monthly plans are billed on the 1st of each month via Stripe. Annual plans are billed upfront once per year. All prices are in USD." },
  { q:"What payment methods are accepted?", a:"Visa, Mastercard, and American Express (including Jamaican-issued cards). Bank transfer available for annual plans above $1,500." },
  { q:"Is there a free trial?", a:"Yes — all paid tiers include a 30-day free trial, no credit card required. At the end of the trial, you choose a plan or your account moves to read-only for 14 days." },
  { q:"What happens if we exceed our student limit?", a:"You'll receive an email warning at 90% capacity. At 100%, new enrolments are blocked until you upgrade. We do not charge overage fees." },
  { q:"What happens to our data if we cancel?", a:"Your data is retained for 90 days post-cancellation in read-only mode. You can export all data as CSV/JSON at any time during this window." },
  { q:"Is there a discount for government or NGO schools?", a:"Yes. Schools operating under a government grant or registered NGO receive 20% off Standard and Premium tiers. Contact sales with your documentation." },
];

const REVENUE_SCENARIOS = {
  conservative: [
    { month:"M6",  schools:5,  mrr:720  },
    { month:"M9",  schools:12, mrr:1980 },
    { month:"M12", schools:20, mrr:3600 },
    { month:"M15", schools:30, mrr:5600 },
    { month:"M18", schools:42, mrr:8100 },
    { month:"M24", schools:75, mrr:15200 },
  ],
  moderate: [
    { month:"M6",  schools:10,  mrr:1600  },
    { month:"M9",  schools:25,  mrr:4500  },
    { month:"M12", schools:45,  mrr:8500  },
    { month:"M15", schools:70,  mrr:13800 },
    { month:"M18", schools:100, mrr:20500 },
    { month:"M24", schools:175, mrr:37000 },
  ],
  optimistic: [
    { month:"M6",  schools:20,  mrr:3800  },
    { month:"M9",  schools:50,  mrr:10000 },
    { month:"M12", schools:90,  mrr:18500 },
    { month:"M15", schools:140, mrr:29000 },
    { month:"M18", schools:200, mrr:42000 },
    { month:"M24", schools:330, mrr:72000 },
  ],
};

const MARKET_DATA = [
  { category:"Public Secondary Schools", value:180, color:"#5dba80" },
  { category:"All-Age & Primary",         value:820, color:"#4a9fd4" },
  { category:"Private Schools",           value:200, color:"#a07ada" },
  { category:"Early Childhood",           value:2000,color:"#d4904a" },
];

export default function BillingModel() {
  const [billingCycle, setBillingCycle] = useState<"monthly"|"annual">("monthly");
  const [scenario,     setScenario]     = useState<"conservative"|"moderate"|"optimistic">("moderate");
  const [openFaq,      setOpenFaq]      = useState<number|null>(null);
  const [studentCount, setStudentCount] = useState(400);
  const [tab, setTab] = useState("pricing");

  const recommendedTier = useMemo(() => {
    if (studentCount <= 75) return "seed";
    if (studentCount <= 350) return "basic";
    if (studentCount <= 750) return "standard";
    if (studentCount <= 1500) return "premium";
    return "enterprise";
  }, [studentCount]);

  const revenueData = REVENUE_SCENARIOS[scenario].map(d => ({
    ...d,
    conservative: REVENUE_SCENARIOS.conservative.find(x => x.month === d.month)?.mrr,
    moderate:     REVENUE_SCENARIOS.moderate.find(x => x.month === d.month)?.mrr,
    optimistic:   REVENUE_SCENARIOS.optimistic.find(x => x.month === d.month)?.mrr,
  }));

  const BILLING_TABS = [
    { id:"pricing",  label:"Pricing Tiers" },
    { id:"compare",  label:"Feature Comparison" },
    { id:"addons",   label:"Add-ons" },
    { id:"revenue",  label:"Revenue Model" },
    { id:"faq",      label:"Billing FAQ" },
  ];

  return (
    <div>
      <div style={{ display:"flex", gap:2, borderBottom:"1px solid #1a3a20", marginBottom:20, overflowX:"auto" }}>
        {BILLING_TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding:"7px 16px", background:tab === t.id ? "#0d2010" : "transparent", border:"none", borderBottom:tab === t.id ? "2px solid #2d7a4f" : "2px solid transparent", color:tab === t.id ? "#5dba80" : "#3a6a4a", fontSize:12, cursor:"pointer", fontFamily:"Georgia,serif", marginBottom:-1, whiteSpace:"nowrap" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* PRICING */}
      {tab === "pricing" && (
        <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
          {/* Billing toggle */}
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ display:"flex", background:"#0d1a0e", border:"1px solid #1a3a20", borderRadius:8, overflow:"hidden" }}>
              {(["monthly","annual"] as const).map(c => (
                <button key={c} onClick={() => setBillingCycle(c)} style={{ padding:"6px 16px", background:billingCycle === c ? "#1a4a2a" : "transparent", border:"none", color:billingCycle === c ? "#5dba80" : "#3a6a4a", fontSize:12, cursor:"pointer", fontFamily:"Georgia,serif" }}>
                  {c === "monthly" ? "Monthly" : "Annual (20% off)"}
                </button>
              ))}
            </div>
          </div>

          {/* Calculator */}
          <div style={{ background:"#0d1a0e", border:"1px solid #1a3a20", borderRadius:12, padding:16 }}>
            <div style={{ fontSize:11, color:"#3a6a4a", textTransform:"uppercase", letterSpacing:2, marginBottom:12 }}>School Size Calculator</div>
            <div style={{ display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
              <div style={{ flex:1, minWidth:200 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ fontSize:12, color:"#8aaa8a" }}>Number of students</span>
                  <span style={{ fontSize:14, color:"#5dba80", fontWeight:"bold" }}>{studentCount}</span>
                </div>
                <input type="range" min={10} max={2000} step={10} value={studentCount} onChange={e => setStudentCount(+e.target.value)}
                  style={{ width:"100%", accentColor:"#2d7a4f" }} />
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"#2a5a3a", marginTop:2 }}>
                  <span>10</span><span>500</span><span>1,000</span><span>1,500</span><span>2,000</span>
                </div>
              </div>
              <div style={{ background:"#091208", border:"1px solid #1a3a20", borderRadius:8, padding:"12px 16px", textAlign:"center", flexShrink:0 }}>
                <div style={{ fontSize:11, color:"#3a6a4a", marginBottom:4 }}>Recommended Plan</div>
                {(() => {
                  const t = TIERS.find(t => t.id === recommendedTier)!;
                  const price = billingCycle === "annual" ? t.annualUSD : t.monthlyUSD;
                  return (
                    <>
                      <div style={{ fontSize:16, color:t.color, fontWeight:"bold" }}>{t.name}</div>
                      <div style={{ fontSize:20, color:t.color, marginTop:4 }}>{price === null ? "Custom" : price === 0 ? "Free" : `$${price}/mo`}</div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Tier cards */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:12 }}>
            {TIERS.map(tier => {
              const price = billingCycle === "annual" ? tier.annualUSD : tier.monthlyUSD;
              const isRec = tier.id === recommendedTier;
              return (
                <div key={tier.id} style={{ background:tier.bg, border:`2px solid ${isRec ? tier.color : tier.border}`, borderRadius:12, padding:16, position:"relative" }}>
                  {tier.popular && <div style={{ position:"absolute", top:-10, left:"50%", transform:"translateX(-50%)", background:tier.color, color:"#07100a", fontSize:9, fontWeight:"bold", borderRadius:10, padding:"2px 10px", whiteSpace:"nowrap" }}>MOST POPULAR</div>}
                  {isRec && <div style={{ position:"absolute", top:-10, right:12, background:"#2d7a4f", color:"#fff", fontSize:9, borderRadius:10, padding:"2px 8px" }}>✓ Recommended</div>}
                  <div style={{ fontSize:16, color:tier.color, fontWeight:"bold", marginBottom:4 }}>{tier.name}</div>
                  <div style={{ fontSize:11, color:"#5a8a6a", marginBottom:12 }}>{tier.tagline}</div>
                  <div style={{ marginBottom:14 }}>
                    {price === null ? <div style={{ fontSize:22, color:tier.color }}>Custom</div> : price === 0 ? <div style={{ fontSize:22, color:tier.color }}>Free</div> : (
                      <div style={{ display:"flex", alignItems:"baseline", gap:2 }}>
                        <span style={{ fontSize:11, color:tier.color }}>USD</span>
                        <span style={{ fontSize:26, color:tier.color, fontWeight:"bold" }}>{price}</span>
                        <span style={{ fontSize:11, color:"#4a7a5a" }}>/mo</span>
                      </div>
                    )}
                    {billingCycle === "annual" && tier.monthlyUSD && tier.monthlyUSD > 0 && <div style={{ fontSize:10, color:"#3a6a4a" }}>billed annually · save ${(tier.monthlyUSD - (tier.annualUSD || 0)) * 12}/yr</div>}
                  </div>
                  <div style={{ fontSize:11, color:"#4a7a5a", marginBottom:8 }}>{tier.limits}</div>
                  <div style={{ fontSize:11, color:"#3a6a4a" }}>Support: {tier.support}</div>
                  {tier.notes && <div style={{ fontSize:10, color:"#2a5a3a", marginTop:10, fontStyle:"italic", lineHeight:1.5 }}>{tier.notes}</div>}
                  <button style={{ width:"100%", marginTop:14, padding:"8px 0", background:tier.color + "22", border:`1px solid ${tier.color}55`, borderRadius:8, color:tier.color, fontSize:12, cursor:"pointer", fontFamily:"Georgia,serif" }}>{tier.cta}</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* COMPARE */}
      {tab === "compare" && (
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
            <thead>
              <tr style={{ background:"#091208" }}>
                <th style={{ padding:"12px 16px", textAlign:"left", color:"#3a6a4a", fontWeight:"normal", fontSize:10, textTransform:"uppercase", letterSpacing:1, borderBottom:"1px solid #1a3a20" }}>Feature</th>
                {TIERS.map(t => (
                  <th key={t.id} style={{ padding:"12px 12px", color:t.color, fontWeight:"normal", borderBottom:"1px solid #1a3a20", textAlign:"center", minWidth:90 }}>
                    <div style={{ fontSize:13, fontWeight:"bold" }}>{t.name}</div>
                    <div style={{ fontSize:10, color:"#3a6a4a" }}>{t.monthlyUSD === null ? "Custom" : t.monthlyUSD === 0 ? "Free" : `$${t.monthlyUSD}/mo`}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ALL_FEATURES.map((feat, i) => (
                <tr key={feat} style={{ borderBottom:"1px solid #0a180a", background:i % 2 === 0 ? "transparent" : "#091208" }}>
                  <td style={{ padding:"9px 16px", color:"#9abaa4" }}>{feat}</td>
                  {TIERS.map(t => (
                    <td key={t.id} style={{ padding:"9px 12px", textAlign:"center" }}>
                      {(t.features as any)[feat] === true
                        ? <span style={{ color:t.color, fontSize:14 }}>✓</span>
                        : <span style={{ color:"#1a3a24", fontSize:14 }}>—</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ADDONS */}
      {tab === "addons" && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:14 }}>
          {ADDONS.map(a => (
            <div key={a.id} style={{ background:"#0d1a0e", border:"1px solid #1a3a20", borderRadius:12, padding:16 }}>
              <div style={{ display:"flex", gap:10, marginBottom:10 }}>
                <span style={{ fontSize:20 }}>{a.icon}</span>
                <div>
                  <div style={{ fontSize:13, color:"#c8d8c8" }}>{a.name}</div>
                  <div style={{ fontSize:11, color:"#3a6a4a" }}>{a.unit}</div>
                </div>
              </div>
              <div style={{ fontSize:12, color:"#7a9a7a", marginBottom:12, lineHeight:1.6 }}>{a.desc}</div>
              <div style={{ fontSize:16, color:"#5dba80", fontWeight:"bold" }}>{a.price}</div>
            </div>
          ))}
        </div>
      )}

      {/* REVENUE */}
      {tab === "revenue" && (
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div style={{ display:"flex", gap:8 }}>
            {(["conservative","moderate","optimistic"] as const).map(s => (
              <button key={s} onClick={() => setScenario(s)} style={{ padding:"5px 14px", background:scenario === s ? "#1a4a2a" : "#0d1a0e", border:`1px solid ${scenario === s ? "#2d7a4f" : "#1a3a20"}`, borderRadius:6, color:scenario === s ? "#5dba80" : "#3a6a4a", fontSize:12, cursor:"pointer", fontFamily:"Georgia,serif", textTransform:"capitalize" }}>{s}</button>
            ))}
          </div>
          <div style={{ background:"#0d1a0e", border:"1px solid #1a3a20", borderRadius:12, padding:16 }}>
            <div style={{ fontSize:11, color:"#3a6a4a", textTransform:"uppercase", letterSpacing:2, marginBottom:12 }}>MRR Projection (USD) — All Scenarios</div>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={revenueData} margin={{ top:4, right:20, bottom:0, left:10 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#1a3a20" />
                <XAxis dataKey="month" tick={{ fill:"#4a7a5a", fontSize:10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:"#4a7a5a", fontSize:10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v >= 1000 ? `${v/1000}k` : v}`} />
                <Tooltip contentStyle={{ background:"#0d1f10", border:"1px solid #2d5e3a", fontSize:11, fontFamily:"Georgia,serif" }} formatter={(v: any) => [`$${v.toLocaleString()}`, ""]} />
                <Line type="monotone" dataKey="conservative" stroke="#4a9fd4" strokeWidth={1.5} dot={false} name="Conservative" />
                <Line type="monotone" dataKey="moderate"     stroke="#5dba80" strokeWidth={2}   dot={false} name="Moderate" />
                <Line type="monotone" dataKey="optimistic"   stroke="#d4c040" strokeWidth={1.5} dot={false} name="Optimistic" />
              </LineChart>
            </ResponsiveContainer>
            <div style={{ display:"flex", gap:16, marginTop:8 }}>
              {([ ["Conservative","#4a9fd4"],["Moderate","#5dba80"],["Optimistic","#d4c040"] ] as [string,string][]).map(([n,c]) => (
                <span key={n} style={{ fontSize:10, color:c }}>● {n}</span>
              ))}
            </div>
          </div>
          <div style={{ background:"#0d1a0e", border:"1px solid #1a3a20", borderRadius:12, padding:16 }}>
            <div style={{ fontSize:11, color:"#3a6a4a", textTransform:"uppercase", letterSpacing:2, marginBottom:12 }}>Jamaican Market Size</div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {MARKET_DATA.map(m => (
                <div key={m.category}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <span style={{ fontSize:12, color:"#9abaa4" }}>{m.category}</span>
                    <span style={{ fontSize:12, color:m.color, fontWeight:"bold" }}>{m.value.toLocaleString()}</span>
                  </div>
                  <div style={{ height:6, background:"#1a3a20", borderRadius:3, overflow:"hidden" }}>
                    <div style={{ width:`${(m.value / 2000) * 100}%`, height:"100%", background:m.color, borderRadius:3 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FAQ */}
      {tab === "faq" && (
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {BILLING_POLICIES.map((item, i) => (
            <div key={i} style={{ background:"#0d1a0e", border:"1px solid #1a3a20", borderRadius:10, overflow:"hidden" }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width:"100%", padding:"14px 16px", background:"transparent", border:"none", display:"flex", justifyContent:"space-between", alignItems:"center", cursor:"pointer", fontFamily:"Georgia,serif" }}>
                <span style={{ fontSize:13, color:"#c8d8c8", textAlign:"left" }}>{item.q}</span>
                <span style={{ color:"#3a6a4a", fontSize:14, flexShrink:0 }}>{openFaq === i ? "▲" : "▼"}</span>
              </button>
              {openFaq === i && (
                <div style={{ padding:"0 16px 14px", fontSize:12, color:"#7a9a7a", lineHeight:1.7 }}>{item.a}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
