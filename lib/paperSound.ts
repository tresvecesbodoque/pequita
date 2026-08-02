// Sonidos de la apertura de la carta, sintetizados con WebAudio: sin
// archivos, sin descargas. Tres sonidos DISTINTOS, uno por gesto físico:
//
//   playLacre() — el lacre se quiebra: golpe sordo + chasquido seco.
//   playSobre() — el sobre se abre: papel rozando papel, con fibras sueltas.
//   playHoja()  — la hoja se desdobla: papel DESARRUGÁNDOSE, crujido que
//                 empieza apretado y se va soltando hasta quedar en calma.
//
// Cómo suena el papel (y por qué la versión anterior sonaba a viento): el papel
// no hace "shhh". Hace cientos de MICROCRUJIDOS —fibras que se sueltan de
// golpe—, cada uno un impulso de 1–3 ms, repartidos de forma irregular en el
// tiempo. Un ruido filtrado con envolvente suave da un silbido sintético; lo
// que suena a papel es la GRANULARIDAD: muchos impulsos pequeños, unos pocos
// secos, y una densidad que decae mientras la hoja se relaja. Eso es lo que
// sintetiza `crackleBuffer` (proceso tipo Poisson con densidad variable), con
// un lecho de roce muy tenue por debajo para darle cuerpo.
//
// Se respeta la preferencia de silencio del usuario (localStorage).

const MUTE_KEY = "pequita-mute";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    ctx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    if (!master) {
      master = ctx.createGain();
      master.gain.value = 0.9;
      master.connect(ctx.destination);
    }
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
// Síntesis del crujido
// ————————————————————————————————————————————————————————————————

type CrackleOpts = {
  /** cuántos microcrujidos caben en la ráfaga (densidad del papel) */
  events: number;
  /**
   * Reparto en el tiempo. 1 = parejo; >1 amontona al principio y va
   * ralentizando (papel que se suelta y se calma); <1 crece hacia el final.
   */
  curve?: number;
  /** duración media de cada crujido (s): más alto = papel más grueso */
  decay?: number;
  /** lecho de roce continuo por debajo (0..1); da cuerpo, no silbido */
  bed?: number;
  /** corte grave del filtro, al empezar y al terminar (Hz) */
  hpFrom?: number;
  hpTo?: number;
};

/**
 * Buffer de microcrujidos: impulsos cortos repartidos irregularmente, con
 * amplitudes de cola larga (muchos pequeños, unos pocos secos) para que no
 * suene a metrónomo de clics iguales.
 */
function crackleBuffer(ac: AudioContext, dur: number, opts: CrackleOpts): AudioBuffer {
  const { events, curve = 1, decay = 0.0026, bed = 0 } = opts;
  const sr = ac.sampleRate;
  const frames = Math.max(1, Math.ceil(sr * dur));
  const buffer = ac.createBuffer(1, frames, sr);
  const data = buffer.getChannelData(0);

  // Lecho de fibras: ruido suavizado (paso bajo de un polo) y ondulado, para
  // que el crujido tenga sobre qué apoyarse. Muy bajo: no debe oírse solo.
  if (bed > 0) {
    let lp = 0;
    for (let i = 0; i < frames; i++) {
      lp += ((Math.random() * 2 - 1) - lp) * 0.4;
      const t = i / frames;
      const onda = 0.55 + 0.45 * Math.sin(t * Math.PI * 5 + Math.sin(t * 17));
      data[i] += lp * bed * onda;
    }
  }

  for (let e = 0; e < events; e++) {
    // Posición: uniforme deformada por `curve` (densidad variable en el tiempo).
    const at = Math.floor(frames * Math.min(0.999, Math.pow(Math.random(), curve)));
    // Amplitud sesgada: la mayoría son roces mínimos; alguno restalla.
    const amp = 0.1 + 0.9 * Math.pow(Math.random(), 3);
    const d = decay * (0.35 + Math.random() * 1.3);
    const k = 1 / (d * sr);
    const len = Math.min(frames - at, Math.ceil(d * sr * 6));
    for (let i = 0; i < len; i++) {
      data[at + i] += amp * (Math.random() * 2 - 1) * Math.exp(-i * k);
    }
  }

  // Normaliza si nos pasamos: saturar suena a distorsión, no a papel.
  let peak = 0;
  for (let i = 0; i < frames; i++) peak = Math.max(peak, Math.abs(data[i]));
  if (peak > 1) for (let i = 0; i < frames; i++) data[i] /= peak;

  return buffer;
}

/**
 * Toca una ráfaga de crujido.
 * @param at   inicio relativo (s)
 * @param dur  duración (s)
 * @param gain volumen (0..1)
 */
