import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { shops } from "../src/db/schema";
import { readFileSync } from "fs";
import { resolve } from "path";

async function seed() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  const db = drizzle(client);

  // Create table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS shops (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      name_kana TEXT,
      category_major TEXT,
      category_minor TEXT,
      products TEXT,
      area TEXT,
      zip_code TEXT,
      address TEXT,
      phone TEXT,
      sarubobo_status TEXT
    )
  `);

  // Clear existing data
  await client.execute("DELETE FROM shops");

  // Read CSV
  const csvPath = resolve(__dirname, "../kameiten.csv");
  const csv = readFileSync(csvPath, "utf-8");
  const lines = csv.split("\n").filter((l) => l.trim());

  // Skip header
  const rows = lines.slice(1);

  // Parse CSV (handle commas in quoted fields)
  function parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }

  // Batch insert
  const batchSize = 50;
  let inserted = 0;

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const values = batch.map((row) => {
      const cols = parseCsvLine(row);
      return {
        name: cols[0] || "",
        nameKana: cols[1] || null,
        categoryMajor: cols[2] || null,
        categoryMinor: cols[3] || null,
        products: cols[4] || null,
        area: cols[5] || null,
        zipCode: cols[6] || null,
        address: cols[7] || null,
        phone: cols[8] || null,
        saruboboStatus: cols[9] || null,
      };
    });
    await db.insert(shops).values(values);
    inserted += batch.length;
    console.log(`Inserted ${inserted}/${rows.length}`);
  }

  console.log("Seed complete!");
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
