import { DailyRateRecord } from './types';

export type ChartRecord = Pick<DailyRateRecord, 'date' | 'price_per_kg_999'> & Partial<DailyRateRecord>;

export interface ChartPoint {
  x: number;
  y: number;
  record: ChartRecord;
}

export interface ChartGeometry {
  points: ChartPoint[];
  pathD: string;
  areaD: string;
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  totalChange: number;
  totalChangePercent: number;
  isUp: boolean;
}

export function computeChartGeometry(
  data: ChartRecord[],
  width = 800,
  height = 260,
  paddingX = 40,
  paddingTop = 25,
  paddingBottom = 35
): ChartGeometry {
  if (!data || data.length === 0) {
    return {
      points: [],
      pathD: '',
      areaD: '',
      minPrice: 0,
      maxPrice: 0,
      avgPrice: 0,
      totalChange: 0,
      totalChangePercent: 0,
      isUp: true,
    };
  }

  const prices = data.map((d) => d.price_per_kg_999);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 1;
  const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);

  const firstPrice = prices[0] || 1;
  const lastPrice = prices[prices.length - 1] || 1;
  const totalChange = lastPrice - firstPrice;
  const totalChangePercent = firstPrice > 0 ? (totalChange / firstPrice) * 100 : 0;
  const isUp = totalChange >= 0;

  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingTop - paddingBottom;

  if (data.length === 1) {
    // Single point edge case: Avoid division by (data.length - 1) which yields NaN
    const singleY = paddingTop + chartHeight / 2;
    const point: ChartPoint = {
      x: paddingX + chartWidth / 2,
      y: singleY,
      record: data[0],
    };

    // Represent as a steady benchmark horizontal line
    const pathD = `M ${paddingX},${singleY} L ${width - paddingX},${singleY}`;
    const areaD = `${pathD} L ${width - paddingX},${height - paddingBottom} L ${paddingX},${height - paddingBottom} Z`;

    return {
      points: [point],
      pathD,
      areaD,
      minPrice,
      maxPrice,
      avgPrice,
      totalChange: 0,
      totalChangePercent: 0,
      isUp: true,
    };
  }

  const points: ChartPoint[] = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - ((d.price_per_kg_999 - minPrice) / priceRange) * chartHeight;
    return { x, y, record: d };
  });

  const pathD = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x},${height - paddingBottom} L ${points[0].x},${height - paddingBottom} Z`;

  return {
    points,
    pathD,
    areaD,
    minPrice,
    maxPrice,
    avgPrice,
    totalChange,
    totalChangePercent,
    isUp,
  };
}
