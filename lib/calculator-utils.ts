export type PurityGrade = '9999' | '999' | '925' | '800';
export type WeightUnit = 'grams' | 'kg';

export interface ValuationInput {
  weight: number;
  unit: WeightUnit;
  purity: PurityGrade;
  makingChargesPercent: number;
  includeGST: boolean;
  scrapDeductionPercent: number;
  basePricePerGram999: number;
}

export interface ValuationResult {
  sanitizedWeightGrams: number;
  pureSilverGrams: number;
  metalBaseValue: number;
  makingChargesValue: number;
  metalGST: number;
  makingGST: number;
  totalPurchaseValue: number;
  scrapMeltValue: number;
  refiningDeductionValue: number;
  isValid: boolean;
}

const PURITY_MAP: Record<PurityGrade, number> = {
  '9999': 0.9999,
  '999': 0.999,
  '925': 0.925,
  '800': 0.800,
};

const MAX_WEIGHT_GRAMS = 1_000_000; // 1,000 kg sensible ceiling for retail calculator

export function calculateValuation(input: ValuationInput): ValuationResult {
  const {
    weight,
    unit,
    purity,
    makingChargesPercent,
    includeGST,
    scrapDeductionPercent,
    basePricePerGram999,
  } = input;

  // 1. Sanitize & clamp weight
  let rawWeight = typeof weight === 'number' && Number.isFinite(weight) ? weight : 0;
  rawWeight = Math.max(0, rawWeight);

  let weightInGrams = unit === 'kg' ? rawWeight * 1000 : rawWeight;
  weightInGrams = Math.min(weightInGrams, MAX_WEIGHT_GRAMS);

  // 2. Validate purity
  const purityMultiplier = PURITY_MAP[purity] ?? PURITY_MAP['999'];

  // 3. Sanitize percentages
  const safeMakingCharges = Math.min(50, Math.max(0, Number.isFinite(makingChargesPercent) ? makingChargesPercent : 0));
  const safeScrapDeduction = Math.min(30, Math.max(0, Number.isFinite(scrapDeductionPercent) ? scrapDeductionPercent : 0));
  const safeBasePrice = Math.max(0, Number.isFinite(basePricePerGram999) ? basePricePerGram999 : 0);

  // 4. Calculations
  const pureSilverGrams = weightInGrams * purityMultiplier;
  const metalBaseValue = weightInGrams * safeBasePrice * (purityMultiplier / 0.999);
  const makingChargesValue = metalBaseValue * (safeMakingCharges / 100);

  const metalGST = includeGST ? metalBaseValue * 0.03 : 0;
  const makingGST = includeGST ? makingChargesValue * 0.05 : 0; // 5% GST on making charges service
  const totalPurchaseValue = Math.max(0, metalBaseValue + makingChargesValue + metalGST + makingGST);

  const refiningDeductionValue = metalBaseValue * (safeScrapDeduction / 100);
  const scrapMeltValue = Math.max(0, metalBaseValue - refiningDeductionValue);

  return {
    sanitizedWeightGrams: Math.round(weightInGrams * 100) / 100,
    pureSilverGrams: Math.round(pureSilverGrams * 100) / 100,
    metalBaseValue: Math.round(metalBaseValue * 100) / 100,
    makingChargesValue: Math.round(makingChargesValue * 100) / 100,
    metalGST: Math.round(metalGST * 100) / 100,
    makingGST: Math.round(makingGST * 100) / 100,
    totalPurchaseValue: Math.round(totalPurchaseValue),
    scrapMeltValue: Math.round(scrapMeltValue),
    refiningDeductionValue: Math.round(refiningDeductionValue * 100) / 100,
    isValid: weightInGrams > 0 && safeBasePrice > 0,
  };
}
