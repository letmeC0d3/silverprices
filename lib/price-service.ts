import yahooFinance from 'yahoo-finance2';
import { unstable_cache } from 'next/cache';
import { getLatestDailyRate, insertDailyRate, getHistoricalDailyRates } from './db';
import { LiveSilverPriceData, SilverRateBreakdown, DailyRateRecord } from './types';

// Suppress yahoo-finance2 survey console notices
try {
  yahooFinance.suppressNotices(['yahooSurvey']);
} catch {
  // Ignore
}

const TROY_OUNCE_TO_GRAMS = 31.1034768;
const DOMESTIC_DUTY_MULTIPLIER = 1.15; // ~15% combined BCD + AIDC + landing tariff
const RETAIL_PHYSICAL_PREMIUM = 1.04;   // ~4% physical bullion minting, assaying & dealer logistics margin
const GST_MULTIPLIER = 1.03;           // 3% standard Indian GST
const STERLING_PURITY = 0.925;          // 92.5% jewelry standard

function buildRateBreakdown(weightInGrams: number, label: string, pricePerGram999: number): SilverRateBreakdown {
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

function constructLivePriceData(
  spotPriceINRPerTroyOunce: number,
  change24hPerKg: number,
  changePercent24h: number,
  source: 'live' | 'cache' | 'fallback'
): LiveSilverPriceData {
  const basePricePerGram999 = spotPriceINRPerTroyOunce / TROY_OUNCE_TO_GRAMS;
  // Apply domestic duty (~15%) and retail dealer physical spread (~4%)
  const effectiveDutyPricePerGram999 = Math.round(basePricePerGram999 * DOMESTIC_DUTY_MULTIPLIER * RETAIL_PHYSICAL_PREMIUM * 100) / 100;
  const effectiveDutyPricePerKg999 = Math.round(effectiveDutyPricePerGram999 * 1000);
  const effectiveDutyPricePerGram925 = Math.round(effectiveDutyPricePerGram999 * STERLING_PURITY * 100) / 100;

  const now = new Date();
  const formattedTime = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  });

  return {
    timestamp: now.toISOString(),
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
    lastUpdatedFormatted: `${formattedTime} IST`,
  };
}

/**
 * High-reliability live price fetcher:
 * 1. Checks open real-time TradingView Scanner API (TVC:SILVER + FX_IDC:USDINR)
 * 2. Attempts Yahoo Finance XAGINR=X
 * 3. Falls back to SQLite daily_rates
 */
export async function fetchRawSilverRates(): Promise<LiveSilverPriceData> {
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

        const data = constructLivePriceData(spotPriceINR, changePerKg, silverChangePercent, 'live');

        // Persist snapshot to SQLite
        const today = new Date().toISOString().split('T')[0];
        insertDailyRate({
          date: today,
          price_per_gram_999: data.effectiveDutyPricePerGram999,
          price_per_kg_999: data.effectiveDutyPricePerKg999,
          price_per_gram_925: data.effectiveDutyPricePerGram925,
          change_24h: data.change24h,
          change_percent_24h: data.changePercent24h,
        });

        return data;
      }
    }
  } catch (err) {
    // Silently fall through to secondary provider
  }

  // Provider 2: Yahoo Finance quote
  try {
    const quotePromise = yahooFinance.quote('XAGINR=X');
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Yahoo Finance API request timed out')), 4000)
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const quote: any = await Promise.race([quotePromise, timeoutPromise]);

    if (quote && quote.regularMarketPrice) {
      const spotPrice = quote.regularMarketPrice;
      const changePerOunce = quote.regularMarketChange || 0;
      const changePercent = quote.regularMarketChangePercent || 0;

      const changePerKg = (changePerOunce / TROY_OUNCE_TO_GRAMS) * 1000 * DOMESTIC_DUTY_MULTIPLIER * RETAIL_PHYSICAL_PREMIUM;

      const data = constructLivePriceData(spotPrice, changePerKg, changePercent, 'live');

      const today = new Date().toISOString().split('T')[0];
      insertDailyRate({
        date: today,
        price_per_gram_999: data.effectiveDutyPricePerGram999,
        price_per_kg_999: data.effectiveDutyPricePerKg999,
        price_per_gram_925: data.effectiveDutyPricePerGram925,
        change_24h: data.change24h,
        change_percent_24h: data.changePercent24h,
      });

      return data;
    }
  } catch (error) {
    // Silently continue to fallback
  }

  // Provider 3: Fallback to most recent SQLite record
  return getFallbackFromDb();
}

/**
 * Fallback to most recent SQLite record
 */
export function getFallbackFromDb(): LiveSilverPriceData {
  const latest = getLatestDailyRate();
  if (latest) {
    const spotEquivalent = (latest.price_per_gram_999 / (DOMESTIC_DUTY_MULTIPLIER * RETAIL_PHYSICAL_PREMIUM)) * TROY_OUNCE_TO_GRAMS;
    return constructLivePriceData(
      spotEquivalent,
      latest.change_24h,
      latest.change_percent_24h,
      'fallback'
    );
  }

  // Realistic fallback spot in INR (~$64.35 * 95.54 = ~6,148 INR/oz)
  const fallbackSpotINR = 6148.2;
  return constructLivePriceData(fallbackSpotINR, 2450, 1.05, 'fallback');
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
