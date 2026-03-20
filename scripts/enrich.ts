import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { shops } from "../src/db/schema";
import { eq, isNull, sql } from "drizzle-orm";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function enrich() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  const db = drizzle(client);

  // --- Step 1: Town name enrichment via zipcloud API ---
  console.log("=== Step 1: Town name enrichment ===");

  const uniqueZips = await db
    .selectDistinct({ zipCode: shops.zipCode })
    .from(shops)
    .where(
      sql`${shops.zipCode} IS NOT NULL AND ${shops.zipCode} != '' AND ${shops.town} IS NULL`
    );

  console.log(`Found ${uniqueZips.length} unique zip codes to look up`);

  const zipToTown = new Map<string, string>();
  let zipSuccess = 0;

  for (const { zipCode } of uniqueZips) {
    if (!zipCode) continue;
    const cleanZip = zipCode.replace(/-/g, "");
    try {
      const res = await fetch(
        `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${cleanZip}`
      );
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const r = data.results[0];
        const town = r.address3 || "";
        if (town) {
          zipToTown.set(zipCode, town);
          zipSuccess++;
        }
      }
    } catch (e) {
      console.warn(`  Failed for zip ${zipCode}:`, e);
    }
    await sleep(100); // Rate limit
  }

  console.log(`Resolved ${zipSuccess}/${uniqueZips.length} zip codes`);

  // Batch update town names
  for (const [zipCode, town] of zipToTown) {
    await db
      .update(shops)
      .set({ town })
      .where(eq(shops.zipCode, zipCode));
  }
  console.log("Town names updated.");

  // --- Step 2: Geocoding via GSI API ---
  console.log("\n=== Step 2: Geocoding ===");

  const shopsToGeocode = await db
    .select({ id: shops.id, address: shops.address, area: shops.area })
    .from(shops)
    .where(
      sql`${shops.address} IS NOT NULL AND ${shops.address} != '' AND ${shops.lat} IS NULL`
    );

  console.log(`Found ${shopsToGeocode.length} shops to geocode`);

  let geoSuccess = 0;
  let geoFailed = 0;

  for (let i = 0; i < shopsToGeocode.length; i++) {
    const shop = shopsToGeocode[i];
    if (!shop.address) continue;

    // Build search query: use full address
    const query = encodeURIComponent(shop.address);
    try {
      const res = await fetch(
        `https://msearch.gsi.go.jp/address-search/AddressSearch?q=${query}`
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const [lng, lat] = data[0].geometry.coordinates;
        await db
          .update(shops)
          .set({ lat, lng })
          .where(eq(shops.id, shop.id));
        geoSuccess++;
      } else {
        geoFailed++;
      }
    } catch (e) {
      geoFailed++;
      console.warn(`  Geocode failed for id=${shop.id}:`, e);
    }

    if ((i + 1) % 100 === 0) {
      console.log(`  Progress: ${i + 1}/${shopsToGeocode.length}`);
    }
    await sleep(100); // Rate limit
  }

  console.log(
    `\nGeocoding complete: ${geoSuccess} success, ${geoFailed} failed out of ${shopsToGeocode.length}`
  );

  console.log("\nEnrich complete!");
  process.exit(0);
}

enrich().catch((e) => {
  console.error(e);
  process.exit(1);
});
