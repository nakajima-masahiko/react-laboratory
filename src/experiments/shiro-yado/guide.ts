import {
  getPlace,
  type FloorId,
  type Place,
  type PlaceId,
} from './hotel-data';

export type Here = {
  floor: FloorId;
  placeId: PlaceId;
};

export type GuideStep = {
  title: string;
  body: string;
};

export type Guide = {
  dest: Place;
  from: Place;
  summary: string;
  minutes: string;
  steps: GuideStep[];
  viaElevator: boolean;
};

const FLOOR_WALK: Record<FloorId, string> = {
  1: '1階ロビーから',
  2: '2階の廊下から',
  3: '3階のホールから',
};

function minutesBetween(from: Here, dest: Place): string {
  if (from.placeId === dest.id) return '到着済み';
  if (from.floor === dest.floor) return '徒歩 約1分';
  const hops = Math.abs(from.floor - dest.floor);
  return hops === 1 ? '徒歩 約2分' : '徒歩 約3分';
}

function walkOnSameFloor(from: Place, dest: Place): GuideStep {
  if (from.floor === 2 && dest.floor === 2) {
    return {
      title: '2階の廊下を進む',
      body: dest.fromElevator.replace('2階で降り、', '').replace('2階で降りて', ''),
    };
  }
  if (from.floor === 3 && dest.floor === 3) {
    const dir =
      dest.mapSide === 'right'
        ? 'ホールから右手へ進みます。'
        : dest.mapSide === 'left'
          ? 'ホールから左手へ進みます。'
          : 'ホールの正面へ進みます。';
    return {
      title: `${dest.shortName}へ`,
      body: `${dir}${dest.fromElevator.replace('3階で降り、', '').replace('3階で降りて', '')}`,
    };
  }
  return {
    title: `${dest.shortName}へ`,
    body: dest.fromElevator,
  };
}

export function buildGuide(from: Here, destId: PlaceId): Guide | null {
  const dest = getPlace(destId);
  const origin = getPlace(from.placeId);
  if (!dest || !origin) return null;

  if (from.placeId === dest.id) {
    return {
      dest,
      from: origin,
      summary: 'いまいる場所です',
      minutes: '到着済み',
      viaElevator: false,
      steps: [
        {
          title: `${dest.name}`,
          body: dest.description,
        },
      ],
    };
  }

  if (from.floor === dest.floor) {
    return {
      dest,
      from: origin,
      summary: dest.summary,
      minutes: minutesBetween(from, dest),
      viaElevator: false,
      steps: [
        {
          title: `${origin.shortName}を出る`,
          body: origin.toElevator.includes('エレベーター')
            ? origin.toElevator
            : `${origin.name}を出て、${FLOOR_WALK[from.floor]}移動します。`,
        },
        walkOnSameFloor(origin, dest),
        {
          title: '到着',
          body: dest.fromElevator,
        },
      ],
    };
  }

  const ride =
    dest.floor > from.floor
      ? `${dest.floor}階のボタンを押して上がります。`
      : `${dest.floor}階のボタンを押して降ります。`;

  return {
    dest,
    from: origin,
    summary: dest.summary,
    minutes: minutesBetween(from, dest),
    viaElevator: true,
    steps: [
      {
        title: `エレベーターへ`,
        body: origin.toElevator,
      },
      {
        title: `${dest.floor}階へ`,
        body: ride,
      },
      {
        title: `${dest.floor}階で降りる`,
        body: dest.fromElevator,
      },
    ],
  };
}
