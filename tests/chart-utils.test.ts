import { describe, it } from 'node:test';
import assert from 'node:assert';
import { computeChartGeometry, ChartRecord } from '../lib/chart-utils';

describe('Chart Single-Point & Edge-Case Robustness', () => {
  it('cleanly handles 0 data points without throwing errors', () => {
    const geo = computeChartGeometry([]);
    assert.strictEqual(geo.points.length, 0);
    assert.strictEqual(geo.pathD, '');
    assert.strictEqual(geo.areaD, '');
    assert.strictEqual(geo.minPrice, 0);
    assert.strictEqual(geo.maxPrice, 0);
  });

  it('cleanly handles 1 data point without division by zero or NaN', () => {
    const singleData: ChartRecord[] = [
      {
        date: '2026-03-15',
        price_per_kg_999: 98500,
        change_percent_24h: 0,
      },
    ];

    const geo = computeChartGeometry(singleData, 800, 260, 40, 25, 35);

    assert.strictEqual(geo.points.length, 1);
    assert.strictEqual(Number.isNaN(geo.points[0].x), false, 'X coordinate must not be NaN');
    assert.strictEqual(Number.isNaN(geo.points[0].y), false, 'Y coordinate must not be NaN');
    assert.strictEqual(geo.points[0].x, 400, 'Single point should be horizontally centered');
    assert.strictEqual(geo.totalChange, 0);
    assert.strictEqual(geo.totalChangePercent, 0);

    // Path must not contain 'NaN'
    assert.strictEqual(geo.pathD.includes('NaN'), false, 'Path string must not contain NaN');
    assert.strictEqual(geo.areaD.includes('NaN'), false, 'Area string must not contain NaN');
    assert.match(geo.pathD, /^M 40,\d+(\.\d+)? L 760,\d+(\.\d+)?$/);
  });

  it('correctly handles 2 data points', () => {
    const twoPoints: ChartRecord[] = [
      { date: '2026-03-14', price_per_kg_999: 98000, change_percent_24h: 0 },
      { date: '2026-03-15', price_per_kg_999: 99000, change_percent_24h: 1.02 },
    ];

    const geo = computeChartGeometry(twoPoints, 800, 260, 40, 25, 35);

    assert.strictEqual(geo.points.length, 2);
    assert.strictEqual(geo.points[0].x, 40); // left padding
    assert.strictEqual(geo.points[1].x, 760); // right padding boundary (800 - 40)
    assert.strictEqual(geo.totalChange, 1000);
    assert.strictEqual(geo.minPrice, 98000);
    assert.strictEqual(geo.maxPrice, 99000);
    assert.strictEqual(geo.isUp, true);
    assert.strictEqual(geo.pathD.includes('NaN'), false);
  });

  it('correctly calculates geometry for 30 historical records', () => {
    const records: ChartRecord[] = Array.from({ length: 30 }, (_, i) => ({
      date: `2026-02-${String(i + 1).padStart(2, '0')}`,
      price_per_kg_999: 90000 + i * 200,
      change_percent_24h: 0.2,
    }));

    const geo = computeChartGeometry(records, 800, 260, 40, 25, 35);

    assert.strictEqual(geo.points.length, 30);
    assert.strictEqual(geo.points[0].x, 40);
    assert.strictEqual(geo.points[29].x, 760);
    assert.strictEqual(geo.minPrice, 90000);
    assert.strictEqual(geo.maxPrice, 90000 + 29 * 200);
    assert.strictEqual(geo.pathD.includes('NaN'), false);
  });
});
