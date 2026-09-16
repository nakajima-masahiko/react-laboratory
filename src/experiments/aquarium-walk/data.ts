export type TankTheme = 'coral' | 'temperate' | 'ocean' | 'deep' | 'tropical' | 'jelly';

export interface TankDefinition {
  id: TankTheme;
  side: -1 | 1;
  z: number;
  title: string;
  subtitle: string;
  texture: string;
  light: string;
}

const asset = (name: string) => `${import.meta.env.BASE_URL}aquarium-walk/${name}`;

export const tanks: TankDefinition[] = [
  { id: 'coral', side: -1, z: 12, title: '珊瑚礁', subtitle: 'CORAL REEF', texture: asset('coral-reef.webp'), light: '#5dd9ff' },
  { id: 'temperate', side: 1, z: 12, title: '日本の岩礁', subtitle: 'TEMPERATE REEF', texture: asset('temperate-reef.webp'), light: '#74c9c7' },
  { id: 'ocean', side: -1, z: 0, title: '外洋', subtitle: 'OPEN OCEAN', texture: asset('open-ocean.webp'), light: '#3f9fff' },
  { id: 'deep', side: 1, z: 0, title: '深海', subtitle: 'DEEP SEA', texture: asset('deep-sea.webp'), light: '#2d5dba' },
  { id: 'tropical', side: -1, z: -12, title: '大海原', subtitle: 'TROPICAL OCEAN', texture: asset('tropical-ocean.webp'), light: '#47b8ff' },
  { id: 'jelly', side: 1, z: -12, title: '海月', subtitle: 'JELLYFISH', texture: asset('jellyfish.webp'), light: '#737dff' },
];
