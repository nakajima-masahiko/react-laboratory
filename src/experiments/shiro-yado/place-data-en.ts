import type { PlaceId } from './hotel-data';

type PlaceText = {
  name: string;
  shortName: string;
  typeLabel: string;
  size: string;
  capacity: string;
  amenities: string[];
  description: string;
  summary: string;
  fromElevator: string;
  toElevator: string;
  hours?: string;
};

export const PLACE_EN: Record<PlaceId, PlaceText> = {
  lobby: {
    name: 'Front desk & lobby',
    shortName: 'Lobby',
    typeLabel: '1F',
    size: 'approx. 48 m²',
    capacity: '8 waiting seats',
    amenities: ['Front desk', 'Lounge sofas', 'Elevator hall'],
    description: 'White walls and a light-wood counter welcome you for check-in and check-out. The elevator hall is at the far end.',
    summary: 'Center of the 1st floor, just inside the entrance',
    fromElevator: 'Exit the elevator: the lobby is ahead, the front desk on your left.',
    toElevator: 'Past the sofas, head to the elevator hall on the right.',
    hours: 'Front desk 7:00–22:00',
  },
  'room-201': {
    name: '201 Standard Twin',
    shortName: '201',
    typeLabel: 'Standard Twin',
    size: '24 m²',
    capacity: '2 guests',
    amenities: ['2 single beds', 'Unit bath', 'Desk', '32-inch TV'],
    description: 'White walls with a light-wood headboard. A standard twin for a relaxed stay for two.',
    summary: 'First room on the left of the 2nd-floor corridor',
    fromElevator: 'On 2F, walk left along the corridor—the first door.',
    toElevator: 'Exit the room and turn right. The elevators are at the end of the corridor.',
  },
  'room-202': {
    name: '202 Standard Double',
    shortName: '202',
    typeLabel: 'Standard Double',
    size: '24 m²',
    capacity: '2 guests',
    amenities: ['Double bed', 'Unit bath', 'Desk', '32-inch TV'],
    description: 'A quiet room centered on a 160 cm double bed with white linens.',
    summary: 'Second room on the left of the 2nd-floor corridor',
    fromElevator: 'On 2F, walk left—the second door.',
    toElevator: 'Exit and turn right. The elevator hall is just ahead.',
  },
  'room-203': {
    name: '203 Deluxe Twin',
    shortName: '203',
    typeLabel: 'Deluxe Twin',
    size: '32 m²',
    capacity: '2 guests',
    amenities: ['2 semi-double beds', 'Sofa', 'Large desk', '40-inch TV'],
    description: 'A larger twin with sofa and desk—good for work or a longer stay.',
    summary: 'Center of the 2nd-floor corridor',
    fromElevator: 'On 2F, walk left. The middle door is room 203.',
    toElevator: 'Exit and turn right back toward the hall.',
  },
  'room-204': {
    name: '204 Corner Twin',
    shortName: '204',
    typeLabel: 'Corner Twin',
    size: '36 m²',
    capacity: '2 guests',
    amenities: ['2 semi-double beds', 'Corner windows', 'Lounge chair', '40-inch TV'],
    description: 'A corner room with large dual-aspect windows for morning light and city views.',
    summary: 'Far end of the 2nd-floor corridor, corner room',
    fromElevator: 'On 2F, walk all the way left to the end of the corridor.',
    toElevator: 'Exit and turn right back to the elevators.',
  },
  'room-205': {
    name: '205 Family Room',
    shortName: '205',
    typeLabel: 'Family Room',
    size: '42 m²',
    capacity: '4 guests',
    amenities: ['2 single beds', 'Sofa bed', 'Dining table', 'Bathtub'],
    description: 'A spacious room for families or groups—gather around the table.',
    summary: 'Right side of the 2nd-floor corridor, beside the elevators',
    fromElevator: 'On 2F, turn right immediately—the door next to the elevators.',
    toElevator: 'Exit and turn left—the elevator hall is right there.',
  },
  banquet: {
    name: 'Banquet hall · White Hall',
    shortName: 'Banquet',
    typeLabel: 'Banquet hall',
    size: '80 m²',
    capacity: '40 seated',
    amenities: ['Long tables', 'Screen', 'Anteroom', 'Accessible'],
    description: 'A small banquet room of white walls and wood floors for meals, meetings, and celebrations.',
    summary: 'Right side of the 3rd floor',
    fromElevator: 'On 3F, the large door on your right is White Hall.',
    toElevator: 'Exit the door and turn left. The elevator hall is nearby.',
    hours: '10:00–22:00 (reservation required)',
  },
  bath: {
    name: 'Bathhouse · Shiromiyu',
    shortName: 'Baths',
    typeLabel: 'Public bath',
    size: '36 m²',
    capacity: '8 at a time',
    amenities: ['Indoor bath', 'Washing area', 'Rest benches', 'Amenities'],
    description: 'An indoor bath of white stone and wood lattice—a quiet place to soak.',
    summary: 'Left side of the 3rd floor',
    fromElevator: 'On 3F, the noren curtain on your left marks Shiromiyu.',
    toElevator: 'Exit the entrance and turn right. Elevators are ahead.',
    hours: '15:00–24:00 / 6:00–10:00',
  },
  restroom: {
    name: 'Restrooms',
    shortName: 'WC',
    typeLabel: 'Gendered + accessible',
    size: '12 m²',
    capacity: 'Men, women + accessible',
    amenities: ["Men's", "Women's", 'Accessible toilet', 'Washbasins'],
    description: "Facing the 3F elevator hall: separate men's and women's, plus a wheelchair-accessible toilet.",
    summary: 'Center of the 3rd floor, in front of the elevators',
    fromElevator: 'On 3F, straight ahead: women left, men right, accessible in the center.',
    toElevator: 'A few steps from the door back to the elevator hall.',
    hours: '24 hours',
  },
};
