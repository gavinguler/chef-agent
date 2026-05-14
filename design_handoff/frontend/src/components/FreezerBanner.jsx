export default function FreezerBanner({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3">
      <p className="text-amber-800 text-xs font-semibold mb-1">❄️ Vriezer reminder</p>
      {items.map((item, i) => (
        <p key={i} className="text-amber-700 text-sm">
          {item.ontdooi_dag?.charAt(0).toUpperCase() + item.ontdooi_dag?.slice(1)}: haal{" "}
          <span className="font-medium">{item.product}</span> eruit → gebruik {item.gebruik_dag}
        </p>
      ))}
    </div>
  );
}
