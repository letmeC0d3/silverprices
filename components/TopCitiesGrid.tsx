import Link from 'next/link';
import { MapPin, ChevronRight } from 'lucide-react';
import citiesData from '../data/cities.json';
import { CityData } from '../lib/types';

interface TopCitiesGridProps {
  baseRatePerKg999WithGST: number;
}

export default function TopCitiesGrid({ baseRatePerKg999WithGST }: TopCitiesGridProps) {
  // Pick top 12 metro and high-volume cities
  const topCities = (citiesData as CityData[]).slice(0, 12);

  return (
    <div id="cities" className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Today&apos;s Silver Rates Across Top Indian Metros</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Regional retail prices adjusted for local logistics, transit insurance, and bullion trade guild spreads
          </p>
        </div>

        <span className="text-xs font-mono text-slate-400">All prices incl. 3% GST</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {topCities.map((city) => {
          const cityKgRate = Math.round(baseRatePerKg999WithGST + city.premiumPerKg * 1.03);
          const city10gRate = Math.round(cityKgRate / 100);

          return (
            <Link
              key={city.slug}
              href={`/silver-rate-in-${city.slug}`}
              className="group block bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 hover:border-slate-300 rounded-xl p-4 transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors flex items-center space-x-1">
                    <span>{city.name}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </h3>
                  <span className="text-[11px] text-slate-500">{city.state}</span>
                </div>
                {city.isMetro && (
                  <span className="text-[10px] font-semibold bg-white border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
                    Metro
                  </span>
                )}
              </div>

              <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-baseline justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">1 Kg (999)</div>
                  <div className="text-base font-extrabold text-slate-900 font-mono tabular-nums">
                    ₹{cityKgRate.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">10 Grams</div>
                  <div className="text-xs font-bold text-slate-700 font-mono tabular-nums">
                    ₹{city10gRate.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              <div className="mt-2 text-[10px] text-slate-400 truncate">
                Hub: {city.marketHubs[0]}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
