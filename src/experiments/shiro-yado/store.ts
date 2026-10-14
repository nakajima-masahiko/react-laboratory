import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getPlace, type FloorId, type PlaceId } from './hotel-data';
import { LOCALES, type Locale } from './i18n';

type HotelState = {
  myRoomId: PlaceId | null;
  fromFloor: FloorId;
  fromPlaceId: PlaceId;
  locale: Locale;
  speechEnabled: boolean;
  setMyRoom: (id: PlaceId | null) => void;
  setHere: (floor: FloorId, placeId: PlaceId) => void;
  setLocale: (locale: Locale) => void;
  setSpeechEnabled: (enabled: boolean) => void;
};

export const useHotelStore = create<HotelState>()(
  persist(
    (set) => ({
      myRoomId: null,
      fromFloor: 1,
      fromPlaceId: 'lobby',
      locale: 'ja',
      speechEnabled: true,
      setMyRoom: (id) =>
        set({
          myRoomId: id,
        }),
      setHere: (floor, placeId) =>
        set({
          fromFloor: floor,
          fromPlaceId: placeId,
        }),
      setLocale: (locale) => set({ locale }),
      setSpeechEnabled: (speechEnabled) => set({ speechEnabled }),
    }),
    {
      name: 'shiro-yado-v2',
      skipHydration: true,
      merge: (persisted, current) => {
        if (!persisted || typeof persisted !== 'object') return current;
        const saved = persisted as Record<string, unknown>;
        const room = typeof saved.myRoomId === 'string' ? getPlace(saved.myRoomId) : undefined;
        const origin = typeof saved.fromPlaceId === 'string' ? getPlace(saved.fromPlaceId) : undefined;
        const locale = LOCALES.find((item) => item.id === saved.locale)?.id ?? current.locale;
        return { ...current, myRoomId: room?.kind === 'room' ? room.id : null,
          fromPlaceId: origin?.id ?? 'lobby', fromFloor: origin?.floor ?? 1, locale,
          speechEnabled: typeof saved.speechEnabled === 'boolean' ? saved.speechEnabled : current.speechEnabled };
      },
      partialize: (s) => ({
        myRoomId: s.myRoomId,
        fromFloor: s.fromFloor,
        fromPlaceId: s.fromPlaceId,
        locale: s.locale,
        speechEnabled: s.speechEnabled,
      }),
    },
  ),
);
