'use client';

import { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Clock, Sparkles } from 'lucide-react';
import { LiveSilverPriceData } from '../lib/types';

interface HeroTickerProps {
  priceData: LiveSilverPriceData;
}

export default function HeroTicker({ priceData }: HeroTickerProps) {
  const [includeGST, setIncludeGST] = useState<boolean>(true);
  const isPositive = priceData.change24h >= 0;

  const cards = [
    {
      weight: '1 Gram',
      code: '1g' as const,
      sublabel: 'Standard retail retail unit',
      ratePure: includeGST ? priceData.rates['1g'].pricePure999WithGST : priceData.rates['1g'].pricePure999,
      rateJewelry: includeGST ? priceData.rates['1g'].priceJewelry925WithGST : priceData.rates['1g'].priceJewelry925,
      delta: (priceData.change24h / 1000) * (includeGST ? 1.03 : 1.0),
    },
    {
      weight: '10 Grams',
      code: '10g' as const,
      sublabel: 'Most popular bullion coin weight',
      ratePure: includeGST ? priceData.rates['10g'].pricePure999WithGST : priceData.rates['10g'].pricePure999,
      rateJewelry: includeGST ? priceData.rates['10g'].priceJewelry925WithGST : priceData.rates['10g'].priceJewelry925,
      delta: ((priceData.change24h / 1000) * 10) * (includeGST ? 1.03 : 1.0),
    },
    {
      weight: '1 Kilogram',
      code: '1kg' as const,
      sublabel: 'Standard MCX bullion bar unit',
      ratePure: includeGST ? priceData.rates['1kg'].pricePure999WithGST : priceData.rates['1kg'].pricePure999,
      rateJewelry: includeGST ? priceData.rates['1kg'].priceJewelry925WithGST : priceData.rates['1kg'].priceJewelry925,
      delta: priceData.change24h * (includeGST ? 1.03 : 1.0),
      isPrimary: true,
    },
  ];

  return (
    <div className="w-full">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-200">
        <div className="flex items-center space-x-2 text-xs text-slate-500 font-mono">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Last Updated: <strong className="text-slate-800">{priceData.lastUpdatedFormatted}</strong></span>
          <span className="text-slate-300">&bull;</span>
          <span className="capitalize text-slate-600">Feed: {priceData.source}</span>
        </div>

        {/* GST Switcher */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-600 font-medium">Show Rates:</span>
          <div className="inline-flex p-0.5 bg-slate-200/80 rounded-lg">
            <button
              onClick={() => setIncludeGST(true)}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                includeGST
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              With 3% GST
            </button>
            <button
              onClick={() => setIncludeGST(false)}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                !includeGST
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Excl. GST (Base)
            </button>
          </div>
        </div>
      </div>

      {/* Hero Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        {cards.map((c) => (
          <div
            key={c.code}
            className={`rounded-2xl p-5 sm:p-6 transition-all border ${
              c.isPrimary
                ? 'bg-gradient-to-b from-white to-slate-50/80 border-slate-300 shadow-sm ring-1 ring-slate-900/5'
                : 'bg-white border-slate-200/80 shadow-xs hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-slate-900">{c.weight}</span>
                {c.isPrimary && (
                  <span className="inline-flex items-center space-x-1 bg-slate-900 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                    <span>Benchmark</span>
                  </span>
                )}
              </div>

              {/* 24h Change Pill */}
              <div
                className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold font-mono ${
                  isPositive
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                    : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                }`}
              >
                {isPositive ? (
                  <ArrowUpRight className="w-3.5 h-3.5" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5" />
                )}
                <span>
                  {isPositive ? '+' : ''}₹{Math.abs(Math.round(c.delta)).toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] opacity-80">
                  ({isPositive ? '+' : ''}{priceData.changePercent24h.toFixed(2)}%)
                </span>
              </div>
            </div>

            {/* Primary 999 Fine Silver Price */}
            <div className="mt-3">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                999 Fine Silver (Pure Bullion)
              </div>
              <div className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight tabular-nums mt-1 font-mono">
                ₹{c.ratePure.toLocaleString('en-IN')}
              </div>
            </div>

            {/* Secondary 925 Jewelry Price */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">925 Sterling (Jewelry):</span>
              <span className="font-bold text-slate-800 font-mono tabular-nums">
                ₹{c.rateJewelry.toLocaleString('en-IN')}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 mt-2">
              {c.sublabel} {includeGST ? '&bull; Incl. 3% GST' : '&bull; Pre-tax rate'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
