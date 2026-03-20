"use client";

import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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

// Custom marker icons
const goldIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml," +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41"><path d="M12.5 0C5.6 0 0 5.6 0 12.5C0 21.9 12.5 41 12.5 41S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0z" fill="#FFB347"/><circle cx="12.5" cy="12.5" r="6" fill="white"/></svg>'
    ),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const grayIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml," +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41"><path d="M12.5 0C5.6 0 0 5.6 0 12.5C0 21.9 12.5 41 12.5 41S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0z" fill="#9CA3AF"/><circle cx="12.5" cy="12.5" r="6" fill="white"/></svg>'
    ),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Takayama city center
const DEFAULT_CENTER: [number, number] = [36.1461, 137.2522];
const DEFAULT_ZOOM = 13;

type Props = {
  shops: GeoShop[];
};

export default function ShopMapInner({ shops }: Props) {
  const center = useMemo<[number, number]>(() => {
    if (shops.length === 0) return DEFAULT_CENTER;
    const avgLat = shops.reduce((s, sh) => s + sh.lat, 0) / shops.length;
    const avgLng = shops.reduce((s, sh) => s + sh.lng, 0) / shops.length;
    return [avgLat, avgLng];
  }, [shops]);

  return (
    <MapContainer
      center={center}
      zoom={DEFAULT_ZOOM}
      style={{ height: "100%", width: "100%" }}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {shops.map((shop) => (
        <Marker
          key={shop.id}
          position={[shop.lat, shop.lng]}
          icon={shop.saruboboStatus === "利用可能" ? goldIcon : grayIcon}
        >
          <Popup>
            <div className="min-w-[180px]">
              <p className="text-sm font-bold text-[#2D2D2D]">{shop.name}</p>
              <p className="mt-1 text-xs text-[#8B7355]">
                {[shop.categoryMajor, shop.categoryMinor]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              {shop.saruboboStatus === "利用可能" && (
                <span className="mt-1 inline-block rounded-full bg-[#FFB347]/20 px-2 py-0.5 text-xs font-bold text-[#8B6914]">
                  🪙 コイン対応
                </span>
              )}
              {shop.phone && (
                <a
                  href={`tel:${shop.phone}`}
                  className="mt-2 block text-xs text-[#FF6B6B] underline"
                >
                  {shop.phone}
                </a>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
