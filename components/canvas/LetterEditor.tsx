"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CanvasWorkspace } from "./CanvasWorkspace";
import { SobreSettings } from "./SobreSettings";
import { PresentacionSettings } from "./PresentacionSettings";
import { updateLetterMeta } from "@/lib/actions/letters";
import { parseCanvas, EMPTY_ESQUELA, EMPTY_SOBRE } from "@/lib/types/canvas";
import type { BackgroundConfig } from "@/lib/backgrounds/render";

type LetterProps = {
  id: string;
  slug: string;
  title: string;
  esquelaCanvas: string;
  sobreCanvas: string;
  esquelaBaseImageUrl: string | null;
  sobreBaseImageUrl: string | null;
  sobreColor: string | null;
  backgroundType: "PRESET" | "CUSTOM";
  backgroundPresetId: string | null;
  backgroundImageUrl: string | null;
  backgroundScale: number | null;
  qrInteriorDataUrl: string | null;
  qrExteriorDataUrl: string | null;
};

type Tab = "esquela" | "sobre" | "presentacion";

export function LetterEditor({ letter, baseUrl }: { letter: LetterProps; baseUrl: string }) {
  const [tab, setTab] = useState<Tab>("esquela");
  const [title, setTitle] = useState(letter.title);
  const [sobreColor, setSobreColor] = useState(letter.sobreColor ?? "#d6c7a1");
  const [sobreBaseImageUrl, setSobreBaseImageUrl] = useState(letter.sobreBaseImageUrl);
  const [bg, setBg] = useState<BackgroundConfig>({
    backgroundType: letter.backgroundType,
    backgroundPresetId: letter.backgroundPresetId,
    backgroundImageUrl: letter.backgroundImageUrl,
    backgroundScale: letter.backgroundScale,
  });

  const esquela = parseCanvas(letter.esquelaCanvas, EMPTY_ESQUELA);
  const sobre = parseCanvas(letter.sobreCanvas, EMPTY_SOBRE);

  function saveTitle() {
    if (title.trim() && title !== letter.title) {
      updateLetterMeta(letter.id, { title: title.trim() });
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/editor"
            className="text-sm text-[var(--muted)] hover:text-[var(--accent)]"
          >
            ← Mis cartas
          </Link>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={saveTitle}
            className="rounded-lg bg-transparent px-2 py-1 text-2xl font-serif outline-none hover:bg-black/5 focus:bg-black/5"
          />
        </div>
      </div>

      {/* Pestañas */}
      <div className="mt-6 flex gap-1 border-b border-[var(--border)]">
        <TabButton active={tab === "esquela"} onClick={() => setTab("esquela")}>
          Esquela
        </TabButton>
        <TabButton active={tab === "sobre"} onClick={() => setTab("sobre")}>
          Sobre
        </TabButton>
        <TabButton active={tab === "presentacion"} onClick={() => setTab("presentacion")}>
          Presentación
        </TabButton>
      </div>

      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mt-8"
      >
        {tab === "esquela" && (
          <CanvasWorkspace
            letterId={letter.id}
            which="esquela"
            initialCanvas={esquela}
            baseColor="#fffdf8"
            baseImageUrl={letter.esquelaBaseImageUrl}
          />
        )}
        {tab === "sobre" && (
          <div className="flex flex-col gap-5">
            <SobreSettings
              letterId={letter.id}
              color={sobreColor}
              baseImageUrl={sobreBaseImageUrl}
              onColorChange={setSobreColor}
              onBaseImageChange={setSobreBaseImageUrl}
            />
            <CanvasWorkspace
              letterId={letter.id}
              which="sobre"
              initialCanvas={sobre}
              baseColor={sobreColor}
              baseImageUrl={sobreBaseImageUrl}
            />
          </div>
        )}
        {tab === "presentacion" && (
          <PresentacionSettings
            letterId={letter.id}
            slug={letter.slug}
            baseUrl={baseUrl}
            config={bg}
            onConfigChange={(patch) => setBg((prev) => ({ ...prev, ...patch }))}
            qrInterior={letter.qrInteriorDataUrl}
            qrExterior={letter.qrExteriorDataUrl}
          />
        )}
      </motion.div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative px-5 py-2.5 text-sm font-medium transition-colors ${
        active ? "text-[var(--accent)]" : "text-[var(--muted)] hover:text-[var(--foreground)]"
      }`}
    >
      {children}
      {active && (
        <motion.span
          layoutId="tab-underline"
          className="absolute inset-x-2 -bottom-px h-0.5 rounded bg-[var(--accent)]"
        />
      )}
    </button>
  );
}
