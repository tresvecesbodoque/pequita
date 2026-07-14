"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth/session";
import type { StickerType } from "@/lib/generated/prisma/enums";

export async function listStickers(type?: StickerType) {
  await requireAuth();
  return prisma.sticker.findMany({
    where: type ? { type } : undefined,
    orderBy: { createdAt: "desc" },
  });
}

export async function createSticker(input: {
  type: StickerType;
  imageUrl: string;
  name?: string;
  width?: number | null;
  height?: number | null;
}) {
  await requireAuth();
  const sticker = await prisma.sticker.create({
    data: {
      type: input.type,
      imageUrl: input.imageUrl,
      name: input.name?.trim() || null,
      width: input.width ?? null,
      height: input.height ?? null,
    },
  });
  revalidatePath("/editor/stickers");
  return sticker;
}

export async function deleteSticker(id: string) {
  await requireAuth();
  // Solo se borra la entrada de la librería; el archivo se conserva por si alguna
  // carta ya lo usa dentro de su lienzo.
  await prisma.sticker.delete({ where: { id } });
  revalidatePath("/editor/stickers");
}
