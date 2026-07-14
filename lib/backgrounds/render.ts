import type { CSSProperties } from "react";
import { getPreset } from "./presets";

export type BackgroundConfig = {
  backgroundType: "PRESET" | "CUSTOM";
  backgroundPresetId: string | null;
  backgroundImageUrl: string | null;
  backgroundScale: number | null;
};

function svgDataUri(svg: string): string {
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/** Estilo CSS del fondo tileado del presentador. */
export function backgroundLayerStyle(cfg: BackgroundConfig): CSSProperties {
  if (cfg.backgroundType === "CUSTOM" && cfg.backgroundImageUrl) {
    return {
      backgroundColor: "#f6f1e7",
      backgroundImage: `url("${cfg.backgroundImageUrl}")`,
      backgroundRepeat: "repeat",
      backgroundSize: cfg.backgroundScale ? `${cfg.backgroundScale}px` : "auto",
    };
  }

  const preset = getPreset(cfg.backgroundPresetId);
  const style: CSSProperties = { backgroundColor: preset.bgColor };
  if (preset.tileSvg) {
    style.backgroundImage = svgDataUri(preset.tileSvg);
    style.backgroundRepeat = "repeat";
    style.backgroundSize = `${cfg.backgroundScale ?? preset.tileSize}px`;
  }
  return style;
}
