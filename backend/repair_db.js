/**
 * repair_db.js
 *
 * Safe, additive-only database repair script.
 *
 * What this does:
 *  1. Adds the missing `dueDate` column to the `payments` table.
 *  2. Creates the missing index `payments_dueDate_idx`.
 *  3. Adds the missing `PARTIALLY_OCCUPIED` value to the `RoomStatus` enum.
 *  4. Reconciles the `_prisma_migrations` table so that Prisma sees
 *     the three local migration files as "already applied" and removes the
 *     stale `20260806041136_init` record that no longer exists locally.
 *
 * What this does NOT do:
 *  - Drop any table, column, or enum value.
 *  - Delete any user data.
 *  - Run `prisma migrate reset`.
 *
 * Idempotent: each DDL statement is guarded with IF NOT EXISTS / conditional
 * checks so re-running this script is safe.
 */

const { Client } = require('pg');
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:ramya%40123@localhost:5432/stayhub';

async function main() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  console.log('Connected to database.');

  try {
    // ------------------------------------------------------------------ //
    // STEP 1: Add missing enum value PARTIALLY_OCCUPIED to RoomStatus.
    // Postgres does not support IF NOT EXISTS for ALTER TYPE ... ADD VALUE,
    // so we check the pg_enum table first.
    // ------------------------------------------------------------------ //
    const enumCheck = await client.query(
      `SELECT 1 FROM pg_enum e
         JOIN pg_type t ON t.oid = e.enumtypid
        WHERE t.typname = 'RoomStatus'
          AND e.enumlabel = 'PARTIALLY_OCCUPIED'
        LIMIT 1;`
    );

    if (enumCheck.rowCount === 0) {
      await client.query(`ALTER TYPE "RoomStatus" ADD VALUE 'PARTIALLY_OCCUPIED';`);
      console.log('[OK] Added PARTIALLY_OCCUPIED to RoomStatus enum.');
    } else {
      console.log('[SKIP] RoomStatus.PARTIALLY_OCCUPIED already exists.');
    }

    // ------------------------------------------------------------------ //
    // STEP 2: Add missing column payments.dueDate.
    // ------------------------------------------------------------------ //
    const colCheck = await client.query(
      `SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name   = 'payments'
          AND column_name  = 'dueDate'
        LIMIT 1;`
    );

    if (colCheck.rowCount === 0) {
      await client.query(`ALTER TABLE "payments" ADD COLUMN "dueDate" TIMESTAMP(3);`);
      console.log('[OK] Added dueDate column to payments table.');
    } else {
      console.log('[SKIP] payments.dueDate already exists.');
    }

    // ------------------------------------------------------------------ //
    // STEP 3: Create missing index payments_dueDate_idx.
    // ------------------------------------------------------------------ //
    const idxCheck = await client.query(
      `SELECT 1 FROM pg_indexes
        WHERE schemaname = 'public'
          AND tablename  = 'payments'
          AND indexname  = 'payments_dueDate_idx'
        LIMIT 1;`
    );

    if (idxCheck.rowCount === 0) {
      await client.query(`CREATE INDEX "payments_dueDate_idx" ON "payments"("dueDate");`);
      console.log('[OK] Created payments_dueDate_idx index.');
    } else {
      console.log('[SKIP] payments_dueDate_idx index already exists.');
    }

    // ------------------------------------------------------------------ //
    // STEP 4: Reconcile _prisma_migrations table.
    //
    //  a) Remove the stale old migration that no longer exists locally.
    //  b) Insert the three local migrations as "already applied" so that
    //     `prisma migrate status` reports zero drift.
    //
    // We use real checksums computed from the migration SQL files that
    // Prisma uses (SHA-256 of the file content). However, Prisma uses its
    // own internal checksum format. We supply placeholder checksums here
    // because Prisma's `migrate status` command only checks whether the
    // migration_name rows exist — it does not re-verify checksums during
    // a status check. The checksums are used by `migrate deploy` to detect
    // tampered files, but since we are inserting them as finished rows, they
    // will not be re-run.
    //
    // To be safe, we will use the actual migration file content hashes that
    // Prisma would compute (based on their documented algorithm: SHA-256 of
    // the file contents, formatted as a lowercase hex string).
    // ------------------------------------------------------------------ //
    const fs = require('fs');
    const path = require('path');
    const crypto = require('crypto');

    function computePrismaChecksum(filePath) {
      const content = fs.readFileSync(filePath, 'utf8');
      return crypto.createHash('sha256').update(content).digest('hex');
    }

    const migrationsDir = path.join(__dirname, 'prisma', 'migrations');

    const localMigrations = [
      '20260825070353_init',
      '20260828120000_add_partially_occupied_room_status',
      '20260828130000_add_payment_due_date',
    ];

    // Remove stale alien migration record
    const deleteResult = await client.query(
      `DELETE FROM _prisma_migrations WHERE migration_name = '20260806041136_init' RETURNING migration_name;`
    );
    if (deleteResult.rowCount > 0) {
      console.log('[OK] Removed stale migration record: 20260806041136_init');
    } else {
      console.log('[SKIP] Stale migration 20260806041136_init was already removed.');
    }

    // Insert the three local migrations as applied
    for (const migName of localMigrations) {
      const existing = await client.query(
        `SELECT 1 FROM _prisma_migrations WHERE migration_name = $1 LIMIT 1;`,
        [migName]
      );

      if (existing.rowCount > 0) {
        console.log(`[SKIP] Migration record already exists: ${migName}`);
        continue;
      }

      const sqlFile = path.join(migrationsDir, migName, 'migration.sql');
      const checksum = computePrismaChecksum(sqlFile);
      const now = new Date().toISOString();

      await client.query(
        `INSERT INTO _prisma_migrations
           (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
         VALUES
           (gen_random_uuid(), $1, $2::timestamptz, $3, NULL, NULL, $2::timestamptz, 1);`,
        [checksum, now, migName]
      );
      console.log(`[OK] Inserted migration record: ${migName}`);
    }

    console.log('\n=== Database repair completed successfully ===');
  } catch (err) {
    console.error('\n[FATAL] Repair script failed:', err.message);
    throw err;
  } finally {
    await client.end();
  }
}

main().catch(() => process.exit(1));
