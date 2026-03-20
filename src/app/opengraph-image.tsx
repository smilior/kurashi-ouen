import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "くらし応援 かめいてんガイド";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "linear-gradient(135deg, #FF6B6B 0%, #FF8E6B 40%, #FFB347 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
        }}
      >
        <span style={{ fontSize: 28, color: "rgba(255,255,255,0.7)", letterSpacing: 8 }}>
          飛騨高山エリア
        </span>
        <span style={{ fontSize: 80, fontWeight: 700, color: "white" }}>
          くらし応援
        </span>
        <span style={{ fontSize: 40, color: "rgba(255,255,255,0.9)" }}>
          かめいてんガイド
        </span>
        <div
          style={{
            marginTop: 24,
            padding: "12px 32px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.2)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 24, color: "rgba(255,255,255,0.9)" }}>
            1,845件の加盟店を検索
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
