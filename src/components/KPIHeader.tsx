import React from 'react';
import {
  TrendingUp,
  BarChart3,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Award
} from 'lucide-react';
import { ExcelColumnMapping } from '../types/dashboard';

interface KPIHeaderProps {
  labelColumn: string;
  labels: string[];
  rows: Record<string, any>[];
  mappings: ExcelColumnMapping[];
}

export const KPIHeader: React.FC<KPIHeaderProps> = ({
  labelColumn,
  labels,
  rows,
  mappings
}) => {
  if (rows.length === 0 || mappings.length === 0) return null;

  const primaryMapping = mappings[0];
  const primaryCol = primaryMapping.columnName;

  const values: number[] = rows.map((r) => {
    const val = r[primaryCol];
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    const clean = parseFloat(String(val ?? '0').replace(/[^0-9.-]/g, ''));
    return isNaN(clean) ? 0 : clean;
  });

  const total = values.reduce((acc, curr) => acc + curr, 0);
  const avg = values.length > 0 ? total / values.length : 0;

  // Max peak
  let maxIdx = 0;
  values.forEach((v, idx) => {
    if (v > values[maxIdx]) maxIdx = idx;
  });
  const peakLabel = labels[maxIdx] || 'N/A';
  const peakValue = values[maxIdx] || 0;

  // Growth (first vs last)
  const first = values[0] || 0;
  const last = values[values.length - 1] || 0;
  const growthRate = first !== 0 ? ((last - first) / Math.abs(first)) * 100 : 0;
  const isPositiveGrowth = growthRate >= 0;

  const formatNumber = (num: number) => {
    if (Math.abs(num) >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (Math.abs(num) >= 1_000) return `${(num / 1_000).toFixed(1)}k`;
    return num.toLocaleString(undefined, { maximumFractionDigits: 1 });
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-6">
      {/* Total Volume */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider">
            Total {primaryMapping.chartLabel}
          </span>
          <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
            <BarChart3 className="w-4 h-4" />
          </span>
        </div>
        <div className="text-xl sm:text-2xl font-bold text-slate-800 font-mono tracking-tight">
          {formatNumber(total)}
        </div>
        <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
          <span>Across {rows.length} records</span>
        </div>
      </div>

      {/* Average */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider">
            Average per {labelColumn}
          </span>
          <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <TrendingUp className="w-4 h-4" />
          </span>
        </div>
        <div className="text-xl sm:text-2xl font-bold text-slate-800 font-mono tracking-tight">
          {formatNumber(avg)}
        </div>
        <div className="text-[11px] text-slate-400 mt-1">
          <span>Median baseline metric</span>
        </div>
      </div>

      {/* Peak Performer */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider">
            Peak: {peakLabel}
          </span>
          <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
            <Award className="w-4 h-4" />
          </span>
        </div>
        <div className="text-xl sm:text-2xl font-bold text-slate-800 font-mono tracking-tight">
          {formatNumber(peakValue)}
        </div>
        <div className="text-[11px] text-slate-400 mt-1 truncate">
          <span>Highest recorded value</span>
        </div>
      </div>

      {/* Net Trend / Growth */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider">
            Series Trend
          </span>
          <span
            className={`p-1.5 rounded-lg ${
              isPositiveGrowth
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-rose-50 text-rose-600'
            }`}
          >
            {isPositiveGrowth ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : (
              <ArrowDownRight className="w-4 h-4" />
            )}
          </span>
        </div>
        <div
          className={`text-xl sm:text-2xl font-bold font-mono tracking-tight ${
            isPositiveGrowth ? 'text-emerald-600' : 'text-rose-600'
          }`}
        >
          {isPositiveGrowth ? '+' : ''}
          {growthRate.toFixed(1)}%
        </div>
        <div className="text-[11px] text-slate-400 mt-1">
          <span>First to latest change</span>
        </div>
      </div>
    </div>
  );
};

export default KPIHeader;
