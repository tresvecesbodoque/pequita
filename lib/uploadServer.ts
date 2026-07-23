import "server-only";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import sharp from "sharp";
import { nanoid } from "nanoid";

// Procesado y almacenamiento de imágenes/medios, compartido por la subida del
// editor (autenticada) y la subida pública de invitados.
//
// ALMACENAMIENTO:
//   - PRODUCCIÓN: Cloudflare R2 (si están las variables R2_*). Compatible con
//     la API de S3, 10 GB gratis y sin cargo por descarga (ideal para vídeo).
//   - DESARROLLO: escribe en public/uploads (disco local).
//
// CALIDAD: se guarda el archivo ORIGINAL sin recomprimir ni redimensionar, para
// que las fotos se vean a máxima calidad. Única excepción: formatos que el
// navegador no sabe mostrar (HEIC/HEIF, TIFF…) se convierten a JPEG calidad 100
// (visualmente sin pérdida) para que sí se puedan ver en el álbum.

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
  /**
   * Se conserva por compatibilidad con las llamadas existentes, pero ya NO se
   * redimensiona: guardamos el original a máxima calidad.
   */
  maxDim?: number | null;
};

// Formatos que el navegador muestra directamente → se guardan tal cual.
const WEB_SAFE_IMAGE = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/svg+xml",
]);

// Tipos de audio que aceptamos de MediaRecorder según el navegador.
const AUDIO_TYPES = new Set([
  "audio/webm",
  "audio/mp4",
  "audio/mpeg",
  "audio/ogg",
  "audio/wav",
]);

// Tipos de vídeo: MediaRecorder (webm/mp4) y subidas de móvil (mp4/mov).
const VIDEO_TYPES = new Set([
  "video/webm",
  "video/mp4",
  "video/quicktime",
  "video/ogg",
]);

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "image/svg+xml": "svg",
};

// ── Almacenamiento (R2 en prod, disco en dev) ──────────────────────────────

function r2Config() {
  const {
    R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY,
    R2_BUCKET,
    R2_PUBLIC_URL,
  } = process.env;
  if (
    R2_ACCOUNT_ID &&
    R2_ACCESS_KEY_ID &&
    R2_SECRET_ACCESS_KEY &&
    R2_BUCKET &&
    R2_PUBLIC_URL
  ) {
    return {
      accountId: R2_ACCOUNT_ID,
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
      bucket: R2_BUCKET,
      publicUrl: R2_PUBLIC_URL.replace(/\/+$/, ""),
    };
  }
  return null;
}

