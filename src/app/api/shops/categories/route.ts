import { db } from "@/db";
import { shops } from "@/db/schema";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const [categoryRows, areaRows] = await Promise.all([
    db
      .select({
        major: shops.categoryMajor,
        minor: shops.categoryMinor,
      })
      .from(shops)
      .where(
        sql`${shops.categoryMajor} IS NOT NULL AND ${shops.categoryMajor} != ''`
      )
      .groupBy(shops.categoryMajor, shops.categoryMinor)
      .orderBy(shops.categoryMajor, shops.categoryMinor),
    db
      .select({
        area: shops.area,
        town: shops.town,
      })
      .from(shops)
      .where(sql`${shops.area} IS NOT NULL AND ${shops.area} != ''`)
      .groupBy(shops.area, shops.town)
      .orderBy(shops.area, shops.town),
  ]);

  // Build hierarchical categories
  const categoryMap = new Map<string, Set<string>>();
  for (const row of categoryRows) {
    if (!row.major) continue;
    if (!categoryMap.has(row.major)) categoryMap.set(row.major, new Set());
    if (row.minor) categoryMap.get(row.major)!.add(row.minor);
  }

  // くらし応援で利用されやすい順に並べる
  const CATEGORY_ORDER = [
    "小売業",                           // 食料品・日用品 (674件)
    "飲食業",                           // 外食・テイクアウト (406件)
    "理美容・エステ業（マッサージ業）",   // 身だしなみ・リラクゼーション (324件)
    "生活関連業",                       // クリーニング・修理等 (73件)
    "建設業",                           // リフォーム・住宅修繕 (124件)
    "自動車販売・修理業",               // 車検・修理 (114件)
    "ホテル・旅館業等",                 // 宿泊 (57件)
    "バス・タクシー運行業",             // 移動手段 (20件)
    "その他の業種",                     // その他 (53件)
  ];

  const categories = CATEGORY_ORDER
    .filter((major) => categoryMap.has(major))
    .map((major) => ({
      major,
      minors: Array.from(categoryMap.get(major)!).sort(),
    }));

  // DB にあるが上記リストにない業種も末尾に追加
  for (const [major, minors] of categoryMap) {
    if (!CATEGORY_ORDER.includes(major)) {
      categories.push({ major, minors: Array.from(minors).sort() });
    }
  }

  // Build hierarchical areas
  const areaMap = new Map<string, Set<string>>();
  for (const row of areaRows) {
    if (!row.area) continue;
    if (!areaMap.has(row.area)) areaMap.set(row.area, new Set());
    if (row.town) areaMap.get(row.area)!.add(row.town);
  }
  const areas = Array.from(areaMap.entries()).map(([area, towns]) => ({
    area,
    towns: Array.from(towns).sort(),
  }));

  return NextResponse.json({ categories, areas });
}
