import { defaultPersona, type VoicePersona } from "@/lib/mock-data";

const SESSION_KEY = "sentinel.session";
const PERSONA_KEY = "sentinel.persona";
const DRAFT_PERSONA_KEY = "sentinel.personaDraft";

export type ActiveAgent = "Memory Curator" | "Concierge" | "Loyalty";

export type SessionEvent = {
  id: string;
  at: string;
  speaker: "guest" | "agent" | "system";
  text: string;
};

export type SentinelSession = {
  conversationId?: string;
  activeAgent: ActiveAgent;
  startedAt?: string;
  endedAt?: string;
  lastActivityAt?: string;
  events: SessionEvent[];
  retrievedData: string[];
};

export const createEmptySession = (): SentinelSession => ({
  activeAgent: "Memory Curator",
  events: [],
  retrievedData: [],
});

const readJson = <T>(key: string, fallback: T): T => {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const stored = window.localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = <T>(key: string, value: T) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
};

export const loadSession = () => readJson<SentinelSession>(SESSION_KEY, createEmptySession());

export const saveSession = (session: SentinelSession) => writeJson(SESSION_KEY, session);

export const clearSession = () => {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(SESSION_KEY);
  }
};

export const loadPublishedPersona = () => readJson<VoicePersona>(PERSONA_KEY, defaultPersona);

export const savePublishedPersona = (persona: VoicePersona) => writeJson(PERSONA_KEY, persona);

export const loadDraftPersona = () => readJson<VoicePersona>(DRAFT_PERSONA_KEY, loadPublishedPersona());

export const saveDraftPersona = (persona: VoicePersona) => writeJson(DRAFT_PERSONA_KEY, persona);
