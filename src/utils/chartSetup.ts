import 'chart.js/auto';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarController,
  LineController,
  PieController,
  DoughnutController,
  RadarController,
  PolarAreaController,
  ScatterController
} from 'chart.js';
import type { ChartOptions } from 'chart.js';
import type { ChartDefinition, ChartType, ColorTheme, CustomTheme } from '../types/dashboard.ts';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarController,
  LineController,
  PieController,
  DoughnutController,
  RadarController,
  PolarAreaController,
  ScatterController
);

export const CHART_DEFINITIONS: ChartDefinition[] = [
  // Bar & Column
  {
    id: 'column',
    title: 'Column Chart',
    category: 'bar-column',
    description: 'Vertical columns comparing categories.'
  },
  {
    id: 'bar',
    title: 'Bar Chart (Horizontal)',
    category: 'bar-column',
    description: 'Horizontal bars for comparing ranking and category metrics.'
  },
  {
    id: 'column-stack',
    title: 'Stacked Column Chart',
    category: 'bar-column',
    description: 'Vertical stacked bars showing total and sub-segment contributions.',
    isMultiDatasetRecommended: true
  },
  {
    id: 'bar-stack',
    title: 'Stacked Bar Chart',
    category: 'bar-column',
    description: 'Horizontal stacked bars comparing combined segment totals.',
    isMultiDatasetRecommended: true
  },
  {
    id: 'column-cluster',
    title: 'Clustered Column Chart',
    category: 'bar-column',
    description: 'Side-by-side grouped vertical columns for comparing multiple metrics.',
    isMultiDatasetRecommended: true
  },
  {
    id: 'bar-cluster',
    title: 'Clustered Bar Chart',
    category: 'bar-column',
    description: 'Grouped horizontal bars for multi-metric contrast.',
    isMultiDatasetRecommended: true
  },
  {
    id: 'column-100-stack',
    title: '100% Stacked Column Chart',
    category: 'bar-column',
    description: 'Columns normalized to 100% to visualize relative percentage share.',
    isMultiDatasetRecommended: true
  },
  {
    id: 'bar-100-stack',
    title: '100% Stacked Bar Chart',
    category: 'bar-column',
    description: 'Horizontal 100% normalized proportional bars.',
    isMultiDatasetRecommended: true
  },

  // Line & Area
  {
    id: 'line',
    title: 'Line Chart',
    category: 'line-area',
    description: 'Continuous trend line across categories over time.'
  },
  {
    id: 'area',
    title: 'Area Chart',
    category: 'line-area',
    description: 'Filled volume underneath lines demonstrating trend and volume.'
  },
  {
    id: 'area-stack',
    title: 'Stacked Area Chart',
    category: 'line-area',
    description: 'Stacked filled area curves showing cumulative volume over categories.',
    isMultiDatasetRecommended: true
  },
  {
    id: 'area-100-stack',
    title: '100% Stacked Area Chart',
    category: 'line-area',
    description: 'Proportional 100% percentage area curves.',
    isMultiDatasetRecommended: true
  },

  // Combo
  {
    id: 'combo',
    title: 'Combo Chart (Line + Column)',
    category: 'combo',
    description: 'Combines primary volume columns with trend line overlay.'
  },
  {
    id: 'combo-variant',
    title: 'Dual-Axis Combo Chart',
    category: 'combo',
    description: 'Left Y-axis for primary volume, Right Y-axis for secondary rate or percentage.'
  },

  // Specialty & Radial
  {
    id: 'funnel',
    title: 'Funnel Chart (Drop-off)',
    category: 'specialty',
    description: 'Progressive conversion pipeline visualizing stage drop-off.'
  },
  {
    id: 'scatter',
    title: 'Scatter (XY) Chart',
    category: 'specialty',
    description: 'XY coordinate dots showing correlation between values.'
  },
  {
    id: 'pie',
    title: 'Pie Chart',
    category: 'specialty',
    description: 'Circular proportional breakdown of primary metric.'
  },
  {
    id: 'doughnut',
    title: 'Doughnut Chart',
    category: 'specialty',
    description: 'Ring chart with center cutout displaying category proportions.'
  },
  {
    id: 'radar',
    title: 'Radar (Spider) Chart',
    category: 'specialty',
    description: 'Multi-axis radial polygon comparing strength across attributes.'
  },
  {
    id: 'polar',
    title: 'Polar Area Chart',
    category: 'specialty',
    description: 'Equal-angle radial sectors with heights proportional to values.'
  }
];

