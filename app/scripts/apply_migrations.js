#!/usr/bin/env node
/**
 * apply_migrations.js
 * Runs ALL migration files from supabase/migrations/ in alphabetical order.
 * Usage: npm run db:migrate
 * Requires: SUPABASE_DB_URL or DATABASE_URL env var.
 */

const fs = require('fs');
const path = require('path');

async function run() {
  const migrationsDir = path.resolve(__dirname, '..', '..', 'supabase', 'migrations');

  if (!fs.existsSync(migrationsDir)) {
    console.error('Migrations directory not found at', migrationsDir);
    process.exit(1);
  }

  const dbUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
  if (!dbUrl) {
    console.log('No SUPABASE_DB_URL / DATABASE_URL provided. Skipping execution.');
    console.log('To run migrations set SUPABASE_DB_URL and re-run: npm run db:migrate');
    process.exit(0);
  }

  // Collect all .sql files sorted alphabetically (migration prefix guarantees order)
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  if (files.length === 0) {
    console.log('No migration files found.');
    process.exit(0);
  }

  const { Client } = require('pg');
  const client = new Client({ connectionString: dbUrl });

  try {
    await client.connect();
    console.log(`Connected to DB. Found ${files.length} migration(s) to apply.\n`);

    // Run all migrations in a single transaction so any failure rolls back cleanly
    await client.query('BEGIN');

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      process.stdout.write(`  Applying: ${file} ... `);
      await client.query(sql);
      console.log('OK');
    }

    await client.query('COMMIT');
    console.log(`\nAll ${files.length} migration(s) applied successfully.`);
    process.exit(0);
  } catch (err) {
    console.error(`\nMigration failed: ${err.message}`);
    try { await client.query('ROLLBACK'); } catch (e) {}
    process.exit(2);
  } finally {
    try { await client.end(); } catch (e) {}
  }
}

run();
