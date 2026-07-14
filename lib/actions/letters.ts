"use server";

import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth/session";
import { getBaseUrl } from "@/lib/baseUrl";
import { generateQrDataUrl } from "@/lib/qr";
import { EMPTY_ESQUELA, EMPTY_SOBRE } from "@/lib/types/canvas";
import { SITE } from "@/lib/site";
import type { BackgroundType } from "@/lib/generated/prisma/enums";

export async function listLetters() {
  await requireAuth();
  return prisma.letter.findMany({
    orderBy: { updatedAt: "desc" },
    include: { esquelaSticker: true },
  });
}

export async function getLetter(id: string) {
  await requireAuth();
  return prisma.letter.findUnique({
    where: { id },
    include: { esquelaSticker: true },
  });
}

export async function createLetter(title?: string) {
  await requireAuth();
  const letter = await prisma.letter.create({
    data: {
      title: title?.trim() || "Carta sin título",
      slug: nanoid(10),
      esquelaCanvas: JSON.stringify(EMPTY_ESQUELA),
      sobreCanvas: JSON.stringify(EMPTY_SOBRE),
    },
  });
  revalidatePath("/editor");
  return letter;
}

type LetterMeta = {
  title?: string;
  sobreColor?: string | null;
  sobreBaseImageUrl?: string | null;
  esquelaBaseImageUrl?: string | null;
  esquelaStickerId?: string | null;
  backgroundType?: BackgroundType;
  backgroundPresetId?: string | null;
  backgroundImageUrl?: string | null;
  backgroundScale?: number | null;
};

export async function updateLetterMeta(id: string, data: LetterMeta) {
  await requireAuth();
  const letter = await prisma.letter.update({ where: { id }, data });
  revalidatePath("/editor");
  revalidatePath(`/editor/${id}`);
  return letter;
}

export async function updateCanvas(
  id: string,
  which: "esquela" | "sobre",
  canvasJson: string
) {
  await requireAuth();
  const data =
    which === "esquela"
      ? { esquelaCanvas: canvasJson }
      : { sobreCanvas: canvasJson };
  await prisma.letter.update({ where: { id }, data });
  revalidatePath(`/editor/${id}`);
}

export async function togglePublish(id: string, isPublished: boolean) {
  await requireAuth();
  await prisma.letter.update({ where: { id }, data: { isPublished } });
  revalidatePath("/editor");
  revalidatePath(`/editor/${id}`);
  revalidatePath(SITE.albumPath);
}

export async function deleteLetter(id: string) {
  await requireAuth();
  await prisma.letter.delete({ where: { id } });
  revalidatePath("/editor");
  revalidatePath(SITE.albumPath);
}

/**
 * Genera (o regenera) los QR de la carta apuntando a su URL pública.
 * El interior y el exterior usan anclas distintas por si se quiere diferenciar.
 */
export async function regenerateQr(id: string) {
  await requireAuth();
  const letter = await prisma.letter.findUnique({ where: { id }, select: { slug: true } });
  if (!letter) throw new Error("Carta no encontrada.");

  const base = await getBaseUrl();
  const cartaUrl = `${base}/carta/${letter.slug}`;
  const [qrInteriorDataUrl, qrExteriorDataUrl] = await Promise.all([
    generateQrDataUrl(`${cartaUrl}#interior`),
    generateQrDataUrl(cartaUrl),
  ]);

  await prisma.letter.update({
    where: { id },
    data: { qrInteriorDataUrl, qrExteriorDataUrl },
  });
  revalidatePath(`/editor/${id}`);
  return { qrInteriorDataUrl, qrExteriorDataUrl, cartaUrl };
}
