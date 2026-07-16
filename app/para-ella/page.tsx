import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { AlbumEnvelope } from "@/components/album/AlbumEnvelope";
import { AlbumGate } from "@/components/album/AlbumGate";
import { Constelacion } from "@/components/album/Constelacion";
import { NavBar } from "@/components/layout/NavBar";
import { isAlbumUnlocked } from "@/lib/albumAccess";
import { SITE } from "@/lib/site";

// Siempre fresca: muestra las cartas aprobadas en el momento.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `El álbum de ${SITE.recipientName}`,
  description: "Cartas de quienes más te quieren.",
};

async function getAlbumLetters() {
  return prisma.letter.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      slug: true,
      title: true,
      authorName: true,
      sobreColor: true,
    },
  });
}

// Página SOLO de visualización: aquí no hay taller, ni edición, ni formularios.
// El CIELO se ve siempre; las CARTAS (sobres y constelación) piden la clave.
export default async function AlbumPage() {
  const unlocked = await isAlbumUnlocked();
  // Los sobres se VEN siempre (atenuados y con candado sin clave);
  // solo se pueden ABRIR con la clave.
  const letters = await getAlbumLetters();

  return (
    <main className="min-h-screen">
      <NavBar claro />
      {/* Cielo del Principito: portada del álbum */}
      <section className="starfield px-5 pb-24 pt-20 text-center sm:pt-24">
        <div className="relative z-10 mx-auto max-w-2xl">
          <p className="text-[0.7rem] uppercase tracking-[0.45em] text-[var(--night-ink)]/60">
            el álbum de
          </p>
          <h1
            className="mt-3 text-6xl text-[var(--gold)] sm:text-7xl"
            style={{ fontFamily: "var(--font-sketch)" }}
          >
            {SITE.recipientName}
          </h1>
          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-[var(--night-ink)]/75">
            «Lo esencial es invisible a los ojos.» Aquí viven las cartas de
            quienes más te quieren. Toca un sobre para abrirlo.
          </p>
        </div>

        {/* El pequeño planeta: horizonte curvo con su rosa y una estrella */}
        <div className="pointer-events-none relative z-10 mx-auto mt-12 max-w-md" aria-hidden>
          <svg viewBox="0 0 400 96" fill="none" className="w-full">
            {/* horizonte del planeta */}
            <path
              d="M8 92c48-38 118-60 192-60s144 22 192 60"
              stroke="var(--gold)"
              strokeOpacity="0.65"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            {/* la rosa, bajo su rectitud de flor */}
            <g stroke="var(--rose)" strokeWidth="1.5" strokeLinecap="round">
              <path d="M200 34v-12" />
              <path d="M200 26c-3-1-5-4-5-7 3 0 6 2 5 7z" fill="var(--rose)" fillOpacity="0.35" />
              <path d="M200 22c1-4 4-6 7-6 0 4-3 7-7 6z" fill="var(--rose)" fillOpacity="0.35" />
            </g>
            {/* estrellas cercanas */}
            <g fill="var(--night-ink)" fillOpacity="0.8">
              <path d="M96 30l1.6 3.8 3.8 1.6-3.8 1.6L96 41l-1.6-4-3.8-1.6 3.8-1.6z" />
              <circle cx="306" cy="26" r="1.6" />
              <circle cx="132" cy="14" r="1.2" />
            </g>
          </svg>
        </div>

        {/* Con clave: la constelación. Sin clave: el candado de las cartas. */}
        {unlocked ? (
          <Constelacion
            slugs={letters.map((l) => l.slug)}
            mensajeFinal={SITE.finalMessage}
          />
        ) : (
          <div id="candado">
            <AlbumGate recipientName={SITE.recipientName} />
          </div>
        )}
      </section>

      {/* Los sobres: siempre visibles; sin clave, atenuados y con candado */}
      <section className="maximal-tile px-5 pb-24 pt-16">
        <div className="mx-auto max-w-5xl">
        {letters.length === 0 ? (
          <div className="paper-texture rounded-3xl border border-dashed border-[var(--border)] p-16 text-center">
            <p className="text-lg text-[var(--muted)]">
              Todavía no hay cartas en el álbum.
            </p>
          </div>
        ) : (
          <>
            <div className="mx-auto mb-12 flex max-w-xs items-center gap-4">
              <div className="hairline flex-1" />
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
                <path
                  d="M12 3l2.2 5.4 5.8.5-4.4 3.8 1.3 5.7L12 15.9l-4.9 2.5 1.3-5.7L4 8.9l5.8-.5z"
                  fill="var(--gold)"
                  fillOpacity="0.8"
                />
              </svg>
              <div className="hairline flex-1" />
            </div>

            <div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 lg:grid-cols-4">
              {letters.map((l, i) => (
                <AlbumEnvelope
                  key={l.id}
                  slug={l.slug}
                  sobreColor={l.sobreColor ?? "#e7d8b5"}
                  label={l.authorName ? `De ${l.authorName}` : l.title}
                  tilt={[-1.6, 1.2, -0.8, 1.8][i % 4]}
                  locked={!unlocked}
                />
              ))}
            </div>
          </>
        )}
        </div>
      </section>
    </main>
  );
}
