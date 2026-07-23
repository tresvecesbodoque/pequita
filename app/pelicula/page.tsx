import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { isAlbumUnlocked } from "@/lib/albumAccess";
import { AlbumGate } from "@/components/album/AlbumGate";
import { Countdown } from "@/components/album/Countdown";
import { MontajePlayer, type Clip } from "@/components/album/MontajePlayer";
import { NavBar } from "@/components/layout/NavBar";
import { SITE } from "@/lib/site";

// Siempre fresca: la película se arma con los vídeos aprobados en el momento.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `La película de ${SITE.recipientName}`,
  description: "Los saludos en vídeo de quienes más te quieren, uno tras otro.",
};

async function getClips(): Promise<Clip[]> {
  const rows = await prisma.letter.findMany({
    where: { isPublished: true, videoUrl: { not: null } },
    orderBy: { createdAt: "asc" },
    select: { slug: true, authorName: true, videoUrl: true },
  });
  return rows.map((r) => ({
    slug: r.slug,
    autor: r.authorName ? `De ${r.authorName}` : "Un ser querido",
    videoUrl: r.videoUrl!,
  }));
}

export default async function PeliculaPage() {
  const unlocked = await isAlbumUnlocked();
  const revealAt = SITE.revealDate ? new Date(SITE.revealDate) : null;
  const beforeReveal = revealAt !== null && Date.now() < revealAt.getTime();
  const clips = await getClips();

  return (
    <main className="min-h-screen">
      <NavBar claro />
      <section className="starfield px-5 pb-24 pt-20 text-center sm:pt-24">
        <p className="text-[0.7rem] uppercase tracking-[0.45em] text-[var(--night-ink)]/60">
          la película de
        </p>
        <h1
          className="mt-3 text-5xl text-[var(--gold)] sm:text-6xl"
          style={{ fontFamily: "var(--font-sketch)" }}
        >
          {SITE.recipientName}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-[var(--night-ink)]/75">
          Los saludos en vídeo de quienes más te quieren, uno tras otro. 🎬
        </p>

        {beforeReveal ? (
          <Countdown isoDate={SITE.revealDate!} />
        ) : !unlocked ? (
          <div id="candado" className="mt-8">
            <AlbumGate recipientName={SITE.recipientName} />
          </div>
        ) : (
          <div className="mt-10">
            <MontajePlayer clips={clips} />
          </div>
        )}
      </section>
    </main>
  );
}
