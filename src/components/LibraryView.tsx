import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash, CaretRight, MagnifyingGlass, Books } from '@phosphor-icons/react';
import type { ResolvedArchetype } from '../types';

interface LibraryViewProps {
  saved: ResolvedArchetype[];
  onInspect: (a: ResolvedArchetype) => void;
  onDelete: (id: string) => void;
}

const tag: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.07)',
  color: 'rgba(255,255,255,0.45)',
};

function ArchetypeCard({ archetype, onInspect, onDelete }: {
  archetype: ResolvedArchetype;
  onInspect: () => void;
  onDelete: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className="group overflow-hidden transition-all duration-200"
      style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.07)' }}
      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.13)')}
      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)')}
    >
      {/* Drive badges */}
      <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-2">
        <div className="flex items-center gap-1.5">
          <span
            className="text-[10px] font-semibold px-2 py-0.5"
            style={{ background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.75)' }}
          >
            {archetype.state.primaryMotivation}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.42)', fontSize: 10 }}>×</span>
          <span
            className="text-[10px] font-semibold px-2 py-0.5"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}
          >
            {archetype.state.counterMotivation}
          </span>
        </div>
        <span
          className="text-[9px] font-semibold px-2 py-0.5 shrink-0"
          style={tag}
        >
          {archetype.state.behavior}
        </span>
      </div>

      {/* Core */}
      <div className="px-4 pb-2">
        <p className="text-xs font-medium leading-relaxed line-clamp-3" style={{ color: 'rgba(255,255,255,0.75)' }}>
          {archetype.corePattern}
        </p>
      </div>

      {/* Tension */}
      <div className="px-4 pb-3">
        <p className="text-[11px] leading-relaxed line-clamp-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
          {archetype.tensionPair}
        </p>
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex gap-1">
          {[archetype.state.target, archetype.state.distortion].map(t => (
            <span key={t} className="text-[9px] px-1.5 py-0.5" style={tag}>{t}</span>
          ))}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <button
            onClick={e => { e.stopPropagation(); onDelete(); }}
            className="p-1.5 transition-all duration-150"
            style={{ color: 'rgba(255,255,255,0.42)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.42)')}
          >
            <Trash size={13} weight="duotone" />
          </button>
          <button
            onClick={onInspect}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium transition-all duration-150"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.55)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.10)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
          >
            Inspect
            <CaretRight size={11} weight="bold" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function LibraryView({ saved, onInspect, onDelete }: LibraryViewProps) {
  const [query, setQuery] = useState('');

  const filtered = query
    ? saved.filter(a =>
        a.tags.some(t => t.toLowerCase().includes(query.toLowerCase())) ||
        a.corePattern.toLowerCase().includes(query.toLowerCase()) ||
        a.state.primaryMotivation.toLowerCase().includes(query.toLowerCase()) ||
        a.state.behavior.toLowerCase().includes(query.toLowerCase())
      )
    : saved;

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="px-4 pt-6 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Books size={14} weight="duotone" style={{ color: 'rgba(255,255,255,0.3)' }} />
          <h2 className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.75)' }}>Library</h2>
          <span
            className="ml-auto text-[10px] px-2 py-0.5"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)' }}
          >
            {saved.length}
          </span>
        </div>
        {saved.length > 0 && (
          <div className="relative">
            <MagnifyingGlass size={12} className="absolute left-3 top-1/2 -translate-y-1/2" weight="bold" style={{ color: 'rgba(255,255,255,0.2)' }} />
            <input
              type="text"
              placeholder="Filter by motivation, behavior…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full pl-8 pr-4 py-2.5 text-xs outline-none transition-all"
              style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.20)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
            />
          </div>
        )}
      </div>

      <div className="px-3 py-4">
        {saved.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div
              className="w-12 h-12 flex items-center justify-center mb-4"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <Books size={20} weight="duotone" style={{ color: 'rgba(255,255,255,0.35)' }} />
            </div>
            <p className="text-sm font-medium mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>No archetypes saved yet</p>
            <p className="text-xs max-w-[200px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.38)' }}>Spin a pattern and save it here</p>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-sm py-12" style={{ color: 'rgba(255,255,255,0.42)' }}>No matches for "{query}"</p>
        ) : (
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {filtered.map(a => (
                <ArchetypeCard key={a.id} archetype={a} onInspect={() => onInspect(a)} onDelete={() => onDelete(a.id)} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
