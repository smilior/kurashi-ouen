"use client";

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

type Props = {
  shop: Shop;
  onClick: () => void;
};

export function ShopCard({ shop, onClick }: Props) {
  const isAvailable = shop.saruboboStatus === "利用可能";

  return (
    <button
      onClick={onClick}
      className="group w-full rounded-2xl bg-white p-5 text-left shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-bold text-[#2D2D2D] group-hover:text-[#FF6B6B] transition-colors">
            {shop.name}
          </h3>
          {(shop.categoryMajor || shop.categoryMinor) && (
            <p className="mt-1 text-xs font-medium text-[#FF6B6B]/70">
              {[shop.categoryMajor, shop.categoryMinor]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
            isAvailable
              ? "bg-gradient-to-r from-[#FFB347]/20 to-[#FFCC70]/20 text-[#8B6914]"
              : "bg-gray-100 text-gray-400"
          }`}
        >
          {isAvailable ? "🪙 対応" : "非対応"}
        </span>
      </div>

      {shop.products && (
        <p className="mt-2 text-sm text-[#6B5B4A]/80 line-clamp-1">
          {shop.products}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#8B7355]/60">
        {shop.area && (
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
            {shop.area}
          </span>
        )}
        {shop.phone && (
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
            </svg>
            {shop.phone}
          </span>
        )}
      </div>
    </button>
  );
}
