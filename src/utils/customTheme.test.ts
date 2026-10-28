import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_CUSTOM_THEME,
  loadCustomTheme,
  mergeChartTheme,
  saveCustomTheme,
  THEME_STORAGE_KEY,
} from './customTheme.ts';

class MemoryStorage {
  private values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

test('default theme exposes complete site and chart customization settings', () => {
  assert.equal(DEFAULT_CUSTOM_THEME.app.pageBackground, '#f1f5f9');
  assert.equal(DEFAULT_CUSTOM_THEME.charts.colors.length, 7);
  assert.equal(DEFAULT_CUSTOM_THEME.charts.dataLabelFontSize, 11);
});

test('chart overrides change selected settings and inherit the rest', () => {
  const merged = mergeChartTheme(DEFAULT_CUSTOM_THEME.charts, {
    chartBackground: '#112233',
    pointRadius: 9,
  });
  assert.equal(merged.chartBackground, '#112233');
  assert.equal(merged.pointRadius, 9);
  assert.equal(merged.gridColor, DEFAULT_CUSTOM_THEME.charts.gridColor);
  assert.deepEqual(merged.colors, DEFAULT_CUSTOM_THEME.charts.colors);
});

test('custom theme and per-chart overrides round-trip through storage', () => {
  const storage = new MemoryStorage();
  const value = {
    theme: { ...DEFAULT_CUSTOM_THEME, name: 'Workspace' },
    chartOverrides: { line: { lineWidth: 5 } },
    enabled: true,
  };
  saveCustomTheme(storage, value);
  const restored = loadCustomTheme(storage);
  assert.deepEqual(restored.theme, value.theme);
  assert.deepEqual(restored.chartOverrides, value.chartOverrides);
  assert.equal(restored.enabled, true);
  assert.ok(storage.getItem(THEME_STORAGE_KEY));
});

test('malformed saved data falls back to defaults without enabling custom theme', () => {
  const storage = new MemoryStorage();
  storage.setItem(THEME_STORAGE_KEY, '{bad json');
  const restored = loadCustomTheme(storage);
  assert.deepEqual(restored.theme, DEFAULT_CUSTOM_THEME);
  assert.deepEqual(restored.chartOverrides, {});
  assert.equal(restored.enabled, false);
});

test('incomplete or unsupported stored schema falls back to defaults', () => {
  const storage = new MemoryStorage();
  storage.setItem(THEME_STORAGE_KEY, JSON.stringify({ version: 1, theme: { name: 'partial' }, enabled: true }));
  const restored = loadCustomTheme(storage);
  assert.deepEqual(restored.theme, DEFAULT_CUSTOM_THEME);
  assert.deepEqual(restored.chartOverrides, {});
  assert.equal(restored.enabled, false);
});

test('font-family input rejects CSS declaration injection characters', () => {
  const storage = new MemoryStorage();
  const unsafeTheme = {
    ...DEFAULT_CUSTOM_THEME,
    app: { ...DEFAULT_CUSTOM_THEME.app, fontFamily: 'sans-serif; color: red' },
  };
  storage.setItem(THEME_STORAGE_KEY, JSON.stringify({ version: 1, theme: unsafeTheme, chartOverrides: {}, enabled: true }));
  const restored = loadCustomTheme(storage);
  assert.deepEqual(restored.theme, DEFAULT_CUSTOM_THEME);
  assert.equal(restored.enabled, false);
});
