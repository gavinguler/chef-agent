export default function ProteinRing({ v = 0, max = 160 }) {
  const r = 26;
  const circumference = 2 * Math.PI * r;
  const pct = Math.min(1, v / max);
  const dash = pct * circumference;

  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      <svg width="64" height="64" className="-rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(120,120,128,0.16)" strokeWidth="6" />
        <circle
          cx="32" cy="32" r={r}
          fill="none"
          stroke="#1f7a4d"
          strokeWidth="6"
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-[13px] font-bold text-ink">
        {Math.round(pct * 100)}%
      </span>
    </div>
  );
}
