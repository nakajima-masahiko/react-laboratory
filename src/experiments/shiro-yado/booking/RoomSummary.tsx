import { localizePlace } from '../place-i18n';
import { useHotelStore } from '../store';
import { BOOKING_COPY, money } from './copy';
import { ROOM_OFFERS, type BookableRoomId } from './model';
import { RoomVisual } from './RoomVisual';
import { INTERIOR } from './interior-copy';

export function RoomSummary({ roomId }: { roomId: BookableRoomId }) {
  const locale = useHotelStore(s => s.locale);
  const room = localizePlace(locale, roomId);
  const copy = BOOKING_COPY[locale];
  return <>
    <RoomVisual roomId={roomId} />
    <p>{roomId === 'room-204' ? INTERIOR[locale].lead : room.description}</p>
    <dl className="shiro-yado__booking-facts">
      <div><dt>{room.size}</dt><dd>{copy.capacity}: {ROOM_OFFERS[roomId].capacity}</dd></div>
      <div><dt>{copy.nightly}</dt><dd>{money(locale, ROOM_OFFERS[roomId].nightlyRate)}</dd></div>
    </dl>
  </>;
}
