import { readFile } from 'node:fs/promises';
import { PrismaClient } from '@prisma/client';

if (process.env.VERCEL_ENV !== 'production' && process.env.MEDIATION_MIGRATE !== 'true') {
  console.log('Mediation migration: skipped outside production. Use MEDIATION_MIGRATE=true for an explicit database update.');
  process.exit(0);
}
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required for the mediation migration.');
const db = new PrismaClient();
try {
  const sql = await readFile(new URL('../prisma/mediation-2027.sql', import.meta.url), 'utf8');
  if (/DROP\s+(TABLE|COLUMN)|DELETE\s+FROM|TRUNCATE/i.test(sql)) throw new Error('Destructive migration rejected.');
  await db.$transaction(async tx => {
    await tx.$executeRawUnsafe("SELECT pg_advisory_xact_lock(1772027)");
    await tx.$executeRawUnsafe('CREATE TABLE IF NOT EXISTS "_AHMigration" ("name" TEXT PRIMARY KEY, "appliedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)');
    const done = await tx.$queryRawUnsafe('SELECT "name" FROM "_AHMigration" WHERE "name" = $1', 'mediation-2027-v1');
    if (done.length) return;
    for (const statement of sql.split(';').map(s => s.trim()).filter(Boolean)) await tx.$executeRawUnsafe(statement);
    await tx.$executeRawUnsafe('INSERT INTO "_AHMigration" ("name") VALUES ($1)', 'mediation-2027-v1');
  }, { timeout: 60000, maxWait: 30000 });
  console.log('Mediation migration ready. Existing tables and records preserved.');
} catch (e) {
  console.error('Mediation migration failed; transaction rolled back.', e?.code || 'Check database configuration.');
  process.exitCode = 1;
} finally { await db.$disconnect(); }
