"use client";

import { useEffect, useRef, useState } from "react";
import { MemoryCapture } from "@/components/memory-capture";
import { MemoryMap } from "@/components/memory-map";
import { MemoryReel } from "@/components/memory-reel";
import {
  defaultAmenity,
  trip,
  type MemoryAmenity,
  type MemoryClip,
} from "@/lib/memory-data";

const CLIP_METADATA_KEY = "roseview.memoryClipMetadata";

const loadClipMetadata = (): MemoryClip[] => {
  try {
    const stored = window.localStorage.getItem(CLIP_METADATA_KEY);
    const parsedClips = stored ? (JSON.parse(stored) as MemoryClip[]) : [];

    return parsedClips.map((clip) => ({
      ...clip,
      conversation: clip.conversation ?? [],
    }));
  } catch {
    return [];
  }
};

const saveClipMetadata = (clips: MemoryClip[]) => {
  const metadata = clips.map((clip) => ({
    ...clip,
    url: undefined,
  }));
  window.localStorage.setItem(CLIP_METADATA_KEY, JSON.stringify(metadata));
};

export default function Home() {
  const [selectedAmenity, setSelectedAmenity] = useState<MemoryAmenity>(defaultAmenity);
  const [clips, setClips] = useState<MemoryClip[]>([]);
  const hasLoadedMetadata = useRef(false);

  useEffect(() => {
    queueMicrotask(() => {
      setClips(loadClipMetadata());
      hasLoadedMetadata.current = true;
    });
  }, []);

  useEffect(() => {
    if (!hasLoadedMetadata.current) {
      return;
    }

    saveClipMetadata(clips);
  }, [clips]);

  const addClip = (clip: MemoryClip) => {
    setClips((current) => [clip, ...current]);
  };

  const deleteClip = (clipId: string) => {
    setClips((current) => {
      const clipToDelete = current.find((clip) => clip.id === clipId);
      if (clipToDelete?.url) {
        URL.revokeObjectURL(clipToDelete.url);
      }

      return current.filter((clip) => clip.id !== clipId);
    });
  };

  return (
    <main className="app-shell">
      <section className="brand-hero" aria-labelledby="hero-title">
        <div className="brand-mark" aria-hidden="true">
          <span />
        </div>
        <div className="hero-copy">
          <p className="section-kicker">Roseview</p>
          <h1 id="hero-title">Capture the memories that make the stay yours.</h1>
          <p>{trip.tagline}</p>
        </div>
        <div className="trip-card">
          <span>A sense of place</span>
          <strong>{trip.property}</strong>
          <small>
            {trip.location} - {trip.dates} - For {trip.guestName}
          </small>
        </div>
      </section>

      <div className="memory-layout">
        <MemoryCapture
          clips={clips}
          onAddClip={addClip}
          onDeleteClip={deleteClip}
          selectedAmenity={selectedAmenity}
        />
        <div className="side-rail">
          <MemoryReel clips={clips} />
          <MemoryMap
            onSelectAmenity={setSelectedAmenity}
            selectedAmenity={selectedAmenity}
          />
        </div>
      </div>
    </main>
  );
}
