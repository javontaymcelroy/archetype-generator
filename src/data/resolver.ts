import type { ArchetypeState, ResolvedArchetype, Motivation, Target, Distortion, Behavior } from '../types';

// ─── Language maps ────────────────────────────────────────────────────────────

const motivationDrive: Record<Motivation, string> = {
  Gain: 'the drive to acquire and accumulate',
  Protect: 'the impulse to defend and preserve',
  Avoid: 'the compulsion to escape and evade',
  Prove: 'the need to demonstrate worth',
  Belong: 'the hunger for acceptance and connection',
  Control: 'the need to dominate and stabilize',
};

const motivationShort: Record<Motivation, string> = {
  Gain: 'acquisition',
  Protect: 'preservation',
  Avoid: 'escape',
  Prove: 'validation',
  Belong: 'connection',
  Control: 'dominance',
};

const motivationFear: Record<Motivation, string> = {
  Gain: 'scarcity',
  Protect: 'loss',
  Avoid: 'exposure',
  Prove: 'inadequacy',
  Belong: 'rejection',
  Control: 'chaos',
};

const targetPhrase: Record<Target, string> = {
  Self: 'directed inward',
  Other: 'aimed at individuals',
  Group: 'extended toward the collective',
  System: 'aimed at the structure itself',
};

const targetDomain: Record<Target, string> = {
  Self: 'inward',
  Other: 'outward at individuals',
  Group: 'across a collective',
  System: 'against an institution',
};

const distortionHow: Record<Distortion, string> = {
  Excess: 'amplified past any useful threshold',
  Deficiency: 'suppressed to the point of dysfunction',
  Misdirection: 'aimed at the wrong object entirely',
  Inversion: 'inverted—producing the exact opposite of what is sought',
};

const distortionOutcome: Record<Distortion, string> = {
  Excess: 'escalates until the system it feeds on collapses',
  Deficiency: 'atrophies, leaving a void that grows louder with time',
  Misdirection: 'expends all force against the wrong target, leaving the real wound untouched',
  Inversion: 'turns against itself, becoming the agent of its own defeat',
};

const behaviorVerb: Record<Behavior, string> = {
  Push: 'forcing, escalating, and applying relentless pressure',
  Pull: 'withdrawing, retreating, and refusing engagement',
  Mask: 'performing, concealing, and rewriting the surface',
  Control: 'restricting, micromanaging, and tightening the grip',
  Detach: 'disconnecting, numbing, and severing contact',
};

const behaviorLabel: Record<Behavior, string> = {
  Push: 'escalation',
  Pull: 'withdrawal',
  Mask: 'concealment',
  Control: 'restriction',
  Detach: 'disconnection',
};

// ─── Tension pairs ────────────────────────────────────────────────────────────

type MotivationPair = `${Motivation}+${Motivation}`;

const tensionTemplates: Partial<Record<MotivationPair, string>> = {
  'Prove+Avoid': '{A} and {B} are locked in direct conflict—recognition requires exactly the visibility that feels most threatening.',
  'Avoid+Prove': '{A} and {B} create a paralysis loop—safety demands invisibility while worth demands to be seen.',
  'Belong+Control': '{A} and {B} undermine each other—connection requires surrender that feels indistinguishable from loss of self.',
  'Control+Belong': '{A} and {B} cannot coexist—the tighter the grip, the more it drives away the very closeness that is wanted.',
  'Gain+Protect': '{A} and {B} pull in opposite directions—acquiring requires exposure, while protecting requires withholding.',
  'Protect+Gain': '{A} and {B} stall into inaction—neither advancing nor releasing, consuming energy without progress.',
  'Prove+Belong': '{A} and {B} create a performance trap—belonging requires authenticity while proving requires a curated self.',
  'Belong+Prove': '{A} and {B} hollow out connection—the need to be seen as worthy prevents being known as real.',
  'Avoid+Control': '{A} and {B} produce a paradox—escape requires relinquishing grip, but releasing grip feels like catastrophe.',
  'Control+Avoid': '{A} and {B} mask each other—control is used as the mechanism of avoidance, reducing everything to a manageable threat.',
  'Gain+Belong': '{A} and {B} erode trust—the accumulative impulse is felt as extraction by those whose acceptance is sought.',
  'Protect+Prove': '{A} and {B} produce chronic withholding—proving requires risk while protecting requires hiding the very thing that could be proven.',
};

function resolveTension(primary: Motivation, counter: Motivation): string {
  const key = `${primary}+${counter}` as MotivationPair;
  const reverseKey = `${counter}+${primary}` as MotivationPair;
  const template =
    tensionTemplates[key] ||
    tensionTemplates[reverseKey] ||
    '{A} and {B} create internal conflict—each move toward one opens a wound in the other.';

  return template
    .replace('{A}', motivationShort[primary].charAt(0).toUpperCase() + motivationShort[primary].slice(1))
    .replace('{B}', motivationShort[counter]);
}

// ─── Feedback loops ───────────────────────────────────────────────────────────

function resolveFeedbackLoop(s: ArchetypeState): string {
  const beh = behaviorLabel[s.behavior];
  const just = s.justification.toLowerCase().replace(/^"/, '').replace(/"$/, '');
  const distOut = distortionOutcome[s.distortion];

  return `The ${beh} produces the very conditions that justify it. The internal narrative ("${just}") absorbs each consequence as proof—tightening the loop until the pattern ${distOut}.`;
}

// ─── Failure modes ────────────────────────────────────────────────────────────

