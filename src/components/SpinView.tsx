import { useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CircleNotch, Lock, Key, CaretDown, Palette } from '@phosphor-icons/react';
import Reel from './Reel';
import IconCustomizer from './IconCustomizer';
import { REEL_DEFS } from '../data/primitives';
import { randomState, resolveArchetype } from '../data/resolver';
import { generateWithOpenAI, MODELS } from '../lib/openai';
import { resolveIconMap, loadIconOverrides, saveIconOverrides } from '../data/valueIcons';
import { loadSounds } from '../lib/sounds';
import type { ModelId } from '../lib/openai';
import type { ArchetypeState, ResolvedArchetype, LockedReels, ReelId } from '../types';

const MOTIVATION_VALUES  = ['Gain', 'Protect', 'Avoid', 'Prove', 'Belong', 'Control'];
const TARGET_VALUES      = ['Self', 'Other', 'Group', 'System'];
const DISTORTION_VALUES  = ['Excess', 'Deficiency', 'Misdirection', 'Inversion'];
const BEHAVIOR_VALUES    = ['Push', 'Pull', 'Mask', 'Control', 'Detach'];
const INTENSITY_VALUES   = ['Low', 'Medium', 'High'];
const AWARENESS_VALUES   = ['Unaware', 'Partially Aware', 'Fully Aware'];
const JUSTIFICATION_VALUES = [
  "I'm being smart", "They deserve it", "This is safer", "No one else will",
  "It's already too late", "I have no choice", "This is who I am", "I'm protecting them",
];
const PRESSURE_VALUES    = ['Deadline', 'Exposure', 'Competition', 'Scarcity', 'Authority'];

const STAGGER_MS     = 300;   // ms between each reel starting
const BASE_DURATION  = 7.2;   // seconds each reel spins
const REEL_SETTLE_MS = (9 - 1) * STAGGER_MS + BASE_DURATION * 1000 + 400; // exactly 10s
const AI_KEY_STORAGE = 'archetype_openai_key';
const AI_MODEL_STORAGE = 'archetype_openai_model';

function useTypewriter(text: string, speed = 22) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    setDisplayed('');
    if (!text) return;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return displayed;
}

// Build a regex that matches reel values + common suffixes (detach→detached, belong→belonging, etc.)
function buildKeywordPattern(resolved: ResolvedArchetype): RegExp | null {
  const s = resolved.state;
  const bases = [
    s.primaryMotivation, s.counterMotivation, s.distortion,
    s.behavior, s.target, s.intensity, s.awareness,
  ].filter(Boolean).map(v => (v as string).toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

  if (bases.length === 0) return null;
  return new RegExp(`\\b(${bases.map(b => `${b}(?:s|ed|ing|ly|tion|ion|ment|ness)?`).join('|')})\\b`, 'gi');
}

function HighlightWord({ children, delay }: { children: string; delay: number }) {
  return (
    <span style={{ position: 'relative', display: 'inline' }}>
      <motion.span
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'absolute',
          inset: '-1px -2px',
          background: '#fff',
          transformOrigin: 'left center',
          zIndex: 0,
          borderRadius: '2px',
          display: 'block',
        }}
      />
      <span style={{ position: 'relative', zIndex: 1, color: '#000' }}>{children}</span>
    </span>
  );
}

function HighlightedCore({ text, resolved }: { text: string; resolved: ResolvedArchetype }) {
  const pattern = buildKeywordPattern(resolved);
  if (!pattern) return <>{text}</>;

  const segments: { t: string; hi: boolean }[] = [];
  let last = 0;
  for (const m of text.matchAll(pattern)) {
    if (m.index! > last) segments.push({ t: text.slice(last, m.index), hi: false });
    segments.push({ t: m[0], hi: true });
    last = m.index! + m[0].length;
  }
  if (last < text.length) segments.push({ t: text.slice(last), hi: false });

  let hiIdx = 0;
  return (
    <>
      {segments.map((seg, i) =>
        seg.hi
          ? <HighlightWord key={i} delay={0.15 + hiIdx++ * 0.25}>{seg.t}</HighlightWord>
          : <span key={i}>{seg.t}</span>
      )}
    </>
  );
}

// First row is now: Drive (0), Counter (1), Break/Distortion (3)
// That puts Target (2) into the expanded section
const FIRST_ROW_IDS = ['primaryMotivation', 'counterMotivation', 'distortion'];
const FIRST_ROW_DEFS = REEL_DEFS.filter(d => FIRST_ROW_IDS.includes(d.id));
const REST_DEFS = REEL_DEFS.filter(d => !FIRST_ROW_IDS.includes(d.id));

