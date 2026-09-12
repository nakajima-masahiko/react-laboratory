import type { FloorId, PlaceId } from './hotel-data';

type Props = {
  floor: FloorId;
  highlight?: PlaceId | null;
  here?: PlaceId | null;
};

function cellClass(active: boolean, here: boolean) {
  if (active) return 'shiro-yado__cell shiro-yado__cell--active';
  if (here) return 'shiro-yado__cell shiro-yado__cell--here';
  return 'shiro-yado__cell';
}

function Label({
  id,
  name,
  highlight,
  here,
}: {
  id: PlaceId;
  name: string;
  highlight?: PlaceId | null;
  here?: PlaceId | null;
}) {
  return (
    <div className={cellClass(highlight === id, here === id)}>
      {name}
      {here === id && highlight !== id ? <span className="shiro-yado__dot" /> : null}
    </div>
  );
}

export function FloorPlan({ floor, highlight, here }: Props) {
  if (floor === 1) {
    return (
      <div className="shiro-yado__plan">
        <div className="shiro-yado__plan-row shiro-yado__plan-row--3">
          <Label id="lobby" name="フロント" highlight={highlight} here={here} />
          <Label id="lobby" name="ロビー" highlight={highlight} here={here} />
          <div className="shiro-yado__cell shiro-yado__cell--muted">EV</div>
        </div>
      </div>
    );
  }

  if (floor === 2) {
    return (
      <div className="shiro-yado__plan">
        <div className="shiro-yado__cell shiro-yado__cell--muted">廊下 / EV</div>
        <div className="shiro-yado__plan-row shiro-yado__plan-row--5">
          <Label id="room-201" name="201" highlight={highlight} here={here} />
          <Label id="room-202" name="202" highlight={highlight} here={here} />
          <Label id="room-203" name="203" highlight={highlight} here={here} />
          <Label id="room-204" name="204" highlight={highlight} here={here} />
          <Label id="room-205" name="205" highlight={highlight} here={here} />
        </div>
      </div>
    );
  }

  return (
    <div className="shiro-yado__plan">
      <div className="shiro-yado__plan-row shiro-yado__plan-row--3">
        <Label id="bath" name="浴場" highlight={highlight} here={here} />
        <div className="shiro-yado__plan">
          <div className="shiro-yado__cell shiro-yado__cell--muted shiro-yado__cell--short">EV</div>
          <Label id="restroom" name="トイレ" highlight={highlight} here={here} />
        </div>
        <Label id="banquet" name="宴会場" highlight={highlight} here={here} />
      </div>
    </div>
  );
}
