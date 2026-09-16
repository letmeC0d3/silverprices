import { describe, it } from 'node:test';
import assert from 'node:assert';
import { constructLivePriceData, getFallbackFromDb } from '../lib/price-service';
import { isTimestampStale } from '../lib/date-utils';

describe('Fallback & Data Truthfulness Guarantees', () => {
  it('constructs fallback price data with isFallback=true and never marks it as live', () => {
    const historicalDate = '2026-03-10';
    const oldTimestamp = new Date('2026-03-10T12:00:00.000Z').toISOString();

    const data = constructLivePriceData(
      6000,
      1200,
      0.5,
      'fallback',
      oldTimestamp,
      historicalDate,
      'Offline Snapshot'
    );

    assert.strictEqual(data.source, 'fallback');
    assert.strictEqual(data.isFallback, true, 'isFallback must be true for fallback data');
    assert.strictEqual(data.isStale, true, 'Old historical timestamp must be marked isStale=true');
    assert.strictEqual(data.snapshotDate, historicalDate);
    assert.strictEqual(data.timestamp, oldTimestamp, 'Timestamp must reflect true historical snapshot, not new Date()');
  });

  it('correctly marks data as fresh only when within the 60-minute freshness threshold', () => {
    const now = new Date();
    const freshTimestamp = new Date(now.getTime() - 10 * 60 * 1000).toISOString(); // 10 mins ago

    const data = constructLivePriceData(
      6000,
      1200,
      0.5,
      'live',
      freshTimestamp,
      '2026-03-15'
    );

    assert.strictEqual(data.source, 'live');
    assert.strictEqual(data.isFallback, false);
    assert.strictEqual(data.isStale, false, 'Data under 60 minutes old must not be marked stale');
  });
});
