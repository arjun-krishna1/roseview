"use client";

import {
  ConversationProvider,
  useConversationControls,
  useConversationMode,
  useConversationStatus,
} from "@elevenlabs/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { stayRecord } from "@/lib/mock-data";
import { createSentinelClientTools } from "@/lib/sentinel-tools";
import {
  createEmptySession,
  loadSession,
  saveSession,
  type ActiveAgent,
  type SentinelSession,
  type SessionEvent,
} from "@/lib/session-store";

const INACTIVITY_LIMIT_MS = 5 * 60 * 1000;

const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;

const getMessageText = (message: unknown) => {
  if (typeof message === "string") {
    return message;
  }

  if (message && typeof message === "object") {
    const record = message as Record<string, unknown>;
    const text =
      record.message ??
      record.text ??
      record.transcript ??
      record.content ??
      record.displayText;

    return typeof text === "string" ? text : JSON.stringify(message);
  }

  return "";
};

const getMessageSpeaker = (message: unknown): SessionEvent["speaker"] => {
  if (!message || typeof message !== "object") {
    return "system";
  }

  const record = message as Record<string, unknown>;
  const source = String(record.source ?? record.role ?? "").toLowerCase();

  if (source.includes("user")) {
    return "guest";
  }

  if (source.includes("agent") || source.includes("ai")) {
    return "agent";
  }

  return "system";
};

const inferActiveAgent = (text: string): ActiveAgent => {
  const normalized = text.toLowerCase();

  if (/(point|loyalty|tier|benefit|redeem|redemption)/.test(normalized)) {
    return "Loyalty";
  }

  if (/(book|booking|availability|available|return|package|date|suite|room)/.test(normalized)) {
    return "Concierge";
  }

  return "Memory Curator";
};

type VoiceWidgetBodyProps = {
  session: SentinelSession;
  onSessionChange: (updater: (session: SentinelSession) => SentinelSession) => void;
  onActivity: () => void;
};

