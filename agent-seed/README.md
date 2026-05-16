# `agent-seed/` — How to Load the Memory into ElevenLabs

This folder seeds the ElevenLabs voice agent with one guest's full Rosewood history so the demo can prove **post-stay relationship continuity**, not just in-stay memory capture.

## Files

| File | Where it goes in the ElevenLabs dashboard |
|---|---|
| `grace-profile.md` | **Knowledge Base** — upload as a document the agent can retrieve from |
| `system-prompt.md` | **Agent → System prompt** — paste the body (everything after the `---`) |
| `first-message.md` | **Agent → First message / Initial response** — paste the verbatim block under "First message (verbatim)" |
| `seed-faq.md` | Demo script. Not loaded into ElevenLabs. Use it to test that the agent is actually answering the painpoint. |

## Step-by-step

1. Open the ElevenLabs dashboard → **Conversational AI** → your agent (`agent_1301krryssveft28da7hs1ckxxjg`).
2. **Knowledge Base** → Add document → upload `grace-profile.md`. Wait for indexing to finish.
3. **Agent settings → System prompt** → paste the body of `system-prompt.md`.
4. **Agent settings → First message** → paste the verbatim first message from `first-message.md`.
5. **LLM** → set to **Claude Haiku 4.5** for fast, human-feeling turn-taking.
6. Save. Reload http://localhost:3000 in the browser and start a voice note — the agent should now greet you the way the first message reads.

## Customizing

- The whole profile is Markdown. Edit it the same way you'd edit notes. The agent picks up changes on the next knowledge-base re-index.
- If you swap the guest, swap **Grace** and **Mark** throughout `grace-profile.md`, then re-upload.
- Stay history is structured as one section per stay (`### N. Rosewood <Property> — <Month Year> — <occasion>`). Keep that shape and you can add stays without touching the system prompt.

## Why the seed is shaped this way

The painpoint is post-stay continuity — anniversaries, return trips, cross-property cultural programming, global Rosewood continuity. The seed is built so the agent can demonstrate each of those in a single conversation:

- **Anniversaries** — explicit calendar with real prior moments anchored to specific restaurants and dates
- **Return-trip anticipation** — "open threads" list (Phang Nga longtail, Reims day trip) the agent can offer to close
- **Cross-property cultural programming** — a list of current programs at multiple properties, each tagged to a known interest
- **Cross-property continuity** — preferences (spa timing, cigar story) stated once and re-usable everywhere

`seed-faq.md` is the answer-shaped version: a script of questions a judge would ask, with the answer the agent should be able to give.
