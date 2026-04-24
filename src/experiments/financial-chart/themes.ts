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
    tooltipGuideLine: '#ffca28',
    tooltipBackground: 'rgba(20, 20, 30, 0.92)',
    tooltipText: '#ffffff',
    tooltipShadow: '0 6px 20px rgba(0, 0, 0, 0.25)',
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
    tooltipGuideLine: '#1565c0',
    tooltipBackground: 'rgba(255, 255, 255, 0.95)',
    tooltipText: '#1f2937',
    tooltipShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
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
    tooltipGuideLine: '#00e5ff',
    tooltipBackground: 'rgba(8, 32, 51, 0.94)',
    tooltipText: '#d8f4ff',
    tooltipShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
  },
};
