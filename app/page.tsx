import { getLiveSilverPrices, getHistoricalRates } from '@/lib/price-service';
import HeroTicker from '@/components/HeroTicker';
import QuickConverter from '@/components/QuickConverter';
import PriceTrendChart from '@/components/PriceTrendChart';
import TopCitiesGrid from '@/components/TopCitiesGrid';
import SilverEtfTracker from '@/components/SilverEtfTracker';
import FaqAccordion from '@/components/FaqAccordion';
import AdBanner from '@/components/AdBanner';
import BrokerCTA from '@/components/BrokerCTA';
import faqsData from '@/data/faqs.json';
import { ArrowUpRight, ShieldCheck, Scale, BarChart3, Info } from 'lucide-react';

export const revalidate = 900; // 15-minute revalidation for ISR

export default async function HomePage() {
  const priceData = await getLiveSilverPrices();
  const historicalData = getHistoricalRates(30);

  const formattedDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10">
      {/* Top Breadcrumb & Page Title */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-700 bg-emerald-50 w-fit px-3 py-1 rounded-full mb-3 border border-emerald-200/60">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live Indian Commodity Market Desk &bull; {formattedDate}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
          Silver Rate in India Today ({formattedDate})
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-3xl leading-relaxed">
          Comprehensive real-time tracking for 999 Fine Bullion and 925 Sterling Jewelry Silver. 
          Calculated from international COMEX benchmarks, Indian customs duties, and statutory 3% GST.
        </p>
      </div>

      {/* Hero 3-Card Price Ticker */}
      <HeroTicker priceData={priceData} />

      {/* Top Ad Slot */}
      <AdBanner slot="leaderboard" />

      {/* Rates Matrix Table: 1g, 8g, 10g, 100g, 1kg */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                <Scale className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Today&apos;s Domestic Silver Rate Breakdown ({formattedDate})
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Standard Indian bullion weights comparing 999 fine silver vs 925 sterling jewelry silver
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
            Retail Benchmark Estimate
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50">
                <th className="py-3 px-4">Weight Category</th>
                <th className="py-3 px-4">999 Fine Silver (Base)</th>
                <th className="py-3 px-4">999 Pure (Incl. 3% GST)</th>
                <th className="py-3 px-4">925 Sterling (Base)</th>
                <th className="py-3 px-4">925 Jewelry (Incl. 3% GST)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-mono">
              {(['1g', '8g', '10g', '100g', '1kg'] as const).map((key) => {
                const item = priceData.rates[key];
                return (
                  <tr key={key} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-sans font-bold text-slate-900">
                      {item.label}
                    </td>
                    <td className="py-3 px-4 text-slate-700 tabular-nums">
                      ₹{item.pricePure999.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-950 tabular-nums bg-emerald-50/40">
                      ₹{item.pricePure999WithGST.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-slate-600 tabular-nums">
                      ₹{item.priceJewelry925.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800 tabular-nums">
                      ₹{item.priceJewelry925WithGST.toLocaleString('en-IN')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two Column Layout: Quick Converter & 30-Day Trend Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <QuickConverter basePricePerGram999={priceData.effectiveDutyPricePerGram999} />
        <PriceTrendChart data={historicalData} />
      </div>

      {/* Broker Affiliate CTA Box */}
      <BrokerCTA />

      {/* Top Cities Grid (Programmatic SEO Entrypoint) */}
      <TopCitiesGrid baseRatePerKg999WithGST={priceData.rates['1kg'].pricePure999WithGST} />

      {/* In-Feed Ad Slot */}
      <AdBanner slot="in-feed" />

      {/* Silver ETF Comparison Tracker */}
      <SilverEtfTracker />

      {/* Editorial Market Insight Section */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
            <Info className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Understanding Silver Pricing Dynamics in India</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600 leading-relaxed">
          <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">1. International Bullion Parity</h3>
            <p>
              Silver trades globally in USD per Troy Ounce (31.1035 grams). Domestic Indian rates dynamically fluctuate 
              with the USD/INR currency pair, international industrial demand from solar PV manufacturing, and geopolitical safe-haven flows.
            </p>
          </div>
          <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">2. Custom Duties &amp; Cesses</h3>
            <p>
              India is a net importer of white metal. The landed cost includes the Basic Customs Duty (BCD) alongside 
              the Agriculture Infrastructure and Development Cess (AIDC), creating a structured ~15% tariff wedge above international spot parity.
            </p>
          </div>
          <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">3. The 3% Statutory GST</h3>
            <p>
              Under Indian tax law, a flat 3% GST applies to the final invoice value of pure bullion bars and minted coins. 
              Jewellery crafting incurs an additional 5% GST specifically assessed on making charges.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Accordion with JSON-LD Schema */}
      <FaqAccordion faqs={faqsData} />
    </div>
  );
}
