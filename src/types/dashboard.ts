export type ChartType =
  | 'bar'
  | 'column'
  | 'bar-stack'
  | 'column-stack'
  | 'bar-cluster'
  | 'column-cluster'
  | 'bar-100-stack'
  | 'column-100-stack'
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
  | 'radar'
  | 'polar';

export type ChartCategory = 'all' | 'bar-column' | 'line-area' | 'combo' | 'specialty';

export interface ChartDefinition {
  id: ChartType;
  title: string;
  category: 'bar-column' | 'line-area' | 'combo' | 'specialty';
  description: string;
  isMultiDatasetRecommended?: boolean;
}

export interface ExcelColumnMapping {
  columnName: string;
  chartLabel: string;
  color?: string;
  datasetIndex: number;
}

export interface ExcelImportResult {
  success: boolean;
  fileName: string;
  sheetNames?: string[];
  selectedSheet?: string;
  headers: string[];
  rows: Record<string, any>[];
  labelColumn: string;
  valueColumns: string[];
  mappings: ExcelColumnMapping[];
  error?: string;
}

export interface ColorTheme {
  id: string;
  name: string;
  palette: string[];
  borderPalette: string[];
}

export interface CustomTheme {
  name: string;
  app: {
    pageBackground: string;
    headerBackground: string;
    cardBackground: string;
    textColor: string;
    mutedTextColor: string;
    borderColor: string;
    accentColor: string;
    fontFamily: string;
    baseFontSize: number;
    cardRadius: number;
  };
  charts: {
    colors: string[];
    chartBackground: string;
    gridColor: string;
    tickColor: string;
    legendColor: string;
    tooltipBackground: string;
    tooltipTextColor: string;
    tooltipBorderColor: string;
    dataLabelColor: string;
    dataLabelFontSize: number;
    lineWidth: number;
    pointRadius: number;
  };
}

export type ChartThemeOverride = Partial<CustomTheme['charts']>;
