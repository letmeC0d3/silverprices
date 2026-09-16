import path from 'path';
import fs from 'fs';
import { getDb, closeDb, insertDailyRate, getLatestDailyRate, getResolvedDbPath } from '../lib/db';

async function verifyPersistence() {
  console.log('=== VERIFYING SQLITE PERSISTENCE ACROSS RESTARTS ===');

  const testDir = path.join(process.cwd(), 'scratch', 'persistence_test');
  const testDbPath = path.join(testDir, 'persistent_silver.db');

  // Clean test dir if exists
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true, force: true });
  }

  process.env.SQLITE_DB_PATH = testDbPath;
  console.log(`Configured SQLITE_DB_PATH: ${getResolvedDbPath()}`);

  // 1. Open DB (parent directory auto-creation test)
  console.log('1. Opening DB instance...');
  const db1 = getDb();
  console.log('DB opened successfully. Verifying file created on disk...');
  if (!fs.existsSync(testDbPath)) {
    throw new Error(`DB file was not created at ${testDbPath}`);
  }

  // 2. Insert test snapshot record
  const testRecord = {
    date: '2026-09-16',
    price_per_kg_999: 242000,
    price_per_gram_999: 242,
    price_per_gram_925: 223.85,
    change_24h: 1500,
    change_percent_24h: 0.62,
  };

  console.log('2. Inserting test snapshot record into DB...');
  insertDailyRate(testRecord);

  const snapshot1 = getLatestDailyRate();
  console.log('Snapshot in session 1:', snapshot1?.price_per_kg_999);
  if (snapshot1?.price_per_kg_999 !== 242000) {
    throw new Error('Snapshot verification in session 1 failed');
  }

  // 3. Close DB connection (simulate server shutdown)
  console.log('3. Closing database connection (simulating process termination)...');
  closeDb();

  // 4. Reopen DB (simulating server restart / redeployment)
  console.log('4. Re-opening database connection (simulating process restart)...');
  const db2 = getDb();

  // 5. Verify latest snapshot remains available
  const snapshot2 = getLatestDailyRate();
  console.log('Snapshot in session 2 (post-restart):', snapshot2?.price_per_kg_999);

  if (!snapshot2 || snapshot2.price_per_kg_999 !== 242000 || snapshot2.date !== '2026-09-16') {
    throw new Error('Data persistence test failed: record was lost after restart!');
  }

  // 6. Verify no second empty database was created
  const files = fs.readdirSync(testDir);
  console.log('Files in DB directory:', files);
  const dbFiles = files.filter((f) => f.endsWith('.db'));
  if (dbFiles.length !== 1) {
    throw new Error(`Unexpected DB files found: ${files.join(', ')}`);
  }

  closeDb();

  // Cleanup test directory
  fs.rmSync(testDir, { recursive: true, force: true });

  console.log('=== SQLITE PERSISTENCE VERIFIED SUCCESSFULLY ===\n');
}

verifyPersistence().catch((err) => {
  console.error('Persistence verification failed:', err);
  process.exit(1);
});
