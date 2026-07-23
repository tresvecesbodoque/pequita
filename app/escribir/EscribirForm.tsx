"use client";

/* eslint-disable @next/next/no-img-element */

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { submitGuestLetter, type GuestSubmitState } from "@/lib/actions/guest";
import { LETTER_THEMES, getTheme } from "@/lib/letterThemes";
import { buildGuestEsquela, buildGuestSobre } from "@/lib/guestCanvas";
import { GuestStudio } from "@/components/guest/GuestStudio";
import { parseCanvas, EMPTY_ESQUELA } from "@/lib/types/canvas";
import { backgroundLayerStyle } from "@/lib/backgrounds/render";
import { CanvasStage } from "@/components/canvas/CanvasStage";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SignaturePad } from "@/components/ui/SignaturePad";
import { VoiceRecorder } from "@/components/ui/VoiceRecorder";
import { VideoRecorder } from "@/components/ui/VideoRecorder";
import { uploadMedia } from "@/lib/uploadClient";

const FONTS = [
  { label: "Manuscrita", value: "var(--font-hand)" },
  { label: "De pluma", value: "var(--font-hand2)" },
  { label: "A mano", value: "var(--font-hand3)" },
  { label: "Letrero", value: "var(--font-display)" },
  { label: "Clásica", value: "var(--font-serif)" },
  { label: "Redonda", value: "var(--font-sans)" },
] as const;

const MAX_MESSAGE = 1000;
const MAX_FOTOS = 3;

type FotoLocal = { file: File; url: string; ratio: number };

