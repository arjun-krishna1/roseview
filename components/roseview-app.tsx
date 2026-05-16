/* eslint-disable @next/next/no-img-element */
"use client";

import { ConversationProvider, useConversation } from "@elevenlabs/react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  amenities,
  hotel,
  initialMemories,
  nearby,
  todayPrompts,
  type Amenity,
  type CaptureSession,
  type Memory,
  type MemoryAnswer,
} from "@/components/roseview-data";
import { Chip, ConvoTurn, Icon, MicButton, PageHeader, StatusBar, TabBar, Waveform, cardStyle } from "@/components/roseview-ui";

type Screen =
  | "today"
  | "map"
  | "amenity"
  | "journal"
  | "memory-detail"
  | "capture-start"
  | "capture-conversation"
  | "capture-camera"
  | "capture-confirm"
  | "reel"
  | "share"
  | "settings";

type ConversationLine = {
  id: string;
  role: "guest" | "roseview";
  text: string;
};

type SignedUrlResponse = {
  signedUrl?: string;
  agentId?: string;
  error?: string;
};

const hubScreens: Screen[] = ["today", "map", "journal", "reel"];
const screens = new Set<Screen>([
  "today",
  "map",
  "amenity",
  "journal",
  "memory-detail",
  "capture-start",
  "capture-conversation",
  "capture-camera",
  "capture-confirm",
  "reel",
  "share",
  "settings",
]);

const normalizeHistoryStack = (stack: unknown): Screen[] | null => {
  if (!Array.isArray(stack)) {
    return null;
  }

  const normalized = stack.filter((screen): screen is Screen => screens.has(screen as Screen));
  return normalized.length ? normalized : null;
};

const browserUrlForStack = (stack: Screen[]) => {
  const screen = stack[stack.length - 1] ?? "today";
  return screen === "today" ? window.location.pathname : `#${screen}`;
};

function usePhoneScale() {
  useEffect(() => {
    const fit = () => {
      const phoneWidth = 390;
      const phoneHeight = 844;
      const margin = 24;
      const scaleX = (window.innerWidth - margin * 2) / phoneWidth;
      const scaleY = (window.innerHeight - margin * 2) / phoneHeight;
      const scale = Math.min(1, Math.max(0.3, Math.min(scaleX, scaleY)));
      document.documentElement.style.setProperty("--phone-scale", scale.toFixed(4));
    };

    fit();
    window.requestAnimationFrame(fit);
    window.addEventListener("resize", fit);
    window.addEventListener("orientationchange", fit);
    void document.fonts?.ready.then(fit);

    return () => {
      window.removeEventListener("resize", fit);
      window.removeEventListener("orientationchange", fit);
    };
  }, []);
}

function parseConversationMessage(message: unknown): Omit<ConversationLine, "id"> | null {
  if (!message || typeof message !== "object") {
    return null;
  }

  const record = message as Record<string, unknown>;
  const rawText = record.message ?? record.text ?? record.transcript;
  if (typeof rawText !== "string" || !rawText.trim()) {
    return null;
  }

  const rawRole = String(record.source ?? record.role ?? "").toLowerCase();
  const role = rawRole.includes("user") || rawRole.includes("human") ? "guest" : "roseview";

  return {
    role,
    text: rawText.trim(),
  };
}

function makeConversationAnswers(lines: ConversationLine[], item: Amenity | null): MemoryAnswer[] {
  const guestLines = lines.filter((line) => line.role === "guest" && line.text.trim());
  const prompts = item?.prompts.length ? item.prompts : ["What did you want Roseview to remember?"];

  if (!guestLines.length) {
    return [{ q: prompts[0], a: "Captured with Roseview's conversational agent." }];
  }

  return guestLines.map((line, index) => ({
    q: prompts[index % prompts.length],
    a: line.text,
  }));
}

export function RoseviewApp() {
  return (
    <ConversationProvider>
      <RoseviewShell />
    </ConversationProvider>
  );
}

