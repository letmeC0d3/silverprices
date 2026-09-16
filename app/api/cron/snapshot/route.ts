import { NextResponse } from 'next/server';
import { fetchRawSilverRates } from '@/lib/price-service';
import { revalidatePath } from 'next/cache';
import { verifyCronSecret } from '@/lib/cron-utils';

export const dynamic = 'force-dynamic';

async function handleSnapshot(request: Request) {
  const auth = verifyCronSecret(request);
  if (!auth.authorized) {
    return NextResponse.json(
      {
        success: false,
        error: auth.reason || 'Unauthorized',
      },
      { status: 401 }
    );
  }

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
      snapshotDate: data.snapshotDate,
      source: data.source,
      isFallback: data.isFallback,
      isStale: data.isStale,
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

export async function POST(request: Request) {
  return handleSnapshot(request);
}

export async function GET(request: Request) {
  return handleSnapshot(request);
}
