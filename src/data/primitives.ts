import type { Motivation, Target, Distortion, Behavior, Intensity, Awareness, ReelId } from '../types';

export const MOTIVATIONS: Motivation[] = ['Gain', 'Protect', 'Avoid', 'Prove', 'Belong', 'Control'];
export const TARGETS: Target[] = ['Self', 'Other', 'Group', 'System'];
export const DISTORTIONS: Distortion[] = ['Excess', 'Deficiency', 'Misdirection', 'Inversion'];
export const BEHAVIORS: Behavior[] = ['Push', 'Pull', 'Mask', 'Control', 'Detach'];
export const INTENSITIES: Intensity[] = ['Low', 'Medium', 'High'];
export const AWARENESS_LEVELS: Awareness[] = ['Unaware', 'Partially Aware', 'Fully Aware'];
export const JUSTIFICATIONS = [
  "I'm being smart",
  "They deserve it",
  "This is safer",
  "No one else will",
  "It's already too late",
  "I have no choice",
  "This is who I am",
  "I'm protecting them",
] as const;
export const PRESSURES = ['Deadline', 'Exposure', 'Competition', 'Scarcity', 'Authority'] as const;

export interface ReelDef {
  id: ReelId;
  label: string;
  shortLabel: string;
  question: string;
  values: readonly string[];
  colorClass: string;
  accentHex: string;
  iconKey: string;
}

export const REEL_DEFS: ReelDef[] = [
  {
    id: 'primaryMotivation',
    label: 'Primary Drive',
    shortLabel: 'Drive',
    question: 'Why does it move?',
    values: MOTIVATIONS,
    colorClass: 'amber',
    accentHex: '#f59e0b',
    iconKey: 'flame',
  },
  {
    id: 'counterMotivation',
    label: 'Counter-Drive',
    shortLabel: 'Counter',
    question: 'What opposes it?',
    values: MOTIVATIONS,
    colorClass: 'rose',
    accentHex: '#f43f5e',
    iconKey: 'spiral',
  },
  {
    id: 'target',
    label: 'Target',
    shortLabel: 'Target',
    question: 'Where is it aimed?',
    values: TARGETS,
    colorClass: 'sky',
    accentHex: '#38bdf8',
    iconKey: 'target',
  },
  {
    id: 'distortion',
    label: 'Distortion',
    shortLabel: 'Break',
    question: 'How does it fail?',
    values: DISTORTIONS,
    colorClass: 'violet',
    accentHex: '#8b5cf6',
    iconKey: 'crack',
  },
  {
    id: 'behavior',
    label: 'Behavior',
    shortLabel: 'Act',
    question: 'What does it look like?',
    values: BEHAVIORS,
    colorClass: 'teal',
    accentHex: '#14b8a6',
    iconKey: 'mask',
  },
  {
    id: 'intensity',
    label: 'Intensity',
    shortLabel: 'Level',
    question: 'How severe?',
    values: INTENSITIES,
    colorClass: 'orange',
    accentHex: '#fb923c',
    iconKey: 'gauge',
  },
  {
    id: 'awareness',
    label: 'Awareness',
    shortLabel: 'Sight',
    question: 'Does it know itself?',
    values: AWARENESS_LEVELS,
    colorClass: 'emerald',
    accentHex: '#10b981',
    iconKey: 'eye',
  },
  {
    id: 'justification',
    label: 'Justification',
    shortLabel: 'Story',
    question: 'How does it explain itself?',
    values: JUSTIFICATIONS,
    colorClass: 'yellow',
    accentHex: '#eab308',
    iconKey: 'shield',
  },
  {
    id: 'pressure',
    label: 'Pressure',
    shortLabel: 'Force',
    question: 'What forces the hand?',
    values: PRESSURES,
    colorClass: 'red',
    accentHex: '#ef4444',
    iconKey: 'lightning',
  },
];
