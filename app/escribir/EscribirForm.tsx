"use client";

/* eslint-disable @next/next/no-img-element */

import { useActionState, useRef, useState } from "react";
import { motion } from "framer-motion";
import { submitGuestLetter, type GuestSubmitState } from "@/lib/actions/guest";
import { LETTER_THEMES } from "@/lib/letterThemes";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const FONTS = [
  { label: "Manuscrita", value: "var(--font-hand)" },
  { label: "Clásica", value: "var(--font-serif)" },
  { label: "Redonda", value: "var(--font-sans)" },
] as const;

const MAX_MESSAGE = 1000;

export function EscribirForm({ recipientName }: { recipientName: string }) {
  const [state, formAction, pending] = useActionState<GuestSubmitState, FormData>(
    submitGuestLetter,
    null
  );
  const [theme, setTheme] = useState(LETTER_THEMES[0].id);
  const [font, setFont] = useState<string>(FONTS[0].value);
  const [count, setCount] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  function removePhoto() {
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <motion.form
      action={formAction}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="paper-texture flex flex-col gap-6 rounded-3xl border border-[var(--border)] p-6 shadow-[0_24px_70px_-40px_rgba(58,46,38,0.55)] sm:p-8"
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

      <Input
        name="authorName"
        label="Tu nombre"
        placeholder="Ej. Tía Marta"
        maxLength={40}
        autoComplete="name"
        required
      />

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-[var(--muted)]">
          Tu mensaje para {recipientName}
        </span>
        <textarea
          name="message"
          rows={7}
          maxLength={MAX_MESSAGE}
          onChange={(e) => setCount(e.target.value.length)}
          placeholder={`Escríbele con cariño…`}
          required
          className="resize-y rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 leading-relaxed text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted)]/60 focus:border-[var(--accent-soft)] focus:ring-2 focus:ring-[var(--accent-soft)]/30"
        />
        <span className="self-end text-xs text-[var(--muted)]">
          {count}/{MAX_MESSAGE}
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
                className={`flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm transition-colors ${
                  active
                    ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                    : "border-[var(--border)] text-[var(--foreground)] hover:border-[var(--accent-soft)]"
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
                className={`rounded-full border px-4 py-2 text-base transition-colors ${
                  active
                    ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                    : "border-[var(--border)] text-[var(--foreground)] hover:border-[var(--accent-soft)]"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Foto opcional */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-[var(--muted)]">
          Una foto (opcional)
        </span>
        <input
          ref={fileRef}
          type="file"
          name="photo"
          accept="image/*"
          onChange={onPhoto}
          className="hidden"
        />
        {preview ? (
          <div className="flex items-center gap-3">
            <img
              src={preview}
              alt="Vista previa"
              className="h-20 w-20 rounded-xl object-cover ring-1 ring-[var(--border)]"
            />
            <div className="flex flex-col gap-1 text-sm">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="text-left text-[var(--accent)] hover:underline"
              >
                Cambiar foto
              </button>
              <button
                type="button"
                onClick={removePhoto}
                className="text-left text-[var(--muted)] hover:underline"
              >
                Quitar
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--border)] px-4 py-3 text-sm text-[var(--muted)] transition-colors hover:border-[var(--accent-soft)]"
          >
            <span aria-hidden>📷</span> Añadir una foto
          </button>
        )}
      </div>

      {state?.error && (
        <p className="rounded-xl bg-[var(--accent)]/10 px-4 py-2.5 text-sm text-[var(--accent)]">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-full py-3 text-base">
        {pending ? "Enviando…" : "Enviar mi carta ✉"}
      </Button>

      <p className="text-center text-xs text-[var(--muted)]">
        Tu carta se guardará y aparecerá en su álbum sorpresa una vez revisada.
      </p>
    </motion.form>
  );
}
