// Helper de subida usado desde el cliente. Envía el archivo a /api/upload
// (que lo procesa con sharp) y devuelve la URL pública + dimensiones.

export type UploadResult = {
  url: string;
  width: number | null;
  height: number | null;
};

export async function uploadImage(file: File, category: string): Promise<UploadResult> {
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
