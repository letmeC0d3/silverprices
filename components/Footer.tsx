import Link from 'next/link';
import { ShieldCheck, Info, MapPin } from 'lucide-react';
import citiesData from '../data/cities.json';
import { CityData } from '../lib/types';

export default function Footer() {
  const allCities = citiesData as CityData[];

  const regions: Array<{ name: string; regionKey: CityData['region'] }> = [
    { name: 'North India', regionKey: 'North' },
    { name: 'South India', regionKey: 'South' },
    { name: 'West India', regionKey: 'West' },
    { name: 'East India', regionKey: 'East' },
    { name: 'Central India', regionKey: 'Central' },
  ];

  return (
    <footer className="bg-slate-900 text-slate-300 pt-14 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top Footer: Brand, Tools & Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-10 border-b border-slate-800">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight text-white">
                SilverPrices<span className="text-emerald-400">.in</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              India&apos;s authoritative real-time silver rate intelligence platform. Tracking domestic retail bullion, 
              jewelry benchmarks (925 sterling &amp; 999 fine), regional city premiums, and Silver ETFs with 3% statutory GST.
            </p>
            <div className="flex items-center space-x-2 text-[11px] text-emerald-400 font-mono bg-slate-800/80 px-2.5 py-1.5 rounded-md border border-slate-700/60 w-fit">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Free &amp; Open Indian Market Intelligence</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
              Calculators &amp; Portals
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Live Silver Rates Today (National Parity)
                </Link>
              </li>
              <li>
                <Link href="/calculator" className="hover:text-white transition-colors">
                  Scrap &amp; Bullion Calculator (999, 925, 800)
                </Link>
              </li>
              <li>
                <Link href="/#etf" className="hover:text-white transition-colors">
                  Silver ETF Comparison Tracker
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-white transition-colors">
                  Precious Metals Tax &amp; GST FAQ
                </Link>
              </li>
              <li>
                <Link href="/sitemap.xml" className="hover:text-white transition-colors">
                  XML Sitemap
                </Link>
              </li>
            </ul>
          </div>

          {/* Market Summary */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
              Indian Bullion Benchmark Standards
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Physical retail benchmarks quoted reflect international COMEX USD spot parity, domestic landed import adjustments (BCD + AIDC under Union Budget 2024), physical refining/distribution spreads, and statutory 3% retail GST.
            </p>
            <div className="mt-4 flex items-center space-x-2 text-[11px] text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tracking 30 Major Bullion Guilds Across India</span>
            </div>
          </div>
        </div>

        {/* Comprehensive Regional City Directory (All 30 Cities - Eliminating Orphan Pages) */}
        <div className="pb-10 border-b border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Silver Rates Across India (Regional City Directory)
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">30 Major Cities Indexed</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 text-xs">
            {regions.map((reg) => {
              const citiesInRegion = allCities.filter((c) => c.region === reg.regionKey);
              return (
                <div key={reg.name} className="space-y-3">
                  <div className="text-[11px] font-bold text-emerald-400 border-b border-slate-800 pb-1.5 uppercase tracking-wide">
                    {reg.name}
                  </div>
                  <ul className="space-y-1.5">
                    {citiesInRegion.map((city) => (
                      <li key={city.slug}>
                        <Link
                          href={`/silver-rate-in-${city.slug}`}
                          className="hover:text-emerald-400 transition-colors text-slate-400 hover:underline block truncate"
                          title={`Silver Rate in ${city.name} Today`}
                        >
                          Silver Rate in {city.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="pt-2 flex flex-col md:flex-row items-start md:items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex items-start space-x-2 max-w-3xl">
            <Info className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
            <p className="leading-normal">
              <strong>Disclaimer:</strong> Spot silver quotes and retail calculations are provided for informational 
              and educational purposes only. Rates are derived from international bullion benchmarks and effective 
              customs/GST tariff formulas. Physical purchase rates may vary based on local jewellers, making charges, 
              and hallmarking certifications. Please consult a SEBI registered investment advisor before committing to financial decisions.
            </p>
          </div>
          <div className="text-right text-[11px] text-slate-500 whitespace-nowrap">
            &copy; {new Date().getFullYear()} SilverPrices.in. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
