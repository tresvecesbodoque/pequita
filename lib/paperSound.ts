// Sonidos de la apertura de la carta. Son GRABACIONES, no síntesis.
//
// Hubo dos intentos sintetizados con WebAudio: el primero, ruido filtrado con
// envolvente, sonaba a viento; el segundo, microcrujidos granulares, ya sonaba
// a papel pero seguía siendo una imitación. Con dos grabaciones de verdad
// (`public/sonidos/`) sobra el laboratorio entero.
//
//   playLacre()     — el lacre se quiebra          → sello-rompiendose.mp3
//   playSobre(dur)  — la solapa se abre            → papel-abriendose.mp3
//   playHoja()      — la hoja sale y se desdobla   → papel-abriendose.mp3, más lenta
//   playSobrecito() — el sobre de las fotos        → papel-abriendose.mp3, más viva
//
// Los tres gestos de papel salen del mismo archivo, cambiando la velocidad y el
// volumen: un sobre pequeño suena más agudo y más corto que una hoja grande, y
// eso es exactamente lo que hace `playbackRate`.
//
// Se usa `<audio>` y NO WebAudio a propósito: en el iPhone, WebAudio hace que el
// interruptor de silencio apague el sonido y deja de obedecer a `volume`. Con
// elementos de audio corrientes el sistema manda, que es lo que se quiere.
//
// Se respeta la preferencia de silencio del usuario (localStorage).

const MUTE_KEY = "pequita-mute";

const SELLO = "/sonidos/sello-rompiendose.mp3";
const PAPEL = "/sonidos/papel-abriendose.mp3";

/** Duración real de la grabación de papel (s), medida del archivo. */
const PAPEL_DUR = 0.55;

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
// Reproducción
// ————————————————————————————————————————————————————————————————

// Un elemento por archivo, solo para que el navegador lo descargue y lo deje en
// caché. Nunca se reproduce este: cada toque usa un clon, porque la apertura
// encadena dos roces de papel que se solapan y un mismo elemento se cortaría a
// sí mismo al reiniciarse.
const precargados = new Map<string, HTMLAudioElement>();

function precargar(src: string): void {
  if (typeof window === "undefined" || precargados.has(src)) return;
  const el = new Audio(src);
  el.preload = "auto";
  precargados.set(src, el);
}

/** Deja los dos sonidos en caché antes de que hagan falta. */
export function precargarSonidos(): void {
  precargar(SELLO);
  precargar(PAPEL);
}

/**
 * Toca un archivo.
 * @param src   ruta en /public
 * @param vol   volumen (0..1)
 * @param rate  velocidad: >1 más corto y agudo, <1 más largo y grave
 * @param at    retraso antes de empezar (s)
 */
function tocar(src: string, vol: number, rate = 1, at = 0): void {
  if (typeof window === "undefined" || isMuted()) return;
  precargar(src);

  const lanzar = () => {
    // Si mientras esperaba el retraso han pulsado silencio, ya no suena.
    if (isMuted()) return;
    try {
      const el = precargados.get(src)!.cloneNode(true) as HTMLAudioElement;
      el.volume = Math.max(0, Math.min(1, vol));
      el.playbackRate = rate;
      // Sin esto, Safari conserva el tono al cambiar la velocidad y el sobrecito
      // no suena más pequeño, solo más rápido.
      (el as HTMLAudioElement & { preservesPitch?: boolean }).preservesPitch = false;
      void el.play().catch(() => {
        // El navegador puede negarse si aún no ha habido un gesto del usuario.
        // No es un fallo: la carta se abre igual, en silencio.
      });
    } catch {
      // sin audio disponible: el ritual sigue siendo visual
    }
  };

  if (at > 0) window.setTimeout(lanzar, at * 1000);
  else lanzar();
}

// ————————————————————————————————————————————————————————————————
// Los sonidos del ritual
// ————————————————————————————————————————————————————————————————

/** El lacre se QUIEBRA. Es el golpe del ritual: va más fuerte que el resto. */
export function playLacre(): void {
  tocar(SELLO, 0.85);
}

/**
 * El sobre se ABRE: la solapa rozando el papel.
 * @param dur cuánto dura el gesto en pantalla (s). La grabación no se estira,
 *            pero se ajusta la velocidad para que acompañe: un gesto largo pide
 *            un roce más lento. Se limita para que no suene a broma.
 */
export function playSobre(dur = 0.7): void {
  const rate = Math.max(0.75, Math.min(1.35, PAPEL_DUR / dur));
  tocar(PAPEL, 0.55, rate);
}

/**
 * La hoja se DESDOBLA. Es más papel que la solapa, así que suena más lenta y
 * más grave, y se le añade una segunda pasada muy floja: las fibras que
 * terminan de acomodarse cuando la hoja ya está quieta.
 */
export function playHoja(): void {
  tocar(PAPEL, 0.65, 0.82);
  tocar(PAPEL, 0.18, 0.7, 0.42);
}

/** El sobrecito de las fotos: menos papel, así que más corto y más agudo. */
export function playSobrecito(): void {
  tocar(PAPEL, 0.45, 1.25);
}

/**
 * El roce de mover algo con el dedo: la solapa del sobre o el pliegue de la
 * hoja mientras se arrastran.
 *
 * Trae su propio freno, y es imprescindible: un arrastre dispara decenas de
 * eventos por segundo, y encadenar cincuenta copias del mismo medio segundo de
 * papel no suena a papel, suena a lija. Se deja pasar uno cada 130 ms como
 * mucho, con la velocidad algo distinta cada vez para que no se note el bucle.
 *
 * @param fuerza 0..1 — cuánto se ha movido; el papel suena más cuanto más corre.
 */
let ultimoRoce = 0;
export function playRoce(fuerza = 0.5): void {
  const ahora = Date.now();
  if (ahora - ultimoRoce < 130) return;
  ultimoRoce = ahora;
  const f = Math.max(0, Math.min(1, fuerza));
  tocar(PAPEL, 0.12 + 0.3 * f, 1.05 + Math.random() * 0.35);
}
