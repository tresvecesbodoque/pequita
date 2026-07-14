"use server";

import { redirect } from "next/navigation";
import { getAlbumCode, setAlbumUnlocked } from "@/lib/albumAccess";
import { SITE } from "@/lib/site";

export type AlbumGateState = { error: string } | null;

export async function unlockAlbum(
  _prev: AlbumGateState,
  formData: FormData
): Promise<AlbumGateState> {
  const code = String(formData.get("code") ?? "").trim();
  const expected = getAlbumCode();

  if (!expected) redirect(SITE.albumPath); // álbum abierto

  if (code.toLowerCase() !== expected.toLowerCase()) {
    return { error: "Clave incorrecta. Prueba otra vez 🙂" };
  }

  await setAlbumUnlocked();
  redirect(SITE.albumPath);
}
