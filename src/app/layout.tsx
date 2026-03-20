import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "くらし応援 かめいてんガイド",
  description: "飛騨高山エリアの加盟店を検索できるガイドアプリ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-[#FFF8F0] text-[#2D2D2D] antialiased">
        {children}
      </body>
    </html>
  );
}
