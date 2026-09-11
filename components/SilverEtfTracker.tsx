import { TrendingUp, ExternalLink, ShieldCheck } from 'lucide-react';
import { SilverETF } from '../lib/types';

const SILVER_ETFS: SilverETF[] = [
  {
    name: 'Nippon India Silver ETF',
    symbol: 'SILVERBEES',
    amc: 'Nippon Life India AM',
    nav: 216.72,
    changePercent: 1.25,
    aumCrores: 5840,
    expenseRatio: 0.48,
    trackingError: 0.12,
    zerodhaUrl: 'https://kite.zerodha.com/',
    angelOneUrl: 'https://www.angelone.in/',
  },
  {
    name: 'ICICI Prudential Silver ETF',
    symbol: 'ICICISILV',
    amc: 'ICICI Prudential AMC',
    nav: 218.15,
    changePercent: 1.20,
    aumCrores: 3920,
    expenseRatio: 0.44,
    trackingError: 0.14,
    zerodhaUrl: 'https://kite.zerodha.com/',
    angelOneUrl: 'https://www.angelone.in/',
  },
  {
    name: 'HDFC Silver ETF',
    symbol: 'HDFCSILVER',
    amc: 'HDFC AMC',
    nav: 216.48,
    changePercent: 1.28,
    aumCrores: 2750,
    expenseRatio: 0.40,
    trackingError: 0.11,
    zerodhaUrl: 'https://kite.zerodha.com/',
    angelOneUrl: 'https://www.angelone.in/',
  },
  {
    name: 'Tata Silver ETF',
    symbol: 'TATASILV',
    amc: 'Tata Mutual Fund',
    nav: 215.80,
    changePercent: 1.15,
    aumCrores: 1280,
    expenseRatio: 0.38,
    trackingError: 0.15,
    zerodhaUrl: 'https://kite.zerodha.com/',
    angelOneUrl: 'https://www.angelone.in/',
  },
];

export default function SilverEtfTracker() {
  return (
    <div id="etf" className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Top Indian Silver ETFs (Paper Silver Tracker)</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Trade 99.9% physical-backed silver on NSE/BSE with high liquidity, 0% making charges, and zero bank locker fees
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full font-medium w-fit">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>SEBI Regulated &bull; Demat Delivery</span>
        </div>
      </div>

      {/* ETF Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50">
              <th className="py-3 px-3">ETF Name &amp; Ticker</th>
              <th className="py-3 px-3">NAV (₹)</th>
              <th className="py-3 px-3">24h Return</th>
              <th className="py-3 px-3">AUM (₹ Cr)</th>
              <th className="py-3 px-3">Expense Ratio</th>
              <th className="py-3 px-3">Tracking Error</th>
              <th className="py-3 px-3 text-right">Invest / Trade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {SILVER_ETFS.map((etf) => (
              <tr key={etf.symbol} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3.5 px-3">
                  <div className="font-bold text-slate-900">{etf.name}</div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    NSE: <span className="text-slate-800 font-semibold">{etf.symbol}</span> &bull; {etf.amc}
                  </div>
                </td>
                <td className="py-3.5 px-3 font-mono font-bold text-slate-900 tabular-nums">
                  ₹{etf.nav.toFixed(2)}
                </td>
                <td className="py-3.5 px-3 font-mono">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700">
                    +{etf.changePercent.toFixed(2)}%
                  </span>
                </td>
                <td className="py-3.5 px-3 font-mono text-slate-700 tabular-nums">
                  ₹{etf.aumCrores.toLocaleString('en-IN')} Cr
                </td>
                <td className="py-3.5 px-3 font-mono text-slate-700">
                  {etf.expenseRatio}%
                </td>
                <td className="py-3.5 px-3 font-mono text-slate-700">
                  {etf.trackingError}%
                </td>
                <td className="py-3.5 px-3 text-right">
                  <div className="inline-flex items-center space-x-1.5">
                    <a
                      href={etf.zerodhaUrl}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="inline-flex items-center space-x-1 bg-slate-900 hover:bg-slate-800 text-white font-medium px-2.5 py-1.5 rounded-lg transition-colors text-[11px]"
                    >
                      <span>Zerodha</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                    <a
                      href={etf.angelOneUrl}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="inline-flex items-center space-x-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium px-2.5 py-1.5 rounded-lg transition-colors text-[11px]"
                    >
                      <span>AngelOne</span>
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
