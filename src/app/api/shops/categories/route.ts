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
  const categories = Array.from(categoryMap.entries()).map(
    ([major, minors]) => ({
      major,
      minors: Array.from(minors).sort(),
    })
  );

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
