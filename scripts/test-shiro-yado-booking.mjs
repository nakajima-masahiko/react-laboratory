import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const base = resolve('node_modules/.tmp');
mkdirSync(base, { recursive: true });
const output = mkdtempSync(join(base, 'shiro-booking-'));
writeFileSync(join(output, 'package.json'), '{"type":"module"}');
for (const name of ['model', 'storage', 'copy']) {
  const source = readFileSync(`src/experiments/shiro-yado/booking/${name}.ts`, 'utf8');
  const result = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } });
  writeFileSync(join(output, `${name}.js`), result.outputText.replace(/(from ['"])(\.[^'"]+)(['"])/g, '$1$2.js$3'));
}
after(() => rmSync(output, { recursive: true, force: true }));
const m = await import(pathToFileURL(join(output, 'model.js')));
const s = await import(pathToFileURL(join(output, 'storage.js')));
const { BOOKING_COPY } = await import(pathToFileURL(join(output, 'copy.js')));
const today = '2026-10-15';
const now = new Date('2026-10-15T01:00:00Z');
const ID1 = 'SY-20261015-1234ABCD', ID2 = 'SY-20261015-5678ABCD';
function memory() {
  const data = new Map();
  return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), data };
}
function openStay(roomId = 'room-201', count = 2) {
  for (let day = today; day <= m.bookingHorizon(today); day = m.addDays(day, 1)) {
    const stay = { checkIn: day, checkOut: m.addDays(day, count), guests: 2 };
    if (!m.roomAvailability(roomId, stay, [], today)) return stay;
  }
  throw new Error('No demo fixture availability');
}

