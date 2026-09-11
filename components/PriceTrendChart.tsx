'use client';

import { useState } from 'react';
import { DailyRateRecord } from '../lib/types';
import { TrendingUp, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface PriceTrendChartProps {
  data: DailyRateRecord[];
}

export default function PriceTrendChart({ data }: PriceTrendChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200 text-center py-12 text-slate-400">
        Historical chart data initializing...
      </div>
    );
  }

  const prices = data.map((d) => d.price_per_kg_999);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 1;
  const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);

  const firstPrice = prices[0];
  const lastPrice = prices[prices.length - 1];
  const totalChange = lastPrice - firstPrice;
  const totalChangePercent = (totalChange / firstPrice) * 100;
  const isUp = totalChange >= 0;

  // SVG dimensions
  const width = 800;
  const height = 260;
  const paddingX = 40;
  const paddingTop = 25;
  const paddingBottom = 35;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingTop - paddingBottom;

  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - ((d.price_per_kg_999 - minPrice) / priceRange) * chartHeight;
    return { x, y, record: d };
  });

  const pathD = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
  }, '');

  // Area under line
  const areaD = `${pathD} L ${points[points.length - 1].x},${height - paddingBottom} L ${points[0].x},${height - paddingBottom} Z`;

  const activePoint = hoverIndex !== null && points[hoverIndex] ? points[hoverIndex] : points[points.length - 1];

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">30-Day Silver Price Trend</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            MCX benchmark 999 fine silver rate per kilogram (INR)
          </p>
        </div>

        {/* 30d Delta Pill */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5 font-mono">
            <span className="text-slate-500">30D Movement:</span>
            <span
              className={`inline-flex items-center font-bold px-2 py-0.5 rounded-md ${
                isUp ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              }`}
            >
              {isUp ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
              {isUp ? '+' : ''}₹{Math.abs(Math.round(totalChange)).toLocaleString('en-IN')} ({isUp ? '+' : ''}
              {totalChangePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Stat Badges */}
      <div className="grid grid-cols-3 gap-2 mb-4 text-xs font-mono">
        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-sans font-semibold">30D High</div>
          <div className="text-sm font-bold text-slate-900 mt-0.5">₹{maxPrice.toLocaleString('en-IN')}</div>
        </div>
        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-sans font-semibold">30D Low</div>
          <div className="text-sm font-bold text-slate-900 mt-0.5">₹{minPrice.toLocaleString('en-IN')}</div>
        </div>
        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-sans font-semibold">30D Average</div>
          <div className="text-sm font-bold text-slate-900 mt-0.5">₹{avgPrice.toLocaleString('en-IN')}</div>
        </div>
      </div>

      {/* SVG Chart Container */}
      <div className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto cursor-crosshair"
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="silverGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={paddingTop}
            x2={width - paddingX}
            y2={paddingTop}
            stroke="#e2e8f0"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={paddingTop + chartHeight / 2}
            x2={width - paddingX}
            y2={paddingTop + chartHeight / 2}
            stroke="#e2e8f0"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={height - paddingBottom}
            x2={width - paddingX}
            y2={height - paddingBottom}
            stroke="#cbd5e1"
          />

          {/* Area Fill */}
          <path d={areaD} fill="url(#silverGradient)" />

          {/* Main Price Line */}
          <path d={pathD} fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Interactive vertical hover indicator */}
          {activePoint && (
            <g>
              <line
                x1={activePoint.x}
                y1={paddingTop}
                x2={activePoint.x}
                y2={height - paddingBottom}
                stroke="#64748b"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="5"
                fill="#059669"
                stroke="#ffffff"
                strokeWidth="2.5"
              />
            </g>
          )}

          {/* Touch / Click target transparent bars */}
          {points.map((pt, i) => (
            <rect
              key={pt.record.date}
              x={pt.x - chartWidth / (data.length * 2)}
              y={0}
              width={chartWidth / data.length}
              height={height}
              fill="transparent"
              onMouseEnter={() => setHoverIndex(i)}
            />
          ))}

          {/* Axis Labels */}
          <text x={paddingX} y={height - 12} fontSize="11" fill="#64748b" fontFamily="monospace">
            {data[0]?.date}
          </text>
          <text x={width / 2} y={height - 12} textAnchor="middle" fontSize="11" fill="#94a3b8" fontFamily="monospace">
            30-Day Window
          </text>
          <text x={width - paddingX} y={height - 12} textAnchor="end" fontSize="11" fill="#64748b" fontFamily="monospace">
            {data[data.length - 1]?.date}
          </text>
        </svg>

        {/* Hover Floating Tooltip */}
        {activePoint && (
          <div className="mt-3 flex items-center justify-between text-xs bg-slate-900 text-white px-4 py-2 rounded-xl font-mono">
            <div className="flex items-center space-x-2">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{activePoint.record.date}</span>
            </div>
            <div>
              <span className="text-slate-400 mr-2">Rate:</span>
              <strong className="text-emerald-400 text-sm">₹{activePoint.record.price_per_kg_999.toLocaleString('en-IN')}/kg</strong>
              {activePoint.record.change_percent_24h !== 0 && (
                <span className={`ml-2 text-xs ${activePoint.record.change_percent_24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  ({activePoint.record.change_percent_24h >= 0 ? '+' : ''}{activePoint.record.change_percent_24h.toFixed(2)}%)
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
