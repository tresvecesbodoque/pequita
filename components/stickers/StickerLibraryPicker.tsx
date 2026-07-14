"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Modal } from "@/components/ui/Modal";
import { listStickers } from "@/lib/actions/stickers";
import { STICKER_TYPES, type StickerTypeValue } from "@/lib/stickers";

export type PickedSticker = {
  imageUrl: string;
  width: number | null;
  height: number | null;
};

type Sticker = PickedSticker & { id: string; type: string; name: string | null };

export function StickerLibraryPicker({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (s: PickedSticker) => void;
}) {
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [filter, setFilter] = useState<StickerTypeValue | "ALL">("ALL");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    listStickers()
      .then((rows) =>
        setStickers(
          rows.map((s) => ({
            id: s.id,
            type: s.type,
            name: s.name,
            imageUrl: s.imageUrl,
            width: s.width,
            height: s.height,
          }))
        )
      )
      .finally(() => setLoading(false));
  }, [open]);

  const visible = filter === "ALL" ? stickers : stickers.filter((s) => s.type === filter);

  return (
    <Modal open={open} onClose={onClose} title="Elegir de la librería" wide>
      <div className="mb-4 flex flex-wrap gap-2">
        <Chip active={filter === "ALL"} onClick={() => setFilter("ALL")}>
          Todo
        </Chip>
        {STICKER_TYPES.map((t) => (
          <Chip key={t.value} active={filter === t.value} onClick={() => setFilter(t.value)}>
            {t.label}
          </Chip>
        ))}
      </div>

      {loading ? (
        <p className="py-10 text-center text-[var(--muted)]">Cargando…</p>
      ) : visible.length === 0 ? (
        <p className="py-10 text-center text-[var(--muted)]">
          No hay stickers aquí. Súbelos en la sección <strong>Stickers</strong>.
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {visible.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                onPick({ imageUrl: s.imageUrl, width: s.width, height: s.height });
                onClose();
              }}
              className="group relative aspect-square overflow-hidden rounded-xl border border-[var(--border)] bg-[repeating-conic-gradient(#efe7d8_0_25%,#f6f1e7_0_50%)] bg-[length:14px_14px] transition-transform hover:scale-[1.03]"
            >
              <Image
                src={s.imageUrl}
                alt={s.name ?? "sticker"}
                fill
                sizes="150px"
                className="object-contain p-2"
              />
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
}

function Chip({
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
      className={`rounded-full px-3 py-1 text-sm transition-colors ${
        active
          ? "bg-[var(--accent)] text-white"
          : "border border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent-soft)]"
      }`}
    >
      {children}
    </button>
  );
}
