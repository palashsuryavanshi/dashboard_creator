import type { ChartThemeOverride, CustomTheme } from '../types/dashboard.ts';

export const THEME_STORAGE_KEY = 'dashboard-creator.custom-theme.v1';

export const DEFAULT_CUSTOM_THEME: CustomTheme = {
  name: 'Custom',
  app: {
    pageBackground: '#f1f5f9',
    headerBackground: '#059669',
    cardBackground: '#ffffff',
    textColor: '#0f172a',
    mutedTextColor: '#64748b',
    borderColor: '#e2e8f0',
    accentColor: '#4f46e5',
    fontFamily: "Inter, system-ui, -apple-system, sans-serif",
    baseFontSize: 14,
    cardRadius: 16,
  },
  charts: {
    colors: ['#6366f1', '#06b6d4', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6', '#3b82f6'],
    chartBackground: '#ffffff',
    gridColor: 'rgba(148, 163, 184, 0.25)',
    tickColor: '#64748b',
    legendColor: '#475569',
    tooltipBackground: '#0f172a',
    tooltipTextColor: '#f8fafc',
    tooltipBorderColor: '#334155',
    dataLabelColor: '#1e293b',
    dataLabelFontSize: 11,
    lineWidth: 2,
    pointRadius: 3,
  },
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const isColor = (value: unknown): value is string =>
  typeof value === 'string' && (value.length <= 64) && (/^#[0-9a-f]{3,8}$/i.test(value) || /^rgba?\([\d\s.,%]+\)$/i.test(value) || /^hsla?\([\d\s.,%deg]+\)$/i.test(value));
const isFiniteInRange = (value: unknown, min: number, max: number): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;

function validateTheme(value: unknown): value is CustomTheme {
  if (!isRecord(value) || !isRecord(value.app) || !isRecord(value.charts) || typeof value.name !== 'string') return false;
  const app = value.app;
  const charts = value.charts;
  const appColors = ['pageBackground', 'headerBackground', 'cardBackground', 'textColor', 'mutedTextColor', 'borderColor', 'accentColor'];
  const chartColors = ['chartBackground', 'gridColor', 'tickColor', 'legendColor', 'tooltipBackground', 'tooltipTextColor', 'tooltipBorderColor', 'dataLabelColor'];
  return appColors.every((key) => isColor(app[key])) &&
    typeof app.fontFamily === 'string' && app.fontFamily.length > 0 && app.fontFamily.length <= 120 && !/[;{}<>]/.test(app.fontFamily) &&
    isFiniteInRange(app.baseFontSize, 10, 24) && isFiniteInRange(app.cardRadius, 0, 32) &&
    Array.isArray(charts.colors) && charts.colors.length >= 1 && charts.colors.length <= 12 && charts.colors.every(isColor) &&
    chartColors.every((key) => isColor(charts[key])) &&
    isFiniteInRange(charts.dataLabelFontSize, 8, 24) && isFiniteInRange(charts.lineWidth, 1, 8) && isFiniteInRange(charts.pointRadius, 0, 12);
}

function validateOverrides(value: unknown): value is Record<string, ChartThemeOverride> {
  if (!isRecord(value)) return false;
  return Object.values(value).every((override) => {
    if (!isRecord(override)) return false;
    return Object.entries(override).every(([key, item]) => {
      if (key === 'colors') return Array.isArray(item) && item.length > 0 && item.length <= 12 && item.every(isColor);
      if (['dataLabelFontSize', 'lineWidth', 'pointRadius'].includes(key)) {
        const range: Record<string, [number, number]> = { dataLabelFontSize: [8, 24], lineWidth: [1, 8], pointRadius: [0, 12] };
        const [min, max] = range[key];
        return isFiniteInRange(item, min, max);
      }
      if (['chartBackground', 'gridColor', 'tickColor', 'legendColor', 'tooltipBackground', 'tooltipTextColor', 'tooltipBorderColor', 'dataLabelColor'].includes(key)) return isColor(item);
      return false;
    });
  });
}

export function mergeChartTheme(global: CustomTheme['charts'], override?: ChartThemeOverride): CustomTheme['charts'] {
  return { ...global, ...(override ?? {}), colors: [...(override?.colors ?? global.colors)] };
}

export interface SavedCustomTheme {
  theme: CustomTheme;
  chartOverrides: Record<string, ChartThemeOverride>;
  enabled: boolean;
}

export function loadCustomTheme(storage: Pick<Storage, 'getItem'>): SavedCustomTheme {
  try {
    const serialized = storage.getItem(THEME_STORAGE_KEY);
    if (!serialized) return { theme: DEFAULT_CUSTOM_THEME, chartOverrides: {}, enabled: false };
    const parsed: unknown = JSON.parse(serialized);
    if (!isRecord(parsed) || parsed.version !== 1 || !validateTheme(parsed.theme) || !validateOverrides(parsed.chartOverrides) || typeof parsed.enabled !== 'boolean') {
      return { theme: DEFAULT_CUSTOM_THEME, chartOverrides: {}, enabled: false };
    }
    return { theme: parsed.theme, chartOverrides: parsed.chartOverrides, enabled: parsed.enabled };
  } catch {
    return { theme: DEFAULT_CUSTOM_THEME, chartOverrides: {}, enabled: false };
  }
}

export function saveCustomTheme(storage: Pick<Storage, 'setItem'>, value: SavedCustomTheme): void {
  storage.setItem(THEME_STORAGE_KEY, JSON.stringify({ version: 1, ...value }));
}
