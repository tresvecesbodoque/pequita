"use server";

import { nanoid } from "nanoid";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { processAndStoreImage, UploadError } from "@/lib/uploadServer";
import { getTheme } from "@/lib/letterThemes";
import { buildGuestEsquela, buildGuestSobre } from "@/lib/guestCanvas";

// Envío de carta desde la página PÚBLICA /escribir. Sin sesión: cualquier
// familiar con el enlace puede escribir. La carta queda como pendiente
// (isPublished=false) hasta que el dueño la apruebe en el panel.

const MAX_NAME = 40;
const MAX_MESSAGE = 1000;
const ALLOWED_FONTS = new Set([
  "var(--font-hand)",
  "var(--font-serif)",
  "var(--font-sans)",
]);

// Rate-limit best-effort por instancia (anti-spam suave; en serverless se
// reinicia por instancia, pero basta como freno para un sitio familiar).
const hits: number[] = [];
function tooManyRequests(): boolean {
  const now = Date.now();
  while (hits.length && now - hits[0] > 60_000) hits.shift();
  if (hits.length >= 20) return true;
  hits.push(now);
  return false;
}

export type GuestSubmitState = { error: string } | null;

export async function submitGuestLetter(
  _prev: GuestSubmitState,
  formData: FormData
): Promise<GuestSubmitState> {
  // Honeypot: campo oculto que solo rellenan los bots.
  if (String(formData.get("website") ?? "").trim() !== "") {
    return { error: "No se pudo enviar." };
  }
  if (tooManyRequests()) {
    return {
      error: "Hay muchos envíos ahora mismo. Espera un momento e inténtalo de nuevo.",
    };
  }

  const authorName = String(formData.get("authorName") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const themeId = String(formData.get("theme") ?? "");
  const fontInput = String(formData.get("font") ?? "");
  const fontFamily = ALLOWED_FONTS.has(fontInput) ? fontInput : "var(--font-hand)";
  const photo = formData.get("photo");

  if (authorName.length < 2) return { error: "Escribe tu nombre 🙂" };
  if (authorName.length > MAX_NAME) return { error: "El nombre es demasiado largo." };
  if (message.length < 4) return { error: "Escribe tu mensaje para ella." };
  if (message.length > MAX_MESSAGE) {
    return { error: `El mensaje es muy largo (máx. ${MAX_MESSAGE} caracteres).` };
  }

  // Foto opcional
  let photoUrl: string | null = null;
  let photoRatio = 1;
  if (photo instanceof File && photo.size > 0) {
    try {
      const stored = await processAndStoreImage(photo, "fotos", {
        maxBytes: 8 * 1024 * 1024,
        maxDim: 1400,
      });
      photoUrl = stored.url;
      if (stored.width && stored.height) photoRatio = stored.height / stored.width;
    } catch (e) {
      if (e instanceof UploadError) return { error: e.message };
      return { error: "No se pudo procesar la foto. Prueba con otra." };
    }
  }

  const theme = getTheme(themeId);
  const esquela = buildGuestEsquela({
    message,
    authorName,
    fontFamily,
    ink: theme.ink,
    photoUrl,
    photoRatio,
  });
  const sobre = buildGuestSobre({ ink: theme.sobreInk });

  await prisma.letter.create({
    data: {
      title: `De ${authorName}`,
      slug: nanoid(10),
      authorName,
      authorMessage: message,
      esquelaCanvas: JSON.stringify(esquela),
      sobreCanvas: JSON.stringify(sobre),
      sobreColor: theme.sobreColor,
      backgroundPresetId: theme.presetId,
      // backgroundType usa el default PRESET del esquema.
      isPublished: false,
    },
  });

  revalidatePath("/editor");
  redirect("/gracias");
}
