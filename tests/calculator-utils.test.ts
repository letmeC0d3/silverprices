import { describe, it } from 'node:test';
import assert from 'node:assert';
import { calculateValuation } from '../lib/calculator-utils';

describe('Calculator Input Validation & Valuation Logic', () => {
  const baseRatePerGram = 100; // Base ₹100 per gram for 999 silver

  it('calculates accurate valuation for standard 10g 999 silver with 3% GST', () => {
    const result = calculateValuation({
      weight: 10,
      unit: 'grams',
      purity: '999',
      makingChargesPercent: 0,
      includeGST: true,
      scrapDeductionPercent: 0,
      basePricePerGram999: baseRatePerGram,
    });

    assert.strictEqual(result.sanitizedWeightGrams, 10);
    assert.strictEqual(result.metalBaseValue, 1000);
    assert.strictEqual(result.makingChargesValue, 0);
    assert.strictEqual(result.metalGST, 30); // 3% of 1000
    assert.strictEqual(result.totalPurchaseValue, 1030);
    assert.strictEqual(result.isValid, true);
  });

  it('calculates accurate valuation for 1kg 925 sterling silver with 10% making charges', () => {
    const result = calculateValuation({
      weight: 1,
      unit: 'kg',
      purity: '925',
      makingChargesPercent: 10,
      includeGST: true,
      scrapDeductionPercent: 2,
      basePricePerGram999: baseRatePerGram,
    });

    assert.strictEqual(result.sanitizedWeightGrams, 1000);
    // 1000g * 100 * (0.925 / 0.999) = 92592.59
    assert.strictEqual(result.metalBaseValue, 92592.59);
    // 10% making charges = 9259.26
    assert.strictEqual(result.makingChargesValue, 9259.26);
    // 3% GST on metal = 2777.78
    assert.strictEqual(result.metalGST, 2777.78);
    // 5% GST on making charges = 462.96
    assert.strictEqual(result.makingGST, 462.96);
    // Total = 92592.59 + 9259.26 + 2777.78 + 462.96 = 105093
    assert.strictEqual(result.totalPurchaseValue, 105093);
    assert.strictEqual(result.isValid, true);
  });

  it('rejects negative weight and clamps to 0 without producing negative monetary valuation', () => {
    const result = calculateValuation({
      weight: -50,
      unit: 'grams',
      purity: '999',
      makingChargesPercent: -10,
      includeGST: true,
      scrapDeductionPercent: -5,
      basePricePerGram999: baseRatePerGram,
    });

    assert.strictEqual(result.sanitizedWeightGrams, 0);
    assert.strictEqual(result.metalBaseValue, 0);
    assert.strictEqual(result.makingChargesValue, 0);
    assert.strictEqual(result.metalGST, 0);
    assert.strictEqual(result.totalPurchaseValue, 0);
    assert.strictEqual(result.scrapMeltValue, 0);
    assert.strictEqual(result.isValid, false);
  });

  it('cleanly handles NaN, Infinity, negative Infinity, and undefined inputs', () => {
    const resultNaN = calculateValuation({
      weight: NaN,
      unit: 'grams',
      purity: '999',
      makingChargesPercent: NaN,
      includeGST: true,
      scrapDeductionPercent: NaN,
      basePricePerGram999: baseRatePerGram,
    });
    assert.strictEqual(resultNaN.totalPurchaseValue, 0);
    assert.strictEqual(resultNaN.isValid, false);

    const resultInf = calculateValuation({
      weight: Infinity,
      unit: 'grams',
      purity: '999',
      makingChargesPercent: 0,
      includeGST: true,
      scrapDeductionPercent: 0,
      basePricePerGram999: baseRatePerGram,
    });
    assert.strictEqual(resultInf.totalPurchaseValue, 0);
    assert.strictEqual(resultInf.isValid, false);
  });

  it('clamps excessive inputs to maximum allowable ceiling (1,000,000g / 1,000kg)', () => {
    const excessiveWeight = 5_000_000;
    const result = calculateValuation({
      weight: excessiveWeight,
      unit: 'grams',
      purity: '999',
      makingChargesPercent: 0,
      includeGST: false,
      scrapDeductionPercent: 0,
      basePricePerGram999: 100,
    });

    assert.strictEqual(result.sanitizedWeightGrams, 1_000_000);
    assert.strictEqual(result.totalPurchaseValue, 1_000_000 * 100);
  });

  it('correctly computes scrap melt value with scrap refining deduction', () => {
    const result = calculateValuation({
      weight: 100,
      unit: 'grams',
      purity: '999',
      makingChargesPercent: 0,
      includeGST: false,
      scrapDeductionPercent: 5, // 5% refining deduction
      basePricePerGram999: 100,
    });

    assert.strictEqual(result.metalBaseValue, 10000);
    assert.strictEqual(result.refiningDeductionValue, 500);
    assert.strictEqual(result.scrapMeltValue, 9500);
  });
});