const failureModeByDistortion: Record<Distortion, string[]> = {
  Excess: [
    'Collapse through overreach—the system being fed on is finally depleted.',
    'Burnout: the engine consumes the driver before the destination is reached.',
    'Backlash—those pushed past their limit become the source of the very thing feared.',
  ],
  Deficiency: [
    'Atrophy—the suppressed drive becomes a chronic absence that shapes every decision without being named.',
    'A single unguarded moment lets everything suppressed surface at once, rupturing the structure.',
    'The void is filled from outside by someone else\'s agenda, since the internal one was never asserted.',
  ],
  Misdirection: [
    'Exposure—the real target becomes undeniable when the proxy stops absorbing the force.',
    'The wrong target is destroyed, and the wound remains exactly as it was.',
    'A moment of stillness makes the misdirection impossible to maintain.',
  ],
  Inversion: [
    'The behavior produces precisely what it sought to prevent—the inversion completes.',
    'Success itself becomes the breaking point: getting what was sought reveals it as the wrong thing.',
    'External intervention cuts through the inverted logic before it can finish its arc.',
  ],
};

function resolveFailureMode(distortion: Distortion): string {
  const modes = failureModeByDistortion[distortion];
  return modes[Math.floor(Math.random() * modes.length)];
}

// ─── Value conflict ───────────────────────────────────────────────────────────

function resolveValueConflict(s: ArchetypeState): string {
  const declared = motivationShort[s.primaryMotivation];
  const actual = behaviorLabel[s.behavior];
  const target = targetDomain[s.target];

  return `Declares a commitment to ${declared}, but the actual operation—${actual} applied ${target}—contradicts this at the level of execution. The gap between stated values and enacted behavior is the engine of the pattern.`;
}

// ─── Core pattern ─────────────────────────────────────────────────────────────

function resolveCorePattern(s: ArchetypeState): string {
  const drive = motivationDrive[s.primaryMotivation];
  const tgt = targetPhrase[s.target];
  const dist = distortionHow[s.distortion];
  const beh = behaviorVerb[s.behavior];

  return `${drive.charAt(0).toUpperCase() + drive.slice(1)}, ${tgt}, ${dist}—manifesting as ${beh}.`;
}

function resolveBehaviorPattern(s: ArchetypeState): string {
  const fear = motivationFear[s.counterMotivation];
  const dist = s.distortion.toLowerCase();

  const intensityMod =
    s.intensity === 'High'
      ? 'At high intensity, this becomes an organizing principle—every interaction filtered through its logic.'
      : s.intensity === 'Low'
      ? 'At low intensity, this is a background hum—present but rarely visible to others.'
      : 'At medium intensity, this pattern is intermittent—activated by sufficient pressure.';

  const awarenessMod =
    s.awareness === 'Unaware'
      ? 'The pattern operates entirely below conscious recognition.'
      : s.awareness === 'Partially Aware'
      ? 'There is partial recognition—the behavior is noticed but its root is not.'
      : 'The pattern is fully known—which does not prevent it.';

  return `${behaviorLabel[s.behavior].charAt(0).toUpperCase() + behaviorLabel[s.behavior].slice(1)} as a ${dist} response to the underlying fear of ${fear}. ${intensityMod} ${awarenessMod}`;
}

// ─── Tags ────────────────────────────────────────────────────────────────────

function generateTags(s: ArchetypeState): string[] {
  return [
    s.primaryMotivation,
    s.counterMotivation,
    s.target,
    s.distortion,
    s.behavior,
    s.intensity,
  ];
}

// ─── Main resolver ────────────────────────────────────────────────────────────

export function resolveArchetype(state: ArchetypeState): ResolvedArchetype {
  return {
    id: crypto.randomUUID(),
    state,
    corePattern: resolveCorePattern(state),
    behaviorPattern: resolveBehaviorPattern(state),
    tensionPair: resolveTension(state.primaryMotivation, state.counterMotivation),
    feedbackLoop: resolveFeedbackLoop(state),
    failureMode: resolveFailureMode(state.distortion),
    valueConflict: resolveValueConflict(state),
    tags: generateTags(state),
  };
}

// ─── Random state ─────────────────────────────────────────────────────────────

import { MOTIVATIONS, TARGETS, DISTORTIONS, BEHAVIORS, INTENSITIES, AWARENESS_LEVELS, JUSTIFICATIONS, PRESSURES } from './primitives';
import type { LockedReels } from '../types';

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function randomState(current?: ArchetypeState, locked?: LockedReels): ArchetypeState {
  const base = current || {} as ArchetypeState;
  const l = locked || new Set();

  let primaryMotivation = l.has('primaryMotivation') ? base.primaryMotivation : pick(MOTIVATIONS);
  let counterMotivation = l.has('counterMotivation') ? base.counterMotivation : pick(MOTIVATIONS);

  // Ensure primary ≠ counter when not locked
  if (!l.has('counterMotivation') && counterMotivation === primaryMotivation) {
    const others = MOTIVATIONS.filter(m => m !== primaryMotivation);
    counterMotivation = pick(others);
  }

  return {
    primaryMotivation,
    counterMotivation,
    target: l.has('target') ? base.target : pick(TARGETS),
    distortion: l.has('distortion') ? base.distortion : pick(DISTORTIONS),
    behavior: l.has('behavior') ? base.behavior : pick(BEHAVIORS),
    intensity: l.has('intensity') ? base.intensity : pick(INTENSITIES),
    awareness: l.has('awareness') ? base.awareness : pick(AWARENESS_LEVELS),
    justification: l.has('justification') ? base.justification : pick(JUSTIFICATIONS),
    pressure: l.has('pressure') ? base.pressure : pick(PRESSURES),
  };
}
