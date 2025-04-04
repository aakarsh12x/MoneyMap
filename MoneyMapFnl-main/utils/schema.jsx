import {
  integer,
  numeric,
  pgTable,
  serial,
  varchar,
} from "drizzle-orm/pg-core";

export const Currencies = pgTable("currencies", {
  code: varchar("code", { length: 3 }).primaryKey(),
  name: varchar("name").notNull(),
  symbol: varchar("symbol").notNull(),
  rate: numeric("rate").notNull(), // Exchange rate relative to base currency
  isBase: integer("isBase").default(0), // 1 if this is the base currency, 0 otherwise
});

export const UserSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: varchar("userId").notNull().unique(),
  baseCurrency: varchar("baseCurrency", { length: 3 }).references(() => Currencies.code).notNull().default('INR'),
  theme: varchar("theme").default('light'),
});

export const Budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  amount: varchar("amount").notNull(),
  currency: varchar("currency", { length: 3 }).references(() => Currencies.code).notNull().default('INR'),
  icon: varchar("icon"),
  createdBy: varchar("createdBy").notNull(),
});

export const Incomes = pgTable("incomes", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  amount: varchar("amount").notNull(),
  currency: varchar("currency", { length: 3 }).references(() => Currencies.code).notNull().default('INR'),
  icon: varchar("icon"),
  createdBy: varchar("createdBy").notNull(),
});

export const Expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  amount: numeric("amount").notNull().default(0),
  currency: varchar("currency", { length: 3 }).references(() => Currencies.code).notNull().default('INR'),
  budgetId: integer("budgetId").references(() => Budgets.id),
  createdAt: varchar("createdAt").notNull(),
});
