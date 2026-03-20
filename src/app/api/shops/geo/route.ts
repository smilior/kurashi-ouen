import { db } from "@/db";
import { shops } from "@/db/schema";
import { like, eq, or, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const categoryMinor = searchParams.get("categoryMinor") || "";
  const area = searchParams.get("area") || "";
  const town = searchParams.get("town") || "";
  const coin = searchParams.get("coin") || "";

  const conditions = [
    sql`${shops.lat} IS NOT NULL AND ${shops.lng} IS NOT NULL`,
  ];

  if (q) {
    conditions.push(
      or(
        like(shops.name, `%${q}%`),
        like(shops.products, `%${q}%`),
        like(shops.categoryMinor, `%${q}%`)
      )!
    );
  }

  if (category) {
    conditions.push(eq(shops.categoryMajor, category));
  }

  if (categoryMinor) {
    conditions.push(eq(shops.categoryMinor, categoryMinor));
  }

  if (area) {
    conditions.push(eq(shops.area, area));
  }

  if (town) {
    conditions.push(eq(shops.town, town));
  }

  if (coin === "available") {
    conditions.push(eq(shops.saruboboStatus, "利用可能"));
  }

  const where = sql`${sql.join(
    conditions.map((c) => sql`(${c})`),
    sql` AND `
  )}`;

  const results = await db
    .select({
      id: shops.id,
      name: shops.name,
      categoryMajor: shops.categoryMajor,
      categoryMinor: shops.categoryMinor,
      area: shops.area,
      phone: shops.phone,
      saruboboStatus: shops.saruboboStatus,
      lat: shops.lat,
      lng: shops.lng,
    })
    .from(shops)
    .where(where);

  return NextResponse.json({ shops: results });
}
