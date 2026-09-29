'use client';

import { useState } from 'react';
import { ChartDataPoint } from '../api/actions/dashboard';

export default function TwoSeriesLineChart({ data }: { data: ChartDataPoint[] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-sm border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
        <span>No transaction activity found for this period.</span>
        <span className="text-xs text-slate-500 mt-1">Data points will populate once transactions are recorded.</span>
      </div>
    );
  }

  const width = 800;
  const height = 300;
  const padding = 55;

  const maxVal = Math.max(...data.map((d) => Math.max(d.income, d.expense)), 50);
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;

  const getX = (idx: number) =>
    data.length === 1 ? padding + innerWidth / 2 : padding + (idx / (data.length - 1)) * innerWidth;
  const getY = (val: number) => height - padding - (val / maxVal) * innerHeight;

  const incomePath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.income)}`)
    .join(' ');

  const expensePath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.expense)}`)
    .join(' ');

  return (
    <div className="relative w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[550px] overflow-visible">
        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = height - padding - ratio * innerHeight;
          const valLabel = (ratio * maxVal).toFixed(0);
          return (
            <g key={ratio}>
              <line
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="currentColor"
                className="text-slate-100 dark:text-slate-800/80"
                strokeDasharray="4 4"
              />
              <text x={padding - 10} y={y + 4} textAnchor="end" className="text-[10px] fill-slate-400">
                ₦{valLabel}
              </text>
            </g>
          );
        })}

        {/* Expense Series (Rose line) */}
        <path d={expensePath} fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Income Series (Emerald line) */}
        <path d={incomePath} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Points and Interaction Areas */}
        {data.map((d, i) => {
          const cx = getX(i);
          return (
            <g key={i} className="cursor-pointer" onMouseEnter={() => setHoveredIdx(i)} onMouseLeave={() => setHoveredIdx(null)}>
              {hoveredIdx === i && (
                <line x1={cx} y1={padding} x2={cx} y2={height - padding} stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="1" strokeDasharray="2 2" />
              )}
              <circle cx={cx} cy={getY(d.income)} r={hoveredIdx === i ? 6 : 4} className="fill-emerald-500 stroke-white dark:stroke-slate-900 stroke-2" />
              <circle cx={cx} cy={getY(d.expense)} r={hoveredIdx === i ? 6 : 4} className="fill-rose-500 stroke-white dark:stroke-slate-900 stroke-2" />
              <text x={cx} y={height - padding + 18} textAnchor="middle" className="text-[11px] fill-slate-500 font-medium">
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Floating Hover Tooltip */}
      {hoveredIdx !== null && data[hoveredIdx] && (
        <div className="absolute top-2 right-4 bg-slate-900/90 text-white dark:bg-white/90 dark:text-slate-900 p-3 rounded-lg shadow-lg text-xs backdrop-blur-sm pointer-events-none">
          <div className="font-semibold mb-1">{data[hoveredIdx].label}</div>
          <div className="text-emerald-400 dark:text-emerald-600 font-medium">
            Income: +₦{data[hoveredIdx].income.toFixed(2)}
          </div>
          <div className="text-rose-400 dark:text-rose-600 font-medium">
            Expense: -₦{data[hoveredIdx].expense.toFixed(2)}
          </div>
        </div>
      )}
    </div>
  );
}