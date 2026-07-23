"use client";

/* eslint-disable jsx-a11y/media-has-caption */

import { useEffect, useRef, useState } from "react";

// Vídeo-saludo breve: grabar con la cámara (máx. 20s) o subir un clip. Devuelve
// el Blob (o null al quitar); el envío lo hace el formulario. Todos los clips se
// compilan luego en la "película" final del álbum.

const MAX_SECONDS = 20;

export function VideoRecorder({ onChange }: { onChange: (b: Blob | null) => void }) {
  const [estado, setEstado] = useState<"idle" | "grabando" | "listo" | "sin-cam">("idle");
  const [segundos, setSegundos] = useState(0);
  const [url, setUrl] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const rec = useRef<MediaRecorder | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const liveRef = useRef<HTMLVideoElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearInterval(timer.current);
      rec.current?.stream.getTracks().forEach((t) => t.stop());
      if (url) URL.revokeObjectURL(url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function elegirMime() {
    const cands = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm",
      "video/mp4",
    ];
    return cands.find((m) => MediaRecorder.isTypeSupported(m)) || "";
  }

  async function grabar() {
    setAviso(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: true,
      });
      // Vista previa en vivo mientras se graba.
      if (liveRef.current) {
        liveRef.current.srcObject = stream;
        liveRef.current.play().catch(() => {});
      }
      const mime = elegirMime();
      const r = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      const chunks: BlobPart[] = [];
      r.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      r.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks, { type: r.mimeType || "video/webm" });
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
      setEstado("sin-cam");
    }
  }

  function parar() {
    if (timer.current) clearInterval(timer.current);
    if (rec.current?.state === "recording") rec.current.stop();
  }

  function onSubir(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (fileRef.current) fileRef.current.value = "";
    if (!f) return;
    setAviso(null);
    const u = URL.createObjectURL(f);
    // Aviso suave si el clip es largo: la idea es 15-20s.
    const probe = document.createElement("video");
    probe.preload = "metadata";
    probe.onloadedmetadata = () => {
      if (probe.duration && probe.duration > 35) {
        setAviso("El clip es largo — mejor de 15-20 segundos 🙂, pero se aceptó igual.");
      }
    };
    probe.src = u;
    if (url) URL.revokeObjectURL(url);
    setUrl(u);
    setEstado("listo");
    onChange(f);
  }

  function quitar() {
    if (url) URL.revokeObjectURL(url);
    setUrl(null);
    setAviso(null);
    setEstado("idle");
    onChange(null);
  }

  if (estado === "sin-cam") {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-xs text-[var(--muted)]">
          No pudimos usar la cámara — puedes subir un vídeo desde tu galería.
        </p>
        <input
          ref={fileRef}
          type="file"
          accept="video/*"
          onChange={onSubir}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--border)] px-4 py-3 text-sm text-[var(--muted)] transition-colors hover:border-[var(--accent)]"
        >
          <span aria-hidden>⬆️</span> Subir un vídeo
        </button>
      </div>
    );
  }

  if (estado === "grabando") {
    return (
      <div className="flex flex-col gap-3">
        <video
          ref={liveRef}
          muted
          playsInline
          className="w-full max-w-xs rounded-xl bg-black ring-2 ring-[var(--accent)]"
        />
        <button
          type="button"
          onClick={parar}
          className="flex w-fit items-center gap-2 rounded-full border-2 border-[var(--accent)] bg-[var(--accent)]/10 px-4 py-2 text-sm text-[var(--accent)]"
        >
          <span className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-[var(--accent)]" />
          Detener ({MAX_SECONDS - segundos}s)
        </button>
      </div>
    );
  }

  if (estado === "listo" && url) {
    return (
      <div className="flex flex-col gap-2">
        <video src={url} controls playsInline className="w-full max-w-xs rounded-xl bg-black" />
        {aviso && <p className="text-xs text-[var(--muted)]">{aviso}</p>}
        <button
          type="button"
          onClick={quitar}
          className="w-fit text-sm text-[var(--muted)] hover:underline"
        >
          Quitar
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={fileRef}
        type="file"
        accept="video/*"
        onChange={onSubir}
        className="hidden"
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={grabar}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--border)] px-4 py-3 text-sm text-[var(--muted)] transition-colors hover:border-[var(--accent)]"
        >
          <span aria-hidden>🎥</span> Grabar (máx. {MAX_SECONDS}s)
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--border)] px-4 py-3 text-sm text-[var(--muted)] transition-colors hover:border-[var(--accent)]"
        >
          <span aria-hidden>⬆️</span> Subir un vídeo
        </button>
      </div>
    </div>
  );
}
