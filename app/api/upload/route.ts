import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth/session";
import {
  processAndStoreImage,
  UPLOAD_CATEGORIES,
  UploadError,
} from "@/lib/uploadServer";

// Subida de imágenes del EDITOR (requiere sesión). El procesado y almacenamiento
// (Vercel Blob en prod / disco en dev) vive en lib/uploadServer.ts.
export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  const category = String(form.get("category") ?? "decorativos");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No se recibió ningún archivo." }, { status: 400 });
  }
  if (!UPLOAD_CATEGORIES.has(category)) {
    return NextResponse.json({ error: "Categoría inválida." }, { status: 400 });
  }

  try {
    const result = await processAndStoreImage(file, category);
    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof UploadError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "No se pudo procesar la imagen." }, { status: 500 });
  }
}
