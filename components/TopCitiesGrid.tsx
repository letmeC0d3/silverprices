import Link from 'next/link';
import { MapPin, ChevronRight, Compass } from 'lucide-react';
import citiesData from '../data/cities.json';
import { CityData } from '../lib/types';

interface TopCitiesGridProps {
  baseRatePerKg999WithGST: number;
}

export default function TopCitiesGrid({ baseRatePerKg999WithGST }: TopCitiesGridProps) {
  const allCities = citiesData as CityData[];

  const regions: Array<{ name: string; regionKeys: CityData['region'][] }> = [
    { name: 'North India', regionKeys: ['North'] },
    { name: 'South India', regionKeys: ['South'] },
    { name: 'West India', regionKeys: ['West'] },
    { name: 'East & Central India', regionKeys: ['East', 'Central'] },
  ];

  return (
    <div id="cities" className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/60">
              <MapPin className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Live Silver Rates Across 30 Indian Cities
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            City-specific retail prices calibrated with local transport premiums, regional bullion association spreads, and statutory 3% GST.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <Compass className="w-3.5 h-3.5 text-emerald-600" />
          <span>All 30 Major Markets &bull; Incl. 3% GST</span>
        </div>
      </div>

      {/* Regional City Sections */}
      <div className="space-y-8">
        {regions.map((reg) => {
          const citiesInGroup = allCities.filter((c) => reg.regionKeys.includes(c.region));

          return (
            <div key={reg.name} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>{reg.name} ({citiesInGroup.length} Cities)</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {citiesInGroup.map((city) => {
                  const cityKgRate = Math.round(baseRatePerKg999WithGST + city.premiumPerKg * 1.03);
                  const city10gRate = Math.round(cityKgRate / 100);

                  return (
                    <Link
                      key={city.slug}
                      href={`/silver-rate-in-${city.slug}`}
                      title={`Silver Rate in ${city.name} Today`}
                      className="group block bg-slate-50 hover:bg-slate-100/90 border border-slate-200/80 hover:border-emerald-300 rounded-xl p-4 transition-all duration-200 shadow-2xs hover:shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <div className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors flex items-center space-x-1">
                            <span>Silver Rate in {city.name}</span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 group-hover:text-emerald-600 transition-transform" />
                          </div>
                          <span className="text-[11px] text-slate-500">{city.state}</span>
                        </div>
                        {city.isMetro && (
                          <span className="text-[10px] font-semibold bg-white border border-slate-200 text-emerald-800 px-1.5 py-0.5 rounded shadow-2xs">
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
        })}
      </div>
    </div>
  );
}
