const DAYS = ["maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag", "zondag"];
const SHORT = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];

export default function DayTabs({ selected, onChange }) {
  const todayIndex = new Date().getDay();
  const todayCycleIndex = todayIndex === 0 ? 6 : todayIndex - 1;

  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-4 px-4">
      {DAYS.map((day, i) => {
        const isSelected = selected === day;
        const isToday = i === todayCycleIndex;
        return (
          <button
            key={day}
            onClick={() => onChange(day)}
            className={`flex-shrink-0 flex flex-col items-center rounded-xl px-2.5 py-2 min-w-[38px] transition-colors ${
              isSelected
                ? "bg-blue-600 text-white"
                : isToday
                ? "bg-blue-50 text-blue-600 border border-blue-200"
                : "bg-white border border-gray-200 text-gray-600"
            }`}
          >
            <span className="text-xs font-semibold">{SHORT[i]}</span>
            <span className="text-xs">{i + 1}</span>
          </button>
        );
      })}
    </div>
  );
}
