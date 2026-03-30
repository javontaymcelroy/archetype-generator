import clickUrl from '../assets/Click Sound Effect.mp3';

let ctx: AudioContext | null = null;
let buffer: AudioBuffer | null = null;
let loading = false;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export async function loadSounds() {
  if (buffer || loading) return;
  loading = true;
  try {
    const ac = getCtx();
    const res = await fetch(clickUrl);
    const arr = await res.arrayBuffer();
    buffer = await ac.decodeAudioData(arr);
  } catch {
    // sounds unavailable — fail silently
  }
}

export function playClick(speed = 1) {
  if (!buffer || !ctx) return;
  try {
    const source = ctx.createBufferSource();
    source.buffer = buffer;

    // Vary pitch slightly each tick so rapid clicks don't feel robotic
    source.playbackRate.value = 0.85 + Math.random() * 0.3;

    const gain = ctx.createGain();
    // Scale volume with spin speed: quiet at start/end, louder at peak
    const vol = Math.min(0.55, 0.12 + speed * 0.38);
    gain.gain.value = vol;

    source.connect(gain);
    gain.connect(ctx.destination);
    source.start(0);
  } catch {
    // ignore
  }
}
