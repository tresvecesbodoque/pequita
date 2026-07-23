import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { AlbumEnvelopes, type SobreItem } from "@/components/album/AlbumEnvelopes";
import { AlbumGate } from "@/components/album/AlbumGate";
import { AvionMensajero } from "@/components/album/AvionMensajero";
import { Constelacion } from "@/components/album/Constelacion";
import { Countdown } from "@/components/album/Countdown";
import { NavBar } from "@/components/layout/NavBar";
import { isAlbumUnlocked } from "@/lib/albumAccess";
import { stampEmojiForPreset } from "@/lib/letterThemes";
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
      backgroundPresetId: true,
      createdAt: true,
    },
  });
}

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
function fechaCorta(d: Date): string {
  return `${d.getDate()} ${MESES[d.getMonth()]}`;
}

// Inclinación "traviesa" derivada del slug: un ciclo fijo de 4 valores en una
// grilla de 4 columnas alineaba cada columna con la misma inclinación.
function tiltForSlug(slug: string): number {
  let h = 0;
  for (const c of slug) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return ((h % 33) - 16) / 8; // -2.0º .. +2.0º
}

// Página SOLO de visualización: aquí no hay taller, ni edición, ni formularios.
// El CIELO se ve siempre; las CARTAS (sobres y constelación) piden la clave.
export default async function AlbumPage() {
  const unlocked = await isAlbumUnlocked();
  // Los sobres se VEN siempre (atenuados y con candado sin clave);
  // solo se pueden ABRIR con la clave.
  const letters = await getAlbumLetters();

  // Modo día D: antes de la fecha, el álbum duerme (aunque haya clave).
  const revealAt = SITE.revealDate ? new Date(SITE.revealDate) : null;
  const beforeReveal = revealAt !== null && Date.now() < revealAt.getTime();

  // Datos serializables para la rejilla de sobres (componente cliente).
  const items: SobreItem[] = letters.map((l) => ({
    id: l.id,
    slug: l.slug,
    sobreColor: l.sobreColor ?? "#e7d8b5",
    label: l.authorName ? `De ${l.authorName}` : l.title,
    tilt: tiltForSlug(l.slug),
    stampEmoji: stampEmojiForPreset(l.backgroundPresetId),
    dateLabel: fechaCorta(l.createdAt),
    featured: SITE.firstLetterSlug === l.slug,
  }));

  return (
    <main className="min-h-screen">
      <NavBar claro />
      {/* Cielo del Principito: portada del álbum */}
      <section className="starfield px-5 pb-24 pt-20 text-center sm:pt-24">
        {/* avioneta mensajera cruzando el cielo, con papelito de cuenta regresiva */}
        {beforeReveal && <AvionMensajero isoDate={SITE.revealDate} />}

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

        {/* Prioridad: día D (cuenta regresiva) > clave (candado) > constelación */}
        {beforeReveal ? (
          <Countdown isoDate={SITE.revealDate!} />
        ) : unlocked ? (
          <Constelacion
            slugs={letters.map((l) => l.slug)}
            mensajeFinal={SITE.finalMessage}
          />
        ) : (
          <div id="candado">
            <AlbumGate recipientName={SITE.recipientName} />
          </div>
        )}

        {!beforeReveal && unlocked && (
          <div className="relative z-10 mt-10">
            <Link
              href="/pelicula"
              className="inline-flex items-center gap-2 rounded-full border-2 border-[var(--gold)] px-6 py-3 text-[var(--gold)] transition-colors hover:bg-[var(--gold)]/10"
            >
              🎬 Ver la película de tu familia
            </Link>
          </div>
        )}
      </section>

      {/* Los sobres: siempre visibles; sin clave, atenuados y con candado */}
      <section className="maximal-tile px-5 pb-24 pt-16">
        <div className="mx-auto max-w-5xl">
        {letters.length === 0 ? (
          <div className="sketch-card sketch-card--gira p-16 text-center">
            <svg viewBox="0 0 24 24" className="mx-auto h-8 w-8" aria-hidden>
              <path
                d="M12 3l2.2 5.4 5.8.5-4.4 3.8 1.3 5.7L12 15.9l-4.9 2.5 1.3-5.7L4 8.9l5.8-.5z"
                fill="none"
                stroke="var(--gold)"
                strokeWidth="1.6"
              />
            </svg>
            <p className="mt-3 text-lg text-[var(--muted)]">
              Todavía no hay cartas en el álbum. Las primeras están en camino.
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

            <AlbumEnvelopes items={items} locked={!unlocked || beforeReveal} />
          </>
        )}
        </div>
      </section>
    </main>
  );
}
