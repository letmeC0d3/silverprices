import { NextResponse } from 'next/server';
import { fetchRawSilverRates } from '@/lib/price-service';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

/**
 * Daily Snapshot & Revalidation Webhook
 * Can be called by a VPS crontab, GitHub Action, or uptime monitor:
 * Example crontab entry:
 * 0 9 * * * curl -s http://localhost:3000/api/cron/snapshot > /dev/null
 */
export async function GET(request: Request) {
  try {
    // 1. Fetch fresh rates directly and record snapshot into SQLite
    const data = await fetchRawSilverRates();

    // 2. Trigger Next.js on-demand ISR revalidation across all pages
    revalidatePath('/', 'page');
    revalidatePath('/calculator', 'page');
    revalidatePath('/[city]', 'page');

    return NextResponse.json({
      success: true,
      message: 'Silver rates updated and page caches revalidated successfully',
      date: data.timestamp,
      source: data.source,
      rate1kgWithGST: data.rates['1kg'].pricePure999WithGST,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to trigger snapshot and revalidation',
      },
      { status: 500 }
    );
  }
}
