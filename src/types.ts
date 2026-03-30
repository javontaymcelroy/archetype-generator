export type Motivation = 'Gain' | 'Protect' | 'Avoid' | 'Prove' | 'Belong' | 'Control';
export type Target = 'Self' | 'Other' | 'Group' | 'System';
export type Distortion = 'Excess' | 'Deficiency' | 'Misdirection' | 'Inversion';
export type Behavior = 'Push' | 'Pull' | 'Mask' | 'Control' | 'Detach';
export type Intensity = 'Low' | 'Medium' | 'High';
export type Awareness = 'Unaware' | 'Partially Aware' | 'Fully Aware';

export interface ArchetypeState {
  primaryMotivation: Motivation;
  counterMotivation: Motivation;
  target: Target;
  distortion: Distortion;
  behavior: Behavior;
  intensity: Intensity;
  awareness: Awareness;
  justification: string;
  pressure: string;
}

export interface ResolvedArchetype {
  id: string;
  state: ArchetypeState;
  corePattern: string;
  behaviorPattern: string;
  tensionPair: string;
  feedbackLoop: string;
  failureMode: string;
  valueConflict: string;
  tags: string[];
  savedAt?: number;
}

export type ReelId =
  | 'primaryMotivation'
  | 'counterMotivation'
  | 'target'
  | 'distortion'
  | 'behavior'
  | 'intensity'
  | 'awareness'
  | 'justification'
  | 'pressure';

export type LockedReels = Set<ReelId>;

export type AppView = 'spin' | 'inspect' | 'library' | 'history';
