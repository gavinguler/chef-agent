const DAYS = ["maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag", "zondag"];
const SHORT = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];

export default function DayTabs({ selected, onChange }) {
  const todayIndex = new Date().getDay();
  const todayCycleIndex = todayIndex === 0 ? 6 : todayIndex - 1;

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
      {DAYS.map((day, i) => {
        const isSelected = selected === day;
        const isToday = i === todayCycleIndex;
        return (
          <button
            key={day}
            onClick={() => onChange(day)}
            className={`flex-shrink-0 flex flex-col items-center rounded-2xl px-3 py-2 min-w-[44px] transition-all ${
              isSelected
                ? "bg-brand text-white shadow-card"
                : isToday
                ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                : "bg-white text-gray-500 shadow-card"
            }`}
          >
            <span className="text-xs font-bold">{SHORT[i]}</span>
            <span className="text-xs opacity-70">{i + 1}</span>
          </button>
        );
      })}
    </div>
  );
}
