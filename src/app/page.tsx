"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ShopCard } from "@/components/ShopCard";
import { ShopDetail } from "@/components/ShopDetail";
import { SearchBar } from "@/components/SearchBar";
import { HierarchicalFilter } from "@/components/FilterChips";
import { ShopList } from "@/components/ShopList";

type Shop = {
  id: number;
  name: string;
  nameKana: string | null;
  categoryMajor: string | null;
  categoryMinor: string | null;
  products: string | null;
  area: string | null;
  town: string | null;
  zipCode: string | null;
  address: string | null;
  phone: string | null;
  saruboboStatus: string | null;
  lat: number | null;
  lng: number | null;
};

type Filters = {
  q: string;
  category: string;
  categoryMinor: string;
  area: string;
  town: string;
  coin: string;
};

type HierarchicalCategory = {
  major: string;
  minors: string[];
};

type HierarchicalArea = {
  area: string;
  towns: string[];
};

type Tab = "home" | "list";

export default function Home() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<HierarchicalCategory[]>([]);
  const [areas, setAreas] = useState<HierarchicalArea[]>([]);
  const [filters, setFilters] = useState<Filters>({
    q: "",
    category: "",
    categoryMinor: "",
    area: "",
    town: "",
    coin: "",
  });
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/shops/categories")
      .then((r) => r.json())
      .then((data) => {
        setCategories(data.categories);
        setAreas(data.areas);
      });
  }, []);

  const fetchShops = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    if (filters.category) params.set("category", filters.category);
    if (filters.categoryMinor) params.set("categoryMinor", filters.categoryMinor);
    if (filters.area) params.set("area", filters.area);
    if (filters.town) params.set("town", filters.town);
    if (filters.coin) params.set("coin", filters.coin);
    params.set("page", page.toString());

    const res = await fetch(`/api/shops?${params}`);
    const data = await res.json();
    setShops(data.shops);
    setTotal(data.total);
    setTotalPages(data.totalPages);
    setLoading(false);
  }, [filters, page]);

  useEffect(() => {
    if (activeTab === "home") {
      fetchShops();
    }
  }, [fetchShops, activeTab]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 200);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const updateFilter = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
    if (activeTab === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (selectedShop) {
    return (
      <ShopDetail shop={selectedShop} onBack={() => setSelectedShop(null)} />
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* === HOME TAB === */}
      {activeTab === "home" && (
        <>
          {/* Hero */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#FF6B6B] via-[#FF8E6B] to-[#FFB347] px-6 pb-10 pt-14">
            <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -left-8 bottom-0 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
            <div className="relative">
              <p className="text-sm font-medium tracking-widest text-white/80">
                飛騨高山エリア
              </p>
              <h1 className="mt-1 text-4xl font-bold tracking-tight text-white">
                くらし応援
              </h1>
              <p className="mt-2 text-lg font-medium text-white/90">
                かめいてん検索
              </p>
              <p className="mt-1 text-sm text-white/70">
                {total.toLocaleString()} 件の加盟店
              </p>
            </div>
            <div className="relative mt-6">
              <SearchBar
                value={filters.q}
                onChange={(v) => updateFilter("q", v)}
              />
            </div>
          </div>

          {/* Sticky search on scroll */}
          {isScrolled && (
            <div className="fixed left-0 right-0 top-0 z-50 bg-white/80 px-4 py-3 shadow-lg backdrop-blur-xl">
              <SearchBar
                value={filters.q}
                onChange={(v) => updateFilter("q", v)}
                compact
              />
            </div>
          )}

          {/* Filters */}
          <div className="px-4 pt-6" ref={listRef}>
            {/* Coin filter */}
            <button
              onClick={() =>
                updateFilter("coin", filters.coin === "available" ? "" : "available")
              }
              className={`mb-4 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-sm transition-all duration-300 ${
                filters.coin === "available"
                  ? "bg-gradient-to-r from-[#FFB347] to-[#FFCC70] text-[#6B4000] shadow-[#FFB347]/30"
                  : "bg-white text-[#8B7355] shadow-black/5"
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <text x="12" y="16" textAnchor="middle" fontSize="10" fill="currentColor" stroke="none">¥</text>
              </svg>
              さるぼぼコイン対応
            </button>

            {/* Hierarchical category filter */}
            <HierarchicalFilter
              label="業種"
              items={categories}
              selectedParent={filters.category}
              selectedChild={filters.categoryMinor}
              onSelectParent={(v) => updateFilter("category", v)}
              onSelectChild={(v) => updateFilter("categoryMinor", v)}
              type="category"
            />

            {/* Hierarchical area filter */}
            <HierarchicalFilter
              label="地域"
              items={areas}
              selectedParent={filters.area}
              selectedChild={filters.town}
              onSelectParent={(v) => updateFilter("area", v)}
              onSelectChild={(v) => updateFilter("town", v)}
              type="area"
            />

            {/* Active filters summary */}
            {(filters.q || filters.category || filters.categoryMinor || filters.area || filters.town || filters.coin) && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-xs text-[#8B7355]">絞り込み中:</span>
                {filters.q && (
                  <FilterTag label={`"${filters.q}"`} onRemove={() => updateFilter("q", "")} />
                )}
                {filters.category && (
                  <FilterTag label={filters.category} onRemove={() => { updateFilter("category", ""); updateFilter("categoryMinor", ""); }} />
                )}
                {filters.categoryMinor && (
                  <FilterTag label={filters.categoryMinor} onRemove={() => updateFilter("categoryMinor", "")} />
                )}
                {filters.area && (
                  <FilterTag label={filters.area} onRemove={() => { updateFilter("area", ""); updateFilter("town", ""); }} />
                )}
                {filters.town && (
                  <FilterTag label={filters.town} onRemove={() => updateFilter("town", "")} />
                )}
                {filters.coin && (
                  <FilterTag label="コイン対応" onRemove={() => updateFilter("coin", "")} />
                )}
                <button
                  onClick={() => {
                    setFilters({ q: "", category: "", categoryMinor: "", area: "", town: "", coin: "" });
                    setPage(1);
                  }}
                  className="text-xs text-[#FF6B6B] underline"
                >
                  すべて解除
                </button>
              </div>
            )}
          </div>

          {/* Results */}
          <div className="px-4 pt-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-medium text-[#8B7355]">
                {total.toLocaleString()} 件のお店
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FFB347] border-t-transparent" />
              </div>
            ) : shops.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-4xl">🔍</p>
                <p className="mt-4 text-lg font-medium text-[#8B7355]">
                  お店が見つかりませんでした
                </p>
                <p className="mt-1 text-sm text-[#8B7355]/60">
                  検索条件を変更してみてください
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {shops.map((shop) => (
                    <ShopCard
                      key={shop.id}
                      shop={shop}
                      onClick={() => setSelectedShop(shop)}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-3">
                    <button
                      onClick={() => {
                        setPage((p) => Math.max(1, p - 1));
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      disabled={page === 1}
                      className="rounded-xl bg-white px-5 py-2.5 text-sm font-medium shadow-sm transition-all disabled:opacity-30"
                    >
                      前へ
                    </button>
                    <span className="text-sm font-medium text-[#8B7355]">
                      {page} / {totalPages}
                    </span>
                    <button
                      onClick={() => {
                        setPage((p) => Math.min(totalPages, p + 1));
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      disabled={page === totalPages}
                      className="rounded-xl bg-white px-5 py-2.5 text-sm font-medium shadow-sm transition-all disabled:opacity-30"
                    >
                      次へ
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}

      {/* === LIST TAB === */}
      {activeTab === "list" && (
        <ShopList onSelectShop={(shop) => setSelectedShop(shop as Shop)} />
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-[#F0E8D8] bg-white/95 backdrop-blur-xl">
        <button
          onClick={() => setActiveTab("home")}
          className={`flex flex-1 flex-col items-center gap-1 py-3 transition-colors ${
            activeTab === "home" ? "text-[#FF6B6B]" : "text-[#8B7355]/50"
          }`}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="m2.25 12 8.954-8.955a1.126 1.126 0 0 1 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[10px] font-semibold">ホーム</span>
        </button>
        <button
          onClick={() => setActiveTab("list")}
          className={`flex flex-1 flex-col items-center gap-1 py-3 transition-colors ${
            activeTab === "list" ? "text-[#FF6B6B]" : "text-[#8B7355]/50"
          }`}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[10px] font-semibold">一覧</span>
        </button>
      </nav>
    </div>
  );
}

function FilterTag({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#FF6B6B]/10 px-3 py-1 text-xs font-medium text-[#FF6B6B]">
      {label}
      <button onClick={onRemove} className="ml-0.5 hover:text-[#FF4444]">
        ×
      </button>
    </span>
  );
}
