import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth/session";
import { SITE } from "@/lib/site";
import { LibroCliente } from "./LibroCliente";

export const dynamic = "force-dynamic";

// Libro imprimible del álbum: todas las cartas publicadas, una por hoja.
export default async function LibroPage() {
  await requireAuth();

  const letters = await prisma.letter.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      title: true,
      authorName: true,
      esquelaCanvas: true,
      esquelaBaseImageUrl: true,
      sobreColor: true,
      audioUrl: true,
      qrInteriorDataUrl: true,
      createdAt: true,
    },
  });

  return (
    <LibroCliente
      recipientName={SITE.recipientName}
      letters={letters.map((l) => ({ ...l, createdAt: l.createdAt.toISOString() }))}
    />
  );
}
