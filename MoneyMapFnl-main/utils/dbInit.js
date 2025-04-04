import { supabase } from './dbConfig.jsx';
import { db } from './dbConfig.jsx';
import { Budgets, Incomes, Expenses } from './schema.jsx';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

/**
 * This script creates the necessary tables in Supabase
 * Run with: node -r @babel/register utils/dbInit.js
 */
async function initializeDatabase() {
  console.log('Starting database initialization...');

  try {
    // Create tables directly using Supabase SQL queries for maximum compatibility
    const createBudgetsTable = `
      CREATE TABLE IF NOT EXISTS budgets (
        id SERIAL PRIMARY KEY,
        name VARCHAR NOT NULL,
        amount VARCHAR NOT NULL,
        icon VARCHAR,
        "createdBy" VARCHAR NOT NULL
      );
    `;

    const createIncomesTable = `
      CREATE TABLE IF NOT EXISTS incomes (
        id SERIAL PRIMARY KEY,
        name VARCHAR NOT NULL,
        amount VARCHAR NOT NULL,
        icon VARCHAR,
        "createdBy" VARCHAR NOT NULL
      );
    `;

    const createExpensesTable = `
      CREATE TABLE IF NOT EXISTS expenses (
        id SERIAL PRIMARY KEY,
        name VARCHAR NOT NULL,
        amount NUMERIC NOT NULL DEFAULT 0,
        "budgetId" INTEGER REFERENCES budgets(id),
        "createdAt" VARCHAR NOT NULL
      );
    `;

    // Execute the SQL queries
    console.log('Creating budgets table...');
    await supabase.rpc('pgql', { query: createBudgetsTable });

    console.log('Creating incomes table...');
    await supabase.rpc('pgql', { query: createIncomesTable });

    console.log('Creating expenses table...');
    await supabase.rpc('pgql', { query: createExpensesTable });

    console.log('Database initialization complete!');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Run the initialization
initializeDatabase(); 