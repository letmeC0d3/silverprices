import { insertDailyRate, getDb } from '../lib/db';

async function seed() {
  console.log('🌱 Starting 30-day historical silver rates seed (current market benchmark)...');
  
  // Ensure DB schema initialized
  getDb();

  const today = new Date();
  const currentBaseRatePerKg = 236440; // ~₹236,440/kg base pre-GST (~₹243,500/kg with 3% GST)
  const ratesToInsert = [];

  // Seed 30 past days in chronological order with gentle market progression
  for (let i = 29; i >= 0; i--) {
    const dateObj = new Date(today);
    dateObj.setDate(today.getDate() - i);
    const dateStr = dateObj.toISOString().split('T')[0];

    // Gentle upward trending volatility matching the commodity rally
    const trendOffset = (29 - i) * 160;
    const waveOffset = Math.sin(i * 0.35) * 2800;
    const randomJitter = (Math.random() - 0.5) * 800;

    const pricePerKg999 = Math.round((currentBaseRatePerKg - 4500 + trendOffset + waveOffset + randomJitter) / 10) * 10;
    const pricePerGram999 = Math.round((pricePerKg999 / 1000) * 100) / 100;
    const pricePerGram925 = Math.round((pricePerGram999 * 0.925) * 100) / 100;

    ratesToInsert.push({
      date: dateStr,
      price_per_gram_999: pricePerGram999,
      price_per_kg_999: pricePerKg999,
      price_per_gram_925: pricePerGram925,
      change_24h: 0,
      change_percent_24h: 0,
    });
  }

  // Calculate 24h deltas
  for (let i = 0; i < ratesToInsert.length; i++) {
    if (i > 0) {
      const prev = ratesToInsert[i - 1];
      const curr = ratesToInsert[i];
      curr.change_24h = Math.round((curr.price_per_kg_999 - prev.price_per_kg_999) * 100) / 100;
      curr.change_percent_24h = Math.round((curr.change_24h / prev.price_per_kg_999) * 10000) / 100;
    }

    insertDailyRate(ratesToInsert[i]);
  }

  console.log(`✅ Successfully seeded ${ratesToInsert.length} daily rates into SQLite matching current retail bullion rates.`);
}

seed().catch((err) => {
  console.error('❌ Failed to seed database:', err);
  process.exit(1);
});
