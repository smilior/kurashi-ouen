import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: 36,
          background: "linear-gradient(135deg, #FF6B6B 0%, #FF8E6B 50%, #FFB347 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <span style={{ fontSize: 72, color: "white", lineHeight: 1 }}>暮</span>
        <span style={{ fontSize: 16, color: "rgba(255,255,255,0.8)", letterSpacing: 4 }}>応援</span>
      </div>
    ),
    { ...size }
  );
}
