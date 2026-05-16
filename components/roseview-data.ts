export type Amenity = {
  id: string;
  name: string;
  kind: string;
  image: string;
  description: string;
  prompts: string[];
  location?: string;
  duration?: string;
  distance?: string;
  palette?: string;
};

export type MemoryAnswer = {
  q: string;
  a: string;
};

export type Memory = {
  id: string;
  amenityId?: string;
  title: string;
  when: string;
  duration: string;
  image: string;
  answers: MemoryAnswer[];
};

export type CaptureSession = {
  item: Amenity | null;
  answers: MemoryAnswer[];
};

export const hotel = {
  name: "Rosewood Sand Hill",
  tagline: "Sand Hill Road, Menlo Park",
  guest: "Grace",
  stayDay: 3,
  stayLength: 5,
  date: "Friday, 16 May",
};

export const amenities: Amenity[] = [
  {
    id: "vineyard",
    name: "The Vineyard at Dusk",
    kind: "On property",
    location: "South terraces",
    duration: "45 min",
    image: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=900&auto=format&fit=crop&q=80",
    palette: "#7E8E70",
    description: "Walk the rows of Sangiovese as the light goes long. Our vintner pours from the cellar barrel.",
    prompts: [
      "Who are you walking with this evening?",
      "What does the air smell like out here?",
      "What is a word for the light right now?",
    ],
  },
  {
    id: "spa",
    name: "Acqua di Pietra",
    kind: "Wellness",
    location: "Lower garden",
    duration: "90 min",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=900&auto=format&fit=crop&q=80",
    palette: "#8B7F6B",
    description: "Mineral baths cut into the volcanic stone, kept at body temperature year-round.",
    prompts: ["What were you holding onto before you stepped in?", "What does your body feel like now?"],
  },
  {
    id: "dining",
    name: "Dinner at Caruso",
    kind: "Dining",
    location: "Main villa",
    duration: "2 hr",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&auto=format&fit=crop&q=80",
    palette: "#B4546A",
    description: "Six courses from chef Lorenza. Garden-led, with wines paired by Mario.",
    prompts: [
      "Who are you sharing this table with?",
      "What course are you remembering most?",
      "What did you say to each other before the second pour?",
    ],
  },
  {
    id: "pool",
    name: "The Infinity",
    kind: "On property",
    location: "Cypress terrace",
    duration: "Open all day",
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=900&auto=format&fit=crop&q=80",
    palette: "#7E8E70",
    description: "A long mirror of water set against the valley, with stone loungers under the cypress.",
    prompts: ["What does the light feel like on your face?", "Who is here with you?"],
  },
  {
    id: "library",
    name: "The Reading Room",
    kind: "Quiet rooms",
    location: "West wing",
    duration: "Whenever",
    image: "https://images.unsplash.com/photo-1481277542470-605612bd2d61?w=900&auto=format&fit=crop&q=80",
    palette: "#B89968",
    description: "First editions, old maps, a fireplace that is always lit by 6. Bring nothing.",
    prompts: ["What book did you pick up?", "What are you thinking about that you cannot quite name?"],
  },
];

export const nearby: Amenity[] = [
  {
    id: "village",
    name: "Pienza at Market Morning",
    kind: "Nearby",
    distance: "12 min drive",
    image: "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=900&auto=format&fit=crop&q=80",
    description: "The pecorino market opens at seven. We send a car at six-thirty if you ask.",
    prompts: ["Who is the first vendor that pulled you in?", "What did you taste that you will bring home?"],
  },
  {
    id: "hot-springs",
    name: "Bagno Vignoni",
    kind: "Nearby",
    distance: "25 min drive",
    image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=900&auto=format&fit=crop&q=80",
    description: "A 16th-century thermal square. Locals soak at dawn before the heat returns.",
    prompts: ["What time of day did you arrive?", "What surprised you about the water?"],
  },
  {
    id: "monastery",
    name: "Sant'Antimo",
    kind: "Nearby",
    distance: "30 min drive",
    image: "https://images.unsplash.com/photo-1499678329028-101435549a4e?w=900&auto=format&fit=crop&q=80",
    description: "The monks sing Gregorian vespers at 7. The acoustics are why people stay quiet for hours after.",
    prompts: ["What did the singing make you feel?", "Who came with you?"],
  },
];

