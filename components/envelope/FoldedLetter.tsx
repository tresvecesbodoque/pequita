"use client";

import { CanvasStage } from "@/components/canvas/CanvasStage";
import type { CanvasData } from "@/lib/types/canvas";

// Paquete de papel doblado por la mitad, como una carta real.
//
// El contenedor mide MEDIA hoja (la mitad inferior). La mitad superior es una
// solapa que vive FUERA del contenedor (justo encima), con bisagra en la línea
// de pliegue (el borde superior del contenedor). Doblada (rotateX -180) cae
// sobre el contenedor y solo se ve su dorso de papel liso: un paquete cerrado,
// sin texto visible. Al desplegarse (rotateX 0) reconstruye la hoja completa y
// el mensaje queda impreso en el propio papel, porque cada mitad renderiza su
// porción del lienzo (no hay texto superpuesto a la animación).

type Props = {
  data: CanvasData;
  baseImageUrl?: string | null;
  /** clase que la secuencia de animación usa para rotar la solapa */
  flapClassName?: string;
};

const PAPER = "#fffdf8";
const PAPER_EDGE = "#f0e9da";

export function FoldedLetter({ data, baseImageUrl, flapClassName = "fold-flap" }: Props) {
  const aspect = data.canvasWidth / data.canvasHeight;
  // El contenedor es la mitad inferior de la hoja: doble de ancho relativo.
  const halfAspect = aspect * 2;

  return (
    <div
      className="relative w-full"
      style={{ aspectRatio: `${halfAspect}`, perspective: 1400 }}
    >
      {/* Mitad inferior (estática): la parte baja de la carta.
          isolation + zIndex: los elementos del lienzo traen z-index propios y,
          sin aislar, se pintarían por ENCIMA de la solapa doblada. */}
      <div
        className="absolute inset-0 overflow-hidden shadow-[0_26px_60px_-28px_rgba(16,27,54,0.55)]"
        style={{
          backgroundColor: PAPER,
          // borde inferior levemente irregular, como hoja cortada a mano
          borderRadius: "3px 2px 12px 9px",
          isolation: "isolate",
          zIndex: 1,
        }}
      >
        <div className="absolute inset-x-0 bottom-0" style={{ height: "200%" }}>
          <CanvasStage data={data} baseColor={PAPER} baseImageUrl={baseImageUrl} />
        </div>
        {/* sombra suave bajo la línea de pliegue */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-5 bg-gradient-to-b from-black/10 to-transparent" />
        {/* insinuación de canto de papel en los lados */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1.5 bg-gradient-to-r from-black/[0.06] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1.5 bg-gradient-to-l from-black/[0.06] to-transparent" />
      </div>

      {/* Solapa superior: bisagra en la línea de pliegue. Empieza doblada. */}
      <div
        className={`${flapClassName} absolute inset-x-0`}
        style={{
          top: "-100%",
          height: "100%",
          zIndex: 2,
          transformOrigin: "bottom center",
          transformStyle: "preserve-3d",
          transform: "rotateX(-180deg)",
          willChange: "transform",
        }}
      >
        {/* Cara frontal (visible al desplegar): la parte alta de la carta */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            backgroundColor: PAPER,
            borderRadius: "9px 12px 2px 3px",
            boxShadow: "0 -14px 40px -24px rgba(16,27,54,0.35)",
            isolation: "isolate",
          }}
        >
          <div className="absolute inset-x-0 top-0" style={{ height: "200%" }}>
            <CanvasStage data={data} baseColor={PAPER} baseImageUrl={baseImageUrl} />
          </div>
          {/* sombra sobre la línea de pliegue */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-5 bg-gradient-to-t from-black/10 to-transparent" />
          {/* insinuación de canto de papel en los lados */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-1.5 bg-gradient-to-r from-black/[0.06] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1.5 bg-gradient-to-l from-black/[0.06] to-transparent" />
        </div>

        {/* Dorso (visible mientras está doblada): papel liso, sin texto */}
        <div
          className="absolute inset-0"
          style={{
            transform: "rotateX(180deg)",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            background: `linear-gradient(165deg, ${PAPER} 0%, ${PAPER_EDGE} 100%)`,
            borderRadius: "0 0 6px 6px",
          }}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-black/10 to-transparent" />
        </div>
      </div>
    </div>
  );
}
