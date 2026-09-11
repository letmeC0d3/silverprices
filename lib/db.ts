import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { DailyRateRecord } from './types';

let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (dbInstance) {
    return dbInstance;
  }

  const dbDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const dbPath = path.join(dbDir, 'silver.db');
  dbInstance = new Database(dbPath);
  
  // Pragmas for ultra-low memory & fast reads
  dbInstance.pragma('journal_mode = WAL');
  dbInstance.pragma('synchronous = NORMAL');
  dbInstance.pragma('cache_size = -2000'); // ~2MB cache size limit

  initSchema(dbInstance);

  return dbInstance;
}

function initSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS daily_rates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL UNIQUE,
      price_per_gram_999 REAL NOT NULL,
      price_per_kg_999 REAL NOT NULL,
      price_per_gram_925 REAL NOT NULL,
      change_24h REAL NOT NULL,
      change_percent_24h REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_daily_rates_date ON daily_rates(date);

    -- Create view to support silver_rates_history query compatibility
    CREATE VIEW IF NOT EXISTS silver_rates_history AS 
    SELECT * FROM daily_rates;
  `);
}

export function insertDailyRate(rate: {
  date: string;
  price_per_gram_999: number;
  price_per_kg_999: number;
  price_per_gram_925: number;
  change_24h: number;
  change_percent_24h: number;
}): void {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO daily_rates (
      date, 
      price_per_gram_999, 
      price_per_kg_999, 
      price_per_gram_925, 
      change_24h, 
      change_percent_24h,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(date) DO UPDATE SET
      price_per_gram_999 = excluded.price_per_gram_999,
      price_per_kg_999 = excluded.price_per_kg_999,
      price_per_gram_925 = excluded.price_per_gram_925,
      change_24h = excluded.change_24h,
      change_percent_24h = excluded.change_percent_24h
  `);

  stmt.run(
    rate.date,
    rate.price_per_gram_999,
    rate.price_per_kg_999,
    rate.price_per_gram_925,
    rate.change_24h,
    rate.change_percent_24h
  );
}

export function getLatestDailyRate(): DailyRateRecord | null {
  try {
    const db = getDb();
    const row = db.prepare(`
      SELECT * FROM daily_rates ORDER BY date DESC LIMIT 1
    `).get() as DailyRateRecord | undefined;
    return row || null;
  } catch (error) {
    console.error('Error fetching latest daily rate from SQLite:', error);
    return null;
  }
}

export function getHistoricalDailyRates(limit = 30): DailyRateRecord[] {
  try {
    const db = getDb();
    const rows = db.prepare(`
      SELECT * FROM daily_rates ORDER BY date DESC LIMIT ?
    `).all(limit) as DailyRateRecord[];
    return rows.reverse(); // Chronological order for charting
  } catch (error) {
    console.error('Error fetching historical rates from SQLite:', error);
    return [];
  }
}
