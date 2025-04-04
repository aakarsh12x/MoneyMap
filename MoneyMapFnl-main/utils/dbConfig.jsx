import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "./schema";

// Create a Supabase client
const supabaseUrl = 'https://npccwewfvqnskpjtsssg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wY2N3ZXdmdnFuc2twanRzc3NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3NjQ3NTAsImV4cCI6MjA1OTM0MDc1MH0.lb-3JUjXd2zq4Ru-uIyB7DblkQFNuFN-iTlC4N4RIOw';
export const supabase = createClient(supabaseUrl, supabaseKey);

// Create a Postgres client
const connectionString = 'postgresql://postgres.npccwewfvqnskpjtsssg:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wY2N3ZXdmdnFuc2twanRzc3NnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Mzc2NDc1MCwiZXhwIjoyMDU5MzQwNzUwfQ.Z1rx8q9XJifxbHoTayLszkjns0F5GHeneF498U9lGTg@db.npccwewfvqnskpjtsssg.supabase.co:5432/postgres';
const client = postgres(connectionString);
export const db = drizzle(client, { schema });
