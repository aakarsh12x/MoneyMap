import {
  integer,
  numeric,
  pgTable,
  serial,
  varchar,
  timestamp,
  text,
  boolean,
} from "drizzle-orm/pg-core";

// Instruments table - stores available investment instruments
export const Instruments = pgTable("instruments", {
  id: serial("id").primaryKey(),
  symbol: varchar("symbol").notNull().unique(), // Stock symbol or MF code
  name: varchar("name").notNull(),
  type: varchar("type").notNull(), // 'stock', 'mutual_fund', 'etf'
  exchange: varchar("exchange"), // NSE, BSE, etc.
  isActive: boolean("is_active").default(true),
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdBy: varchar("created_by").notNull(),
});

// Holdings table - user's investment holdings
export const Holdings = pgTable("holdings", {
  id: serial("id").primaryKey(),
  instrumentId: integer("instrument_id").references(() => Instruments.id),
  quantity: numeric("quantity").notNull(), // Number of shares/units
  averagePrice: numeric("average_price").notNull(), // Average purchase price
  totalInvested: numeric("total_invested").notNull(), // Total amount invested
  currentValue: numeric("current_value").default(0),
  profitLoss: numeric("profit_loss").default(0),
  profitLossPercentage: numeric("profit_loss_percentage").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: varchar("created_by").notNull(),
});

// Price histories table - historical price data
export const PriceHistories = pgTable("price_histories", {
  id: serial("id").primaryKey(),
  instrumentId: integer("instrument_id").references(() => Instruments.id),
  price: numeric("price").notNull(),
  volume: integer("volume"), // For stocks
  nav: numeric("nav"), // For mutual funds
  date: timestamp("date").notNull(),
  source: varchar("source").notNull(), // 'alpha_vantage', 'zyla_labs'
  createdAt: timestamp("created_at").defaultNow(),
});

// Investment transactions table - buy/sell transactions
export const InvestmentTransactions = pgTable("investment_transactions", {
  id: serial("id").primaryKey(),
  holdingId: integer("holding_id").references(() => Holdings.id),
  type: varchar("type").notNull(), // 'buy', 'sell'
  quantity: numeric("quantity").notNull(),
  price: numeric("price").notNull(),
  totalAmount: numeric("total_amount").notNull(),
  transactionDate: timestamp("transaction_date").notNull(),
  fees: numeric("fees").default(0),
  notes: text("notes"),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}); 