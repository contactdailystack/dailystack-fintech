// Run activation_funnel.sql and retention_cohorts.sql against DATABASE_URL
// Usage: set DATABASE_URL then `node scripts/run_analytics_queries.js`

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const activationPath = path.join(__dirname, '..', 'analytics', 'activation_funnel.sql');
const retentionPath = path.join(__dirname, '..', 'analytics', 'retention_cohorts.sql');

function loadAndPrepare(sqlPath) {
  let sql = fs.readFileSync(sqlPath, 'utf8');
  const now = new Date();
  const start = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30); // 30 days ago
  const end = new Date(now.getTime() + 1000 * 60 * 60 * 24);
  const startIso = start.toISOString();
  const endIso = end.toISOString();
  sql = sql.replace(/:start_date/g, `'${startIso}'`).replace(/:end_date/g, `'${endIso}'`);
  sql = sql.replace(/{{start_date}}/g, `'${startIso}'`).replace(/{{end_date}}/g, `'${endIso}'`);
  return sql;
}

async function run() {
  const conn = process.env.DATABASE_URL;
  if (!conn) {
    console.error('DATABASE_URL is not set.');
    process.exit(1);
  }

  const client = new Client({ connectionString: conn });
  await client.connect();

  try {
    console.log('Running activation funnel query...');
    const activationSql = loadAndPrepare(activationPath);
    const activationRes = await client.query(activationSql);
    console.log('Activation Funnel Results:');
    console.log(JSON.stringify(activationRes.rows, null, 2));

    console.log('\nRunning retention cohorts query...');
    const retentionSql = loadAndPrepare(retentionPath);
    const retentionRes = await client.query(retentionSql);
    console.log('Retention Cohorts Results:');
    console.log(JSON.stringify(retentionRes.rows, null, 2));
  } catch (err) {
    console.error('Querying failed:', err);
  } finally {
    await client.end();
  }
}

run().catch(e=>{console.error(e); process.exit(1)});
