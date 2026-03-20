import { db } from "@/db";
import { shops } from "@/db/schema";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const [categories, areas] = await Promise.all([
    db
      .selectDistinct({ categoryMajor: shops.categoryMajor })
      .from(shops)
      .where(sql`${shops.categoryMajor} IS NOT NULL AND ${shops.categoryMajor} != ''`)
      .orderBy(shops.categoryMajor),
    db
      .selectDistinct({ area: shops.area })
      .from(shops)
      .where(sql`${shops.area} IS NOT NULL AND ${shops.area} != ''`)
      .orderBy(shops.area),
  ]);

  return NextResponse.json({
    categories: categories.map((c) => c.categoryMajor),
    areas: areas.map((a) => a.area),
  });
}
