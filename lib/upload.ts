"use client";

import { requestUpload } from "@/lib/actions/upload";

// Helper de subida del EDITOR. Sube la imagen DIRECTO a R2 (presigned) para no
// chocar con el límite de 4.5 MB de las funciones de Vercel, y calcula las
// dimensiones en el cliente. En desarrollo (sin R2) cae a /api/upload (disco,
// que la procesa con sharp).

export type UploadResult = {
  url: string;
  width: number | null;
  height: number | null;
};

function dimensiones(file: File): Promise<{ width: number | null; height: number | null }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth || null, height: img.naturalHeight || null });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve({ width: null, height: null });
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

export async function uploadImage(file: File, category: string): Promise<UploadResult> {
  const baseType = (file.type || "").split(";")[0].trim().toLowerCase();

  let target;
  try {
    target = await requestUpload(category, baseType);
  } catch (e) {
    throw new Error(e instanceof Error ? e.message : "No se pudo subir la imagen.");
  }

  if (target.uploadUrl) {
    const dims = await dimensiones(file);
    const res = await fetch(target.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": baseType },
      body: file,
    });
    if (!res.ok) throw new Error("No se pudo subir la imagen a R2.");
    return { url: target.publicUrl, ...dims };
  }

  // Dev (sin R2): subida por el servidor a disco, con procesado sharp.
  const form = new FormData();
  form.append("file", file);
  form.append("category", category);
  const res = await fetch("/api/upload", { method: "POST", body: form });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "No se pudo subir la imagen.");
  }
  return res.json();
}