function VoiceWidgetBody({ session, onSessionChange, onActivity }: VoiceWidgetBodyProps) {
  const { startSession, endSession, sendContextualUpdate, sendUserActivity } =
    useConversationControls();
  const { status, message } = useConversationStatus();
  const { mode, isListening, isSpeaking } = useConversationMode();
  const [permissionState, setPermissionState] = useState<PermissionState | "unsupported" | "idle">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  const isConnected = status === "connected";
  const displayState = isSpeaking
    ? "speaking"
    : isListening
      ? "listening"
      : status === "connecting"
        ? "thinking"
        : isConnected
          ? "thinking"
          : "idle";

  useEffect(() => {
    if (!navigator.permissions?.query) {
      return;
    }

    navigator.permissions
      .query({ name: "microphone" as PermissionName })
      .then((permissionStatus) => {
        setPermissionState(permissionStatus.state);
        permissionStatus.onchange = () => setPermissionState(permissionStatus.state);
      })
      .catch(() => setPermissionState("idle"));
  }, []);

  useEffect(() => {
    if (!isConnected) {
      return;
    }

    const timeout = window.setTimeout(async () => {
      await endSession();
      onSessionChange((current) => ({
        ...current,
        endedAt: new Date().toISOString(),
        events: [
          ...current.events,
          {
            id: crypto.randomUUID(),
            at: new Date().toISOString(),
            speaker: "system",
            text: "Session ended after five minutes of inactivity.",
          },
        ],
      }));
    }, INACTIVITY_LIMIT_MS);

    return () => window.clearTimeout(timeout);
  }, [endSession, isConnected, onSessionChange, session.lastActivityAt]);

  const requestMicrophone = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setPermissionState("unsupported");
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setPermissionState("granted");
      return true;
    } catch {
      setPermissionState("denied");
      return false;
    }
  };

  const beginSession = async (resume = false) => {
    if (!agentId) {
      setError("Set NEXT_PUBLIC_ELEVENLABS_AGENT_ID before starting a real voice session.");
      return;
    }

    setError(null);
    const hasMicrophone = await requestMicrophone();
    if (!hasMicrophone) {
      return;
    }

    onActivity();
    const context = resume
      ? `Resume Sentinel session for ${stayRecord.guestName}. Prior events: ${session.events
          .slice(-4)
          .map((event) => `${event.speaker}: ${event.text}`)
          .join(" | ")}`
      : `Start Sentinel session for ${stayRecord.guestName}. Open with a warm greeting referencing the most recent stay at ${stayRecord.property} if stay data is available through the client tool.`;

    await startSession({
      agentId,
      connectionType: "webrtc",
      userId: stayRecord.guestId,
    });

    sendContextualUpdate(context);
    onSessionChange((current) => ({
      ...current,
      conversationId: current.conversationId ?? `local_${crypto.randomUUID()}`,
      startedAt: current.startedAt ?? new Date().toISOString(),
      endedAt: undefined,
      lastActivityAt: new Date().toISOString(),
      events: [
        ...current.events,
        {
          id: crypto.randomUUID(),
          at: new Date().toISOString(),
          speaker: "system",
          text: resume ? "Resumed the prior Sentinel session." : "Started a new Sentinel session.",
        },
      ],
    }));
  };

  const stopSession = async () => {
    await endSession();
    onSessionChange((current) => ({
      ...current,
      endedAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
      events: [
        ...current.events,
        {
          id: crypto.randomUUID(),
          at: new Date().toISOString(),
          speaker: "system",
          text: "Ended the voice session and saved conversation context.",
        },
      ],
    }));
  };

  const interruptAgent = () => {
    sendUserActivity();
    sendContextualUpdate("The guest interrupted the current response. Pause and listen.");
    onActivity();
  };

  return (
    <section className="card voice-card" aria-labelledby="voice-title">
      <div className="section-heading">
        <p className="eyebrow">Guest voice session</p>
        <h2 id="voice-title">Sentinel companion</h2>
        <p>
          Start a live ElevenLabs session, then let the configured agent call Sentinel&apos;s mocked
          Rosewood tools for memory, concierge, and loyalty context.
        </p>
      </div>

      {!agentId ? (
        <div className="setup-note">
          Add <code>NEXT_PUBLIC_ELEVENLABS_AGENT_ID</code> to <code>.env.local</code> to enable
          the real voice session.
        </div>
      ) : null}

      <div className={`orb orb-${displayState}`} aria-label={`Conversation is ${displayState}`}>
        <span />
      </div>

      <div className="status-grid">
        <StatusPill label="Connection" value={status} />
        <StatusPill label="Mode" value={mode ?? displayState} />
        <StatusPill label="Agent" value={session.activeAgent} />
        <StatusPill label="Microphone" value={permissionState} />
      </div>

      {message ? <p className="status-message">{message}</p> : null}
      {error ? <p className="error-message">{error}</p> : null}
      {permissionState === "denied" ? (
        <p className="error-message">
          Microphone access is required for Sentinel voice conversations. Enable access in browser
          settings, then try again.
        </p>
      ) : null}
      {permissionState === "unsupported" ? (
        <p className="error-message">
          This browser does not expose microphone capture, so the voice button is hidden.
        </p>
      ) : null}

      <div className="actions">
        {!isConnected && permissionState !== "unsupported" ? (
          <button className="primary-button" onClick={() => beginSession(false)} type="button">
            Start voice session
          </button>
        ) : null}
        {!isConnected && session.events.length > 0 && permissionState !== "unsupported" ? (
          <button className="secondary-button" onClick={() => beginSession(true)} type="button">
            Resume prior session
          </button>
        ) : null}
        {isConnected ? (
          <>
            {isSpeaking ? (
              <button className="secondary-button" onClick={interruptAgent} type="button">
                Interrupt
              </button>
            ) : null}
            <button className="secondary-button" onClick={stopSession} type="button">
              End and save
            </button>
          </>
        ) : null}
      </div>

      <div className="session-panel">
        <div>
          <h3>Retrieved session data</h3>
          {session.retrievedData.length ? (
            <ul>
              {session.retrievedData.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <p>No tool data retrieved yet.</p>
          )}
        </div>
        <div>
          <h3>Saved context</h3>
          {session.events.length ? (
            <ol className="event-list">
              {session.events.slice(-6).map((event) => (
                <li key={event.id}>
                  <strong>{event.speaker}</strong>
                  <span>{event.text}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p>No session events yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}

function StatusPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="status-pill">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function VoiceWidget() {
  const [session, setSession] = useState<SentinelSession>(createEmptySession);

  useEffect(() => {
    queueMicrotask(() => setSession(loadSession()));
  }, []);

  useEffect(() => {
    saveSession(session);
  }, [session]);

  const updateSession = useCallback((updater: (session: SentinelSession) => SentinelSession) => {
    setSession((current) => updater(current));
  }, []);

  const markActivity = useCallback(() => {
    setSession((current) => ({
      ...current,
      lastActivityAt: new Date().toISOString(),
    }));
  }, []);

  const tools = useMemo(
    () =>
      createSentinelClientTools({
        onDataRetrieved: (label) => {
          setSession((current) => ({
            ...current,
            retrievedData: Array.from(new Set([...current.retrievedData, label])),
            lastActivityAt: new Date().toISOString(),
          }));
        },
      }),
    [],
  );

  return (
    <ConversationProvider
      clientTools={tools}
      onConnect={markActivity}
      onDisconnect={markActivity}
      onModeChange={markActivity}
      onMessage={(message) => {
        const text = getMessageText(message);
        if (!text) {
          return;
        }

        setSession((current) => ({
          ...current,
          activeAgent: inferActiveAgent(text),
          lastActivityAt: new Date().toISOString(),
          events: [
            ...current.events,
            {
              id: crypto.randomUUID(),
              at: new Date().toISOString(),
              speaker: getMessageSpeaker(message),
              text,
            },
          ].slice(-30),
        }));
      }}
      onError={(conversationError) => {
        setSession((current) => ({
          ...current,
          events: [
            ...current.events,
            {
              id: crypto.randomUUID(),
              at: new Date().toISOString(),
              speaker: "system",
              text: `ElevenLabs error: ${String(conversationError)}`,
            },
          ],
        }));
      }}
    >
      <VoiceWidgetBody session={session} onSessionChange={updateSession} onActivity={markActivity} />
    </ConversationProvider>
  );
}