function RoseviewShell() {
  usePhoneScale();

  const [history, setHistory] = useState<Screen[]>(["today"]);
  const [selected, setSelected] = useState<Amenity | Memory | null>(null);
  const [confirmed, setConfirmed] = useState<Memory | null>(null);
  const [captureSession, setCaptureSession] = useState<CaptureSession | null>(null);
  const [memories, setMemories] = useState<Memory[]>(initialMemories);
  const [palette, setPalette] = useState("sand");

  const current = history[history.length - 1] ?? "today";

  useEffect(() => {
    document.documentElement.dataset.palette = palette;
  }, [palette]);

  useEffect(() => {
    window.history.replaceState({ roseview: true, stack: ["today"] }, "", browserUrlForStack(["today"]));

    const handlePopState = (event: PopStateEvent) => {
      const stack = event.state && typeof event.state === "object" ? normalizeHistoryStack((event.state as { stack?: unknown }).stack) : null;
      setHistory(stack ?? ["today"]);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const pushBrowserHistory = (stack: Screen[]) => {
    window.history.pushState({ roseview: true, stack }, "", browserUrlForStack(stack));
  };

  const replaceBrowserHistory = (stack: Screen[]) => {
    window.history.replaceState({ roseview: true, stack }, "", browserUrlForStack(stack));
  };

  const nav = (to: Screen | "back", payload?: Memory) => {
    if (to === "back") {
      if (history.length > 1) {
        const nextHistory = history.slice(0, -1);
        setHistory(nextHistory);
        replaceBrowserHistory(nextHistory);
      }
      return;
    }

    if (to === "capture-confirm" && payload) {
      setConfirmed(payload);
    }

    const nextHistory = [...history, to];
    setHistory(nextHistory);
    pushBrowserHistory(nextHistory);
  };

  const navTab = (to: Screen) => {
    const nextHistory = [to];
    setHistory(nextHistory);
    pushBrowserHistory(nextHistory);
  };

  const navFromToday = (to: Screen) => {
    if (hubScreens.includes(to)) {
      navTab(to);
    } else {
      nav(to);
    }
  };

  const navFromTabBar = (to: Screen) => {
    if (hubScreens.includes(to)) {
      navTab(to);
    } else {
      nav(to);
    }
  };

  const addMemory = (memory: Memory) => {
    setMemories((currentMemories) => [memory, ...currentMemories]);
  };

  const showTabbar = hubScreens.includes(current) && current !== "reel";

  const renderScreen = () => {
    switch (current) {
      case "today":
        return <TodayScreen onNav={navFromToday} memories={memories} setSelected={setSelected} />;
      case "map":
        return <MapScreen onNav={(destination) => (destination === "amenity" ? nav("amenity") : navTab(destination))} setSelected={setSelected} />;
      case "amenity":
        return <AmenityScreen onNav={nav} item={selected && "prompts" in selected ? selected : null} />;
      case "journal":
        return <JournalScreen onNav={(destination) => (destination === "memory-detail" ? nav("memory-detail") : navTab(destination))} memories={memories} setSelected={setSelected} />;
      case "memory-detail":
        return <MemoryDetailScreen onNav={nav} memory={selected && "answers" in selected ? selected : null} />;
      case "capture-start":
        return <CaptureStartScreen onNav={(destination) => (destination === "capture-conversation" ? nav("capture-conversation") : navTab(destination))} setSelected={setSelected} />;
      case "capture-conversation":
        return (
          <ConversationScreen
            onNav={nav}
            item={selected && "prompts" in selected ? selected : null}
            captureSession={captureSession}
            setCaptureSession={setCaptureSession}
          />
        );
      case "capture-camera":
        return (
          <CameraScreen
            onNav={nav}
            item={selected && "prompts" in selected ? selected : captureSession?.item ?? null}
            captureSession={captureSession}
            setCaptureSession={setCaptureSession}
            addMemory={addMemory}
          />
        );
      case "capture-confirm":
        return <ConfirmationScreen onNav={navTab} memory={confirmed} />;
      case "reel":
        return <ReelScreen onNav={navTab} memories={memories} />;
      case "share":
        return <ShareScreen onNav={navTab} memories={memories} />;
      case "settings":
        return <SettingsScreen onNav={nav} palette={palette} setPalette={setPalette} />;
      default:
        return <TodayScreen onNav={navTab} memories={memories} setSelected={setSelected} />;
    }
  };

  return (
    <main className="roseview-root">
      <div className="phone-stage">
        <div className={`phone ${showTabbar ? "" : "no-tabbar"}`} data-screen-label="Roseview">
          <div className="phone-screen">
            {renderScreen()}
            {showTabbar ? <TabBar active={current} onNav={(screen) => navFromTabBar(screen as Screen)} /> : null}
          </div>
        </div>
      </div>
    </main>
  );
}

function TodayScreen({ onNav, memories, setSelected }: { onNav: (screen: Screen) => void; memories: Memory[]; setSelected: (item: Amenity | Memory) => void }) {
  const featured = amenities[0];
  const recent = memories.slice(0, 4);

  return (
    <div className="screen">
      <StatusBar />
      <div className="screen-scroll" style={{ paddingBottom: 110 }}>
        <div className="pad-x" style={{ paddingTop: 12, paddingBottom: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <div>
              <div className="eyebrow">Day {hotel.stayDay} of {hotel.stayLength}</div>
              <div className="serif" style={{ fontSize: 14, marginTop: 4, color: "var(--ink-2)" }}>{hotel.date}</div>
            </div>
            <button className="btn-icon" aria-label="Menu" onClick={() => onNav("settings")}>
              <Icon name="menu" size={18} />
            </button>
          </div>

          <h1 className="display" style={{ fontSize: 52, marginBottom: 2 }}>Good morning,</h1>
          <h1 className="display serif-italic" style={{ fontSize: 56, color: "var(--accent)", marginBottom: 18 }}>{hotel.guest}.</h1>
          <p style={{ fontSize: 15, lineHeight: 1.55, color: "var(--ink-2)", maxWidth: 320 }}>
            You have <em className="serif-italic" style={{ fontSize: 17 }}>{memories.length} memories</em> collected so far. There are two moments held for you today.
          </p>
        </div>

        <div className="pad-x" style={{ marginBottom: 28 }}>
          <button
            onClick={() => {
              setSelected(featured);
              onNav("amenity");
            }}
            style={{ borderRadius: 28, overflow: "hidden", position: "relative", height: 360, width: "100%", textAlign: "left" }}
          >
            <img src={featured.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div className="photo-overlay-bottom" style={{ position: "absolute", inset: 0 }} />
            <div style={{ position: "absolute", top: 20, left: 20, right: 20, display: "flex", justifyContent: "space-between", color: "#fff" }}>
              <span className="eyebrow" style={{ color: "rgba(255,255,255,0.85)" }}>Held for you - 6:30 PM</span>
              <Icon name="clock" size={16} />
            </div>
            <div style={{ position: "absolute", bottom: 24, left: 24, right: 24, color: "#fff" }}>
              <div className="serif-italic" style={{ fontSize: 18, opacity: 0.85, marginBottom: 8 }}>This evening</div>
              <h2 className="display" style={{ fontSize: 38, color: "#fff", marginBottom: 14 }}>
                The Vineyard<br />at Dusk
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                <span style={{ opacity: 0.85 }}>South terraces - 45 min walk</span>
                <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#fff", opacity: 0.5 }} />
                <span style={{ opacity: 0.85 }}>Mario will pour</span>
              </div>
            </div>
          </button>
        </div>

        <div className="pad-x" style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
            <h3 className="serif" style={{ fontSize: 26 }}>Held for you today</h3>
            <button style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-3)" }} onClick={() => onNav("map")}>See all</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {todayPrompts.map((prompt) => {
              const amenity = amenities.find((candidate) => candidate.id === prompt.amenityId) ?? amenities[0];
              return (
                <button
                  key={prompt.id}
                  onClick={() => {
                    setSelected(amenity);
                    onNav("amenity");
                  }}
                  style={{ ...cardStyle({ display: "flex", overflow: "hidden", cursor: "pointer", textAlign: "left" }) }}
                >
                  <img src={amenity.image} alt="" style={{ width: 96, height: 96, objectFit: "cover" }} />
                  <div style={{ padding: 14, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <div className="eyebrow" style={{ marginBottom: 4 }}>{prompt.time}</div>
                    <div className="serif" style={{ fontSize: 19, lineHeight: 1.1 }}>{amenity.name}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 4 }}>{prompt.detail}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", paddingRight: 16, color: "var(--ink-3)" }}>
                    <Icon name="arrow-right" size={16} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="pad-x" style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
            <h3 className="serif" style={{ fontSize: 26 }}>Your story so far</h3>
            <button style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-3)" }} onClick={() => onNav("journal")}>All {memories.length}</button>
          </div>
          <div className="memory-grid">
            {recent.map((memory) => (
              <button
                key={memory.id}
                className="memory-tile"
                onClick={() => {
                  setSelected(memory);
                  onNav("memory-detail");
                }}
                style={{ textAlign: "left" }}
              >
                <img src={memory.image} alt="" />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.7))" }} />
                <div style={{ position: "absolute", left: 12, right: 12, bottom: 10, color: "#fff" }}>
                  <div className="serif" style={{ fontSize: 15, lineHeight: 1.1 }}>{memory.title}</div>
                  <div style={{ fontSize: 10, opacity: 0.8, marginTop: 4, letterSpacing: "0.06em" }}>{memory.duration} - {memory.when.split("-")[0]}</div>
                </div>
                <div style={{ position: "absolute", top: 10, right: 10, width: 24, height: 24, borderRadius: "50%", background: "rgba(0,0,0,0.4)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                  <Icon name="play" size={10} />
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="pad-x" style={{ marginBottom: 24 }}>
          <button onClick={() => onNav("reel")} style={{ background: "var(--ink)", color: "var(--bg)", borderRadius: 24, padding: 28, width: "100%", textAlign: "left", position: "relative", overflow: "hidden" }}>
            <div className="eyebrow" style={{ color: "color-mix(in oklab, var(--bg) 60%, transparent)", marginBottom: 12 }}>In 2 days - At checkout</div>
            <h3 className="display" style={{ fontSize: 32, color: "var(--bg)", lineHeight: 1 }}>A reel<br />of your stay</h3>
            <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 8, fontSize: 13, opacity: 0.8 }}>
              <Icon name="play" size={14} />
              <span>Preview now</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

function MapScreen({ onNav, setSelected }: { onNav: (screen: Screen) => void; setSelected: (item: Amenity) => void }) {
  const [tab, setTab] = useState<"property" | "nearby">("property");
  const items = tab === "property" ? amenities : nearby;

  return (
    <div className="screen">
      <StatusBar />
      <div className="screen-scroll" style={{ paddingBottom: 110 }}>
        <div className="pad-x" style={{ paddingTop: 12, paddingBottom: 18 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Memory map</div>
          <h1 className="display" style={{ fontSize: 44, lineHeight: 1 }}>
            Where to make<br />
            <em className="serif-italic" style={{ color: "var(--accent)" }}>your next one.</em>
          </h1>
        </div>

        <div className="pad-x" style={{ marginBottom: 20 }}>
          <div className="map-canvas" style={{ height: 240, borderRadius: 24, border: "1px solid var(--line)", position: "relative" }}>
            <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", background: "var(--ink)", color: "var(--bg)", padding: "8px 14px", borderRadius: 100, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 500, boxShadow: "0 8px 20px rgba(0,0,0,0.18)" }}>
              <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", marginRight: 8, verticalAlign: "middle" }} />
              Rosa di Vento
            </div>
            {[
              { id: "vineyard", x: 18, y: 28, label: "Vineyard", captured: false },
              { id: "spa", x: 72, y: 20, label: "Spa", captured: false },
              { id: "dining", x: 80, y: 60, label: "Caruso", captured: true },
              { id: "pool", x: 30, y: 70, label: "Pool", captured: true },
              { id: "library", x: 60, y: 80, label: "Library", captured: false },
            ].map((pin) => {
              const amenity = amenities.find((candidate) => candidate.id === pin.id) ?? amenities[0];
              return (
                <button
                  key={pin.id}
                  onClick={() => {
                    setSelected(amenity);
                    onNav("amenity");
                  }}
                  style={{ position: "absolute", left: `${pin.x}%`, top: `${pin.y}%`, transform: "translate(-50%,-100%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}
                >
                  <div style={{ fontSize: 10, letterSpacing: "0.08em", background: "var(--surface)", padding: "3px 8px", borderRadius: 100, border: "1px solid var(--line)", color: "var(--ink-2)", whiteSpace: "nowrap", fontWeight: 500 }}>{pin.label}</div>
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: pin.captured ? "var(--accent)" : "var(--surface)", border: pin.captured ? "none" : "1.5px solid var(--ink)", boxShadow: pin.captured ? "0 0 0 4px color-mix(in oklab, var(--accent) 25%, transparent)" : "none" }} />
                </button>
              );
            })}
          </div>
        </div>

        <div className="pad-x" style={{ marginBottom: 20, display: "flex", gap: 8 }}>
          <Chip active={tab === "property"} onClick={() => setTab("property")}>On the estate</Chip>
          <Chip active={tab === "nearby"} onClick={() => setTab("nearby")}>Nearby</Chip>
          <Chip>Captured (3)</Chip>
        </div>

        <div className="pad-x" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setSelected(item);
                onNav("amenity");
              }}
              style={{ ...cardStyle({ display: "flex", gap: 14, alignItems: "center", padding: 14, textAlign: "left" }) }}
            >
              <img src={item.image} alt="" style={{ width: 88, height: 88, objectFit: "cover", borderRadius: 14 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="eyebrow" style={{ marginBottom: 4 }}>{item.kind} {item.distance ? `- ${item.distance}` : item.location ? `- ${item.location}` : ""}</div>
                <div className="serif" style={{ fontSize: 22, lineHeight: 1.05, marginBottom: 4 }}>{item.name}</div>
                <div style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.3, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{item.description}</div>
              </div>
              <Icon name="arrow-up-right" size={18} />
            </button>
          ))}
        </div>
        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}

function AmenityScreen({ onNav, item }: { onNav: (screen: Screen | "back") => void; item: Amenity | null }) {
  if (!item) {
    return null;
  }

  return (
    <div className="screen" style={{ background: "var(--bg)" }}>
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 480, overflow: "hidden" }}>
          <img src={item.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div className="photo-overlay-top" style={{ position: "absolute", inset: 0, height: 200 }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 200, background: "linear-gradient(180deg, transparent 0%, var(--bg) 100%)" }} />
        </div>
      </div>
      <StatusBar onPhoto />
      <div className="screen-scroll" style={{ paddingBottom: 120, position: "relative", paddingTop: 0 }}>
        <PageHeader onBack={() => onNav("back")} light />
        <div style={{ height: 320 }} />
        <div className="pad-x" style={{ position: "relative" }}>
          <div className="eyebrow" style={{ color: "var(--ink-3)", marginBottom: 8 }}>{item.kind} - {item.location || item.distance}</div>
          <h1 className="display" style={{ fontSize: 42, lineHeight: 1, marginBottom: 16 }}>{item.name}</h1>
          <div style={{ display: "flex", gap: 16, marginBottom: 22, fontSize: 12, color: "var(--ink-2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}><Icon name="clock" size={14} /> {item.duration || "Open"}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}><Icon name="pin" size={14} /> {item.location || item.distance}</div>
          </div>
          <p className="serif" style={{ fontSize: 22, lineHeight: 1.35, color: "var(--ink)", marginBottom: 24 }}>{item.description}</p>
          <div className="divider" style={{ marginBottom: 24 }} />
          <div style={{ marginBottom: 28 }}>
            <div className="eyebrow" style={{ marginBottom: 14 }}>Roseview will ask</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {item.prompts.map((prompt, index) => (
                <div key={prompt} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div className="serif-italic" style={{ fontSize: 18, color: "var(--accent)", minWidth: 24, lineHeight: 1.2 }}>{String(index + 1).padStart(2, "0")}</div>
                  <div className="serif" style={{ fontSize: 19, lineHeight: 1.3, color: "var(--ink)" }}>{prompt}</div>
                </div>
              ))}
            </div>
          </div>
          <button onClick={() => onNav("capture-conversation")} className="btn btn-primary" style={{ width: "100%", padding: 20, fontSize: 13 }}>
            <Icon name="mic" size={16} /> Capture this memory
          </button>
          <div style={{ textAlign: "center", marginTop: 12, fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.08em" }}>ABOUT 2 MINUTES - VOICE OR TEXT</div>
        </div>
      </div>
    </div>
  );
}

function JournalScreen({ onNav, memories, setSelected }: { onNav: (screen: Screen) => void; memories: Memory[]; setSelected: (memory: Memory) => void }) {
  return (
    <div className="screen">
      <StatusBar />
      <div className="screen-scroll" style={{ paddingBottom: 110 }}>
        <div className="pad-x" style={{ paddingTop: 12, paddingBottom: 24 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Journal - {memories.length} memories</div>
          <h1 className="display" style={{ fontSize: 44, lineHeight: 1 }}>
            Your stay,<br />
            <em className="serif-italic">in moments.</em>
          </h1>
        </div>
        <div className="pad-x" style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {memories.map((memory) => (
            <div key={memory.id}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div className="eyebrow" style={{ color: "var(--ink-2)" }}>{memory.when}</div>
                <div className="divider" style={{ flex: 1 }} />
                <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{memory.duration}</div>
              </div>
              <button
                onClick={() => {
                  setSelected(memory);
                  onNav("memory-detail");
                }}
                style={{ ...cardStyle({ overflow: "hidden", cursor: "pointer", textAlign: "left", width: "100%" }) }}
              >
                <div style={{ position: "relative", height: 220 }}>
                  <img src={memory.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.6))" }} />
                  <div style={{ position: "absolute", left: 18, bottom: 14, color: "#fff" }}>
                    <h3 className="display" style={{ fontSize: 28, color: "#fff", lineHeight: 1 }}>{memory.title}</h3>
                  </div>
                </div>
                <div style={{ padding: 18 }}>
                  {memory.answers.slice(0, 1).map((answer) => (
                    <div key={answer.q}>
                      <div className="serif-italic" style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 4 }}>{answer.q}</div>
                      <p className="serif" style={{ fontSize: 18, lineHeight: 1.35, color: "var(--ink)" }}>{answer.a}</p>
                    </div>
                  ))}
                </div>
              </button>
            </div>
          ))}
        </div>
        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}

function MemoryDetailScreen({ onNav, memory }: { onNav: (screen: Screen | "back") => void; memory: Memory | null }) {
  if (!memory) {
    return null;
  }

  return (
    <div className="screen">
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 420 }}>
        <img src={memory.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div className="photo-overlay-top" style={{ position: "absolute", inset: 0 }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 120, background: "linear-gradient(180deg, transparent, var(--bg))" }} />
      </div>
      <StatusBar onPhoto />
      <div className="screen-scroll" style={{ paddingTop: 0, paddingBottom: 110 }}>
        <PageHeader
          onBack={() => onNav("back")}
          light
          right={<button className="btn-icon" style={{ background: "rgba(255,255,255,0.16)", borderColor: "rgba(255,255,255,0.2)", color: "#fff" }}><Icon name="more" size={18} /></button>}
        />
        <div style={{ height: 280 }} />
        <div className="pad-x">
          <div className="eyebrow" style={{ marginBottom: 8 }}>{memory.when} - {memory.duration}</div>
          <h1 className="display" style={{ fontSize: 38, lineHeight: 1, marginBottom: 28 }}>{memory.title}</h1>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {memory.answers.map((answer) => (
              <div key={`${answer.q}-${answer.a}`}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <Icon name="sparkle" size={12} stroke={0} />
                  <span className="eyebrow">Roseview asked</span>
                </div>
                <div className="serif-italic" style={{ fontSize: 19, lineHeight: 1.35, color: "var(--ink-2)", marginBottom: 12 }}>{answer.q}</div>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 2, alignSelf: "stretch", background: "var(--accent)", borderRadius: 1 }} />
                  <p className="serif" style={{ fontSize: 21, lineHeight: 1.4, color: "var(--ink)" }}>{answer.a}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="divider" style={{ margin: "28px 0" }} />
          <button className="btn btn-ghost" style={{ width: "100%" }} onClick={() => onNav("capture-conversation")}>
            <Icon name="mic" size={14} /> Add another voice note
          </button>
        </div>
      </div>
    </div>
  );
}

function CaptureStartScreen({ onNav, setSelected }: { onNav: (screen: Screen) => void; setSelected: (item: Amenity) => void }) {
  return (
    <div className="screen" style={{ background: "var(--surface)" }}>
      <StatusBar />
      <div className="screen-scroll" style={{ paddingBottom: 40 }}>
        <PageHeader onBack={() => onNav("today")} right={<button className="btn-icon" onClick={() => onNav("today")}><Icon name="close" size={18} /></button>} />
        <div className="pad-x" style={{ paddingTop: 6 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Capture a memory</div>
          <h1 className="display" style={{ fontSize: 40, lineHeight: 1, marginBottom: 8 }}>
            What just<br />
            <em className="serif-italic">happened?</em>
          </h1>
          <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.5, marginBottom: 28 }}>Pick what you are in the middle of and Roseview will ask a few quick things about it.</p>
          <div className="eyebrow" style={{ marginBottom: 12 }}>Right now on the estate</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            {amenities.slice(0, 4).map((amenity) => (
              <button
                key={amenity.id}
                onClick={() => {
                  setSelected(amenity);
                  onNav("capture-conversation");
                }}
                style={{ display: "flex", alignItems: "center", gap: 14, padding: 10, paddingRight: 16, border: "1px solid var(--line)", borderRadius: 18, background: "var(--bg)", textAlign: "left" }}
              >
                <img src={amenity.image} alt="" style={{ width: 60, height: 60, borderRadius: 12, objectFit: "cover" }} />
                <div style={{ flex: 1 }}>
                  <div className="serif" style={{ fontSize: 18, lineHeight: 1.1 }}>{amenity.name}</div>
                  <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>{amenity.location} - {amenity.duration}</div>
                </div>
                <Icon name="arrow-right" size={16} />
              </button>
            ))}
          </div>
          <button onClick={() => onNav("map")} style={{ width: "100%", padding: 16, borderRadius: 18, border: "1px dashed var(--line)", color: "var(--ink-2)", fontSize: 13, letterSpacing: "0.08em", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Icon name="map" size={16} /> Something else, off the map
          </button>
        </div>
      </div>
    </div>
  );
}

function ConversationScreen({
  onNav,
  item,
  captureSession,
  setCaptureSession,
}: {
  onNav: (screen: Screen | "back") => void;
  item: Amenity | null;
  captureSession: CaptureSession | null;
  setCaptureSession: (session: CaptureSession | null) => void;
}) {
  const [lines, setLines] = useState<ConversationLine[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const lastMessageRef = useRef("");
  const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;

  const conversation = useConversation({
    onConnect: () => {
      setError(null);
    },
    onDisconnect: () => {
      setConversationId(null);
    },
    onMessage: (message: unknown) => {
      const parsed = parseConversationMessage(message);
      if (!parsed) {
        return;
      }

      const signature = `${parsed.role}:${parsed.text}`;
      if (lastMessageRef.current === signature) {
        return;
      }
      lastMessageRef.current = signature;

      setLines((current) => [...current, { ...parsed, id: `${Date.now()}-${current.length}` }]);
    },
    onError: (nextError: unknown) => {
      setError(nextError instanceof Error ? nextError.message : String(nextError));
    },
  });

  const currentItem = item ?? captureSession?.item ?? amenities[0];
  const isConnected = conversation.status === "connected";
  const isConnecting = conversation.status === "connecting";
  const canContinue = lines.length > 0 || isConnected;

  const startConversation = async () => {
    try {
      setError(null);

      if (!agentId) {
        throw new Error("Missing NEXT_PUBLIC_ELEVENLABS_AGENT_ID.");
      }

      await navigator.mediaDevices.getUserMedia({ audio: true });
      const response = await fetch("/api/elevenlabs/signed-url", { cache: "no-store" });
      const data = (await response.json()) as SignedUrlResponse;

      if (!response.ok) {
        throw new Error(data.error ?? "Could not start the Roseview agent.");
      }

      if (data.signedUrl) {
        await conversation.startSession({ signedUrl: data.signedUrl });
      } else {
        await conversation.startSession({ agentId: data.agentId ?? agentId });
      }

      setConversationId(conversation.getId());
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Could not start the Roseview agent.");
    }
  };

  const endConversation = async () => {
    if (conversation.status !== "disconnected") {
      await conversation.endSession();
    }
  };

  const continueToCamera = async () => {
    await endConversation();
    setCaptureSession({
      item: currentItem,
      answers: makeConversationAnswers(lines, currentItem),
    });
    onNav("capture-camera");
  };

  return (
    <div className="screen" style={{ background: "var(--bg)" }}>
      <StatusBar />
      <div style={{ position: "absolute", top: 64, left: 24, right: 24, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div className="eyebrow" style={{ color: "var(--ink-2)" }}>
            <span style={{ color: "var(--accent)" }}>{isConnected ? "Live" : isConnecting ? "Connecting" : "Ready"}</span>
            <span style={{ opacity: 0.4 }}> / ElevenLabs</span>
          </div>
          <button className="btn-icon" onClick={() => void endConversation().then(() => onNav("today"))}><Icon name="close" size={18} /></button>
        </div>
        <div style={{ height: 2, background: "var(--line)", borderRadius: 100, overflow: "hidden" }}>
          <div style={{ width: isConnected ? "100%" : isConnecting ? "55%" : "12%", height: "100%", background: "var(--accent)", transition: "width 0.5s ease" }} />
        </div>
      </div>

      <div style={{ position: "absolute", top: 140, left: 24, right: 24, display: "flex", alignItems: "center", gap: 10 }}>
        <img src={currentItem.image} alt="" style={{ width: 32, height: 32, borderRadius: 8, objectFit: "cover" }} />
        <div style={{ fontSize: 13, color: "var(--ink-2)" }}>
          <span className="serif-italic">{currentItem.name}</span>
          {conversationId ? <span style={{ color: "var(--ink-3)" }}> - {conversationId.slice(0, 10)}</span> : null}
        </div>
      </div>

      <div style={{ position: "absolute", left: 28, right: 28, top: 190, bottom: 292, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "stretch" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <Icon name="sparkle" size={14} stroke={0} />
          <span className="eyebrow">Roseview agent</span>
        </div>
        <p className="display" style={{ fontSize: 34, lineHeight: 1.08, color: "var(--ink)", marginBottom: 22 }}>
          {lines.length ? "Roseview is listening to your stay." : "Start a live memory conversation."}
        </p>

        {lines.length ? (
          <div className="live-conversation-log">
            {lines.map((line) => <ConvoTurn key={line.id} role={line.role} text={line.text} />)}
          </div>
        ) : (
          <div style={{ ...cardStyle({ padding: 18, borderRadius: 18, color: "var(--ink-2)", lineHeight: 1.45 }) }}>
            <div className="eyebrow" style={{ color: "var(--accent)", marginBottom: 8 }}>Memory context</div>
            <p className="serif" style={{ fontSize: 20, color: "var(--ink)" }}>{currentItem.prompts[0] ?? "Tell me about this moment."}</p>
          </div>
        )}

        {error ? <p style={{ marginTop: 12, border: "1px solid rgba(180,84,106,0.25)", borderRadius: 14, background: "rgba(180,84,106,0.1)", padding: "10px 12px", color: "var(--accent)", fontSize: 12, lineHeight: 1.4 }}>{error}</p> : null}
      </div>

      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "18px 24px 32px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14, background: "linear-gradient(180deg, transparent, color-mix(in oklab, var(--bg) 94%, transparent) 26%)" }}>
        {(isConnected || isConnecting) ? <div style={{ width: "100%", height: 42 }}><Waveform active={isConnected || isConnecting} height={42} /></div> : null}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 18, width: "100%" }}>
          <button className="btn btn-ghost" onClick={continueToCamera} disabled={!canContinue} style={{ flex: 1, padding: "14px 16px" }}>
            Camera
          </button>
          <MicButton recording={isConnected || isConnecting} onClick={isConnected || isConnecting ? () => void endConversation() : () => void startConversation()} size={86} />
          <button className="btn btn-ghost" onClick={() => void endConversation()} disabled={!isConnected && !isConnecting} style={{ flex: 1, padding: "14px 16px" }}>
            End
          </button>
        </div>
        <div style={{ fontSize: 12, color: "var(--ink-3)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          {isConnected ? (conversation.isSpeaking ? "Roseview speaking" : conversation.isListening ? "Listening" : "Connected") : isConnecting ? "Connecting" : "Tap to speak"}
        </div>
      </div>
    </div>
  );
}

function CameraScreen({
  onNav,
  item,
  captureSession,
  setCaptureSession,
  addMemory,
}: {
  onNav: (screen: Screen, payload?: Memory) => void;
  item: Amenity | null;
  captureSession: CaptureSession | null;
  setCaptureSession: (session: CaptureSession | null) => void;
  addMemory: (memory: Memory) => void;
}) {
  const [phase, setPhase] = useState<"ready" | "recording" | "done">("ready");
  const [seconds, setSeconds] = useState(0);
  const currentItem = item ?? captureSession?.item ?? amenities[0];

  useEffect(() => {
    if (phase !== "recording") {
      return undefined;
    }

    const interval = window.setInterval(() => setSeconds((current) => current + 0.1), 100);
    const timeout = window.setTimeout(() => setPhase("done"), 15000);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [phase]);

  const finish = () => {
    const newMemory: Memory = {
      id: `m${Date.now()}`,
      amenityId: currentItem.id,
      title: `Moment at ${currentItem.name.split(" ").slice(-2).join(" ")}`,
      when: `Today - ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`,
      duration: `0:${String(Math.max(1, Math.floor(seconds))).padStart(2, "0")}`,
      image: currentItem.image,
      answers: captureSession?.answers ?? [],
    };
    addMemory(newMemory);
    setCaptureSession(null);
    onNav("capture-confirm", newMemory);
  };

  return (
    <div className="screen camera-bg" style={{ background: "#0c0a08" }}>
      <div className="fullbleed">
        <img src={currentItem.image} alt="" style={{ filter: "brightness(0.7) saturate(0.95)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.7) 100%)" }} />
      </div>
      <StatusBar onPhoto />
      <div style={{ position: "absolute", top: 64, left: 0, right: 0, padding: "0 24px", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 10 }}>
        <button className="btn-icon" style={{ background: "rgba(255,255,255,0.16)", borderColor: "rgba(255,255,255,0.2)", color: "#fff" }} onClick={() => onNav("today")}>
          <Icon name="close" size={18} />
        </button>
        {phase === "recording" ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.16)", padding: "6px 12px", borderRadius: 100, backdropFilter: "blur(10px)" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)", animation: "pulse-ring 1s infinite" }} />
            <span style={{ fontSize: 13, fontFeatureSettings: "'tnum'", fontWeight: 500 }}>0:{String(Math.floor(seconds)).padStart(2, "0")}</span>
          </div>
        ) : <div style={{ width: 44 }} />}
      </div>

      {phase === "recording" && captureSession?.answers?.[0] ? (
        <div style={{ position: "absolute", top: 140, left: 24, right: 24, color: "#fff", padding: "16px 18px", background: "rgba(0,0,0,0.4)", backdropFilter: "blur(20px)", borderRadius: 18, border: "1px solid rgba(255,255,255,0.15)" }}>
          <div className="eyebrow" style={{ color: "rgba(255,255,255,0.7)", marginBottom: 6 }}>Roseview heard</div>
          <p className="serif" style={{ fontSize: 16, lineHeight: 1.4, color: "#fff" }}>{captureSession.answers[0].a}</p>
        </div>
      ) : null}

      {phase === "ready" ? (
        <div style={{ position: "absolute", left: 28, right: 28, top: "32%", color: "#fff", textAlign: "center" }}>
          <div className="eyebrow" style={{ marginBottom: 14, color: "rgba(255,255,255,0.7)" }}>Now - film 15 seconds</div>
          <h2 className="display" style={{ fontSize: 36, color: "#fff", lineHeight: 1.05 }}>Show us what you<br /><em className="serif-italic">are seeing.</em></h2>
          <p style={{ marginTop: 18, fontSize: 14, opacity: 0.8, lineHeight: 1.5 }}>No pressure - pan slowly. Roseview will save it<br />with your conversation.</p>
        </div>
      ) : null}

      {phase === "done" ? (
        <div style={{ position: "absolute", left: 28, right: 28, top: "32%", color: "#fff", textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(255,255,255,0.16)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", border: "1px solid rgba(255,255,255,0.3)" }}>
            <Icon name="check" size={28} />
          </div>
          <h2 className="display" style={{ fontSize: 30, color: "#fff", lineHeight: 1.05 }}>Got it.</h2>
          <p style={{ marginTop: 12, fontSize: 14, opacity: 0.8 }}>{Math.floor(seconds)} seconds, saved with your story.</p>
        </div>
      ) : null}

      <div style={{ position: "absolute", bottom: 36, left: 0, right: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 32 }}>
        <button className="btn-icon" style={{ background: "rgba(255,255,255,0.16)", borderColor: "rgba(255,255,255,0.2)", color: "#fff", width: 52, height: 52 }}><Icon name="camera" size={20} /></button>
        {phase === "ready" ? (
          <button onClick={() => setPhase("recording")} style={{ width: 84, height: 84, borderRadius: "50%", background: "rgba(255,255,255,0.12)", backdropFilter: "blur(10px)", border: "3px solid #fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#fff" }} />
          </button>
        ) : null}
        {phase === "recording" ? (
          <button onClick={() => setPhase("done")} style={{ width: 84, height: 84, borderRadius: "50%", background: "rgba(255,255,255,0.12)", backdropFilter: "blur(10px)", border: "3px solid #fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 32, height: 32, borderRadius: 6, background: "var(--accent)" }} />
          </button>
        ) : null}
        {phase === "done" ? (
          <button onClick={finish} style={{ width: 84, height: 84, borderRadius: "50%", background: "var(--accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 32px -4px rgba(180, 84, 106, 0.5)" }}>
            <Icon name="check" size={32} stroke={2} />
          </button>
        ) : null}
        <button className="btn-icon" style={{ background: "rgba(255,255,255,0.16)", borderColor: "rgba(255,255,255,0.2)", color: "#fff", width: 52, height: 52 }}><Icon name="journal" size={20} /></button>
      </div>
    </div>
  );
}

function ConfirmationScreen({ onNav, memory }: { onNav: (screen: Screen) => void; memory: Memory | null }) {
  if (!memory) {
    return null;
  }

  return (
    <div className="screen" style={{ background: "var(--bg)" }}>
      <StatusBar />
      <div className="screen-scroll" style={{ padding: "60px 28px 40px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--accent-soft)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
          <Icon name="check" size={28} stroke={1.8} />
        </div>
        <div className="eyebrow" style={{ marginBottom: 10 }}>Memory saved</div>
        <h1 className="display" style={{ fontSize: 36, lineHeight: 1, marginBottom: 14, textAlign: "center" }}>We will keep this<br /><em className="serif-italic">for the reel.</em></h1>
        <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.55, maxWidth: 280, marginBottom: 32 }}>Your video and the things you said are stored together. You can revisit any time from your journal.</p>
        <div style={{ ...cardStyle({ width: "100%", overflow: "hidden", textAlign: "left", marginBottom: 28 }) }}>
          <div style={{ position: "relative", height: 180 }}>
            <img src={memory.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.5))" }} />
            <div style={{ position: "absolute", left: 16, bottom: 12, color: "#fff" }}>
              <div className="serif" style={{ fontSize: 20 }}>{memory.title}</div>
              <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2, letterSpacing: "0.08em" }}>{memory.duration} - just now</div>
            </div>
          </div>
          {memory.answers[0] ? (
            <div style={{ padding: 18 }}>
              <div className="serif-italic" style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 6 }}>{memory.answers[0].q}</div>
              <p className="serif" style={{ fontSize: 17, lineHeight: 1.35, color: "var(--ink)" }}>{memory.answers[0].a}</p>
            </div>
          ) : null}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
          <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => onNav("today")}>Done</button>
          <button className="btn btn-ghost" style={{ width: "100%" }} onClick={() => onNav("capture-start")}><Icon name="mic" size={14} /> Capture another</button>
        </div>
      </div>
    </div>
  );
}

function ReelScreen({ onNav, memories }: { onNav: (screen: Screen) => void; memories: Memory[] }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef(0);
  const memory = memories[index] ?? memories[0];

  useEffect(() => {
    if (!playing || memories.length === 0) {
      return undefined;
    }

    let last = performance.now();
    const tick = (time: number) => {
      const delta = (time - last) / 1000;
      last = time;
      setProgress((current) => {
        const next = current + (delta / 5) * 100;
        if (next >= 100) {
          setIndex((currentIndex) => (currentIndex + 1) % memories.length);
          return 0;
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing, memories.length]);

  if (!memory) {
    return null;
  }

  const firstAnswer = memory.answers[0];

  return (
    <div className="screen reel-stage">
      <img key={memory.id} src={memory.image} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", animation: "kenburns 8s ease-out forwards" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 25%, transparent 60%, rgba(0,0,0,0.9) 100%)" }} />
      <StatusBar onPhoto />
      <div className="reel-progress">
        {memories.map((candidate, candidateIndex) => (
          <div key={candidate.id} className="reel-progress-bar">
            <i style={{ width: candidateIndex < index ? "100%" : candidateIndex === index ? `${progress}%` : "0%" }} />
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", top: 80, left: 16, right: 16, display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 5, color: "#fff" }}>
        <button className="btn-icon" style={{ background: "rgba(255,255,255,0.16)", borderColor: "rgba(255,255,255,0.2)", color: "#fff" }} onClick={() => onNav("today")}><Icon name="close" size={18} /></button>
        <div style={{ textAlign: "center" }}>
          <div className="eyebrow" style={{ color: "rgba(255,255,255,0.7)" }}>Your reel - Day {hotel.stayDay} of {hotel.stayLength}</div>
        </div>
        <button className="btn-icon" style={{ background: "rgba(255,255,255,0.16)", borderColor: "rgba(255,255,255,0.2)", color: "#fff" }} onClick={() => setPlaying((current) => !current)}>
          <Icon name={playing ? "pause" : "play"} size={18} />
        </button>
      </div>
      <div className="reel-caption">
        <div className="eyebrow" style={{ color: "rgba(255,255,255,0.7)", marginBottom: 10 }}>{memory.when}</div>
        <h2 className="display" style={{ fontSize: 42, color: "#fff", lineHeight: 1, marginBottom: 18, textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}>{memory.title}</h2>
        {firstAnswer ? (
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{ width: 2, alignSelf: "stretch", background: "var(--accent)", borderRadius: 1 }} />
            <div>
              <div className="serif-italic" style={{ fontSize: 14, opacity: 0.85, marginBottom: 4 }}>{firstAnswer.q}</div>
              <p className="serif" style={{ fontSize: 19, lineHeight: 1.35, color: "#fff", textShadow: "0 2px 16px rgba(0,0,0,0.6)" }}>{firstAnswer.a}</p>
            </div>
          </div>
        ) : null}
      </div>
      <button onClick={() => { setIndex((current) => Math.max(0, current - 1)); setProgress(0); }} style={{ position: "absolute", left: 0, top: 0, width: "33%", height: "100%", background: "transparent", zIndex: 2 }} aria-label="Previous memory" />
      <button onClick={() => { setIndex((current) => (current + 1) % memories.length); setProgress(0); }} style={{ position: "absolute", right: 0, top: 0, width: "33%", height: "100%", background: "transparent", zIndex: 2 }} aria-label="Next memory" />
      <div style={{ position: "absolute", bottom: 32, left: 24, right: 24, zIndex: 5, display: "flex", gap: 10 }}>
        <button className="btn btn-accent" style={{ flex: 1 }} onClick={() => onNav("share")}><Icon name="share" size={14} /> Share my reel</button>
        <button className="btn btn-ghost" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", borderColor: "rgba(255,255,255,0.2)" }} onClick={() => onNav("today")}>Edit</button>
      </div>
    </div>
  );
}

function ShareScreen({ onNav, memories }: { onNav: (screen: Screen) => void; memories: Memory[] }) {
  return (
    <div className="screen" style={{ background: "var(--surface)" }}>
      <StatusBar />
      <div className="screen-scroll" style={{ paddingBottom: 40 }}>
        <PageHeader onBack={() => onNav("reel")} />
        <div className="pad-x">
          <div className="eyebrow" style={{ marginBottom: 8 }}>Share your reel</div>
          <h1 className="display" style={{ fontSize: 40, lineHeight: 1, marginBottom: 8 }}>
            Take Rosa di Vento<br />
            <em className="serif-italic">home with you.</em>
          </h1>
          <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.5, marginBottom: 28 }}>A 45-second story of your stay, with your words. You can edit anything before it goes out.</p>
          <div style={{ position: "relative", height: 220, borderRadius: 22, overflow: "hidden", marginBottom: 28, background: "#000" }}>
            <div style={{ position: "absolute", inset: 0, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gridTemplateRows: "1fr 1fr" }}>
              {memories.slice(0, 6).map((memory) => <img key={memory.id} src={memory.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />)}
            </div>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.5) 100%)" }} />
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, color: "#fff" }}>
              <button onClick={() => onNav("reel")} style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(255,255,255,0.2)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                <Icon name="play" size={22} />
              </button>
              <div className="serif-italic" style={{ fontSize: 16 }}>0:45 - {memories.length} moments</div>
            </div>
          </div>
          <div className="eyebrow" style={{ marginBottom: 14 }}>Send to</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            <ShareRow icon="instagram" label="Instagram" sub="Post to story or feed" />
            <ShareRow icon="facebook" label="Facebook" sub="Share with friends and family" />
            <ShareRow icon="tiktok" label="TikTok" sub="Vertical 9:16 cut" />
            <ShareRow icon="save" label="Save to camera roll" sub="Full quality video" />
          </div>
          <div className="divider" style={{ margin: "8px 0 20px" }} />
          <button style={{ width: "100%", padding: 16, borderRadius: 18, border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--accent-soft)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="heart" size={18} />
              </div>
              <div style={{ textAlign: "left" }}>
                <div className="serif" style={{ fontSize: 17 }}>Send to Rosa di Vento</div>
                <div style={{ fontSize: 11, color: "var(--ink-3)" }}>So we can remember you, too.</div>
              </div>
            </div>
            <Icon name="arrow-right" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ShareRow({ icon, label, sub }: { icon: string; label: string; sub: string }) {
  return (
    <button style={{ display: "flex", alignItems: "center", gap: 14, padding: 14, background: "var(--bg)", border: "1px solid var(--line)", borderRadius: 18, textAlign: "left" }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--ink)", color: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name={icon} size={20} />
      </div>
      <div style={{ flex: 1 }}>
        <div className="serif" style={{ fontSize: 18 }}>{label}</div>
        <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 1 }}>{sub}</div>
      </div>
      <Icon name="arrow-up-right" size={16} />
    </button>
  );
}

function SettingsScreen({ onNav, palette, setPalette }: { onNav: (screen: Screen | "back") => void; palette: string; setPalette: (palette: string) => void }) {
  const palettes = useMemo(() => ["sand", "rose", "sage", "midnight"], []);

  return (
    <div className="screen" style={{ background: "var(--bg)" }}>
      <StatusBar />
      <div className="screen-scroll">
        <PageHeader onBack={() => onNav("back")} title="Your stay" />
        <div className="pad-x" style={{ paddingTop: 20 }}>
          <div className="serif" style={{ fontSize: 24, marginBottom: 8 }}>Rosa di Vento</div>
          <div style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 24 }}>Day 3 of 5 - Suite 14 - Lina + Grace</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
            {palettes.map((nextPalette) => (
              <Chip key={nextPalette} active={palette === nextPalette} onClick={() => setPalette(nextPalette)}>
                {nextPalette}
              </Chip>
            ))}
          </div>
          {[
            { label: "Capture reminders", value: "Twice a day" },
            { label: "Privacy", value: "Memories stay with you" },
            { label: "Reel length", value: "45 seconds" },
            { label: "Concierge", value: "Press to call" },
            { label: "Sign out", value: "" },
          ].map((row) => (
            <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "16px 0", borderBottom: "1px solid var(--line)" }}>
              <span className="serif" style={{ fontSize: 17 }}>{row.label}</span>
              <span style={{ fontSize: 13, color: "var(--ink-3)" }}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
