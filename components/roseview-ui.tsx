"use client";

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";

type IconProps = {
  name: string;
  size?: number;
  stroke?: number;
};

export function Icon({ name, size = 22, stroke = 1.5 }: IconProps) {
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: stroke,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (name) {
    case "home":
      return <svg {...props}><path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" /></svg>;
    case "map":
      return <svg {...props}><path d="M9 3 3 5v16l6-2 6 2 6-2V3l-6 2zM9 3v16M15 5v16" /></svg>;
    case "journal":
      return <svg {...props}><path d="M5 4h14v16H5z" /><path d="M9 4v16M9 9h10M9 14h10" /></svg>;
    case "camera":
      return <svg {...props}><path d="M4 7h3l2-3h6l2 3h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z" /><circle cx="12" cy="13" r="4" /></svg>;
    case "mic":
      return <svg {...props}><rect x="9" y="3" width="6" height="12" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>;
    case "play":
      return <svg {...props} fill="currentColor" stroke="none"><path d="M8 5v14l11-7z" /></svg>;
    case "pause":
      return <svg {...props} fill="currentColor" stroke="none"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>;
    case "arrow-left":
      return <svg {...props}><path d="M19 12H5M12 5l-7 7 7 7" /></svg>;
    case "arrow-right":
      return <svg {...props}><path d="M5 12h14M12 5l7 7-7 7" /></svg>;
    case "arrow-up-right":
      return <svg {...props}><path d="M7 17 17 7M9 7h8v8" /></svg>;
    case "close":
      return <svg {...props}><path d="M6 6l12 12M18 6 6 18" /></svg>;
    case "check":
      return <svg {...props}><path d="M5 12.5 10 17 19 7" /></svg>;
    case "share":
      return <svg {...props}><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v14" /></svg>;
    case "type":
      return <svg {...props}><path d="M4 7V5h16v2M9 5v14M9 19h6" /></svg>;
    case "sparkle":
      return <svg {...props} fill="currentColor" stroke="none"><path d="M12 2l1.6 5.4L19 9l-5.4 1.6L12 16l-1.6-5.4L5 9l5.4-1.6zM19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8z" /></svg>;
    case "instagram":
      return <svg {...props}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" /></svg>;
    case "facebook":
      return <svg {...props}><path d="M14 3h-2a4 4 0 0 0-4 4v3H5v4h3v7h4v-7h3l1-4h-4V7a1 1 0 0 1 1-1h2z" /></svg>;
    case "tiktok":
      return <svg {...props}><path d="M14 3v10.5a3.5 3.5 0 1 1-3.5-3.5" /><path d="M14 3c0 2.8 2.2 5 5 5" /></svg>;
    case "save":
      return <svg {...props}><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>;
    case "pin":
      return <svg {...props}><path d="M12 22s7-7.6 7-13a7 7 0 1 0-14 0c0 5.4 7 13 7 13z" /><circle cx="12" cy="9" r="2.5" /></svg>;
    case "clock":
      return <svg {...props}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
    case "more":
      return <svg {...props} fill="currentColor" stroke="none"><circle cx="5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="19" cy="12" r="1.6" /></svg>;
    case "menu":
      return <svg {...props}><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
    case "heart":
      return <svg {...props}><path d="M20 8a5 5 0 0 0-9-3 5 5 0 0 0-9 3c0 7 9 12 9 12s9-5 9-12z" /></svg>;
    default:
      return <svg {...props}><circle cx="12" cy="12" r="9" /></svg>;
  }
}

export function StatusBar({ onPhoto = false, time = "9:41" }: { onPhoto?: boolean; time?: string }) {
  return (
    <div className={`status-bar ${onPhoto ? "on-photo" : ""}`}>
      <div>{time}</div>
      <div className="notch" />
      <div className="right">
        <svg width="18" height="11" viewBox="0 0 18 11" fill="none">
          <rect x="0.5" y="3" width="3" height="6" rx="0.5" fill="currentColor" />
          <rect x="5" y="1.5" width="3" height="7.5" rx="0.5" fill="currentColor" />
          <rect x="9.5" y="0" width="3" height="9" rx="0.5" fill="currentColor" />
          <rect x="14" y="-0.5" width="3" height="9.5" rx="0.5" fill="currentColor" opacity="0.4" />
        </svg>
        <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
          <rect x="0.5" y="0.5" width="13" height="9" rx="2" stroke="currentColor" />
          <rect x="2" y="2" width="9" height="6" rx="1" fill="currentColor" />
          <rect x="14" y="3.5" width="1.5" height="3" rx="0.5" fill="currentColor" />
        </svg>
      </div>
    </div>
  );
}

