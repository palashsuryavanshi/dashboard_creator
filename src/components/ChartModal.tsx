import React, { useRef } from 'react';
import { Chart } from 'react-chartjs-2';
import { X, Download, Table } from 'lucide-react';
import { ChartDefinition, ColorTheme, CustomTheme } from '../types/dashboard';
import { buildChartConfig } from '../utils/chartSetup';

interface ChartModalProps {
  definition: ChartDefinition | null;
  onClose: () => void;
  labels: string[];
  rows: Record<string, any>[];
  labelColumn: string;
  valueColumns: string[];
  secondaryYColumn?: string;
  theme: ColorTheme;
  chartStyle?: CustomTheme['charts'];
  isDark?: boolean;
}

export const ChartModal: React.FC<ChartModalProps> = ({
  definition,
  onClose,
  labels,
  rows,
  labelColumn,
  valueColumns,
  secondaryYColumn,
  theme,
  chartStyle,
  isDark = false
}) => {
  if (!definition) return null;

  const chartRef = useRef<any>(null);

  const config = buildChartConfig(
    definition.id,
    labels,
    rows,
    labelColumn,
    valueColumns,
    secondaryYColumn,
    theme,
    isDark,
    chartStyle
  );

  const handleDownloadPng = () => {
    if (!chartRef.current) return;
    const chart = chartRef.current;
    const base64 = chart.toBase64Image ? chart.toBase64Image('image/png', 1) : null;
    if (base64) {
      const link = document.createElement('a');
      link.href = base64;
      link.download = `${definition.id}-high-res.png`;
      link.click();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className={`rounded-2xl shadow-2xl border w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden ${
          isDark
            ? 'bg-[#111827] border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
        style={chartStyle ? { backgroundColor: chartStyle.chartBackground, borderColor: chartStyle.tooltipBorderColor } : undefined}
      >
        {/* Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between ${
            isDark
              ? 'bg-slate-900/80 border-slate-800'
              : 'bg-slate-50/80 border-slate-100'
          }`}
        >
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold tracking-tight">{definition.title}</h2>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                  isDark
                    ? 'bg-indigo-950/60 text-indigo-400 border-indigo-800/60'
                    : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                }`}
              >
                {definition.category}
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {definition.description}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPng}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download PNG
            </button>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isDark
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chart View */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div
            className={`w-full h-80 sm:h-96 relative rounded-2xl p-4 border ${
              isDark
                ? 'bg-slate-900/50 border-slate-800'
                : 'bg-white border-slate-100 shadow-2xs'
            }`}
            style={chartStyle ? { backgroundColor: chartStyle.chartBackground, borderColor: chartStyle.tooltipBorderColor } : undefined}
          >
            <Chart
              ref={chartRef}
              type={config.chartJsType as any}
              data={config.data}
              options={config.options}
            />
          </div>

          {/* Value Table */}
          <div
            className={`border rounded-xl overflow-hidden ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}
          >
            <div
              className={`px-4 py-2 border-b flex items-center gap-2 ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <Table className="w-4 h-4 text-slate-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Plotted Data ({labelColumn} &bull; {valueColumns.join(', ')})
              </h4>
            </div>
            <div className="overflow-x-auto max-h-48">
              <table className="w-full text-left text-xs">
                <thead
                  className={`font-semibold sticky top-0 ${
                    isDark ? 'bg-slate-900 text-slate-300' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <tr>
                    <th className="py-2 px-3 border-b border-inherit">{labelColumn}</th>
                    {valueColumns.map((col) => (
                      <th key={col} className="py-2 px-3 border-b border-inherit">{col}</th>
                    ))}
                    {secondaryYColumn && (
                      <th className="py-2 px-3 border-b border-inherit">{secondaryYColumn} (Secondary)</th>
                    )}
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                  {rows.map((row, idx) => (
                    <tr
                      key={idx}
                      className={isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}
                    >
                      <td className={`py-2 px-3 font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                        {labels[idx]}
                      </td>
                      {valueColumns.map((col) => (
                        <td key={col} className={`py-2 px-3 font-mono ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                          {row[col] ?? '0'}
                        </td>
                      ))}
                      {secondaryYColumn && (
                        <td className="py-2 px-3 font-mono text-indigo-400 font-semibold">
                          {row[secondaryYColumn] ?? '0'}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartModal;
