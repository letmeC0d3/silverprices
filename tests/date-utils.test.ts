import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  getIndianBusinessDate,
  formatIndianTime,
  isTimestampStale,
  STALE_THRESHOLD_MINUTES,
} from '../lib/date-utils';

describe('India Date & Timezone Handling (Asia/Kolkata)', () => {
  it('correctly maps 23:59 IST to the current day in IST', () => {
    // 2026-03-14 23:59:00 IST is 2026-03-14 18:29:00 UTC
    const dateAt2359IST = new Date('2026-03-14T18:29:00.000Z');
    const istDate = getIndianBusinessDate(dateAt2359IST);
    assert.strictEqual(istDate, '2026-03-14', '23:59 IST belongs to 2026-03-14');
  });

  it('correctly maps 00:00 IST (midnight boundary) to the new Indian calendar date', () => {
    // 2026-03-15 00:00:00 IST is 2026-03-14 18:30:00 UTC
    const dateAt0000IST = new Date('2026-03-14T18:30:00.000Z');
    const istDate = getIndianBusinessDate(dateAt0000IST);
    const utcDate = dateAt0000IST.toISOString().split('T')[0];

    assert.strictEqual(utcDate, '2026-03-14', 'UTC is still previous day');
    assert.strictEqual(istDate, '2026-03-15', '00:00 IST must be the new date 2026-03-15');
  });

  it('correctly maps 00:05 IST to the new Indian calendar date', () => {
    // 2026-03-15 00:05:00 IST is 2026-03-14 18:35:00 UTC
    const dateAt0005IST = new Date('2026-03-14T18:35:00.000Z');
    const istDate = getIndianBusinessDate(dateAt0005IST);
    const utcDate = dateAt0005IST.toISOString().split('T')[0];

    assert.strictEqual(utcDate, '2026-03-14', 'UTC is previous day');
    assert.strictEqual(istDate, '2026-03-15', '00:05 IST belongs to 2026-03-15');
  });

  it('correctly maps 00:30 IST to the new Indian calendar date despite UTC being previous day', () => {
    // 2026-03-15 00:30:00 IST is 2026-03-14 19:00:00 UTC
    const dateAt0030IST = new Date('2026-03-14T19:00:00.000Z');
    const istDate = getIndianBusinessDate(dateAt0030IST);
    const utcDate = dateAt0030IST.toISOString().split('T')[0];

    assert.strictEqual(utcDate, '2026-03-14', 'UTC date is previous day');
    assert.strictEqual(istDate, '2026-03-15', 'IST business date must be 2026-03-15');
  });

  it('correctly maps 05:29:59 IST to the same Indian calendar date despite UTC still being previous day', () => {
    // 2026-03-15 05:29:59 IST is 2026-03-14 23:59:59 UTC
    const dateAt0529IST = new Date('2026-03-14T23:59:59.000Z');
    const istDate = getIndianBusinessDate(dateAt0529IST);
    const utcDate = dateAt0529IST.toISOString().split('T')[0];

    assert.strictEqual(utcDate, '2026-03-14', 'UTC date is still previous day');
    assert.strictEqual(istDate, '2026-03-15', '05:29 IST must be 2026-03-15');
  });

  it('correctly maps 05:30:00 IST (UTC midnight) to the Indian date', () => {
    // 2026-03-15 05:30:00 IST is 2026-03-15 00:00:00 UTC
    const dateAt0530IST = new Date('2026-03-15T00:00:00.000Z');
    const istDate = getIndianBusinessDate(dateAt0530IST);
    assert.strictEqual(istDate, '2026-03-15', '05:30 IST must be 2026-03-15');
  });

  it('formats time string in 12-hour format with IST marker', () => {
    const testDate = new Date('2026-03-15T08:45:00.000Z'); // 14:15 IST (2:15 PM)
    const formatted = formatIndianTime(testDate);
    assert.match(formatted, /IST/);
    assert.match(formatted, /02:15|2:15/);
    assert.match(formatted, /pm|PM/);
  });

  it('correctly assesses staleness with STALE_THRESHOLD_MINUTES', () => {
    const now = new Date('2026-03-15T12:00:00.000Z');

    // 10 minutes old -> fresh
    const tenMinOld = new Date('2026-03-15T11:50:00.000Z').toISOString();
    assert.strictEqual(isTimestampStale(tenMinOld, now), false);

    // 59 minutes old -> fresh
    const fiftyNineMinOld = new Date('2026-03-15T11:01:00.000Z').toISOString();
    assert.strictEqual(isTimestampStale(fiftyNineMinOld, now), false);

    // 61 minutes old -> stale
    const sixtyOneMinOld = new Date('2026-03-15T10:59:00.000Z').toISOString();
    assert.strictEqual(isTimestampStale(sixtyOneMinOld, now), true);

    // Invalid timestamp -> considered stale
    assert.strictEqual(isTimestampStale('invalid-date', now), true);
    assert.strictEqual(isTimestampStale(undefined, now), true);

    assert.strictEqual(STALE_THRESHOLD_MINUTES, 60);
  });
});
