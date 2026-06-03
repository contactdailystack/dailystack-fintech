import { Client } from 'pg';

async function main() {
  const url = process.env.SUPABASE_DB_URL;
  if (!url) {
    console.error('SUPABASE_DB_URL is not set');
    process.exit(1);
  }

  const client = new Client({ connectionString: url });
  try {
    await client.connect();

    console.log('Listing public tables...');
    const resAll = await client.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name;`
    );
    resAll.rows.forEach(r => console.log('- ' + r.table_name));

    console.log('\nChecking expected migration tables...');
    const expected = ['user_settings','subscriptions','subscription_templates','user_events','cancellation_progress','cancellation_documents'];
    const resExpected = await client.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name = ANY($1::text[]) ORDER BY table_name;`,
      [expected]
    );
    const found = resExpected.rows.map(r => r.table_name);
    expected.forEach(t => console.log(`${t}: ${found.includes(t) ? 'FOUND' : 'MISSING'}`));

    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('Error querying DB:', err.message || err);
    try { await client.end(); } catch {};
    process.exit(2);
  }
}

main();
