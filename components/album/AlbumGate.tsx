"use client";

import { useActionState } from "react";
import { motion } from "framer-motion";
import { unlockAlbum, type AlbumGateState } from "@/lib/actions/album";
import { Button } from "@/components/ui/Button";

// Puerta del álbum sorpresa: un cielo nocturno del Principito con una sola
// pregunta. Sin adornos de más — la clave abre las estrellas.
export function AlbumGate({ recipientName }: { recipientName: string }) {
  const [state, action, pending] = useActionState<AlbumGateState, FormData>(
    unlockAlbum,
    null
  );

  return (
    <main className="starfield flex min-h-screen flex-col items-center justify-center px-4">
      <motion.form
        action={action}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-sm text-center"
      >
        <svg viewBox="0 0 24 24" className="mx-auto h-9 w-9" aria-hidden>
          <path
            d="M12 3l2.2 5.4 5.8.5-4.4 3.8 1.3 5.7L12 15.9l-4.9 2.5 1.3-5.7L4 8.9l5.8-.5z"
            fill="var(--gold)"
          />
        </svg>

        <h1 className="mt-5 text-3xl text-[var(--night-ink)]">
          El álbum de {recipientName}
        </h1>
        <p className="mt-2 text-sm text-[var(--night-ink)]/65">
          Escribe la clave para abrir el cielo.
        </p>

        <input
          name="code"
          type="password"
          autoFocus
          required
          placeholder="Clave"
          className="mt-7 w-full rounded-full border border-[var(--night-ink)]/25 bg-white/10 px-5 py-3 text-center text-[var(--night-ink)] outline-none backdrop-blur transition-colors placeholder:text-[var(--night-ink)]/40 focus:border-[var(--gold)]/70 focus:ring-2 focus:ring-[var(--gold)]/25"
        />

        {state?.error && (
          <p className="mt-3 text-sm text-[var(--rose)]">{state.error}</p>
        )}

        <Button
          type="submit"
          disabled={pending}
          className="mt-5 w-full bg-[var(--gold)] text-[var(--night-deep)] hover:brightness-105"
        >
          {pending ? "Abriendo…" : "Entrar"}
        </Button>
      </motion.form>
    </main>
  );
}
