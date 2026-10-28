import React, { useRef } from 'react';
import { Chart } from 'react-chartjs-2';
import { Download, Maximize2, Layers } from 'lucide-react';
import { ChartDefinition, ColorTheme } from '../types/dashboard';
import { buildChartConfig } from '../utils/chartSetup';

interface ChartCardProps {
  definition: ChartDefinition;
  labels: string[];
  rows: Record<string, any>[];
  labelColumn: string;
  valueColumns: string[];
  secondaryYColumn?: string;
  theme: ColorTheme;
  isDark?: boolean;
  onMaximize: (def: ChartDefinition) => void;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  definition,
  labels,
  rows,
  labelColumn,
  valueColumns,
  secondaryYColumn,
  theme,
  isDark = false,
  onMaximize
}) => {
  const chartRef = useRef<any>(null);

  const config = buildChartConfig(
    definition.id,
    labels,
    rows,
    labelColumn,
    valueColumns,
    secondaryYColumn,
    theme,
    isDark
  );

  const handleDownloadPng = () => {
    if (!chartRef.current) return;
    const chart = chartRef.current;
    const base64 = chart.toBase64Image ? chart.toBase64Image('image/png', 1) : null;
    if (base64) {
      const link = document.createElement('a');
      link.href = base64;
      link.download = `${definition.id}-chart.png`;
      link.click();
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'bar-column':
        return {
          label: 'Bar & Column',
          className: isDark
            ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
            : 'bg-blue-50 text-blue-700 border-blue-200'
        };
      case 'line-area':
        return {
          label: 'Line & Area',
          className: isDark
            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
        };
      case 'combo':
        return {
          label: 'Combo',
          className: isDark
            ? 'bg-purple-500/15 text-purple-400 border-purple-500/30'
            : 'bg-purple-50 text-purple-700 border-purple-200'
        };
      case 'specialty':
        return {
          label: 'Specialty & Radial',
          className: isDark
            ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
            : 'bg-amber-50 text-amber-700 border-amber-200'
        };
      default:
        return {
          label: category,
          className: isDark
            ? 'bg-slate-700/50 text-slate-300 border-slate-600'
            : 'bg-slate-50 text-slate-700 border-slate-200'
        };
    }
  };

  const badge = getCategoryBadge(definition.category);

  return (
    <div
      className={`rounded-2xl transition-all duration-200 flex flex-col overflow-hidden group ${
        isDark
          ? 'bg-[#111827]/90 border border-slate-800/80 shadow-md hover:border-slate-700 hover:shadow-xl'
          : 'bg-white border border-slate-200/90 shadow-2xs hover:shadow-md'
      }`}
    >
      {/* Header */}
      <div
        className={`px-4 py-3 border-b flex items-center justify-between gap-2 ${
          isDark
            ? 'bg-slate-900/60 border-slate-800/80'
            : 'bg-slate-50/70 border-slate-100'
        }`}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3
              className={`text-xs font-bold truncate tracking-tight ${
                isDark ? 'text-slate-100' : 'text-slate-900'
              }`}
              title={definition.title}
            >
              {definition.title}
            </h3>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.className} shrink-0`}
            >
              {badge.label}
            </span>
          </div>
          <p
            className={`text-[11px] truncate mt-0.5 ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            {definition.description}
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleDownloadPng}
            title="Download PNG image"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-slate-400 hover:text-indigo-600 hover:bg-white'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onMaximize(definition)}
            title="Maximize View"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-slate-400 hover:text-indigo-600 hover:bg-white'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="p-4 flex-1 flex flex-col justify-center min-h-[250px] relative">
        {definition.isMultiDatasetRecommended && valueColumns.length < 2 && (
          <div
            className={`mb-2 px-2.5 py-1 rounded-md flex items-center gap-1.5 text-[10px] font-medium border ${
              isDark
                ? 'bg-amber-950/40 border-amber-800/40 text-amber-300'
                : 'bg-amber-50 border-amber-200/60 text-amber-700'
            }`}
          >
            <Layers className="w-3 h-3 shrink-0" />
            <span>Select 2+ Y-Axis metrics above to compare series</span>
          </div>
        )}
        <div className="w-full h-56 relative">
          <Chart
            ref={chartRef}
            type={config.chartJsType as any}
            data={config.data}
            options={config.options}
          />
        </div>
      </div>
    </div>
  );
};

export default ChartCard;
