import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { DiceSix, BookmarkSimple, Lifebuoy } from '@phosphor-icons/react';
import SpinView from './components/SpinView';
import Cursor from './components/Cursor';
import InspectPanel from './components/InspectPanel';
import LibraryView from './components/LibraryView';
import HistoryView, { loadHistory, pushHistory } from './components/HistoryView';
import type { ResolvedArchetype, AppView } from './types';

const STORAGE_KEY = 'archetype_library';

function loadSaved(): ResolvedArchetype[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function persistSaved(items: ResolvedArchetype[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export default function App() {
  const [view, setView] = useState<AppView>('spin');
  const [inspecting, setInspecting] = useState<ResolvedArchetype | null>(null);
  const [saved, setSaved] = useState<ResolvedArchetype[]>(loadSaved);
  const [history, setHistory] = useState<ResolvedArchetype[]>(loadHistory);

  const handleSave = useCallback((a: ResolvedArchetype) => {
    setSaved(prev => {
      const exists = prev.some(x => x.id === a.id);
      const next = exists ? prev.filter(x => x.id !== a.id) : [a, ...prev];
      persistSaved(next);
      return next;
    });
  }, []);

  const handleDelete = useCallback((id: string) => {
    setSaved(prev => {
      const next = prev.filter(x => x.id !== id);
      persistSaved(next);
      return next;
    });
  }, []);

  const handleResolve = useCallback((a: ResolvedArchetype) => {
    const entry = { ...a, savedAt: Date.now() };
    pushHistory(entry);
    setHistory(loadHistory());
  }, []);

  const handleInspect = useCallback((a: ResolvedArchetype) => {
    setInspecting(a);
    setView('inspect');
  }, []);

  const handleBack = useCallback(() => {
    setView('spin');
    setInspecting(null);
  }, []);

  const isSaved = inspecting ? saved.some(x => x.id === inspecting.id) : false;

  const tabs: { id: AppView; icon: React.ReactNode; label: string }[] = [
    { id: 'history', icon: <Lifebuoy size={18} weight="fill" />, label: 'History' },
    { id: 'spin',    icon: <DiceSix size={18} weight="fill" />,               label: 'Spin' },
    { id: 'library', icon: <BookmarkSimple size={18} weight="fill" />,        label: 'Library' },
  ];

  return (
    <>
    <Cursor />
    {/* SVG filter defs — zero-size, hidden */}
    <svg style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
      <defs>
        <filter id="ca" x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
          <feOffset in="SourceGraphic" dx="1" dy="0" result="r-offset"/>
          <feColorMatrix in="r-offset" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r"/>
          <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g"/>
          <feOffset in="SourceGraphic" dx="-1" dy="0" result="b-offset"/>
          <feColorMatrix in="b-offset" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b"/>
          <feBlend in="r" in2="g" mode="screen" result="rg"/>
          <feBlend in="rg" in2="b" mode="screen"/>
        </filter>
      </defs>
    </svg>

    {/* Fixed edge glow */}
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        pointerEvents: 'none',
        boxShadow: 'inset 0 0 80px rgba(255, 255, 255, 0.14)',
      }}
    />
    <div
      className="min-h-screen w-full flex justify-center"
      style={{ background: '#000' }}
    >
      {/* App shell */}
      <div className="w-full max-w-xl relative flex flex-col" style={{ minHeight: '100svh' }}>

        {/* Grid overlay */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Content area */}
        <div className="flex-1 overflow-y-auto" style={{ paddingBottom: '80px', filter: 'url(#ca)' }}>

          {/* SpinView: always mounted so state survives navigation */}
          <div
            style={{
              display: view === 'spin' ? 'flex' : 'none',
              flexDirection: 'column',
              justifyContent: 'center',
              minHeight: 'calc(100svh - 80px)',
            }}
          >
            <SpinView
              onInspect={handleInspect}
              onSave={handleSave}
              onResolve={handleResolve}
              savedIds={new Set(saved.map(x => x.id))}
            />
          </div>

          <AnimatePresence mode="wait">
            {view === 'inspect' && inspecting && (
              <motion.div
                key={`inspect-${inspecting.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <InspectPanel
                  archetype={inspecting}
                  onBack={handleBack}
                  onSave={handleSave}
                  isSaved={isSaved}
                />
              </motion.div>
            )}

            {view === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <HistoryView history={history} onInspect={handleInspect} />
              </motion.div>
            )}

            {view === 'library' && (
              <motion.div
                key="library"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <LibraryView
                  saved={saved}
                  onInspect={handleInspect}
                  onDelete={handleDelete}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom nav */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-xl z-50">
          <div
            className="mx-3 mb-3 rounded-xl flex overflow-hidden"
            style={{
              background: 'rgba(10,10,10,0.95)',
              border: '1px solid rgba(255,255,255,0.09)',
              backdropFilter: 'blur(24px)',
            }}
          >
            {tabs.map(tab => {
              const active = view === tab.id || (view === 'inspect' && tab.id === 'spin');
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === 'spin' && view === 'inspect') {
                      handleBack();
                    } else {
                      setView(tab.id);
                      if (tab.id !== 'inspect') setInspecting(null);
                    }
                  }}
                  className="flex-1 flex flex-col items-center gap-1 py-3.5 transition-all duration-200 relative"
                  style={{ color: active ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.25)' }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.25)'; }}
                >
                  {active && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-x-3 inset-y-1.5 rounded-lg"
                      style={{ background: 'rgba(255,255,255,0.07)' }}
                      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10">{tab.icon}</span>
                  <span className="relative z-10 text-[10px] font-medium">{tab.label}</span>
                  {tab.id === 'library' && saved.length > 0 && (
                    <span
                      className="absolute top-2 right-6 min-w-[14px] h-[14px] rounded-full text-[8px] font-bold flex items-center justify-center px-1"
                      style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)' }}
                    >
                      {saved.length}
                    </span>
                  )}
                  {tab.id === 'history' && history.length > 0 && (
                    <span
                      className="absolute top-2 right-6 min-w-[14px] h-[14px] rounded-full text-[8px] font-bold flex items-center justify-center px-1"
                      style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)' }}
                    >
                      {history.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
    </>
  );
}
