"use client";

import dynamic from "next/dynamic";

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

type Props = {
  shop: Shop;
  onBack: () => void;
};

const MiniMap = dynamic(() => import("./MiniMap"), { ssr: false });

export function ShopDetail({ shop, onBack }: Props) {
  const isAvailable = shop.saruboboStatus === "利用可能";

  return (
    <div className="min-h-screen">
      {/* Hero header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#FF6B6B] via-[#FF8E6B] to-[#FFB347] px-6 pb-12 pt-6">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -left-10 bottom-0 h-56 w-56 rounded-full bg-white/10 blur-2xl" />

        {/* Top bar */}
        <div className="relative flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-all hover:bg-white/30"
          >
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path d="M15.75 19.5 8.25 12l7.5-7.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Shop name */}
        <div className="relative mt-8">
          {shop.nameKana && (
            <p className="text-xs tracking-widest text-white/60">{shop.nameKana}</p>
          )}
          <h1 className="mt-1 text-3xl font-bold leading-tight text-white">
            {shop.name}
          </h1>

          {/* Category badge */}
          {(shop.categoryMajor || shop.categoryMinor) && (
            <p className="mt-3 text-sm font-medium text-white/80">
              {[shop.categoryMajor, shop.categoryMinor].filter(Boolean).join(" › ")}
            </p>
          )}

          {/* Coin status */}
          <div className="mt-4">
            <span
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold backdrop-blur-sm ${
                isAvailable
                  ? "bg-white/25 text-white"
                  : "bg-black/10 text-white/60"
              }`}
            >
              {isAvailable ? "🪙" : "○"}
              さるぼぼコイン {shop.saruboboStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="-mt-4 rounded-t-3xl bg-[#FFF8F0] px-6 pt-8 pb-12">
        {/* Products */}
        {shop.products && (
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-[#8B7355]/50 uppercase">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              主な取扱品目
            </div>
            <p className="mt-3 text-base font-medium text-[#2D2D2D]">
              {shop.products}
            </p>
          </div>
        )}

        {/* Location info */}
        <div className="mt-4 rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-[#8B7355]/50 uppercase">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
            所在地
          </div>
          <div className="mt-3 space-y-2">
            <div className="flex flex-wrap gap-2">
              {shop.area && (
                <span className="inline-block rounded-full bg-[#FF6B6B]/10 px-3 py-1 text-xs font-medium text-[#FF6B6B]">
                  {shop.area}エリア
                </span>
              )}
              {shop.town && (
                <span className="inline-block rounded-full bg-[#FFB347]/10 px-3 py-1 text-xs font-medium text-[#8B6914]">
                  {shop.town}
                </span>
              )}
            </div>
            <p className="text-base text-[#2D2D2D]">
              {shop.zipCode && <span className="text-[#8B7355]/50">〒{shop.zipCode} </span>}
              {shop.address}
            </p>
          </div>
        </div>

        {/* Mini map */}
        {shop.lat && shop.lng && (
          <div className="mt-4 overflow-hidden rounded-2xl shadow-sm">
            <div className="h-48 w-full">
              <MiniMap lat={shop.lat} lng={shop.lng} name={shop.name} />
            </div>
          </div>
        )}

        {/* Phone CTA */}
        {shop.phone && (
          <a
            href={`tel:${shop.phone}`}
            className="mt-4 flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#FF6B6B] to-[#FF8E6B] px-6 py-4 text-white shadow-lg shadow-[#FF6B6B]/20 transition-all active:scale-[0.98]"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-lg font-bold">{shop.phone}</span>
            <span className="text-sm font-medium text-white/80">に電話する</span>
          </a>
        )}
      </div>
    </div>
  );
}
