"use client";

import { useState, useEffect, useRef, useCallback } from "react";

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

function getGojuonGroup(kana: string | null): string {
  if (!kana) return "他";
  const first = kana.charAt(0);
  for (const g of GOJUON_GROUPS) {
    if (first >= g.start && first <= g.end) return g.label;
  }
  return "他";
}

type Props = {
  onSelectShop: (shop: Shop) => void;
};

export function ShopList({ onSelectShop }: Props) {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const sectionRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    fetch("/api/shops?limit=all")
      .then((r) => r.json())
      .then((data) => {
        setShops(data.shops);
        setLoading(false);
      });
  }, []);

  const scrollToSection = useCallback((label: string) => {
    const el = sectionRefs.current.get(label);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  // Group shops by gojuon
  const grouped = new Map<string, Shop[]>();
  for (const shop of shops) {
    const group = getGojuonGroup(shop.nameKana);
    if (!grouped.has(group)) grouped.set(group, []);
    grouped.get(group)!.push(shop);
  }

  const allLabels = [...GOJUON_GROUPS.map((g) => g.label), "他"];
  const activeLabels = allLabels.filter((l) => grouped.has(l));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FFB347] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="relative flex">
      {/* Main list */}
      <div className="flex-1 pb-24">
        <div className="px-4 pt-4">
          <p className="text-sm font-medium text-[#8B7355]">
            全 {shops.length.toLocaleString()} 件
          </p>
        </div>
        {allLabels.map((label) => {
          const items = grouped.get(label);
          if (!items) return null;
          return (
            <div
              key={label}
              ref={(el) => {
                if (el) sectionRefs.current.set(label, el);
              }}
            >
              <div className="sticky top-0 z-10 bg-[#FFF0E0] px-4 py-2">
                <span className="text-sm font-bold text-[#FF6B6B]">
                  {label}
                </span>
                <span className="ml-2 text-xs text-[#8B7355]/60">
                  {items.length}件
                </span>
              </div>
              <div className="space-y-0">
                {items.map((shop) => (
                  <button
                    key={shop.id}
                    onClick={() => onSelectShop(shop)}
                    className="flex w-full items-center gap-3 border-b border-[#F0E8D8] px-4 py-3 text-left transition-colors active:bg-[#FFF0E0]"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#2D2D2D]">
                        {shop.name}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-[#8B7355]/60">
                        {[shop.categoryMajor, shop.categoryMinor]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                    {shop.saruboboStatus === "利用可能" && (
                      <span className="shrink-0 rounded-full bg-gradient-to-r from-[#FFB347]/20 to-[#FFCC70]/20 px-2 py-0.5 text-xs font-bold text-[#8B6914]">
                        🪙
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Index bar */}
      <div className="fixed right-1 top-1/2 z-30 flex -translate-y-1/2 flex-col items-center gap-0.5">
        {activeLabels.map((label) => (
          <button
            key={label}
            onClick={() => scrollToSection(label)}
            className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-[#FF6B6B] transition-colors active:bg-[#FF6B6B] active:text-white"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
