import React, { useState, useRef } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import {
  Upload,
  FileSpreadsheet,
  Download,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  X,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { ExcelColumnMapping, ExcelImportResult } from '../../types/dashboard';

interface ExcelReaderProps {
  currentDatasetName: string;
  onImport: (result: ExcelImportResult) => void;
  onOpenMapping: () => void;
}

export const ExcelReader: React.FC<ExcelReaderProps> = ({
  currentDatasetName,
  onImport,
  onOpenMapping
}) => {
  const [fileName, setFileName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeSheet, setActiveSheet] = useState<string>('');
  const [availableSheets, setAvailableSheets] = useState<string[]>([]);
  const [cachedWorkbook, setCachedWorkbook] = useState<ExcelJS.Workbook | null>(null);

  // Preview table state
  const [previewRows, setPreviewRows] = useState<Record<string, any>[]>([]);
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortCol, setSortCol] = useState<string>('');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 5;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processWorksheet = (worksheet: ExcelJS.Worksheet, name: string) => {
    const headers: string[] = [];
    const rows: Record<string, any>[] = [];

    // Header extraction
    worksheet.getRow(1).eachCell({ includeEmpty: false }, (cell, colNumber) => {
      const headerVal = cell.text || (cell.value ? String(cell.value) : `Column ${colNumber}`);
      headers.push(headerVal.trim());
    });

    if (headers.length === 0) {
      throw new Error('No column headers detected in row 1 of the sheet.');
    }

    // Rows extraction
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return; // skip header
      const rowData: Record<string, any> = {};
      let hasData = false;

      headers.forEach((header, idx) => {
        const cell = row.getCell(idx + 1);
        let cellVal: any = cell.value;

        // Handle rich text or formula objects from ExcelJS
        if (cellVal && typeof cellVal === 'object') {
          if ('result' in cellVal) {
            cellVal = cellVal.result;
          } else if ('text' in cellVal) {
            cellVal = cellVal.text;
          }
        }

        if (cellVal !== null && cellVal !== undefined && cellVal !== '') {
          hasData = true;
          // check if numeric
          const str = String(cellVal).trim();
          const cleanNum = Number(str.replace(/[^0-9.-]/g, ''));
          if (!isNaN(cleanNum) && str !== '') {
            rowData[header] = cleanNum;
          } else {
            rowData[header] = str;
          }
        } else {
          rowData[header] = '';
        }
      });

      if (hasData) {
        rows.push(rowData);
      }
    });

    if (rows.length === 0) {
      throw new Error('No data rows found in this sheet.');
    }

    // Automatically detect candidate label column (first string-heavy column)
    // and candidate value columns (numeric columns)
    let detectedLabelCol = headers[0];
    const detectedValueCols: string[] = [];

    headers.forEach((h) => {
      const isNum = rows.some((r) => typeof r[h] === 'number');
      if (isNum) {
        detectedValueCols.push(h);
      } else if (detectedLabelCol === headers[0]) {
        detectedLabelCol = h;
      }
    });

    // If no numeric column detected, fallback to remaining columns
    const finalValueCols = detectedValueCols.length > 0
      ? detectedValueCols
      : headers.filter((h) => h !== detectedLabelCol);

    const initialMappings: ExcelColumnMapping[] = finalValueCols.map((colName, idx) => ({
      columnName: colName,
      chartLabel: colName,
      datasetIndex: idx
    }));

    setPreviewHeaders(headers);
    setPreviewRows(rows);
    setCurrentPage(1);

    onImport({
      success: true,
      fileName: name,
      sheetNames: availableSheets,
      selectedSheet: worksheet.name,
      headers,
      rows,
      labelColumn: detectedLabelCol,
      valueColumns: finalValueCols,
      mappings: initialMappings
    });
  };

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setErrorMsg(null);
    setFileName(file.name);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = new ExcelJS.Workbook();

      if (file.name.endsWith('.csv')) {
        const text = new TextDecoder().decode(buffer);
        // Simple CSV parser into worksheet
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 2) throw new Error('CSV file has insufficient rows.');
        const sheet = workbook.addWorksheet('Sheet1');
        lines.forEach((line, lineIdx) => {
          // split commas, handling quotes simply
          const cells = line.split(',').map((c) => c.replace(/^["']|["']$/g, '').trim());
          sheet.addRow(cells);
        });
        setCachedWorkbook(workbook);
        setAvailableSheets(['Sheet1']);
        setActiveSheet('Sheet1');
        processWorksheet(sheet, file.name);
      } else {
        await workbook.xlsx.load(buffer);
        const sheets = workbook.worksheets.map((ws) => ws.name);
        if (sheets.length === 0) throw new Error('No worksheets found in this Excel workbook.');
        setCachedWorkbook(workbook);
        setAvailableSheets(sheets);
        const firstSheet = workbook.worksheets[0];
        setActiveSheet(firstSheet.name);
        processWorksheet(firstSheet, file.name);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to read spreadsheet file. Please check file formatting.');
      onImport({
        success: false,
        fileName: file.name,
        headers: [],
        rows: [],
        labelColumn: '',
        valueColumns: [],
        mappings: [],
        error: err.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSheetChange = (sheetName: string) => {
    if (!cachedWorkbook) return;
    const ws = cachedWorkbook.getWorksheet(sheetName);
    if (!ws) return;
    setActiveSheet(sheetName);
    try {
      processWorksheet(ws, fileName);
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const downloadSampleTemplate = async () => {
    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet('Sales Data');

    ws.columns = [
      { header: 'Period', key: 'Period', width: 14 },
      { header: 'Gross Revenue', key: 'Revenue', width: 18 },
      { header: 'Operational Cost', key: 'Cost', width: 18 },
      { header: 'Target Goal', key: 'Target', width: 16 }
    ];

    ws.addRows([
      { Period: 'Q1 2024', Revenue: 45000, Cost: 28000, Target: 40000 },
      { Period: 'Q2 2024', Revenue: 58000, Cost: 32000, Target: 50000 },
      { Period: 'Q3 2024', Revenue: 64000, Cost: 35000, Target: 60000 },
      { Period: 'Q4 2024', Revenue: 79000, Cost: 41000, Target: 70000 }
    ]);

    const buf = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'dashboard-sample-template.xlsx');
  };

  const exportCurrentCsv = () => {
    if (previewRows.length === 0 || previewHeaders.length === 0) return;
    const csvContent = [
      previewHeaders.join(','),
      ...previewRows.map((row) =>
        previewHeaders.map((h) => {
          const val = row[h] !== undefined ? String(row[h]) : '';
          return val.includes(',') ? `"${val}"` : val;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${(fileName || currentDatasetName).replace(/[^a-zA-Z0-9_-]/g, '_')}.csv`);
  };

  // Filtered and sorted rows for preview
  const filteredRows = previewRows.filter((r) => {
    if (!searchQuery) return true;
    return Object.values(r).some((val) =>
      String(val).toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const sortedRows = [...filteredRows].sort((a, b) => {
    if (!sortCol) return 0;
    const aVal = a[sortCol];
    const bVal = b[sortCol];
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortAsc ? aVal - bVal : bVal - aVal;
    }
    return sortAsc
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });

  const totalPages = Math.ceil(sortedRows.length / pageSize) || 1;
  const paginatedRows = sortedRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden mb-6">
      {/* Top Banner / Upload Zone */}
      <div className="p-5 md:p-6 bg-gradient-to-r from-slate-50 via-white to-indigo-50/30 border-b border-slate-100">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
                <FileSpreadsheet className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold text-slate-800">
                Excel & CSV Data Import
              </h2>
              {fileName && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {fileName}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Upload spreadsheets (.xlsx, .xls, .csv) with automatic header detection and live chart binding.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
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

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors cursor-pointer"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {isLoading ? 'Processing...' : 'Upload Excel / CSV'}
            </button>

            <button
              onClick={onOpenMapping}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
              Column Mapping
            </button>

            <button
              onClick={downloadSampleTemplate}
              title="Download empty ready-to-fill Excel template"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              Template .xlsx
            </button>

            {previewRows.length > 0 && (
              <button
                onClick={exportCurrentCsv}
                title="Download current data view as CSV"
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                Export CSV
              </button>
            )}
          </div>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <div className="flex-1 font-medium">{errorMsg}</div>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-rose-500 hover:text-rose-800"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Multiple sheets selector */}
        {availableSheets.length > 1 && (
          <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-600">Select Sheet:</span>
            <div className="flex gap-1.5 flex-wrap">
              {availableSheets.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSheetChange(s)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    activeSheet === s
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Data Preview Table */}
      {previewHeaders.length > 0 && (
        <div className="p-4 md:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Live Data Preview
              </span>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono">
                {previewRows.length} rows &bull; {previewHeaders.length} cols
              </span>
            </div>

            {/* Table Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search values in data..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-semibold">
                  <th className="py-2 px-3 w-10 text-center text-slate-400 font-mono">#</th>
                  {previewHeaders.map((header) => (
                    <th
                      key={header}
                      onClick={() => {
                        if (sortCol === header) {
                          setSortAsc(!sortAsc);
                        } else {
                          setSortCol(header);
                          setSortAsc(true);
                        }
                      }}
                      className="py-2.5 px-3.5 cursor-pointer hover:bg-slate-200/70 select-none transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{header}</span>
                        {sortCol === header && (
                          <span className="text-indigo-600 font-bold">
                            {sortAsc ? '▲' : '▼'}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {paginatedRows.length > 0 ? (
                  paginatedRows.map((row, idx) => {
                    const rowNum = (currentPage - 1) * pageSize + idx + 1;
                    return (
                      <tr key={idx} className="hover:bg-indigo-50/30 transition-colors">
                        <td className="py-2 px-3 text-center text-slate-400 font-mono text-[11px]">
                          {rowNum}
                        </td>
                        {previewHeaders.map((h) => {
                          const val = row[h];
                          const isNumber = typeof val === 'number';
                          return (
                            <td
                              key={h}
                              className={`py-2 px-3.5 text-slate-700 ${
                                isNumber ? 'font-mono text-slate-900' : ''
                              }`}
                            >
                              {val !== undefined && val !== null ? String(val) : '—'}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={previewHeaders.length + 1}
                      className="py-6 text-center text-slate-400"
                    >
                      No records matched search query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
              <div>
                Showing {(currentPage - 1) * pageSize + 1} to{' '}
                {Math.min(currentPage * pageSize, sortedRows.length)} of {sortedRows.length} rows
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2 font-medium text-slate-700">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExcelReader;
