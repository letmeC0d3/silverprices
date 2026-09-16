import yahooFinance from 'yahoo-finance2';
import { unstable_cache } from 'next/cache';
import { getLatestDailyRate, insertDailyRate, getHistoricalDailyRates } from './db';
import { LiveSilverPriceData, SilverRateBreakdown, DailyRateRecord } from './types';
import {
  getIndianBusinessDate,
  formatIndianTime,
  isTimestampStale,
  STALE_THRESHOLD_MINUTES,
} from './date-utils';

// Suppress yahoo-finance2 survey console notices
try {
  yahooFinance.suppressNotices(['yahooSurvey']);
} catch {
  // Ignore
}

const TROY_OUNCE_TO_GRAMS = 31.1034768;

/**
 * ECONOMIC PRICING METHODOLOGY & BENCHMARK MODEL (Classification: B — Hybrid Benchmark)
 * 
 * 1. International Spot Parity:
 *    Spot Silver (USD/troy oz) * USD/INR / 31.1034768 = International spot equivalent in INR/gram.
 * 
 * 2. Domestic Landed Bullion Benchmark Multiplier (1.15):
 *    - Composite benchmark factor: 1.15 (+15% landed domestic premium over international paper spot).
 *    - Regulatory Context: Under Union Budget 2024 (Customs Notification No. 31/2024-Customs,
 *      effective July 24, 2024), the statutory Basic Customs Duty (BCD) on commercial silver bullion
 *      (HSN 7106) was reduced to 6% (5% BCD + 1% AIDC).
 *    - Why 1.15 is used: Indian domestic physical bullion quotes do NOT trade at pure customs parity.
 *      Physical silver imported into Indian ports carries international supplier premiums, LC/banking fees,
 *      freight/insurance, CBIC tariff valuation fixing differentials (under Section 14(2) of the Customs Act, 1962),
 *      port handling, and domestic supply-demand premiums. Therefore, 1.15 is a composite domestic landed
 *      benchmark factor, blending the statutory tariff with physical landed delivery dynamics.
 * 
 * 3. Physical Retail Bullion Spread (1.04):
 *    - Benchmark Assumption: 1.04 (+4% physical distribution spread).
 *    - Approximates physical assay hallmarking, refining, vault storage, transit insurance, and wholesale/retail
 *      dealer margins across Indian bullion associations (such as IBJA). It is an industry benchmark assumption,
 *      NOT a statutory government levy.
 * 
 * 4. Combined Pre-Tax Multiplier:
 *    - 1.15 * 1.04 = 1.196 (+19.6% gross benchmark over international COMEX paper parity).
 *    - This closely calibrates to observed retail spot quotes (~₹2.35 - ₹2.50 Lakh/kg ex-GST).
 * 
 * 5. Statutory Goods and Services Tax (GST) (1.03):
 *    - Statutory Tax: 3% GST applied under HSN Chapter 71 (precious metals bullion) per CBIC GST notifications.
 */
export const DOMESTIC_LANDED_BENCHMARK_FACTOR = 1.15;
export const DOMESTIC_DUTY_MULTIPLIER = DOMESTIC_LANDED_BENCHMARK_FACTOR; // Backward compatibility alias
export const RETAIL_PHYSICAL_PREMIUM = 1.04;
export const GST_MULTIPLIER = 1.03;
export const STERLING_PURITY = 0.925;

export function buildRateBreakdown(weightInGrams: number, label: string, pricePerGram999: number): SilverRateBreakdown {
  const pricePure999 = Math.round(pricePerGram999 * weightInGrams * 100) / 100;
  const pricePure999WithGST = Math.round(pricePure999 * GST_MULTIPLIER * 100) / 100;
  const priceJewelry925 = Math.round(pricePerGram999 * STERLING_PURITY * weightInGrams * 100) / 100;
  const priceJewelry925WithGST = Math.round(priceJewelry925 * GST_MULTIPLIER * 100) / 100;

  return {
    weightInGrams,
    label,
    pricePure999,
    pricePure999WithGST,
    priceJewelry925,
    priceJewelry925WithGST,
  };
}

