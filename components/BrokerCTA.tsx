import { ArrowUpRight, Shield, CheckCircle2, TrendingUp } from 'lucide-react';

interface BrokerCTAProps {
  title?: string;
  subtitle?: string;
}

export default function BrokerCTA({
  title = 'Invest in Silver Digitally with Zero Making Charges',
  subtitle = 'Buy physical-backed Silver ETFs through India’s leading discount brokers. Avoid theft risk, locker fees, and high retail making margins.',
}: BrokerCTAProps) {
  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-sm relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="inline-flex items-center space-x-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full mb-3">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Zero Brokerage on Equity/ETF Delivery</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2">
          {title}
        </h3>
        <p className="text-sm text-slate-300 max-w-2xl leading-relaxed mb-6">
          {subtitle}
        </p>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 text-xs text-slate-300">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>100% Backed by 99.9% Pure Silver</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Instant Liquidity on NSE &amp; BSE</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Stored in SEBI-Regulated Vaults</span>
          </div>
        </div>

        {/* Broker Partner Action Buttons */}
        <div className="flex flex-wrap gap-3 items-center">
          <a
            href="https://indmoney.onelink.me/RmHC/vrcwqqp7"
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="inline-flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm text-sm"
          >
            <span>Invest on INDmoney (Code: AKS52BDSIND)</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>

          <a
            href="https://upstox.onelink.me/0H1s/33ARWE"
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="inline-flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-all border border-slate-700 text-sm"
          >
            <span>Open Upstox (Zero AMC)</span>
            <ArrowUpRight className="w-4 h-4 text-slate-400" />
          </a>

          <div className="flex items-center space-x-1.5 text-xs text-slate-400 pl-2">
            <Shield className="w-4 h-4 text-slate-500" />
            <span>SEBI Regulated &bull; Zero AMC Options</span>
          </div>
        </div>
      </div>
    </div>
  );
}
