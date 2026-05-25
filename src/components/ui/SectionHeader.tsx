interface Props {
  title: string;
  action?: { label: string; fn: () => void };
}

export default function SectionHeader({ title, action }: Props) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
      <div style={{ fontSize:11, color:"#3a6a4a", textTransform:"uppercase", letterSpacing:2 }}>{title}</div>
      {action && (
        <button onClick={action.fn} style={{ fontSize:11, color:"#2d7a4f", background:"transparent", border:"1px solid #2d5e3a", borderRadius:6, padding:"3px 10px", cursor:"pointer", fontFamily:"Georgia,serif" }}>
          {action.label}
        </button>
      )}
    </div>
  );
}
