interface Props {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}

export default function StatCard({ label, value, sub, color = "#5dba80" }: Props) {
  return (
    <div style={{ background:"#0d1a0e", border:"1px solid #1a3a20", borderRadius:10, padding:"14px 16px" }}>
      <div style={{ fontSize:11, color:"#3a6a4a", textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>{label}</div>
      <div style={{ fontSize:26, color, lineHeight:1 }}>{value}</div>
      {sub && <div style={{ fontSize:11, color:"#4a7a5a", marginTop:4 }}>{sub}</div>}
    </div>
  );
}
