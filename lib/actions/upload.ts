"use server";

import { createUploadTarget, type UploadTarget } from "@/lib/uploadServer";

// Acción PÚBLICA (el formulario de la familia no tiene sesión): entrega una URL
// prefirmada para subir un archivo directo a R2. Está acotada por tipo de
// contenido y kind; las claves son aleatorias y la firma caduca pronto.
export async function requestUpload(kind: string, contentType: string): Promise<UploadTarget> {
  return createUploadTarget(kind, contentType);
}
