"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { BACKGROUND_PRESETS } from "@/lib/backgrounds/presets";
import { backgroundLayerStyle, type BackgroundConfig } from "@/lib/backgrounds/render";
import { updateLetterMeta, regenerateQr } from "@/lib/actions/letters";
import { uploadImage } from "@/lib/upload";
import { Button } from "@/components/ui/Button";
import { QRDisplay } from "@/components/qr/QRDisplay";

type Props = {
  letterId: string;
  slug: string;
  baseUrl: string;
  config: BackgroundConfig;
  onConfigChange: (patch: Partial<BackgroundConfig>) => void;
  qrInterior: string | null;
  qrExterior: string | null;
};

export function PresentacionSettings({
  letterId,
  slug,
  baseUrl,
  config,
  onConfigChange,
  qrInterior,
  qrExterior,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [qrPending, startQr] = useTransition();
  const [qr, setQr] = useState({ interior: qrInterior, exterior: qrExterior });
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const shareUrl = `${baseUrl}/carta/${slug}`;

  function choosePreset(id: string) {
    const patch = { backgroundType: "PRESET" as const, backgroundPresetId: id };
    onConfigChange(patch);
    updateLetterMeta(letterId, patch);
  }

  async function handleCustom(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadImage(file, "fondos");
      const patch = { backgroundType: "CUSTOM" as const, backgroundImageUrl: url };
      onConfigChange(patch);
      await updateLetterMeta(letterId, patch);
    } catch {
      alert("No se pudo subir el motivo.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function setScale(scale: number) {
    onConfigChange({ backgroundScale: scale });
    updateLetterMeta(letterId, { backgroundScale: scale });
  }

  function handleGenerateQr() {
    startQr(async () => {
      const res = await regenerateQr(letterId);
      setQr({ interior: res.qrInteriorDataUrl, exterior: res.qrExteriorDataUrl });
    });
  }

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {/* Preview + presets */}
      <div>
        <div
          className="flex h-56 items-center justify-center rounded-2xl border border-[var(--border)]"
          style={backgroundLayerStyle(config)}
        >
          <div className="rounded-md bg-[var(--surface)]/90 px-6 py-8 shadow-lg">
            <span className="text-sm text-[var(--muted)]">Vista previa del fondo</span>
          </div>
        </div>

        <h3 className="mt-6 text-lg">Temas</h3>
        <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-5">
          {BACKGROUND_PRESETS.map((p) => {
            const active =
              config.backgroundType === "PRESET" && config.backgroundPresetId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => choosePreset(p.id)}
                className={`h-20 rounded-xl border-2 transition-transform hover:scale-[1.03] ${
                  active ? "border-[var(--accent)]" : "border-[var(--border)]"
                }`}
                style={backgroundLayerStyle({
                  backgroundType: "PRESET",
                  backgroundPresetId: p.id,
                  backgroundImageUrl: null,
                  backgroundScale: null,
                })}
                title={p.name}
              />
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/*"
            onChange={handleCustom}
            className="hidden"
          />
          <Button
            variant="outline"
            className="px-4 py-2 text-xs"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? "Subiendo…" : "↑ Subir motivo propio (.png)"}
          </Button>
          {config.backgroundType === "CUSTOM" && config.backgroundImageUrl && (
            <span className="text-xs text-[var(--accent)]">Motivo personalizado activo ✓</span>
          )}
        </div>

        <label className="mt-5 flex max-w-xs flex-col gap-1 text-xs text-[var(--muted)]">
          Densidad del patrón ({config.backgroundScale ?? "auto"} px)
          <input
            type="range"
            min={20}
            max={400}
            step={4}
            value={config.backgroundScale ?? 80}
            onChange={(e) => setScale(Number(e.target.value))}
            className="accent-[var(--accent)]"
          />
        </label>
        <p className="mt-1 max-w-sm text-xs text-[var(--muted)]">
          Para que un motivo propio se repita sin cortes, debe ser una imagen
          &quot;seamless&quot; (que encaje consigo misma en los bordes).
        </p>
      </div>

      {/* QR + enlace */}
      <aside className="paper-texture h-fit rounded-2xl border border-[var(--border)] p-5">
        <h3 className="text-lg">Enlace y QR</h3>
        <p className="mt-1 break-all text-xs text-[var(--muted)]">{shareUrl}</p>
        <div className="mt-3 flex gap-2">
          <Button variant="outline" className="px-3 py-1.5 text-xs" onClick={copyLink}>
            {copied ? "¡Copiado!" : "Copiar enlace"}
          </Button>
          <Link href={`/carta/${slug}`} target="_blank">
            <Button variant="ghost" className="px-3 py-1.5 text-xs">
              Abrir ↗
            </Button>
          </Link>
        </div>

        <div className="mt-5 border-t border-[var(--border)] pt-4">
          <Button
            className="w-full text-xs"
            onClick={handleGenerateQr}
            disabled={qrPending}
          >
            {qrPending ? "Generando…" : qr.interior ? "Regenerar QR" : "Generar QR"}
          </Button>

          {(qr.interior || qr.exterior) && (
            <div className="mt-4 flex justify-around gap-3">
              {qr.exterior && (
                <QRDisplay dataUrl={qr.exterior} label="Exterior" filename={`qr-${slug}-exterior.png`} />
              )}
              {qr.interior && (
                <QRDisplay dataUrl={qr.interior} label="Interior" filename={`qr-${slug}-interior.png`} />
              )}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
