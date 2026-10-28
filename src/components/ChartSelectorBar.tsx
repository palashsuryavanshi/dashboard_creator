import React, { useState } from 'react';
import {
  Search,
  Palette,
  Grid3X3,
  Columns2,
  Filter,
  CheckSquare,
  Square,
  ChevronDown
} from 'lucide-react';
import { ChartCategory, ChartDefinition, ChartType, ColorTheme } from '../types/dashboard';
import { COLOR_THEMES } from '../utils/chartSetup';

interface ChartSelectorBarProps {
  allCharts: ChartDefinition[];
  activeCategory: ChartCategory;
  onCategoryChange: (cat: ChartCategory) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedChartIds: Set<ChartType>;
  onToggleChartId: (id: ChartType) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  layoutGrid: '2-col' | '3-col';
  onLayoutChange: (grid: '2-col' | '3-col') => void;
  activeTheme: ColorTheme;
  onThemeChange: (theme: ColorTheme) => void;
}

export const ChartSelectorBar: React.FC<ChartSelectorBarProps> = ({
  allCharts,
  activeCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  selectedChartIds,
  onToggleChartId,
  onSelectAll,
  onDeselectAll,
  layoutGrid,
  onLayoutChange,
  activeTheme,
  onThemeChange
}) => {
  const [showFilterDropdown, setShowFilterDropdown] = useState<boolean>(false);
  const [showThemeDropdown, setShowThemeDropdown] = useState<boolean>(false);

  const categories: { id: ChartCategory; label: string; count: number }[] = [
    { id: 'all', label: 'All Charts', count: allCharts.length },
    {
      id: 'bar-column',
      label: 'Bar & Column',
      count: allCharts.filter((c) => c.category === 'bar-column').length
    },
    {
      id: 'line-area',
      label: 'Line & Area',
      count: allCharts.filter((c) => c.category === 'line-area').length
    },
    {
      id: 'combo',
      label: 'Combo',
      count: allCharts.filter((c) => c.category === 'combo').length
    },
    {
      id: 'specialty',
      label: 'Specialty & Radial',
      count: allCharts.filter((c) => c.category === 'specialty').length
    }
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-3.5 sm:p-4 mb-6 space-y-3">
      {/* Category Tabs & Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Category Pill Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-800'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-indigo-700/80 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Tools: Search, Filter Checkboxes, Theme, Layout */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search charts */}
          <div className="relative w-40 sm:w-48">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter chart types..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Visibility Checkbox Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowFilterDropdown(!showFilterDropdown);
                setShowThemeDropdown(false);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5 text-indigo-600" />
              <span>Visible ({selectedChartIds.size}/{allCharts.length})</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-30 animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-xs">
                  <span className="font-bold text-slate-700">Display Chart Selection</span>
                  <div className="flex gap-2">
                    <button
                      onClick={onSelectAll}
                      className="text-indigo-600 hover:text-indigo-800 font-medium text-[11px]"
                    >
                      All
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      onClick={onDeselectAll}
                      className="text-slate-500 hover:text-slate-700 font-medium text-[11px]"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-1">
                  {allCharts.map((chart) => {
                    const isSelected = selectedChartIds.has(chart.id);
                    return (
                      <div
                        key={chart.id}
                        onClick={() => onToggleChartId(chart.id)}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-slate-50 cursor-pointer text-xs select-none"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-indigo-600 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300 shrink-0" />
                        )}
                        <span className={`truncate ${isSelected ? 'font-medium text-slate-800' : 'text-slate-500'}`}>
                          {chart.title}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Theme Selector */}
          <div className="relative">
            <button
              onClick={() => {
                setShowThemeDropdown(!showThemeDropdown);
                setShowFilterDropdown(false);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              <Palette className="w-3.5 h-3.5 text-indigo-600" />
              <span>Theme</span>
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: activeTheme.borderPalette[0] }}
              />
            </button>

            {showThemeDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-30 animate-in fade-in zoom-in-95 duration-100">
                <div className="text-[11px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                  Color Palettes
                </div>
                <div className="space-y-1">
                  {COLOR_THEMES.map((th) => (
                    <button
                      key={th.id}
                      onClick={() => {
                        onThemeChange(th);
                        setShowThemeDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left transition-colors ${
                        activeTheme.id === th.id
                          ? 'bg-indigo-50 text-indigo-700 font-semibold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span>{th.name}</span>
                      <div className="flex gap-1">
                        {th.borderPalette.slice(0, 3).map((c, i) => (
                          <span
                            key={i}
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Grid Layout Toggle */}
          <div className="hidden sm:flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50">
            <button
              onClick={() => onLayoutChange('2-col')}
              title="2 Columns Layout"
              className={`p-1 rounded ${
                layoutGrid === '2-col'
                  ? 'bg-white shadow-2xs text-indigo-600 font-bold'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Columns2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onLayoutChange('3-col')}
              title="3 Columns Layout"
              className={`p-1 rounded ${
                layoutGrid === '3-col'
                  ? 'bg-white shadow-2xs text-indigo-600 font-bold'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartSelectorBar;
