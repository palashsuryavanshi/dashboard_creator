import React, { useState, useRef, useEffect } from 'react'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

interface ExcelRow {
  [key: string]: any
}

export interface ExcelImportResult {
  success: boolean
  headers: string[]
  rows: ExcelRow[]
  error?: string
  onImport?: (result: ExcelImportResult) => void
}

export const ExcelReader = ({ onImport }: { onImport?: (result: ExcelImportResult) => void }) => {
  const [fileName, setFileName] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [importResult, setImportResult] = useState<ExcelImportResult | null>(null)
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
        const rows: ExcelRow[] = []

        // Get headers from first row
        worksheet.getRow(1).eachCell((cell, colNumber) => {
          headers.push(cell.value ? cell.value.toString() : `Column ${colNumber}`)
        })

        // Get data from subsequent rows
        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber === 1) return // Skip header row

          const rowData: ExcelRow = {}
          row.eachCell((cell, colNumber) => {
            rowData[headers[colNumber - 1] || `Column ${colNumber}`] =
              cell.value !== null && cell.value !== undefined
                ? cell.value.toString()
                : ''
          })
          rows.push(rowData)
        })

        const result: ExcelImportResult = {
          success: true,
          headers,
          rows,
        }

        setImportResult(result)
        setIsLoading(false)
        onImport && onImport(result)
      } catch (error) {
        console.error('Error reading Excel file:', error)
        const errorResult: ExcelImportResult = {
          success: false,
          headers: [],
          rows: [],
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
    setShowError(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
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

              <div className="sample-data">
                <h3>Sample Data</h3>
                <table>
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