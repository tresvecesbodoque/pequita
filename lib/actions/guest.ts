"use server";

import { nanoid } from "nanoid";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { processAndStoreImage, storeAudio, UploadError } from "@/lib/uploadServer";
import { getTheme } from "@/lib/letterThemes";
import { buildGuestEsquela, buildGuestSobre } from "@/lib/guestCanvas";

// Envío de carta desde la página PÚBLICA /escribir. Sin sesión: cualquier
// familiar con el enlace puede escribir. La carta queda como pendiente
// (isPublished=false) hasta que el dueño la apruebe en el panel.

const MAX_NAME = 40;
const MAX_MESSAGE = 1000;
const ALLOWED_FONTS = new Set([
  "var(--font-hand)",
  "var(--font-hand2)",
  "var(--font-hand3)",
  "var(--font-display)",
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

/** Stickers visibles para invitados: solo los decorativos (sin auth). */
export async function listGuestStickers() {
  return prisma.sticker.findMany({
    where: { type: "DECORATIVO" },
    orderBy: { createdAt: "desc" },
    select: { id: true, type: true, imageUrl: true, name: true, width: true, height: true },
  });
}

// Sanitiza un lienzo editado por un invitado: estructura y srcs en whitelist.
// Devuelve el JSON limpio o null si no es utilizable.
function sanitizeGuestCanvas(raw: string, w: number, h: number): string | null {
  if (!raw || raw.length > 300_000) return null;
  try {
    const data = JSON.parse(raw);
    if (!Array.isArray(data.elements) || data.elements.length > 60) return null;
    const okSrc = (s: unknown) =>
      typeof s === "string" &&
      (s.startsWith("/stickers-base/") ||
        s.startsWith("/stickers-principito/") ||
        s.startsWith("/uploads/") ||
        s.startsWith("https://") && s.includes(".blob.vercel-storage.com/") ||
        (s.startsWith("data:image/png;base64,") && s.length <= 150_000));
    const elements = data.elements
      .map((e: Record<string, unknown>) => {
        const base = {
          id: nanoid(8),
          x: Number(e.x) || 0,
          y: Number(e.y) || 0,
          width: Math.min(Math.abs(Number(e.width) || 10), 200),
          rotation: Number(e.rotation) || 0,
          zIndex: Number(e.zIndex) || 1,
        };
        if (e.kind === "text" && typeof e.text === "string") {
          return {
            ...base,
            kind: "text",
            text: e.text.slice(0, 2000),
            height: Math.min(Math.abs(Number(e.height) || 10), 200),
            fontSize: Math.min(Math.abs(Number(e.fontSize) || 3), 30),
            fontFamily: ALLOWED_FONTS.has(String(e.fontFamily))
              ? String(e.fontFamily)
              : "var(--font-hand)",
            color: /^#[0-9a-fA-F]{3,8}$/.test(String(e.color)) ? String(e.color) : "#4d2126",
            align: ["left", "center", "right", "justify"].includes(String(e.align))
              ? e.align
              : "left",
          };
        }
        if (e.kind === "image" && okSrc(e.src)) {
          return {
            ...base,
            kind: "image",
            src: e.src,
            ratio: Math.min(Math.max(Number(e.ratio) || 1, 0.05), 20),
          };
        }
        return null;
      })
      .filter(Boolean);
    if (elements.length === 0) return null;
    return JSON.stringify({ elements, canvasWidth: w, canvasHeight: h });
  } catch {
    return null;
  }
}

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
  // Hasta 3 fotos: photo (compat), photo2, photo3.
  const photoFiles = [formData.get("photo"), formData.get("photo2"), formData.get("photo3")]
    .filter((f): f is File => f instanceof File && f.size > 0)
    .slice(0, 3);
  const audio = formData.get("audio");

  // Firma(s) a mano alzada: PNG pequeño en data URL, dibujado en nuestro pad.
  const validSignature = (raw: string) =>
    raw.startsWith("data:image/png;base64,") && raw.length <= 150_000 ? raw : null;
  const signatureUrl = validSignature(String(formData.get("signature") ?? ""));
  const signatureUrl2 = validSignature(String(formData.get("signature2") ?? ""));
  // Segundo firmante (carta a cuatro manos)
  const authorName2 = String(formData.get("authorName2") ?? "").trim().slice(0, MAX_NAME) || null;

  if (authorName.length < 2) return { error: "Escribe tu nombre 🙂" };
  if (authorName.length > MAX_NAME) return { error: "El nombre es demasiado largo." };
  if (message.length < 4) return { error: "Escribe tu mensaje para ella." };
  if (message.length > MAX_MESSAGE) {
    return { error: `El mensaje es muy largo (máx. ${MAX_MESSAGE} caracteres).` };
  }

  // Fotos opcionales (máx. 3)
  const photos: { url: string; ratio: number }[] = [];
  for (const photo of photoFiles) {
    try {
      const stored = await processAndStoreImage(photo, "fotos", {
        maxBytes: 8 * 1024 * 1024,
        maxDim: 1400,
      });
      photos.push({
        url: stored.url,
        ratio: stored.width && stored.height ? stored.height / stored.width : 1,
      });
    } catch (e) {
      if (e instanceof UploadError) return { error: e.message };
      return { error: "No se pudo procesar una de las fotos. Prueba con otra." };
    }
  }

  // Audio-carta opcional
  let audioUrl: string | null = null;
  if (audio instanceof File && audio.size > 0) {
    try {
      audioUrl = await storeAudio(audio);
    } catch (e) {
      if (e instanceof UploadError) return { error: e.message };
      return { error: "No se pudo guardar el audio. Prueba de nuevo o envía sin voz." };
    }
  }

  const theme = getTheme(themeId);

  // Lienzos personalizados con el estudio de invitado (opcionales, saneados)
  const customEsquela = sanitizeGuestCanvas(
    String(formData.get("esquelaCanvas") ?? ""),
    1000,
    1400
  );
  const customSobre = sanitizeGuestCanvas(
    String(formData.get("sobreCanvas") ?? ""),
    1400,
    900
  );

  const esquela = buildGuestEsquela({
    message,
    authorName,
    fontFamily,
    ink: theme.ink,
    photos,
    signatureUrl,
    authorName2,
    signatureUrl2,
  });
  const sobre = buildGuestSobre({ ink: theme.sobreInk });

  const displayName = authorName2 ? `${authorName} y ${authorName2}` : authorName;
  const editToken = nanoid(24);
  await prisma.letter.create({
    data: {
      title: `De ${displayName}`,
      slug: nanoid(10),
      authorName: displayName,
      authorMessage: message,
      audioUrl,
      editToken,
      esquelaCanvas: customEsquela ?? JSON.stringify(esquela),
      sobreCanvas: customSobre ?? JSON.stringify(sobre),
      sobreColor: theme.sobreColor,
      backgroundPresetId: theme.presetId,
      // backgroundType usa el default PRESET del esquema.
      isPublished: false,
    },
  });

  revalidatePath("/editor");
  redirect(`/gracias?editar=${editToken}`);
}

// ————————————————————————————————————————————————————————————————
// Corrección de una carta ya enviada, mientras siga pendiente de moderación.
// El autor solo tiene su token secreto (no hay sesión). Solo puede cambiar el
// TEXTO del mensaje; el resto (foto, firma, voz, diseño) se conserva intacto:
// hacemos un swap del bloque de mensaje dentro del lienzo existente.
// ————————————————————————————————————————————————————————————————

export type EditableLetter = {
  message: string;
  authorName: string | null;
  published: boolean;
} | null;

/** Busca una carta por su token de edición (para precargar el formulario). */
export async function getEditableLetter(token: string): Promise<EditableLetter> {
  if (!token) return null;
  const letter = await prisma.letter.findUnique({
    where: { editToken: token },
    select: { authorMessage: true, authorName: true, isPublished: true },
  });
  if (!letter) return null;
  return {
    message: letter.authorMessage ?? "",
    authorName: letter.authorName,
    published: letter.isPublished,
  };
}

export type GuestEditState = { error?: string; ok?: boolean } | null;

export async function editGuestLetter(
  _prev: GuestEditState,
  formData: FormData
): Promise<GuestEditState> {
  const token = String(formData.get("token") ?? "");
  const message = String(formData.get("message") ?? "").trim();
  if (message.length < 4) return { error: "Escribe tu mensaje para ella." };
  if (message.length > MAX_MESSAGE) {
    return { error: `El mensaje es muy largo (máx. ${MAX_MESSAGE} caracteres).` };
  }

  const letter = await prisma.letter.findUnique({
    where: { editToken: token },
    select: { id: true, isPublished: true, esquelaCanvas: true, authorMessage: true },
  });
  if (!letter) return { error: "No encontramos esa carta." };
  if (letter.isPublished) {
    return { error: "Esta carta ya fue publicada y no se puede editar." };
  }

  // Reemplaza el bloque de mensaje dentro del lienzo, conservando la firma y
  // todo lo demás. El texto principal tiene la forma "mensaje\n\n— firmante".
  let esquelaCanvas = letter.esquelaCanvas;
  try {
    const canvas = JSON.parse(letter.esquelaCanvas);
    const marker = "\n\n— ";
    const el = canvas.elements?.find(
      (e: { kind?: string; text?: string }) =>
        e.kind === "text" && typeof e.text === "string" && e.text.includes(marker)
    );
    if (el) {
      const firma = el.text.slice(el.text.indexOf(marker));
      el.text = message + firma;
      esquelaCanvas = JSON.stringify(canvas);
    }
  } catch {
    // lienzo ilegible: al menos actualizamos authorMessage abajo
  }

  await prisma.letter.update({
    where: { id: letter.id },
    data: { authorMessage: message, esquelaCanvas },
  });
  revalidatePath("/editor");
  return { ok: true };
}
