/* eslint-disable jsx-a11y/media-has-caption */
import Link from "next/link";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function EditorVideosPage() {
  await requireAuth();

  const rows = await prisma.letter.findMany({
    where: { videoUrl: { not: null } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      authorName: true,
      videoUrl: true,
      isPublished: true,
    },
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-4xl">Vídeos-saludo</h1>
      <p className="mt-1 text-[var(--muted)]">
        Los clips que envió la familia. Los aprobados se encadenan en la{" "}
        <Link href="/pelicula?preview=1" target="_blank" className="text-[var(--accent)] hover:underline">
          película
        </Link>{" "}
        del álbum.
      </p>

      {rows.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-[var(--border)] p-16 text-center">
          <p className="text-lg text-[var(--muted)]">
            Aún no hay vídeos. Cuando un familiar grabe o suba un saludo en{" "}
            <span className="font-semibold text-[var(--accent)]">/escribir</span>, aparecerá aquí.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((r) => (
            <div
              key={r.id}
              className="flex flex-col gap-3 rounded-2xl border-2 border-[var(--foreground)]/50 bg-[var(--surface)] p-3 shadow-[3px_4px_0_rgba(124,27,34,0.2)]"
            >
              <video
                src={r.videoUrl!}
                controls
                playsInline
                preload="metadata"
                className="w-full rounded-lg bg-black"
              />
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-[var(--foreground)]">
                  {r.authorName ? `De ${r.authorName}` : r.title}
                </span>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    r.isPublished
                      ? "bg-[var(--gold)]/25 text-[#3a2a12]"
                      : "bg-[var(--accent)] text-white"
                  }`}
                >
                  {r.isPublished ? "en el álbum" : "por aprobar"}
                </span>
              </div>
              <Link
                href={`/carta/${r.slug}`}
                target="_blank"
                className="text-xs text-[var(--muted)] hover:text-[var(--accent)] hover:underline"
              >
                Ver la carta ↗
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
