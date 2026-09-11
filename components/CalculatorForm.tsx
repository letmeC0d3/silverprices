'use client';

import { useState } from 'react';
import { Calculator, ArrowRight, RefreshCcw, ShieldAlert, Sparkles, CircleDollarSign } from 'lucide-react';

interface CalculatorFormProps {
  basePricePerGram999: number; // Spot + duty per gram
}

export default function CalculatorForm({ basePricePerGram999 }: CalculatorFormProps) {
  const [weight, setWeight] = useState<number>(50);
  const [unit, setUnit] = useState<'grams' | 'kg'>('grams');
  const [purity, setPurity] = useState<'999' | '925' | '800' | '9999'>('999');
  const [makingChargesPercent, setMakingChargesPercent] = useState<number>(0);
  const [includeGST, setIncludeGST] = useState<boolean>(true);
  const [scrapDeductionPercent, setScrapDeductionPercent] = useState<number>(3); // 3% melting loss / refiner fee

  const weightInGrams = unit === 'kg' ? (weight || 0) * 1000 : (weight || 0);

  // Purity coefficient
  const purityMultiplier = {
    '9999': 0.9999,
    '999': 0.999,
    '925': 0.925,
    '800': 0.800,
  }[purity];

  // Calculations
  const metalBaseValue = weightInGrams * basePricePerGram999 * (purityMultiplier / 0.999);
  const makingChargesValue = metalBaseValue * ((makingChargesPercent || 0) / 100);
  const metalGST = includeGST ? metalBaseValue * 0.03 : 0;
  const makingGST = includeGST ? makingChargesValue * 0.05 : 0; // 5% GST on making charges in India
  const totalPurchaseValue = metalBaseValue + makingChargesValue + metalGST + makingGST;

  // Scrap / Resale Value (Jewellers do NOT pay back making charges or GST; they deduct melting/assaying ~2-4%)
  const scrapMeltValue = metalBaseValue * (1 - (scrapDeductionPercent || 0) / 100);

  const resetForm = () => {
    setWeight(50);
    setUnit('grams');
    setPurity('999');
    setMakingChargesPercent(0);
    setIncludeGST(true);
    setScrapDeductionPercent(3);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="p-6 sm:p-8 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Scrap &amp; Bullion Silver Calculator</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Calculate accurate retail buying cost or estimated jeweller scrap resale / melt payout
          </p>
        </div>

        <button
          type="button"
          onClick={resetForm}
          className="inline-flex items-center space-x-1.5 text-xs text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg transition-colors shadow-xs w-fit"
        >
          <RefreshCcw className="w-3.5 h-3.5" />
          <span>Reset Calculator</span>
        </button>
      </div>

      <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Inputs Section */}
        <div className="lg:col-span-7 space-y-6">
          {/* Weight Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              1. Silver Weight
            </label>
            <div className="flex rounded-xl shadow-xs overflow-hidden border border-slate-300 focus-within:ring-2 focus-within:ring-slate-900 focus-within:border-slate-900">
              <input
                type="number"
                min="0.1"
                step="any"
                value={weight || ''}
                onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                placeholder="e.g. 50"
                className="w-full px-4 py-3 text-slate-900 text-lg font-bold focus:outline-none"
              />
              <div className="flex bg-slate-100 border-l border-slate-200 p-1">
                <button
                  type="button"
                  onClick={() => setUnit('grams')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    unit === 'grams' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Grams (g)
                </button>
                <button
                  type="button"
                  onClick={() => setUnit('kg')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    unit === 'kg' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Kilograms (kg)
                </button>
              </div>
            </div>
            {/* Quick Weight Pills */}
            <div className="flex flex-wrap gap-2 mt-2">
              {[10, 20, 50, 100, 250, 500, 1000].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => {
                    setWeight(g >= 1000 && unit === 'kg' ? g / 1000 : g);
                    setUnit(g >= 1000 ? 'kg' : 'grams');
                    if (g >= 1000) setWeight(g / 1000);
                  }}
                  className="text-[11px] font-mono bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-md transition-colors"
                >
                  {g >= 1000 ? `${g / 1000}kg` : `${g}g`}
                </button>
              ))}
            </div>
          </div>

          {/* Purity Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              2. Silver Purity Grade
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: '999', label: '999 Fine', desc: '99.9% Bullion' },
                { id: '925', label: '925 Sterling', desc: '92.5% Jewelry' },
                { id: '800', label: '800 Silver', desc: '80% Utensils' },
                { id: '9999', label: '9999 Pure', desc: '99.99% Mint' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPurity(p.id as any)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    purity === p.id
                      ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="font-bold text-sm">{p.label}</div>
                  <div className={`text-[11px] ${purity === p.id ? 'text-slate-300' : 'text-slate-500'}`}>
                    {p.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Making Charges Slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                3. Making Charges / Wastage
              </label>
              <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                {makingChargesPercent}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              step="1"
              value={makingChargesPercent}
              onChange={(e) => setMakingChargesPercent(parseInt(e.target.value) || 0)}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>0% (Cast Bullion Bar)</span>
              <span>8%-12% (Chains/Payal)</span>
              <span>20%+ (Temple Filigree)</span>
            </div>
          </div>

          {/* Taxes & Resale Deductions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
            {/* GST Switch */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Goods &amp; Services Tax (GST)
              </label>
              <button
                type="button"
                onClick={() => setIncludeGST(!includeGST)}
                className={`w-full p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                  includeGST
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <span>{includeGST ? 'Include 3% GST' : 'Zero Tax (Pre-GST)'}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${includeGST ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {includeGST ? 'ACTIVE' : 'OFF'}
                </span>
              </button>
            </div>

            {/* Scrap Melting Margin */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Melting/Assay Margin (Sell)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="0"
                  max="15"
                  value={scrapDeductionPercent}
                  onChange={(e) => setScrapDeductionPercent(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                />
                <span className="text-xs text-slate-500 font-mono">%</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Average Indian jeweller testing deduction</p>
            </div>
          </div>
        </div>

        {/* Right Output Comparison Cards */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          {/* Card 1: Retail Buying Cost */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Estimated Retail Buying Price</span>
              </span>
              <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                Showroom Cost
              </span>
            </div>

            <div className="text-3xl sm:text-4xl font-black tracking-tight font-mono tabular-nums text-white my-2">
              ₹{Math.round(totalPurchaseValue).toLocaleString('en-IN')}
            </div>

            <div className="space-y-1.5 text-xs text-slate-300 border-t border-slate-800 pt-3 mt-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Pure Silver Metal:</span>
                <span className="font-mono text-white">₹{Math.round(metalBaseValue).toLocaleString('en-IN')}</span>
              </div>
              {makingChargesPercent > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Making Charges ({makingChargesPercent}%):</span>
                  <span className="font-mono text-white">₹{Math.round(makingChargesValue).toLocaleString('en-IN')}</span>
                </div>
              )}
              {includeGST && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Total GST (3% metal + 5% making):</span>
                  <span className="font-mono text-emerald-400">+₹{Math.round(metalGST + makingGST).toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Scrap / Resale Payout */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 flex items-center space-x-1">
                <CircleDollarSign className="w-3.5 h-3.5 text-slate-500" />
                <span>Estimated Scrap / Resale Payout</span>
              </span>
              <span className="text-[10px] font-mono bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                Cash Realization
              </span>
            </div>

            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight font-mono tabular-nums text-slate-900 my-2">
              ₹{Math.round(scrapMeltValue).toLocaleString('en-IN')}
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-200 pt-3 mt-3">
              <div className="flex justify-between">
                <span>Net Pure Content:</span>
                <span className="font-mono font-medium text-slate-900">
                  {(weightInGrams * purityMultiplier).toFixed(2)} grams
                </span>
              </div>
              <div className="flex justify-between">
                <span>Refining / Assay Margin ({scrapDeductionPercent}%):</span>
                <span className="font-mono text-rose-600">
                  -₹{Math.round(metalBaseValue * (scrapDeductionPercent / 100)).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200/80 flex items-start space-x-2 text-[11px] text-amber-900">
              <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p>
                <strong>Resale Insight:</strong> Indian jewellers melt old silver and do not refund original GST or making charges. Always verify hallmarked weight before selling.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
