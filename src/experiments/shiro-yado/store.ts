import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FloorId, PlaceId } from './hotel-data';
import type { Locale } from './i18n';

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
          fromFloor: 1,
          fromPlaceId: 'lobby',
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
