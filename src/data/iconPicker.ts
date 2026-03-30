import * as PhosphorIcons from '@phosphor-icons/react';
import type { Icon } from '@phosphor-icons/react';

// Pull every PascalCase export — that's every icon component (~1,400 of them)
// Icons are forwardRef objects ({ $$typeof, render }), not plain functions.
// Each icon also has a *Icon alias — skip those to avoid duplicates.
// Icons are forwardRef objects ({ render, displayName }). Real icons have a
// displayName ending in "Icon" (e.g. "GhostIcon"). Internal helpers like
// IconBase do not — this filters them out. We also skip *Icon-suffixed export
// names since each icon is exported twice (Ghost + GhostIcon) and we only
// want the shorter name.
export const ICON_REGISTRY: Record<string, Icon> = Object.fromEntries(
  (Object.entries(PhosphorIcons) as [string, unknown][]).filter(
    (entry): entry is [string, Icon] => {
      const [name, val] = entry;
      const v = val as Record<string, unknown>;
      return (
        /^[A-Z][A-Za-z]+$/.test(name) &&
        !name.endsWith('Icon') &&
        typeof v === 'object' && v !== null &&
        typeof v['render'] === 'function' &&
        typeof v['displayName'] === 'string' &&
        (v['displayName'] as string).endsWith('Icon')
      );
    }
  )
);

export const ICON_LIST = Object.entries(ICON_REGISTRY)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([name, component]) => ({ name, component }));

export function getIconByName(name: string): Icon | undefined {
  return ICON_REGISTRY[name];
}

export const DEFAULT_ICON_NAMES: Record<string, string> = {
  // Motivations
  Gain:         'HandCoins',
  Protect:      'Umbrella',
  Avoid:        'Ghost',
  Prove:        'Sword',
  Belong:       'Cheers',
  Control:      'Joystick',
  // Distortions
  Excess:       'Fire',
  Deficiency:   'BatteryEmpty',
  Misdirection: 'Bug',
  Inversion:    'Butterfly',
  // Target
  Self:         'UserCircle',
  Other:        'UserFocus',
  Group:        'UsersThree',
  System:       'Network',
  // Behavior (Control is also a Motivation; use namespace key to distinguish)
  Push:              'ArrowFatRight',
  Pull:              'Magnet',
  Mask:              'MaskHappy',
  'behavior:Control':'SteeringWheel',
  Detach:            'LinkBreak',
  // Intensity
  Low:          'WifiLow',
  Medium:       'WifiMedium',
  High:         'WifiHigh',
  // Awareness
  Unaware:           'EyeSlash',
  'Partially Aware': 'Binoculars',
  'Fully Aware':     'Eye',
  // Justification
  "I'm being smart":       'Lightbulb',
  "They deserve it":       'Scales',
  "This is safer":         'ShieldCheck',
  "No one else will":      'Hand',
  "It's already too late": 'HourglassLow',
  "I have no choice":      'WarningCircle',
  "This is who I am":      'Fingerprint',
  "I'm protecting them":   'ShieldPlus',
  // Pressure
  Deadline:    'Timer',
  Exposure:    'Flashlight',
  Competition: 'Trophy',
  Scarcity:    'Drop',
  Authority:   'Crown',
};

const STORAGE_KEY = 'archetype_icon_overrides';

export function loadIconOverrides(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

export function saveIconOverrides(overrides: Record<string, string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
}

// groupId namespaces overrides so values shared across groups (e.g. "Control")
// resolve independently. Lookup order: namespaced override → plain override → namespaced default → plain default.
export function resolveIconMap(
  values: string[],
  overrides: Record<string, string>,
  groupId?: string
): Record<string, Icon> {
  const result: Record<string, Icon> = {};
  for (const value of values) {
    const nk = groupId ? `${groupId}:${value}` : value;
    const name = overrides[nk] ?? overrides[value] ?? DEFAULT_ICON_NAMES[nk] ?? DEFAULT_ICON_NAMES[value];
    const icon = name ? getIconByName(name) : undefined;
    if (icon) result[value] = icon;
  }
  return result;
}
