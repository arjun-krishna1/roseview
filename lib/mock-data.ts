export type StayRecord = {
  guestId: string;
  guestName: string;
  property: string;
  location: string;
  dates: string;
  room: string;
  moments: string[];
  dining: string[];
  activities: string[];
  staffNotes: string[];
};

export type PreferenceProfile = {
  preferredRoomType: string;
  interests: string[];
  diningStyle: string;
  spendTier: string;
};

export type PackageOption = {
  id: string;
  name: string;
  property: string;
  focus: string;
  description: string;
};

export type AvailabilityOption = {
  dates: string;
  roomType: string;
  available: boolean;
  alternativeDates?: string;
};

export type LoyaltyAccount = {
  tier: string;
  pointsBalance: number;
  nextTierGap: number;
  benefits: string[];
  recentActivity: string[];
  redemptions: string[];
};

export type VoicePersona = {
  property: string;
  voiceId: string;
  voiceName: string;
  tone: string;
  knowledgeBase: string;
  publishedAt?: string;
};

export const stayRecord: StayRecord = {
  guestId: "guest_rosewood_001",
  guestName: "Amara Chen",
  property: "Rosewood Las Ventanas al Paraiso",
  location: "Los Cabos, Mexico",
  dates: "April 18-22, 2026",
  room: "Oceanview Rooftop Terrace Suite",
  moments: [
    "a golden-hour walk along the Sea of Cortez",
    "a surprise mezcal tasting arranged by the concierge",
    "breakfast on the suite terrace after sunrise yoga",
  ],
  dining: ["Arbol", "Sea Grill"],
  activities: ["sunrise yoga", "mezcal tasting", "private beach cabana"],
  staffNotes: [
    "Guest prefers unhurried recommendations and quiet outdoor seating.",
    "Guest mentioned an interest in culinary weekends and local craft traditions.",
  ],
};

export const preferenceProfile: PreferenceProfile = {
  preferredRoomType: "Oceanview suite with outdoor space",
  interests: ["culinary", "wellness", "local culture"],
  diningStyle: "Quiet outdoor dining with chef-led experiences",
  spendTier: "Signature suite guest",
};

export const packages: PackageOption[] = [
  {
    id: "pkg_culinary_return",
    name: "Baja Culinary Return",
    property: stayRecord.property,
    focus: "culinary",
    description:
      "A three-night return built around chef-led market visits, Arbol dining, and a private mezcal pairing.",
  },
  {
    id: "pkg_wellness_tide",
    name: "Tide and Stillness",
    property: stayRecord.property,
    focus: "wellness",
    description:
      "Morning movement, spa rituals, and quiet oceanfront cabana time designed for a slower return.",
  },
];

export const availability: AvailabilityOption[] = [
  {
    dates: "June 12-15, 2026",
    roomType: "Oceanview Rooftop Terrace Suite",
    available: true,
  },
  {
    dates: "July 3-6, 2026",
    roomType: "Oceanview Rooftop Terrace Suite",
    available: false,
    alternativeDates: "July 10-13, 2026",
  },
];

export const loyaltyAccount: LoyaltyAccount = {
  tier: "Black Diamond",
  pointsBalance: 84200,
  nextTierGap: 5800,
  benefits: [
    "priority suite upgrade when available",
    "daily breakfast for two",
    "late checkout priority",
    "property-specific welcome amenity",
  ],
  recentActivity: [
    "+18,400 points from the April Las Ventanas stay",
    "+2,500 culinary experience bonus",
    "-10,000 points for spa credit redemption",
  ],
  redemptions: [
    "complimentary night at select Rosewood properties",
    "spa credit for two",
    "private dining experience credit",
  ],
};

export const defaultPersona: VoicePersona = {
  property: stayRecord.property,
  voiceId: "voice_las_ventanas_warm",
  voiceName: "Marisol",
  tone:
    "Warm, unhurried, and quietly attentive. Speak with gracious specificity and avoid sales pressure.",
  knowledgeBase:
    "Las Ventanas emphasizes desert-meets-sea calm, Baja culinary traditions, artisan mezcal, sunrise wellness rituals, and private open-air spaces.",
  publishedAt: "2026-05-16T17:00:00.000Z",
};

export const voiceCatalog = [
  {
    id: "voice_las_ventanas_warm",
    name: "Marisol",
    description: "Warm, calm, and quietly luxurious.",
  },
  {
    id: "voice_formal_gracious",
    name: "Evelyn",
    description: "Formal, polished, and deeply gracious.",
  },
  {
    id: "voice_local_adventurous",
    name: "Mateo",
    description: "Relaxed, local, and experience-forward.",
  },
];
