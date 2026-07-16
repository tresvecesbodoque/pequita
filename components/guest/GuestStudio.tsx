"use client";

import { useState } from "react";
import { CanvasWorkspace } from "@/components/canvas/CanvasWorkspace";
import { parseCanvas, EMPTY_ESQUELA, EMPTY_SOBRE } from "@/lib/types/canvas";

// Estudio para invitados: la MISMA interfaz de edición del taller (lienzo con
// arrastre, librería de stickers, capas), pero sin cuenta — todo vive en el
// estado del formulario y se envía junto con la carta.

type Props = {
  /** instantáneas al abrir el estudio; el estado vive dentro del workspace */
  initialEsquela: string;
  initialSobre: string;
  sobreColor: string;
  onEsquelaChange: (json: string) => void;
  onSobreChange: (json: string) => void;
};

export function GuestStudio({
  initialEsquela,
  initialSobre,
  sobreColor,
  onEsquelaChange,
  onSobreChange,
}: Props) {
  const [tab, setTab] = useState<"esquela" | "sobre">("esquela");
  // Última versión de cada lienzo: al cambiar de pestaña, el workspace se
  // remonta desde aquí para no perder ediciones.
  const [esqJson, setEsqJson] = useState(initialEsquela);
  const [sobJson, setSobJson] = useState(initialSobre);
  const esquela = parseCanvas(esqJson, EMPTY_ESQUELA);
  const sobre = parseCanvas(sobJson, EMPTY_SOBRE);

  function guardaEsquela(j: string) {
    setEsqJson(j);
    onEsquelaChange(j);
  }
  function guardaSobre(j: string) {
    setSobJson(j);
    onSobreChange(j);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        {(["esquela", "sobre"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-full border-2 px-4 py-1.5 text-sm transition-all ${
              tab === t
                ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)] shadow-[2px_3px_0_rgba(124,27,34,0.25)]"
                : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent-soft)]"
            }`}
          >
            {t === "esquela" ? "✎ La carta" : "✉ El sobre"}
          </button>
        ))}
      </div>

      {tab === "esquela" ? (
        <CanvasWorkspace
          which="esquela"
          initialCanvas={esquela}
          baseColor="#fffdf8"
          persist={guardaEsquela}
          allowUpload={false}
          publicStickers
        />
      ) : (
        <CanvasWorkspace
          which="sobre"
          initialCanvas={sobre}
          baseColor={sobreColor}
          persist={guardaSobre}
          allowUpload={false}
          publicStickers
        />
      )}
    </div>
  );
}