export const COLOR_THEMES: ColorTheme[] = [
  {
    id: 'electric-hyperion',
    name: 'Electric Indigo & Cyan',
    palette: [
      'rgba(99, 102, 241, 0.78)',  // Electric Indigo
      'rgba(6, 182, 212, 0.78)',   // Luminous Cyan
      'rgba(16, 185, 129, 0.78)',  // Mint Emerald
      'rgba(244, 63, 94, 0.78)',   // Radiant Rose
      'rgba(245, 158, 11, 0.78)',  // Warm Amber
      'rgba(139, 92, 246, 0.78)',  // Violet Aura
      'rgba(59, 130, 246, 0.78)'   // Vibrant Blue
    ],
    borderPalette: [
      '#6366f1',
      '#06b6d4',
      '#10b981',
      '#f43f5e',
      '#f59e0b',
      '#8b5cf6',
      '#3b82f6'
    ]
  },
  {
    id: 'cyber-midnight',
    name: 'Cyber Neon & Volt',
    palette: [
      'rgba(0, 210, 255, 0.8)',   // Cyber Cyan
      'rgba(255, 42, 109, 0.8)',   // Neon Pink
      'rgba(5, 217, 138, 0.8)',    // Volt Green
      'rgba(255, 184, 0, 0.8)',    // Electric Amber
      'rgba(157, 0, 255, 0.8)',    // Cyber Violet
      'rgba(0, 119, 255, 0.8)'     // Laser Blue
    ],
    borderPalette: [
      '#00d2ff',
      '#ff2a6d',
      '#05d98a',
      '#ffb800',
      '#9d00ff',
      '#0077ff'
    ]
  },
  {
    id: 'nordic-frost',
    name: 'Nordic Frost & Boreal',
    palette: [
      'rgba(14, 165, 233, 0.78)',  // Glacier Sky
      'rgba(20, 184, 166, 0.78)',  // Boreal Teal
      'rgba(99, 102, 241, 0.78)',  // Frost Indigo
      'rgba(251, 113, 133, 0.78)', // Coral Mist
      'rgba(245, 158, 11, 0.78)',  // Alpine Amber
      'rgba(168, 85, 247, 0.78)'   // Heather Purple
    ],
    borderPalette: [
      '#0ea5e9',
      '#14b8a6',
      '#6366f1',
      '#fb7185',
      '#f59e0b',
      '#a855f7'
    ]
  },
  {
    id: 'linear-titanium',
    name: 'Linear Precision Blue',
    palette: [
      'rgba(37, 99, 235, 0.8)',    // Tech Cobalt
      'rgba(124, 58, 237, 0.8)',   // Deep Purple
      'rgba(13, 148, 136, 0.8)',   // Titanium Teal
      'rgba(234, 88, 12, 0.8)',    // Signal Orange
      'rgba(225, 29, 72, 0.8)',    // Crimson
      'rgba(2, 132, 199, 0.8)'     // Azure
    ],
    borderPalette: [
      '#2563eb',
      '#7c3aed',
      '#0d9488',
      '#ea580c',
      '#e11d48',
      '#0284c7'
    ]
  },
  {
    id: 'emerald-quant',
    name: 'Obsidian Emerald & Gold',
    palette: [
      'rgba(16, 185, 129, 0.8)',   // Matrix Emerald
      'rgba(6, 182, 212, 0.8)',    // Cyan Pulse
      'rgba(234, 179, 8, 0.8)',    // Sovereign Gold
      'rgba(244, 63, 94, 0.8)',    // Ruby Flare
      'rgba(139, 92, 246, 0.8)'    // Amethyst
    ],
    borderPalette: [
      '#10b981',
      '#06b6d4',
      '#eab308',
      '#f43f5e',
      '#8b5cf6'
    ]
  }
];

