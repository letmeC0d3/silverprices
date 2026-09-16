import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getLiveSilverPrices } from '@/lib/price-service';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://silverprices.in'),
  title: {
    default: 'Live Silver Rate in India Today: 1g, 10g, 1kg Silver Price | SilverPrices.in',
    template: '%s | SilverPrices.in',
  },
  description:
    'Track live silver rates in India today. Check real-time 999 fine silver & 925 sterling silver prices per gram, 10g, and 1kg with 3% GST calculation across 30+ Indian cities.',
  keywords: [
    'silver price today',
    'silver rate in india',
    '1kg silver price',
    'silver rate today mumbai',
    'silver rate today delhi',
    '999 silver price',
    '925 sterling silver price',
    'silver etf india',
    'silver calculator',
  ],
  authors: [{ name: 'SilverPrices.in Editorial & Commodity Desk' }],
  creator: 'SilverPrices.in',
  publisher: 'SilverPrices.in',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://silverprices.in',
    siteName: 'SilverPrices.in',
    title: 'Live Silver Rate in India Today: 1g, 10g, 1kg Silver Price',
    description:
      'Real-time Indian silver rates, city-wise retail bullion prices, scrap calculator, and Silver ETF tracker.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Live Silver Rate in India Today: 1g, 10g, 1kg Silver Price',
    description:
      'Track live Indian silver rates with 3% GST and regional city benchmarks across Mumbai, Delhi, Chennai, and Bangalore.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let spotRatePerKg = 243500;
  let changePercent = 1.25;
  let isFallback = false;

  try {
    const liveData = await getLiveSilverPrices();
    spotRatePerKg = liveData.effectiveDutyPricePerKg999;
    changePercent = liveData.changePercent24h;
    isFallback = liveData.isFallback;
  } catch (err) {
    console.error('Error getting live prices for layout header:', err);
    isFallback = true;
  }

  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased text-slate-900 bg-slate-50 flex flex-col min-h-screen selection:bg-emerald-100 selection:text-emerald-900">
        <Navbar spotRatePerKg={spotRatePerKg} changePercent={changePercent} isFallback={isFallback} />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
