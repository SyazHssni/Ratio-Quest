export const TONES = {
  red: { fill: "#EF4444", bg: "bg-red-50", border: "border-red-300", text: "text-red-700" },
  blue: { fill: "#3B82F6", bg: "bg-blue-50", border: "border-blue-300", text: "text-blue-700" },
  yellow: { fill: "#EAB308", bg: "bg-yellow-50", border: "border-yellow-300", text: "text-yellow-800" },
  green: { fill: "#10B981", bg: "bg-emerald-50", border: "border-emerald-300", text: "text-emerald-700" },
  pink: { fill: "#EC4899", bg: "bg-pink-50", border: "border-pink-300", text: "text-pink-700" },
  purple: { fill: "#8B5CF6", bg: "bg-violet-50", border: "border-violet-300", text: "text-violet-700" },
  orange: { fill: "#F97316", bg: "bg-orange-50", border: "border-orange-300", text: "text-orange-700" },
};

export const ObjectToken = ({ item, size = 34, number }) => {
  return (
    <span className="relative inline-flex items-center justify-center leading-none" style={{ width: size + 6, height: size + 6, fontSize: size }} aria-hidden="true">
      {item.emoji}
      {number !== undefined && (
        <span className="absolute -top-1 -left-1 text-[11px] font-bold bg-amber-300 text-slate-900 rounded-full w-5 h-5 flex items-center justify-center border border-slate-800">
          {number}
        </span>
      )}
    </span>
  );
};
