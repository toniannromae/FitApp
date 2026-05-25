interface Props {
  val: number;
  max?: number;
  color: string;
}

export default function BarProgress({ val, max = 100, color }: Props) {
  return (
    <div style={{ height:6, background:"#1a3a20", borderRadius:3, overflow:"hidden" }}>
      <div style={{ width:`${(val / max) * 100}%`, height:"100%", background:color, borderRadius:3, transition:"width .5s" }} />
    </div>
  );
}