test('Japan day rolls at UTC 15:00; month horizon clamps month-end and leap day', () => {
  assert.equal(m.japanToday(new Date('2026-10-14T14:59:59Z')), '2026-10-14');
  assert.equal(m.japanToday(new Date('2026-10-14T15:00:00Z')), '2026-10-15');
  assert.equal(m.bookingHorizon(today), '2026-11-15');
  assert.equal(m.bookingHorizon('2026-01-31'), '2026-02-28');
  assert.equal(m.bookingHorizon('2028-01-31'), '2028-02-29');
  assert.equal(m.bookingHorizon('2026-12-31'), '2027-01-31');
});
test('real dates, date order, one-month check-in and maximum seven nights are validated', () => {
  const stay = { checkIn: today, checkOut: '2026-10-16', guests: 2 };
  assert.equal(m.validateStay(stay, today), null);
  assert.equal(m.validateStay({ ...stay, checkIn: '2026-02-30' }, today), 'dates');
  assert.equal(m.validateStay({ ...stay, checkOut: '' }, today), 'dates');
  assert.equal(m.validateStay({ ...stay, checkIn: '2026-10-14' }, today), 'past');
  assert.equal(m.validateStay({ ...stay, checkIn: '2026-11-16', checkOut: '2026-11-17' }, today), 'window');
  assert.equal(m.validateStay({ ...stay, checkOut: today }, today), 'nights');
  assert.equal(m.validateStay({ ...stay, checkOut: m.addDays(today, 8) }, today), 'nights');
  assert.equal(m.validateStay({ ...stay, checkOut: m.addDays(today, 7) }, today), null);
  assert.equal(m.validateStay({ ...stay, checkIn: '2026-11-15', checkOut: '2026-11-22' }, today), null);
  for (const guests of [0, 5, 1.5, NaN]) assert.equal(m.validateStay({ ...stay, guests }, today), 'guests');
});
test('capacity and all nights of a stay are checked, not just arrival', () => {
  const stay = { ...openStay('room-205'), guests: 4 };
  assert.equal(m.roomAvailability('room-205', stay, [], today), null);
  assert.equal(m.roomAvailability('room-201', stay, [], today), 'capacity');
  let tested = false;
  for (let day = today; day < m.bookingHorizon(today); day = m.addDays(day, 1)) {
    if (!m.demoOccupied('room-201', day) && m.demoOccupied('room-201', m.addDays(day, 1))) {
      assert.equal(m.roomAvailability('room-201', { checkIn: day, checkOut: m.addDays(day, 2), guests: 2 }, [], today), 'unavailable');
      tested = true; break;
    }
  }
  assert.ok(tested);
});
test('checkout is exclusive', () => {
  const a = { checkIn: '2026-10-20', checkOut: '2026-10-22', guests: 2 };
  assert.equal(m.overlaps(a, { ...a, checkIn: '2026-10-22', checkOut: '2026-10-23' }), false);
  assert.equal(m.overlaps(a, { ...a, checkIn: '2026-10-21', checkOut: '2026-10-23' }), true);
  assert.equal(m.overlaps(a, { ...a, checkIn: '2026-10-19', checkOut: '2026-10-20' }), false);
});
test('confirmed totals are per room/night and duplicate confirmation is idempotent', () => {
  const storage = memory(), stay = openStay();
  const saved = s.createReservation(storage, 'room-201', stay, ID1, now);
  assert.ok(saved.reservation);
  assert.equal(saved.reservation.total, 24000);
  assert.equal(saved.reservation.nightlyRate, 12000);
  assert.deepEqual(s.createReservation(storage, 'room-201', stay, ID1, now), saved);
  assert.equal(m.parseReservations(storage.getItem(s.BOOKING_KEY)).length, 1);
});
test('confirmation re-reads latest bookings and cancellation restores availability', () => {
  const storage = memory(), stay = openStay();
  assert.ok(s.createReservation(storage, 'room-201', stay, ID1, now).reservation);
  assert.equal(s.createReservation(storage, 'room-201', stay, ID2, now).error, 'unavailable');
  assert.equal(s.cancelReservation(storage, ID1), null);
  assert.equal(m.parseReservations(storage.getItem(s.BOOKING_KEY))[0].status, 'cancelled');
  assert.ok(s.createReservation(storage, 'room-201', stay, ID2, now).reservation);
  assert.equal(m.parseReservations(storage.getItem(s.BOOKING_KEY)).length, 2);
});
test('expired, over-capacity, or non-room requests do not save a reservation', () => {
  const storage = memory(), stay = openStay();
  assert.equal(s.createReservation(storage, 'bath', stay, ID1, now).error, 'unavailable');
  assert.equal(s.createReservation(storage, 'room-201', { ...stay, guests: 4 }, ID1, now).error, 'capacity');
  assert.equal(s.createReservation(storage, 'room-201', stay, ID1, new Date('2027-01-01T00:00:00Z')).error, 'past');
  assert.equal(storage.getItem(s.BOOKING_KEY), null);
});
test('save/read failures never report success and corrupt data is not overwritten', () => {
  const stay = openStay();
  assert.equal(s.createReservation({ getItem() { throw Error('blocked'); }, setItem() {} }, 'room-201', stay, ID1, now).error, 'storage');
  assert.equal(s.createReservation({ getItem() { return null; }, setItem() { throw Error('quota'); } }, 'room-201', stay, ID1, now).error, 'storage');
  const storage = memory(); storage.setItem(s.BOOKING_KEY, 'corrupt');
  assert.equal(s.createReservation(storage, 'room-201', stay, ID1, now).error, 'storage');
  assert.equal(s.cancelReservation(storage, ID1), 'storage');
  assert.equal(storage.getItem(s.BOOKING_KEY), 'corrupt');
});
test('stored booking data rejects changed totals, invalid dates, duplicate IDs and invalid versions', () => {
  const storage = memory(), stay = openStay();
  const r = s.createReservation(storage, 'room-201', stay, ID1, now).reservation;
  const envelope = reservations => JSON.stringify({ version: 1, reservations });
  assert.throws(() => m.parseReservations(envelope([{ ...r, total: 1 }])));
  assert.throws(() => m.parseReservations(envelope([{ ...r, checkIn: 'not-a-date' }])));
  assert.throws(() => m.parseReservations(envelope([r, r])));
  assert.throws(() => m.parseReservations('{"version":2,"reservations":[]}'));
  assert.throws(() => m.parseReservations(envelope([{ ...r, guests: 4 }])));
});
test('every supported language includes reservation and error messages', () => {
  for (const locale of ['ja', 'en', 'fr', 'es', 'zh', 'ko']) {
    const copy = BOOKING_COPY[locale];
    assert.ok(copy.policy('2026-11-15').includes('2026-11-15'));
    assert.ok(copy.confirmAction && copy.cancelYes && copy.deviceNote);
    for (const key of ['dates', 'past', 'window', 'nights', 'guests', 'capacity', 'unavailable', 'storage']) assert.ok(copy.errors[key]);
  }
});
