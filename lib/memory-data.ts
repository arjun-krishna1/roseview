export type AmenityKind = "stay" | "dining" | "wellness" | "adventure" | "culture";

export type MemoryAmenity = {
  id: string;
  name: string;
  kind: AmenityKind;
  distance: string;
  description: string;
  prompt: string;
  x: number;
  y: number;
};

export type MemoryPrompt = {
  id: string;
  title: string;
  body: string;
};

export type MemoryConversationTurn = {
  id: string;
  speaker: "roseview" | "guest";
  text: string;
};

export type MemoryClip = {
  id: string;
  title: string;
  prompt: string;
  amenityId: string;
  amenityName: string;
  capturedAt: string;
  durationLabel: string;
  conversation: MemoryConversationTurn[];
  mimeType?: string;
  url?: string;
};

export const trip = {
  guestName: "Amara",
  property: "Roseview Las Ventanas",
  location: "Los Cabos",
  dates: "April 18-22",
  tagline: "A sense of place, remembered in motion.",
};

export const memoryPrompts: MemoryPrompt[] = [
  {
    id: "arrival",
    title: "First impression",
    body: "Capture the first detail that made the property feel different.",
  },
  {
    id: "sound",
    title: "Sound of the stay",
    body: "Record ten seconds of the waves, a dinner toast, or the courtyard at dusk.",
  },
  {
    id: "ritual",
    title: "A small ritual",
    body: "Save the little moment you want to bring home with you.",
  },
];

export const amenities: MemoryAmenity[] = [
  {
    id: "arrival-court",
    name: "Arrival Court",
    kind: "stay",
    distance: "Here",
    description: "The first view of palms, lanterns, and the open-air welcome.",
    prompt: "Record your first sense of arrival before the day begins to blur.",
    x: 34,
    y: 28,
  },
  {
    id: "sea-grill",
    name: "Sea Grill",
    kind: "dining",
    distance: "3 min walk",
    description: "Barefoot lunch, charcoal smoke, and the water just beyond the table.",
    prompt: "Capture a toast, a favorite plate, or the light moving over lunch.",
    x: 64,
    y: 58,
  },
  {
    id: "spa-garden",
    name: "Spa Garden",
    kind: "wellness",
    distance: "5 min walk",
    description: "A quiet garden path for treatments, stillness, and post-spa tea.",
    prompt: "Record the ritual before or after your treatment, without rushing it.",
    x: 26,
    y: 62,
  },
  {
    id: "beach-club",
    name: "Beach Club",
    kind: "adventure",
    distance: "6 min walk",
    description: "Golden-hour cabanas, surf line, and the clearest view of the horizon.",
    prompt: "Record the sunset from the beach club as your reel's closing memory.",
    x: 76,
    y: 35,
  },
  {
    id: "artisan-walk",
    name: "Artisan Walk",
    kind: "culture",
    distance: "12 min drive",
    description: "Local ceramics, woven textures, and conversations with makers nearby.",
    prompt: "Capture a texture, color, or craft detail you want to remember.",
    x: 52,
    y: 17,
  },
];

export const defaultAmenity = amenities[0];
