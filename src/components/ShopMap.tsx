"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";

type GeoShop = {
  id: number;
  name: string;
  categoryMajor: string | null;
  categoryMinor: string | null;
  area: string | null;
  phone: string | null;
  saruboboStatus: string | null;
  lat: number;
  lng: number;
};

type Filters = {
  q: string;
  category: string;
  categoryMinor: string;
  area: string;
  town: string;
  coin: string;
};

type Props = {
  filters: Filters;
};

// Dynamically import the map to avoid SSR issues with Leaflet
const MapInner = dynamic(() => import("./ShopMapInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FFB347] border-t-transparent" />
    </div>
  ),
});

export function ShopMap({ filters }: Props) {
  const [shops, setShops] = useState<GeoShop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    if (filters.category) params.set("category", filters.category);
    if (filters.categoryMinor) params.set("categoryMinor", filters.categoryMinor);
    if (filters.area) params.set("area", filters.area);
    if (filters.town) params.set("town", filters.town);
    if (filters.coin) params.set("coin", filters.coin);

    setLoading(true);
    fetch(`/api/shops/geo?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setShops(data.shops);
        setLoading(false);
      });
  }, [filters]);

  return (
    <div className="relative h-full w-full">
      {loading && shops.length === 0 ? (
        <div className="flex h-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FFB347] border-t-transparent" />
        </div>
      ) : (
        <>
          <MapInner shops={shops} />
          <div className="absolute left-3 top-3 z-[1000] rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-[#8B7355] shadow backdrop-blur-sm">
            {shops.length.toLocaleString()} 件表示中
          </div>
        </>
      )}
    </div>
  );
}
