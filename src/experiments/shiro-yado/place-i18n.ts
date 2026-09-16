import type { Locale } from './i18n';
import type { Place, PlaceId } from './hotel-data';
import { PLACES } from './hotel-data';

export type PlaceText = {
  name: string;
  shortName: string;
  typeLabel: string;
  size: string;
  capacity: string;
  amenities: string[];
  description: string;
  summary: string;
  fromElevator: string;
  toElevator: string;
  hours?: string;
};

// Temporary stub — full translations applied in follow-up if needed
import { PLACEHOLDER } from './hotel-data';