interface SpinViewProps {
  onInspect: (a: ResolvedArchetype) => void;
  onSave: (a: ResolvedArchetype) => void;
  onResolve: (a: ResolvedArchetype) => void;
  savedIds: Set<string>;
}

const btn: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  color: 'rgba(255,255,255,0.55)',
};

export default function SpinView({ onInspect, onSave, onResolve, savedIds }: SpinViewProps) {
  const [state, setState] = useState<ArchetypeState>(randomState);
  const [locked, setLocked] = useState<LockedReels>(new Set());
  const [isSpinning, setIsSpinning] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [resolved, setResolved] = useState<ResolvedArchetype | null>(null);
  const coreText = useTypewriter(resolved?.corePattern ?? '');
  const coreTypingDone = !!resolved && coreText === resolved.corePattern;
  const [reelsExpanded, setReelsExpanded] = useState(true);

  // Pinned ref — ensures the resolved archetype always matches the reel values
  // regardless of React batching order or async gaps
  const spinTargetRef = useRef<ArchetypeState | null>(null);

  // Per-reel randomised spin params, keyed by reel index across all 9 reels
  const [spinParams, setSpinParams] = useState<{ items: number; duration: number }[]>(() =>
    Array.from({ length: 9 }, () => ({ items: 20, duration: BASE_DURATION }))
  );

  // Icon customizer
  const [iconOverrides, setIconOverrides] = useState<Record<string, string>>(loadIconOverrides);
  const [customizerOpen, setCustomizerOpen] = useState(false);

  const handleIconUpdate = (value: string, iconName: string) => {
    setIconOverrides(prev => {
      const next = { ...prev, [value]: iconName };
      saveIconOverrides(next);
      return next;
    });
  };

  // AI settings
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(AI_KEY_STORAGE) ?? '');
  const [model, setModel] = useState<ModelId>(
    () => (localStorage.getItem(AI_MODEL_STORAGE) as ModelId) ?? 'o4-mini'
  );

  const saveApiKey = (val: string) => {
    setApiKey(val);
    localStorage.setItem(AI_KEY_STORAGE, val);
  };
  const saveModel = (val: ModelId) => {
    setModel(val);
    localStorage.setItem(AI_MODEL_STORAGE, val);
  };

  const spin = useCallback(async () => {
    if (isSpinning || isGenerating) return;
    loadSounds();

    // Randomise each reel's item count (visual speed) while keeping duration fixed
    // so cascade stop order is always preserved.
    setSpinParams(Array.from({ length: 9 }, () => ({
      items: 14 + Math.floor(Math.random() * 14), // 14–27 items
      duration: BASE_DURATION,
    })));

    const next = randomState(state, locked);
    spinTargetRef.current = next; // pin immediately — never drifts
    setState(next);
    setIsSpinning(true);
    setResolved(null);
    setAiError(null);
    const reelsDone = new Promise<void>(r => setTimeout(r, REEL_SETTLE_MS));

    if (apiKey.trim()) {
      setIsGenerating(true);
      try {
        const [aiResult] = await Promise.all([
          generateWithOpenAI(next, apiKey.trim(), model),
          reelsDone,
        ]);
        // Snap reels first, then reveal card — eliminates any visual timing gap
        setIsSpinning(false);
        setIsGenerating(false);
        const r1 = { ...resolveArchetype(spinTargetRef.current!), ...aiResult };
        setResolved(r1);
        onResolve(r1);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        setAiError(msg);
        await reelsDone;
        setIsSpinning(false);
        const r2 = resolveArchetype(spinTargetRef.current!);
        setResolved(r2);
        onResolve(r2);
      }
    } else {
      await reelsDone;
      setIsSpinning(false);
      const r3 = resolveArchetype(spinTargetRef.current!);
      setResolved(r3);
      onResolve(r3);
    }
  }, [isSpinning, isGenerating, state, locked, apiKey, model]);

  const toggleLock = useCallback((id: ReelId) => {
    setLocked(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const busy = isSpinning || isGenerating;

  // Icon map per reel id — resolved with any user overrides applied
  const iconMapFor = (id: string) => {
    switch (id) {
      case 'primaryMotivation':
      case 'counterMotivation': return resolveIconMap(MOTIVATION_VALUES, iconOverrides, 'motivation');
      case 'target':            return resolveIconMap(TARGET_VALUES, iconOverrides, 'target');
      case 'distortion':        return resolveIconMap(DISTORTION_VALUES, iconOverrides, 'distortion');
      case 'behavior':          return resolveIconMap(BEHAVIOR_VALUES, iconOverrides, 'behavior');
      case 'intensity':         return resolveIconMap(INTENSITY_VALUES, iconOverrides, 'intensity');
      case 'awareness':         return resolveIconMap(AWARENESS_VALUES, iconOverrides, 'awareness');
      case 'justification':     return resolveIconMap(JUSTIFICATION_VALUES, iconOverrides, 'justification');
      case 'pressure':          return resolveIconMap(PRESSURE_VALUES, iconOverrides, 'pressure');
      default:                  return undefined;
    }
  };

  return (
    <div className="flex flex-col">

      {/* ── Header ── */}
      <div className="pt-4 pb-3 px-4 flex items-center justify-end gap-2">
        {/* Icon customizer toggle */}
        <button
          onClick={() => setCustomizerOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-medium transition-all duration-150 rounded-lg"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            color: 'rgba(255,255,255,0.3)',
          }}
        >
          <Palette size={11} weight="duotone" />
        </button>

        {/* Settings toggle */}
        <button
          onClick={() => setSettingsOpen(o => !o)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-medium transition-all duration-150 rounded-lg"
          style={{
            background: apiKey ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${apiKey ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.07)'}`,
            color: apiKey ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.3)',
          }}
        >
          <Key size={11} weight="duotone" />
          {apiKey ? 'AI on' : 'AI'}
          <CaretDown
            size={10}
            weight="bold"
            style={{
              transform: settingsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            }}
          />
        </button>
      </div>

      {/* ── Icon Customizer overlay — portalled to body so CSS filter doesn't clip it ── */}
      {createPortal(
        <AnimatePresence>
          {customizerOpen && (
            <IconCustomizer
              iconOverrides={iconOverrides}
              onUpdate={handleIconUpdate}
              onClose={() => setCustomizerOpen(false)}
            />
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* ── AI Settings panel ── */}
      <AnimatePresence>
        {settingsOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div
              className="mx-3 mb-3 p-3 space-y-2.5"
              style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div>
                <label className="block text-[9px] uppercase tracking-widest font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  OpenAI API Key
                </label>
                <input
                  type="password"
                  placeholder="sk-..."
                  value={apiKey}
                  onChange={e => saveApiKey(e.target.value)}
                  className="w-full px-3 py-2 text-xs outline-none font-mono"
                  style={{ background: '#060606', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.75)' }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)')}
                />
              </div>
              <div>
                <label className="block text-[9px] uppercase tracking-widest font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Model
                </label>
                <select
                  value={model}
                  onChange={e => saveModel(e.target.value as ModelId)}
                  className="w-full px-3 py-2 text-xs outline-none appearance-none"
                  style={{ background: '#060606', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.75)' }}
                >
                  {MODELS.map(m => (
                    <option key={m.id} value={m.id}>{m.label}</option>
                  ))}
                </select>
              </div>
              <p className="text-[9px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.2)' }}>
                Key stored locally in your browser. Sent directly to OpenAI — never to any server.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Reel grid ── */}
      <div className="px-4">
        {/* First row: Drive, Counter, Break */}
        <div className="grid grid-cols-3 gap-2">
          {FIRST_ROW_DEFS.map((def, i) => (
            <Reel
              key={def.id}
              def={def}
              value={state[def.id as keyof ArchetypeState] as string}
              isLocked={locked.has(def.id)}
              isSpinning={isSpinning}
              onToggleLock={() => toggleLock(def.id)}
              spinDelay={i * STAGGER_MS}
              spinItems={spinParams[i].items}
              spinDuration={spinParams[i].duration}
              iconMap={iconMapFor(def.id)}
            />
          ))}
        </div>

        {/* Expandable rows: Target, Act, Level, Sight, Story, Force */}
        <AnimatePresence initial={false}>
          {reelsExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-3 gap-2 pt-2">
                {REST_DEFS.map((def, i) => (
                  <Reel
                    key={def.id}
                    def={def}
                    value={state[def.id as keyof ArchetypeState] as string}
                    isLocked={locked.has(def.id)}
                    isSpinning={isSpinning}
                    onToggleLock={() => toggleLock(def.id)}
                    spinDelay={(i + 3) * STAGGER_MS}
                    spinItems={spinParams[i + 3].items}
                    spinDuration={spinParams[i + 3].duration}
                    iconMap={iconMapFor(def.id)}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setReelsExpanded(o => !o)}
          className="w-full mt-2 py-2 flex items-center justify-center gap-1.5 text-[10px] font-medium transition-all duration-150"
          style={{ color: 'rgba(255,255,255,0.42)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.42)')}
        >
          <CaretDown
            size={10}
            weight="bold"
            style={{
              transform: reelsExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.25s',
            }}
          />
          {reelsExpanded ? 'Less' : '6 more reels'}
        </button>
      </div>

      {/* ── Hint ── */}
      <p className="text-center text-[10px] pt-2 pb-1 px-4" style={{ color: 'rgba(255,255,255,0.38)' }}>
        Click the lock icon on any reel to hold it across spins.
      </p>

      {/* ── Spin button ── */}
      <div className="px-4 pt-2 pb-1">
        <motion.button
          onClick={spin}
          disabled={busy}
          whileTap={busy ? {} : { scale: 0.98 }}
          className="w-full py-4 rounded-xl font-semibold text-base tracking-wide flex items-center justify-center gap-2.5 transition-all duration-200"
          style={{
            background: busy ? 'rgba(255,255,255,0.04)' : '#fff',
            color: busy ? 'rgba(255,255,255,0.2)' : '#000',
            border: busy ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255,255,255,0.15)',
            cursor: busy ? 'not-allowed' : 'pointer',
          }}
        >
          {isSpinning && (
            <motion.span
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
            >
              <CircleNotch size={18} weight="bold" />
            </motion.span>
          )}
          {isSpinning ? 'Spinning…' : 'Spin'}
          {!busy && locked.size > 0 && (
            <span className="flex items-center gap-1 text-[10px] px-2 py-0.5" style={{ background: 'rgba(0,0,0,0.10)', color: 'rgba(0,0,0,0.45)' }}>
              <Lock size={9} weight="fill" />
              {locked.size} locked
            </span>
          )}
        </motion.button>
      </div>


      {/* ── AI generating state ── */}
      <AnimatePresence>
        {isGenerating && !isSpinning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-3 mt-3 px-4 py-4 flex items-center gap-3"
            style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <CircleNotch size={14} style={{ color: 'rgba(255,255,255,0.4)' }} />
            </motion.div>
            <div>
              <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>Reasoning…</p>
              <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>{model}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── AI error ── */}
      {aiError && (
        <div
          className="mx-3 mt-2 px-4 py-3"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
            AI error — showing template output. {aiError}
          </p>
        </div>
      )}

      {/* ── Resolution card ── */}
      <AnimatePresence>
        {resolved && !isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mx-4 mt-3 mb-4 overflow-hidden"
            style={{ border: '1px solid rgba(255,255,255,0.08)', background: '#0a0a0a' }}
          >
            {apiKey && !aiError && (
              <div className="px-4 pt-3 pb-0">
                <span
                  className="text-[9px] font-semibold px-2 py-0.5 uppercase tracking-widest"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.35)' }}
                >
                  {model}
                </span>
              </div>
            )}

            {/* Core */}
            <div className="px-4 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-[9px] uppercase tracking-widest font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Archetypal Core
              </p>
              <p className="text-lg leading-relaxed font-bold" style={{ color: 'rgba(255,255,255,0.88)' }}>
                {coreTypingDone
                  ? <HighlightedCore text={resolved.corePattern} resolved={resolved} />
                  : coreText}
              </p>
            </div>

            {/* Contradiction */}
            <div className="px-4 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-[9px] uppercase tracking-widest font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Contradiction
              </p>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {resolved.tensionPair}
              </p>
            </div>

            {/* Behavior */}
            <div className="px-4 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-[9px] uppercase tracking-widest font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Behavior Pattern
              </p>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {resolved.behaviorPattern}
              </p>
            </div>

            {/* Actions */}
            <div className="p-3 flex gap-2">
              <button
                onClick={() => onInspect(resolved)}
                className="flex-1 flex items-center justify-center py-2.5 text-xs font-medium transition-all duration-150 rounded-lg"
                style={btn}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
              >
                Inspect
              </button>
              {(() => {
                const isSaved = savedIds.has(resolved.id);
                return (
                  <button
                    onClick={() => onSave({ ...resolved, savedAt: Date.now() })}
                    className="flex-1 flex items-center justify-center py-2.5 text-xs font-medium transition-all duration-150 rounded-lg"
                    style={{
                      ...btn,
                      background: isSaved ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.07)',
                      border: `1px solid ${isSaved ? 'rgba(255,255,255,0.20)' : 'rgba(255,255,255,0.12)'}`,
                      color: isSaved ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.75)',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = isSaved ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.11)')}
                    onMouseLeave={e => (e.currentTarget.style.background = isSaved ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.07)')}
                  >
                    {isSaved ? 'Saved' : 'Save'}
                  </button>
                );
              })()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
