import { localizePlace } from '../place-i18n';
import { useHotelStore } from '../store';
import { BOOKING_COPY, money } from './copy';
import { ROOM_OFFERS, type BookableRoomId } from './model';
import { JOURNEY } from './ux-copy';

export function RoomSummary({ roomId }: { roomId: BookableRoomId }) {
  const locale = useHotelStore(s => s.locale);
  const room = localizePlace(locale, roomId);
  const copy = BOOKING_COPY[locale];
  const beds = roomId === 'room-202' ? [110] : roomId === 'room-205' ? [55, 135, 215] : [80, 200];
  return <>
    <figure className="shiro-yado__room-illustration">
      <svg viewBox="0 0 360 180" aria-hidden="true" focusable="false">
        <rect className="room-wall" width="360" height="180" />
        <path className="room-floor" d="M0 125H360V180H0Z" />
        <rect className="room-window" x="265" y="20" width="65" height="80" rx="4" />
        <path className="room-line" d="M297 20V100M265 60H330" />
        {beds.map(x => <g key={x}>
          <rect className="room-wood" x={x - 5} y="67" width={roomId === 'room-202' ? 140 : 70} height="91" rx="6" />
          <rect className="room-bed" x={x} y="75" width={roomId === 'room-202' ? 130 : 60} height="73" rx="6" />
          <rect className="room-pillow" x={x + 6} y="80" width={roomId === 'room-202' ? 118 : 48} height="20" rx="5" />
          <path className="room-line" d={`M${x} 111h${roomId === 'room-202' ? 130 : 60}`} />
        </g>)}
        <circle className="room-wood" cx="28" cy="126" r="17" />
        <path className="room-line" d="M28 140V162" />
      </svg>
      <figcaption>{JOURNEY[locale].illustration}</figcaption>
    </figure>
    <p>{room.description}</p>
    <dl className="shiro-yado__booking-facts">
      <div><dt>{room.size}</dt><dd>{copy.capacity}: {ROOM_OFFERS[roomId].capacity}</dd></div>
      <div><dt>{copy.nightly}</dt><dd>{money(locale, ROOM_OFFERS[roomId].nightlyRate)}</dd></div>
    </dl>
  </>;
}
