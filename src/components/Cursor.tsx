import { useEffect, useRef, useState } from 'react';

export default function Cursor() {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const pos     = useRef({ x: -100, y: -100 });
  const ring    = useRef({ x: -100, y: -100 });
  const raf     = useRef<number>(0);
  const [hovering, setHovering] = useState(false);
  const [clicking, setClicking] = useState(false);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
    };

    const onDown = () => setClicking(true);
    const onUp   = () => setClicking(false);

    const onEnter = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest('button, a, input, select, [role="button"], label')) {
        setHovering(true);
      }
    };
    const onLeave = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest('button, a, input, select, [role="button"], label')) {
        setHovering(false);
      }
    };

    window.addEventListener('mousemove',  onMove);
    window.addEventListener('mousedown',  onDown);
    window.addEventListener('mouseup',    onUp);
    window.addEventListener('mouseover',  onEnter);
    window.addEventListener('mouseout',   onLeave);

    // Laggy ring follows with lerp
    const loop = () => {
      ring.current.x += (pos.current.x - ring.current.x) * 0.12;
      ring.current.y += (pos.current.y - ring.current.y) * 0.12;

      if (dotRef.current) {
        dotRef.current.style.transform =
          `translate(${pos.current.x}px, ${pos.current.y}px) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform =
          `translate(${ring.current.x}px, ${ring.current.y}px) translate(-50%, -50%)`;
      }
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove',  onMove);
      window.removeEventListener('mousedown',  onDown);
      window.removeEventListener('mouseup',    onUp);
      window.removeEventListener('mouseover',  onEnter);
      window.removeEventListener('mouseout',   onLeave);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  const base: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    pointerEvents: 'none',
    zIndex: 99999,
    willChange: 'transform',
    mixBlendMode: 'difference',
  };

  return (
    <>
      {/* Dot — snaps to cursor */}
      <div
        ref={dotRef}
        style={{
          ...base,
          width:  clicking ? 5 : hovering ? 6 : 5,
          height: clicking ? 5 : hovering ? 6 : 5,
          borderRadius: '50%',
          background: hovering ? '#fff' : 'rgba(255,255,255,0.9)',
          transition: 'width 0.15s, height 0.15s, background 0.15s',
        }}
      />

      {/* Ring — lags behind */}
      <div
        ref={ringRef}
        style={{
          ...base,
          width:  clicking ? 28 : hovering ? 36 : 22,
          height: clicking ? 28 : hovering ? 36 : 22,
          borderRadius: '50%',
          border: `1px solid ${hovering ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)'}`,
          background: hovering ? 'rgba(255,255,255,0.06)' : 'transparent',
          transition: 'width 0.2s, height 0.2s, border-color 0.2s, background 0.2s',
        }}
      />
    </>
  );
}
