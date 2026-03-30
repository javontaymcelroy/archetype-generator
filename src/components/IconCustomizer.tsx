import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, MagnifyingGlass } from '@phosphor-icons/react';
import { ICON_LIST, DEFAULT_ICON_NAMES, getIconByName } from '../data/iconPicker';

const MOTIVATION_VALUES    = ['Gain', 'Protect', 'Avoid', 'Prove', 'Belong', 'Control'];
const TARGET_VALUES        = ['Self', 'Other', 'Group', 'System'];
const DISTORTION_VALUES    = ['Excess', 'Deficiency', 'Misdirection', 'Inversion'];
const BEHAVIOR_VALUES      = ['Push', 'Pull', 'Mask', 'Control', 'Detach'];
const INTENSITY_VALUES     = ['Low', 'Medium', 'High'];
const AWARENESS_VALUES     = ['Unaware', 'Partially Aware', 'Fully Aware'];
const JUSTIFICATION_VALUES = [
  "I'm being smart", "They deserve it", "This is safer", "No one else will",
  "It's already too late", "I have no choice", "This is who I am", "I'm protecting them",
];
const PRESSURE_VALUES      = ['Deadline', 'Exposure', 'Competition', 'Scarcity', 'Authority'];

// Short display labels for values that are long sentences
const SHORT_LABELS: Record<string, string> = {
  "I'm being smart":       "Being smart",
  "They deserve it":       "Deserve it",
  "This is safer":         "Safer",
  "No one else will":      "No one else",
  "It's already too late": "Too late",
  "I have no choice":      "No choice",
  "This is who I am":      "Who I am",
  "I'm protecting them":   "Protecting",
  'Partially Aware':       'Partial',
  'Fully Aware':           'Full',
};

interface ValueGroup {
  id: string;
  label: string;
  values: string[];
  cols: number;
}

const VALUE_GROUPS: ValueGroup[] = [
  { id: 'motivation',    label: 'Drive & Counter — Motivation',  values: MOTIVATION_VALUES,    cols: 3 },
  { id: 'target',        label: 'Target',                         values: TARGET_VALUES,         cols: 4 },
  { id: 'distortion',    label: 'Break — Distortion',             values: DISTORTION_VALUES,     cols: 4 },
  { id: 'behavior',      label: 'Act — Behavior',                 values: BEHAVIOR_VALUES,       cols: 5 },
  { id: 'intensity',     label: 'Level — Intensity',              values: INTENSITY_VALUES,      cols: 3 },
  { id: 'awareness',     label: 'Sight — Awareness',              values: AWARENESS_VALUES,      cols: 3 },
  { id: 'justification', label: 'Story — Justification',          values: JUSTIFICATION_VALUES,  cols: 4 },
  { id: 'pressure',      label: 'Force — Pressure',               values: PRESSURE_VALUES,       cols: 5 },
];

interface Props {
  iconOverrides: Record<string, string>;
  onUpdate: (value: string, iconName: string) => void;
  onClose: () => void;
}

