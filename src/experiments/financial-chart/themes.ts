import type { ChartTheme } from '../../features/financial-chart';

export type ThemeId = 'dark' | 'light' | 'ocean';

export const THEME_LABELS: Record<ThemeId, string> = {
  dark: 'ダーク',
  light: 'ライト',
  ocean: 'オーシャン',
};

export const THEMES: Record<ThemeId, ChartTheme> = {
  dark: {
    background: '#1a1a2e',
    grid: '#2a2a4a',
    axis: '#4a4a7a',
    text: '#b8b8d8',
    candleUp: '#26a69a',
    candleDown: '#ef5350',
    line: '#4fc3f7',
    latestPriceLine: '#ffca28',
    latestPriceLabelBg: '#ffca28',
    latestPriceLabelText: '#1a1a2e',
  },
  light: {
    background: '#fafafa',
    grid: '#e8e8e8',
    axis: '#bbbbbb',
    text: '#555555',
    candleUp: '#2e7d32',
    candleDown: '#c62828',
    line: '#1565c0',
    latestPriceLine: '#f57c00',
    latestPriceLabelBg: '#f57c00',
    latestPriceLabelText: '#ffffff',
  },
  ocean: {
    background: '#0d2137',
    grid: '#1a3a55',
    axis: '#2c6a90',
    text: '#89bdd6',
    candleUp: '#00bfa5',
    candleDown: '#ff6e40',
    line: '#00e5ff',
    latestPriceLine: '#ffeb3b',
    latestPriceLabelBg: '#ffeb3b',
    latestPriceLabelText: '#0d2137',
  },
};
