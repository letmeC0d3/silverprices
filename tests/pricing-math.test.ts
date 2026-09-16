import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('Pricing Mathematical Model & Multipliers Verification', () => {
  const TROY_OZ_TO_GRAMS = 31.1034768;
  const TARIFF_MULTIPLIER = 1.15; // 15% Indian import tariffs, cess & port handling
  const DEALER_PHYSICAL_SPREAD = 1.04; // 4% refining, transport & wholesale dealer margin
  const GST_RATE = 0.03; // 3% Indian GST on bullion

  it('verifies exact Troy ounce to gram conversion factor', () => {
    // 1 kg must equal ~32.1507 troy ounces
    const troyOzIn1Kg = 1000 / TROY_OZ_TO_GRAMS;
    assert.strictEqual(troyOzIn1Kg.toFixed(4), '32.1507');
  });

  it('verifies international parity price computation without tariffs or margins', () => {
    const silverUsdPerOz = 30.00;
    const usdInrRate = 85.00;

    // International parity in INR per gram = (silverUsdPerOz * usdInrRate) / TROY_OZ_TO_GRAMS
    const parityPerGram = (silverUsdPerOz * usdInrRate) / TROY_OZ_TO_GRAMS;
    // (30 * 85) / 31.1034768 = 2550 / 31.1034768 = ~81.9844
    assert.strictEqual(Math.round(parityPerGram * 100) / 100, 81.98);
  });

  it('verifies pre-tax landed domestic retail rate with statutory tariffs and physical delivery margins', () => {
    const parityPerGram = 81.9844;
    const landedDutyPrice = parityPerGram * TARIFF_MULTIPLIER; // 15% duty & cess
    const retailBenchmarkPrice = landedDutyPrice * DEALER_PHYSICAL_SPREAD; // 4% dealer spread

    // Combined pre-tax multiplier: 1.15 * 1.04 = 1.196 (+19.6% over international COMEX parity)
    const combinedFactor = TARIFF_MULTIPLIER * DEALER_PHYSICAL_SPREAD;
    assert.strictEqual(Math.round(combinedFactor * 1000) / 1000, 1.196);

    // Landed pre-tax price per gram
    const expectedPreTaxRate = parityPerGram * combinedFactor;
    assert.strictEqual(Math.round(retailBenchmarkPrice * 100) / 100, Math.round(expectedPreTaxRate * 100) / 100);
  });

  it('verifies statutory 3% retail GST stage calculation', () => {
    const preTaxPricePerGram = 98.05;
    const priceWithGst = preTaxPricePerGram * (1 + GST_RATE);
    const gstPortion = priceWithGst - preTaxPricePerGram;

    assert.strictEqual(Math.round(priceWithGst * 100) / 100, 100.99);
    assert.strictEqual(Math.round(gstPortion * 100) / 100, 2.94);
  });

  it('verifies purity conversion scale between 999 Fine and 925 Sterling silver', () => {
    const price999 = 100.00;
    const price925 = price999 * 0.925;
    assert.strictEqual(price925, 92.50);
  });
});
