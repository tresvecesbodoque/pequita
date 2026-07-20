"use client";

import { useEffect, useRef, useState } from "react";

// Reproductor de audio propio, en la línea bosquejo del sitio: botón redondo
// rojo con sombra dura y una barra de progreso de tinta. Sustituye al control
// nativo del navegador (gris, ajeno al mundo dibujado) en la audio-carta.

function fmt(s: number): string {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${String(r).padStart(2, "0")}`;
}

export function AudioCard({ src, label = "Escucha su voz" }: { src: string; label?: string }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [dur, setDur] = useState(0);

  useEffect(() => {
    const a = ref.current;
    if (!a) return;
    const onTime = () => setTime(a.currentTime);
    const onMeta = () => setDur(a.duration);
    const onEnd = () => setPlaying(false);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onMeta);
    a.addEventListener("durationchange", onMeta);
    a.addEventListener("ended", onEnd);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onMeta);
      a.removeEventListener("durationchange", onMeta);
      a.removeEventListener("ended", onEnd);
    };
  }, []);

  function toggle() {
    const a = ref.current;
    if (!a) return;
    if (a.paused) {
      a.play();
      setPlaying(true);
    } else {
      a.pause();
      setPlaying(false);
    }
  }

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    const a = ref.current;
    if (!a || !isFinite(a.duration)) return;
    const r = e.currentTarget.getBoundingClientRect();
    a.currentTime = ((e.clientX - r.left) / r.width) * a.duration;
  }

  const pct = dur > 0 ? (time / dur) * 100 : 0;

  return (
    <div className="flex items-center gap-3 rounded-2xl border-2 border-[var(--foreground)]/60 bg-[var(--surface)]/95 px-4 py-3 shadow-[3px_4px_0_rgba(124,27,34,0.25)] backdrop-blur">
      <audio ref={ref} src={src} preload="metadata" />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pausar" : "Reproducir"}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--night-ink)] shadow-[2px_3px_0_rgba(124,27,34,0.4)] transition-transform hover:scale-105 active:scale-95"
      >
        {playing ? (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
            <rect x="6" y="5" width="4" height="14" rx="1.4" />
            <rect x="14" y="5" width="4" height="14" rx="1.4" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="ml-0.5 h-4 w-4" fill="currentColor" aria-hidden>
            <path d="M8 5.8c0-1 1.1-1.6 2-1.1l9.2 6.2c.8.5.8 1.7 0 2.2L10 19.3c-.9.5-2-.1-2-1.1z" />
          </svg>
        )}
      </button>
      <div className="flex w-48 max-w-[52vw] flex-col gap-1.5">
        <span className="text-xs font-semibold text-[var(--foreground)]">{label}</span>
        <div
          role="slider"
          aria-label="Progreso del audio"
          aria-valuemin={0}
          aria-valuemax={Math.round(dur)}
          aria-valuenow={Math.round(time)}
          onClick={seek}
          className="relative h-4 cursor-pointer"
        >
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-[var(--border)]" />
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 border-t-2 border-[var(--accent)]"
            style={{ width: `${pct}%` }}
          />
          {/* estrellita como cabezal */}
          <svg
            viewBox="0 0 24 24"
            className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${pct}%` }}
            aria-hidden
          >
            <path
              d="M12 3l2.2 5.4 5.8.5-4.4 3.8 1.3 5.7L12 15.9l-4.9 2.5 1.3-5.7L4 8.9l5.8-.5z"
              fill="var(--gold)"
              stroke="var(--foreground)"
              strokeWidth="1.4"
            />
          </svg>
        </div>
        <span className="self-end text-[0.65rem] tabular-nums text-[var(--muted)]">
          {fmt(time)} / {fmt(dur)}
        </span>
      </div>
    </div>
  );
}
