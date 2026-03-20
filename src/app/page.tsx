"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ShopCard } from "@/components/ShopCard";
import { ShopDetail } from "@/components/ShopDetail";
import { SearchBar } from "@/components/SearchBar";
import { FilterChips } from "@/components/FilterChips";

type Shop = {
  id: number;
  name: string;
  nameKana: string | null;
  categoryMajor: string | null;
  categoryMinor: string | null;
  products: string | null;
  area: string | null;
  zipCode: string | null;
  address: string | null;
  phone: string | null;
  saruboboStatus: string | null;
};

type Filters = {
  q: string;
  category: string;
  area: string;
  coin: string;
};

export default function Home() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [filters, setFilters] = useState<Filters>({
    q: "",
    category: "",
    area: "",
    coin: "",
  });
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
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
    if (filters.area) params.set("area", filters.area);
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
    fetchShops();
  }, [fetchShops]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 200);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const updateFilter = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (selectedShop) {
    return (
      <ShopDetail shop={selectedShop} onBack={() => setSelectedShop(null)} />
    );
  }

  return (
    <div className="min-h-screen pb-8">
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

        {/* Category chips */}
        <FilterChips
          label="業種"
          items={categories}
          selected={filters.category}
          onSelect={(v) => updateFilter("category", v)}
        />

        {/* Area chips */}
        <FilterChips
          label="地域"
          items={areas}
          selected={filters.area}
          onSelect={(v) => updateFilter("area", v)}
        />

        {/* Active filters summary */}
        {(filters.q || filters.category || filters.area || filters.coin) && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs text-[#8B7355]">絞り込み中:</span>
            {filters.q && (
              <FilterTag label={`"${filters.q}"`} onRemove={() => updateFilter("q", "")} />
            )}
            {filters.category && (
              <FilterTag label={filters.category} onRemove={() => updateFilter("category", "")} />
            )}
            {filters.area && (
              <FilterTag label={filters.area} onRemove={() => updateFilter("area", "")} />
            )}
            {filters.coin && (
              <FilterTag label="コイン対応" onRemove={() => updateFilter("coin", "")} />
            )}
            <button
              onClick={() => {
                setFilters({ q: "", category: "", area: "", coin: "" });
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
