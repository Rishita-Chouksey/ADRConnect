'use client';

import React, { useState } from 'react';

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
  onSelect,
}: {
  items: BarItem[];
  maxVal?: number;
  valueLabel?: string;
  onSelect?: (item: BarItem) => void;
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const max = maxVal || Math.max(...items.map((i) => i.count), 1);

  return (
    <div className="space-y-3">
      {items.map((item, idx) => {
        const pct = Math.min(Math.round((item.count / max) * 100), 100);
        const barColor = item.color || (item.count >= 3 ? '#D32F2F' : item.count >= 2 ? '#f59e0b' : '#3b82f6');
        const isHovered = hoveredIdx === idx;

        return (
          <div
            key={idx}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
            onClick={() => onSelect?.(item)}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              isHovered ? 'bg-slate-50 ring-1 ring-slate-200 shadow-sm' : ''
            }`}
          >
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-slate-800 truncate max-w-[70%]" title={item.name}>
                {item.name}
              </span>
              <span className="font-bold text-slate-900">
                {item.count} {valueLabel}
              </span>
            </div>

            <div className="relative w-full bg-slate-100 rounded-full h-3.5 overflow-hidden border border-slate-200">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.max(pct, 4)}%`,
                  backgroundColor: barColor,
                  filter: isHovered ? 'brightness(1.15)' : 'none',
                }}
              />
            </div>

            {/* Hover Tooltip Subtext */}
            <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
              <span>{item.subtext || 'Monitored Lot'}</span>
              {isHovered && (
                <span className="font-bold text-medred-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                  {pct}% of max volume ({item.count} total)
                </span>
              )}
            </div>
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
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);
  const total = data.reduce((acc, curr) => acc + curr.count, 0) || 1;
  let accumulatedAngle = 0;

  const size = 190;
  const strokeWidth = 28;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const activeData = hoveredSlice !== null ? data[hoveredSlice] : null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
      {/* SVG Donut */}
      <div className="relative w-48 h-48 flex items-center justify-center">
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
            const isHovered = hoveredSlice === idx;

            return (
              <circle
                key={idx}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={slice.color}
                strokeWidth={isHovered ? strokeWidth + 6 : strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                onMouseEnter={() => setHoveredSlice(idx)}
                onMouseLeave={() => setHoveredSlice(null)}
                className="transition-all duration-300 cursor-pointer"
                style={{ opacity: hoveredSlice !== null && !isHovered ? 0.45 : 1 }}
              />
            );
          })}
        </svg>

        {/* Center label with interactive hover tooltip */}
        <div className="absolute text-center pointer-events-none">
          {activeData ? (
            <div className="animate-in fade-in zoom-in-95">
              <div className="text-2xl font-black" style={{ color: activeData.color }}>
                {activeData.count}
              </div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-700">
                {activeData.label} ({Math.round((activeData.count / total) * 100)}%)
              </div>
            </div>
          ) : (
            <div>
              <div className="text-2xl font-black text-slate-800">{total}</div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Total Cases</div>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2 text-xs">
        {data.map((slice, idx) => {
          const pct = Math.round((slice.count / total) * 100);
          const isHovered = hoveredSlice === idx;

          return (
            <div
              key={idx}
              onMouseEnter={() => setHoveredSlice(idx)}
              onMouseLeave={() => setHoveredSlice(null)}
              className={`flex items-center space-x-2.5 p-1.5 rounded-lg cursor-pointer transition-all ${
                isHovered ? 'bg-slate-100 font-bold' : ''
              }`}
            >
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

// --- Interactive Monthly Trend Chart ---
export function MonthlyTrendChart({
  trends,
}: {
  trends: Array<{ month: string; count: number }>;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!trends || trends.length === 0) {
    return <div className="text-xs text-slate-400 py-6 text-center">No trend data recorded yet.</div>;
  }

  const max = Math.max(...trends.map((t) => t.count), 5);
  const height = 130;
  const width = 380;
  const padding = 24;

  const points = trends.map((t, index) => {
    const x = padding + (index / Math.max(trends.length - 1, 1)) * (width - 2 * padding);
    const y = height - padding - (t.count / max) * (height - 2 * padding);
    return { x, y, ...t, index };
  });

  const polylineStr = points.map((p) => `${p.x},${p.y}`).join(' ');
  const activePt = hoveredIndex !== null ? points[hoveredIndex] : null;

  return (
    <div className="w-full space-y-2">
      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-36 overflow-visible">
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D32F2F" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#D32F2F" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#cbd5e1" strokeWidth="1" />
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

          {/* Interactive Dots with Cursor Tooltips */}
          {points.map((p, idx) => {
            const isHovered = hoveredIndex === idx;

            return (
              <g
                key={idx}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer"
              >
                {/* Vertical hover guide line */}
                {isHovered && (
                  <line
                    x1={p.x}
                    y1={padding}
                    x2={p.x}
                    y2={height - padding}
                    stroke="#D32F2F"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                )}

                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? '7' : '4.5'}
                  fill={isHovered ? '#991b1b' : '#D32F2F'}
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="transition-all duration-200"
                />

                <text
                  x={p.x}
                  y={p.y - 12}
                  textAnchor="middle"
                  className={`text-[10px] font-black ${isHovered ? 'fill-medred-700 font-black' : 'fill-slate-800'}`}
                >
                  {p.count}
                </text>

                <text
                  x={p.x}
                  y={height - 6}
                  textAnchor="middle"
                  className={`text-[9px] font-semibold ${isHovered ? 'fill-slate-900 font-bold' : 'fill-slate-400'}`}
                >
                  {p.month}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Floating Hover Details Card */}
      {activePt ? (
        <div className="p-2.5 rounded-xl bg-slate-900 text-white text-xs flex items-center justify-between shadow-lg animate-in fade-in">
          <div>
            <span className="text-slate-400 text-[10px]">Month:</span>{' '}
            <strong className="text-white">{activePt.month}</strong>
          </div>
          <div>
            <span className="text-slate-400 text-[10px]">Reported Incidents:</span>{' '}
            <strong className="text-rose-400 font-mono text-sm">{activePt.count} ADRs</strong>
          </div>
        </div>
      ) : (
        <div className="text-[11px] text-slate-400 text-center italic">Hover over timeline data points for monthly analysis</div>
      )}
    </div>
  );
}
