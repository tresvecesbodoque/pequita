"use client";

/* eslint-disable @next/next/no-img-element */

import { CanvasStage } from "@/components/canvas/CanvasStage";
import { parseCanvas, EMPTY_ESQUELA } from "@/lib/types/canvas";

type LetterLite = {
  id: string;
  title: string;
  authorName: string | null;
  esquelaCanvas: string;
  esquelaBaseImageUrl: string | null;
  sobreColor: string | null;
  audioUrl: string | null;
  qrInteriorDataUrl: string | null;
  createdAt: string;
};

export function LibroCliente({
  letters,
  recipientName,
}: {
  letters: LetterLite[];
  recipientName: string;
}) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      {/* Barra (no se imprime) */}
      <div className="no-print mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl">Libro del álbum</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {letters.length} carta{letters.length === 1 ? "" : "s"} publicada
            {letters.length === 1 ? "" : "s"}. Imprímelo o guárdalo como PDF (un
            recuerdo físico).
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="rounded-full border-2 border-[var(--accent-deep)] bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--night-ink)] shadow-[3px_4px_0_var(--accent-deep)]"
        >
          🖨 Imprimir / Guardar PDF
        </button>
      </div>

      {letters.length === 0 ? (
        <p className="no-print text-[var(--muted)]">
          Aún no hay cartas publicadas para el libro.
        </p>
      ) : (
        letters.map((l, i) => {
          const esquela = parseCanvas(l.esquelaCanvas, EMPTY_ESQUELA);
          return (
            <article
              key={l.id}
              className="libro-hoja mb-12 flex flex-col items-center"
            >
              <div className="mb-3 text-center">
                <p className="text-xs uppercase tracking-widest text-[var(--muted)]">
                  Carta {i + 1} de {letters.length} · para {recipientName}
                </p>
                <h2 className="text-2xl">
                  {l.authorName ? `De ${l.authorName}` : l.title}
                </h2>
                <p className="text-xs text-[var(--muted)]">
                  {new Date(l.createdAt).toLocaleDateString("es", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>

              <div
                className="w-full max-w-md overflow-hidden rounded-md ring-1 ring-[var(--border)]"
                style={{ isolation: "isolate" }}
              >
                <CanvasStage
                  data={esquela}
                  baseColor="#fffdf8"
                  baseImageUrl={l.esquelaBaseImageUrl}
                />
              </div>

              {l.audioUrl && l.qrInteriorDataUrl && (
                <div className="mt-3 flex items-center gap-3 text-xs text-[var(--muted)]">
                  <img src={l.qrInteriorDataUrl} alt="QR" className="h-16 w-16" />
                  <span>
                    🎙 Esta carta tiene un mensaje de voz.
                    <br />
                    Escanea el código para escucharlo.
                  </span>
                </div>
              )}
            </article>
          );
        })
      )}
    </div>
  );
}
