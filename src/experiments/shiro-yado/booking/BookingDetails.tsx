import { localizePlace } from '../place-i18n';
import { useHotelStore } from '../store';
import { BOOKING_COPY, money } from './copy';
import { stayDate } from './ux-copy';
import { nights, type BookableRoomId, type Stay } from './model';

export function BookingDetails({ roomId, stay, nightlyRate, total }: {
  roomId: BookableRoomId; stay: Stay; nightlyRate: number; total: number;
}) {
  const locale = useHotelStore((s) => s.locale);
  const copy = BOOKING_COPY[locale];
  return <dl className="shiro-yado__booking-facts">
    <div><dt>{copy.room}</dt><dd>{localizePlace(locale, roomId).name}</dd></div>
    <div><dt>{copy.checkIn}</dt><dd><time dateTime={stay.checkIn}>{stayDate(locale, stay.checkIn)}</time></dd></div>
    <div><dt>{copy.checkOut}</dt><dd><time dateTime={stay.checkOut}>{stayDate(locale, stay.checkOut)}</time></dd></div>
    <div><dt>{copy.guests}</dt><dd>{stay.guests}</dd></div>
    <div><dt>{copy.nights}</dt><dd>{nights(stay)}</dd></div>
    <div><dt>{copy.nightly}</dt><dd>{money(locale, nightlyRate)}</dd></div>
    <div className="shiro-yado__booking-total"><dt>{copy.total}</dt><dd>{money(locale, total)}</dd></div>
  </dl>;
}
