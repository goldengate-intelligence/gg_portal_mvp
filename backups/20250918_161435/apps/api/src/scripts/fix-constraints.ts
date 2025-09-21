import { db } from "../db";
import { sql } from "drizzle-orm";

async function fixConstraints() {
  try {
    console.log("Fixing database constraints...");
    
    // First, let's see what lists exist
    const lists = await db.execute(sql`
      SELECT id, user_id, name, is_default 
      FROM contractor_lists 
      WHERE user_id = '510cd321-2066-4338-94ed-7f899055a0ea'
    `);
    
    console.log("Current lists:", lists);
    
    // Drop the problematic constraint
    console.log("Dropping old constraint...");
    await db.execute(sql`
      DROP INDEX IF EXISTS idx_unique_default_per_user
    `);
    
    // Recreate it with proper WHERE clause
    console.log("Creating new constraint...");
    await db.execute(sql`
      CREATE UNIQUE INDEX idx_unique_default_per_user 
      ON contractor_lists (user_id) 
      WHERE is_default = true
    `);
    
    console.log("✅ Constraints fixed!");
    
    process.exit(0);
  } catch (error) {
    console.error("Error fixing constraints:", error);
    process.exit(1);
  }
}

fixConstraints();