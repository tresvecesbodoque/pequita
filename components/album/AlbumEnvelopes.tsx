"use client";

import { useEffect, useState } from "react";
import { AlbumEnvelope } from "./AlbumEnvelope";
import { leerLeidas } from "./MarcarLeida";

// Rejilla de sobres del álbum. Es cliente para poder leer las cartas ya vistas
// en ESTE dispositivo (localStorage) y marcarlas como "leídas", y que Isi
// distinga de un vistazo cuáles le faltan por abrir.

export type SobreItem = {
  id: string;
  slug: string;
  sobreColor: string;
  label: string;
  tilt: number;
  stampEmoji: string;
  dateLabel: string;
  featured: boolean;
};

export function AlbumEnvelopes({ items, locked }: { items: SobreItem[]; locked: boolean }) {
  const [leidas, setLeidas] = useState<string[]>([]);

  useEffect(() => {
    setLeidas(leerLeidas());
  }, []);

  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((it) => (
        <AlbumEnvelope
          key={it.id}
          slug={it.slug}
          sobreColor={it.sobreColor}
          label={it.label}
          tilt={it.tilt}
          locked={locked}
          stampEmoji={it.stampEmoji}
          dateLabel={it.dateLabel}
          featured={it.featured}
          read={!locked && leidas.includes(it.slug)}
        />
      ))}
    </div>
  );
}
