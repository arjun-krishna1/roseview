# Seed FAQ — How Roseview Answers the Painpoint

This is the answer-shaped version of the seed: a list of questions a Rosewood executive or hackathon judge might ask, with the answer the agent should be able to demonstrate. Use it as a script for live demos.

**Painpoint being answered:**

> Post-Stay Relationship Continuity / Hyper-Personalized Guest Memory Engine — for most hotels, the guest relationship effectively ends at checkout. Build a post-stay engagement system that maintains a genuine, non-spammy connection: remembering anniversaries, anticipating return trips, connecting guests with local Rosewood cultural programming even when they're not on property, and creating continuity across global Rosewood locations.

---

## 1. "Does the agent actually remember a past stay, or is it pattern-matching?"

**Ask the agent:** *"Where did we celebrate our tenth anniversary?"*

**Agent should answer:** *"Rosewood Phuket — February of 2024. You had dinner at Ta Khai. The chef wrote 'Happy 10 years, Grace and Mark' on the menu and you've said since you'd like to come back there for your 20th."*

It names the property, the date, the restaurant, the moment, and the open intent for the next trip.

---

## 2. "Can it surface a preference that was set at a different Rosewood property?"

**Ask the agent:** *"Where does Mark get his cigars?"*

**Agent should answer:** *"From La Casa del Habano on rue de la Boétie — Olivier, the concierge at the Crillon in Paris, introduced him. Mark smoked a Cohíba Robusto in the courtyard that night with an Armagnac. If you'd like, I can have a box sourced wherever you're staying next."*

This is cross-property continuity — a fact established in Paris travels with the guest to Tuscany.

---

## 3. "Can it anticipate a return trip rather than just respond to one?"

**Ask the agent:** *"We're thinking about Paris again in September."*

**Agent should answer:** *"There's a Champagne masterclass at the Crillon in early September with the head sommelier — you mentioned the Krug pairing at L'Écrin was the reason you drink Champagne. I can hold two seats. And while we have you in Paris, we never did the Reims day trip — would you like me to set that up properly this time?"*

It connects the return window to (a) a current cultural program and (b) a previously open thread.

---

## 4. "Can it recognize an anniversary without being creepy?"

**Ask the agent:** *"What's coming up for us this year?"*

**Agent should answer:** *"February's the one. The 12th anniversary. The chef at Ta Khai still asks about you. There's no decision to make today — I just wanted you to know I was thinking about it. If you'd like, I'll put a soft hold on the Pavilion Villa for that week and you can confirm whenever."*

It names the date, ties it to a real prior moment, and offers one low-pressure next step.

---

## 5. "Does it know preferences that are about how I travel, not just where?"

**Ask the agent:** *"I'm feeling slow today."*

**Agent should answer:** *"Of course. The hot stones are open at 1:30 — eucalyptus, the way you like them. Nothing else on the schedule unless you ask."*

It applies the mid-day-spa preference without being asked, and stops there.

---

## 6. "Does it work across global Rosewood locations, or only the one I'm at?"

**Ask the agent:** *"My husband has been talking about a quiet weekend somewhere."*

**Agent should answer:** *"Madrid was that for him — Villa Magna, suckling lamb at Amós, Café Central until 2 AM. The next jazz night at the Magnum bar is in late June. I can hold a Suite Magna for you for the same weekend."*

It re-uses a prior stay as the template for the next one — same property, same restaurant, same kind of evening — and connects it to a current cultural program at that property.

---

## 7. "What does 'non-spammy' actually mean here?"

**Agent's posture (built into the system prompt):**

- It does not greet you with the anniversary date the moment you check in. It mentions it once, gently, anchored to a specific prior moment.
- It does not list options. It offers one or two.
- It does not chase. If you give it one word, it gives you one sentence.
- It does not pitch. It carries open threads forward and waits to be asked.

The non-spammy quality isn't a feature flag. It's a constraint baked into how the agent is allowed to speak — and it's enforced in the system prompt at `agent-seed/system-prompt.md`.

---

## 8. "Show me, end-to-end, how a returning guest experiences this."

Run the **first message** from `agent-seed/first-message.md`. That sequence:

1. Names a prior property + a prior moment ("Cohíba night in the Crillon courtyard")
2. Names her partner by name (Mark)
3. Applies a mid-day-spa preference without being asked
4. Surfaces one open thread (Phang Nga longtail) and offers — once — to close it
5. Ends with a question she can answer in one word

That's the demo. Five things, eight seconds, the relationship resumes.