export function constructLivePriceData(
  spotPriceINRPerTroyOunce: number,
  change24hPerKg: number,
  changePercent24h: number,
  source: 'live' | 'cache' | 'fallback',
  timestampIso: string,
  snapshotDate: string,
  statusMessage?: string
): LiveSilverPriceData {
  const basePricePerGram999 = spotPriceINRPerTroyOunce / TROY_OUNCE_TO_GRAMS;
  const effectiveDutyPricePerGram999 = Math.round(basePricePerGram999 * DOMESTIC_DUTY_MULTIPLIER * RETAIL_PHYSICAL_PREMIUM * 100) / 100;
  const effectiveDutyPricePerKg999 = Math.round(effectiveDutyPricePerGram999 * 1000);
  const effectiveDutyPricePerGram925 = Math.round(effectiveDutyPricePerGram999 * STERLING_PURITY * 100) / 100;

  const isFallback = source === 'fallback';
  const isStale = isFallback || isTimestampStale(timestampIso, STALE_THRESHOLD_MINUTES);

  const parsedDate = new Date(timestampIso);
  const validDate = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
  const timeFormatted = formatIndianTime(validDate);

  const lastUpdatedFormatted = isFallback
    ? `${timeFormatted} (Offline Benchmark - ${snapshotDate})`
    : timeFormatted;

  return {
    timestamp: timestampIso,
    spotPriceINRPerTroyOunce: Math.round(spotPriceINRPerTroyOunce * 100) / 100,
    basePricePerGram999: Math.round(basePricePerGram999 * 100) / 100,
    effectiveDutyPricePerGram999,
    effectiveDutyPricePerKg999,
    effectiveDutyPricePerGram925,
    change24h: Math.round(change24hPerKg * 100) / 100,
    changePercent24h: Math.round(changePercent24h * 100) / 100,
    rates: {
      '1g': buildRateBreakdown(1, '1 Gram', effectiveDutyPricePerGram999),
      '8g': buildRateBreakdown(8, '8 Grams (Pavalam)', effectiveDutyPricePerGram999),
      '10g': buildRateBreakdown(10, '10 Grams (Tola)', effectiveDutyPricePerGram999),
      '100g': buildRateBreakdown(100, '100 Grams', effectiveDutyPricePerGram999),
      '1kg': buildRateBreakdown(1000, '1 Kilogram (1000g)', effectiveDutyPricePerGram999),
    },
    source,
    isFallback,
    isStale,
    lastUpdatedFormatted,
    snapshotDate,
    statusMessage,
  };
}

/**
 * High-reliability live price fetcher:
 * 1. Checks institutional TradingView Scanner API (TVC:SILVER + FX_IDC:USDINR)
 * 2. Attempts Yahoo Finance XAGINR=X
 * 3. Falls back to SQLite daily_rates (with true historical timestamp preserved)
 */
