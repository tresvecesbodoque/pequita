"use client";

/* eslint-disable @next/next/no-img-element */

export function QRDisplay({
  dataUrl,
  label,
  filename,
}: {
  dataUrl: string;
  label: string;
  filename: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="rounded-xl border border-[var(--border)] bg-white p-2">
        <img src={dataUrl} alt={label} className="h-32 w-32" />
      </div>
      <span className="text-xs text-[var(--muted)]">{label}</span>
      <a
        href={dataUrl}
        download={filename}
        className="text-xs text-[var(--accent)] underline-offset-2 hover:underline"
      >
        Descargar
      </a>
    </div>
  );
}
