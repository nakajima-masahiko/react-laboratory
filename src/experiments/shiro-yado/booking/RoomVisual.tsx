import { useHotelStore } from '../store';
import type { BookableRoomId } from './model';
import { getRoomInterior } from './room-interiors';

export function RoomVisual({ roomId }: { roomId: BookableRoomId }) {
  const locale = useHotelStore(s => s.locale);
  const interior = getRoomInterior(locale, roomId);
  return <figure className="shiro-yado__room-illustration shiro-yado__room-interior">
    <img src={`${import.meta.env.BASE_URL}shiro-yado/${interior.src}`} alt={interior.alt} width="1536" height="1024" loading="lazy" decoding="async" />
    <figcaption>{interior.caption}</figcaption>
  </figure>;
}
