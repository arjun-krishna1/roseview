"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  memoryPrompts,
  type MemoryAmenity,
  type MemoryClip,
  type MemoryConversationTurn,
} from "@/lib/memory-data";

type MemoryCaptureProps = {
  clips: MemoryClip[];
  selectedAmenity: MemoryAmenity;
  onAddClip: (clip: MemoryClip) => void;
  onDeleteClip: (clipId: string) => void;
};

type ConversationDraft = {
  amenityId: string;
  answerText: string;
  questionIndex: number;
  turns: MemoryConversationTurn[];
};

const MAX_RECORDING_SECONDS = 20;

const getSupportedMimeType = () => {
  if (typeof MediaRecorder === "undefined") {
    return "";
  }

  const preferredTypes = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"];
  return preferredTypes.find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
};

const formatClock = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const remainingSeconds = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
};

const getConversationQuestions = (amenity: MemoryAmenity) => [
  `What do you want to remember about ${amenity.name}?`,
  "What happened right before this moment?",
  "What detail should Roseview include when it tells this story later?",
];

const getOpeningTurn = (amenity: MemoryAmenity): MemoryConversationTurn => ({
  id: `${amenity.id}-roseview-0`,
  speaker: "roseview",
  text: getConversationQuestions(amenity)[0],
});

const createConversationDraft = (amenity: MemoryAmenity): ConversationDraft => ({
  amenityId: amenity.id,
  answerText: "",
  questionIndex: 0,
  turns: [getOpeningTurn(amenity)],
});