export function EscribirForm({ recipientName }: { recipientName: string }) {
  const [state, formAction, pending] = useActionState<GuestSubmitState, FormData>(
    submitGuestLetter,
    null
  );
  const [theme, setTheme] = useState(LETTER_THEMES[0].id);
  const [font, setFont] = useState<string>(FONTS[0].value);
  const [authorName, setAuthorName] = useState("");
  const [message, setMessage] = useState("");
  const [fotos, setFotos] = useState<FotoLocal[]>([]);
  const [signature, setSignature] = useState<string | null>(null);
  const [audio, setAudio] = useState<Blob | null>(null);
  const [video, setVideo] = useState<Blob | null>(null);
  // Carta a cuatro manos: segundo firmante opcional.
  const [showSecond, setShowSecond] = useState(false);
  const [authorName2, setAuthorName2] = useState("");
  const [signature2, setSignature2] = useState<string | null>(null);
  // Lienzos personalizados en el estudio (misma interfaz que el taller).
  const [custom, setCustom] = useState<{ esq: string; sob: string } | null>(null);
  const [greeting, setGreeting] = useState<string | null>(null);
  // Subida de media a R2 (previa al envío del formulario).
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const DRAFT_KEY = "pequita-borrador";

  // Al montar: pre-rellenar nombre desde ?de= y restaurar borrador guardado.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const de = params.get("de");
    let restoredName = "";
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (typeof d.message === "string") setMessage(d.message);
        if (typeof d.authorName === "string") restoredName = d.authorName;
        if (typeof d.theme === "string") setTheme(d.theme);
        if (typeof d.font === "string") setFont(d.font);
        if (typeof d.authorName2 === "string" && d.authorName2) {
          setAuthorName2(d.authorName2);
          setShowSecond(true);
        }
      }
    } catch {
      // borrador corrupto: se ignora
    }
    if (de) {
      setAuthorName(de);
      setGreeting(de);
    } else if (restoredName) {
      setAuthorName(restoredName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Guarda el borrador (texto y opciones; no la foto/voz/firma, que son pesadas).
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({ message, authorName, theme, font, authorName2 })
        );
      } catch {
        // sin almacenamiento: el borrador simplemente no persiste
      }
    }, 500);
    return () => clearTimeout(t);
  }, [message, authorName, theme, font, authorName2]);

  // Las fotos/audio/vídeo se suben DIRECTO a R2 antes de despachar el formulario
  // (evita el límite de 4.5 MB de las funciones de Vercel). Al action solo le
  // pasamos las URLs resultantes.
  async function enviar(fd: FormData) {
    setUploadError(null);
    try {
      setUploading(true);

      // Fotos (hasta 3): subimos el original y guardamos su URL + proporción.
      const fotoMetas: { url: string; ratio: number }[] = [];
      for (const f of fotos) {
        const url = await uploadMedia(f.file, "foto");
        fotoMetas.push({ url, ratio: f.ratio });
      }
      fd.set("photosMeta", JSON.stringify(fotoMetas));

      if (audio) {
        const ext = (audio.type.split(";")[0].split("/")[1] || "webm").trim();
        const file = new File([audio], `voz.${ext}`, { type: audio.type });
        fd.set("audioUrl", await uploadMedia(file, "voz"));
      }

      if (video) {
        const file =
          video instanceof File
            ? video
            : (() => {
                const base = (video.type.split(";")[0] || "video/webm").toLowerCase();
                const ext = base === "video/quicktime" ? "mov" : base.split("/")[1] || "webm";
                return new File([video], `saludo.${ext}`, { type: video.type });
              })();
        fd.set("videoUrl", await uploadMedia(file, "video"));
      }
    } catch {
      setUploading(false);
      setUploadError(
        "No se pudieron subir tus archivos. Revisa tu conexión e inténtalo de nuevo."
      );
      return; // no despachamos si falló la subida
    }
    setUploading(false);

    if (signature) fd.set("signature", signature);
    if (showSecond && authorName2.trim()) fd.set("authorName2", authorName2.trim());
    if (showSecond && signature2) fd.set("signature2", signature2);
    if (custom) {
      fd.set("esquelaCanvas", custom.esq);
      fd.set("sobreCanvas", custom.sob);
    }
    // El envío redirige a /gracias; limpiamos el borrador para no reabrirlo.
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* noop */
    }
    formAction(fd);
  }

  function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    for (const f of files) {
      const url = URL.createObjectURL(f);
      // La proporción real de cada foto para que la vista previa sea fiel.
      const img = new Image();
      img.onload = () => {
        const ratio = img.naturalHeight / img.naturalWidth || 1;
        setFotos((prev) =>
          prev.length >= MAX_FOTOS ? prev : [...prev, { file: f, url, ratio }]
        );
      };
      img.src = url;
    }
    // permitir volver a elegir el mismo archivo
    if (fileRef.current) fileRef.current.value = "";
  }

  function removePhoto(i: number) {
    setFotos((prev) => {
      URL.revokeObjectURL(prev[i]?.url ?? "");
      return prev.filter((_, j) => j !== i);
    });
  }

  const themeData = getTheme(theme);

  // Vista previa EN VIVO: usa el MISMO constructor que el envío real, así lo
  // que el familiar ve mientras escribe es exactamente el producto final.
  const esquelaPreview = useMemo(
    () =>
      buildGuestEsquela({
        message: message || `Escríbele aquí a ${recipientName}…`,
        authorName: authorName || "tu nombre",
        fontFamily: font,
        ink: themeData.ink,
        photos: fotos.map((f) => ({ url: f.url, ratio: f.ratio })),
        signatureUrl: signature,
        authorName2: showSecond ? authorName2 || null : null,
        signatureUrl2: showSecond ? signature2 : null,
      }),
    [message, authorName, font, themeData.ink, fotos, signature, showSecond, authorName2, signature2, recipientName]
  );

  // Si cambia el contenido base, la personalización quedaría desfasada:
  // se descarta (el estudio parte siempre de lo que dice el formulario).
  useEffect(() => {
    setCustom(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message, authorName, font, theme, fotos, signature, showSecond, authorName2, signature2]);

  function abrirEstudio() {
    setCustom({
      esq: JSON.stringify(esquelaPreview),
      sob: JSON.stringify(buildGuestSobre({ ink: themeData.sobreInk })),
    });
  }

  const chipActivo =
    "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)] shadow-[2px_3px_0_rgba(124,27,34,0.25)]";
  const chipInactivo =
    "border-[var(--border)] text-[var(--foreground)] hover:border-[var(--accent-soft)]";

  return (
    <div className="flex flex-col gap-8">
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
      <motion.form
        action={enviar}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="sketch-card sketch-card--v2 flex flex-col gap-6 p-6 sm:p-8"
      >
        {/* Honeypot anti-bots (oculto para personas) */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="pointer-events-none absolute left-[-9999px] h-0 w-0 opacity-0"
        />

        {greeting && (
          <p
            className="text-2xl text-[var(--accent)]"
            style={{ fontFamily: "var(--font-hand)" }}
          >
            ¡Hola, {greeting}! 💛 Escríbele a {recipientName}.
          </p>
        )}

        <Input
          name="authorName"
          label="Tu nombre"
          placeholder="Ej. Tía Marta"
          maxLength={40}
          autoComplete="name"
          required
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
        />

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-[var(--muted)]">
            Tu mensaje para {recipientName}
          </span>
          <textarea
            name="message"
            rows={7}
            maxLength={MAX_MESSAGE}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Escríbele con cariño…`}
            required
            className="resize-y rounded-xl border-2 border-[var(--border)] bg-[var(--surface)] px-4 py-3 leading-relaxed text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted)]/60 focus:border-[var(--accent)]"
          />
          <span className="self-end text-xs text-[var(--muted)]">
            {message.length}/{MAX_MESSAGE}
          </span>
        </label>

        {/* Selector de tema */}
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-medium text-[var(--muted)]">
            Elige un estilo
          </legend>
          <input type="hidden" name="theme" value={theme} />
          <div className="flex flex-wrap gap-2">
            {LETTER_THEMES.map((t) => {
              const active = theme === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTheme(t.id)}
                  aria-pressed={active}
                  className={`flex items-center gap-2 rounded-full border-2 px-3.5 py-2 text-sm transition-all ${
                    active ? chipActivo : chipInactivo
                  }`}
                >
                  <span
                    className="inline-block h-3.5 w-3.5 rounded-full ring-1 ring-black/10"
                    style={{ backgroundColor: t.sobreColor }}
                  />
                  <span aria-hidden>{t.emoji}</span>
                  {t.name}
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Selector de tipografía */}
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-medium text-[var(--muted)]">
            Tipo de letra
          </legend>
          <input type="hidden" name="font" value={font} />
          <div className="flex flex-wrap gap-2">
            {FONTS.map((f) => {
              const active = font === f.value;
              return (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFont(f.value)}
                  aria-pressed={active}
                  style={{ fontFamily: f.value }}
                  className={`rounded-full border-2 px-4 py-2 text-base transition-all ${
                    active ? chipActivo : chipInactivo
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Fotos opcionales (hasta 3: con 2–3 van en tira tipo collage) */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-[var(--muted)]">
            Fotos (opcional, hasta {MAX_FOTOS})
          </span>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            onChange={onPhoto}
            className="hidden"
          />
          {fotos.length > 0 && (
            <div className="flex flex-wrap items-start gap-3">
              {fotos.map((f, i) => (
                <div key={f.url} className="flex flex-col items-center gap-1">
                  <img
                    src={f.url}
                    alt={`Foto ${i + 1}`}
                    className="h-20 w-20 rounded-xl object-cover ring-2 ring-[var(--border)]"
                    style={{ transform: `rotate(${[-2, 1.5, 2.5][i % 3]}deg)` }}
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="text-xs text-[var(--muted)] hover:text-[var(--accent)] hover:underline"
                  >
                    Quitar
                  </button>
                </div>
              ))}
            </div>
          )}
          {fotos.length < MAX_FOTOS && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--border)] px-4 py-3 text-sm text-[var(--muted)] transition-colors hover:border-[var(--accent)]"
            >
              <span aria-hidden>📷</span>
              {fotos.length === 0
                ? "Añadir una foto"
                : `Añadir otra foto (${fotos.length}/${MAX_FOTOS})`}
            </button>
          )}
        </div>

        {/* Firma a mano alzada */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-[var(--muted)]">
            Tu firma (opcional)
          </span>
          <SignaturePad onChange={setSignature} />
        </div>

        {/* Carta a cuatro manos: segundo firmante opcional */}
        {!showSecond ? (
          <button
            type="button"
            onClick={() => setShowSecond(true)}
            className="self-start text-sm text-[var(--accent)] hover:underline"
          >
            + Firmar entre dos (carta a cuatro manos)
          </button>
        ) : (
          <div className="flex flex-col gap-3 rounded-2xl border-2 border-dashed border-[var(--border)] p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--muted)]">
                Segunda persona
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowSecond(false);
                  setAuthorName2("");
                  setSignature2(null);
                }}
                className="text-xs text-[var(--muted)] hover:underline"
              >
                Quitar
              </button>
            </div>
            <Input
              label="Su nombre"
              placeholder="Ej. Tío Andrés"
              maxLength={40}
              value={authorName2}
              onChange={(e) => setAuthorName2(e.target.value)}
            />
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-[var(--muted)]">
                Su firma (opcional)
              </span>
              <SignaturePad onChange={setSignature2} />
            </div>
          </div>
        )}

        {/* Audio-carta */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-[var(--muted)]">
            Tu voz (opcional)
          </span>
          <VoiceRecorder onChange={setAudio} />
        </div>

        {/* Vídeo-saludo breve: se compila en la "película" final */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-[var(--muted)]">
            Un vídeo-saludo (opcional, 15-20s)
          </span>
          <p className="-mt-1 text-xs text-[var(--muted)]">
            Grábale o súbele un saludo corto. Todos se unen en una película para {recipientName}.
          </p>
          <VideoRecorder onChange={setVideo} />
        </div>

        {(state?.error || uploadError) && (
          <p className="rounded-xl bg-[var(--accent)]/10 px-4 py-2.5 text-sm text-[var(--accent)]">
            {uploadError ?? state?.error}
          </p>
        )}

        <Button type="submit" disabled={pending || uploading} className="w-full py-3 text-base">
          {uploading ? "Subiendo…" : pending ? "Enviando…" : "Enviar mi carta ✉"}
        </Button>

        <p className="text-center text-xs text-[var(--muted)]">
          Tu carta se guardará y aparecerá en su álbum sorpresa una vez revisada.
        </p>
      </motion.form>

      {/* VISTA PREVIA EN VIVO: el producto final mientras escriben */}
      <motion.aside
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="lg:sticky lg:top-6"
        aria-label="Vista previa de tu carta"
      >
        <p
          className="mb-2 text-center text-2xl text-[var(--accent)]"
          style={{ fontFamily: "var(--font-sketch)" }}
        >
          Así se verá ✨
        </p>
        <div
          className="sketch-card sketch-card--gira overflow-hidden p-5"
          style={backgroundLayerStyle({
            backgroundType: "PRESET",
            backgroundPresetId: themeData.presetId,
            backgroundImageUrl: null,
            backgroundScale: null,
          })}
        >
          <div
            className="mx-auto max-w-[280px] overflow-hidden rounded-sm shadow-[0_18px_40px_-18px_rgba(38,13,21,0.55)] ring-1 ring-black/10"
            style={{ isolation: "isolate" }}
          >
            <CanvasStage
              data={custom ? parseCanvas(custom.esq, EMPTY_ESQUELA) : esquelaPreview}
              baseColor="#fffdf8"
            />
          </div>
          {/* mini sobre del tema elegido */}
          <div className="mx-auto mt-4 flex w-fit items-center gap-2 rounded-full bg-[var(--surface)]/85 px-3.5 py-1.5 text-xs text-[var(--muted)] shadow-sm backdrop-blur">
            <span
              className="inline-block h-3 w-3 rounded-full ring-1 ring-black/10"
              style={{ backgroundColor: themeData.sobreColor }}
            />
            llegará en un sobre {themeData.name.toLowerCase()}
          </div>
        </div>
      </motion.aside>
    </div>

    {/* Estudio de diseño: la misma interfaz del taller, para invitados */}
    <section className="sketch-card sketch-card--v3 p-5 sm:p-7">
      {!custom ? (
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-sm text-[var(--muted)]">
            ¿Quieres decorarla a tu manera? Abre el estudio: stickers, textos y
            capas, igual que en el taller.
          </p>
          <Button type="button" variant="outline" onClick={abrirEstudio}>
            🎨 Personalizar el diseño
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-2xl">Tu estudio 🎨</h2>
            <button
              type="button"
              onClick={() => setCustom(null)}
              className="text-xs text-[var(--muted)] hover:underline"
            >
              Descartar personalización
            </button>
          </div>
          <p className="-mt-2 text-xs text-[var(--muted)]">
            Ojo: si después cambias el mensaje, el nombre, el estilo o la firma,
            la personalización se reinicia desde el formulario.
          </p>
          <GuestStudio
            initialEsquela={custom.esq}
            initialSobre={custom.sob}
            sobreColor={themeData.sobreColor}
            onEsquelaChange={(j) => setCustom((p) => (p ? { ...p, esq: j } : p))}
            onSobreChange={(j) => setCustom((p) => (p ? { ...p, sob: j } : p))}
          />
        </div>
      )}
    </section>
    </div>
  );
}
