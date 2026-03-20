import { db } from "@/db";
import { shops } from "@/db/schema";
import { like, eq, or, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const area = searchParams.get("area") || "";
  const coin = searchParams.get("coin") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 30;
  const offset = (page - 1) * limit;

  const conditions = [];

  if (q) {
    conditions.push(
      or(
        like(shops.name, `%${q}%`),
        like(shops.products, `%${q}%`),
        like(shops.categoryMinor, `%${q}%`)
      )
    );
  }

  if (category) {
    conditions.push(eq(shops.categoryMajor, category));
  }

  if (area) {
    conditions.push(eq(shops.area, area));
  }

  if (coin === "available") {
    conditions.push(eq(shops.saruboboStatus, "利用可能"));
  }

  const where =
    conditions.length > 0
      ? sql`${sql.join(
          conditions.map((c) => sql`(${c})`),
          sql` AND `
        )}`
      : undefined;

  const [results, countResult] = await Promise.all([
    db
      .select()
      .from(shops)
      .where(where)
      .orderBy(shops.nameKana)
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(shops)
      .where(where),
  ]);

  return NextResponse.json({
    shops: results,
    total: countResult[0].count,
    page,
    totalPages: Math.ceil(countResult[0].count / limit),
  });
}
