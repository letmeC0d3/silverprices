import Link from 'next/link';
import { Coins, TrendingUp, Calculator } from 'lucide-react';

interface NavbarProps {
  spotRatePerKg?: number;
  changePercent?: number;
  isFallback?: boolean;
}

export default function Navbar({ spotRatePerKg, changePercent = 0, isFallback = false }: NavbarProps) {
  const isPositive = changePercent >= 0;

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-700 via-slate-800 to-slate-900 flex items-center justify-center text-white shadow-sm group-hover:shadow transition-shadow">
                <Coins className="w-5 h-5 text-slate-200 group-hover:scale-105 transition-transform" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-slate-900">
                  SilverPrices<span className="text-emerald-600">.in</span>
                </span>
                <span className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider -mt-1">
                  India Bullion Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Center Spot Rate Badge */}
          {spotRatePerKg && (
            <div className="hidden md:flex items-center space-x-2 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-full text-xs font-mono">
              <span className="relative flex h-2 w-2">
                {!isFallback && (
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isPositive ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isFallback ? 'bg-amber-500' : isPositive ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
              </span>
              <span className="font-semibold text-slate-700">{isFallback ? 'Benchmark 1kg:' : '1kg 999:'}</span>
              <span className="font-bold text-slate-900 tabular-nums">
                ₹{spotRatePerKg.toLocaleString('en-IN')}
              </span>
              <span
                className={`font-semibold text-[11px] px-1.5 py-0.5 rounded ${
                  isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                }`}
              >
                {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
              </span>
            </div>
          )}

          {/* Navigation Items */}
          <nav className="flex items-center space-x-1 sm:space-x-4 text-sm font-medium">
            <Link
              href="/"
              className="px-3 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Rates
            </Link>
            <Link
              href="/#cities"
              className="px-3 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cities
            </Link>
            <Link
              href="/calculator"
              className="flex items-center space-x-1.5 px-3 py-1.5 text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors font-semibold"
            >
              <Calculator className="w-4 h-4 text-slate-600" />
              <span>Calculator</span>
            </Link>
            <Link
              href="/#etf"
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors font-semibold"
            >
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Silver ETFs</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
