import React, { useState, useRef } from 'react';
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  Database,
  Sliders,
  ChevronDown,
  ChevronUp,
  Table,
  Search,
  ExternalLink,
  Layers,
  Sparkles,
  BarChart3,
  Moon,
  Sun,
  Palette,
  Check,
  Filter,
  Settings,
  X,
  RotateCcw
} from 'lucide-react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { ChartDefinition, ChartType, ColorTheme, CustomTheme, ChartThemeOverride } from './types/dashboard';
import { DEFAULT_CUSTOM_THEME, loadCustomTheme, saveCustomTheme } from './utils/customTheme';
import { mergeChartTheme } from './utils/customTheme';
import { CHART_DEFINITIONS, COLOR_THEMES } from './utils/chartSetup';
import { PRESET_DATASETS, PresetDataset } from './data/sampleDatasets';
import { ChartCard } from './components/ChartCard';
import { ChartModal } from './components/ChartModal';

export default function App() {
  // Light mode only
  const isDarkMode = false;

  // Active Color Palette Theme
  const [activeTheme, setActiveTheme] = useState<ColorTheme>(COLOR_THEMES[0]);
  const [savedTheme] = useState(() => loadCustomTheme(window.localStorage));
  const [customTheme, setCustomTheme] = useState<CustomTheme>(savedTheme.theme);
  const [chartOverrides, setChartOverrides] = useState<Record<string, ChartThemeOverride>>(savedTheme.chartOverrides);
  const [isUsingCustom, setIsUsingCustom] = useState(savedTheme.enabled);
  const [showThemeEditor, setShowThemeEditor] = useState(false);
  const [editingUseCustom, setEditingUseCustom] = useState(savedTheme.enabled);
  const [editingOverrides, setEditingOverrides] = useState<Record<string, ChartThemeOverride>>(savedTheme.chartOverrides);
  const [editingTheme, setEditingTheme] = useState<CustomTheme>(savedTheme.theme);
  const [editingChart, setEditingChart] = useState<string | null>(null);
  const [editingChartStyle, setEditingChartStyle] = useState<CustomTheme['charts']>(savedTheme.theme.charts);

  // Data State
  const [fileName, setFileName] = useState<string>('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [availableSheets, setAvailableSheets] = useState<string[]>([]);
  const [activeSheet, setActiveSheet] = useState<string>('');
  const [cachedWorkbook, setCachedWorkbook] = useState<ExcelJS.Workbook | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Axis Selection State
  const [xAxisColumn, setXAxisColumn] = useState<string>('');
  const [primaryYColumns, setPrimaryYColumns] = useState<string[]>([]);
  const [secondaryYColumn, setSecondaryYColumn] = useState<string>('');

  // UI Controls
  const [showDataPreview, setShowDataPreview] = useState<boolean>(false);
  const [selectedChart, setSelectedChart] = useState<string>('');
  const [previewSearch, setPreviewSearch] = useState<string>('');
  const [previewPage, setPreviewPage] = useState<number>(1);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [maximizedDef, setMaximizedDef] = useState<ChartDefinition | null>(null);
  const [filterText, setFilterText] = useState<string>('');
  const [filterColumn, setFilterColumn] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Separate detected numeric headers from all headers
  const detectedNumericHeaders = headers.filter((h) => {
    return rows.some((r) => typeof r[h] === 'number');
  });

  // Extract X-axis labels
  const labels: string[] = rows.map((r, i) => {
    const val = r[xAxisColumn];
    return val !== undefined && val !== null && val !== '' ? String(val) : `Item ${i + 1}`;
  });

  // Helper to parse worksheet rows & headers
  const parseWorksheet = (worksheet: ExcelJS.Worksheet, name: string) => {
    const detectedHeaders: string[] = [];
    const detectedRows: Record<string, any>[] = [];

    worksheet.getRow(1).eachCell({ includeEmpty: false }, (cell, colNumber) => {
      const headerText = cell.text || (cell.value ? String(cell.value) : `Column ${colNumber}`);
      detectedHeaders.push(headerText.trim());
    });

    if (detectedHeaders.length === 0) {
      throw new Error('No headers found in the first row of this sheet.');
    }

    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return;
      const rowData: Record<string, any> = {};
      let hasData = false;

      detectedHeaders.forEach((header, idx) => {
        const cell = row.getCell(idx + 1);
        let val: any = cell.value;
        if (val && typeof val === 'object') {
          val = 'result' in val ? val.result : 'text' in val ? val.text : val;
        }

        const str = String(val ?? '').trim();
        const num = parseFloat(str.replace(/[^0-9.-]/g, ''));
        if (!isNaN(num) && str !== '') {
          rowData[header] = num;
          hasData = true;
        } else if (str !== '') {
          rowData[header] = str;
          hasData = true;
        } else {
          rowData[header] = '';
        }
      });

      if (hasData) {
        detectedRows.push(rowData);
      }
    });

    if (detectedRows.length === 0) {
      throw new Error('No data rows found below headers.');
    }

    setFileName(name);
    setHeaders(detectedHeaders);
    setRows(detectedRows);
    setPreviewPage(1);

    // Auto-detect optimal X-axis and Y-axis
    let autoX = detectedHeaders[0];
    const autoNumericCols: string[] = [];

    detectedHeaders.forEach((h) => {
      const isNum = detectedRows.some((r) => typeof r[h] === 'number');
      if (isNum) {
        autoNumericCols.push(h);
      } else if (autoX === detectedHeaders[0]) {
        autoX = h;
      }
    });

    setXAxisColumn(autoX);

    const initialPrimaryY = autoNumericCols.length > 0
      ? autoNumericCols.slice(0, 2)
      : detectedHeaders.filter((h) => h !== autoX).slice(0, 1);
    setPrimaryYColumns(initialPrimaryY);

    const initialSecondaryY = autoNumericCols.length > 2
      ? autoNumericCols[2]
      : '';
    setSecondaryYColumn(initialSecondaryY);
  };

  // Upload file handler
  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = new ExcelJS.Workbook();

      if (file.name.endsWith('.csv')) {
        const text = new TextDecoder().decode(buffer);
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 2) throw new Error('CSV has fewer than 2 lines.');

        const sheet = workbook.addWorksheet('Data');
        lines.forEach((line) => {
          const cells = line.split(',').map((c) => c.replace(/^["']|["']$/g, '').trim());
          sheet.addRow(cells);
        });

        setCachedWorkbook(workbook);
        setAvailableSheets(['Data']);
        setActiveSheet('Data');
        parseWorksheet(sheet, file.name);
      } else {
        await workbook.xlsx.load(buffer);
        const sheetNames = workbook.worksheets.map((ws) => ws.name);
        if (sheetNames.length === 0) throw new Error('No worksheets in workbook.');

        setCachedWorkbook(workbook);
        setAvailableSheets(sheetNames);
        const firstSheet = workbook.worksheets[0];
        setActiveSheet(firstSheet.name);
        parseWorksheet(firstSheet, file.name);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to read file. Please ensure it is a valid .xlsx, .xls, or .csv.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSheetSwitch = (sheetName: string) => {
    if (!cachedWorkbook) return;
    const ws = cachedWorkbook.getWorksheet(sheetName);
    if (!ws) return;
    setActiveSheet(sheetName);
    try {
      parseWorksheet(ws, fileName);
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  // Load a sample preset
  const handleLoadPreset = (preset: PresetDataset) => {
    setFileName(`${preset.id}.xlsx`);
    setHeaders(preset.headers);
    setRows(preset.rows);
    setXAxisColumn(preset.labelColumn);
    setPrimaryYColumns(preset.valueColumns.slice(0, 2));
    setSecondaryYColumn(preset.valueColumns[2] || '');
    setAvailableSheets([]);
    setCachedWorkbook(null);
    setPreviewPage(1);
    setErrorMsg(null);
  };

  // Toggle primary Y column
  const handleTogglePrimaryY = (col: string) => {
    if (primaryYColumns.includes(col)) {
      if (primaryYColumns.length > 1) {
        setPrimaryYColumns(primaryYColumns.filter((c) => c !== col));
      }
    } else {
      setPrimaryYColumns([...primaryYColumns, col]);
    }
  };

  // Download Sample Template
  const handleDownloadTemplate = async () => {
    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet('Sales Data');

    ws.columns = [
      { header: 'Period', key: 'Period', width: 14 },
      { header: 'Revenue ($k)', key: 'Revenue', width: 18 },
      { header: 'Profit ($k)', key: 'Profit', width: 18 },
      { header: 'Growth Rate %', key: 'Growth', width: 16 }
    ];

    ws.addRows([
      { Period: 'Q1', Revenue: 120, Profit: 65, Growth: 14 },
      { Period: 'Q2', Revenue: 145, Profit: 82, Growth: 21 },
      { Period: 'Q3', Revenue: 180, Profit: 105, Growth: 24 },
      { Period: 'Q4', Revenue: 220, Profit: 135, Growth: 32 }
    ]);

    const buf = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'sample-dashboard-template.xlsx');
  };

  // Export current data as CSV
  const handleExportCsv = () => {
    if (rows.length === 0) return;
    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        headers.map((h) => {
          const val = row[h] !== undefined ? String(row[h]) : '';
          return val.includes(',') ? `"${val}"` : val;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${fileName.replace(/[^a-zA-Z0-9_-]/g, '_')}.csv`);
  };

  const handleReset = () => {
    setFileName('');
    setHeaders([]);
    setRows([]);
    setAvailableSheets([]);
    setActiveSheet('');
    setCachedWorkbook(null);
    setIsLoading(false);
    setErrorMsg(null);
    setXAxisColumn('');
    setPrimaryYColumns([]);
    setSecondaryYColumn('');
    setShowDataPreview(false);
    setPreviewSearch('');
    setPreviewPage(1);
    setSelectedChart('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // KPI Calculations
  const primaryMetric = primaryYColumns[0] || headers[1] || headers[0] || 'Metric';
  const primaryValues: number[] = rows.map((r) => {
    const val = r[primaryMetric];
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    const num = parseFloat(String(val ?? '0').replace(/[^0-9.-]/g, ''));
    return isNaN(num) ? 0 : num;
  });

  const totalPrimary = primaryValues.reduce((a, b) => a + b, 0);
  const avgPrimary = primaryValues.length > 0 ? totalPrimary / primaryValues.length : 0;
  let maxIdx = 0;
  primaryValues.forEach((v, idx) => {
    if (v > primaryValues[maxIdx]) maxIdx = idx;
  });
  const peakCategory = labels[maxIdx] || 'N/A';
  const peakVal = primaryValues[maxIdx] || 0;

  // Filtered preview rows (for data table)
  const filteredPreviewRows = rows.filter((r) => {
    if (!previewSearch) return true;
    return Object.values(r).some((v) =>
      String(v).toLowerCase().includes(previewSearch.toLowerCase())
    );
  });
  const pageSize = 5;
  const totalPreviewPages = Math.ceil(filteredPreviewRows.length / pageSize) || 1;
  const paginatedPreviewRows = filteredPreviewRows.slice(
    (previewPage - 1) * pageSize,
    previewPage * pageSize
  );

  // Data filter for charts (filter by column value)
  const filteredChartRows = filterText && filterColumn
    ? rows.filter((r) => {
        const val = r[filterColumn];
        if (val === undefined || val === null) return false;
        return String(val).toLowerCase().includes(filterText.toLowerCase());
      })
    : rows;

  // Filter charts
  const displayedCharts = CHART_DEFINITIONS.filter((def) => {
    if (activeCategory !== 'all' && def.category !== activeCategory) return false;
    return true;
  });

  const axesSelected = Boolean(xAxisColumn && primaryYColumns.length > 0);

  const persistTheme = (theme: CustomTheme, overrides: Record<string, ChartThemeOverride>, enabled: boolean) => {
    setCustomTheme(theme);
    setChartOverrides(overrides);
    setIsUsingCustom(enabled);
    saveCustomTheme(window.localStorage, { theme, chartOverrides: overrides, enabled });
  };

  const effectivePalette: ColorTheme = isUsingCustom
    ? { ...activeTheme, palette: customTheme.charts.colors.map((color) => `${color}c7`), borderPalette: customTheme.charts.colors }
    : activeTheme;
  const baseChartStyle: CustomTheme['charts'] = {
    ...customTheme.charts,
    colors: isUsingCustom ? customTheme.charts.colors : activeTheme.borderPalette,
  };
  const getChartStyle = (chartId: string) => isUsingCustom
    ? mergeChartTheme(baseChartStyle, chartOverrides[chartId])
    : chartOverrides[chartId]
      ? mergeChartTheme(baseChartStyle, chartOverrides[chartId])
      : undefined;

  const openThemeEditor = (chartId?: string) => {
    setEditingTheme(customTheme);
    setEditingUseCustom(isUsingCustom);
    setEditingOverrides(chartOverrides);
    setEditingChart(chartId ?? null);
    setEditingChartStyle(chartId ? getChartStyle(chartId) ?? baseChartStyle : baseChartStyle);
    setShowThemeEditor(true);
  };

  const updateEditingApp = <K extends keyof CustomTheme['app']>(key: K, value: CustomTheme['app'][K]) => {
    setEditingTheme((previous) => ({ ...previous, app: { ...previous.app, [key]: value } }));
  };

  const updateEditingCharts = <K extends keyof CustomTheme['charts']>(key: K, value: CustomTheme['charts'][K]) => {
    setEditingTheme((previous) => ({ ...previous, charts: { ...previous.charts, [key]: value } }));
  };

  const applyThemeEditor = () => {
    if (editingChart) {
      const overrides = { ...chartOverrides };
      const sparseOverride: ChartThemeOverride = {};
      (Object.keys(baseChartStyle) as Array<keyof CustomTheme['charts']>).forEach((key) => {
        const unchanged = key === 'colors'
          ? JSON.stringify(editingChartStyle.colors) === JSON.stringify(baseChartStyle.colors)
          : editingChartStyle[key] === baseChartStyle[key];
        if (!unchanged) sparseOverride[key] = editingChartStyle[key] as never;
      });
      if (Object.keys(sparseOverride).length) overrides[editingChart] = sparseOverride;
      else delete overrides[editingChart];
      persistTheme(customTheme, overrides, isUsingCustom);
    } else {
      persistTheme(editingTheme, editingOverrides, editingUseCustom);
    }
    setShowThemeEditor(false);
  };

  // Filtered labels for charts
  const filteredLabels = filteredChartRows.map((r, i) => {
    const val = r[xAxisColumn];
    return val !== undefined && val !== null && val !== '' ? String(val) : `Item ${i + 1}`;
  });

  const visibleCharts =
    selectedChart === 'all'
      ? CHART_DEFINITIONS
      : selectedChart
      ? CHART_DEFINITIONS.filter((def) => def.id === selectedChart)
      : [];

  const appThemeStyle = isUsingCustom ? {
    '--theme-page-background': customTheme.app.pageBackground,
    '--theme-header-background': customTheme.app.headerBackground,
    '--theme-card-background': customTheme.app.cardBackground,
    '--theme-text-color': customTheme.app.textColor,
    '--theme-muted-text-color': customTheme.app.mutedTextColor,
    '--theme-border-color': customTheme.app.borderColor,
    '--theme-accent-color': customTheme.app.accentColor,
    '--theme-card-radius': `${customTheme.app.cardRadius}px`,
    backgroundColor: customTheme.app.pageBackground,
    color: customTheme.app.textColor,
    fontFamily: customTheme.app.fontFamily,
    fontSize: `${customTheme.app.baseFontSize}px`,
  } as React.CSSProperties : undefined;

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        isDarkMode ? 'bg-[#0B0F17] text-slate-100' : 'bg-gray-200 text-slate-900'
      } ${isUsingCustom ? 'custom-theme-active' : ''}`}
      style={appThemeStyle}
    >
      {/* 1. Ultra-Sleek Modern Header */}
      <header className={`sticky top-0 z-30 border-b backdrop-blur-md shadow-md ${isUsingCustom ? 'custom-theme-header' : ''}`} style={isUsingCustom ? { backgroundColor: customTheme.app.headerBackground, borderColor: customTheme.app.borderColor, fontFamily: customTheme.app.fontFamily } : { backgroundColor: '#059669', borderColor: '#047857' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md shadow-emerald-900/30 bg-emerald-700">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base font-extrabold tracking-tight text-white">
                  Dashboard Creator
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/40 bg-white/15 text-white shadow-2xs">
                  18 Chart Types
                </span>
                <span className="text-xs text-white/90">
                  created by{' '}
                  <a
                    href="https://in.linkedin.com/in/palashsuryavanshi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold underline hover:text-white"
                  >
                    palashsuryavanshi
                  </a>
                </span>
              </div>
              <p className="text-xs hidden sm:block text-white/80">
                Excel &amp; CSV Data Visualizer &bull; Custom Axis Binding &bull; Instant Charts
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => openThemeEditor()}
            aria-label="Customize website and dashboard theme"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Customize theme</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6 ${isUsingCustom ? 'custom-theme-content' : ''}`}>
        {/* Step 1 & 2 Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* STEP 1: Upload Excel / CSV */}
          <div
            className={`custom-theme-card lg:col-span-5 rounded-2xl border p-5 shadow-xs flex flex-col justify-between transition-colors ${
              isDarkMode
                ? 'bg-[#111827]/90 border-slate-800/80'
                : 'bg-white border-slate-200/90'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className="w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center text-white shadow-2xs"
                    style={{ backgroundColor: effectivePalette.borderPalette[0] }}
                  >
                    1
                  </span>
                  <h2 className="text-sm font-bold tracking-tight">
                    Upload Spreadsheet (Excel or CSV)
                  </h2>
                </div>
                {fileName && (
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                      isDarkMode
                        ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    Loaded
                  </span>
                )}
              </div>

              {/* Upload Drop Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                  isDarkMode
                    ? 'border-slate-700 hover:border-indigo-400 bg-slate-900/40 hover:bg-indigo-950/20'
                    : 'border-indigo-200 hover:border-indigo-400 bg-indigo-50/30 hover:bg-indigo-50/60'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileUpload(f);
                  }}
                  className="hidden"
                />
                <Upload
                  className="w-7 h-7 mx-auto mb-2"
                  style={{ color: effectivePalette.borderPalette[0] }}
                />
                <div className="text-xs font-bold">
                  {isLoading ? 'Reading file...' : 'Click or drop .xlsx, .xls, or .csv'}
                </div>
                <div className={`text-[11px] mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Auto-detects headers, dates, and numeric measures
                </div>
                <div className={`text-[10px] mt-1 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Note: 1st row should have the headers
                </div>
              </div>

              {errorMsg && (
                <div className="mt-3 p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Sheet switcher if multiple */}
              {availableSheets.length > 1 && (
                <div className="mt-3 flex items-center gap-2 text-xs">
                  <span className={`font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Sheets:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {availableSheets.map((s) => (
                      <button
                        key={s}
                        onClick={() => handleSheetSwitch(s)}
                        className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-colors ${
                          activeSheet === s
                            ? 'bg-indigo-600 text-white'
                            : isDarkMode
                            ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* File Info Bar + Preview Toggle */}
            <div
              className={`mt-4 pt-3 border-t flex items-center justify-between text-xs ${
                isDarkMode ? 'border-slate-800/80 text-slate-400' : 'border-slate-100 text-slate-500'
              }`}
            >
              <div className="truncate max-w-[220px]">
                File: <strong className={isDarkMode ? 'text-slate-200' : 'text-slate-800'}>{fileName}</strong> ({rows.length} rows)
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowDataPreview(!showDataPreview)}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Table className="w-3.5 h-3.5" />
                  <span>{showDataPreview ? 'Hide Data' : 'View Data'}</span>
                  {showDataPreview ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
                <button
                  onClick={handleExportCsv}
                  title="Download CSV"
                  className={`p-1 rounded hover:bg-white/10 ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleReset}
                  title="Reset Excel sheet"
                  className={`px-2 py-1 rounded text-[11px] font-semibold border transition-colors cursor-pointer ${
                    isDarkMode
                      ? 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-200'
                      : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                  }`}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* STEP 2: Configure X-Axis & Y-Axes */}
          <div
            className={`custom-theme-card lg:col-span-7 rounded-2xl border p-5 shadow-xs flex flex-col justify-between transition-colors ${
              isDarkMode
                ? 'bg-[#111827]/90 border-slate-800/80'
                : 'bg-white border-slate-200/90'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className="w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center text-white shadow-2xs"
                    style={{ backgroundColor: effectivePalette.borderPalette[1] || effectivePalette.borderPalette[0] }}
                  >
                    2
                  </span>
                  <h2 className="text-sm font-bold tracking-tight">
                    Apply X-Axis, Y-Axis &amp; Secondary Y-Axis
                  </h2>
                </div>
                <div className={`text-[11px] font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>
                  Live Reactive Binding
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* X-Axis Selector */}
                <div
                  className={`p-3 rounded-xl border space-y-1.5 ${
                    isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    X-Axis (Category / Dimension)
                  </label>
                  <select
                    value={xAxisColumn}
                    onChange={(e) => setXAxisColumn(e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer border ${
                      isDarkMode
                        ? 'bg-slate-800 border-slate-700 text-slate-100'
                        : 'bg-white border-slate-300 text-slate-800'
                    }`}
                  >
                    {headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                  <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Horizontal label categories across all 18 charts.
                  </p>
                </div>

                {/* Secondary Y-Axis Selector */}
                <div
                  className={`p-3 rounded-xl border space-y-1.5 ${
                    isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>Secondary Y-Axis (Optional)</span>
                    <span
                      className="text-[9px] font-semibold px-1.5 py-0.2 rounded"
                      style={{
                        color: effectivePalette.borderPalette[1] || '#06b6d4',
                        backgroundColor: `${effectivePalette.borderPalette[1] || '#06b6d4'}20`
                      }}
                    >
                      Dual Axis
                    </span>
                  </label>
                  <select
                    value={secondaryYColumn}
                    onChange={(e) => setSecondaryYColumn(e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer border ${
                      isDarkMode
                        ? 'bg-slate-800 border-slate-700 text-slate-100'
                        : 'bg-white border-slate-300 text-slate-800'
                    }`}
                  >
                    <option value="">-- None (Single Axis) --</option>
                    {headers
                      .filter((h) => h !== xAxisColumn)
                      .map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                  </select>
                  <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Right Y1 axis for dual-scale combo and scatter metrics.
                  </p>
                </div>
              </div>

              {/* Primary Y-Axis Multi-Series Selection */}
              <div
                className={`mt-3 p-3 rounded-xl border space-y-2 ${
                  isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Primary Y-Axis Series ({primaryYColumns.length} Active)
                  </label>
                  <span className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Click pills to add/remove series
                  </span>
                </div>

                {/* Metric pill toggles */}
                <div className="flex flex-wrap gap-1.5">
                  {headers
                    .filter((h) => h !== xAxisColumn)
                    .map((header) => {
                      const isSelected = primaryYColumns.includes(header);
                      const isNumeric = detectedNumericHeaders.includes(header);

                      return (
                        <button
                          key={header}
                          onClick={() => handleTogglePrimaryY(header)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                            isSelected
                              ? 'text-white shadow-xs font-semibold'
                              : isDarkMode
                              ? 'bg-slate-800/90 border border-slate-700 text-slate-300 hover:bg-slate-700'
                              : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                          }`}
                          style={
                            isSelected
                              ? { backgroundColor: effectivePalette.borderPalette[0] }
                              : undefined
                          }
                        >
                          {isNumeric && <span className="font-mono text-[10px] font-bold">Σ</span>}
                          <span>{header}</span>
                          {isSelected && <span className="text-[10px] font-bold">&times;</span>}
                        </button>
                      );
                    })}
                </div>
              </div>
            </div>


          </div>
        </div>

        {/* Collapsible Data Preview Table */}
        {axesSelected && showDataPreview && (
          <div
            className={`custom-theme-card rounded-2xl border p-5 shadow-xs space-y-3 animate-in fade-in duration-150 ${
              isDarkMode
                ? 'bg-[#111827]/90 border-slate-800 text-slate-200'
                : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Table className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Data Table ({rows.length} Total Rows)
                </h3>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter rows..."
                  value={previewSearch}
                  onChange={(e) => {
                    setPreviewSearch(e.target.value);
                    setPreviewPage(1);
                  }}
                  className={`w-full pl-8 pr-3 py-1.5 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 border ${
                    isDarkMode
                      ? 'bg-slate-900 border-slate-700 text-slate-100'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>
            </div>

            <div
              className={`overflow-x-auto border rounded-xl ${
                isDarkMode ? 'border-slate-800' : 'border-slate-200'
              }`}
            >
              <table className="w-full text-left text-xs border-collapse">
                <thead
                  className={`font-semibold border-b ${
                    isDarkMode
                      ? 'bg-slate-900/80 border-slate-800 text-slate-300'
                      : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <tr>
                    <th className="py-2 px-3 w-10 text-center font-mono text-slate-500">#</th>
                    {headers.map((h) => {
                      const isX = h === xAxisColumn;
                      const isY = primaryYColumns.includes(h);
                      const isSecY = h === secondaryYColumn;

                      return (
                        <th key={h} className="py-2.5 px-3.5">
                          <div className="flex items-center gap-1.5">
                            <span>{h}</span>
                            {isX && (
                              <span className="text-[9px] bg-indigo-500/20 text-indigo-400 px-1 rounded font-bold">X</span>
                            )}
                            {isY && (
                              <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1 rounded font-bold">Y</span>
                            )}
                            {isSecY && (
                              <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1 rounded font-bold">Y2</span>
                            )}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800/80' : 'divide-slate-100'}`}>
                  {paginatedPreviewRows.map((row, idx) => (
                    <tr
                      key={idx}
                      className={isDarkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}
                    >
                      <td className="py-2 px-3 text-center text-slate-500 font-mono text-[11px]">
                        {(previewPage - 1) * pageSize + idx + 1}
                      </td>
                      {headers.map((h) => (
                        <td key={h} className="py-2 px-3.5 font-mono">
                          {row[h] !== undefined && row[h] !== null ? String(row[h]) : '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPreviewPages > 1 && (
              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span>
                  Page {previewPage} of {totalPreviewPages}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setPreviewPage((p) => Math.max(1, p - 1))}
                    disabled={previewPage === 1}
                    className={`px-2.5 py-1 rounded border disabled:opacity-30 ${
                      isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200'
                    }`}
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => setPreviewPage((p) => Math.min(totalPreviewPages, p + 1))}
                    disabled={previewPage === totalPreviewPages}
                    className={`px-2.5 py-1 rounded border disabled:opacity-30 ${
                      isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {axesSelected && (
        <>
        {/* KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div
            className={`custom-theme-card p-4 rounded-2xl border shadow-2xs transition-colors ${
              isDarkMode ? 'bg-[#111827]/90 border-slate-800/80' : 'bg-white border-slate-200'
            }`}
          >
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total {primaryMetric}
            </div>
            <div
              className="text-2xl font-black font-mono tracking-tight mt-1"
              style={{ color: effectivePalette.borderPalette[0] }}
            >
              {totalPrimary.toLocaleString()}
            </div>
            <div className={`text-[11px] mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Across {rows.length} categories
            </div>
          </div>

          <div
            className={`custom-theme-card p-4 rounded-2xl border shadow-2xs transition-colors ${
              isDarkMode ? 'bg-[#111827]/90 border-slate-800/80' : 'bg-white border-slate-200'
            }`}
          >
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Average per {xAxisColumn}
            </div>
            <div
              className="text-2xl font-black font-mono tracking-tight mt-1"
              style={{ color: effectivePalette.borderPalette[1] || effectivePalette.borderPalette[0] }}
            >
              {avgPrimary.toFixed(1)}
            </div>
            <div className={`text-[11px] mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Mean value baseline
            </div>
          </div>

          <div
            className={`custom-theme-card p-4 rounded-2xl border shadow-2xs transition-colors ${
              isDarkMode ? 'bg-[#111827]/90 border-slate-800/80' : 'bg-white border-slate-200'
            }`}
          >
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Peak: {peakCategory}
            </div>
            <div
              className="text-2xl font-black font-mono tracking-tight mt-1"
              style={{ color: effectivePalette.borderPalette[2] || effectivePalette.borderPalette[0] }}
            >
              {peakVal.toLocaleString()}
            </div>
            <div className={`text-[11px] mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Maximum recorded entry
            </div>
          </div>

          <div
            className={`custom-theme-card p-4 rounded-2xl border shadow-2xs transition-colors ${
              isDarkMode ? 'bg-[#111827]/90 border-slate-800/80' : 'bg-white border-slate-200'
            }`}
          >
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Axis Configuration
            </div>
            <div className="text-xs font-bold mt-1 truncate">
              X: <span className="font-mono">{xAxisColumn}</span>
            </div>
            <div className="text-[11px] font-medium truncate mt-0.5" style={{ color: effectivePalette.borderPalette[0] }}>
              Y: <span className="font-mono">{primaryYColumns.join(', ')}</span>
            </div>
          </div>
        </div>
        </>
        )}

        {axesSelected && (
        <div className="space-y-4">
        {/* Data Filter Card */}
        <div
          className={`custom-theme-card rounded-2xl border p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
            isDarkMode
              ? 'bg-[#111827]/90 border-slate-800/80'
              : 'bg-white border-slate-200/90'
          }`}
        >
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Filter Chart Data
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <select
              value={filterColumn}
              onChange={(e) => setFilterColumn(e.target.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                isDarkMode
                  ? 'bg-slate-800 border-slate-700 text-slate-100'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <option value="">-- Select Column --</option>
              {headers.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter value..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className={`pl-8 pr-3 py-1.5 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 border w-40 ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-slate-100'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              />
            </div>
            {filterText && filterColumn && (
              <button
                onClick={() => {
                  setFilterText('');
                  setFilterColumn('');
                }}
                className="px-2 py-1 text-xs font-semibold text-rose-500 hover:text-rose-700 rounded-lg border border-rose-200 hover:bg-rose-50"
              >
                Clear
              </button>
            )}
          </div>
          {filterText && filterColumn && (
            <div className="text-[10px] text-emerald-600 font-semibold">
              Showing {filteredChartRows.length} of {rows.length} rows
            </div>
          )}
        </div>

        {/* STEP 3: Generated Charts Section */}
          {/* Chart Filter & Modern Theme Palettes Bar */}
          <div
            className={`custom-theme-card p-3.5 sm:p-4 rounded-2xl border shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors ${
              isDarkMode ? 'bg-[#111827]/90 border-slate-800/80' : 'bg-white border-slate-200'
            }`}
          >
            {/* Chart selector dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">Chart:</span>
              <select
                value={selectedChart}
                onChange={(e) => setSelectedChart(e.target.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-slate-100'
                    : 'bg-white border-slate-300 text-slate-800'
                }`}
              >
                <option value="">-- Select a chart --</option>
                <option value="all">All Charts</option>
                {CHART_DEFINITIONS.map((def) => (
                  <option key={def.id} value={def.id}>
                    {def.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Modern Palette Selector */}
            <div className="flex items-center gap-2.5 shrink-0 overflow-x-auto">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" />
                Palette:
              </span>
              <div className="flex items-center gap-1.5">
                {COLOR_THEMES.map((th) => {
                  const isSelected = !isUsingCustom && activeTheme.id === th.id;
                  return (
                    <button
                      key={th.id}
                      onClick={() => { setActiveTheme(th); setIsUsingCustom(false); saveCustomTheme(window.localStorage, { theme: customTheme, chartOverrides, enabled: false }); }}
                      title={th.name}
                      className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? isDarkMode
                            ? 'bg-slate-800 border-white/40 ring-2 ring-indigo-500/30'
                            : 'bg-slate-50 border-indigo-600 ring-2 ring-indigo-200'
                          : isDarkMode
                          ? 'border-slate-800 hover:border-slate-700 bg-slate-900/50'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex gap-0.5">
                        {th.borderPalette.slice(0, 3).map((c, i) => (
                          <span
                            key={i}
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                      <span className={`text-[11px] font-medium hidden sm:inline ${isSelected ? 'font-bold' : ''}`}>
                        {th.name.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {visibleCharts.map((chart) => (
              <ChartCard
                key={chart.id}
                definition={chart}
                labels={filteredLabels}
                rows={filteredChartRows}
                labelColumn={xAxisColumn}
                valueColumns={primaryYColumns}
                secondaryYColumn={secondaryYColumn}
                theme={effectivePalette}
                chartStyle={getChartStyle(chart.id)}
                onCustomizeChart={openThemeEditor}
                isDark={isDarkMode}
                onMaximize={(def) => setMaximizedDef(def)}
              />
            ))}
          </div>
        </div>
        )}
      </main>

      {/* Footer */}
      <footer className={`border-t py-6 text-center text-xs text-white ${isUsingCustom ? 'custom-theme-footer' : 'border-emerald-700 bg-emerald-600'}`} style={isUsingCustom ? { backgroundColor: customTheme.app.headerBackground, borderColor: customTheme.app.borderColor, fontFamily: customTheme.app.fontFamily } : undefined}>
        <p>
          Dashboard Creator &bull;{' '}
          <a
            href="https://github.com/palashsuryavanshi/dashboard_creator"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold hover:underline text-white"
          >
            palashsuryavanshi/dashboard_creator
          </a>
        </p>
      </footer>

      {showThemeEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowThemeEditor(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="theme-editor-title" className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6" style={{ color: editingTheme.app.textColor, backgroundColor: editingTheme.app.cardBackground, borderColor: editingTheme.app.borderColor, fontFamily: editingTheme.app.fontFamily, borderRadius: editingTheme.app.cardRadius }}>
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 id="theme-editor-title" className="text-lg font-bold">{editingChart ? `Customize ${CHART_DEFINITIONS.find((item) => item.id === editingChart)?.title ?? 'chart'}` : 'Customize dashboard theme'}</h2>
                <p className="mt-1 text-xs text-slate-500">Changes are saved when you apply them.</p>
              </div>
              <button type="button" aria-label="Close theme editor" onClick={() => setShowThemeEditor(false)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X className="h-4 w-4" /></button>
            </div>
            {!editingChart ? (
              <div className="space-y-6">
                <fieldset className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <legend className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Website and dashboard</legend>
                  {([
                    ['Page background', 'pageBackground'], ['Header background', 'headerBackground'], ['Card background', 'cardBackground'], ['Text', 'textColor'], ['Muted text', 'mutedTextColor'], ['Borders', 'borderColor'], ['Accent', 'accentColor'],
                  ] as const).map(([label, key]) => (
                    <label key={key} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3 text-xs font-medium">
                      {label}<input aria-label={label} type="color" value={editingTheme.app[key]} onChange={(event) => updateEditingApp(key, event.target.value)} className="h-8 w-10 cursor-pointer rounded border-0 bg-transparent" />
                    </label>
                  ))}
                  <label className="text-xs font-medium">Font family<input aria-label="Font family" value={editingTheme.app.fontFamily} onChange={(event) => updateEditingApp('fontFamily', event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5" /></label>
                  <label className="text-xs font-medium">Base font size<input aria-label="Base font size" type="number" min="10" max="24" value={editingTheme.app.baseFontSize} onChange={(event) => updateEditingApp('baseFontSize', Math.min(24, Math.max(10, Number(event.target.value))))} className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5" /></label>
                  <label className="text-xs font-medium">Card corner radius<input aria-label="Card corner radius" type="range" min="0" max="32" value={editingTheme.app.cardRadius} onChange={(event) => updateEditingApp('cardRadius', Number(event.target.value))} className="mt-2 w-full" /><span className="text-slate-500">{editingTheme.app.cardRadius}px</span></label>
                </fieldset>
                <fieldset className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <legend className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Charts, axes, labels and tooltips</legend>
                  {([
                    ['Chart background', 'chartBackground'], ['Grid', 'gridColor'], ['Axis labels', 'tickColor'], ['Legend', 'legendColor'], ['Tooltip background', 'tooltipBackground'], ['Tooltip text', 'tooltipTextColor'], ['Tooltip border', 'tooltipBorderColor'], ['Data labels', 'dataLabelColor'],
                  ] as const).map(([label, key]) => (
                    <label key={key} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3 text-xs font-medium">
                      {label}<input aria-label={label} type="color" value={editingTheme.charts[key]} onChange={(event) => updateEditingCharts(key, event.target.value)} className="h-8 w-10 cursor-pointer rounded border-0 bg-transparent" />
                    </label>
                  ))}
                  <label className="text-xs font-medium">Chart series palette (comma-separated hex colors)<input aria-label="Chart series palette" value={editingTheme.charts.colors.join(', ')} onChange={(event) => { const colors = event.target.value.split(',').map((value) => value.trim()).filter((value) => /^#[0-9a-f]{6}$/i.test(value)); if (colors.length) updateEditingCharts('colors', colors.slice(0, 12)); }} className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5" /></label>
                  <label className="text-xs font-medium">Data label size<input aria-label="Data label size" type="number" min="8" max="24" value={editingTheme.charts.dataLabelFontSize} onChange={(event) => updateEditingCharts('dataLabelFontSize', Math.min(24, Math.max(8, Number(event.target.value))))} className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5" /></label>
                  <label className="text-xs font-medium">Line width<input aria-label="Line width" type="range" min="1" max="8" value={editingTheme.charts.lineWidth} onChange={(event) => updateEditingCharts('lineWidth', Number(event.target.value))} className="mt-2 w-full" /><span className="text-slate-500">{editingTheme.charts.lineWidth}px</span></label>
                  <label className="text-xs font-medium">Point radius<input aria-label="Point radius" type="range" min="0" max="12" value={editingTheme.charts.pointRadius} onChange={(event) => updateEditingCharts('pointRadius', Number(event.target.value))} className="mt-2 w-full" /><span className="text-slate-500">{editingTheme.charts.pointRadius}px</span></label>
                </fieldset>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {(['colors', 'chartBackground', 'gridColor', 'tickColor', 'legendColor', 'tooltipBackground', 'tooltipTextColor', 'tooltipBorderColor', 'dataLabelColor'] as const).map((key) => (
                  <label key={key} className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 p-3 text-xs font-medium">{key.replace(/([A-Z])/g, ' $1')}<input aria-label={key} type="color" value={key === 'colors' ? editingChartStyle.colors[0] : editingChartStyle[key]} onChange={(event) => setEditingChartStyle((previous) => ({ ...previous, [key]: key === 'colors' ? [event.target.value, ...previous.colors.slice(1)] : event.target.value }))} className="h-8 w-10 cursor-pointer rounded border-0 bg-transparent" /></label>
                ))}
                <label className="text-xs font-medium">Data label size<input aria-label="Chart data label size" type="number" min="8" max="24" value={editingChartStyle.dataLabelFontSize} onChange={(event) => setEditingChartStyle((previous) => ({ ...previous, dataLabelFontSize: Math.min(24, Math.max(8, Number(event.target.value))) }))} className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5" /></label>
                <label className="text-xs font-medium">Line width<input aria-label="Chart line width" type="range" min="1" max="8" value={editingChartStyle.lineWidth} onChange={(event) => setEditingChartStyle((previous) => ({ ...previous, lineWidth: Number(event.target.value) }))} className="mt-2 w-full" /></label>
                <label className="text-xs font-medium">Point radius<input aria-label="Chart point radius" type="range" min="0" max="12" value={editingChartStyle.pointRadius} onChange={(event) => setEditingChartStyle((previous) => ({ ...previous, pointRadius: Number(event.target.value) }))} className="mt-2 w-full" /></label>
                <button type="button" onClick={() => setEditingChartStyle(baseChartStyle)} className="self-center text-xs font-semibold text-rose-600 hover:underline">Reset this chart to global theme</button>
              </div>
            )}
            <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
              {!editingChart && <button type="button" onClick={() => { setEditingTheme(DEFAULT_CUSTOM_THEME); setEditingUseCustom(true); setEditingOverrides({}); }} className="mr-auto inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"><RotateCcw className="h-3.5 w-3.5" />Reset theme</button>}
              {!editingChart && <button type="button" onClick={() => setEditingUseCustom(false)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">Use preset palette</button>}
              <button type="button" onClick={() => setShowThemeEditor(false)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button type="button" onClick={applyThemeEditor} className="rounded-lg px-4 py-2 text-xs font-bold text-white" style={{ backgroundColor: editingTheme.app.accentColor }}>Apply changes</button>
            </div>
          </section>
        </div>
      )}

      {/* Chart Maximize Modal */}
      {maximizedDef && (
        <ChartModal
          definition={maximizedDef}
          onClose={() => setMaximizedDef(null)}
          labels={labels}
          rows={rows}
          labelColumn={xAxisColumn}
          valueColumns={primaryYColumns}
          secondaryYColumn={secondaryYColumn}
          theme={effectivePalette}
          chartStyle={getChartStyle(maximizedDef.id)}
          isDark={isDarkMode}
        />
      )}
    </div>
  );
}
