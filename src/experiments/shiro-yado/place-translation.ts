import { PLACES, type PlaceId } from './hotel-data';
import type { PlaceText } from './place-i18n';
import type { Locale } from './i18n';
import { getRouteText } from './route-text';

type Translation = { name: string; shortName: string; typeLabel: string; capacity: string; amenities: string[]; description: string; summary: string; hours?: string };
export function translatePlaces(locale: Locale, copy: Record<PlaceId, Translation>): Record<PlaceId, PlaceText> {
  const result = {} as Record<PlaceId, PlaceText>;
  for (const id of Object.keys(PLACES) as PlaceId[]) {
    const place = PLACES[id];
    const text = copy[id];
    result[id] = { ...text, size: `${place.size.replace(/[^0-9.]/g, '')} m²`, ...getRouteText(locale, { ...place, ...text }) };
  }
  return result;
}
