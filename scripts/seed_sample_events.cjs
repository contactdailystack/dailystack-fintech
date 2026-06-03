const { Client } = require('pg');
const { randomUUID } = require('crypto');

const sqlInsert = (userId, eventName, createdAt, data) => {
  const dataJson = JSON.stringify(data || {});
  return `INSERT INTO user_events (id, user_id, event_name, event_data, platform, created_at)\n  VALUES ('${randomUUID()}', '${userId}', '${eventName}', '${dataJson.replace(/'/g, "''")}', 'seed-script', '${createdAt.toISOString()}');`;
};

async function run() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL is required. Example: postgres://user:pass@host:5432/dbname');
    process.exit(1);
  }

  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await client.connect();

  try {
    const now = new Date();

    const users = Array.from({ length: 5 }).map(() => randomUUID());

    const statements = [];

    statements.push(sqlInsert(users[0], 'signup_completed', new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3)));
    statements.push(sqlInsert(users[0], 'first_subscription_added', new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3 + 60000)));
    statements.push(sqlInsert(users[0], 'second_subscription_added', new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3 + 120000)));
    statements.push(sqlInsert(users[0], 'aha_moment_seen', new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3 + 180000)));

    statements.push(sqlInsert(users[1], 'signup_completed', new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2)));
    statements.push(sqlInsert(users[1], 'first_subscription_added', new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2 + 90000)));

    statements.push(sqlInsert(users[2], 'signup_completed', new Date(now.getTime() - 1000 * 60 * 60 * 24)));

    statements.push(sqlInsert(users[3], 'signup_completed', new Date(now.getTime() - 1000 * 60 * 60 * 12)));
    statements.push(sqlInsert(users[3], 'first_subscription_added', new Date(now.getTime() - 1000 * 60 * 60 * 12 + 60000)));
    statements.push(sqlInsert(users[3], 'aha_moment_seen', new Date(now.getTime() - 1000 * 60 * 60 * 12 + 120000)));
    statements.push(sqlInsert(users[3], 'cancellation_flow_started', new Date(now.getTime() - 1000 * 60 * 60 * 6)));
    statements.push(sqlInsert(users[3], 'cancellation_flow_completed', new Date(now.getTime() - 1000 * 60 * 60 * 6 + 60000), { saved_amount: 499 }));
    statements.push(sqlInsert(users[3], 'savings_confirmed', new Date(now.getTime() - 1000 * 60 * 60 * 6 + 120000), { saved_amount: 499 }));

    statements.push(sqlInsert(users[4], 'signup_completed', new Date(now.getTime() - 1000 * 60 * 60 * 24 * 10)));
    statements.push(sqlInsert(users[4], 'first_subscription_added', new Date(now.getTime() - 1000 * 60 * 60 * 24 * 9 + 30000)));
    statements.push(sqlInsert(users[4], 'second_subscription_added', new Date(now.getTime() - 1000 * 60 * 60 * 24 * 8 + 30000)));
    statements.push(sqlInsert(users[4], 'aha_moment_seen', new Date(now.getTime() - 1000 * 60 * 60 * 24 * 8 + 60000)));

    const fullSql = statements.join('\n');

    console.log('Inserting sample events (statements):', statements.length);
    await client.query('BEGIN');
    await client.query(fullSql);
    await client.query('COMMIT');
    console.log('Sample events seeded successfully.');
  } catch (err) {
    console.error('Seeding failed:', err);
    try { await client.query('ROLLBACK'); } catch (e) {}
  } finally {
    await client.end();
  }
}

run().catch(err => { console.error(err); process.exit(1); });
