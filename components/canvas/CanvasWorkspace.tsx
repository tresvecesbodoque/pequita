"use client";

import { useEffect, useRef, useState } from "react";
import { CanvasStage } from "./CanvasStage";
import { StickerLibraryPicker, type PickedSticker } from "@/components/stickers/StickerLibraryPicker";
import { Button } from "@/components/ui/Button";
import { updateCanvas } from "@/lib/actions/letters";
import { uploadImage } from "@/lib/upload";
import {
  FONT_OPTIONS,
  maxZ,
  newImageElement,
  newTextElement,
} from "@/lib/canvasHelpers";
import type { CanvasData, CanvasElement, TextElement } from "@/lib/types/canvas";
import { nanoid } from "nanoid";

type Props = {
  /** id de la carta (modo taller). En modo invitado no hay carta aún. */
  letterId?: string;
  which: "esquela" | "sobre";
  initialCanvas: CanvasData;
  baseColor?: string | null;
  baseImageUrl?: string | null;
  /** modo invitado: persiste vía callback en vez de la acción autenticada */
  persist?: (json: string) => void;
  /** ocultar subida de imágenes (la API exige sesión) */
  allowUpload?: boolean;
  /** librería restringida a stickers públicos (decorativos) */
  publicStickers?: boolean;
};

