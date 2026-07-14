"use client";

import { CanvasStage } from "@/components/canvas/CanvasStage";
import type { CanvasData } from "@/lib/types/canvas";

// La esquela se muestra doblada por la mitad y se despliega como papel real.
// Construcción: la mitad inferior es estática; la mitad superior es una "solapa"
// con bisagra en la línea media (su borde inferior). Doblada (rotateX -180) queda
// tumbada sobre la mitad inferior mostrando su cara trasera (papel). Al desplegar
// (rotateX 0) muestra el contenido de la mitad superior y reconstruye la carta.
// El contenedor tiene fondo papel para tapar la región superior mientras está doblada.

type Props = {
  data: CanvasData;
  baseImageUrl?: string | null;
  /** clase que la secuencia de animación usa para rotar la solapa */
  flapClassName?: string;
};

const PAPER = "#fffdf8";

export function FoldedLetter({ data, baseImageUrl, flapClassName = "fold-flap" }: Props) {
  const aspect = data.canvasWidth / data.canvasHeight;

  return (
    <div
      className="relative w-full overflow-hidden rounded-md shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)] ring-1 ring-black/5"
      style={{ aspectRatio: `${aspect}`, backgroundColor: PAPER, perspective: 1400 }}
    >
      {/* Mitad inferior (estática): muestra la parte baja de la carta */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 overflow-hidden">
        <div className="absolute inset-x-0 bottom-0" style={{ height: "200%" }}>
          <CanvasStage data={data} baseColor={PAPER} baseImageUrl={baseImageUrl} />
        </div>
        {/* sombra suave del pliegue */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-black/10 to-transparent" />
      </div>

      {/* Solapa superior (se despliega) */}
      <div
        className={`${flapClassName} absolute inset-x-0 top-0 h-1/2`}
        style={{
          transformOrigin: "bottom center",
          transformStyle: "preserve-3d",
          transform: "rotateX(-180deg)",
          willChange: "transform",
        }}
      >
        {/* Cara frontal: contenido de la mitad superior */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
        >
          <div className="absolute inset-x-0 top-0" style={{ height: "200%" }}>
            <CanvasStage data={data} baseColor={PAPER} baseImageUrl={baseImageUrl} />
          </div>
          {/* sombra del pliegue en el borde inferior */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-black/10 to-transparent" />
        </div>

        {/* Cara trasera: papel (lo que se ve mientras está doblada) */}
        <div
          className="absolute inset-0"
          style={{
            transform: "rotateX(180deg)",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            background: `linear-gradient(160deg, ${PAPER}, #f1e8d6)`,
          }}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-black/12 to-transparent" />
        </div>
      </div>
    </div>
  );
}
