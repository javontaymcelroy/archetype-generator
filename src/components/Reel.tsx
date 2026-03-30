import { useEffect, useRef, useState } from 'react';
import { animate } from 'framer-motion';
import { playClick } from '../lib/sounds';
import { Lock, LockOpen } from '@phosphor-icons/react';
import type { Icon } from '@phosphor-icons/react';
import { LayerIcon } from './Icons';
import type { ReelDef } from '../data/primitives';

const ITEM_H = 68;

interface ReelProps {
  def: ReelDef;
  value: string;
  isLocked: boolean;
  isSpinning: boolean;
  onToggleLock: () => void;
  spinDelay?: number;
  spinItems?: number;
  spinDuration?: number;
  /** Optional map of value → Phosphor icon. When provided, renders icons instead of text. */
  iconMap?: Record<string, Icon>;
}

function buildStaticStrip(value: string, vals: readonly string[]): string[] {
  const idx = vals.indexOf(value as string);
  if (idx === -1) return [vals[vals.length - 1] as string, value, vals[0] as string];
  const prev = vals[(idx - 1 + vals.length) % vals.length] as string;
  const next = vals[(idx + 1) % vals.length] as string;
  return [prev, value, next];
}

function buildSpinStrip(currentValue: string, targetValue: string, vals: readonly string[], spinItems: number): string[] {
  const vArr = vals as string[];
  const randoms: string[] = [];
  for (let i = 0; i < spinItems; i++) {
    randoms.push(vArr[Math.floor(Math.random() * vArr.length)]);
  }
  const targetIdx = vArr.indexOf(targetValue);
  const nextVal = vArr[(targetIdx + 1) % vArr.length];
  return [currentValue, ...randoms, targetValue, nextVal];
}

export default function Reel({
  def, value, isLocked, isSpinning, onToggleLock, spinDelay = 0, spinItems = 20, spinDuration = 4.5, iconMap,
}: ReelProps) {
  const stripRef = useRef<HTMLDivElement>(null);
  const [strip, setStrip] = useState<string[]>(() => buildStaticStrip(value, def.values));
  const [isActive, setIsActive] = useState(false);
  const prevValueRef = useRef(value);

  const setStripY = (y: number) => {
    if (stripRef.current) stripRef.current.style.transform = `translateY(${y}px)`;
  };

  useEffect(() => {
    if (!isSpinning) {
      setIsActive(false);
      prevValueRef.current = value;
      // Reset strip and Y in the same frame so the browser never paints an
      // inconsistent state (strip at old animation offset showing wrong item).
      requestAnimationFrame(() => {
        setStripY(0);
        setStrip(buildStaticStrip(value, def.values));
      });
      return;
    }
    if (isLocked) { setIsActive(false); return; }

    const spinStrip = buildSpinStrip(prevValueRef.current, value, def.values, spinItems);
    setStrip(spinStrip);
    setIsActive(true);

    requestAnimationFrame(() => {
      setStripY(0);
      const endY = -spinItems * ITEM_H;
      let lastTickIdx = 0;
      let lastV = 0;
      let lastT = performance.now();
      const controls = animate(0, endY, {
        duration: spinDuration,
        delay: spinDelay / 1000,
        ease: [0.05, 0.35, 0.15, 1],
        onUpdate(v) {
          setStripY(v);
          const now = performance.now();
          const dt = now - lastT || 16;
          // speed in items/ms, normalised to 0–1 range (~peak is ~0.5 items/ms)
          const speed = Math.min(1, Math.abs(v - lastV) / dt / 0.5);
          lastV = v;
          lastT = now;
          // Fire a tick every time a new item crosses the center line
          const idx = Math.floor((-v + ITEM_H / 2) / ITEM_H);
          if (idx !== lastTickIdx) {
            lastTickIdx = idx;
            playClick(speed);
          }
        },
        onComplete() { setIsActive(false); },
      });
      (stripRef as any)._cancel = () => controls.stop();
    });

    return () => { (stripRef as any)._cancel?.(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSpinning]);

  return (
    <div
      className="overflow-hidden select-none transition-all duration-200 rounded-xl"
      style={{
        background: '#0a0a0a',
        border: `1px solid ${isLocked ? 'rgba(255,255,255,0.18)' : isActive ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.07)'}`,
        opacity: isLocked ? 0.55 : 1,
      }}
    >
      {/* Label row */}
      <div className="flex items-center justify-between px-3 pt-2.5 pb-2">
        <div className="flex items-center gap-2">
          <LayerIcon iconKey={def.iconKey} size={13} color="rgba(255,255,255,0.35)" />
          <span
            className="text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            {def.shortLabel}
          </span>
        </div>
        <button
          onClick={onToggleLock}
          className="p-0.5 transition-opacity duration-150"
          style={{ color: isLocked ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.18)' }}
          title={isLocked ? 'Unlock' : 'Lock'}
        >
          {isLocked ? <Lock size={13} weight="fill" /> : <LockOpen size={13} weight="regular" />}
        </button>
      </div>

      {/* Reel window */}
      <div
        className="relative mx-2.5 mb-2.5 overflow-hidden"
        style={{ height: ITEM_H * 3, background: '#060606' }}
      >
        {/* Center band */}
        <div
          className="absolute inset-x-0 z-10 pointer-events-none"
          style={{
            top: ITEM_H,
            height: ITEM_H,
            background: 'rgba(255,255,255,0.04)',
            borderTop: '1px solid rgba(255,255,255,0.10)',
            borderBottom: '1px solid rgba(255,255,255,0.10)',
          }}
        />
        {/* Top fade */}
        <div
          className="absolute inset-x-0 top-0 z-20 pointer-events-none"
          style={{ height: ITEM_H, background: 'linear-gradient(to bottom, #060606 30%, transparent)' }}
        />
        {/* Bottom fade */}
        <div
          className="absolute inset-x-0 bottom-0 z-20 pointer-events-none"
          style={{ height: ITEM_H, background: 'linear-gradient(to top, #060606 30%, transparent)' }}
        />

        {/* Strip */}
        <div ref={stripRef} className="will-change-transform">
          {strip.map((item, i) => {
            const isCenter = i === 1 && !isActive;
            const IconComp = iconMap?.[item];
            return (
              <div
                key={`${i}-${item}`}
                className="flex items-center justify-center px-1.5"
                style={{ height: ITEM_H }}
              >
                {IconComp ? (
                  <IconComp
                    size={26}
                    weight="fill"
                    style={{
                      color: isCenter ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.16)',
                      transition: 'color 0.15s',
                    }}
                  />
                ) : (
                  <span
                    className="text-[13px] font-semibold text-center leading-tight"
                    style={{ color: isCenter ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.18)' }}
                  >
                    {item}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
