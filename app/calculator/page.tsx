import type { Metadata } from 'next';
import { getLiveSilverPrices } from '@/lib/price-service';
import CalculatorForm from '@/components/CalculatorForm';
import Breadcrumbs from '@/components/Breadcrumbs';
import AdBanner from '@/components/AdBanner';
import BrokerCTA from '@/components/BrokerCTA';
import { HelpCircle, ShieldCheck, Scale, Sparkles, Percent } from 'lucide-react';

export const revalidate = 900;

export const metadata: Metadata = {
  title: 'Silver Calculator India: Calculate Scrap & Bullion Rates (999, 925, 800)',
  description:
    'Free online Indian silver scrap and bullion calculator. Calculate instant buying cost with making charges & 3% GST, or estimated jeweller scrap resale melt value.',
  alternates: {
    canonical: 'https://silverprices.in/calculator',
  },
  openGraph: {
    title: 'Silver Calculator India: Calculate Scrap & Bullion Rates',
    description:
      'Real-time valuation for 999 pure silver, 925 sterling jewelry, and 800 scrap silver with making charges and GST.',
    url: 'https://silverprices.in/calculator',
    type: 'website',
  },
};

export default async function CalculatorPage() {
  const priceData = await getLiveSilverPrices();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { name: 'Home', url: '/' },
          { name: 'Silver Calculator', url: '/calculator' },
        ]}
      />

      {/* Page Title */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-800 bg-emerald-50 w-fit px-3 py-1 rounded-full mb-3 border border-emerald-200/60">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Interactive Bullion &amp; Jewellery Valuation Tool</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
          Indian Silver Price &amp; Scrap Value Calculator
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-3xl leading-relaxed">
          Input your weight, select your silver purity (999 Fine Bullion, 925 Sterling, or 800 Traditional Silver), 
          and instantly calculate total retail showroom cost (with customizable making charges and 3% GST) or your net 
          scrap resale value at Indian jewellers.
        </p>
      </div>

      {/* Calculator Component */}
      <CalculatorForm basePricePerGram999={priceData.effectiveDutyPricePerGram999} />

      {/* Ad Banner */}
      <AdBanner slot="leaderboard" />

      {/* Detailed Calculation Guide & Formulas */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
            <Scale className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">How the Silver Calculation Formula Works in India</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600 leading-relaxed">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
            <div className="flex items-center space-x-2 text-slate-900 font-bold">
              <Percent className="w-4 h-4 text-emerald-600" />
              <span>1. Base Metal Price</span>
            </div>
            <p>
              Calculated as: <code>Weight (g) &times; Spot Rate (₹/g) &times; (Purity / 1000)</code>. 
              This represents the elemental silver worth before craftsmanship, marketing margins, or taxes.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
            <div className="flex items-center space-x-2 text-slate-900 font-bold">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>2. Making Charges &amp; Wastage</span>
            </div>
            <p>
              Jewellers charge between 5% and 25% for casting, polishing, and stone setting. 
              Bullion investment coins and bars typically incur 0% to 3% minting premiums.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
            <div className="flex items-center space-x-2 text-slate-900 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>3. Indian GST Assessment</span>
            </div>
            <p>
              Under Indian GST rules, 3% GST is applied to the metal value, while a 5% service GST 
              is applied to the making charges component on the final bill.
            </p>
          </div>
        </div>
      </div>

      {/* Demat Broker Recommendation */}
      <BrokerCTA
        title="Avoid Making Charges Completely: Invest in Silver ETFs"
        subtitle="When you buy Silver ETFs through Zerodha or AngelOne, you pay 0% making charges, zero GST on delivery, and pay only the exact market NAV."
      />
    </div>
  );
}