export default function IconCustomizer({ iconOverrides, onUpdate, onClose }: Props) {
  const [selecting, setSelecting] = useState<string | null>(null);
  const [selectingGroup, setSelectingGroup] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const effectiveIconName = (value: string, groupId?: string) => {
    const nk = groupId ? `${groupId}:${value}` : value;
    return iconOverrides[nk] ?? iconOverrides[value] ?? DEFAULT_ICON_NAMES[nk] ?? DEFAULT_ICON_NAMES[value];
  };

  const EffectiveIcon = (value: string, groupId?: string) =>
    getIconByName(effectiveIconName(value, groupId));

  const handlePick = (iconName: string) => {
    if (!selecting) return;
    const key = selectingGroup ? `${selectingGroup}:${selecting}` : selecting;
    onUpdate(key, iconName);
    setSelecting(null);
    setSelectingGroup(null);
    setQuery('');
  };

  const handleBack = () => {
    setSelecting(null);
    setSelectingGroup(null);
    setQuery('');
  };

  const filteredIcons = useMemo(() => {
    if (!query.trim()) return ICON_LIST;
    const q = query.toLowerCase();
    return ICON_LIST.filter(({ name }) => name.toLowerCase().includes(q));
  }, [query]);

  // Map iconName → "groupId:value" keys using it; any icon used by 2+ slots is a duplicate
  const iconUsage = useMemo<Record<string, string[]>>(() => {
    const map: Record<string, string[]> = {};
    for (const g of VALUE_GROUPS) {
      for (const v of g.values) {
        const name = effectiveIconName(v, g.id);
        if (!name) continue;
        if (!map[name]) map[name] = [];
        map[name].push(`${g.id}:${v}`);
      }
    }
    return map;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iconOverrides]);

  const duplicateSlots = useMemo(() => {
    const set = new Set<string>();
    for (const users of Object.values(iconUsage)) {
      if (users.length > 1) users.forEach(s => set.add(s));
    }
    return set;
  }, [iconUsage]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: '#000',
        overflowY: 'auto',
      }}
    >
      <div className="max-w-xl mx-auto px-4 pt-6 pb-12">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <AnimatePresence mode="wait" initial={false}>
            {selecting ? (
              <motion.button
                key="back"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                onClick={handleBack}
                className="flex items-center gap-2"
                style={{ color: 'rgba(255,255,255,0.5)' }}
              >
                <ArrowLeft size={15} weight="bold" />
                <span className="text-xs font-medium">Back</span>
              </motion.button>
            ) : (
              <motion.h2
                key="title"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.15 }}
                className="text-sm font-semibold uppercase tracking-widest"
                style={{ color: 'rgba(255,255,255,0.55)' }}
              >
                Customize Icons
              </motion.h2>
            )}
          </AnimatePresence>

          <button
            onClick={onClose}
            className="p-1"
            style={{ color: 'rgba(255,255,255,0.3)' }}
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {!selecting ? (
            /* ── Value list ── */
            <motion.div
              key="list"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.18 }}
              className="space-y-6"
            >
              {VALUE_GROUPS.map(group => (
                <div key={group.label}>
                  <p className="text-[9px] uppercase tracking-[0.2em] font-semibold mb-3"
                    style={{ color: 'rgba(255,255,255,0.22)' }}>
                    {group.label}
                  </p>
                  <div className={`grid grid-cols-${group.cols} gap-2`}>
                    {group.values.map(value => {
                      const Icon = EffectiveIcon(value, group.id);
                      const label = SHORT_LABELS[value] ?? value;
                      const isDupe = duplicateSlots.has(`${group.id}:${value}`);
                      return (
                        <button
                          key={value}
                          onClick={() => { setSelecting(value); setSelectingGroup(group.id); }}
                          className="relative flex flex-col items-center gap-2 py-3 rounded-xl transition-all duration-150"
                          style={{
                            background: 'rgba(255,255,255,0.04)',
                            border: `1px solid ${isDupe ? 'rgba(251,191,36,0.55)' : 'rgba(255,255,255,0.08)'}`,
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                        >
                          {isDupe && (
                            <span
                              className="absolute top-1.5 right-1.5 text-[8px] font-bold leading-none px-1 py-0.5 rounded"
                              style={{ background: 'rgba(251,191,36,0.18)', color: 'rgba(251,191,36,0.9)', border: '1px solid rgba(251,191,36,0.3)' }}
                            >
                              !
                            </span>
                          )}
                          {Icon && <Icon size={22} weight="fill" style={{ color: isDupe ? 'rgba(251,191,36,0.8)' : 'rgba(255,255,255,0.75)' }} />}
                          <span className="text-[9px] font-medium text-center leading-tight px-1"
                            style={{ color: isDupe ? 'rgba(251,191,36,0.6)' : 'rgba(255,255,255,0.35)' }}>{label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </motion.div>

          ) : (
            /* ── Icon picker grid ── */
            <motion.div
              key={`pick-${selecting}`}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.18 }}
            >
              <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Picking icon for{' '}
                <span className="font-semibold" style={{ color: 'rgba(255,255,255,0.75)' }}>
                  {selecting}
                </span>
              </p>

              {/* Search */}
              <div className="relative mb-4">
                <MagnifyingGlass
                  size={13}
                  style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }}
                />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search icons…"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="w-full rounded-lg text-xs outline-none"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.75)',
                    padding: '7px 10px 7px 30px',
                  }}
                />
                {query && (
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px]"
                    style={{ color: 'rgba(255,255,255,0.2)' }}>
                    {filteredIcons.length}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-7 gap-1.5">
                {filteredIcons.map(({ name, component: Icon }) => {
                  const active = effectiveIconName(selecting, selectingGroup ?? undefined) === name;
                  const currentSlot = selectingGroup ? `${selectingGroup}:${selecting}` : selecting;
                  // Used by another slot (not the one being edited)
                  const usedBy = (iconUsage[name] ?? []).filter(s => s !== currentSlot);
                  const inUse = usedBy.length > 0;
                  return (
                    <button
                      key={name}
                      onClick={() => handlePick(name)}
                      title={inUse ? `${name} — also used by: ${usedBy.join(', ')}` : name}
                      className="relative flex items-center justify-center rounded-lg transition-all duration-100"
                      style={{
                        aspectRatio: '1',
                        background: active ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${active ? 'rgba(255,255,255,0.28)' : inUse ? 'rgba(251,191,36,0.35)' : 'rgba(255,255,255,0.06)'}`,
                      }}
                      onMouseEnter={e => {
                        if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.09)';
                      }}
                      onMouseLeave={e => {
                        if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                      }}
                    >
                      {inUse && !active && (
                        <span
                          className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full"
                          style={{ background: 'rgba(251,191,36,0.8)' }}
                        />
                      )}
                      <Icon
                        size={20}
                        weight="fill"
                        style={{ color: active ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.45)' }}
                      />
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
