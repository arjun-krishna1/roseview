# Roseview

Roseview turns your best hotel memories into lasting relationships.

It is a guest experience app for luxury hotels that helps travelers capture short video memories throughout their stay, uses simple back-and-forth conversation to make those memories richer, and turns the moments into a shareable reel at checkout.

## Core Experience

- **Conversational capture:** Roseview asks guests simple questions, saves the back-and-forth with each memory, and uses those answers as story context.
- **Memory prompts:** Roseview nudges guests to record short video memories during key moments of their trip.
- **End-of-trip reel:** At checkout, Roseview plays the guest's memory videos as a simple reel preview.
- **Social sharing:** Guests can quickly share their finished reel to Instagram or Facebook.

## Current Prototype

The app currently includes a simple end-to-end memory flow:

1. Roseview presents a lightweight memory prompt.
2. Roseview asks a few follow-up questions about the moment.
3. Guests record a short browser camera video for that memory.
4. The saved memory keeps the video metadata and conversation context together.
5. The reel preview plays captured clips and shows the guest's answers as story context.
6. Instagram and Facebook buttons are present as visual calls to action for the sharing flow.

## Tech Stack

- Next.js
- React
- TypeScript
- ESLint

## Getting Started

Install dependencies:

```bash
npm install
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
