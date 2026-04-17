export type ThemeId = 'dark' | 'light' | 'ocean';

export interface ChartTheme {
  id: ThemeId;
  label: string;
  bg: string;
  gridColor: string;
  axisColor: string;
  tickColor: string;
  lineColor: string;
  bullColor: string;
  bearColor: string;
  tooltipBg: string;
  tooltipText: string;
}

export const THEMES: Record<ThemeId, ChartTheme> = {
  dark: {
    id: 'dark',
    label: 'ダーク',
    bg: '#1a1a2e',
    gridColor: '#2a2a4a',
    axisColor: '#4a4a7a',
    tickColor: '#8888bb',
    lineColor: '#4fc3f7',
    bullColor: '#26a69a',
    bearColor: '#ef5350',
    tooltipBg: '#16213e',
    tooltipText: '#e0e0ff',
  },
  light: {
    id: 'light',
    label: 'ライト',
    bg: '#fafafa',
    gridColor: '#e8e8e8',
    axisColor: '#cccccc',
    tickColor: '#666666',
    lineColor: '#1565c0',
    bullColor: '#2e7d32',
    bearColor: '#c62828',
    tooltipBg: '#ffffff',
    tooltipText: '#333333',
  },
  ocean: {
    id: 'ocean',
    label: 'オーシャン',
    bg: '#0d2137',
    gridColor: '#1a3a55',
    axisColor: '#1e5070',
    tickColor: '#5ba3c9',
    lineColor: '#00e5ff',
    bullColor: '#00bfa5',
    bearColor: '#ff6e40',
    tooltipBg: '#0a1929',
    tooltipText: '#b3e5fc',
  },
};
