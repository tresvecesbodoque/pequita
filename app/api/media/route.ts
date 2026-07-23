import { NextResponse } from "next/server";
import { processAndStoreImage, storeAudio, storeVideo, UploadError } from "@/lib/uploadServer";

// Respaldo SOLO para desarrollo (sin R2): guarda el archivo en disco y devuelve
// su URL. En producción no se usa: el cliente sube directo a R2 con presigned
// (esta ruta chocaría con el límite de 4.5 MB de las funciones de Vercel).
export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file");
  const kind = String(form.get("kind") ?? "");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "No se recibió ningún archivo." }, { status: 400 });
  }

  try {
    let url: string;
    if (kind === "foto") {
      url = (await processAndStoreImage(file, "fotos", { maxBytes: 25 * 1024 * 1024 })).url;
    } else if (kind === "voz") {
      url = await storeAudio(file);
    } else if (kind === "video") {
      url = await storeVideo(file);
    } else {
      return NextResponse.json({ error: "Tipo inválido." }, { status: 400 });
    }
    return NextResponse.json({ url });
  } catch (e) {
    if (e instanceof UploadError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "No se pudo guardar el archivo." }, { status: 500 });
  }
}
