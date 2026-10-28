import React from 'react';
import { X, Plus, Trash2, Sliders, Check, RotateCcw } from 'lucide-react';
import { ColorTheme, ExcelColumnMapping } from '../types/dashboard';

interface ColumnMappingModalProps {
  isOpen: boolean;
  onClose: () => void;
  headers: string[];
  labelColumn: string;
  onLabelColumnChange: (col: string) => void;
  mappings: ExcelColumnMapping[];
  onMappingsChange: (mappings: ExcelColumnMapping[]) => void;
  theme: ColorTheme;
  onResetAuto: () => void;
}

export const ColumnMappingModal: React.FC<ColumnMappingModalProps> = ({
  isOpen,
  onClose,
  headers,
  labelColumn,
  onLabelColumnChange,
  mappings,
  onMappingsChange,
  theme,
  onResetAuto
}) => {
  if (!isOpen) return null;

  const handleAddMapping = () => {
    // pick first header not already mapped
    const unmapped = headers.find((h) => h !== labelColumn && !mappings.some((m) => m.columnName === h));
    const targetCol = unmapped || headers.find((h) => h !== labelColumn) || headers[0];
    const newIdx = mappings.length;

    onMappingsChange([
      ...mappings,
      {
        columnName: targetCol,
        chartLabel: targetCol,
        color: theme.palette[newIdx % theme.palette.length],
        datasetIndex: newIdx
      }
    ]);
  };

  const handleUpdateMapping = (index: number, updates: Partial<ExcelColumnMapping>) => {
    const updated = mappings.map((m, i) => (i === index ? { ...m, ...updates } : m));
    onMappingsChange(updated);
  };

  const handleRemoveMapping = (index: number) => {
    if (mappings.length <= 1) return; // keep at least 1
    const filtered = mappings.filter((_, i) => i !== index);
    onMappingsChange(filtered);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Custom Data & Column Mapping
              </h2>
              <p className="text-xs text-slate-500">
                Map spreadsheet columns to chart labels, values, and series datasets.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Category / X-Axis Column Selection */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Category / X-Axis Label Column
            </label>
            <p className="text-xs text-slate-500">
              The primary categorical column used for chart axis labels (e.g. Month, Product, Region, Quarter).
            </p>
            <select
              value={labelColumn}
              onChange={(e) => onLabelColumnChange(e.target.value)}
              className="w-full mt-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {headers.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>

          {/* Metric / Y-Axis Series Mappings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Numerical Value Series ({mappings.length} Active)
                </label>
                <p className="text-xs text-slate-500">
                  Select numerical columns to chart. Multiple series enable multi-bar clusters, stacked charts, and combo overlays.
                </p>
              </div>
              <button
                onClick={handleAddMapping}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Metric Series
              </button>
            </div>

            <div className="space-y-2.5">
              {mappings.map((mapping, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors shadow-2xs"
                >
                  <span className="w-6 h-6 flex items-center justify-center bg-slate-100 text-slate-600 rounded-full text-xs font-bold shrink-0">
                    {idx + 1}
                  </span>

                  {/* Column selection */}
                  <div className="flex-1 min-w-[140px]">
                    <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">
                      Spreadsheet Column
                    </span>
                    <select
                      value={mapping.columnName}
                      onChange={(e) =>
                        handleUpdateMapping(idx, {
                          columnName: e.target.value,
                          chartLabel: mapping.chartLabel === mapping.columnName ? e.target.value : mapping.chartLabel
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      {headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Display Label */}
                  <div className="flex-1 min-w-[140px]">
                    <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">
                      Display Title on Chart
                    </span>
                    <input
                      type="text"
                      value={mapping.chartLabel}
                      onChange={(e) => handleUpdateMapping(idx, { chartLabel: e.target.value })}
                      placeholder="Display label"
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Color Picker preview */}
                  <div className="w-20 shrink-0">
                    <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">
                      Theme Color
                    </span>
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg">
                      <span
                        className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                        style={{
                          backgroundColor:
                            mapping.color || theme.palette[idx % theme.palette.length]
                        }}
                      />
                      <span className="text-[10px] text-slate-500 font-mono">
                        #{idx + 1}
                      </span>
                    </div>
                  </div>

                  {/* Delete button */}
                  <div className="sm:self-end pb-0.5">
                    <button
                      onClick={() => handleRemoveMapping(idx)}
                      disabled={mappings.length <= 1}
                      title={mappings.length <= 1 ? 'Minimum 1 series required' : 'Remove series'}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={onResetAuto}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to Auto
          </button>

          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Check className="w-4 h-4" />
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ColumnMappingModal;
