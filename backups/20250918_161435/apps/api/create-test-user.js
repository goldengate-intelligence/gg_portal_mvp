const argon2 = require('argon2');

async function createTestUser() {
  // Hash a test password
  const passwordHash = await argon2.hash('TestPassword123\!');
  
  console.log('Use this SQL to create a test user:');
  console.log(`
INSERT INTO users (id, email, username, full_name, password_hash, is_active, created_at, updated_at)
VALUES (
  '510cd321-2066-4338-94ed-7f899055a0ea',
  'john@hedge.com',
  'hedgerman',
  'John Hedgerman',
  '${passwordHash}',
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE 
SET password_hash = EXCLUDED.password_hash;
  `);
  
  console.log('\nLogin credentials:');
  console.log('Email: john@hedge.com');
  console.log('Password: TestPassword123\!');
}

createTestUser();
