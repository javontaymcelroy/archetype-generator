# Archetype Generator

A coordinate system for human behavior patterns. Spin 9 independent reels to generate a character archetype — a psychological profile defined by what drives them, how they distort reality, and what forces their hand.

---

## How It Works

Each spin randomly selects one value per reel. The combination of all 9 values produces an **Archetypal Core** — a plain-language description of the behavioral pattern — plus a full breakdown of contradiction, behavior, feedback loop, failure mode, and value misalignment. If an OpenAI API key is provided, the output is AI-generated from the reel combination; otherwise a template-based fallback is used.

Reels can be locked individually before spinning so that specific values are held across spins. Icons for every value are customizable from the Palette button.

---

## The 9 Reels

### Drive & Counter — Motivation
*Why does it move? What opposes it?*

Two reels pull from the same set of 6 motivations. **Drive** is the primary force behind the character's behavior — the core want. **Counter** is the opposing motivation that creates internal friction. When Drive and Counter conflict, the tension between them is the engine of the archetype.

| Value | What it means |
|---|---|
| **Gain** | Motivated by acquiring — resources, status, advantage, more of something |
| **Protect** | Motivated by preservation — keeping what exists, guarding against loss |
| **Avoid** | Motivated by escape — staying away from pain, exposure, or failure |
| **Prove** | Motivated by validation — demonstrating worth to self or others |
| **Belong** | Motivated by connection — being accepted, included, or needed |
| **Control** | Motivated by dominance over outcomes — reducing uncertainty, directing others |

The Drive/Counter pair shapes the **Contradiction** section of the output. A character who Gains but Counter-Belongs is acquisitive yet secretly desperate for approval. A character who Avoids but Counter-Proves never shows up but needs to be seen.

---

### Target
*Where is the motivation aimed?*

Determines the object or domain the character's motivation is directed at.

| Value | What it means |
|---|---|
| **Self** | The motivation is inward — self-improvement, self-protection, self-destruction |
| **Other** | Aimed at a specific individual — a rival, partner, dependent, or threat |
| **Group** | Aimed at a collective — a team, community, class, or institution |
| **System** | Aimed at abstract structures — rules, markets, power, ideology |

Target changes the scale and social texture of the archetype. Belong→Self is a character building an internal identity. Belong→Group is someone performing loyalty to a tribe.

---

### Break — Distortion
*How does the motivation fail or warp?*

Every motivation eventually distorts. This reel determines the shape of that failure.

| Value | What it means |
|---|---|
| **Excess** | The motivation is pursued past the point of return — obsession, overreach, consumption |
| **Deficiency** | The motivation is suppressed, starved, or denied — numbness, withdrawal, neglect |
| **Misdirection** | The motivation is aimed at the wrong target or expressed sideways — displacement, projection |
| **Inversion** | The motivation flips into its opposite — the protector becomes the threat, the giver takes |

Distortion is what makes behavior legible as a *flaw*. It's the point where a strength becomes a liability.

---

### Act — Behavior
*What does the pattern look like from the outside?*

The observable strategy the character uses to pursue (or avoid) their motivation.

| Value | What it means |
|---|---|
| **Push** | Active, assertive, forward-moving — advancing, pressuring, initiating |
| **Pull** | Attractive, magnetic, drawing others in — charming, creating dependency, withholding |
| **Mask** | Concealing, performing, presenting a false face — deflecting, mirroring, performing |
| **Control** | Structuring, managing, constraining — micromanaging, gate-keeping, engineering outcomes |
| **Detach** | Withdrawing, going cold, removing investment — ghosting, dissociating, going passive |

Behavior is the *style* of the archetype — how it moves in the world regardless of what it wants.

---

### Level — Intensity
*How severe is the pattern?*

Sets the magnitude of the archetype's behavioral expression.

| Value | What it means |
|---|---|
| **Low** | Subtle, background, easy to miss — the pattern exists but doesn't dominate |
| **Medium** | Noticeable, consistent, affects relationships — present and shaping outcomes |
| **High** | Consuming, disruptive, defining — the pattern is the character's primary operating mode |

Intensity doesn't change *what* the archetype does, only *how loud* it is. A Low-intensity Excess is a hobby that's gotten a little out of hand. A High-intensity Excess is a life organized around a compulsion.

---

### Sight — Awareness
*Does the character know what they're doing?*

Determines the character's relationship to their own pattern — how clearly they can see it.

| Value | What it means |
|---|---|
| **Unaware** | No insight — the character experiences their behavior as simply reality, not as a pattern |
| **Partially Aware** | Glimpses — the character senses something is off but can't name it or consistently act on it |
| **Fully Aware** | Clear-eyed — the character understands exactly what they're doing and why, and does it anyway |

Awareness dramatically changes narrative voice. Unaware archetypes are tragic. Partially aware archetypes are conflicted. Fully aware archetypes are either evolving or choosing.

---

### Story — Justification
*How does the character explain themselves to themselves?*

The internal narrative that makes the behavior feel rational, necessary, or righteous.

| Value | What it means |
|---|---|
| **I'm being smart** | Reframes manipulation or self-interest as strategy and pragmatism |
| **They deserve it** | Assigns blame outward — the behavior is proportional retaliation or justice |
| **This is safer** | Avoidance and control are framed as prudence and risk management |
| **No one else will** | Overreach and control are framed as filling a vacuum others refuse to fill |
| **It's already too late** | Fatalism — damage is done, collapse is inevitable, so why not |
| **I have no choice** | Removes agency — the behavior is forced by circumstance, not chosen |
| **This is who I am** | Identity-lock — the pattern is treated as fixed, essential, and non-negotiable |
| **I'm protecting them** | Harmful or controlling behavior is reframed as care and sacrifice |

Justification is the voice in the character's head. It's what they'd say if confronted. It's also what makes the pattern persistent — beliefs that make the behavior feel necessary are beliefs that make change feel dangerous.

---

### Force — Pressure
*What forces the hand?*

The external condition that activates, accelerates, or exposes the pattern. Pressure doesn't create the archetype — it reveals it.

| Value | What it means |
|---|---|
| **Deadline** | Time constraint — urgency strips away the behaviors that manage the pattern |
| **Exposure** | Visibility — the threat or reality of being seen collapses performance and mask |
| **Competition** | Rivals — the presence of another actor who wants the same thing intensifies the pattern |
| **Scarcity** | Not enough — resource limitation triggers the underlying fear the motivation is built around |
| **Authority** | Power differential — the presence of someone above or below them in hierarchy activates the pattern |

Pressure is the **Failure Mode** trigger. It's the scene that breaks the character open.

---

## Output Sections

After a spin, the Archetypal Core card shows:

- **Archetypal Core** — one-sentence synthesis of the pattern
- **Contradiction / Tension** — the internal conflict between Drive and Counter
- **Behavior Pattern** — how the Act, Level, and Awareness interact
- **Feedback Loop** — the self-reinforcing cycle that makes the pattern sticky
- **Failure Mode** — what happens when Pressure is applied
- **Value Misalignment** — the gap between declared values and actual behavior, including the Justification narrative

---

## Setup

```bash
npm install
npm run dev
```

To enable AI-generated output, click the key icon and enter an OpenAI API key. The key is stored locally in your browser and never sent to any server — all requests go directly to OpenAI.
