import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FloorId, PlaceId } from './hotel-data';

type HotelState = {
  myRoomId: PlaceId | null;
  fromFloor: FloorId;
  fromPlaceId: PlaceId;
  setMyRoom: (id: PlaceId | null) => void;
  setHere: (floor: FloorId, placeId: PlaceId) => void;
};

export const useHotelStore = create<HotelState>()(
  persist(
    (set) => ({
      myRoomId: null,
      fromFloor: 1,
      fromPlaceId: 'lobby',
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
    }),
    {
      name: 'shiro-yado-v1',
      skipHydration: true,
      partialize: (s) => ({
        myRoomId: s.myRoomId,
        fromFloor: s.fromFloor,
        fromPlaceId: s.fromPlaceId,
      }),
    },
  ),
);