export async function fetchRawSilverRates(): Promise<LiveSilverPriceData> {
  const now = new Date();
  const todayIST = getIndianBusinessDate(now);

  // Provider 1: Real-time market feed
  try {
    const [silverRes, forexRes] = await Promise.all([
      fetch('https://scanner.tradingview.com/cfd/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbols: { tickers: ['TVC:SILVER'] },
          columns: ['close', 'change', 'change_abs'],
        }),
        signal: AbortSignal.timeout(4000),
      }).then((r) => r.json()),
      fetch('https://scanner.tradingview.com/forex/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbols: { tickers: ['FX_IDC:USDINR'] },
          columns: ['close', 'change', 'change_abs'],
        }),
        signal: AbortSignal.timeout(4000),
      }).then((r) => r.json()),
    ]);

    if (silverRes?.data?.[0]?.d && forexRes?.data?.[0]?.d) {
      const silverUSD = Number(silverRes.data[0].d[0]);
      const silverChangePercent = Number(silverRes.data[0].d[1]) || 0;
      const usdinr = Number(forexRes.data[0].d[0]);

      if (silverUSD > 0 && usdinr > 0) {
        const spotPriceINR = silverUSD * usdinr;
        const changePerGram = (spotPriceINR / TROY_OUNCE_TO_GRAMS) * (silverChangePercent / 100);
        const changePerKg = changePerGram * 1000 * DOMESTIC_DUTY_MULTIPLIER * RETAIL_PHYSICAL_PREMIUM;

        const data = constructLivePriceData(
          spotPriceINR,
          changePerKg,
          silverChangePercent,
          'live',
          now.toISOString(),
          todayIST
        );

        // Persist snapshot to SQLite with Indian business date
        insertDailyRate({
          date: todayIST,
          price_per_gram_999: data.effectiveDutyPricePerGram999,
          price_per_kg_999: data.effectiveDutyPricePerKg999,
          price_per_gram_925: data.effectiveDutyPricePerGram925,
          change_24h: data.change24h,
          change_percent_24h: data.changePercent24h,
        });

        return data;
      }
    }
  } catch {
    // Silently fall through to secondary provider
  }

  // Provider 2: Yahoo Finance quote
  try {
    const quotePromise = yahooFinance.quote('XAGINR=X');
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Yahoo Finance API request timed out')), 4000)
    );

    const quote = (await Promise.race([quotePromise, timeoutPromise])) as {
      regularMarketPrice?: number;
      regularMarketChange?: number;
      regularMarketChangePercent?: number;
    } | null | undefined;

    if (quote && quote.regularMarketPrice) {
      const spotPrice = quote.regularMarketPrice;
      const changePerOunce = quote.regularMarketChange || 0;
      const changePercent = quote.regularMarketChangePercent || 0;

      const changePerKg = (changePerOunce / TROY_OUNCE_TO_GRAMS) * 1000 * DOMESTIC_DUTY_MULTIPLIER * RETAIL_PHYSICAL_PREMIUM;

      const data = constructLivePriceData(
        spotPrice,
        changePerKg,
        changePercent,
        'live',
        now.toISOString(),
        todayIST
      );

      insertDailyRate({
        date: todayIST,
        price_per_gram_999: data.effectiveDutyPricePerGram999,
        price_per_kg_999: data.effectiveDutyPricePerKg999,
        price_per_gram_925: data.effectiveDutyPricePerGram925,
        change_24h: data.change24h,
        change_percent_24h: data.changePercent24h,
      });

      return data;
    }
  } catch {
    // Silently continue to fallback
  }

  // Provider 3: Fallback to most recent SQLite record
  return getFallbackFromDb();
}

/**
 * Fallback to most recent SQLite record with preserved historical timestamp
 */
export function getFallbackFromDb(): LiveSilverPriceData {
  const latest = getLatestDailyRate();
  if (latest) {
    const spotEquivalent = (latest.price_per_gram_999 / (DOMESTIC_DUTY_MULTIPLIER * RETAIL_PHYSICAL_PREMIUM)) * TROY_OUNCE_TO_GRAMS;
    const historicalTimestamp = latest.created_at ? new Date(latest.created_at + 'Z').toISOString() : new Date().toISOString();
    return constructLivePriceData(
      spotEquivalent,
      latest.change_24h,
      latest.change_percent_24h,
      'fallback',
      historicalTimestamp,
      latest.date,
      'Offline Snapshot'
    );
  }

  // Realistic fallback spot in INR (~$64.35 * 95.54 = ~6,148 INR/oz)
  const fallbackSpotINR = 6148.2;
  const fallbackDate = getIndianBusinessDate();
  return constructLivePriceData(
    fallbackSpotINR,
    2450,
    1.05,
    'fallback',
    new Date().toISOString(),
    fallbackDate,
    'Initial Benchmark'
  );
}

/**
 * 15-minute cached Next.js wrapper
 */
const getCachedSilverRates = unstable_cache(
  async () => {
    return await fetchRawSilverRates();
  },
  ['live-silver-prices-cache'],
  {
    revalidate: 900, // 15 minutes = 900 seconds
    tags: ['silver-rates'],
  }
);

/**
 * Main public entrypoint for silver rates
 */
export async function getLiveSilverPrices(): Promise<LiveSilverPriceData> {
  try {
    return await getCachedSilverRates();
  } catch {
    return await fetchRawSilverRates();
  }
}

/**
 * Fetch 30-day historical rates for trend charts
 */
export function getHistoricalRates(days = 30): DailyRateRecord[] {
  return getHistoricalDailyRates(days);
}