function crackle(
  ac: AudioContext,
  at: number,
  dur: number,
  gain: number,
  opts: CrackleOpts
): void {
  const { hpFrom = 1100, hpTo } = opts;
  const t0 = ac.currentTime + at;

  const src = ac.createBufferSource();
  src.buffer = crackleBuffer(ac, dur, opts);

  // El papel casi no tiene graves: el corte quita el "soplo" que sobra.
  const hp = ac.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.setValueAtTime(hpFrom, t0);
  if (hpTo) hp.frequency.exponentialRampToValueAtTime(hpTo, t0 + dur);
  hp.Q.value = 0.5;

  // Resonancia del pliegue: la hoja hace de caja y realza la zona media-alta.
  const cuerpo = ac.createBiquadFilter();
  cuerpo.type = "peaking";
  cuerpo.frequency.value = 2900;
  cuerpo.Q.value = 0.7;
  cuerpo.gain.value = 5;

  // Envolvente solo para entrar y salir sin chasquido: la forma del sonido ya
  // vive dentro del buffer (densidad de crujidos), no en el volumen.
  const g = ac.createGain();
  const fade = Math.min(0.05, dur * 0.15);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + Math.min(0.012, fade));
  g.gain.setValueAtTime(gain, t0 + dur - fade);
  g.gain.linearRampToValueAtTime(0, t0 + dur);

  src.connect(hp).connect(cuerpo).connect(g).connect(master!);
  src.start(t0);
  src.stop(t0 + dur + 0.02);
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
  osc.connect(g).connect(master!);
  osc.start(t0);
  osc.stop(t0 + dur);
}

// ————————————————————————————————————————————————————————————————
// Los sonidos del ritual
// ————————————————————————————————————————————————————————————————

/** El lacre se QUIEBRA: golpe sordo y dos esquirlas secas. */
export function playLacre(): void {
  if (isMuted()) return;
  const ac = getCtx();
  if (!ac) return;
  thump(ac, 0, 0.09, 0.2, 150, 55); // el cuerpo del sello cede
  crackle(ac, 0, 0.07, 0.5, { events: 3, decay: 0.004, hpFrom: 2200, hpTo: 1500 });
  crackle(ac, 0.06, 0.05, 0.28, { events: 2, decay: 0.003, hpFrom: 3000 });
}

/**
 * El sobre se ABRE: papel rozando papel. Crujido menudo y parejo sobre un
 * lecho de fibras; el filtro se abre a medida que la solapa se separa.
 * @param dur duración del roce (por defecto ~0.7s: la solapa girando)
 */
export function playSobre(dur = 0.7): void {
  if (isMuted()) return;
  const ac = getCtx();
  if (!ac) return;
  crackle(ac, 0, dur, 0.26, {
    events: Math.round(46 * dur),
    curve: 0.9,
    decay: 0.0022,
    bed: 0.06,
    hpFrom: 850,
    hpTo: 1500,
  });
}

/**
 * La hoja se DESDOBLA: papel desarrugándose. Tres olas encadenadas —el
 * pliegue que cede, la hoja que se abre y las fibras que terminan de
 * acomodarse—, cada una menos densa y más grave que la anterior, como cuando
 * sueltas un papel arrugado y sigue crujiendo solo hasta quedarse quieto.
 */
export function playHoja(): void {
  if (isMuted()) return;
  const ac = getCtx();
  if (!ac) return;
  // 1) el pliegue cede: apretado, brillante, denso al principio
  crackle(ac, 0, 0.5, 0.3, {
    events: 78,
    curve: 1.5,
    decay: 0.0026,
    bed: 0.05,
    hpFrom: 1600,
    hpTo: 950,
  });
  // 2) la hoja se abre: se va soltando, con más cuerpo
  crackle(ac, 0.3, 0.85, 0.24, {
    events: 58,
    curve: 2.2,
    decay: 0.0034,
    bed: 0.04,
    hpFrom: 1100,
    hpTo: 700,
  });
  // 3) el papel termina de acomodarse: crujidos sueltos, cada vez más lejos
  crackle(ac, 0.95, 0.8, 0.14, {
    events: 16,
    curve: 3.2,
    decay: 0.004,
    hpFrom: 800,
  });
}

/**
 * Un sobrecito pequeño: el mismo gesto que `playSobre`, pero más corto y más
 * agudo (menos papel, menos aire). Lo usa el sobre de las fotos.
 */
export function playSobrecito(): void {
  if (isMuted()) return;
  const ac = getCtx();
  if (!ac) return;
  crackle(ac, 0, 0.42, 0.22, {
    events: 26,
    curve: 1.2,
    decay: 0.0018,
    bed: 0.04,
    hpFrom: 1300,
    hpTo: 2100,
  });
}
