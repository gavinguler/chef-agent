export default function ThinBar({ v = 0, max = 1, label = "", unit = "", color = "#1f7a4d" }) {
  const pct = Math.min(100, Math.round((v / max) * 100));
  return (
    <div className="mb-3">
      <div className="flex justify-between text-[13px] mb-1" style={{ color: 'rgba(60,60,67,0.6)' }}>
        <span>{label}</span>
        <span>{Math.round(v)} / {max} {unit}</span>
      </div>
      <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(120,120,128,0.16)' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}