export interface ChartConfigData {
  chartJsType: string;
  data: any;
  options: ChartOptions<any>;
}

export const buildChartConfig = (
  type: ChartType,
  labels: string[],
  rows: Record<string, any>[],
  labelColumn: string,
  valueColumns: string[],
  secondaryYColumn: string | undefined,
  theme: ColorTheme,
  isDark: boolean = false,
  chartStyle?: CustomTheme['charts']
): ChartConfigData => {
  const activeValueCols = valueColumns.length > 0 ? valueColumns : ['Value'];

  // Extract numeric array for each value column
  const seriesData = activeValueCols.map((colName) => {
    return rows.map((row) => {
      const val = row[colName];
      if (typeof val === 'number') return isNaN(val) ? 0 : val;
      const parsed = parseFloat(String(val ?? '0').replace(/[^0-9.-]/g, ''));
      return isNaN(parsed) ? 0 : parsed;
    });
  });

  // Extract secondary Y data if provided
  const secondaryData: number[] = secondaryYColumn
    ? rows.map((row) => {
        const val = row[secondaryYColumn];
        if (typeof val === 'number') return isNaN(val) ? 0 : val;
        const parsed = parseFloat(String(val ?? '0').replace(/[^0-9.-]/g, ''));
        return isNaN(parsed) ? 0 : parsed;
      })
    : [];

  const customStyle = chartStyle;
  const palette = customStyle?.colors;
  const colorToRgba = (color: string) => {
    const hex = color.slice(1);
    const normalized = hex.length === 3 ? hex.split('').map((digit) => digit + digit).join('') : hex;
    return `rgba(${parseInt(normalized.slice(0, 2), 16)}, ${parseInt(normalized.slice(2, 4), 16)}, ${parseInt(normalized.slice(4, 6), 16)}, 0.78)`;
  };
  const fillColor = (index: number) => palette?.length
    ? colorToRgba(palette[index % palette.length])
    : theme.palette[index % theme.palette.length];
  const strokeColor = (index: number) => palette?.length ? palette[index % palette.length] : theme.borderPalette[index % theme.borderPalette.length];
  const baseFont = {
    family: "'Inter', system-ui, -apple-system, sans-serif",
    size: customStyle?.dataLabelFontSize ?? 11
  };

  const gridColor = customStyle?.gridColor ?? (isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.65)');
  const tickColor = customStyle?.tickColor ?? (isDark ? '#94a3b8' : '#64748b');
  const applyChartStyle = (config: ChartConfigData): ChartConfigData => {
    if (!customStyle) return config;
    config.data.datasets = config.data.datasets.map((dataset: any, index: number) => {
      const colorByDatum = Array.isArray(dataset.backgroundColor);
      const paletteBackground = colorByDatum
        ? dataset.backgroundColor.map((_: unknown, colorIndex: number) => fillColor(colorIndex))
        : fillColor(index);
      const paletteBorder = Array.isArray(dataset.borderColor)
        ? dataset.borderColor.map((_: unknown, colorIndex: number) => strokeColor(colorIndex))
        : config.chartJsType === 'pie' || config.chartJsType === 'doughnut' || config.chartJsType === 'polarArea'
          ? dataset.borderColor
          : strokeColor(index);
      const datasetType = dataset.type ?? config.chartJsType;
      return {
        ...dataset,
        backgroundColor: paletteBackground,
        borderColor: paletteBorder,
        borderWidth: customStyle.lineWidth,
        pointRadius: datasetType === 'line' || datasetType === 'scatter' || datasetType === 'radar' ? customStyle.pointRadius : dataset.pointRadius,
        pointHoverRadius: datasetType === 'line' || datasetType === 'scatter' || datasetType === 'radar'
          ? Math.max(customStyle.pointRadius + 2, 4)
          : dataset.pointHoverRadius,
        ...(Array.isArray(dataset.pointBackgroundColor) ? {
          pointBackgroundColor: dataset.pointBackgroundColor.map((_: unknown, colorIndex: number) => strokeColor(colorIndex)),
        } : {}),
      };
    });
    const plugins = (config.options.plugins ?? {}) as any;
    config.options.plugins = {
      ...plugins,
      legend: {
        ...plugins.legend,
        labels: { ...plugins.legend?.labels, color: customStyle.legendColor, font: baseFont },
      },
      tooltip: {
        ...plugins.tooltip,
        backgroundColor: customStyle.tooltipBackground,
        titleColor: customStyle.tooltipTextColor,
        bodyColor: customStyle.tooltipTextColor,
        borderColor: customStyle.tooltipBorderColor,
        borderWidth: 1,
      },
    };
    if (config.options.scales) {
      const scales = config.options.scales as Record<string, any>;
      for (const scale of Object.values(scales)) {
        if (scale && typeof scale === 'object') {
          scale.grid = { ...scale.grid, color: customStyle.gridColor };
          scale.ticks = { ...scale.ticks, color: customStyle.tickColor, font: baseFont };
          if (scale.title) scale.title = { ...scale.title, color: customStyle.tickColor, font: baseFont };
          if (scale.pointLabels) scale.pointLabels = { ...scale.pointLabels, color: customStyle.tickColor, font: baseFont };
          if (scale.title) scale.title = { ...scale.title, color: customStyle.tickColor, font: baseFont };
        }
      }
    }
    return config;
  };

  const defaultScales = {
    x: {
      grid: { color: gridColor },
      ticks: { font: baseFont, color: tickColor }
    },
    y: {
      grid: { color: gridColor },
      ticks: { font: baseFont, color: tickColor },
      beginAtZero: true
    }
  };

  const buildConfig = (): ChartConfigData => {
  switch (type) {
    case 'column': {
      return {
        chartJsType: 'bar',
        data: {
          labels,
          datasets: activeValueCols.map((col, idx) => ({
            label: col,
            data: seriesData[idx],
            backgroundColor: theme.palette[idx % theme.palette.length],
            borderColor: theme.borderPalette[idx % theme.borderPalette.length],
            borderWidth: 1.5,
            borderRadius: 4
          }))
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top', labels: { font: baseFont, boxWidth: 12 } }
          },
          scales: defaultScales
        }
      };
    }

    case 'bar': {
      return {
        chartJsType: 'bar',
        data: {
          labels,
          datasets: activeValueCols.map((col, idx) => ({
            label: col,
            data: seriesData[idx],
            backgroundColor: theme.palette[idx % theme.palette.length],
            borderColor: theme.borderPalette[idx % theme.borderPalette.length],
            borderWidth: 1.5,
            borderRadius: 4
          }))
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top', labels: { font: baseFont, boxWidth: 12 } }
          },
          scales: defaultScales
        }
      };
    }

    case 'column-stack': {
      return {
        chartJsType: 'bar',
        data: {
          labels,
          datasets: activeValueCols.map((col, idx) => ({
            label: col,
            data: seriesData[idx],
            backgroundColor: theme.palette[idx % theme.palette.length],
            borderColor: theme.borderPalette[idx % theme.borderPalette.length],
            borderWidth: 1
          }))
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top', labels: { font: baseFont, boxWidth: 12 } }
          },
          scales: {
            x: { stacked: true, grid: { color: gridColor }, ticks: { font: baseFont, color: tickColor } },
            y: { stacked: true, grid: { color: gridColor }, ticks: { font: baseFont, color: tickColor }, beginAtZero: true }
          }
        }
      };
    }

    case 'bar-stack': {
      return {
        chartJsType: 'bar',
        data: {
          labels,
          datasets: activeValueCols.map((col, idx) => ({
            label: col,
            data: seriesData[idx],
            backgroundColor: theme.palette[idx % theme.palette.length],
            borderColor: theme.borderPalette[idx % theme.borderPalette.length],
            borderWidth: 1
          }))
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top', labels: { font: baseFont, boxWidth: 12 } }
          },
          scales: {
            x: { stacked: true, grid: { color: gridColor }, ticks: { font: baseFont, color: tickColor } },
            y: { stacked: true, grid: { color: gridColor }, ticks: { font: baseFont, color: tickColor }, beginAtZero: true }
          }
        }
      };
    }

    case 'column-cluster': {
      return {
        chartJsType: 'bar',
        data: {
          labels,
          datasets: activeValueCols.map((col, idx) => ({
            label: col,
            data: seriesData[idx],
            backgroundColor: theme.palette[idx % theme.palette.length],
            borderColor: theme.borderPalette[idx % theme.borderPalette.length],
            borderWidth: 1.5,
            borderRadius: 3
          }))
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top', labels: { font: baseFont, boxWidth: 12 } }
          },
          scales: defaultScales
        }
      };
    }

    case 'bar-cluster': {
      return {
        chartJsType: 'bar',
        data: {
          labels,
          datasets: activeValueCols.map((col, idx) => ({
            label: col,
            data: seriesData[idx],
            backgroundColor: theme.palette[idx % theme.palette.length],
            borderColor: theme.borderPalette[idx % theme.borderPalette.length],
            borderWidth: 1.5,
            borderRadius: 3
          }))
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top', labels: { font: baseFont, boxWidth: 12 } }
          },
          scales: defaultScales
        }
      };
    }

    case 'column-100-stack': {
      const rowTotals = labels.map((_, i) => {
        return seriesData.reduce((acc, series) => acc + (series[i] || 0), 0) || 1;
      });
      const pctDatasets = activeValueCols.map((col, sIdx) => ({
        label: `${col} (%)`,
        data: seriesData[sIdx].map((val, i) => Math.round(((val / rowTotals[i]) * 100) * 10) / 10),
        backgroundColor: theme.palette[sIdx % theme.palette.length],
        borderColor: theme.borderPalette[sIdx % theme.borderPalette.length],
        borderWidth: 1
      }));

      return {
        chartJsType: 'bar',
        data: { labels, datasets: pctDatasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top', labels: { font: baseFont, boxWidth: 12 } },
            tooltip: {
              callbacks: {
                label: (ctx: any) => `${ctx.dataset.label}: ${ctx.raw}%`
              }
            }
          },
          scales: {
            x: { stacked: true, grid: { color: gridColor }, ticks: { font: baseFont, color: tickColor } },
            y: {
              stacked: true,
              max: 100,
              grid: { color: gridColor },
              ticks: { font: baseFont, color: tickColor, callback: (val: any) => `${val}%` }
            }
          }
        }
      };
    }

    case 'bar-100-stack': {
      const rowTotals = labels.map((_, i) => {
        return seriesData.reduce((acc, series) => acc + (series[i] || 0), 0) || 1;
      });
      const pctDatasets = activeValueCols.map((col, sIdx) => ({
        label: `${col} (%)`,
        data: seriesData[sIdx].map((val, i) => Math.round(((val / rowTotals[i]) * 100) * 10) / 10),
        backgroundColor: theme.palette[sIdx % theme.palette.length],
        borderColor: theme.borderPalette[sIdx % theme.borderPalette.length],
        borderWidth: 1
      }));

      return {
        chartJsType: 'bar',
        data: { labels, datasets: pctDatasets },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top', labels: { font: baseFont, boxWidth: 12 } },
            tooltip: {
              callbacks: {
                label: (ctx: any) => `${ctx.dataset.label}: ${ctx.raw}%`
              }
            }
          },
          scales: {
            x: {
              stacked: true,
              max: 100,
              grid: { color: gridColor },
              ticks: { font: baseFont, color: tickColor, callback: (val: any) => `${val}%` }
            },
            y: { stacked: true, grid: { color: gridColor }, ticks: { font: baseFont, color: tickColor } }
          }
        }
      };
    }

    case 'line': {
      return {
        chartJsType: 'line',
        data: {
          labels,
          datasets: activeValueCols.map((col, idx) => ({
            label: col,
            data: seriesData[idx],
            borderColor: theme.borderPalette[idx % theme.borderPalette.length],
            backgroundColor: theme.palette[idx % theme.palette.length],
            borderWidth: 2.5,
            pointRadius: 4,
            tension: 0.35
          }))
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top', labels: { font: baseFont, boxWidth: 12 } }
          },
          scales: defaultScales
        }
      };
    }

    case 'area': {
      return {
        chartJsType: 'line',
        data: {
          labels,
          datasets: activeValueCols.map((col, idx) => ({
            label: col,
            data: seriesData[idx],
            fill: true,
            borderColor: theme.borderPalette[idx % theme.borderPalette.length],
            backgroundColor: theme.palette[idx % theme.palette.length],
            borderWidth: 2,
            pointRadius: 3,
            tension: 0.35
          }))
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top', labels: { font: baseFont, boxWidth: 12 } }
          },
          scales: defaultScales
        }
      };
    }

    case 'area-stack': {
      return {
        chartJsType: 'line',
        data: {
          labels,
          datasets: activeValueCols.map((col, idx) => ({
            label: col,
            data: seriesData[idx],
            fill: true,
            borderColor: theme.borderPalette[idx % theme.borderPalette.length],
            backgroundColor: theme.palette[idx % theme.palette.length],
            borderWidth: 1.5,
            pointRadius: 2,
            tension: 0.3
          }))
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top', labels: { font: baseFont, boxWidth: 12 } }
          },
          scales: {
            x: { grid: { color: gridColor }, ticks: { font: baseFont, color: tickColor } },
            y: { stacked: true, grid: { color: gridColor }, ticks: { font: baseFont, color: tickColor }, beginAtZero: true }
          }
        }
      };
    }

    case 'area-100-stack': {
      const rowTotals = labels.map((_, i) => {
        return seriesData.reduce((acc, series) => acc + (series[i] || 0), 0) || 1;
      });
      const pctDatasets = activeValueCols.map((col, sIdx) => ({
        label: `${col} (%)`,
        data: seriesData[sIdx].map((val, i) => Math.round(((val / rowTotals[i]) * 100) * 10) / 10),
        fill: true,
        borderColor: theme.borderPalette[sIdx % theme.borderPalette.length],
        backgroundColor: theme.palette[sIdx % theme.palette.length],
        borderWidth: 1,
        pointRadius: 2,
        tension: 0.3
      }));

      return {
        chartJsType: 'line',
        data: { labels, datasets: pctDatasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top', labels: { font: baseFont, boxWidth: 12 } },
            tooltip: {
              callbacks: {
                label: (ctx: any) => `${ctx.dataset.label}: ${ctx.raw}%`
              }
            }
          },
          scales: {
            x: { grid: { color: gridColor }, ticks: { font: baseFont, color: tickColor } },
            y: {
              stacked: true,
              max: 100,
              grid: { color: gridColor },
              ticks: { font: baseFont, color: tickColor, callback: (val: any) => `${val}%` }
            }
          }
        }
      };
    }

    case 'combo': {
      // Primary bar, second dataset or secondary as line
      const datasets: any[] = [
        {
          type: 'bar',
          label: activeValueCols[0],
          data: seriesData[0],
          backgroundColor: theme.palette[0],
          borderColor: theme.borderPalette[0],
          borderWidth: 1.5,
          borderRadius: 4
        }
      ];

      if (secondaryYColumn && secondaryData.length > 0) {
        datasets.push({
          type: 'line',
          label: `${secondaryYColumn} (Line)`,
          data: secondaryData,
          borderColor: theme.borderPalette[1] || '#14b8a6',
          backgroundColor: theme.palette[1] || 'rgba(20, 184, 166, 0.75)',
          borderWidth: 2.5,
          tension: 0.3,
          pointRadius: 4
        });
      } else if (activeValueCols.length > 1) {
        datasets.push({
          type: 'line',
          label: `${activeValueCols[1]} (Line)`,
          data: seriesData[1],
          borderColor: theme.borderPalette[1] || '#14b8a6',
          backgroundColor: theme.palette[1] || 'rgba(20, 184, 166, 0.75)',
          borderWidth: 2.5,
          tension: 0.3,
          pointRadius: 4
        });
      }

      return {
        chartJsType: 'bar',
        data: { labels, datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top', labels: { font: baseFont, boxWidth: 12 } }
          },
          scales: defaultScales
        }
      };
    }

    case 'combo-variant': {
      // Dual-Axis: Left Y for primary metrics, Right Y1 for secondary Y column
      const hasSecondary = Boolean(secondaryYColumn && secondaryData.length > 0);
      const secondaryColName = secondaryYColumn || (activeValueCols[1] ? activeValueCols[1] : activeValueCols[0]);
      const secondarySeries = hasSecondary ? secondaryData : (seriesData[1] || seriesData[0]);

      const datasets: any[] = [
        {
          type: 'bar' as const,
          label: `${activeValueCols[0]} (Left Axis)`,
          data: seriesData[0],
          backgroundColor: theme.palette[0],
          borderColor: theme.borderPalette[0],
          borderWidth: 1.5,
          borderRadius: 4,
          yAxisID: 'y'
        },
        {
          type: 'line' as const,
          label: `${secondaryColName} (Right Axis)`,
          data: secondarySeries,
          borderColor: theme.borderPalette[1] || '#f43f5e',
          backgroundColor: theme.palette[1] || 'rgba(244, 63, 94, 0.8)',
          borderWidth: 2.5,
          tension: 0.3,
          pointRadius: 4,
          yAxisID: 'y1'
        }
      ];

      return {
        chartJsType: 'bar',
        data: { labels, datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top', labels: { font: baseFont, boxWidth: 12 } }
          },
          scales: {
            x: { grid: { color: gridColor }, ticks: { font: baseFont, color: tickColor } },
            y: {
              type: 'linear' as const,
              position: 'left' as const,
              grid: { color: gridColor },
              ticks: { font: baseFont, color: tickColor },
              title: { display: true, text: activeValueCols[0], font: baseFont }
            },
            y1: {
              type: 'linear' as const,
              position: 'right' as const,
              grid: { drawOnChartArea: false },
              ticks: { font: baseFont, color: theme.borderPalette[1] || '#f43f5e' },
              title: {
                display: true,
                text: secondaryColName,
                font: baseFont,
                color: theme.borderPalette[1] || '#f43f5e'
              }
            }
          }
        }
      };
    }

    case 'funnel': {
      const primaryData = seriesData[0] || [];
      const maxValue = Math.max(...primaryData, 1);
      const funnelDatasets = [{
        label: activeValueCols[0],
        data: primaryData,
        backgroundColor: labels.map((_, i) => theme.palette[i % theme.palette.length]),
        borderColor: labels.map((_, i) => theme.borderPalette[i % theme.borderPalette.length]),
        borderWidth: 1.5,
        borderRadius: 6
      }];

      return {
        chartJsType: 'bar',
        data: { labels, datasets: funnelDatasets },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                afterLabel: (ctx: any) => {
                  const val = ctx.raw as number;
                  const pct = Math.round((val / maxValue) * 100);
                  return `Conversion of Max: ${pct}%`;
                }
              }
            }
          },
          scales: defaultScales
        }
      };
    }

    case 'scatter': {
      const hasSecondary = Boolean(secondaryYColumn && secondaryData.length > 0);
      const hasTwoMetrics = activeValueCols.length >= 2 || hasSecondary;

      const points = rows.map((_, i) => {
        const xVal = seriesData[0][i] || 0;
        const yVal = hasSecondary ? secondaryData[i] : (hasTwoMetrics ? seriesData[1][i] : i + 1);
        return { x: xVal, y: yVal, label: labels[i] };
      });

      const yLabel = hasSecondary ? secondaryYColumn : (hasTwoMetrics ? activeValueCols[1] : 'Index');

      return {
        chartJsType: 'scatter',
        data: {
          datasets: [{
            label: `${activeValueCols[0]} vs ${yLabel}`,
            data: points,
            backgroundColor: theme.palette[0],
            borderColor: theme.borderPalette[0],
            pointRadius: 6,
            pointHoverRadius: 9
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top', labels: { font: baseFont, boxWidth: 12 } },
            tooltip: {
              callbacks: {
                label: (ctx: any) => {
                  const pt = ctx.raw as { x: number; y: number; label?: string };
                  return `${pt.label || ''} (${activeValueCols[0]}: ${pt.x}, ${yLabel}: ${pt.y})`;
                }
              }
            }
          },
          scales: {
            x: {
              type: 'linear',
              position: 'bottom',
              grid: { color: gridColor },
              ticks: { font: baseFont, color: tickColor },
              title: { display: true, text: activeValueCols[0], font: baseFont }
            },
            y: {
              grid: { color: gridColor },
              ticks: { font: baseFont, color: tickColor },
              title: { display: true, text: yLabel, font: baseFont }
            }
          }
        }
      };
    }

    case 'pie': {
      const primaryData = seriesData[0] || [];
      return {
        chartJsType: 'pie',
        data: {
          labels,
          datasets: [{
            label: activeValueCols[0],
            data: primaryData,
            backgroundColor: labels.map((_, i) => theme.palette[i % theme.palette.length]),
            borderColor: '#ffffff',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'right', labels: { font: baseFont, boxWidth: 12 } }
          }
        }
      };
    }

    case 'doughnut': {
      const primaryData = seriesData[0] || [];
      return {
        chartJsType: 'doughnut',
        data: {
          labels,
          datasets: [{
            label: activeValueCols[0],
            data: primaryData,
            backgroundColor: labels.map((_, i) => theme.palette[i % theme.palette.length]),
            borderColor: '#ffffff',
            borderWidth: 2
          }]
        },
        options: {
          cutout: '65%',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'right', labels: { font: baseFont, boxWidth: 12 } }
          }
        }
      };
    }

    case 'radar': {
      return {
        chartJsType: 'radar',
        data: {
          labels,
          datasets: activeValueCols.map((col, idx) => ({
            label: col,
            data: seriesData[idx],
            backgroundColor: theme.palette[idx % theme.palette.length],
            borderColor: theme.borderPalette[idx % theme.borderPalette.length],
            pointBackgroundColor: theme.borderPalette[idx % theme.borderPalette.length],
            borderWidth: 2,
            pointRadius: 3
          }))
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top', labels: { font: baseFont, boxWidth: 12 } }
          },
          scales: {
            r: {
              grid: { color: gridColor },
              pointLabels: { font: baseFont, color: '#475569' },
              ticks: { display: false }
            }
          }
        }
      };
    }

    case 'polar': {
      const primaryData = seriesData[0] || [];
      return {
        chartJsType: 'polarArea',
        data: {
          labels,
          datasets: [{
            label: activeValueCols[0],
            data: primaryData,
            backgroundColor: labels.map((_, i) => theme.palette[i % theme.palette.length]),
            borderColor: '#ffffff',
            borderWidth: 1.5
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'right', labels: { font: baseFont, boxWidth: 12 } }
          },
          scales: {
            r: {
              grid: { color: gridColor },
              ticks: { display: false }
            }
          }
        }
      };
    }

    default:
      return {
        chartJsType: 'bar',
        data: { labels, datasets: [] },
        options: { responsive: true, maintainAspectRatio: false }
      };
  }
  };
  return applyChartStyle(buildConfig());
};
