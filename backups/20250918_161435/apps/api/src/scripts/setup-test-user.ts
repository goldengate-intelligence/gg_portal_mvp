import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import argon2 from "argon2";

async function setupTestUser() {
  try {
    console.log("Setting up test user...");
    
    // Hash the password
    const passwordHash = await argon2.hash("123123123");
    
    // Update the existing user with the password hash
    const result = await db
      .update(users)
      .set({
        passwordHash: passwordHash,
        isActive: true,
        updatedAt: new Date()
      })
      .where(eq(users.id, "510cd321-2066-4338-94ed-7f899055a0ea"))
      .returning();
    
    if (result.length > 0) {
      console.log("✅ Test user updated successfully!");
      console.log("Email: john@hedge.com");
      console.log("Password: 123123123");
    } else {
      console.log("❌ User not found");
    }
    
    process.exit(0);
  } catch (error) {
    console.error("Error setting up test user:", error);
    process.exit(1);
  }
}

setupTestUser();