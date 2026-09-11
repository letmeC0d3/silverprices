export interface SilverRateBreakdown {
  weightInGrams: number;
  label: string;
  pricePure999: number;       // Base without GST
  pricePure999WithGST: number; // With 3% GST
  priceJewelry925: number;     // Base without GST
  priceJewelry925WithGST: number; // With 3% GST
}

export interface LiveSilverPriceData {
  timestamp: string;
  spotPriceINRPerTroyOunce: number;
  basePricePerGram999: number;      // Spot converted to grams
  effectiveDutyPricePerGram999: number; // After ~15% import tariff
  effectiveDutyPricePerKg999: number;
  effectiveDutyPricePerGram925: number;
  change24h: number;                // Change per kg in INR
  changePercent24h: number;         // 24h percentage delta
  rates: {
    '1g': SilverRateBreakdown;
    '8g': SilverRateBreakdown;
    '10g': SilverRateBreakdown;
    '100g': SilverRateBreakdown;
    '1kg': SilverRateBreakdown;
  };
  source: 'live' | 'cache' | 'fallback';
  lastUpdatedFormatted: string;
}

export interface DailyRateRecord {
  id: number;
  date: string;                     // YYYY-MM-DD
  price_per_gram_999: number;
  price_per_kg_999: number;
  price_per_gram_925: number;
  change_24h: number;
  change_percent_24h: number;
  created_at: string;
}

export interface CityData {
  slug: string;
  name: string;
  state: string;
  region: 'North' | 'South' | 'West' | 'East' | 'Central';
  isMetro: boolean;
  premiumPerKg: number;              // Local freight/logistics adjustment in INR
  marketHubs: string[];
  localTradeInfo: string;
}

export interface SilverETF {
  name: string;
  symbol: string;
  amc: string;
  nav: number;
  changePercent: number;
  aumCrores: number;
  expenseRatio: number;
  trackingError: number;
  zerodhaUrl: string;
  angelOneUrl: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}