export function TabBar({ active, onNav }: { active: string; onNav: (id: string) => void }) {
  const tabs = [
    { id: "today", label: "Today", icon: "home" },
    { id: "capture", capture: true },
    { id: "reel", label: "Reel", icon: "play" },
  ];

  return (
    <div className="tabbar" role="tablist">
      {tabs.map((tab) => {
        if (tab.capture) {
          return (
            <button key={tab.id} className="capture-tab" onClick={() => onNav("capture-conversation")} aria-label="Add a voice note">
              <div className="capture-btn">
                <Icon name="camera" size={24} stroke={1.5} />
              </div>
            </button>
          );
        }

        const isActive = active === tab.id;
        return (
          <button key={tab.id} className={`tab ${isActive ? "active" : ""}`} onClick={() => onNav(tab.id)} role="tab" aria-selected={isActive}>
            <Icon name={tab.icon ?? "home"} size={20} stroke={isActive ? 1.6 : 1.4} />
            <span className="label">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

type PageHeaderProps = {
  onBack: () => void;
  title?: string;
  eyebrow?: string;
  right?: ReactNode;
  light?: boolean;
};

export function PageHeader({ onBack, title, eyebrow, right, light = false }: PageHeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 20px 16px",
        color: light ? "#fff" : "var(--ink)",
      }}
    >
      <button
        className="btn-icon"
        onClick={onBack}
        aria-label="Back"
        style={{
          background: light ? "rgba(255,255,255,0.16)" : "var(--surface)",
          borderColor: light ? "rgba(255,255,255,0.2)" : "var(--line)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Icon name="arrow-left" size={18} />
      </button>
      {title ? (
        <div style={{ textAlign: "center", flex: 1 }}>
          {eyebrow ? <div className="eyebrow" style={{ marginBottom: 2, opacity: 0.7 }}>{eyebrow}</div> : null}
          <div className="serif" style={{ fontSize: 18, lineHeight: 1 }}>{title}</div>
        </div>
      ) : null}
      {right ?? <div style={{ width: 44 }} />}
    </div>
  );
}

export function Waveform({ active = true, bars = 28, height = 60 }: { active?: boolean; bars?: number; height?: number }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!active) {
      return undefined;
    }

    let id = 0;
    const tick = () => {
      setPhase((current) => current + 0.18);
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [active]);

  const heights = useMemo(() => Array.from({ length: bars }, (_, index) => ((index * 37) % 100) / 100), [bars]);

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 3, height }}>
      {heights.map((seed, index) => {
        const level = active ? Math.abs(Math.sin(phase * (0.6 + seed * 0.8) + index * 0.4)) : 0.2;
        const barHeight = 4 + level * (height - 8);
        return <div key={index} className="wave-bar" style={{ height: barHeight }} />;
      })}
    </div>
  );
}

export function MicButton({ recording, onClick, size = 96 }: { recording: boolean; onClick: () => void; size?: number }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: "50%",
        background: recording ? "var(--accent)" : "var(--ink)",
        color: recording ? "var(--accent-ink)" : "var(--bg)",
        boxShadow: "0 16px 32px -8px rgba(0,0,0,0.3)",
        transition: "all 0.3s ease",
      }}
    >
      {recording ? <span className="pulse-ring" /> : null}
      <Icon name="mic" size={size * 0.35} stroke={1.6} />
    </button>
  );
}

export function Chip({ children, active, onClick }: { children: ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        border: "1px solid",
        borderColor: active ? "var(--ink)" : "var(--line)",
        borderRadius: 100,
        background: active ? "var(--ink)" : "transparent",
        color: active ? "var(--bg)" : "var(--ink-2)",
        padding: "8px 14px",
        fontSize: 12,
        fontWeight: 500,
        letterSpacing: "0.06em",
        transition: "all 0.2s ease",
      }}
    >
      {children}
    </button>
  );
}

export function ConvoTurn({ role, text, transcribing = false }: { role: "guest" | "roseview"; text: string; transcribing?: boolean }) {
  const isGuest = role === "guest";
  return (
    <div style={{ display: "flex", justifyContent: isGuest ? "flex-end" : "flex-start", marginBottom: 8 }}>
      <div
        style={{
          maxWidth: "84%",
          border: isGuest ? "none" : "1px solid var(--line)",
          borderRadius: 22,
          borderBottomRightRadius: isGuest ? 6 : 22,
          borderBottomLeftRadius: isGuest ? 22 : 6,
          background: isGuest ? "var(--ink)" : "var(--surface)",
          color: isGuest ? "var(--bg)" : "var(--ink)",
          padding: "14px 18px",
          fontSize: 15,
          fontStyle: isGuest && transcribing ? "italic" : "normal",
          lineHeight: 1.45,
          opacity: transcribing ? 0.7 : 1,
        }}
      >
        {text}
        {transcribing ? <span style={{ marginLeft: 4, opacity: 0.6 }}>...</span> : null}
      </div>
    </div>
  );
}

export function cardStyle(extra?: CSSProperties): CSSProperties {
  return {
    border: "1px solid var(--line)",
    borderRadius: 22,
    background: "var(--surface)",
    ...extra,
  };
}
