# Roseview

**Post-Stay Relationship Continuity for Rosewood Hotels.**

For most hotels, the guest relationship effectively ends at checkout. Roseview is a hyper-personalized guest memory engine that turns the moments of a stay into the connective tissue of a long-term relationship — remembering anniversaries, anticipating return trips, connecting guests with local Rosewood cultural programming even when they're not on property, and creating continuity across every Rosewood location worldwide.

## The Challenge We Answer

> Build a post-stay engagement system that maintains a genuine, non-spammy connection: remembering anniversaries, anticipating return trips, connecting guests with local Rosewood cultural programming even when they're not on property, and creating continuity across global Rosewood locations.

Roseview captures something almost no CRM has — the **emotional context** of a guest's stay, in the guest's own voice. Those memories become the foundation for outreach that feels personal rather than transactional, and for cross-property continuity that turns one stay into a lifelong Rosewood relationship.

## How It Works

### During the stay — capture the memory, not just the booking

- **Conversational capture (ElevenLabs voice agent):** Roseview talks with guests in natural, human-like conversation, asking simple questions about each moment and saving the back-and-forth alongside the memory.
- **Memory prompts at key moments:** The app nudges guests to record short video memories at the points that matter — arrival, the first sunset, a tasting, the spa, a local discovery.
- **Memory map:** Guests browse hotel amenities and nearby experiences chosen to spark memorable moments, so capture is woven into discovery.

### At checkout — the reel they want to share

- **End-of-trip reel:** Roseview stitches the captured videos and conversations into a shareable reel preview the guest sees before they leave.
- **Social sharing:** One-tap Instagram and Facebook handoff turns the stay into earned reach for the property.

### After the stay — the relationship continues

This is the heart of Roseview, and what sets it apart from a guest CRM:

- **Anniversary recognition:** Each captured memory carries its own date and emotional context, so the system can resurface "a year ago today" moments — a postcard from the suite they stayed in, a video from the chef they met — instead of a generic anniversary email.
- **Return-trip anticipation:** The voice transcripts and answers reveal what the guest actually loved (the tide-pool walk, the cliffside terrace, the ceramic studio nearby). When the right window opens — a season, a package, a cultural event — Roseview surfaces a tailored invitation rather than a discount blast.
- **Local Rosewood cultural programming, wherever the guest is:** Roseview maps a guest's expressed interests against Rosewood's cultural calendar across all properties. A Cabo guest who loved a maker's market gets invited to an artisan dinner at Rosewood Mayakoba; a guest who fell for a sommelier's pairing gets a heads-up about a vintner residency in São Paulo.
- **Cross-property continuity:** The memory profile travels with the guest. A returning guest at any Rosewood property is greeted with context — preferred room types, dietary notes, the moments they'd told staff mattered — so the second stay starts where the first one left off.

## Why It Doesn't Feel Spammy

Every post-stay touchpoint is anchored in something the guest *said* or *did* on property, not in a marketing segment. Roseview only reaches out when there is a real reason to — an anniversary worth remembering, a cultural event that matches a stated interest, a return-window the guest hinted at in conversation. The voice transcripts mean every message can reference a specific moment in the guest's own words, which is the opposite of generic CRM blasts.

## Tech Stack

- **Next.js 16** (App Router, Turbopack) — frontend and API routes
- **React 19 / TypeScript** — UI
- **ElevenLabs Conversational AI** — voice agent for natural, low-latency in-room conversations
- **Anthropic Claude Haiku 4.5** — fast, human-feeling reasoning for follow-up questions, reel narration, anniversary cues, and cross-property recommendations
- **ESLint** — code quality

## Current Prototype

The app currently includes a simple end-to-end memory flow demonstrating the capture side of the experience:

1. Guests choose an amenity or nearby experience from the memory map.
2. The ElevenLabs voice agent asks a few lightweight follow-up questions about the moment.
3. Guests record a short browser camera video for that memory.
4. The saved memory keeps the video metadata, transcript, and conversation context together.
5. The reel preview plays captured clips and shows the guest's answers as story context.
6. Instagram and Facebook buttons are present as visual calls to action for the sharing flow.

The post-stay engagement layer (anniversary surfacing, return-trip prompts, cross-property cultural matching) builds on top of this captured memory graph.

## Getting Started

Install dependencies:

```bash
npm install
```

Set up environment variables in `.env.local`:

```
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=agent_...
ELEVENLABS_API_KEY=sk_...
ANTHROPIC_API_KEY=sk-ant-...
```

Run the development server:

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## Available Scripts

- `npm run dev` starts the local development server.
- `npm run build` creates a production build.
- `npm run start` runs the production build.
- `npm run typecheck` runs TypeScript checks.
- `npm run lint` runs ESLint.
