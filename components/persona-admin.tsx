"use client";

import { useEffect, useState } from "react";
import { voiceCatalog, type VoicePersona } from "@/lib/mock-data";
import {
  loadDraftPersona,
  loadPublishedPersona,
  saveDraftPersona,
  savePublishedPersona,
} from "@/lib/session-store";

export function PersonaAdmin() {
  const [draft, setDraft] = useState<VoicePersona | null>(null);
  const [published, setPublished] = useState<VoicePersona | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      setPublished(loadPublishedPersona());
      setDraft(loadDraftPersona());
    });
  }, []);

  useEffect(() => {
    if (draft) {
      saveDraftPersona(draft);
    }
  }, [draft]);

  if (!draft || !published) {
    return null;
  }

  const selectedVoice = voiceCatalog.find((voice) => voice.id === draft.voiceId) ?? voiceCatalog[0];

  const updateDraft = (patch: Partial<VoicePersona>) => {
    setDraft((current) => {
      if (!current) {
        return current;
      }

      const nextVoice = patch.voiceId
        ? voiceCatalog.find((voice) => voice.id === patch.voiceId)
        : undefined;

      return {
        ...current,
        ...patch,
        voiceName: nextVoice?.name ?? patch.voiceName ?? current.voiceName,
      };
    });
  };

  const publish = () => {
    const next = {
      ...draft,
      publishedAt: new Date().toISOString(),
    };

    savePublishedPersona(next);
    setPublished(next);
    setDraft(next);
  };

  return (
    <section className="card admin-card" aria-labelledby="persona-title">
      <div className="section-heading">
        <p className="eyebrow">Property configuration</p>
        <h2 id="persona-title">Voice persona</h2>
        <p>
          Keep one published persona for live guest sessions while editing a draft for preview.
        </p>
      </div>

      <div className="form-grid">
        <label>
          Property
          <input
            value={draft.property}
            onChange={(event) => updateDraft({ property: event.target.value })}
          />
        </label>

        <label>
          Voice
          <select
            value={draft.voiceId}
            onChange={(event) => updateDraft({ voiceId: event.target.value })}
          >
            {voiceCatalog.map((voice) => (
              <option key={voice.id} value={voice.id}>
                {voice.name}
              </option>
            ))}
          </select>
          <span className="field-hint">{selectedVoice.description}</span>
        </label>

        <label className="wide-field">
          Persona guidelines
          <textarea
            rows={4}
            value={draft.tone}
            onChange={(event) => updateDraft({ tone: event.target.value })}
          />
        </label>

        <label className="wide-field">
          Property knowledge base
          <textarea
            rows={5}
            value={draft.knowledgeBase}
            onChange={(event) => updateDraft({ knowledgeBase: event.target.value })}
          />
        </label>
      </div>

      <div className="preview-grid">
        <div className="preview-card">
          <span>Draft preview</span>
          <h3>{draft.voiceName}</h3>
          <p>{draft.tone}</p>
          <small>{draft.knowledgeBase}</small>
        </div>
        <div className="preview-card">
          <span>Published persona</span>
          <h3>{published.voiceName}</h3>
          <p>{published.tone}</p>
          <small>
            {published.publishedAt
              ? `Published ${new Date(published.publishedAt).toLocaleString()}`
              : "Not published yet"}
          </small>
        </div>
      </div>

      <div className="actions">
        <button className="primary-button" onClick={publish} type="button">
          Publish persona
        </button>
        <button className="secondary-button" onClick={() => setDraft(published)} type="button">
          Reset draft
        </button>
      </div>
    </section>
  );
}
