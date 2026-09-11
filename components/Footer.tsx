import Link from 'next/link';
import { ShieldCheck, Info } from 'lucide-react';
import citiesData from '../data/cities.json';

export default function Footer() {
  const topCities = citiesData.slice(0, 16);

  return (
    <footer className="bg-slate-900 text-slate-300 pt-14 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight text-white">
                SilverPrices<span className="text-emerald-400">.in</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              India&apos;s real-time silver rate intelligence platform. Tracking domestic retail bullion, 
              jewelry rates (925 sterling &amp; 999 fine), regional city adjustments, and Silver ETFs.
            </p>
            <div className="flex items-center space-x-2 text-[11px] text-emerald-400 font-mono bg-slate-800/80 px-2.5 py-1.5 rounded-md border border-slate-700/60 w-fit">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Free &amp; Open Indian Market Data</span>
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
                  Live Silver Rates Today
                </Link>
              </li>
              <li>
                <Link href="/calculator" className="hover:text-white transition-colors">
                  Scrap &amp; Bullion Calculator
                </Link>
              </li>
              <li>
                <Link href="/#etf" className="hover:text-white transition-colors">
                  Silver ETF Comparison Tracker
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-white transition-colors">
                  Frequently Asked Questions (FAQ)
                </Link>
              </li>
              <li>
                <Link href="/sitemap.xml" className="hover:text-white transition-colors">
                  XML Sitemap
                </Link>
              </li>
            </ul>
          </div>

          {/* Top City Rates Links (SEO Internal Links) */}
          <div className="md:col-span-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
              Silver Rates by Major Cities
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {topCities.map((c) => (
                <Link
                  key={c.slug}
                  href={`/silver-rate-in-${c.slug}`}
                  className="hover:text-emerald-400 transition-colors py-0.5 truncate"
                >
                  Silver in {c.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="pt-8 flex flex-col md:flex-row items-start md:items-center justify-between text-xs text-slate-500 gap-4">
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
