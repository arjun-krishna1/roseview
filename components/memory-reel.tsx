"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { MemoryClip } from "@/lib/memory-data";

type MemoryReelProps = {
  clips: MemoryClip[];
};

export function MemoryReel({ clips }: MemoryReelProps) {
  const playableClips = useMemo(() => clips.filter((clip) => clip.url), [clips]);
  const [activeIndex, setActiveIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const safeActiveIndex = playableClips.length
    ? Math.min(activeIndex, playableClips.length - 1)
    : 0;
  const activeClip = playableClips[safeActiveIndex];
  const guestAnswers = activeClip?.conversation.filter((turn) => turn.speaker === "guest") ?? [];

  useEffect(() => {
    if (!videoRef.current || !activeClip?.url) {
      return;
    }

    videoRef.current.load();
  }, [activeClip?.url]);

  const goToNextClip = () => {
    if (!playableClips.length) {
      return;
    }

    setActiveIndex((current) => (current + 1) % playableClips.length);
  };

  const goToPreviousClip = () => {
    if (!playableClips.length) {
      return;
    }

    setActiveIndex((current) => (current === 0 ? playableClips.length - 1 : current - 1));
  };

  return (
    <section className="panel reel-panel" aria-labelledby="reel-title">
      <div className="section-kicker">End-of-trip reel</div>
      <div className="section-heading">
        <h2 id="reel-title">Your memory reel</h2>
        <p>
          A stitched-style preview that plays your captured memories in sequence. Export is mocked
          for now, with post buttons ready for the demo flow.
        </p>
      </div>

      <div className="reel-frame">
        {activeClip?.url ? (
          <video
            controls
            key={activeClip.id}
            onEnded={goToNextClip}
            playsInline
            ref={videoRef}
          >
            <source src={activeClip.url} type={activeClip.mimeType ?? "video/webm"} />
          </video>
        ) : (
          <div className="empty-reel">
            <span>0 clips</span>
            <strong>Capture a few short memories to preview the reel.</strong>
          </div>
        )}
      </div>

      <div className="reel-meta">
        <div>
          <span>Now playing</span>
          <strong>{activeClip?.title ?? "No clips yet"}</strong>
          <small>{activeClip ? `${activeClip.amenityName} - ${activeClip.durationLabel}` : ""}</small>
        </div>
        <div className="reel-controls">
          <button className="quiet-button" onClick={goToPreviousClip} type="button">
            Previous
          </button>
          <button className="quiet-button" onClick={goToNextClip} type="button">
            Next
          </button>
        </div>
      </div>

      {activeClip ? (
        <div className="reel-story">
          <span>Story context</span>
          {guestAnswers.length ? (
            <ul>
              {guestAnswers.map((answer) => (
                <li key={answer.id}>{answer.text}</li>
              ))}
            </ul>
          ) : (
            <p>Add a few conversation answers before recording to make this reel feel personal.</p>
          )}
        </div>
      ) : null}

      <div className="social-row" aria-label="Social post actions">
        <button className="social-button instagram-button" type="button">
          Post to Instagram
        </button>
        <button className="social-button facebook-button" type="button">
          Post to Facebook
        </button>
      </div>
      <p className="share-note">
        These buttons are visual calls to action for now. In a production version, they would hand
        off to a download/share flow or Meta publishing integration.
      </p>
    </section>
  );
}
