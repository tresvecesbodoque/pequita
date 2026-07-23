"use client";

import { requestUpload } from "@/lib/actions/upload";

export type MediaKind = "foto" | "voz" | "video";

// Sube un archivo directo a R2 (presigned) desde el navegador, evitando el
// límite de 4.5 MB de las funciones de Vercel. En desarrollo (sin R2) cae a la
// ruta /api/media (disco). Devuelve la URL pública del archivo guardado.
export async function uploadMedia(file: File, kind: MediaKind): Promise<string> {
  const baseType = (file.type || "").split(";")[0].trim().toLowerCase();
  const target = await requestUpload(kind, baseType);

  if (target.uploadUrl) {
    const res = await fetch(target.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": baseType },
      body: file,
    });
    if (!res.ok) throw new Error("No se pudo subir el archivo a R2.");
    return target.publicUrl;
  }

  // Dev: subida por el servidor a disco.
  const fd = new FormData();
  fd.set("file", file);
  fd.set("kind", kind);
  const res = await fetch("/api/media", { method: "POST", body: fd });
  if (!res.ok) throw new Error("No se pudo subir el archivo.");
  const j = (await res.json()) as { url: string };
  return j.url;
}
