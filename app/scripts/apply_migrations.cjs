#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

async function run() {
  const sqlPath = path.resolve(__dirname, '..', '..', 'supabase', 'migrations', '001_initial_schema.sql')
  if (!fs.existsSync(sqlPath)) {
    console.error('Migration SQL not found at', sqlPath)
    process.exit(1)
  }

  const sql = fs.readFileSync(sqlPath, 'utf8')
  const dbUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL
  if (!dbUrl) {
    console.log('No SUPABASE_DB_URL / DATABASE_URL provided. Skipping execution.')
    console.log('To run migrations set SUPABASE_DB_URL and re-run: npm run db:migrate')
    process.exit(0)
  }

  const { Client } = require('pg')
  const client = new Client({ connectionString: dbUrl })
  try {
    await client.connect()
    console.log('Connected to DB, running migration...')
    await client.query('BEGIN')
    await client.query(sql)
    await client.query('COMMIT')
    console.log('Migration applied successfully.')
    process.exit(0)
  } catch (err) {
    console.error('Migration failed:', err)
    try { await client.query('ROLLBACK') } catch (e) {}
    process.exit(2)
  } finally {
    try { await client.end() } catch (e) {}
  }
}

run()
