'use client';

import React from 'react';

// --- Bar Chart ---
interface BarItem {
  name: string;
  count: number;
  subtext?: string;
  color?: string;
}

export function SimpleBarChart({
  items,
  maxVal,
  valueLabel = 'ADRs',
}: {
  items: BarItem[];
  maxVal?: number;
  valueLabel?: string;
}) {
  const max = maxVal || Math.max(...items.map((i) => i.count), 1);

  return (
    <div className="space-y-3">
      {items.map((item, idx) => {
        const pct = Math.min(Math.round((item.count / max) * 100), 100);
        const barColor = item.color || (item.count >= 3 ? '#D32F2F' : item.count >= 2 ? '#f59e0b' : '#3b82f6');

        return (
          <div key={idx} className="group">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-slate-800 truncate max-w-[70%]" title={item.name}>
                {item.name}
              </span>
              <span className="font-bold text-slate-700">
                {item.count} {valueLabel}
              </span>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
              <div
                className="h-full rounded-full transition-all duration-500 group-hover:opacity-90"
                style={{
                  width: `${Math.max(pct, 4)}%`,
                  backgroundColor: barColor,
                }}
              />
            </div>

            {item.subtext && (
              <div className="text-[10px] text-slate-500 mt-0.5">{item.subtext}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// --- Donut Chart (SVG) ---
interface DonutSlice {
  label: string;
  count: number;
  color: string;
}

export function DonutChart({ data, title }: { data: DonutSlice[]; title?: string }) {
  const total = data.reduce((acc, curr) => acc + curr.count, 0) || 1;
  let accumulatedAngle = 0;

  // SVG coordinate calculations for circular slices
  const size = 180;
  const strokeWidth = 28;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
      {/* SVG Donut */}
      <div className="relative w-44 h-44 flex items-center justify-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />
          {data.map((slice, idx) => {
            const fraction = slice.count / total;
            const strokeDasharray = `${fraction * circumference} ${circumference}`;
            const strokeDashoffset = -accumulatedAngle * circumference;
            accumulatedAngle += fraction;

            if (slice.count === 0) return null;

            return (
              <circle
                key={idx}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={slice.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-500 hover:opacity-80"
              />
            );
          })}
        </svg>

        {/* Center label */}
        <div className="absolute text-center">
          <div className="text-2xl font-black text-slate-800">{total}</div>
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Total Cases</div>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2 text-xs">
        {data.map((slice, idx) => {
          const pct = Math.round((slice.count / total) * 100);
          return (
            <div key={idx} className="flex items-center space-x-2.5">
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: slice.color }} />
              <span className="font-medium text-slate-700 w-28 truncate">{slice.label}</span>
              <span className="font-bold text-slate-900">{slice.count}</span>
              <span className="text-[11px] text-slate-400 font-medium">({pct}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- Sparkline / Monthly Trend Chart ---
export function MonthlyTrendChart({
  trends,
}: {
  trends: Array<{ month: string; count: number }>;
}) {
  if (!trends || trends.length === 0) {
    return <div className="text-xs text-slate-400 py-6 text-center">No trend data available yet.</div>;
  }

  const max = Math.max(...trends.map((t) => t.count), 5);
  const height = 120;
  const width = 360;
  const padding = 20;

  const points = trends.map((t, index) => {
    const x = padding + (index / Math.max(trends.length - 1, 1)) * (width - 2 * padding);
    const y = height - padding - (t.count / max) * (height - 2 * padding);
    return { x, y, ...t };
  });

  const polylineStr = points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-32 overflow-visible">
        <defs>
          <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D32F2F" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#D32F2F" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e2e8f0" strokeWidth="1" />
        <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />

        {/* Area fill */}
        {points.length > 1 && (
          <polygon
            points={`${points[0].x},${height - padding} ${polylineStr} ${points[points.length - 1].x},${height - padding}`}
            fill="url(#trendGradient)"
          />
        )}

        {/* Trend Polyline */}
        <polyline
          fill="none"
          stroke="#D32F2F"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={polylineStr}
        />

        {/* Interactive Dots */}
        {points.map((p, idx) => (
          <g key={idx} className="group">
            <circle cx={p.x} cy={p.y} r="4.5" fill="#D32F2F" stroke="#ffffff" strokeWidth="2" />
            <text
              x={p.x}
              y={p.y - 10}
              textAnchor="middle"
              className="text-[10px] font-bold fill-slate-800"
            >
              {p.count}
            </text>
            <text
              x={p.x}
              y={height - 5}
              textAnchor="middle"
              className="text-[9px] fill-slate-400 font-medium"
            >
              {p.month}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
