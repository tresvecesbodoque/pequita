"use client";

import { useTransition } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { togglePublish, deleteLetter } from "@/lib/actions/letters";
import { Button } from "@/components/ui/Button";

type Props = {
  id: string;
  authorName: string;
  message: string;
  createdAt: string;
};

export function PendingCard({ id, authorName, message, createdAt }: Props) {
  const [pending, startTransition] = useTransition();

  function approve() {
    startTransition(() => togglePublish(id, true));
  }

  function reject() {
    if (
      !confirm(
        `¿Rechazar la carta de ${authorName}? Se eliminará y no se podrá recuperar.`
      )
    )
      return;
    startTransition(() => deleteLetter(id));
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col rounded-2xl border-2 border-[var(--accent-soft)]/50 bg-[var(--surface)] p-5 shadow-[0_12px_40px_-24px_rgba(58,46,38,0.5)]"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-xl leading-tight">De {authorName}</h3>
        <span className="shrink-0 rounded-full bg-[var(--accent)]/10 px-2.5 py-0.5 text-xs font-semibold text-[var(--accent)]">
          pendiente
        </span>
      </div>

      <p className="mt-1 text-xs text-[var(--muted)]">
        {new Date(createdAt).toLocaleDateString("es", {
          day: "numeric",
          month: "long",
        })}
      </p>

      <p className="mt-3 line-clamp-5 whitespace-pre-wrap text-sm leading-relaxed text-[var(--foreground)]/80">
        {message}
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Button
          variant="primary"
          className="px-4 py-2 text-xs"
          onClick={approve}
          disabled={pending}
        >
          {pending ? "…" : "Aprobar"}
        </Button>
        <Link href={`/editor/vista/${id}`}>
          <Button variant="outline" className="px-4 py-2 text-xs">
            Vista previa
          </Button>
        </Link>
        <Link href={`/editor/${id}`}>
          <Button variant="ghost" className="px-3 py-2 text-xs">
            Editar
          </Button>
        </Link>
        <button
          onClick={reject}
          disabled={pending}
          className="ml-auto text-xs text-[var(--muted)] underline-offset-2 hover:text-[var(--accent)] hover:underline disabled:opacity-50"
        >
          Rechazar
        </button>
      </div>
    </motion.div>
  );
}
