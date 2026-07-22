import { pgTable, serial, text, integer, timestamp, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  tier: varchar("tier", { length: 50 }).notNull().default("free"),
  credits: integer("credits").notNull().default(5),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
