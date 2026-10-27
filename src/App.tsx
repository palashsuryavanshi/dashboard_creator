import React, { useState } from 'react'
import './App.css'
import ExcelReader from './components/ExcelReader/ExcelReader'

type ChartType =
  | 'bar'
  | 'bar-stack'
  | 'bar-cluster'
  | 'column'
  | 'column-stack'
  | 'column-cluster'
  | 'line'
  | 'area'
  | 'area-stack'
  | 'area-100-stack'
  | 'combo'
  | 'combo-variant'
  | 'funnel'
  | 'scatter'
  | 'pie'
  | 'doughnut'

interface ChartConfig {
  type: ChartType
  data: any
  options: any
}

interface ExcelColumnMapping {
  columnName: string
  chartLabel: string
  chartType: ChartType
  datasetIndex: number
}

interface ExcelImportResult {
  success: boolean
  headers: string[]
  rows: any[]
  mappings: ExcelColumnMapping[]
  error?: string
}

const useChartData = (
  type: ChartType,
  headers: string[],
  rows: any[],
  mappings: ExcelColumnMapping[]
) => {
  // Find mappings for this chart type and dataset index
  const relevantMappings = mappings.filter(
    (m) => m.chartType === type
  )

  // Get dataset data from Excel rows based on column mapping
  const getDatasetData = (columnName: string, defaultData: number[]) => {
    const columnMapping = relevantMappings.find((m) => m.columnName === columnName)
    if (!columnMapping) return defaultData

    // Extract data from the specified column across all rows
    const columnData: number[] = rows
      .map((row) => {
        const value = row[columnName]
        const num = typeof value === 'number' ? value : parseFloat(value)
        return isNaN(num) ? 0 : num
      })
      .slice(0, 7) // Limit to 7 data points (Jan-Jul)

    // Pad or truncate to match default length
    while (columnData.length < defaultData.length) {
      columnData.push(0)
    }
    return columnData.slice(0, defaultData.length)
  }

  const baseData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: []
  }

  // Generate datasets based on mappings
  const generateDatasets = (): any[] => {
    const datasets: any[] = []
    const usedColumns = new Set<string>()

    // Add datasets from mappings
    relevantMappings.forEach((mapping, mappingIndex) => {
      if (usedColumns.has(mapping.columnName)) return

      const columnData = getDatasetData(mapping.columnName, [65, 59, 80, 81, 55, 40, 37])

      // Determine color based on dataset index
      const colors = [
        'rgba(75, 192, 192, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 99, 132, 0.2)',
        'rgba(53, 162, 235, 0.2)',
        'rgba(255, 159, 64, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(153, 102, 255, 0.2)',
      ]

      const color = colors[mapping.datasetIndex % colors.length] || 'rgba(75, 192, 192, 0.2)'
      const borderColor = colors[mapping.datasetIndex % colors.length + 1] || 'rgba(153, 102, 255, 1)'

      let dataset: any

      switch (mapping.chartType) {
        case 'bar':
          dataset = {
            label: mapping.chartLabel || headers[mapping.datasetIndex] || `Dataset ${mapping.datasetIndex + 1}`,
            backgroundColor: color,
            borderColor: borderColor,
            data: columnData,
            borderWidth: 1
          }
          break

        case 'column':
          dataset = {
            label: mapping.chartLabel || headers[mapping.datasetIndex] || `Dataset ${mapping.datasetIndex + 1}`,
            backgroundColor: color,
            borderColor: borderColor,
            data: columnData,
            borderWidth: 1
          }
          break

        case 'line':
          dataset = {
            label: mapping.chartLabel || headers[mapping.datasetIndex] || `Dataset ${mapping.datasetIndex + 1}`,
            borderColor: borderColor,
            backgroundColor: color,
            data: columnData,
            fill: false,
            tension: 0.1
          }
          break

        case 'area':
          dataset = {
            label: mapping.chartLabel || headers[mapping.datasetIndex] || `Dataset ${mapping.datasetIndex + 1}`,
            backgroundColor: color,
            borderColor: borderColor,
            data: columnData,
            fill: true,
            tension: 0.1
          }
          break

        case 'pie':
          // For pie charts, use the first few rows' values
          const pieValues = columnData.slice(0, 5).map((v, i) => v || 0)
          dataset = {
            label: mapping.chartLabel || headers[mapping.datasetIndex] || `Dataset ${mapping.datasetIndex + 1}`,
            data: pieValues,
            backgroundColor: [
              'rgba(255, 99, 132, 0.5)',
              'rgba(53, 162, 235, 0.5)',
              'rgba(255, 206, 86, 0.5)',
              'rgba(75, 192, 192, 0.5)',
              'rgba(153, 102, 255, 0.5)'
            ]
          }
          break

        case 'doughnut':
          const doughnutValues = columnData.slice(0, 5).map((v, i) => v || 0)
          dataset = {
            label: mapping.chartLabel || headers[mapping.datasetIndex] || `Dataset ${mapping.datasetIndex + 1}`,
            data: doughnutValues,
            backgroundColor: [
              'rgba(255, 99, 132, 0.5)',
              'rgba(53, 162, 235, 0.5)',
              'rgba(255, 206, 86, 0.5)',
              'rgba(75, 192, 192, 0.5)',
              'rgba(153, 102, 255, 0.5)'
            ]
          }
          break

        case 'funnel':
          dataset = {
            label: mapping.chartLabel || headers[mapping.datasetIndex] || `Dataset ${mapping.datasetIndex + 1}`,
            data: [60, 40, 30, 20, 10] // Fixed funnel data
          }
          break

        case 'scatter':
          dataset = {
            label: mapping.chartLabel || headers[mapping.datasetIndex] || `Dataset ${mapping.datasetIndex + 1}`,
            data: columnData.map((v, i) => ({ x: i, y: v })),
            pointRadius: 5
          }
          break

        default:
          dataset = {
            label: mapping.chartLabel || headers[mapping.datasetIndex] || `Dataset ${mapping.datasetIndex + 1}`,
            backgroundColor: color,
            borderColor: borderColor,
            data: columnData,
            borderWidth: 1
          }
      }

      usedColumns.add(mapping.columnName)
      datasets.push(dataset)
    })

    // If no mappings provided, use default sample data
    if (datasets.length === 0) {
      datasets.push({
        label: 'Dataset 1',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        data: [65, 59, 80, 81, 55, 40, 37],
        borderWidth: 1
      })
      datasets.push({
        label: 'Dataset 2',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderColor: 'rgba(153, 102, 255, 1)',
        data: [28, 48, 40, 19, 86, 27, 90],
        borderWidth: 1
      })
    }

    return datasets
  }

  return {
    labels: baseData.labels,
    datasets: generateDatasets()
  }
}

