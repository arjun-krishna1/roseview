import {
  availability,
  loyaltyAccount,
  packages,
  preferenceProfile,
  stayRecord,
} from "@/lib/mock-data";

type AvailabilityParams = {
  dates?: string;
  roomType?: string;
};

type FeedbackParams = {
  sentiment?: string;
  topic?: string;
  summary?: string;
};

type ConciergeParams = {
  dates?: string;
  property?: string;
  roomType?: string;
  summary?: string;
};

type ToolCallbacks = {
  onDataRetrieved?: (label: string) => void;
};

const normalize = (value: string | undefined) => value?.trim().toLowerCase() ?? "";

const asToolResult = (value: unknown) => JSON.stringify(value);

export const createSentinelClientTools = ({ onDataRetrieved }: ToolCallbacks = {}) => ({
  getMostRecentStay: () => {
    onDataRetrieved?.("Most recent stay record");
    return asToolResult({
      source: "mock-pms-crm",
      stayRecord,
      instruction:
        "Use only these stay details when reminiscing. If the guest asks beyond this record, acknowledge the gap.",
    });
  },

  getPreferenceProfile: () => {
    onDataRetrieved?.("Preference profile");
    return asToolResult({
      source: "mock-crm-preferences",
      profile: preferenceProfile,
    });
  },

  getPropertyPackages: () => {
    onDataRetrieved?.("Property packages");
    return asToolResult({
      source: "mock-property-packages",
      packages,
    });
  },

  lookupAvailability: ({ dates, roomType }: AvailabilityParams = {}) => {
    onDataRetrieved?.("Reservation availability");
    const requestedDates = normalize(dates);
    const requestedRoom = normalize(roomType);
    const result =
      availability.find((option) => {
        const datesMatch = !requestedDates || option.dates.toLowerCase().includes(requestedDates);
        const roomMatch = !requestedRoom || option.roomType.toLowerCase().includes(requestedRoom);
        return datesMatch && roomMatch;
      }) ?? availability[0];

    return asToolResult({
      source: "mock-reservation-system",
      request: {
        dates: dates || "not specified",
        roomType: roomType || preferenceProfile.preferredRoomType,
      },
      result,
      bookingDeepLink: `/reservations?property=${encodeURIComponent(
        stayRecord.property,
      )}&dates=${encodeURIComponent(result.dates)}&room=${encodeURIComponent(result.roomType)}`,
    });
  },

  getLoyaltySummary: () => {
    onDataRetrieved?.("Loyalty account");
    return asToolResult({
      source: "mock-loyalty-system",
      account: loyaltyAccount,
      context:
        "Contextualize the points balance instead of reading it as a raw number only.",
    });
  },

  logGuestFeedback: ({ sentiment, topic, summary }: FeedbackParams = {}) => {
    onDataRetrieved?.("CRM follow-up ticket");
    return asToolResult({
      source: "mock-crm-follow-up",
      created: true,
      followUpId: `crm_${Date.now()}`,
      sentiment: sentiment || "negative",
      topic: topic || "unspecified stay experience",
      summary: summary || "Guest feedback captured from Sentinel voice session.",
    });
  },

  requestHumanConcierge: ({ dates, property, roomType, summary }: ConciergeParams = {}) => {
    onDataRetrieved?.("Human concierge request");
    return asToolResult({
      source: "mock-human-concierge",
      created: true,
      requestId: `concierge_${Date.now()}`,
      property: property || stayRecord.property,
      dates: dates || "guest did not specify dates",
      roomType: roomType || preferenceProfile.preferredRoomType,
      summary: summary || "Guest requested human help from Sentinel.",
    });
  },
});

export const sentinelClientTools = createSentinelClientTools();

export type SentinelClientTools = typeof sentinelClientTools;
