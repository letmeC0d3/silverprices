import { TrendingUp, ExternalLink, ShieldCheck, Info } from 'lucide-react';
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
    indmoneyUrl: 'https://indmoney.onelink.me/RmHC/vrcwqqp7',
    upstoxUrl: 'https://upstox.onelink.me/0H1s/33ARWE',
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
    indmoneyUrl: 'https://indmoney.onelink.me/RmHC/vrcwqqp7',
    upstoxUrl: 'https://upstox.onelink.me/0H1s/33ARWE',
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
    indmoneyUrl: 'https://indmoney.onelink.me/RmHC/vrcwqqp7',
    upstoxUrl: 'https://upstox.onelink.me/0H1s/33ARWE',
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
    indmoneyUrl: 'https://indmoney.onelink.me/RmHC/vrcwqqp7',
    upstoxUrl: 'https://upstox.onelink.me/0H1s/33ARWE',
  },
];

export default function SilverEtfTracker() {
  return (
    <div id="etf" className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Indian Silver ETFs (Reference Directory)</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Physical-backed silver investment funds traded on NSE/BSE with Demat settlement
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full font-medium">
            <Info className="w-3.5 h-3.5" />
            <span>Indicative Reference Data (Not Live Ticks)</span>
          </div>
          <div className="flex items-center space-x-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>SEBI Regulated</span>
          </div>
        </div>
      </div>

      {/* ETF Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50">
              <th className="py-3 px-3">ETF Name &amp; Ticker</th>
              <th className="py-3 px-3">Reference NAV* (₹)</th>
              <th className="py-3 px-3">Indicative 24h Trend</th>
              <th className="py-3 px-3">AUM (₹ Cr)</th>
              <th className="py-3 px-3">TER (Expense)</th>
              <th className="py-3 px-3">Tracking Error</th>
              <th className="py-3 px-3 text-right">Terminal View</th>
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
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                    ~+{etf.changePercent.toFixed(2)}% (ref)
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
                      href={etf.indmoneyUrl}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="inline-flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-2.5 py-1.5 rounded-lg transition-colors text-[11px] shadow-xs"
                      title="Invest via INDmoney (Code: AKS52BDSIND)"
                    >
                      <span>INDmoney</span>
                      <ExternalLink className="w-3 h-3 text-emerald-200" />
                    </a>
                    <a
                      href={etf.upstoxUrl}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="inline-flex items-center space-x-1 bg-slate-900 hover:bg-slate-800 text-white font-medium px-2.5 py-1.5 rounded-lg transition-colors text-[11px]"
                      title="Trade via Upstox (Zero AMC & Brokerage)"
                    >
                      <span>Upstox</span>
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
        <strong>*Disclaimer &amp; Data Currency:</strong> Net Asset Values (NAV), AUM, and expense ratios shown above are static reference benchmark values compiled from public AMC factsheets (As of Q1 2026). SilverPrices.in is an informational benchmark portal and does not stream real-time exchange order-book ticks for equities. For live execution prices, bid-ask spreads, and trading between 9:15 AM and 3:30 PM IST, please consult your SEBI-registered broker terminal directly (e.g. INDmoney or Upstox).
      </div>
    </div>
  );
}
