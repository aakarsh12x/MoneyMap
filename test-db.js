import { db } from './utils/dbConfig.jsx';
import { Budgets } from './utils/schema.jsx';
import { sql } from 'drizzle-orm';

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Test 1: Simple select query
    const testQuery = await db.select().from(Budgets).limit(1);
    console.log('✅ Database connection successful');
    console.log('Sample data:', testQuery);
    
    // Test 2: Check if tables exist
    console.log('\nTesting table structure...');
    const budgetCount = await db.select({ count: sql`count(*)` }).from(Budgets);
    console.log('✅ Budgets table exists, count:', budgetCount[0]?.count);
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.error('Full error:', error);
  }
}

testDatabase(); 