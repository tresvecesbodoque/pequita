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
      className="bloque-cristal flex flex-col p-5"
    >
      <div className="flex items-start justify-between gap-3">
        {/* El título de una carta no va en versalitas: es un nombre, no un rótulo. */}
        <h3 className="text-xl leading-tight [font-variant:normal] tracking-normal text-[var(--ink-calida)]">
          {title}
        </h3>
        {isPublished ? (
          <span className="shrink-0 rounded-full border border-[var(--borde)] bg-[var(--gold)]/15 px-3 py-0.5 text-xs tracking-[0.1em] text-[var(--gold)]">
            en el álbum
          </span>
        ) : (
          <span className="shrink-0 rounded-full border border-[var(--ink)]/20 px-3 py-0.5 text-xs tracking-[0.1em] text-[var(--ink-tenue)]">
            borrador
          </span>
        )}
      </div>

      <p className="mt-1 text-xs italic text-[var(--ink-tenue)]">
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
          className="ml-auto text-xs italic text-[var(--ink-tenue)] underline-offset-2 hover:text-[var(--gold)] hover:underline disabled:opacity-50"
        >
          Eliminar
        </button>
      </div>
    </motion.div>
  );
}
