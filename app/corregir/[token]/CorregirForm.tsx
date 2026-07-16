"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { editGuestLetter, type GuestEditState } from "@/lib/actions/guest";
import { Button } from "@/components/ui/Button";

const MAX_MESSAGE = 1000;

export function CorregirForm({
  token,
  initialMessage,
  recipientName,
}: {
  token: string;
  initialMessage: string;
  recipientName: string;
}) {
  const [state, action, pending] = useActionState<GuestEditState, FormData>(
    editGuestLetter,
    null
  );
  const [message, setMessage] = useState(initialMessage);

  if (state?.ok) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="sketch-card sketch-card--gira max-w-lg p-8 text-center sm:p-10"
      >
        <div className="text-4xl">✅</div>
        <h1 className="mt-3 text-3xl">¡Corregida!</h1>
        <p className="mt-3 leading-relaxed text-[var(--muted)]">
          Guardamos tu nuevo mensaje. Aparecerá así en el álbum de {recipientName}.
        </p>
        <Link href="/" className="mt-6 inline-block text-sm text-[var(--accent)] hover:underline">
          Volver al inicio
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.form
      action={action}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="sketch-card flex max-w-lg flex-col gap-5 p-7 sm:p-9"
    >
      <input type="hidden" name="token" value={token} />
      <div className="text-center">
        <p
          className="text-4xl text-[var(--accent)]"
          style={{ fontFamily: "var(--font-sketch)" }}
        >
          Corregir tu carta
        </p>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Puedes ajustar tu mensaje mientras no lo hayamos revisado. Lo demás
          (firma, foto, voz y diseño) se conserva igual.
        </p>
      </div>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-[var(--muted)]">
          Tu mensaje para {recipientName}
        </span>
        <textarea
          name="message"
          rows={8}
          maxLength={MAX_MESSAGE}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          className="resize-y rounded-xl border-2 border-[var(--border)] bg-[var(--surface)] px-4 py-3 leading-relaxed text-[var(--foreground)] outline-none transition-colors focus:border-[var(--accent)]"
        />
        <span className="self-end text-xs text-[var(--muted)]">
          {message.length}/{MAX_MESSAGE}
        </span>
      </label>

      {state?.error && (
        <p className="rounded-xl bg-[var(--accent)]/10 px-4 py-2.5 text-sm text-[var(--accent)]">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-full py-3">
        {pending ? "Guardando…" : "Guardar cambios"}
      </Button>
    </motion.form>
  );
}
