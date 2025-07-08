import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
const POSTGRES_URI = process.env.POSTGRES_URI;
const sql = neon(POSTGRES_URI);
export const db = drizzle(sql, { schema });
