import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getLiveSilverPrices } from '@/lib/price-service';
import citiesData from '@/data/cities.json';
import { CityData } from '@/lib/types';
import Breadcrumbs from '@/components/Breadcrumbs';
import QuickConverter from '@/components/QuickConverter';
import BrokerCTA from '@/components/BrokerCTA';
import AdBanner from '@/components/AdBanner';
import FaqAccordion from '@/components/FaqAccordion';
import { MapPin, Building2, Scale, ArrowRight, ShieldCheck } from 'lucide-react';

interface CityPageProps {
  params: {
    city: string;
  };
}

export const revalidate = 900; // 15-minute ISR

export function generateStaticParams() {
  return (citiesData as CityData[]).map((city) => ({
    city: `silver-rate-in-${city.slug}`,
  }));
}

function getCityData(slug?: string): CityData | undefined {
  if (!slug) return undefined;
  const cleanSlug = slug.replace(/^silver-rate-in-/, '').toLowerCase();
  return (citiesData as CityData[]).find(
    (c) => c.slug.toLowerCase() === cleanSlug || c.slug.toLowerCase() === slug.toLowerCase()
  );
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const city = getCityData(params.city);
  if (!city) {
    return {
      title: 'City Silver Rates | SilverPrices.in',
    };
  }

  const todayStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  });

  const title = `Silver Rate in ${city.name} Today (${todayStr}): 1g, 10g, 1kg Silver Price`;
  const description = `Check today's live silver rate in ${city.name}. Live 999 & 925 silver price per gram, 10g, and 1kg with 3% GST calculation.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://silverprices.in/silver-rate-in-${city.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://silverprices.in/silver-rate-in-${city.slug}`,
      type: 'article',
      locale: 'en_IN',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function CityPage({ params }: CityPageProps) {
  const city = getCityData(params.city);
  if (!city) {
    notFound();
  }

  const nationalPriceData = await getLiveSilverPrices();

  // Adjust national base price with local logistics premium
  const cityPremiumPerGram = city.premiumPerKg / 1000;
  const cityBasePerGram999 = nationalPriceData.effectiveDutyPricePerGram999 + cityPremiumPerGram;

  const weights = [
    { label: '1 Gram', weight: 1 },
    { label: '8 Grams (Pavalam)', weight: 8 },
    { label: '10 Grams (Tola)', weight: 10 },
    { label: '100 Grams', weight: 100 },
    { label: '1 Kilogram (1000g)', weight: 1000 },
  ];

  const ratesTable = weights.map((w) => {
    const pureBase = Math.round(cityBasePerGram999 * w.weight * 100) / 100;
    const pureWithGST = Math.round(pureBase * 1.03 * 100) / 100;
    const jewelryBase = Math.round(cityBasePerGram999 * 0.925 * w.weight * 100) / 100;
    const jewelryWithGST = Math.round(jewelryBase * 1.03 * 100) / 100;

    return {
      label: w.label,
      weight: w.weight,
      pureBase,
      pureWithGST,
      jewelryBase,
      jewelryWithGST,
    };
  });

  const formattedDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  });

  // Nearby or other cities for internal links
  const otherCities = (citiesData as CityData[])
    .filter((c) => c.slug !== city.slug)
    .slice(0, 8);

  const cityFaqs = [
    {
      question: `What is the silver rate in ${city.name} today?`,
      answer: `Today in ${city.name}, 1kg of 999 fine silver is ₹${ratesTable[4].pureWithGST.toLocaleString('en-IN')} (including 3% GST), and 10 grams costs ₹${ratesTable[2].pureWithGST.toLocaleString('en-IN')}. For 925 sterling jewelry silver, 10 grams is ₹${ratesTable[2].jewelryWithGST.toLocaleString('en-IN')}.`,
    },
    {
      question: `Why is the silver rate in ${city.name} different from other cities?`,
      answer: `The silver price in ${city.name} carries a regional logistics adjustment of ${city.premiumPerKg >= 0 ? `+₹${city.premiumPerKg}` : `-₹${Math.abs(city.premiumPerKg)}`}/kg compared to national port benchmarks. Differences reflect interstate bullion transportation, local vault storage, and demand patterns across ${city.marketHubs.join(', ')}.`,
    },
    {
      question: `Where are the major silver bullion markets in ${city.name}?`,
      answer: `The primary wholesale and retail silver exchanges in ${city.name} are concentrated around ${city.marketHubs.join(', ')}, where local bullion dealers quote daily hallmark bullion rates.`,
    },
  ];

  // Schema.org WebPage structured data for informational portal
  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Silver Rate in ${city.name} Today - Daily Bullion & Jewelry Benchmark`,
    description: `Daily retail silver rates for ${city.name}, ${city.state}. Includes 999 fine silver and 925 sterling silver prices with 3% GST.`,
    url: `https://silverprices.in/silver-rate-in-${city.slug}`,
    isPartOf: {
      '@type': 'WebSite',
      name: 'SilverPrices.in',
      url: 'https://silverprices.in',
    },
    about: {
      '@type': 'FinancialProduct',
      name: `Silver Bullion Market Benchmark (${city.name})`,
      description: `Indicative daily benchmark rates for physical silver in ${city.name} based on national spot rates plus regional logistics.`,
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10">
      {/* WebPage JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />

      {/* Breadcrumb Navigation */}
      <Breadcrumbs
        items={[
          { name: 'Home', url: '/' },
          { name: 'Cities', url: '/#cities' },
          { name: `Silver Rate in ${city.name}`, url: `/silver-rate-in-${city.slug}` },
        ]}
      />

      {/* Page Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-800 bg-emerald-50 w-fit px-3 py-1 rounded-full mb-3 border border-emerald-200/60">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          <span>{city.name}, {city.state} &bull; Regional Rate Desk</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
          Silver Rate in {city.name} Today ({formattedDate})
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-3xl leading-relaxed">
          Indicative daily physical retail silver benchmark for {city.name}. Calculated from spot parity, 
          composite landed import adjustments, regional logistics premium ({city.premiumPerKg >= 0 ? `+₹${city.premiumPerKg}/kg` : `-₹${Math.abs(city.premiumPerKg)}/kg`}), 
          and applicable statutory 3% retail GST.
        </p>
      </div>

      {/* Top 3 Quick Glance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            {city.name} 1 Gram (999 Pure)
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tabular-nums mt-1">
            ₹{ratesTable[0].pureWithGST.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-400">Incl. 3% GST &bull; Base: ₹{ratesTable[0].pureBase.toLocaleString('en-IN')}</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            {city.name} 10 Grams (Tola)
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tabular-nums mt-1">
            ₹{ratesTable[2].pureWithGST.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-400">Popular Coin Weight &bull; 925 Jewelry: ₹{ratesTable[2].jewelryWithGST.toLocaleString('en-IN')}</span>
        </div>

        <div className="bg-gradient-to-b from-white to-slate-50 rounded-2xl p-5 border border-slate-300 shadow-xs ring-1 ring-slate-900/5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-900">
              {city.name} 1 Kilogram (Bar)
            </span>
            <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
              Benchmark
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-950 font-mono tabular-nums mt-1">
            ₹{ratesTable[4].pureWithGST.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-400">Standard Bullion Bar &bull; Incl. 3% GST</span>
        </div>
      </div>

      {/* Ad Banner */}
      <AdBanner slot="leaderboard" />

      {/* Main City Rates Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                <Scale className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                {city.name} Silver Price Table &bull; {formattedDate}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparison across 999 Fine Bullion and 925 Sterling Jewelry Silver
            </p>
          </div>
          <span className="text-xs font-mono text-slate-600 bg-slate-100 px-3 py-1 rounded-md">
            Local Markup: {city.premiumPerKg >= 0 ? `+₹${city.premiumPerKg}` : `-₹${Math.abs(city.premiumPerKg)}`}/kg
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50">
                <th className="py-3 px-4">Denomination</th>
                <th className="py-3 px-4">999 Pure (Base)</th>
                <th className="py-3 px-4">999 Pure (Incl. 3% GST)</th>
                <th className="py-3 px-4">925 Jewelry (Base)</th>
                <th className="py-3 px-4">925 Jewelry (Incl. 3% GST)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-mono">
              {ratesTable.map((row) => (
                <tr key={row.label} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-sans font-bold text-slate-900">
                    {row.label}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 tabular-nums">
                    ₹{row.pureBase.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-950 tabular-nums bg-emerald-50/40">
                    ₹{row.pureWithGST.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 tabular-nums">
                    ₹{row.jewelryBase.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800 tabular-nums">
                    ₹{row.jewelryWithGST.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Local Market Hubs & Trade Intelligence */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
            <Building2 className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Local Silver Markets &amp; Bullion Hubs in {city.name}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Prominent Jewellery &amp; Bullion Quarters:
            </h3>
            <div className="flex flex-wrap gap-2">
              {city.marketHubs.map((hub) => (
                <span
                  key={hub}
                  className="bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-lg"
                >
                  {hub}
                </span>
              ))}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pt-2">
              {city.localTradeInfo}
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Buying Silver in {city.name}: Buyer Tips</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-600 list-disc list-inside">
              <li>Always demand a computerized bill showing 3% GST breakdown.</li>
              <li>Verify the BIS Hallmark logo and purity stamp (999 or 925).</li>
              <li>Compare making charges across {city.marketHubs[0]} shops before purchasing silverware.</li>
              <li>For pure investment, consider 99.9% minted bars or Silver ETFs to bypass jewelry making loss.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Quick Converter for City Rate */}
      <QuickConverter basePricePerGram999={cityBasePerGram999} />

      {/* Broker CTA Box */}
      <BrokerCTA
        title={`Buy Paper Silver in ${city.name} Without Vault Fees`}
        subtitle={`Trade SEBI-regulated Silver ETFs on NSE/BSE directly with zero delivery brokerage. Liquidate anytime with 1-click execution.`}
      />

      {/* Other Cities Grid (SEO Silo Linking) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 mb-4">
          Compare Silver Rates in Other Major Indian Cities
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {otherCities.map((oc) => (
            <Link
              key={oc.slug}
              href={`/silver-rate-in-${oc.slug}`}
              className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/70 transition-colors flex items-center justify-between group"
            >
              <div>
                <div className="font-bold text-slate-800 group-hover:text-emerald-700">
                  {oc.name}
                </div>
                <div className="text-[10px] text-slate-400">{oc.state}</div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          ))}
        </div>
      </div>

      {/* City FAQ Accordion */}
      <FaqAccordion
        faqs={cityFaqs}
        title={`Frequently Asked Questions: Silver Rate in ${city.name}`}
        subtitle={`Important guidelines for purchasing and selling physical silver in ${city.name}.`}
      />
    </div>
  );
}
