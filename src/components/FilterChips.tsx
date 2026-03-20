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

type HierarchicalCategory = {
  major: string;
  minors: string[];
};

type HierarchicalArea = {
  area: string;
  towns: string[];
};

type HierarchicalFilterProps = {
  label: string;
  items: HierarchicalCategory[] | HierarchicalArea[];
  selectedParent: string;
  selectedChild: string;
  onSelectParent: (value: string) => void;
  onSelectChild: (value: string) => void;
  type: "category" | "area";
};

export function HierarchicalFilter({
  label,
  items,
  selectedParent,
  selectedChild,
  onSelectParent,
  onSelectChild,
  type,
}: HierarchicalFilterProps) {
  const parentKeys =
    type === "category"
      ? (items as HierarchicalCategory[]).map((i) => i.major)
      : (items as HierarchicalArea[]).map((i) => i.area);

  const childItems =
    type === "category"
      ? (items as HierarchicalCategory[]).find((i) => i.major === selectedParent)
          ?.minors || []
      : (items as HierarchicalArea[]).find((i) => i.area === selectedParent)
          ?.towns || [];

  return (
    <div className="mb-3">
      <p className="mb-2 text-xs font-semibold tracking-wide text-[#8B7355]/60 uppercase">
        {label}
      </p>
      {/* Parent chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {parentKeys.map((item) => (
          <button
            key={item}
            onClick={() => {
              if (selectedParent === item) {
                onSelectParent("");
                onSelectChild("");
              } else {
                onSelectParent(item);
                onSelectChild("");
              }
            }}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
              selectedParent === item
                ? "bg-[#FF6B6B] text-white shadow-md shadow-[#FF6B6B]/20"
                : "bg-white text-[#6B5B4A] shadow-sm hover:shadow-md"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {/* Child chips (accordion) */}
      {selectedParent && childItems.length > 0 && (
        <div className="mt-2 ml-2 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {childItems.map((child) => (
            <button
              key={child}
              onClick={() => onSelectChild(selectedChild === child ? "" : child)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-300 ${
                selectedChild === child
                  ? "bg-[#FF8E6B] text-white shadow-md shadow-[#FF8E6B]/20"
                  : "bg-[#FFF0E0] text-[#6B5B4A] shadow-sm hover:shadow-md"
              }`}
            >
              {child}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
