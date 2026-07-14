"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { togglePublish, deleteLetter } from "@/lib/actions/letters";
import { Button } from "@/components/ui/Button";

type Props = {
  id: string;
  slug: string;
  title: string;
  authorName?: string | null;
  isPublished: boolean;
  updatedAt: string;
  baseUrl: string;
};

export function LetterCard({
  id,
  slug,
  title,
  authorName,
  isPublished,
  updatedAt,
  baseUrl,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);
  const shareUrl = `${baseUrl}/carta/${slug}`;

  function handlePublish() {
    startTransition(() => togglePublish(id, !isPublished));
  }

  function handleDelete() {
    if (!confirm(`¿Eliminar "${title}"? Esto no se puede deshacer.`)) return;
    startTransition(() => deleteLetter(id));
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      className="paper-texture flex flex-col rounded-2xl border border-[var(--border)] p-5 shadow-[0_12px_40px_-24px_rgba(58,46,38,0.5)]"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-xl leading-tight">{title}</h3>
        {isPublished ? (
          <span className="shrink-0 rounded-full bg-[var(--accent)]/10 px-2.5 py-0.5 text-xs font-semibold text-[var(--accent)]">
            en el álbum
          </span>
        ) : (
          <span className="shrink-0 rounded-full bg-black/5 px-2.5 py-0.5 text-xs font-semibold text-[var(--muted)]">
            borrador
          </span>
        )}
      </div>

      <p className="mt-1 text-xs text-[var(--muted)]">
        {authorName ? "✍ Carta de un familiar · " : ""}
        Editada {new Date(updatedAt).toLocaleDateString("es", { day: "numeric", month: "long" })}
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Link href={`/editor/${id}`}>
          <Button variant="primary" className="px-4 py-2 text-xs">
            Editar
          </Button>
        </Link>
        <Button
          variant="outline"
          className="px-4 py-2 text-xs"
          onClick={handlePublish}
          disabled={pending}
        >
          {isPublished ? "Despublicar" : "Publicar"}
        </Button>
        {isPublished && (
          <Button
            variant="ghost"
            className="px-3 py-2 text-xs"
            onClick={handleCopy}
          >
            {copied ? "¡Copiado!" : "Copiar link"}
          </Button>
        )}
        <button
          onClick={handleDelete}
          disabled={pending}
          className="ml-auto text-xs text-[var(--muted)] underline-offset-2 hover:text-[var(--accent)] hover:underline disabled:opacity-50"
        >
          Eliminar
        </button>
      </div>
    </motion.div>
  );
}
