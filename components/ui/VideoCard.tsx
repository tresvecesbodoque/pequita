"use client";

/* eslint-disable jsx-a11y/media-has-caption */

// Tarjeta de vídeo-saludo, en la misma línea "bosquejo" que AudioCard: aparece
// junto al audio al abrir la carta, como otro recuerdo que sale con el papel.

export function VideoCard({ src, label = "Mira su vídeo" }: { src: string; label?: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border-2 border-[var(--foreground)]/60 bg-[var(--surface)]/95 p-3 shadow-[3px_4px_0_rgba(124,27,34,0.25)] backdrop-blur">
      <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--foreground)]">
        <span aria-hidden>🎬</span> {label}
      </span>
      <video
        src={src}
        controls
        playsInline
        preload="metadata"
        className="w-56 max-w-[60vw] rounded-lg bg-black"
      />
    </div>
  );
}
