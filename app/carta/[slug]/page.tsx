import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { EnvelopePresenter } from "@/components/envelope/EnvelopePresenter";
import { MarcarLeida } from "@/components/album/MarcarLeida";

// Siempre fresca: refleja al instante si una carta se publica o se despublica.
export const dynamic = "force-dynamic";

// Página PÚBLICA: sin auth. Solo muestra cartas publicadas.
async function getPublicLetter(slug: string) {
  return prisma.letter.findFirst({ where: { slug, isPublished: true } });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const letter = await getPublicLetter(slug);
  // El título de la pestaña; el sufijo "· Pequita" lo añade la plantilla del layout.
  return { title: letter ? letter.title : "Carta no disponible" };
}

export default async function CartaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const letter = await getPublicLetter(slug);
  if (!letter) notFound();

  return (
    <>
      {/* Registra la carta como leída (para la constelación del álbum) */}
      <MarcarLeida slug={letter.slug} />
      <EnvelopePresenter
      title={letter.title}
      esquelaCanvas={letter.esquelaCanvas}
      sobreCanvas={letter.sobreCanvas}
      sobreColor={letter.sobreColor}
      sobreBaseImageUrl={letter.sobreBaseImageUrl}
      esquelaBaseImageUrl={letter.esquelaBaseImageUrl}
      background={{
        backgroundType: letter.backgroundType,
        backgroundPresetId: letter.backgroundPresetId,
        backgroundImageUrl: letter.backgroundImageUrl,
        backgroundScale: letter.backgroundScale,
      }}
      qrInterior={letter.qrInteriorDataUrl}
      audioUrl={letter.audioUrl}
      />
    </>
  );
}
