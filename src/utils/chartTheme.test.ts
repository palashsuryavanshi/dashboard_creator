import test from 'node:test';
import assert from 'node:assert/strict';
import { buildChartConfig, COLOR_THEMES } from './chartSetup.ts';
import { DEFAULT_CUSTOM_THEME } from './customTheme.ts';

const chartStyle = {
  ...DEFAULT_CUSTOM_THEME.charts,
  colors: ['#112233', '#445566'],
  chartBackground: '#fafafa',
  gridColor: '#abcdef',
  tickColor: '#123456',
  legendColor: '#234567',
  tooltipBackground: '#345678',
  tooltipTextColor: '#eeeeee',
  tooltipBorderColor: '#456789',
  dataLabelColor: '#567890',
  dataLabelFontSize: 14,
  lineWidth: 4,
  pointRadius: 7,
};

const configFor = (type: 'column' | 'line' | 'pie' | 'radar' | 'combo') => buildChartConfig(
  type,
  ['A', 'B'],
  [
    { Category: 'A', Metric: 10, Secondary: 3 },
    { Category: 'B', Metric: 20, Secondary: 8 },
  ],
  'Category',
  ['Metric', 'Secondary'],
  type === 'combo' ? 'Secondary' : undefined,
  COLOR_THEMES[0],
  false,
  chartStyle,
);

test('custom chart style changes palette and Cartesian text/grid/tooltip presentation', () => {
  const config = configFor('column');
  assert.equal(config.data.datasets[0].backgroundColor, 'rgba(17, 34, 51, 0.78)');
  assert.equal(config.data.datasets[0].borderColor, '#112233');
  assert.equal(config.data.datasets[0].borderWidth, 4);
  assert.equal((config.options.scales as any).x.grid.color, '#abcdef');
  assert.equal((config.options.scales as any).y.ticks.color, '#123456');
  assert.equal((config.options.plugins as any).legend.labels.color, '#234567');
  assert.equal((config.options.plugins as any).tooltip.backgroundColor, '#345678');
});

test('line styles honor custom point size and preserve chart data', () => {
  const config = configFor('line');
  assert.equal(config.chartJsType, 'line');
  assert.deepEqual(config.data.labels, ['A', 'B']);
  assert.equal(config.data.datasets[0].pointRadius, 7);
  assert.equal(config.data.datasets[0].borderWidth, 4);
});

test('radial palette colors and labels are customized without changing chart type', () => {
  const config = configFor('radar');
  assert.equal(config.chartJsType, 'radar');
  assert.deepEqual(config.data.labels, ['A', 'B']);
  assert.equal(config.data.datasets[0].borderColor, '#112233');
  assert.equal(config.data.datasets[0].pointRadius, 7);
  assert.equal((config.options.scales as any).r.pointLabels.color, '#123456');
  assert.equal((config.options.scales as any).r.ticks.color, '#123456');
});

test('chart preset selection restores default chart styling without custom overrides', () => {
  const config = buildChartConfig(
    'column', ['A'], [{ Category: 'A', Metric: 10 }], 'Category', ['Metric'], undefined,
    COLOR_THEMES[0], false,
  );
  assert.equal(config.data.datasets[0].backgroundColor, COLOR_THEMES[0].palette[0]);
  assert.equal(config.data.datasets[0].borderWidth, 1.5);
  assert.equal((config.options.plugins as any).legend.labels.font.size, 11);
});

test('pie keeps per-slice palette colors and white separators', () => {
  const config = configFor('pie');
  assert.deepEqual(config.data.datasets[0].backgroundColor, ['rgba(17, 34, 51, 0.78)', 'rgba(68, 85, 102, 0.78)']);
  assert.equal(config.data.datasets[0].borderColor, '#ffffff');
});

test('combo chart retains mixed dataset types while applying palette styling', () => {
  const config = configFor('combo');
  assert.equal(config.data.datasets[0].type, 'bar');
  assert.equal(config.data.datasets[1].type, 'line');
  assert.equal(config.data.datasets[1].pointRadius, 7);
  assert.equal(config.data.datasets[1].yAxisID, undefined);
});
