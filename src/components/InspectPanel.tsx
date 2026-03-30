import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BookmarkSimple, Copy, Check } from '@phosphor-icons/react';
import { LayerIcon } from './Icons';
import { REEL_DEFS } from '../data/primitives';
import type { ResolvedArchetype } from '../types';

function buildPlainText(archetype: ResolvedArchetype): string {
  const { state } = archetype;
  const layers = REEL_DEFS.map(def => `${def.shortLabel.toUpperCase()}: ${state[def.id as keyof typeof state]}`).join('\n');
  return [
    '── BREAKDOWN ──',
    '',
    layers,
    '',
    '── ARCHETYPAL CORE ──',
    archetype.corePattern,
    '',
    '── CONTRADICTION / TENSION ──',
    archetype.tensionPair,
    `${state.primaryMotivation} vs ${state.counterMotivation}`,
    '',
    '── BEHAVIOR PATTERN ──',
    archetype.behaviorPattern,
    `${state.behavior} · ${state.intensity} · ${state.awareness}`,
    '',
    '── FEEDBACK LOOP ──',
    archetype.feedbackLoop,
    '',
    '── FAILURE MODE ──',
    archetype.failureMode,
    `Triggered by: ${state.pressure}`,
    '',
    '── VALUE MISALIGNMENT ──',
    archetype.valueConflict,
    `Self-narrative: "${state.justification}"`,
    '',
    `Tags: ${archetype.tags.join(', ')}`,
  ].join('\n');
}

const SECTIONS = {
  core:     'Archetypal Core',
  tension:  'Contradiction / Tension',
  behavior: 'Behavior Pattern',
  feedback: 'Feedback Loop',
  failure:  'Failure Mode',
  conflict: 'Value Misalignment',
} as const;

interface InspectPanelProps {
  archetype: ResolvedArchetype;
  onBack: () => void;
  onSave: (a: ResolvedArchetype) => void;
  isSaved: boolean;
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      className="overflow-hidden"
      style={{ border: '1px solid rgba(255,255,255,0.07)', background: '#0a0a0a' }}
    >
      <div
        className="px-4 py-2.5 flex items-center"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}
      >
        <span className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {label}
        </span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

const tag: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.09)',
  color: 'rgba(255,255,255,0.45)',
};

export default function InspectPanel({ archetype, onBack, onSave, isSaved }: InspectPanelProps) {
  const { state } = archetype;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(buildPlainText(archetype)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col"
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-4 pt-5 pb-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm transition-all duration-150"
          style={{ color: 'rgba(255,255,255,0.35)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
        >
          <ArrowLeft size={14} />
          Back
        </button>
        <span className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: 'rgba(255,255,255,0.45)' }}>
          Breakdown
        </span>
        <div className="flex items-center gap-1.5">
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 transition-all duration-150"
          style={{
            background: copied ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${copied ? 'rgba(255,255,255,0.20)' : 'rgba(255,255,255,0.08)'}`,
            color: copied ? 'rgba(255,255,255,0.80)' : 'rgba(255,255,255,0.35)',
          }}
        >
          {copied ? <Check size={13} weight="bold" /> : <Copy size={13} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
        <button
          onClick={() => onSave({ ...archetype, savedAt: Date.now() })}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 transition-all duration-150"
          style={{
            background: isSaved ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${isSaved ? 'rgba(255,255,255,0.20)' : 'rgba(255,255,255,0.08)'}`,
            color: isSaved ? 'rgba(255,255,255,0.80)' : 'rgba(255,255,255,0.35)',
          }}
        >
          <BookmarkSimple size={13} weight={isSaved ? 'fill' : 'regular'} />
          {isSaved ? 'Saved' : 'Save'}
        </button>
        </div>
      </div>

      <div className="px-3 py-4 space-y-2">

        {/* Layer tiles */}
        <div className="grid grid-cols-3 gap-2">
          {REEL_DEFS.map(def => {
            const val = state[def.id as keyof typeof state] as string;
            return (
              <div
                key={def.id}
                className="p-3"
                style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  <LayerIcon iconKey={def.iconKey} size={11} color="rgba(255,255,255,0.5)" />
                  <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {def.shortLabel}
                  </span>
                </div>
                <p className="text-sm font-semibold leading-tight" style={{ color: 'rgba(255,255,255,0.82)' }}>
                  {val}
                </p>
                <p className="text-[10px] mt-0.5 leading-tight" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  {def.question}
                </p>
              </div>
            );
          })}
        </div>

        {/* Core */}
        <Section label={SECTIONS.core}>
          <p className="text-base font-medium leading-relaxed" style={{ color: 'rgba(255,255,255,0.88)' }}>
            {archetype.corePattern}
          </p>
        </Section>

        {/* Tension */}
        <Section label={SECTIONS.tension}>
          <p className="text-sm leading-relaxed mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {archetype.tensionPair}
          </p>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 text-xs font-semibold" style={{ ...tag, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)' }}>
              {state.primaryMotivation}
            </span>
            <span className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.2)' }}>vs</span>
            <span className="px-2 py-1 text-xs font-semibold" style={tag}>
              {state.counterMotivation}
            </span>
          </div>
        </Section>

        {/* Behavior */}
        <Section label={SECTIONS.behavior}>
          <p className="text-sm leading-relaxed mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {archetype.behaviorPattern}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {[state.behavior, state.intensity, state.awareness].map(t => (
              <span key={t} className="px-2 py-0.5 text-xs font-medium" style={tag}>{t}</span>
            ))}
          </div>
        </Section>

        {/* Feedback loop */}
        <Section label={SECTIONS.feedback}>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex flex-col items-center gap-0.5 shrink-0">
              {['Act', '→', 'Effect', '→', 'Belief', '→', 'Escalate'].map((s, i) =>
                i % 2 === 0 ? (
                  <span key={i} className="text-[10px] font-bold px-1.5 py-0.5" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.5)' }}>
                    {s}
                  </span>
                ) : (
                  <span key={i} className="text-[9px]" style={{ color: 'rgba(255,255,255,0.38)' }}>{s}</span>
                )
              )}
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {archetype.feedbackLoop}
            </p>
          </div>
        </Section>

        {/* Failure mode */}
        <Section label={SECTIONS.failure}>
          <p className="text-sm leading-relaxed mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {archetype.failureMode}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.2)' }}>Triggered by:</span>
            <span className="px-2 py-0.5 text-xs font-medium" style={tag}>{state.pressure}</span>
          </div>
        </Section>

        {/* Value conflict */}
        <Section label={SECTIONS.conflict}>
          <p className="text-sm leading-relaxed mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {archetype.valueConflict}
          </p>
          <div className="p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.2)' }}>Self-narrative</p>
            <p className="text-sm italic" style={{ color: 'rgba(255,255,255,0.6)' }}>"{state.justification}"</p>
          </div>
        </Section>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 pt-1 pb-2">
          {archetype.tags.map(t => (
            <span key={t} className="px-2 py-0.5 text-[11px]" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)' }}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
