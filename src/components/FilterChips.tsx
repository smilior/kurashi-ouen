"use client";

type Props = {
  label: string;
  items: string[];
  selected: string;
  onSelect: (value: string) => void;
};

export function FilterChips({ label, items, selected, onSelect }: Props) {
  return (
    <div className="mb-3">
      <p className="mb-2 text-xs font-semibold tracking-wide text-[#8B7355]/60 uppercase">
        {label}
      </p>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {items.map((item) => (
          <button
            key={item}
            onClick={() => onSelect(selected === item ? "" : item)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
              selected === item
                ? "bg-[#FF6B6B] text-white shadow-md shadow-[#FF6B6B]/20"
                : "bg-white text-[#6B5B4A] shadow-sm hover:shadow-md"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
