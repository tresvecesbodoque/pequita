import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { AlbumEnvelope } from "@/components/album/AlbumEnvelope";
import { AlbumGate } from "@/components/album/AlbumGate";
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

export default async function AlbumPage() {
  // Puerta con clave (sorpresa): si no está desbloqueado, pide la clave.
  if (!(await isAlbumUnlocked())) {
    return <AlbumGate recipientName={SITE.recipientName} />;
  }

  const letters = await getAlbumLetters();

  return (
    <main className="mx-auto max-w-5xl px-5 py-12">
      <header className="text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">
          el álbum de
        </p>
        <h1
          className="mt-2 text-4xl text-[var(--accent)] sm:text-5xl"
          style={{ fontFamily: "var(--font-hand)" }}
        >
          {SITE.recipientName}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-[var(--muted)]">
          Cartas de quienes más te quieren. Toca cada sobre para abrirlo. 💛
        </p>
      </header>

      {letters.length === 0 ? (
        <div className="paper-texture mt-12 rounded-3xl border border-dashed border-[var(--border)] p-16 text-center">
          <p className="text-lg text-[var(--muted)]">
            Todavía no hay cartas en el álbum.
          </p>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {letters.map((l) => (
            <AlbumEnvelope
              key={l.id}
              slug={l.slug}
              sobreColor={l.sobreColor ?? "#d6c7a1"}
              label={l.authorName ? `De ${l.authorName}` : l.title}
            />
          ))}
        </div>
      )}
    </main>
  );
}
