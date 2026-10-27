import React, { useState, useRef, useEffect } from 'react'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

export interface ExcelColumnMapping {
  columnName: string
  chartLabel: string
  chartType?: 'bar' | 'column' | 'line' | 'area' | 'pie' | 'doughnut' | 'funnel' | 'scatter'
  datasetIndex?: number
}

export interface ExcelImportResult {
  success: boolean
  headers: string[]
  rows: any[]
  mappings: ExcelColumnMapping[]
  error?: string
}

export const ExcelReader = ({ onImport }: { onImport?: (result: ExcelImportResult) => void }) => {
  const [fileName, setFileName] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [importResult, setImportResult] = useState<ExcelImportResult | null>(null)
  const [showMappings, setShowMappings] = useState<boolean>(false)
  const [showError, setShowError] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setIsLoading(true)
    setImportResult(null)
    setShowError(false)

    const reader = new FileReader()
    reader.onload = async (e) => {
      if (!e.target?.result) return
      try {
        const buffer = e.target.result as ArrayBuffer
        const workbook = new ExcelJS.Workbook()
        await workbook.load(buffer)

        const worksheet = workbook.getWorksheet(1)
        if (!worksheet) {
          throw new Error('No worksheets found in the Excel file')
        }

        const headers: string[] = []
        const rows: any[] = []

        // Get headers from first row
        worksheet.getRow(1).eachCell((cell, colNumber) => {
          headers.push(cell.value ? cell.value.toString() : `Column ${colNumber}`)
        })

        // Get data from subsequent rows
        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber === 1) return // Skip header row

          const rowData: any = {}
          row.eachCell((cell, colNumber) => {
            rowData[headers[colNumber - 1] || `Column ${colNumber}`] =
              cell.value !== null && cell.value !== undefined
                ? cell.value.toString()
                : ''
          })
          rows.push(rowData)
        })

        // Initialize default mappings - map first 2 columns to datasets
        const defaultMappings: ExcelColumnMapping[] = headers.map((header, index) => ({
          columnName: header,
          chartLabel: header,
          chartType: index < 2 ? 'bar' : undefined,
          datasetIndex: index < 2 ? index : undefined,
        }))

        const result: ExcelImportResult = {
          success: true,
          headers,
          rows,
          mappings: defaultMappings,
        }

        setImportResult(result)
        setIsLoading(false)
        setShowMappings(true)
        onImport && onImport(result)
      } catch (error) {
        console.error('Error reading Excel file:', error)
        const errorResult: ExcelImportResult = {
          success: false,
          headers: [],
          rows: [],
          mappings: [],
          error: error instanceof Error ? error.message : 'Failed to read Excel file',
        }
        setImportResult(errorResult)
        setShowError(true)
        setIsLoading(false)
        onImport && onImport(errorResult)
      }
    }

    reader.onerror = (error) => {
      console.error('FileReader error:', error)
      const errorResult: ExcelImportResult = {
        success: false,
        headers: [],
        rows: [],
        mappings: [],
        error: 'Failed to read the file',
      }
      setImportResult(errorResult)
      setShowError(true)
      setIsLoading(false)
      onImport && onImport(errorResult)
    }

    reader.readAsArrayBuffer(file)
  }

  const clearFile = () => {
    setFileName('')
    setIsLoading(false)
    setImportResult(null)
    setShowMappings(false)
    setShowError(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const confirmMappings = (mappings: ExcelColumnMapping[]) => {
    setShowMappings(false)
    onImport && onImport({
      success: importResult?.success || false,
      headers: importResult?.headers || [],
      rows: importResult?.rows || [],
      mappings,
    })
  }

  return (
    <div className="excel-reader">
      <div className="excel-reader-header">
        <h2>📊 Excel Import</h2>
        <p>Upload an Excel file to get data for charts</p>
      </div>

      <div className="excel-upload-area">
        <input
          type="file"
          accept=".xlsx,.xls"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="file-input"
        />
        <button className="upload-button" onClick={() => fileInputRef.current?.click()}>
          {fileName ? `${fileName.split('.')[0]} selected` : 'Browse Excel file'}
        </button>
      </div>

      {isLoading && <p className="loading">Reading Excel file...</p>}

      {importResult && !isLoading && (
        <div className="import-result">
          {importResult.success ? (
            <div className="result-success">
              <p>✅ Successfully imported <strong>{importResult.rows.length}</strong> rows</p>
              <p><strong>Columns:</strong> {importResult.headers.join(', ')}</p>

              {/* Mapping Configuration */}
              {showMappings && importResult.mappings.length > 0 && (
                <div className="mapping-config">
                  <h3>📋 Column Mapping</h3>
                  <p>Map Excel columns to chart datasets:</p>
                  <div className="mapping-grid">
                    {importResult.mappings.map((mapping, index) => (
                      <div key={index} className="mapping-item">
                        <select
                          className="mapping-select"
                          defaultValue={mapping.columnName}
                        >
                          <option value="">-- Select Column --</option>
                          {importResult.headers.map((header) => (
                            <option key={header} value={header}>
                              {header}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          className="mapping-label"
                          defaultValue={mapping.chartLabel}
                          placeholder="Label"
                        />
                        <select
                          className="mapping-chart-type"
                          defaultValue={mapping.chartType || 'bar'}
                        >
                          <option value="bar">Bar</option>
                          <option value="column">Column</option>
                          <option value="line">Line</option>
                          <option value="area">Area</option>
                          <option value="pie">Pie</option>
                          <option value="doughnut">Doughnut</option>
                        </select>
                        <input
                          type="number"
                          className="mapping-dataset-index"
                          defaultValue={mapping.datasetIndex !== undefined ? String(mapping.datasetIndex) : ''}
                          placeholder="Dataset #"
                        />
                        <button
                          className="remove-mapping-btn"
                          onClick={() => {
                            // Logic to remove mapping
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mapping-actions">
                    <button className="cancel-mapping-btn" onClick={clearFile}>
                      Cancel
                    </button>
                    <button className="confirm-mapping-btn" onClick={() => confirmMappings(importResult.mappings)}>
                      Apply Mapping
                    </button>
                  </div>
                </div>
              )}

              <div className="sample-data">
                <h3>Sample Data</h3>
                <table className="sample-table">
                  <thead>
                    <tr>
                      {importResult.headers.map((header) => (
                        <th key={header}>{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {importResult.rows.slice(0, 5).map((row, index) => (
                      <tr key={index}>
                        {importResult.headers.map((header) => (
                          <td key={header}>{row[header] || ''}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                className="export-button"
                onClick={() => {
                  const csvRows = importResult.rows.map((row) =>
                    importResult.headers.map((header) => row[header] || '').join(',')
                  )
                  const csvContent = [
                    importResult.headers.join(','),
                    ...csvRows,
                  ].join('\n')
                  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
                  saveAs(blob, 'dashboard-data.csv')
                }}
              >
                Download as CSV
              </button>
            </div>
          ) : (
            <div className="result-error">
              <p>❌ {importResult.error}</p>
              <button className="retry-button" onClick={clearFile}>
                Try Again
              </button>
            </div>
          )}
        </div>
      )}

      {showError && importResult?.error && (
        <div className="error-summary">
          <p>⚠️ {importResult.error}</p>
        </div>
      )}
    </div>
  )
}

export default ExcelReader