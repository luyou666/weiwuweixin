const { Client } = require('pg');
const bcrypt = require('/home/zhuwankai/weiwuweixin/node_modules/.pnpm/bcryptjs@3.0.3/node_modules/bcryptjs');

async function main() {
  const client = new Client('postgresql://weiwuweixin:weiwuweixin_dev@localhost:5432/weiwuweixin');
  await client.connect();

  const SALT_ROUNDS = 12;
  const password = 'test123';
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Check if testuser already exists
  const existing = await client.query(
    'SELECT u.id, u.handle, a.id as account_id FROM "User" u LEFT JOIN "Account" a ON u.id = a."userId" WHERE u.handle = $1',
    ['testuser']
  );

  if (existing.rows.length > 0) {
    console.log('User "testuser" already exists, updating password...');
    const userId = existing.rows[0].id;
    if (existing.rows[0].account_id) {
      await client.query(
        'UPDATE "Account" SET "passwordHash" = $1 WHERE "userId" = $2',
        [passwordHash, userId]
      );
      console.log('  Updated existing Account password');
    } else {
      await client.query(
        'INSERT INTO "Account" (id, email, "passwordHash", "emailVerified", "userId", "createdAt", "updatedAt") VALUES (gen_random_cuid(), $1, $2, true, $3, NOW(), NOW())',
        ['testuser@example.com', passwordHash, userId]
      );
      console.log('  Created new Account for existing User');
    }
  } else {
    // Create new user + account
    const userResult = await client.query(
      'INSERT INTO "User" (id, handle, nickname, email, "createdAt", "updatedAt") VALUES (gen_random_cuid(), $1, $2, $3, NOW(), NOW()) RETURNING id',
      ['testuser', '测试用户', 'testuser@example.com']
    );
    const userId = userResult.rows[0].id;
    console.log('  Created User:', userId);

    await client.query(
      'INSERT INTO "Account" (id, email, "passwordHash", "emailVerified", "userId", "createdAt", "updatedAt") VALUES (gen_random_cuid(), $1, $2, true, $3, NOW(), NOW())',
      ['testuser@example.com', passwordHash, userId]
    );
    console.log('  Created Account with email: testuser@example.com');
  }

  // Verify the user can be found and password matches
  const verify = await client.query(
    'SELECT u.id, u.handle, u.nickname, u.email, a."passwordHash" FROM "User" u JOIN "Account" a ON u.id = a."userId" WHERE u.handle = $1',
    ['testuser']
  );

  if (verify.rows.length > 0) {
    const valid = await bcrypt.compare(password, verify.rows[0].passwordHash);
    console.log('\n✅ Test user ready!');
    console.log('  Handle:    testuser');
    console.log('  Email:     testuser@example.com');
    console.log('  Password:  test123');
    console.log('  Password valid:', valid);
  } else {
    console.error('❌ Failed to verify test user');
  }

  await client.end();
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });