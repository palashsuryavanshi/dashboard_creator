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

const useChartData = (type: ChartType, excelHeaders: string[] = []) => {
  const baseData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: []
  }

  // Map Excel headers to chart data if available, otherwise use defaults
  const generateDatasets = (headers: string[]) => {
    if (headers.length >= 2) {
      // Use first two columns as datasets if Excel data is provided
      return [
        {
          label: headers[0] || 'Dataset 1',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          data: [65, 59, 80, 81, 55, 40, 37],
          borderWidth: 1
        },
        {
          label: headers[1] || 'Dataset 2',
          backgroundColor: 'rgba(153, 102, 255, 0.2)',
          borderColor: 'rgba(153, 102, 255, 1)',
          data: [28, 48, 40, 19, 86, 27, 90],
          borderWidth: 1
        }
      ]
    }
    return [
      {
        label: 'Dataset 1',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        data: [65, 59, 80, 81, 55, 40, 37],
        borderWidth: 1
      },
      {
        label: 'Dataset 2',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderColor: 'rgba(153, 102, 255, 1)',
        data: [28, 48, 40, 19, 86, 27, 90],
        borderWidth: 1
      }
    ]
  }

  switch (type) {
    case 'bar':
      return {
        labels: baseData.labels,
        datasets: generateDatasets(excelHeaders)
      }

    case 'bar-stack':
      return {
        labels: baseData.labels,
        datasets: generateDatasets(excelHeaders).map((ds: any) => ({
          ...ds,
          stack: 'stack1'
        }))
      }

    case 'bar-cluster':
      return {
        labels: baseData.labels,
        datasets: generateDatasets(excelHeaders)
      }

    case 'column':
      return {
        labels: baseData.labels,
        datasets: generateDatasets(excelHeaders)
      }

    case 'column-stack':
      return {
        labels: baseData.labels,
        datasets: generateDatasets(excelHeaders).map((ds: any) => ({
          ...ds,
          stack: 'stack1'
        }))
      }

    case 'column-cluster':
      return {
        labels: baseData.labels,
        datasets: generateDatasets(excelHeaders)
      }

    case 'line':
      return {
        labels: baseData.labels,
        datasets: [
          { label: excelHeaders[0] || 'Dataset 1', borderColor: 'rgba(75, 192, 192, 1)', backgroundColor: 'rgba(75, 192, 192, 0.2)', data: [65, 59, 80, 81, 55, 40, 37], fill: false, tension: 0.1 },
          { label: excelHeaders[1] || 'Dataset 2', borderColor: 'rgba(153, 102, 255, 1)', backgroundColor: 'rgba(153, 102, 255, 0.2)', data: [28, 48, 40, 19, 86, 27, 90], fill: false, tension: 0.1 }
        ]
      }

    case 'area':
      return {
        labels: baseData.labels,
        datasets: [
          { label: excelHeaders[0] || 'Dataset 1', backgroundColor: 'rgba(75, 192, 192, 0.3)', borderColor: 'rgba(75, 192, 192, 1)', data: [65, 59, 80, 81, 55, 40, 37], fill: true, tension: 0.1 },
          { label: excelHeaders[1] || 'Dataset 2', backgroundColor: 'rgba(153, 102, 255, 0.3)', borderColor: 'rgba(153, 102, 255, 1)', data: [28, 48, 40, 19, 86, 27, 90], fill: true, tension: 0.1 }
        ]
      }

    case 'area-stack':
      return {
        labels: baseData.labels,
        datasets: [
          { label: excelHeaders[0] || 'Dataset 1', backgroundColor: 'rgba(75, 192, 192, 0.3)', borderColor: 'rgba(75, 192, 192, 1)', data: [65, 59, 80, 81, 55, 40, 37], fill: true, tension: 0.1, stack: 'stack1' },
          { label: excelHeaders[1] || 'Dataset 2', backgroundColor: 'rgba(153, 102, 255, 0.3)', borderColor: 'rgba(153, 102, 255, 1)', data: [28, 48, 40, 19, 86, 27, 90], fill: true, tension: 0.1, stack: 'stack1' }
        ]
      }

    case 'area-100-stack':
      return {
        labels: baseData.labels,
        datasets: [
          { label: excelHeaders[0] || 'Dataset 1', backgroundColor: 'rgba(75, 192, 192, 0.3)', borderColor: 'rgba(75, 192, 192, 1)', data: [65, 59, 80, 81, 55, 40, 37], fill: true, tension: 0.1, stack: 'stack1' },
          { label: excelHeaders[1] || 'Dataset 2', backgroundColor: 'rgba(153, 102, 255, 0.3)', borderColor: 'rgba(153, 102, 255, 1)', data: [28, 48, 40, 19, 86, 27, 90], fill: true, tension: 0.1, stack: 'stack1' }
        ],
        options: {
          scales: {
            y: { beginAtZero: true, max: 100 }
          }
        }
      }

    case 'combo':
      return {
        labels: baseData.labels,
        datasets: [
          { type: 'bar' as const, label: excelHeaders[0] || 'Dataset 1', backgroundColor: 'rgba(75, 192, 192, 0.2)', borderColor: 'rgba(75, 192, 192, 1)', data: [65, 59, 80, 81, 55, 40, 37] },
          { type: 'line' as const, label: excelHeaders[1] || 'Dataset 2', borderColor: 'rgba(153, 102, 255, 1)', backgroundColor: 'rgba(153, 102, 255, 0.2)', data: [28, 48, 40, 19, 86, 27, 90], fill: false, tension: 0.1 }
        ]
      }

    case 'combo-variant':
      return {
        labels: baseData.labels,
        datasets: [
          { type: 'line' as const, label: excelHeaders[0] || 'Dataset 1', borderColor: 'rgba(75, 192, 192, 1)', backgroundColor: 'rgba(75, 192, 192, 0.2)', data: [65, 59, 80, 81, 55, 40, 37], fill: false, tension: 0.1 },
          { type: 'bar' as const, label: excelHeaders[1] || 'Dataset 2', backgroundColor: 'rgba(153, 102, 255, 0.2)', borderColor: 'rgba(153, 102, 255, 1)', data: [28, 48, 40, 19, 86, 27, 90] }
        ]
      }

    case 'funnel':
      return {
        labels: ['Stage 1', 'Stage 2', 'Stage 3', 'Stage 4', 'Stage 5'],
        datasets: [
          { label: 'Funnel', backgroundColor: ['rgba(255, 99, 132, 0.5)', 'rgba(53, 162, 235, 0.5)', 'rgba(75, 192, 192, 0.5)', 'rgba(153, 102, 255, 0.5)', 'rgba(255, 159, 64, 0.5)'], data: [60, 40, 30, 20, 10] }
        ]
      }

    case 'scatter':
      return {
        labels: [],
        datasets: [
          { label: excelHeaders[0] || 'Dataset 1', backgroundColor: 'rgba(75, 192, 192, 1)', data: [{ x: 1, y: 65 }, { x: 2, y: 59 }, { x: 3, y: 80 }, { x: 4, y: 81 }, { x: 5, y: 55 }], pointRadius: 5 },
          { label: excelHeaders[1] || 'Dataset 2', backgroundColor: 'rgba(153, 102, 255, 1)', data: [{ x: 1, y: 28 }, { x: 2, y: 48 }, { x: 3, y: 40 }, { x: 4, y: 19 }, { x: 5, y: 86 }], pointRadius: 5 }
        ]
      }

    case 'pie':
      return {
        labels: excelHeaders.length > 0 ? excelHeaders : ['Red', 'Blue', 'Yellow', 'Green', 'Purple'],
        datasets: [
          {
            data: excelHeaders.length > 0 ? [30, 20, 25, 15, 10] : [300, 50, 100, 40, 120],
            backgroundColor: excelHeaders.length > 0
              ? [['rgba(255, 99, 132, 0.5)'], ['rgba(53, 162, 235, 0.5)'], ['rgba(255, 206, 86, 0.5)'], ['rgba(75, 192, 192, 0.5)'], ['rgba(153, 102, 255, 0.5)']]
              : ['rgba(255, 99, 132, 0.5)', 'rgba(53, 162, 235, 0.5)', 'rgba(255, 206, 86, 0.5)', 'rgba(75, 192, 192, 0.5)', 'rgba(153, 102, 255, 0.5)']
          }
        ]
      }

    case 'doughnut':
      return {
        labels: excelHeaders.length > 0 ? excelHeaders : ['Red', 'Blue', 'Yellow', 'Green', 'Purple'],
        datasets: [
          {
            data: excelHeaders.length > 0 ? [30, 20, 25, 15, 10] : [300, 50, 100, 40, 120],
            backgroundColor: excelHeaders.length > 0
              ? [['rgba(255, 99, 132, 0.5)'], ['rgba(53, 162, 235, 0.5)'], ['rgba(255, 206, 86, 0.5)'], ['rgba(75, 192, 192, 0.5)'], ['rgba(153, 102, 255, 0.5)']]
              : ['rgba(255, 99, 132, 0.5)', 'rgba(53, 162, 235, 0.5)', 'rgba(255, 206, 86, 0.5)', 'rgba(75, 192, 192, 0.5)', 'rgba(153, 102, 255, 0.5)']
          }
        ]
      }

    default:
      return baseData
  }
}

const ChartComponent = ({ type, data, options, excelHeaders }: { type: ChartType; data: any; options: any; excelHeaders: string[] }) => {
  const chartData = useChartData(type, excelHeaders)

  return (
    <div className="chart-card">
      <h3 className="chart-title capitalize-type({type})">{type.replace(/bar|column|line|area|pie|doughnut|funnel|scatter|combo/gi, (m: string) => m.charAt(0).toUpperCase() + m.slice(1))}</h3>
      <canvas
        id="chartjs-{type}"
        width="400"
        height="200"
        data={chartData}
        options={{
          responsive: true,
          ...options
        }}
      />
    </div>
  )
}

const capitalizeType = (type: string) => type.replace(/\b\w/g, (c: string) => c.toUpperCase())

const Dashboard = () => {
  const [excelImportResult, setExcelImportResult] = useState<{ success: boolean; headers: string[]; rows: any[]; error?: string } | null>(null)
  const [excelHeaders, setExcelHeaders] = useState<string[]>([])

  const chartTypes: ChartType[] = [
    'bar', 'bar-stack', 'bar-cluster',
    'column', 'column-stack', 'column-cluster',
    'line', 'area', 'area-stack', 'area-100-stack',
    'combo', 'combo-variant',
    'funnel', 'scatter', 'pie', 'doughnut'
  ]

  const handleExcelImport = (result: { success: boolean; headers: string[]; rows: any[]; error?: string }) => {
    setExcelImportResult(result)
    if (result.success && result.headers.length > 0) {
      setExcelHeaders(result.headers)
    } else {
      setExcelHeaders([])
    }
  }

  return (
    <div className="dashboard">
      <h1 className="dashboard-header">Dashboard Creator</h1>
      <p className="dashboard-subtitle">Select chart types to display data from Excel or sample data</p>

      {/* Excel Import Section */}
      <ExcelReader onImport={handleExcelImport} />

      {/* Charts Grid */}
      <div className="charts-grid">
        {chartTypes.map((type) => (
          <div key={type} className="chart-item">
            <ChartComponent type={type} data={{ labels: [], datasets: [] }} options={{}} excelHeaders={excelHeaders} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default Dashboard