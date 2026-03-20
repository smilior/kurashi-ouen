"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";

type Shop = {
  id: number;
  name: string;
  nameKana: string | null;
  categoryMajor: string | null;
  categoryMinor: string | null;
  products: string | null;
  area: string | null;
  phone: string | null;
  saruboboStatus: string | null;
};

const GOJUON_GROUPS = [
  { label: "ア", start: "ア", end: "オ" },
  { label: "カ", start: "カ", end: "ゴ" },
  { label: "サ", start: "サ", end: "ゾ" },
  { label: "タ", start: "タ", end: "ド" },
  { label: "ナ", start: "ナ", end: "ノ" },
  { label: "ハ", start: "ハ", end: "ポ" },
  { label: "マ", start: "マ", end: "モ" },
  { label: "ヤ", start: "ヤ", end: "ヨ" },
  { label: "ラ", start: "ラ", end: "ロ" },
  { label: "ワ", start: "ワ", end: "ン" },
];

const ALPHA_GROUPS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function getGojuonGroup(kana: string | null): string {
  if (!kana) return "#";
  const first = kana.charAt(0);
  // Check kana groups
  for (const g of GOJUON_GROUPS) {
    if (first >= g.start && first <= g.end) return g.label;
  }
  // Check alphabet
  const upper = first.toUpperCase();
  if (upper >= "A" && upper <= "Z") return upper;
  return "#";
}

type Props = {
  onSelectShop: (shop: Shop) => void;
};

export function ShopList({ onSelectShop }: Props) {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState<string | null>(null);
  const [isTouching, setIsTouching] = useState(false);
  const sectionRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const indexBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/shops?limit=all")
      .then((r) => r.json())
      .then((data) => {
        setShops(data.shops);
        setLoading(false);
      });
  }, []);

  // Group shops
  const { grouped, activeLabels } = useMemo(() => {
    const g = new Map<string, Shop[]>();
    for (const shop of shops) {
      const group = getGojuonGroup(shop.nameKana);
      if (!g.has(group)) g.set(group, []);
      g.get(group)!.push(shop);
    }
    const kanaLabels = GOJUON_GROUPS.map((gr) => gr.label);
    const alphaLabels = ALPHA_GROUPS.filter((l) => g.has(l));
    const allOrdered = [...kanaLabels, ...alphaLabels, "#"];
    return {
      grouped: g,
      activeLabels: allOrdered.filter((l) => g.has(l)),
    };
  }, [shops]);

  const scrollToSection = useCallback((label: string) => {
    const el = sectionRefs.current.get(label);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  // Resolve which label is at a given Y position on the index bar
  const getLabelAtY = useCallback(
    (clientY: number) => {
      if (!indexBarRef.current || activeLabels.length === 0) return null;
      const rect = indexBarRef.current.getBoundingClientRect();
      const relY = clientY - rect.top;
      const ratio = Math.max(0, Math.min(1, relY / rect.height));
      const idx = Math.min(
        activeLabels.length - 1,
        Math.floor(ratio * activeLabels.length)
      );
      return activeLabels[idx];
    },
    [activeLabels]
  );

  // Touch handlers for drag-to-scroll
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      setIsTouching(true);
      const label = getLabelAtY(e.touches[0].clientY);
      if (label) {
        setActiveIndex(label);
        scrollToSection(label);
      }
    },
    [getLabelAtY, scrollToSection]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      const label = getLabelAtY(e.touches[0].clientY);
      if (label && label !== activeIndex) {
        setActiveIndex(label);
        // Use instant scroll for drag
        const el = sectionRefs.current.get(label);
        if (el) {
          el.scrollIntoView({ behavior: "auto", block: "start" });
        }
      }
    },
    [getLabelAtY, activeIndex]
  );

  const handleTouchEnd = useCallback(() => {
    setIsTouching(false);
    setTimeout(() => setActiveIndex(null), 600);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FFB347] border-t-transparent" />
      </div>
    );
  }

  const allOrdered = [
    ...GOJUON_GROUPS.map((g) => g.label),
    ...ALPHA_GROUPS,
    "#",
  ];

  return (
    <div className="relative">
      {/* Floating section indicator */}
      {activeIndex && isTouching && (
        <div className="fixed left-1/2 top-1/2 z-50 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl bg-[#2D2D2D]/70 backdrop-blur-sm">
          <span className="text-2xl font-bold text-white">{activeIndex}</span>
        </div>
      )}

      {/* Main list */}
      <div className="pb-24 pr-6">
        <div className="px-4 pt-4 pb-2">
          <p className="text-sm font-medium text-[#8B7355]">
            全 {shops.length.toLocaleString()} 件
          </p>
        </div>
        {allOrdered.map((label) => {
          const items = grouped.get(label);
          if (!items) return null;
          return (
            <div
              key={label}
              ref={(el) => {
                if (el) sectionRefs.current.set(label, el);
              }}
            >
              <div className="sticky top-0 z-10 bg-[#FFF8F0]/95 px-4 py-1.5 backdrop-blur-sm">
                <span className="text-xs font-bold text-[#FF6B6B]">
                  {label}
                </span>
                <span className="ml-1.5 text-[10px] text-[#8B7355]/40">
                  {items.length}
                </span>
              </div>
              <div>
                {items.map((shop) => (
                  <button
                    key={shop.id}
                    onClick={() => onSelectShop(shop)}
                    className="flex w-full items-center gap-3 border-b border-[#F0E8D8]/60 px-4 py-2.5 text-left transition-colors active:bg-[#FFF0E0]"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-[#2D2D2D]">
                        {shop.name}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-[#8B7355]/50">
                        {[shop.categoryMajor, shop.categoryMinor]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                    {shop.saruboboStatus === "利用可能" && (
                      <span className="shrink-0 text-[11px]">🪙</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Index bar — subtle, touch-draggable */}
      <div
        ref={indexBarRef}
        className="fixed right-0 top-1/2 z-40 flex -translate-y-1/2 flex-col items-center py-2 px-1"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {activeLabels.map((label) => (
          <button
            key={label}
            onClick={() => {
              setActiveIndex(label);
              scrollToSection(label);
              setTimeout(() => setActiveIndex(null), 600);
            }}
            className={`flex items-center justify-center transition-all duration-150 ${
              activeIndex === label
                ? "h-4 w-4 text-[10px] font-bold text-[#FF6B6B]"
                : "h-3.5 w-3.5 text-[9px] font-medium text-[#8B7355]/40"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