export function CanvasWorkspace({
  letterId,
  which,
  initialCanvas,
  baseColor,
  baseImageUrl,
  persist,
  allowUpload = true,
  publicStickers = false,
}: Props) {
  const [elements, setElements] = useState<CanvasElement[]>(initialCanvas.elements);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const canvas: CanvasData = { ...initialCanvas, elements };
  const selected = elements.find((e) => e.id === selectedId) ?? null;

  // Autoguardado debounced
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setStatus("saving");
    const t = setTimeout(async () => {
      const json = JSON.stringify({ ...initialCanvas, elements });
      if (persist) persist(json);
      else if (letterId) await updateCanvas(letterId, which, json);
      setStatus("saved");
    }, 800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elements]);

  function addText() {
    const el = newTextElement(elements);
    setElements((prev) => [...prev, el]);
    setSelectedId(el.id);
  }

  function pickSticker(s: PickedSticker) {
    const el = newImageElement(elements, s.imageUrl, s.width, s.height);
    setElements((prev) => [...prev, el]);
    setSelectedId(el.id);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url, width, height } = await uploadImage(file, "fotos");
      const el = newImageElement(elements, url, width, height);
      setElements((prev) => [...prev, el]);
      setSelectedId(el.id);
    } catch {
      alert("No se pudo subir la imagen.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function updateSelected(patch: Partial<CanvasElement>) {
    if (!selected) return;
    setElements((prev) =>
      prev.map((e) => (e.id === selected.id ? ({ ...e, ...patch } as CanvasElement) : e))
    );
  }

  function removeSelected() {
    if (!selected) return;
    setElements((prev) => prev.filter((e) => e.id !== selected.id));
    setSelectedId(null);
  }

  function duplicateSelected() {
    if (!selected) return;
    const copy = { ...selected, id: nanoid(8), x: selected.x + 4, y: selected.y + 4, zIndex: maxZ(elements) + 1 } as CanvasElement;
    setElements((prev) => [...prev, copy]);
    setSelectedId(copy.id);
  }

  function bringToFront() {
    updateSelected({ zIndex: maxZ(elements) + 1 });
  }
  function sendToBack() {
    const minZ = elements.reduce((m, e) => Math.min(m, e.zIndex), 0);
    updateSelected({ zIndex: minZ - 1 });
  }

  function toggleHidden(id: string) {
    setElements((prev) =>
      prev.map((e) => (e.id === id ? ({ ...e, hidden: !e.hidden } as CanvasElement) : e))
    );
  }

  // Sube o baja una capa un paso, intercambiando el zIndex con su vecino.
  function moveLayer(id: string, dir: "up" | "down") {
    const ordered = [...elements].sort((a, b) => a.zIndex - b.zIndex);
    const idx = ordered.findIndex((e) => e.id === id);
    const swapIdx = dir === "up" ? idx + 1 : idx - 1;
    if (swapIdx < 0 || swapIdx >= ordered.length) return;
    const a = ordered[idx];
    const b = ordered[swapIdx];
    setElements((prev) =>
      prev.map((e) => {
        if (e.id === a.id) return { ...e, zIndex: b.zIndex } as CanvasElement;
        if (e.id === b.id) return { ...e, zIndex: a.zIndex } as CanvasElement;
        return e;
      })
    );
  }

  function deleteById(id: string) {
    setElements((prev) => prev.filter((e) => e.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  // Capas ordenadas de arriba (frente) hacia abajo (fondo)
  const layersTopFirst = [...elements].sort((a, b) => b.zIndex - a.zIndex);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      {/* Lienzo */}
      <div>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Button variant="outline" className="px-4 py-2 text-xs" onClick={addText}>
            ✎ Texto
          </Button>
          <Button
            variant="outline"
            className="px-4 py-2 text-xs"
            onClick={() => setPickerOpen(true)}
          >
            ✦ Librería
          </Button>
          {allowUpload && (
            <>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                className="px-4 py-2 text-xs"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? "Subiendo…" : "↑ Subir imagen"}
              </Button>
            </>
          )}
          <span className="ml-auto text-xs text-[var(--muted)]">
            {status === "saving" ? "Guardando…" : status === "saved" ? "Guardado ✓" : ""}
          </span>
        </div>

        <div className="mx-auto max-w-xl rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-inner">
          <CanvasStage
            data={canvas}
            editable
            selectedId={selectedId}
            onSelect={setSelectedId}
            onChange={setElements}
            baseColor={baseColor}
            baseImageUrl={baseImageUrl}
            className="rounded-lg"
          />
        </div>
        <p className="mt-2 text-center text-xs text-[var(--muted)]">
          Toca un elemento para moverlo, escalarlo o rotarlo. Toca el fondo para deseleccionar.
        </p>
      </div>

      {/* Columna derecha: inspector + capas */}
      <div className="flex flex-col gap-5">
        <aside className="paper-texture h-fit rounded-2xl border border-[var(--border)] p-4">
          {!selected ? (
            <p className="text-sm text-[var(--muted)]">
              Selecciona un elemento para editar sus propiedades.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg">
                  {selected.kind === "text" ? "Texto" : "Imagen"}
                </h3>
                <button
                  onClick={removeSelected}
                  className="text-xs text-[var(--muted)] hover:text-[var(--accent)]"
                >
                  Eliminar
                </button>
              </div>

              {selected.kind === "text" && (
                <TextControls element={selected} onChange={updateSelected} />
              )}

              <div className="mt-2 flex flex-wrap gap-2 border-t border-[var(--border)] pt-3">
                <MiniBtn onClick={bringToFront}>Al frente</MiniBtn>
                <MiniBtn onClick={sendToBack}>Al fondo</MiniBtn>
                <MiniBtn onClick={duplicateSelected}>Duplicar</MiniBtn>
              </div>
            </div>
          )}
        </aside>

        <LayersPanel
          layers={layersTopFirst}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onMove={moveLayer}
          onToggleHidden={toggleHidden}
          onDelete={deleteById}
        />
      </div>

      <StickerLibraryPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={pickSticker}
        publicOnly={publicStickers}
      />
    </div>
  );
}

function TextControls({
  element,
  onChange,
}: {
  element: TextElement;
  onChange: (patch: Partial<TextElement>) => void;
}) {
  return (
    <>
      <label className="flex flex-col gap-1 text-xs text-[var(--muted)]">
        Contenido
        <textarea
          value={element.text}
          onChange={(e) => onChange({ text: e.target.value })}
          rows={3}
          className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent-soft)]"
        />
      </label>

      <label className="flex flex-col gap-1 text-xs text-[var(--muted)]">
        Tipografía
        <select
          value={element.fontFamily}
          onChange={(e) => onChange({ fontFamily: e.target.value })}
          className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 text-sm outline-none"
        >
          {FONT_OPTIONS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs text-[var(--muted)]">
        Tamaño ({element.fontSize.toFixed(1)})
        <input
          type="range"
          min={2}
          max={20}
          step={0.5}
          value={element.fontSize}
          onChange={(e) => onChange({ fontSize: Number(e.target.value) })}
          className="accent-[var(--accent)]"
        />
      </label>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-xs text-[var(--muted)]">
          Color
          <input
            type="color"
            value={element.color}
            onChange={(e) => onChange({ color: e.target.value })}
            className="h-8 w-10 cursor-pointer rounded border border-[var(--border)]"
          />
        </label>
        <div className="ml-auto flex gap-1">
          {(["left", "center", "right", "justify"] as const).map((a) => (
            <button
              key={a}
              onClick={() => onChange({ align: a })}
              title={
                a === "left"
                  ? "Izquierda"
                  : a === "center"
                    ? "Centrado"
                    : a === "right"
                      ? "Derecha"
                      : "Justificado"
              }
              className={`rounded px-2 py-1 text-xs ${
                element.align === a
                  ? "bg-[var(--accent)] text-white"
                  : "border border-[var(--border)] text-[var(--muted)]"
              }`}
            >
              {a === "left" ? "⬅" : a === "center" ? "≡" : a === "right" ? "➡" : "▤"}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function LayersPanel({
  layers,
  selectedId,
  onSelect,
  onMove,
  onToggleHidden,
  onDelete,
}: {
  layers: CanvasElement[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onMove: (id: string, dir: "up" | "down") => void;
  onToggleHidden: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <aside className="paper-texture h-fit rounded-2xl border border-[var(--border)] p-4">
      <h3 className="mb-3 text-lg">Capas</h3>
      {layers.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">Sin elementos todavía.</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {layers.map((el, i) => {
            const label =
              el.kind === "text"
                ? el.text.trim().slice(0, 22) || "Texto"
                : "Imagen";
            const active = el.id === selectedId;
            return (
              <li
                key={el.id}
                className={`flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm ${
                  active ? "bg-[var(--accent)]/10 ring-1 ring-[var(--accent-soft)]" : "hover:bg-black/5"
                }`}
              >
                <button
                  onClick={() => onToggleHidden(el.id)}
                  title={el.hidden ? "Mostrar" : "Ocultar"}
                  className="w-5 shrink-0 text-[var(--muted)] hover:text-[var(--accent)]"
                >
                  {el.hidden ? "◌" : "◉"}
                </button>
                <button
                  onClick={() => onSelect(el.id)}
                  className={`flex-1 truncate text-left ${el.hidden ? "text-[var(--muted)] line-through" : ""}`}
                >
                  {el.kind === "text" ? "✎ " : "🖼 "}
                  {label}
                </button>
                <button
                  onClick={() => onMove(el.id, "up")}
                  disabled={i === 0}
                  title="Subir"
                  className="w-5 shrink-0 text-[var(--muted)] hover:text-[var(--foreground)] disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  onClick={() => onMove(el.id, "down")}
                  disabled={i === layers.length - 1}
                  title="Bajar"
                  className="w-5 shrink-0 text-[var(--muted)] hover:text-[var(--foreground)] disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  onClick={() => onDelete(el.id)}
                  title="Eliminar"
                  className="w-5 shrink-0 text-[var(--muted)] hover:text-[var(--accent)]"
                >
                  ✕
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}

function MiniBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="rounded-full border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--foreground)] hover:border-[var(--accent-soft)]"
    >
      {children}
    </button>
  );
}