export const initialMemories: Memory[] = [
  {
    id: "m1",
    amenityId: "pool",
    title: "Morning at The Infinity",
    when: "Day 1 - 8:14 am",
    duration: "0:14",
    image: "/photos/family-5.webp",
    answers: [
      { q: "Who is here with you?", a: "Just me. Lina is still asleep upstairs." },
      { q: "What does the light feel like?", a: "Warm on the left side of my face. The water is colder than I thought." },
    ],
  },
  {
    id: "m2",
    amenityId: "dining",
    title: "Caruso, second course",
    when: "Day 2 - 9:32 pm",
    duration: "0:22",
    image: "/photos/family-2.webp",
    answers: [
      { q: "Who are you sharing the table with?", a: "Lina, and the couple from Milan we met at the pool." },
      { q: "What course will you remember?", a: "The pici with rabbit. Lorenza came out and sat with us for the next pour." },
    ],
  },
  {
    id: "m3",
    amenityId: "village",
    title: "Pienza, Saturday",
    when: "Day 3 - 9:48 am",
    duration: "0:18",
    image: "/photos/family-3.webp",
    answers: [{ q: "Who pulled you in first?", a: "An old man selling pecorino wrapped in walnut leaves. He let us taste five." }],
  },
  {
    id: "m4",
    amenityId: "dining",
    title: "Caruso, after the cheese course",
    when: "Day 2 - 10:48 pm",
    duration: "0:16",
    image: "/photos/family-4.webp",
    answers: [
      { q: "Who are you sharing the table with?", a: "All four of us. The kids stayed up." },
      { q: "What will you remember about tonight?", a: "Mario kept refilling Mark's glass and the kids started laughing too hard to eat." },
    ],
  },
];

export const todayPrompts = [
  {
    id: "tp1",
    time: "6:30 pm",
    amenityId: "vineyard",
    detail: "Your walk begins in 2 hours. Roseview will be here.",
  },
  {
    id: "tp2",
    time: "8:15 pm",
    amenityId: "dining",
    detail: "Table for two on the terrace.",
  },
];

export type PastStay = {
  id: string;
  property: string;
  city: string;
  occasion: string;
  date: string;
  anchor: string;
  image?: string;
};

export type OpenThread = {
  id: string;
  fromProperty: string;
  line: string;
};

export type AppliedPreference = {
  id: string;
  label: string;
  time: string;
  detail: string;
};

export type GuestProfile = {
  name: string;
  partner: string;
  loyaltyTier: string;
  totalStays: number;
  properties: number;
  lastSeen: PastStay;
  pastStays: PastStay[];
  appliedToday: AppliedPreference[];
  openThreads: OpenThread[];
  anniversary: {
    date: string;
    yearsNext: number;
    anchor: string;
  };
};

export const guestProfile: GuestProfile = {
  name: "Grace",
  partner: "Mark",
  loyaltyTier: "Rosewood Élevé",
  totalStays: 11,
  properties: 5,
  lastSeen: {
    id: "crillon-2023",
    property: "Hôtel de Crillon",
    city: "Paris",
    occasion: "Long weekend",
    date: "October 2023",
    anchor: "Mark hasn't let us forget the Cohíba night in the courtyard.",
    image: "/photos/family-1-thumb.webp",
  },
  pastStays: [
    {
      id: "phuket-2024",
      property: "Rosewood Phuket",
      city: "Phuket",
      occasion: "10th anniversary",
      date: "February 2024",
      anchor: "Ta Khai still asks about you and Mark.",
    },
    {
      id: "madrid-2024",
      property: "Villa Magna",
      city: "Madrid",
      occasion: "Mark's 45th",
      date: "March 2024",
      anchor: "Amós, suckling lamb, Café Central until two.",
    },
    {
      id: "crillon-2023",
      property: "Hôtel de Crillon",
      city: "Paris",
      occasion: "Long weekend",
      date: "October 2023",
      anchor: "Cohíba Robustos, courtyard, an Armagnac to follow.",
    },
    {
      id: "mansion-2023",
      property: "Mansion on Turtle Creek",
      city: "Dallas",
      occasion: "A weekend in",
      date: "May 2023",
      anchor: "One martini at the Mansion Bar was too short.",
    },
  ],
  appliedToday: [
    {
      id: "spa-mid-day",
      label: "Asaya stones held",
      time: "1:30 pm",
      detail: "Eucalyptus, the way you like them.",
    },
  ],
  openThreads: [
    {
      id: "phang-nga",
      fromProperty: "Phuket",
      line: "Phang Nga longtail — still on the table whenever you want it.",
    },
    {
      id: "reims",
      fromProperty: "Paris",
      line: "A Reims day from the Crillon — we owe you that one.",
    },
  ],
  anniversary: {
    date: "14 February",
    yearsNext: 12,
    anchor: "Ta Khai remembers. There's no decision to make today.",
  },
};
