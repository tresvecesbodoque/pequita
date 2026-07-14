"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { STICKER_TYPES, categoryForType, type StickerTypeValue } from "@/lib/stickers";
import { uploadImage } from "@/lib/upload";
import { createSticker, deleteSticker } from "@/lib/actions/stickers";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type Sticker = {
  id: string;
  type: string;
  imageUrl: string;
  name: string | null;
  width: number | null;
  height: number | null;
};

export function StickerManager({ initial }: { initial: Sticker[] }) {
  const [stickers, setStickers] = useState<Sticker[]>(initial);
  const [type, setType] = useState<StickerTypeValue>("DECORATIVO");
  const [name, setName] = useState("");
  const [filter, setFilter] = useState<StickerTypeValue | "ALL">("ALL");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const { url, width, height } = await uploadImage(file, categoryForType(type));
      const sticker = await createSticker({ type, imageUrl: url, name, width, height });
      setStickers((prev) => [sticker as Sticker, ...prev]);
      setName("");
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir.");
    } finally {
      setBusy(false);
    }
  }

  function handleDelete(id: string) {
    setStickers((prev) => prev.filter((s) => s.id !== id));
    startTransition(() => deleteSticker(id));
  }

  const visible = filter === "ALL" ? stickers : stickers.filter((s) => s.type === filter);

  return (
    <div>
      {/* Subida */}
      <div className="paper-texture rounded-2xl border border-[var(--border)] p-5">
        <h2 className="text-xl">Añadir a la librería</h2>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-[var(--muted)]">Tipo</span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as StickerTypeValue)}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 outline-none focus:border-[var(--accent-soft)]"
            >
              {STICKER_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <Input
            label="Nombre (opcional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Rosa dorada…"
            className="min-w-48"
          />
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            disabled={busy}
            className="hidden"
            id="sticker-file"
          />
          <Button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
          >
            {busy ? "Subiendo…" : "Subir imagen"}
          </Button>
        </div>
        <p className="mt-2 text-xs text-[var(--muted)]">
          {STICKER_TYPES.find((t) => t.value === type)?.hint}
        </p>
        {error && <p className="mt-2 text-sm text-[var(--accent)]">{error}</p>}
      </div>

      {/* Filtros */}
      <div className="mt-8 flex flex-wrap gap-2">
        <FilterChip active={filter === "ALL"} onClick={() => setFilter("ALL")}>
          Todo
        </FilterChip>
        {STICKER_TYPES.map((t) => (
          <FilterChip
            key={t.value}
            active={filter === t.value}
            onClick={() => setFilter(t.value)}
          >
            {t.label}
          </FilterChip>
        ))}
      </div>

      {/* Grid */}
      {visible.length === 0 ? (
        <p className="mt-10 text-center text-[var(--muted)]">
          No hay stickers en esta categoría todavía.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          <AnimatePresence>
            {visible.map((s) => (
              <motion.div
                key={s.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative aspect-square overflow-hidden rounded-xl border border-[var(--border)] bg-[repeating-conic-gradient(#efe7d8_0_25%,#f6f1e7_0_50%)] bg-[length:16px_16px]"
              >
                <Image
                  src={s.imageUrl}
                  alt={s.name ?? "sticker"}
                  fill
                  sizes="200px"
                  className="object-contain p-2"
                />
                <button
                  onClick={() => handleDelete(s.id)}
                  className="absolute right-1.5 top-1.5 hidden rounded-full bg-black/60 px-2 py-0.5 text-xs text-white group-hover:block"
                >
                  ✕
                </button>
                {s.name && (
                  <span className="absolute inset-x-0 bottom-0 truncate bg-black/40 px-2 py-1 text-center text-xs text-white">
                    {s.name}
                  </span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
        active
          ? "bg-[var(--accent)] text-white"
          : "border border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent-soft)]"
      }`}
    >
      {children}
    </button>
  );
}
