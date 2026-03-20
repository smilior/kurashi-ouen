import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const shops = sqliteTable("shops", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  nameKana: text("name_kana"),
  categoryMajor: text("category_major"),
  categoryMinor: text("category_minor"),
  products: text("products"),
  area: text("area"),
  zipCode: text("zip_code"),
  address: text("address"),
  phone: text("phone"),
  saruboboStatus: text("sarubobo_status"),
});
