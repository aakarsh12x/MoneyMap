import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import * as schema from './schema.jsx';

/**
 * This script sets up the database using Drizzle ORM
 * Run with: node -r @babel/register utils/dbSetup.js
 */
async function setupDatabase() {
  console.log('Starting database setup with Drizzle ORM...');

  try {
    // Connection string using the service role key for admin privileges
    const connectionString = 'postgresql://postgres.npccwewfvqnskpjtsssg:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wY2N3ZXdmdnFuc2twanRzc3NnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Mzc2NDc1MCwiZXhwIjoyMDU5MzQwNzUwfQ.Z1rx8q9XJifxbHoTayLszkjns0F5GHeneF498U9lGTg@db.npccwewfvqnskpjtsssg.supabase.co:5432/postgres';
    
    // SQL client
    const sql = postgres(connectionString, { max: 1 });
    
    // Create Drizzle instance
    const db = drizzle(sql, { schema });

    console.log('Connected to database. Creating tables...');

    // Push the schema to the database
    await db.execute(/* sql */`
      -- Create currencies table if it doesn't exist
      CREATE TABLE IF NOT EXISTS currencies (
        code VARCHAR(3) PRIMARY KEY,
        name VARCHAR NOT NULL,
        symbol VARCHAR NOT NULL,
        rate NUMERIC NOT NULL,
        "isBase" INTEGER DEFAULT 0
      );
      
      -- Create user_settings table if it doesn't exist
      CREATE TABLE IF NOT EXISTS user_settings (
        id SERIAL PRIMARY KEY,
        "userId" VARCHAR NOT NULL UNIQUE,
        "baseCurrency" VARCHAR(3) NOT NULL DEFAULT 'INR',
        theme VARCHAR DEFAULT 'light',
        CONSTRAINT fk_base_currency FOREIGN KEY ("baseCurrency") REFERENCES currencies(code)
      );

      -- Create budgets table if it doesn't exist
      CREATE TABLE IF NOT EXISTS budgets (
        id SERIAL PRIMARY KEY,
        name VARCHAR NOT NULL,
        amount VARCHAR NOT NULL,
        currency VARCHAR(3) NOT NULL DEFAULT 'INR',
        icon VARCHAR,
        "createdBy" VARCHAR NOT NULL,
        CONSTRAINT fk_budget_currency FOREIGN KEY (currency) REFERENCES currencies(code)
      );

      -- Create incomes table if it doesn't exist
      CREATE TABLE IF NOT EXISTS incomes (
        id SERIAL PRIMARY KEY,
        name VARCHAR NOT NULL,
        amount VARCHAR NOT NULL,
        currency VARCHAR(3) NOT NULL DEFAULT 'INR',
        icon VARCHAR,
        "createdBy" VARCHAR NOT NULL,
        CONSTRAINT fk_income_currency FOREIGN KEY (currency) REFERENCES currencies(code)
      );

      -- Create expenses table if it doesn't exist
      CREATE TABLE IF NOT EXISTS expenses (
        id SERIAL PRIMARY KEY,
        name VARCHAR NOT NULL,
        amount NUMERIC NOT NULL DEFAULT 0,
        currency VARCHAR(3) NOT NULL DEFAULT 'INR',
        "budgetId" INTEGER REFERENCES budgets(id),
        "createdAt" VARCHAR NOT NULL,
        CONSTRAINT fk_expense_currency FOREIGN KEY (currency) REFERENCES currencies(code)
      );
    `);

    // Insert default currencies
    console.log('Adding default currencies...');
    
    // Check if currencies already exist
    const existingCurrencies = await db.select({ count: sql`count(*)` }).from(schema.Currencies);
    const count = Number(existingCurrencies[0].count);
    
    if (count === 0) {
      // Insert default currencies with INR as base
      await db.insert(schema.Currencies).values([
        { code: 'INR', name: 'Indian Rupee', symbol: '₹', rate: 1, isBase: 1 },
        { code: 'USD', name: 'US Dollar', symbol: '$', rate: 0.012, isBase: 0 },
        { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.011, isBase: 0 },
        { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.0093, isBase: 0 },
        { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 1.78, isBase: 0 },
        { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', rate: 0.016, isBase: 0 },
        { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rate: 0.018, isBase: 0 },
        { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', rate: 0.087, isBase: 0 },
        { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', rate: 0.016, isBase: 0 },
        { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', rate: 0.044, isBase: 0 },
      ]);
      console.log('Default currencies added with INR as base currency.');
    } else {
      // Update currencies to make INR the base currency
      console.log('Updating existing currencies to make INR the base...');
      
      // First, reset all currencies to non-base
      await db.update(schema.Currencies)
        .set({ isBase: 0 })
        .where(sql`TRUE`);
        
      // Then set INR as base and update its rate
      await db.update(schema.Currencies)
        .set({ isBase: 1, rate: 1 })
        .where(sql`code = 'INR'`);
        
      console.log('Currencies updated to make INR the base currency.');
    }

    console.log('Database tables created successfully!');
    await sql.end();
  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

// Run the setup
setupDatabase(); 