let cachedS3: S3Client | null = null;
function s3Client(cfg: NonNullable<ReturnType<typeof r2Config>>): S3Client {
  if (!cachedS3) {
    cachedS3 = new S3Client({
      region: "auto",
      endpoint: `https://${cfg.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: cfg.accessKeyId,
        secretAccessKey: cfg.secretAccessKey,
      },
    });
  }
  return cachedS3;
}

/**
 * Guarda un buffer y devuelve su URL pública. `key` es la ruta relativa dentro
 * del almacén, p. ej. "uploads/fotos/abc.jpg".
 */
async function putToStorage(
  key: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  const cfg = r2Config();
  if (cfg) {
    await s3Client(cfg).send(
      new PutObjectCommand({
        Bucket: cfg.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      })
    );
    return `${cfg.publicUrl}/${key}`;
  }
  // Local (dev): disco en public/…
  const dir = join(process.cwd(), "public", ...key.split("/").slice(0, -1));
  await mkdir(dir, { recursive: true });
  await writeFile(join(process.cwd(), "public", key), body);
  return `/${key}`;
}

// ── Subida directa del navegador a R2 (presigned) ──────────────────────────
// Evita el límite de 4.5 MB de las funciones de Vercel: fotos a máxima calidad y
// vídeos suben directo del cliente a R2. En dev (sin R2) devuelve uploadUrl=null
// y el cliente cae a /api/media (disco, sin límite en localhost).

// `kind` puede ser voz/video, "foto", o cualquier categoría de imagen del editor
// (esquelas, decorativos, fotos, escaneos, fondos, sobres).
function targetConf(kind: string): { prefix: string; types: Set<string> } | null {
  if (kind === "voz") return { prefix: "voces", types: AUDIO_TYPES };
  if (kind === "video") return { prefix: "videos", types: VIDEO_TYPES };
  if (kind === "foto") return { prefix: "fotos", types: WEB_SAFE_IMAGE };
  if (UPLOAD_CATEGORIES.has(kind)) return { prefix: kind, types: WEB_SAFE_IMAGE };
  return null;
}

function extPara(baseType: string): string {
  if (baseType.startsWith("image/")) return EXT_BY_TYPE[baseType] ?? "img";
  if (baseType === "video/quicktime") return "mov";
  return baseType.split("/")[1] || "bin";
}

export type UploadTarget = { uploadUrl: string | null; publicUrl: string; key: string };

export async function createUploadTarget(kind: string, contentType: string): Promise<UploadTarget> {
  const conf = targetConf(kind);
  if (!conf) throw new UploadError("Tipo de subida inválido.", 400);
  const baseType = (contentType || "").split(";")[0].trim().toLowerCase();
  if (!conf.types.has(baseType)) throw new UploadError("Formato no soportado.", 400);
  const key = `uploads/${conf.prefix}/${nanoid(12)}.${extPara(baseType)}`;

  const cfg = r2Config();
  if (!cfg) {
    // Dev sin R2: el cliente subirá por /api/media (disco).
    return { uploadUrl: null, publicUrl: `/${key}`, key };
  }
  const cmd = new PutObjectCommand({ Bucket: cfg.bucket, Key: key, ContentType: baseType });
  const uploadUrl = await getSignedUrl(s3Client(cfg), cmd, { expiresIn: 600 });
  return { uploadUrl, publicUrl: `${cfg.publicUrl}/${key}`, key };
}

/** Valida que una URL de media venga de nuestro almacén (R2 público o /uploads
 *  local); evita que el cliente inyecte URLs externas arbitrarias. */
export function isOwnMediaUrl(u: string): boolean {
  if (!u) return false;
  const pub = process.env.R2_PUBLIC_URL?.replace(/\/+$/, "");
  if (pub && u.startsWith(pub + "/uploads/")) return true;
  return u.startsWith("/uploads/");
}

// ── Audio ──────────────────────────────────────────────────────────────────

/** Guarda un mensaje de voz tal cual (sin transcodificar). */
export async function storeAudio(file: File, maxBytes = 3 * 1024 * 1024): Promise<string> {
  if (file.size > maxBytes) {
    throw new UploadError("El audio es demasiado largo (máx. 3 MB).", 413);
  }
  const baseType = (file.type || "").split(";")[0].trim().toLowerCase();
  if (!AUDIO_TYPES.has(baseType)) {
    throw new UploadError("Formato de audio no soportado.", 400);
  }
  const ext = baseType.split("/")[1];
  const filename = `${nanoid(12)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  return putToStorage(`uploads/voces/${filename}`, buffer, baseType);
}

/** Guarda un vídeo-saludo tal cual (sin transcodificar). Tope generoso: un clip
 *  de 15-20s a buena calidad cabe de sobra en 80 MB. */
export async function storeVideo(file: File, maxBytes = 80 * 1024 * 1024): Promise<string> {
  if (file.size > maxBytes) {
    const mb = Math.round(maxBytes / 1024 / 1024);
    throw new UploadError(`El vídeo es demasiado grande (máx. ${mb} MB).`, 413);
  }
  const baseType = (file.type || "").split(";")[0].trim().toLowerCase();
  if (!VIDEO_TYPES.has(baseType)) {
    throw new UploadError("Formato de vídeo no soportado.", 400);
  }
  const ext = baseType === "video/quicktime" ? "mov" : baseType.split("/")[1];
  const filename = `${nanoid(12)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  return putToStorage(`uploads/videos/${filename}`, buffer, baseType);
}

// ── Imágenes (originales, a máxima calidad) ─────────────────────────────────

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
  const baseType = (file.type || "").split(";")[0].trim().toLowerCase();

  // Validar que es una imagen y leer dimensiones (sin recodificar).
  let width: number | null = null;
  let height: number | null = null;
  try {
    const meta = await sharp(inputBuffer, { failOn: "none" }).metadata();
    width = meta.width ?? null;
    height = meta.height ?? null;
  } catch {
    throw new UploadError("El archivo no es una imagen válida.", 400);
  }

  let outputBuffer = inputBuffer;
  let contentType = baseType || "application/octet-stream";
  let ext = EXT_BY_TYPE[baseType] ?? "";

  // Formatos no mostrables en el navegador → JPEG calidad 100 (sin resize).
  if (!WEB_SAFE_IMAGE.has(baseType)) {
    try {
      outputBuffer = await sharp(inputBuffer, { failOn: "none" })
        .jpeg({ quality: 100 })
        .toBuffer();
    } catch {
      throw new UploadError("No se pudo convertir la imagen. Prueba con otra.", 400);
    }
    contentType = "image/jpeg";
    ext = "jpg";
  } else if (!ext) {
    ext = "img";
  }

  const filename = `${nanoid(12)}.${ext}`;
  const url = await putToStorage(`uploads/${category}/${filename}`, outputBuffer, contentType);

  return { url, width, height };
}
