'use client';

import { useState } from 'react';
import { Calculator, ArrowRight, Check } from 'lucide-react';

interface QuickConverterProps {
  basePricePerGram999: number; // Effective duty rate per gram
}

export default function QuickConverter({ basePricePerGram999 }: QuickConverterProps) {
  const [weight, setWeight] = useState<number>(10);
  const [unit, setUnit] = useState<'grams' | 'kg'>('grams');
  const [purity, setPurity] = useState<'999' | '925'>('999');
  const [includeGST, setIncludeGST] = useState<boolean>(true);

  // Normalise weight to grams
  const grams = unit === 'kg' ? (weight || 0) * 1000 : (weight || 0);
  const purityMultiplier = purity === '999' ? 1.0 : 0.925;
  const baseValue = grams * basePricePerGram999 * purityMultiplier;
  const gstValue = includeGST ? baseValue * 0.03 : 0;
  const totalValue = baseValue + gstValue;

  const quickPresets = [
    { label: '5g', val: 5, u: 'grams' as const },
    { label: '10g Coin', val: 10, u: 'grams' as const },
    { label: '50g Bar', val: 50, u: 'grams' as const },
    { label: '100g Bar', val: 100, u: 'grams' as const },
    { label: '500g', val: 500, u: 'grams' as const },
    { label: '1 Kg Bar', val: 1, u: 'kg' as const },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Calculator className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Quick Silver Converter</h2>
        </div>
        <span className="text-xs font-mono text-slate-500">Live Formula</span>
      </div>

      {/* Quick Presets */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {quickPresets.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => {
              setWeight(preset.val);
              setUnit(preset.u);
            }}
            className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
              weight === preset.val && unit === preset.u
                ? 'bg-slate-900 text-white font-medium'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Input Column */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Enter Weight
            </label>
            <div className="flex rounded-xl shadow-xs overflow-hidden border border-slate-300 focus-within:ring-2 focus-within:ring-slate-900 focus-within:border-slate-900">
              <input
                type="number"
                min="0.1"
                step="any"
                value={weight || ''}
                onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                placeholder="Enter weight"
                className="w-full px-3.5 py-2.5 text-slate-900 text-base font-semibold focus:outline-none"
              />
              <div className="flex bg-slate-100 border-l border-slate-200 p-1">
                <button
                  type="button"
                  onClick={() => setUnit('grams')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                    unit === 'grams' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Grams (g)
                </button>
                <button
                  type="button"
                  onClick={() => setUnit('kg')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                    unit === 'kg' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Kilograms (kg)
                </button>
              </div>
            </div>
          </div>

          {/* Options: Purity & GST */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Silver Purity
              </label>
              <div className="flex p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setPurity('999')}
                  className={`flex-1 py-1.5 rounded-md font-semibold text-center transition-all ${
                    purity === '999' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  999 Fine
                </button>
                <button
                  type="button"
                  onClick={() => setPurity('925')}
                  className={`flex-1 py-1.5 rounded-md font-semibold text-center transition-all ${
                    purity === '925' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  925 Sterling
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Include 3% GST
              </label>
              <button
                type="button"
                onClick={() => setIncludeGST(!includeGST)}
                className={`w-full py-1.5 px-3 rounded-lg border text-xs font-semibold flex items-center justify-between transition-all ${
                  includeGST
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <span>{includeGST ? 'GST Applied (+3%)' : 'Pre-tax rate'}</span>
                <span
                  className={`w-4 h-4 rounded flex items-center justify-center ${
                    includeGST ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-transparent'
                  }`}
                >
                  <Check className="w-3 h-3" />
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Calculated Output Card */}
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/80 flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Estimated Total Retail Price
            </div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-mono tabular-nums mt-1">
              ₹{Math.round(totalValue).toLocaleString('en-IN')}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Pure Metal Base Value ({grams.toLocaleString('en-IN')}g @ ₹{(basePricePerGram999 * purityMultiplier).toFixed(2)}/g):</span>
              <span className="font-mono font-medium text-slate-800">₹{Math.round(baseValue).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Retail GST (3%):</span>
              <span className="font-mono font-medium text-slate-800">
                {includeGST ? `+₹${Math.round(gstValue).toLocaleString('en-IN')}` : '₹0 (Excluded)'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