const ChartComponent = ({
  type,
  headers,
  rows,
  mappings,
  excelHeaders
}: {
  type: ChartType
  headers: string[]
  rows: any[]
  mappings: ExcelColumnMapping[]
  excelHeaders: string[]
}): JSX.Element => {
  const chartData = useChartData(type, headers, rows, mappings)

  return (
    <div className="chart-card">
      <h3 className="chart-title">
        {type.replace(/bar|column|line|area|pie|doughnut|funnel|scatter|combo/gi, (m: string) =>
          m.charAt(0).toUpperCase() + m.slice(1))
        } Chart</h3>
      <canvas
        id={`chartjs-${type}`}
        width="400"
        height="200"
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: {
              display: headers.length > 0 || mappings.length > 0
            }
          }
        }}
      />
    </div>
  )
}

const Dashboard = () => {
  const [excelImportResult, setExcelImportResult] = useState<ExcelImportResult | null>(null)
  const [excelHeaders, setExcelHeaders] = useState<string[]>([])
  const [excelRows, setExcelRows] = useState<any[]>([])
  const [excelMappings, setExcelMappings] = useState<ExcelColumnMapping[]>([])
  const [showMappings, setShowMappings] = useState<boolean>(false)

  const chartTypes: ChartType[] = [
    'bar', 'bar-stack', 'bar-cluster',
    'column', 'column-stack', 'column-cluster',
    'line', 'area', 'area-stack', 'area-100-stack',
    'combo', 'combo-variant',
    'funnel', 'scatter', 'pie', 'doughnut'
  ]

  const handleExcelImport = (result: ExcelImportResult) => {
    setExcelImportResult(result)
    if (result.success) {
      setExcelHeaders(result.headers)
      setExcelRows(result.rows)
      setExcelMappings(result.mappings)
      setShowMappings(true)
    } else {
      setExcelHeaders([])
      setExcelRows([])
      setExcelMappings([])
      setShowMappings(false)
    }
  }

  return (
    <div className="dashboard">
      <h1 className="dashboard-header">Dashboard Creator</h1>
      <p className="dashboard-subtitle">
        Select chart types to display data from Excel or sample data
      </p>

      {/* Excel Import Section */}
      <ExcelReader onImport={handleExcelImport} />

      {/* Charts Customization Section */}
      {excelImportResult?.success && excelMappings.length > 0 && (
        <div className="customization-section">
          <h2>🎛️ Chart Customization</h2>
          <p>Configure how Excel columns map to chart datasets</p>
          <div className="mapping-controls">
            {excelMappings.map((mapping, index) => (
              <div key={index} className="mapping-control">
                <select
                  className="mapping-select"
                  onChange={(e) => {
                    const newMappings = [...excelMappings]
                    newMappings[index] = {
                      ...newMappings[index],
                      columnName: e.target.value
                    }
                    setExcelMappings(newMappings)
                  }}
                >
                  <option value="">-- Map Column --</option>
                  {excelHeaders.map((header) => (
                    <option key={header} value={header}>
                      {header}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  className="mapping-label-input"
                  defaultValue={mapping.chartLabel}
                  onChange={(e) => {
                    const newMappings = [...excelMappings]
                    newMappings[index] = {
                      ...newMappings[index],
                      chartLabel: e.target.value
                    }
                    setExcelMappings(newMappings)
                  }}
                  placeholder="Label"
                />
                <select
                  className="mapping-chart-type-select"
                  onChange={(e) => {
                    const newMappings = [...excelMappings]
                    newMappings[index] = {
                      ...newMappings[index],
                      chartType: e.target.value as ChartType
                    }
                    setExcelMappings(newMappings)
                  }}
                >
                  <option value="bar">Bar</option>
                  <option value="column">Column</option>
                  <option value="line">Line</option>
                  <option value="area">Area</option>
                  <option value="pie">Pie</option>
                  <option value="doughnut">Doughnut</option>
                  <option value="funnel">Funnel</option>
                  <option value="scatter">Scatter</option>
                </select>
                <input
                  type="number"
                  className="mapping-dataset-index-input"
                  defaultValue={String(mapping.datasetIndex)}
                  onChange={(e) => {
                    const newMappings = [...excelMappings]
                    newMappings[index] = {
                      ...newMappings[index],
                      datasetIndex: parseInt(e.target.value) || mapping.datasetIndex
                    }
                    setExcelMappings(newMappings)
                  }}
                  placeholder="Dataset #"
                />
                <button
                  className="remove-mapping-btn"
                  onClick={() => {
                    const newMappings = excelMappings.filter(
                      (_, i) => i !== index
                    )
                    setExcelMappings(newMappings)
                  }}
                >
                  ✕
                </button>
              </div>
            ))}

            <button
              className="add-mapping-btn"
              onClick={() => {
                const newMappings = [...excelMappings, {
                  columnName: excelHeaders[0] || '',
                  chartLabel: excelHeaders[0] || '',
                  chartType: 'bar',
                  datasetIndex: excelMappings.length
                }]
                setExcelMappings(newMappings)
              }}
            >
              + Add Mapping
            </button>
          </div>

          <button className="apply-mappings-btn" onClick={() => setShowMappings(false)}>
            Apply Mappings
          </button>
        </div>
      )}

      {/* Charts Grid */}
      <div className="charts-grid">
        {chartTypes.map((type) => (
          <div key={type} className="chart-item">
            <ChartComponent
              type={type}
              headers={excelHeaders}
              rows={excelRows}
              mappings={excelMappings}
              excelHeaders={excelHeaders}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default Dashboard