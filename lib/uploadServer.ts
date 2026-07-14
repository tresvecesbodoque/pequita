import "server-only";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { put } from "@vercel/blob";
import sharp, { type Sharp, type Metadata } from "sharp";
import { nanoid } from "nanoid";

// Procesado y almacenamiento de imágenes, compartido por la subida del editor
// (autenticada) y la subida pública de invitados. En producción usa Vercel Blob
// (si hay BLOB_READ_WRITE_TOKEN); en desarrollo escribe en public/uploads.

export const UPLOAD_CATEGORIES = new Set([
  "esquelas",
  "decorativos",
  "fotos",
  "escaneos",
  "fondos",
  "sobres",
]);

export type StoredImage = {
  url: string;
  width: number | null;
  height: number | null;
};

export class UploadError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

type Options = {
  /** Tamaño máximo del archivo de entrada en bytes. */
  maxBytes?: number;
  /** Lado mayor máximo tras el resize. `null` = sin resize (fondos tileables). */
  maxDim?: number | null;
};

export async function processAndStoreImage(
  file: File,
  category: string,
  opts: Options = {}
): Promise<StoredImage> {
  const maxBytes = opts.maxBytes ?? 25 * 1024 * 1024;
  if (file.size > maxBytes) {
    const mb = Math.round(maxBytes / 1024 / 1024);
    throw new UploadError(`El archivo es demasiado grande (máx. ${mb} MB).`, 413);
  }

  const inputBuffer = Buffer.from(await file.arrayBuffer());

  let pipeline: Sharp;
  let meta: Metadata;
  try {
    pipeline = sharp(inputBuffer, { failOn: "none" });
    meta = await pipeline.metadata();
  } catch {
    throw new UploadError("El archivo no es una imagen válida.", 400);
  }

  // Los fondos tileables se conservan a tamaño original para no romper el patrón;
  // el resto se limita para no cargar imágenes gigantes.
  const maxDim =
    opts.maxDim === undefined ? (category === "fondos" ? null : 1600) : opts.maxDim;
  if (maxDim && ((meta.width ?? 0) > maxDim || (meta.height ?? 0) > maxDim)) {
    pipeline = pipeline.resize(maxDim, maxDim, { fit: "inside", withoutEnlargement: true });
  }

  // webp preserva transparencia y pesa poco.
  const outputBuffer = await pipeline.webp({ quality: 85 }).toBuffer();
  const finalMeta = await sharp(outputBuffer).metadata();
  const filename = `${nanoid(12)}.webp`;

  let url: string;
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`uploads/${category}/${filename}`, outputBuffer, {
      access: "public",
      contentType: "image/webp",
    });
    url = blob.url;
  } else {
    const dir = join(process.cwd(), "public", "uploads", category);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, filename), outputBuffer);
    url = `/uploads/${category}/${filename}`;
  }

  return {
    url,
    width: finalMeta.width ?? null,
    height: finalMeta.height ?? null,
  };
}
