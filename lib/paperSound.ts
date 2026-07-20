// Sonidos de la apertura de la carta, sintetizados con WebAudio: sin
// archivos, sin descargas. Tres sonidos DISTINTOS, uno por gesto físico:
//
//   playLacre() — el lacre se quiebra: golpe sordo + chasquido doble agudo.
//   playSobre() — el sobre se abre: roce largo de papel contra papel.
//   playHoja()  — la hoja se desdobla: dos crujidos crecientes y un aleteo.
//
// Se respeta la preferencia de silencio del usuario (localStorage).

const MUTE_KEY = "pequita-mute";

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    ctx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
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

// ————————————————————————————————————————————————————————————————
// Bloques de síntesis
// ————————————————————————————————————————————————————————————————

/** Ruido "granular": picos dispersos → fibras de papel, no estática. */
function noiseSource(ac: AudioContext, dur: number, density = 0.06): AudioBufferSourceNode {
  const frames = Math.max(1, Math.floor(ac.sampleRate * dur));
  const buffer = ac.createBuffer(1, frames, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i++) {
    data[i] = Math.random() < density ? Math.random() * 2 - 1 : (Math.random() * 2 - 1) * 0.12;
  }
  const src = ac.createBufferSource();
  src.buffer = buffer;
  return src;
}

/**
 * Ráfaga de ruido filtrado con envolvente y barrido opcional del filtro.
 * @param at      inicio relativo (s)
 * @param dur     duración (s)
 * @param gain    volumen pico (0..1)
 * @param freq    frecuencia central del pasabanda
 * @param opts    attack: subida (s); sweepTo: frecuencia final; density: grano
 */
function burst(
  ac: AudioContext,
  at: number,
  dur: number,
  gain: number,
  freq: number,
  opts: { attack?: number; sweepTo?: number; density?: number; q?: number } = {}
): void {
  const { attack = 0.02, sweepTo, density = 0.06, q = 0.8 } = opts;
  const t0 = ac.currentTime + at;
  const src = noiseSource(ac, dur, density);
  const band = ac.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.setValueAtTime(freq, t0);
  if (sweepTo) band.frequency.exponentialRampToValueAtTime(sweepTo, t0 + dur);
  band.Q.value = q;
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(band).connect(g).connect(ac.destination);
  src.start(t0);
  src.stop(t0 + dur);
}

/** Golpe sordo: seno con caída rápida de tono y volumen (cuerpo del "crack"). */
function thump(ac: AudioContext, at: number, dur: number, gain: number, from: number, to: number): void {
  const t0 = ac.currentTime + at;
  const osc = ac.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(from, t0);
  osc.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur);
}

// ————————————————————————————————————————————————————————————————
// Los tres sonidos del ritual
// ————————————————————————————————————————————————————————————————

/** El lacre se QUIEBRA: golpe sordo + chasquido doble, seco y breve. */
export function playLacre(): void {
  if (isMuted()) return;
  const ac = getCtx();
  if (!ac) return;
  thump(ac, 0, 0.09, 0.2, 150, 55); // el cuerpo del sello cede
  burst(ac, 0, 0.045, 0.3, 2600, { attack: 0.004, density: 0.3, q: 1.4 }); // ¡crack!
  burst(ac, 0.05, 0.03, 0.18, 3400, { attack: 0.004, density: 0.3, q: 1.4 }); // esquirla
}

/**
 * El sobre se ABRE: roce sostenido de papel contra papel, con un swell suave.
 * @param dur duración del roce (por defecto ~0.7s: la solapa girando)
 */
export function playSobre(dur = 0.7): void {
  if (isMuted()) return;
  const ac = getCtx();
  if (!ac) return;
  burst(ac, 0, dur, 0.13, 850, { attack: dur * 0.25, sweepTo: 1500, density: 0.05 });
  // fibras sueltas que se despegan a mitad del gesto
  burst(ac, dur * 0.45, dur * 0.3, 0.07, 2000, { attack: 0.02, density: 0.12 });
}

/** La hoja se DESDOBLA: dos crujidos crecientes y un aleteo final del papel. */
export function playHoja(): void {
  if (isMuted()) return;
  const ac = getCtx();
  if (!ac) return;
  burst(ac, 0, 0.18, 0.11, 1300, { attack: 0.02, density: 0.08 }); // primer pliegue
  burst(ac, 0.24, 0.5, 0.16, 900, { attack: 0.05, sweepTo: 2100, density: 0.07 }); // segundo, abre
  burst(ac, 0.78, 0.05, 0.12, 2600, { attack: 0.005, density: 0.25, q: 1.2 }); // aleteo al quedar tensa
}