export function MemoryCapture({
  clips,
  selectedAmenity,
  onAddClip,
  onDeleteClip,
}: MemoryCaptureProps) {
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [conversationDraft, setConversationDraft] = useState<ConversationDraft>(() =>
    createConversationDraft(selectedAmenity),
  );
  const [stream, setStream] = useState<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const startedAtRef = useRef<number>(0);
  const previewRef = useRef<HTMLVideoElement | null>(null);
  const activeConversationDraft =
    conversationDraft.amenityId === selectedAmenity.id
      ? conversationDraft
      : createConversationDraft(selectedAmenity);
  const conversationQuestions = useMemo(
    () => getConversationQuestions(selectedAmenity),
    [selectedAmenity],
  );

  useEffect(() => {
    if (previewRef.current) {
      previewRef.current.srcObject = stream;
    }
  }, [stream]);

  const stopStream = useCallback(() => {
    setStream((current) => {
      current?.getTracks().forEach((track) => track.stop());
      return null;
    });
  }, []);

  const stopRecording = useCallback(() => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
  }, []);

  useEffect(() => {
    if (!isRecording) {
      return;
    }

    const interval = window.setInterval(() => {
      const nextElapsed = Math.floor((Date.now() - startedAtRef.current) / 1000);
      setElapsedSeconds(nextElapsed);

      if (nextElapsed >= MAX_RECORDING_SECONDS) {
        stopRecording();
      }
    }, 250);

    return () => window.clearInterval(interval);
  }, [isRecording, stopRecording]);

  useEffect(() => {
    return () => {
      recorderRef.current = null;
      stopStream();
    };
  }, [stopStream]);

  const startRecording = async () => {
    if (typeof MediaRecorder === "undefined") {
      setError("This browser does not support MediaRecorder video capture.");
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Camera access is not available in this browser.");
      return;
    }

    try {
      setError(null);
      const nextStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: { facingMode: "environment" },
      });
      const mimeType = getSupportedMimeType();
      const recorder = new MediaRecorder(nextStream, mimeType ? { mimeType } : undefined);

      chunksRef.current = [];
      startedAtRef.current = Date.now();
      recorderRef.current = recorder;
      setElapsedSeconds(0);
      setStream(nextStream);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const durationSeconds = Math.max(
          1,
          Math.round((Date.now() - startedAtRef.current) / 1000),
        );
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "video/webm" });
        const url = URL.createObjectURL(blob);
        const capturedAt = new Date();

        onAddClip({
          id: crypto.randomUUID(),
          title: `${selectedAmenity.name} memory`,
          prompt: selectedAmenity.prompt,
          amenityId: selectedAmenity.id,
          amenityName: selectedAmenity.name,
          capturedAt: capturedAt.toISOString(),
          durationLabel: formatClock(durationSeconds),
          conversation: activeConversationDraft.turns,
          mimeType: blob.type,
          url,
        });

        chunksRef.current = [];
        recorderRef.current = null;
        setIsRecording(false);
        setElapsedSeconds(0);
        stopStream();
      };

      recorder.start();
      setIsRecording(true);
    } catch {
      setError("Camera permission was denied or the camera could not be opened.");
      stopStream();
    }
  };

  const addConversationAnswer = () => {
    const trimmedAnswer = activeConversationDraft.answerText.trim();

    if (!trimmedAnswer) {
      return;
    }

    const nextQuestionIndex = activeConversationDraft.questionIndex + 1;
    const nextTurns: MemoryConversationTurn[] = [
      ...activeConversationDraft.turns,
      {
        id: `guest-${Date.now()}`,
        speaker: "guest",
        text: trimmedAnswer,
      },
    ];

    if (nextQuestionIndex < conversationQuestions.length) {
      nextTurns.push({
        id: `${selectedAmenity.id}-roseview-${nextQuestionIndex}`,
        speaker: "roseview",
        text: conversationQuestions[nextQuestionIndex],
      });
    }

    setConversationDraft({
      amenityId: selectedAmenity.id,
      answerText: "",
      questionIndex: Math.min(nextQuestionIndex, conversationQuestions.length - 1),
      turns: nextTurns,
    });
  };

  const resetConversation = () => {
    setConversationDraft(createConversationDraft(selectedAmenity));
  };

  return (
    <section className="panel capture-panel" aria-labelledby="capture-title">
      <div className="section-kicker">Capture throughout the trip</div>
      <div className="capture-grid">
        <div>
          <div className="section-heading">
            <h2 id="capture-title">Record a short memory</h2>
            <p>{selectedAmenity.prompt}</p>
          </div>

          <div className="prompt-stack">
            {memoryPrompts.map((prompt) => (
              <article className="prompt-card" key={prompt.id}>
                <span>{prompt.title}</span>
                <p>{prompt.body}</p>
              </article>
            ))}
          </div>

          <div className="conversation-card">
            <span>Conversation</span>
            <strong>Make the memory richer</strong>
            <div className="conversation-log" aria-live="polite">
              {activeConversationDraft.turns.map((turn) => (
                <p className={`conversation-turn conversation-turn-${turn.speaker}`} key={turn.id}>
                  <b>{turn.speaker === "roseview" ? "Roseview" : "You"}</b>
                  {turn.text}
                </p>
              ))}
            </div>
            <div className="answer-form">
              <textarea
                aria-label="Answer Roseview's memory question"
                onChange={(event) =>
                  setConversationDraft({
                    ...activeConversationDraft,
                    answerText: event.target.value,
                  })
                }
                placeholder="Add a short answer..."
                rows={3}
                value={activeConversationDraft.answerText}
              />
              <div>
                <button className="quiet-button" onClick={addConversationAnswer} type="button">
                  Add answer
                </button>
                <button className="text-button" onClick={resetConversation} type="button">
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="recorder-card">
          <div className={`camera-preview ${isRecording ? "camera-preview-live" : ""}`}>
            {stream ? (
              <video autoPlay muted playsInline ref={previewRef} />
            ) : (
              <div>
                <span>Ready</span>
                <strong>{selectedAmenity.name}</strong>
                <p>Open the camera and save a twenty second memory.</p>
              </div>
            )}
          </div>

          <div className="recorder-meta">
            <div>
              <span>{isRecording ? "Recording" : "Prompt"}</span>
              <strong>{isRecording ? formatClock(elapsedSeconds) : selectedAmenity.name}</strong>
            </div>
            {isRecording ? (
              <button className="record-button stop-button" onClick={stopRecording} type="button">
                Stop
              </button>
            ) : (
              <button className="record-button" onClick={startRecording} type="button">
                Capture memory
              </button>
            )}
          </div>

          {error ? <p className="inline-alert">{error}</p> : null}
        </div>
      </div>

      <div className="memory-library">
        <div className="library-heading">
          <div>
            <span>Memory library</span>
            <strong>{clips.length} saved clips</strong>
          </div>
          <small>Video blobs remain playable for the current browser session.</small>
        </div>

        {clips.length ? (
          <div className="clip-list">
            {clips.map((clip) => (
              <article className="clip-card" key={clip.id}>
                {clip.url ? (
                  <video controls playsInline src={clip.url} />
                ) : (
                  <div className="clip-placeholder">Preview unavailable after refresh</div>
                )}
                <div>
                  <span>{new Date(clip.capturedAt).toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  })}</span>
                  <strong>{clip.title}</strong>
                  <p>{clip.prompt}</p>
                  {clip.conversation.length ? (
                    <p className="clip-conversation">
                      {clip.conversation.filter((turn) => turn.speaker === "guest").length} saved
                      answers for the reel story
                    </p>
                  ) : null}
                  <small>
                    {clip.amenityName} - {clip.durationLabel}
                  </small>
                </div>
                <button className="text-button" onClick={() => onDeleteClip(clip.id)} type="button">
                  Delete
                </button>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-library">
            Your trip reel begins with the first memory you capture.
          </div>
        )}
      </div>
    </section>
  );
}
