"use client";

import { useEffect, useRef, useState } from "react";

// Grabador de audio-carta: hasta 30 segundos con MediaRecorder.
// Devuelve el Blob grabado (o null al quitar). El envío lo hace el formulario.

const MAX_SECONDS = 30;

export function VoiceRecorder({ onChange }: { onChange: (b: Blob | null) => void }) {
  const [estado, setEstado] = useState<"idle" | "grabando" | "listo" | "sin-mic">("idle");
  const [segundos, setSegundos] = useState(0);
  const [url, setUrl] = useState<string | null>(null);
  const rec = useRef<MediaRecorder | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearInterval(timer.current);
      rec.current?.stream.getTracks().forEach((t) => t.stop());
      if (url) URL.revokeObjectURL(url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function grabar() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : MediaRecorder.isTypeSupported("audio/mp4")
          ? "audio/mp4"
          : "";
      const r = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      const chunks: BlobPart[] = [];
      r.ondataavailable = (e) => chunks.push(e.data);
      r.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks, { type: r.mimeType || "audio/webm" });
        const u = URL.createObjectURL(blob);
        setUrl(u);
        setEstado("listo");
        onChange(blob);
      };
      rec.current = r;
      r.start();
      setSegundos(0);
      setEstado("grabando");
      timer.current = setInterval(() => {
        setSegundos((s) => {
          if (s + 1 >= MAX_SECONDS) parar();
          return s + 1;
        });
      }, 1000);
    } catch {
      setEstado("sin-mic");
    }
  }

  function parar() {
    if (timer.current) clearInterval(timer.current);
    if (rec.current?.state === "recording") rec.current.stop();
  }

  function quitar() {
    if (url) URL.revokeObjectURL(url);
    setUrl(null);
    setEstado("idle");
    onChange(null);
  }

  if (estado === "sin-mic") {
    return (
      <p className="text-xs text-[var(--muted)]">
        No pudimos acceder al micrófono — puedes enviar la carta sin voz. 🙂
      </p>
    );
  }

  if (estado === "grabando") {
    return (
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={parar}
          className="flex items-center gap-2 rounded-full border-2 border-[var(--accent)] bg-[var(--accent)]/10 px-4 py-2 text-sm text-[var(--accent)]"
        >
          <span className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-[var(--accent)]" />
          Detener ({MAX_SECONDS - segundos}s)
        </button>
      </div>
    );
  }

  if (estado === "listo" && url) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <audio src={url} controls className="h-10 max-w-full" />
        <button
          type="button"
          onClick={quitar}
          className="text-sm text-[var(--muted)] hover:underline"
        >
          Quitar
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={grabar}
      className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--border)] px-4 py-3 text-sm text-[var(--muted)] transition-colors hover:border-[var(--accent)]"
    >
      <span aria-hidden>🎙</span> Grabarle un mensaje de voz (máx. {MAX_SECONDS}s)
    </button>
  );
}
