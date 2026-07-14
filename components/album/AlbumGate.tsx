"use client";

import { useActionState } from "react";
import { motion } from "framer-motion";
import { unlockAlbum, type AlbumGateState } from "@/lib/actions/album";
import { Button } from "@/components/ui/Button";

export function AlbumGate({ recipientName }: { recipientName: string }) {
  const [state, action, pending] = useActionState<AlbumGateState, FormData>(
    unlockAlbum,
    null
  );

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center px-4">
      <motion.form
        action={action}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="paper-texture w-full rounded-3xl border border-[var(--border)] p-8 text-center shadow-[0_24px_70px_-40px_rgba(58,46,38,0.55)]"
      >
        <div className="text-4xl" aria-hidden>
          🔒
        </div>
        <h1 className="mt-3 text-2xl">El álbum de {recipientName}</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Escribe la clave para abrirlo.
        </p>

        <input
          name="code"
          type="password"
          autoFocus
          required
          placeholder="Clave"
          className="mt-5 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-center text-[var(--foreground)] outline-none transition-colors focus:border-[var(--accent-soft)] focus:ring-2 focus:ring-[var(--accent-soft)]/30"
        />

        {state?.error && (
          <p className="mt-3 text-sm text-[var(--accent)]">{state.error}</p>
        )}

        <Button type="submit" disabled={pending} className="mt-5 w-full">
          {pending ? "Abriendo…" : "Entrar"}
        </Button>
      </motion.form>
    </main>
  );
}
