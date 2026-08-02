"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CanvasStage } from "./CanvasStage";
import { StickerLibraryPicker, type PickedSticker } from "@/components/stickers/StickerLibraryPicker";
import { Button } from "@/components/ui/Button";
import { Rotulo } from "@/components/ui/Rotulo";
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

/** Cuántos pasos atrás se pueden deshacer. */
const MAX_HISTORIAL = 60;
/** Ventana para fundir cambios seguidos del mismo tipo (escribir, arrastrar un
 *  deslizador): sin esto, cada tecla sería un paso del historial. */
const FUSION_MS = 700;

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

  // Historial: dos pilas de instantáneas del lienzo. Cada cambio empuja el
  // estado ANTERIOR a `antes` y vacía `despues` (a partir de aquí, la historia
  // se reescribe). Los elementos son inmutables, así que guardar el array basta.
  const [antes, setAntes] = useState<CanvasElement[][]>([]);
  const [despues, setDespues] = useState<CanvasElement[][]>([]);
  const ultimo = useRef<{ tag: string; at: number } | null>(null);

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

  /**
   * Único camino para cambiar el lienzo: deja rastro en el historial.
   * @param tag si dos cambios seguidos traen el mismo `tag` dentro de la
   *            ventana de fusión, cuentan como un solo paso (escribir una
   *            palabra se deshace de golpe, no letra a letra).
   */
  function aplicar(next: CanvasElement[], tag?: string) {
    const ahora = Date.now();
    const funde =
      tag !== undefined &&
      ultimo.current?.tag === tag &&
      ahora - ultimo.current.at < FUSION_MS;
    if (!funde) setAntes((p) => [...p, elements].slice(-MAX_HISTORIAL));
    ultimo.current = tag === undefined ? null : { tag, at: ahora };
    setDespues([]);
    setElements(next);
  }

  const puedeDeshacer = antes.length > 0;
  const puedeRehacer = despues.length > 0;

  const deshacer = useCallback(() => {
    if (antes.length === 0) return;
    const previo = antes[antes.length - 1];
    setAntes(antes.slice(0, -1));
    setDespues([elements, ...despues]);
    setElements(previo);
    ultimo.current = null;
    // si el elemento seleccionado ya no existe, soltamos la selección
    setSelectedId((id) => (id && previo.some((e) => e.id === id) ? id : null));
  }, [antes, despues, elements]);

  const rehacer = useCallback(() => {
    if (despues.length === 0) return;
    const siguiente = despues[0];
    setDespues(despues.slice(1));
    setAntes([...antes, elements].slice(-MAX_HISTORIAL));
    setElements(siguiente);
    ultimo.current = null;
    setSelectedId((id) => (id && siguiente.some((e) => e.id === id) ? id : null));
  }, [antes, despues, elements]);

  // Atajos: ⌘Z / Ctrl+Z deshacer, ⇧⌘Z o Ctrl+Y rehacer, Supr borra lo elegido.
  // Dentro de un campo de texto no tocamos nada: ahí manda el deshacer nativo.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      const escribiendo =
        !!t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.tagName === "SELECT" ||
          t.isContentEditable);
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "z" && !escribiendo) {
        e.preventDefault();
        if (e.shiftKey) rehacer();
        else deshacer();
        return;
      }
      if (mod && e.key.toLowerCase() === "y" && !escribiendo) {
        e.preventDefault();
        rehacer();
        return;
      }
      if ((e.key === "Delete" || e.key === "Backspace") && !escribiendo && selectedId) {
        e.preventDefault();
        aplicar(elements.filter((el) => el.id !== selectedId));
        setSelectedId(null);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deshacer, rehacer, selectedId, elements]);

  function addText() {
    const el = newTextElement(elements);
    aplicar([...elements, el]);
    setSelectedId(el.id);
  }

  function pickSticker(s: PickedSticker) {
    const el = newImageElement(elements, s.imageUrl, s.width, s.height);
    aplicar([...elements, el]);
    setSelectedId(el.id);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url, width, height } = await uploadImage(file, "fotos");
      const el = newImageElement(elements, url, width, height);
      aplicar([...elements, el]);
      setSelectedId(el.id);
    } catch {
      alert("No se pudo subir la imagen.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function updateSelected(patch: Partial<CanvasElement>, tag?: string) {
    if (!selected) return;
    aplicar(
      elements.map((e) => (e.id === selected.id ? ({ ...e, ...patch } as CanvasElement) : e)),
      tag ? `${tag}:${selected.id}` : undefined
    );
  }

  function removeSelected() {
    if (!selected) return;
    aplicar(elements.filter((e) => e.id !== selected.id));
    setSelectedId(null);
  }

  function duplicateSelected() {
    if (!selected) return;
    const copy = { ...selected, id: nanoid(8), x: selected.x + 4, y: selected.y + 4, zIndex: maxZ(elements) + 1 } as CanvasElement;
    aplicar([...elements, copy]);
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
    aplicar(
      elements.map((e) => (e.id === id ? ({ ...e, hidden: !e.hidden } as CanvasElement) : e))
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
    aplicar(
      elements.map((e) => {
        if (e.id === a.id) return { ...e, zIndex: b.zIndex } as CanvasElement;
        if (e.id === b.id) return { ...e, zIndex: a.zIndex } as CanvasElement;
        return e;
      })
    );
  }

  function deleteById(id: string) {
    aplicar(elements.filter((e) => e.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  // Capas ordenadas de arriba (frente) hacia abajo (fondo)
  const layersTopFirst = [...elements].sort((a, b) => b.zIndex - a.zIndex);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      {/* Lienzo */}
      <div>
        {/* Barra: primero deshacer/rehacer (a la izquierda, donde se buscan),
            luego una línea de oro y después lo que AÑADE cosas. Separar los
            dos grupos evita pulsar "Texto" queriendo deshacer. */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-full border-[1.5px] border-[var(--borde)] bg-[var(--cristal)] p-1 backdrop-blur-[4px]">
            <HistBtn
              onClick={deshacer}
              disabled={!puedeDeshacer}
              label="Deshacer"
              atajo="⌘Z"
            >
              <FlechaHistorial />
            </HistBtn>
            <span className="h-4 w-px bg-[var(--borde)]" aria-hidden />
            <HistBtn
              onClick={rehacer}
              disabled={!puedeRehacer}
              label="Rehacer"
              atajo="⇧⌘Z"
            >
              <FlechaHistorial espejo />
            </HistBtn>
          </div>

          <span className="mx-1 hidden h-5 w-px bg-[var(--borde)] sm:block" aria-hidden />

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
          <span className="ml-auto text-xs italic text-[var(--ink-tenue)]">
            {status === "saving" ? "Guardando…" : status === "saved" ? "Guardado ✓" : ""}
          </span>
        </div>

        <div className="relative mx-auto max-w-xl rounded-2xl border-[1.5px] border-[var(--borde)] bg-[var(--cristal)] p-3 backdrop-blur-[4px]">
          {/* marcas de registro tipo imprenta en las esquinas */}
          <span className="registro left-1 top-1" />
          <span className="registro right-1 top-1" />
          <span className="registro bottom-1 left-1" />
          <span className="registro bottom-1 right-1" />
          <CanvasStage
            data={canvas}
            editable
            selectedId={selectedId}
            onSelect={setSelectedId}
            onChange={(next) => aplicar(next)}
            baseColor={baseColor}
            baseImageUrl={baseImageUrl}
            className="cursor-pluma rounded-lg"
          />
        </div>
        <p className="mt-2 text-center text-xs italic text-[var(--ink-tenue)]">
          Toca un elemento para moverlo, escalarlo o rotarlo. Toca el fondo para
          deseleccionar. ⌘Z deshace; Supr borra lo elegido.
        </p>
      </div>

      {/* Columna derecha: inspector + capas */}
      <div className="flex flex-col gap-5">
        <aside className="bloque-cristal h-fit p-4">
          {!selected ? (
            <p className="text-sm italic text-[var(--ink-tenue)]">
              Selecciona un elemento para editar sus propiedades.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <Rotulo as="h3">
                  {selected.kind === "text" ? "Texto" : "Imagen"}
                </Rotulo>
                <button
                  onClick={removeSelected}
                  className="text-xs text-[var(--ink-tenue)] transition-colors hover:text-[var(--gold)]"
                >
                  Eliminar
                </button>
              </div>

              {selected.kind === "text" && (
                <TextControls element={selected} onChange={updateSelected} />
              )}

              <div className="mt-2 flex flex-wrap gap-2 border-t border-[var(--borde)] pt-3">
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

/**
 * Flecha de deshacer (y, espejada, de rehacer). Dibujada, no un carácter: los
 * glifos ↶/↷ no existen en Cormorant y cada navegador los sustituía por un
 * garabato distinto, difícil de reconocer a simple vista.
 */
function FlechaHistorial({ espejo = false }: { espejo?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={espejo ? { transform: "scaleX(-1)" } : undefined}
      aria-hidden
    >
      <path d="M9 7h6.2a4.8 4.8 0 0 1 0 9.6H8.4" />
      <polyline points="12.1 3.9 8.9 7 12.1 10.1" />
    </svg>
  );
}

/** Botón de historial: glifo grande, apagado cuando no hay a dónde ir. */
function HistBtn({
  onClick,
  disabled,
  label,
  atajo,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  label: string;
  atajo: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={`${label} (${atajo})`}
      className="flex h-8 w-9 items-center justify-center rounded-full text-base text-[var(--ink)] transition-colors hover:bg-[var(--gold)]/12 hover:text-[var(--gold)] disabled:pointer-events-none disabled:opacity-30"
    >
      {children}
    </button>
  );
}

function TextControls({
  element,
  onChange,
}: {
  element: TextElement;
  /** `tag` funde cambios seguidos del mismo control en un solo paso */
  onChange: (patch: Partial<TextElement>, tag?: string) => void;
}) {
  return (
    <>
      <label className="flex flex-col gap-1.5">
        <Rotulo>Contenido</Rotulo>
        <textarea
          value={element.text}
          onChange={(e) => onChange({ text: e.target.value }, "texto")}
          rows={3}
          className="rounded-lg border-[1.5px] border-[var(--borde)] bg-[var(--cristal)] p-2 text-sm text-[var(--ink)] outline-none transition-colors focus:border-[var(--borde-vivo)]"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <Rotulo>Tipografía</Rotulo>
        <select
          value={element.fontFamily}
          onChange={(e) => onChange({ fontFamily: e.target.value })}
          className="rounded-lg border-[1.5px] border-[var(--borde)] bg-[var(--cielo)] p-2 text-sm text-[var(--ink)] outline-none transition-colors focus:border-[var(--borde-vivo)]"
        >
          {FONT_OPTIONS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <Rotulo>Tamaño · {element.fontSize.toFixed(1)}</Rotulo>
        <input
          type="range"
          min={2}
          max={20}
          step={0.5}
          value={element.fontSize}
          onChange={(e) => onChange({ fontSize: Number(e.target.value) }, "tamaño")}
          className="accent-[var(--gold)]"
        />
      </label>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2">
          <Rotulo>Color</Rotulo>
          <input
            type="color"
            value={element.color}
            onChange={(e) => onChange({ color: e.target.value }, "color")}
            className="h-8 w-10 cursor-pointer rounded border-[1.5px] border-[var(--borde)] bg-transparent"
          />
        </label>
        <div className="ml-auto flex gap-1">
          {(["left", "center", "right", "justify"] as const).map((a) => (
            <button
              key={a}
              onClick={() => onChange({ align: a })}
              aria-pressed={element.align === a}
              title={
                a === "left"
                  ? "Izquierda"
                  : a === "center"
                    ? "Centrado"
                    : a === "right"
                      ? "Derecha"
                      : "Justificado"
              }
              className={`rounded px-2 py-1 text-xs transition-colors ${
                element.align === a
                  ? "bg-[var(--gold)] text-[var(--fondo)]"
                  : "border-[1.5px] border-[var(--borde)] text-[var(--ink-tenue)] hover:border-[var(--borde-vivo)]"
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
    <aside className="bloque-cristal h-fit p-4">
      <Rotulo as="h3" className="mb-3 block">
        Capas
      </Rotulo>
      {layers.length === 0 ? (
        <p className="text-sm italic text-[var(--ink-tenue)]">Sin elementos todavía.</p>
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
                  active
                    ? "bg-[var(--gold)]/12 ring-1 ring-[var(--borde-vivo)]"
                    : "hover:bg-[var(--gold)]/[0.06]"
                }`}
              >
                <button
                  onClick={() => onToggleHidden(el.id)}
                  title={el.hidden ? "Mostrar" : "Ocultar"}
                  className="w-5 shrink-0 text-[var(--ink-tenue)] transition-colors hover:text-[var(--gold)]"
                >
                  {el.hidden ? "◌" : "◉"}
                </button>
                <button
                  onClick={() => onSelect(el.id)}
                  className={`flex-1 truncate text-left ${el.hidden ? "text-[var(--ink-tenue)] line-through" : "text-[var(--ink)]"}`}
                >
                  {el.kind === "text" ? "✎ " : "▣ "}
                  {label}
                </button>
                <button
                  onClick={() => onMove(el.id, "up")}
                  disabled={i === 0}
                  title="Subir"
                  className="w-5 shrink-0 text-[var(--ink-tenue)] transition-colors hover:text-[var(--ink)] disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  onClick={() => onMove(el.id, "down")}
                  disabled={i === layers.length - 1}
                  title="Bajar"
                  className="w-5 shrink-0 text-[var(--ink-tenue)] transition-colors hover:text-[var(--ink)] disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  onClick={() => onDelete(el.id)}
                  title="Eliminar"
                  className="w-5 shrink-0 text-[var(--ink-tenue)] transition-colors hover:text-[var(--gold)]"
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
      className="rounded-full border-[1.5px] border-[var(--borde)] bg-[var(--cristal)] px-3 py-1.5 text-xs text-[var(--ink)] transition-colors hover:border-[var(--borde-vivo)] hover:text-[var(--gold)]"
    >
      {children}
    </button>
  );
}
