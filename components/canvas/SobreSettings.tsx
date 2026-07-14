"use client";

import { useRef, useState } from "react";
import { updateLetterMeta } from "@/lib/actions/letters";
import { uploadImage } from "@/lib/upload";
import { Button } from "@/components/ui/Button";

const PRESET_COLORS = ["#d6c7a1", "#e8d5c4", "#c9b8a8", "#b0453a", "#5a6b52", "#3a4a63", "#f6f1e7"];

export function SobreSettings({
  letterId,
  color,
  baseImageUrl,
  onColorChange,
  onBaseImageChange,
}: {
  letterId: string;
  color: string;
  baseImageUrl: string | null;
  onColorChange: (c: string) => void;
  onBaseImageChange: (url: string | null) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function setColor(c: string) {
    onColorChange(c);
    updateLetterMeta(letterId, { sobreColor: c });
  }

  async function handleTexture(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadImage(file, "sobres");
      onBaseImageChange(url);
      await updateLetterMeta(letterId, { sobreBaseImageUrl: url });
    } catch {
      alert("No se pudo subir la textura.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function clearTexture() {
    onBaseImageChange(null);
    updateLetterMeta(letterId, { sobreBaseImageUrl: null });
  }

  return (
    <div className="paper-texture flex flex-wrap items-center gap-5 rounded-2xl border border-[var(--border)] p-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-[var(--muted)]">Color del sobre</span>
        <div className="flex gap-1.5">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 ${
                color === c ? "border-[var(--accent)]" : "border-white/60"
              }`}
              style={{ backgroundColor: c }}
              aria-label={c}
            />
          ))}
        </div>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="h-8 w-9 cursor-pointer rounded border border-[var(--border)]"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleTexture}
          className="hidden"
        />
        <Button
          variant="outline"
          className="px-4 py-2 text-xs"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? "Subiendo…" : baseImageUrl ? "Cambiar textura" : "↑ Textura del sobre"}
        </Button>
        {baseImageUrl && (
          <button
            onClick={clearTexture}
            className="text-xs text-[var(--muted)] hover:text-[var(--accent)]"
          >
            Quitar
          </button>
        )}
      </div>
    </div>
  );
}
