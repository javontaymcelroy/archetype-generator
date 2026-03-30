import { motion, AnimatePresence } from 'framer-motion';
import type { ResolvedArchetype } from '../types';

const HISTORY_KEY = 'archetype_history';
const MAX_HISTORY = 10;

export function loadHistory(): ResolvedArchetype[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
}

export function pushHistory(entry: ResolvedArchetype) {
  try {
    const prev = loadHistory();
    // Remove duplicate if same id exists, prepend new entry, cap at MAX_HISTORY
    const next = [entry, ...prev.filter(x => x.id !== entry.id)].slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

interface HistoryViewProps {
  history: ResolvedArchetype[];
  onInspect: (a: ResolvedArchetype) => void;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
}

export default function HistoryView({ history, onInspect }: HistoryViewProps) {
  return (
    <div className="flex flex-col px-3 pt-5 pb-4">
      <div className="flex items-center justify-between mb-5 px-1">
        <p className="text-[10px] uppercase tracking-[0.2em] font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Spin History
        </p>
        <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.38)' }}>
          Last {Math.min(history.length, MAX_HISTORY)} spins
        </p>
      </div>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>No spins yet.</p>
          <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.32)' }}>Head to Spin to generate your first archetype.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {history.map((entry, i) => (
              <motion.button
                key={entry.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.04 }}
                onClick={() => onInspect(entry)}
                className="w-full text-left p-4 rounded-xl transition-all duration-150"
                style={{
                  background: '#0a0a0a',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')}
              >
                {/* Index + time */}
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5"
                    style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    #{history.length - i}
                  </span>
                  <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
                    {entry.savedAt ? timeAgo(entry.savedAt) : ''}
                  </span>
                </div>

                {/* Core pattern */}
                <p className="text-sm font-semibold leading-snug mb-2.5" style={{ color: 'rgba(255,255,255,0.82)' }}>
                  {entry.corePattern}
                </p>

                {/* Value pills */}
                <div className="flex flex-wrap gap-1">
                  {[
                    entry.state.primaryMotivation,
                    entry.state.counterMotivation,
                    entry.state.distortion,
                    entry.state.behavior,
                    entry.state.target,
                  ].map(v => (
                    <span
                      key={v}
                      className="text-[9px] px-1.5 py-0.5"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.35)' }}
                    >
                      {v}
                    </span>
                  ))}
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
