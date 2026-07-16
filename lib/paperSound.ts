// Sonido de papel sintetizado con WebAudio: sin archivos, sin descargas.
// Un crujido = ráfaga corta de ruido filtrado con envolvente rápida. Se
// respeta la preferencia de silencio del usuario (localStorage).

const MUTE_KEY = "pequita-mute";

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    ctx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    return ctx;
  } catch {
    return null;
  }
}

export function isMuted(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(MUTE_KEY) === "1";
}

export function setMuted(m: boolean): void {
  try {
    localStorage.setItem(MUTE_KEY, m ? "1" : "0");
  } catch {
    // sin almacenamiento: la preferencia dura solo la sesión
  }
}

/**
 * Reproduce un crujido de papel.
 * @param dur   duración en segundos
 * @param gain  volumen (0..1)
 * @param color frecuencia central del filtro pasabanda (timbre)
 */
export function playPaper(dur = 0.5, gain = 0.16, color = 1400): void {
  if (isMuted()) return;
  const ac = getCtx();
  if (!ac) return;
  if (ac.state === "suspended") ac.resume().catch(() => {});

  const now = ac.currentTime;
  const frames = Math.floor(ac.sampleRate * dur);
  const buffer = ac.createBuffer(1, frames, ac.sampleRate);
  const data = buffer.getChannelData(0);
  // Ruido "granular": picos dispersos → suena a fibras de papel, no a estática.
  for (let i = 0; i < frames; i++) {
    data[i] = Math.random() < 0.06 ? (Math.random() * 2 - 1) : (Math.random() * 2 - 1) * 0.12;
  }

  const src = ac.createBufferSource();
  src.buffer = buffer;

  const band = ac.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = color;
  band.Q.value = 0.7;

  const g = ac.createGain();
  // envolvente: ataque casi instantáneo, caída suave
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(gain, now + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, now + dur);

  src.connect(band).connect(g).connect(ac.destination);
  src.start(now);
  src.stop(now + dur);
}
