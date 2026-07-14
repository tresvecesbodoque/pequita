"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import Moveable from "react-moveable";
import type { CanvasData, CanvasElement } from "@/lib/types/canvas";

type Props = {
  data: CanvasData;
  editable?: boolean;
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  onChange?: (elements: CanvasElement[]) => void;
  baseImageUrl?: string | null;
  baseColor?: string | null;
  /** clase con la relación de aspecto y estilo del lienzo */
  className?: string;
  /** estilo extra del papel (ej. fondo del sobre) */
  surfaceStyle?: React.CSSProperties;
};

type Frame = { tx: number; ty: number; rotate: number; width: number; height: number };

export function CanvasStage({
  data,
  editable = false,
  selectedId = null,
  onSelect,
  onChange,
  baseImageUrl,
  baseColor,
  className,
  surfaceStyle,
}: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const elRefs = useRef(new Map<string, HTMLDivElement>());
  const liveFrame = useRef<Frame | null>(null);

  useLayoutEffect(() => {
    const node = stageRef.current;
    if (!node) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      setSize({ w: r.width, h: r.height });
    });
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  const SW = size.w;
  const SH = size.h;

  const selectedEl = useMemo(
    () => data.elements.find((e) => e.id === selectedId) ?? null,
    [data.elements, selectedId]
  );

  function elementPx(el: CanvasElement) {
    const width = (el.width / 100) * SW;
    const height =
      el.kind === "image" ? width * el.ratio : (el.height / 100) * SH;
    const cx = (el.x / 100) * SW;
    const cy = (el.y / 100) * SH;
    return { width, height, tx: cx - width / 2, ty: cy - height / 2 };
  }

  function patchElement(id: string, patch: Partial<CanvasElement>) {
    if (!onChange) return;
    onChange(
      data.elements.map((e) => (e.id === id ? ({ ...e, ...patch } as CanvasElement) : e))
    );
  }

  function startInteraction() {
    if (!selectedEl) return;
    const px = elementPx(selectedEl);
    liveFrame.current = {
      tx: px.tx,
      ty: px.ty,
      rotate: selectedEl.rotation,
      width: px.width,
      height: px.height,
    };
  }

  function applyLive(target: HTMLElement | SVGElement) {
    const f = liveFrame.current!;
    (target as HTMLElement).style.width = `${f.width}px`;
    (target as HTMLElement).style.height = `${f.height}px`;
    (target as HTMLElement).style.transform = `translate(${f.tx}px, ${f.ty}px) rotate(${f.rotate}deg)`;
  }

  function commit() {
    const f = liveFrame.current;
    if (!f || !selectedEl) return;
    const cx = f.tx + f.width / 2;
    const cy = f.ty + f.height / 2;
    const patch: Partial<CanvasElement> = {
      x: (cx / SW) * 100,
      y: (cy / SH) * 100,
      width: (f.width / SW) * 100,
      rotation: f.rotate,
    };
    if (selectedEl.kind === "text") {
      (patch as { height?: number }).height = (f.height / SH) * 100;
    }
    patchElement(selectedEl.id, patch);
  }

  const aspect = data.canvasWidth / data.canvasHeight;

  return (
    <div
      ref={stageRef}
      onMouseDown={(e) => {
        if (editable && e.target === stageRef.current) onSelect?.(null);
      }}
      className={className}
      style={{
        position: "relative",
        aspectRatio: `${aspect}`,
        overflow: "hidden",
        backgroundColor: baseColor ?? undefined,
        ...surfaceStyle,
      }}
    >
      {baseImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={baseImageUrl}
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
      )}

      {data.elements.map((el) => {
        // En el presentador, las capas ocultas no se muestran.
        if (!editable && el.hidden) return null;
        const px = elementPx(el);
        const isSelected = editable && el.id === selectedId;
        return (
          <div
            key={el.id}
            ref={(node) => {
              if (node) elRefs.current.set(el.id, node);
              else elRefs.current.delete(el.id);
            }}
            onMouseDown={(e) => {
              if (!editable) return;
              e.stopPropagation();
              onSelect?.(el.id);
            }}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: px.width,
              height: px.height,
              transform: `translate(${px.tx}px, ${px.ty}px) rotate(${el.rotation}deg)`,
              zIndex: el.zIndex,
              cursor: editable ? "move" : "default",
              outline: isSelected ? "1px dashed rgba(168,50,74,0.6)" : "none",
              opacity: el.hidden ? 0.25 : 1,
              userSelect: "none",
            }}
          >
            {el.kind === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={el.src}
                alt=""
                draggable={false}
                className="h-full w-full object-contain"
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center", // centrado vertical
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    textAlign: el.align,
                    fontFamily: el.fontFamily,
                    color: el.color,
                    fontSize: (el.fontSize / 100) * SH,
                    fontStyle: el.fontStyle ?? "normal",
                    fontWeight: el.fontWeight ?? 400,
                    lineHeight: 1.3,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {el.text}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {editable && selectedEl && SW > 0 && (
        <Moveable
          key={`${selectedEl.id}-${Math.round(SW)}`}
          target={elRefs.current.get(selectedEl.id) ?? null}
          draggable
          resizable
          rotatable
          keepRatio={selectedEl.kind === "image"}
          throttleDrag={0}
          throttleResize={0}
          throttleRotate={0}
          origin={false}
          onDragStart={startInteraction}
          onResizeStart={startInteraction}
          onRotateStart={startInteraction}
          onDrag={({ beforeTranslate, target }) => {
            if (!liveFrame.current) return;
            liveFrame.current.tx = beforeTranslate[0];
            liveFrame.current.ty = beforeTranslate[1];
            applyLive(target);
          }}
          onResize={({ width, height, drag, target }) => {
            if (!liveFrame.current) return;
            liveFrame.current.width = width;
            liveFrame.current.height = height;
            liveFrame.current.tx = drag.beforeTranslate[0];
            liveFrame.current.ty = drag.beforeTranslate[1];
            applyLive(target);
          }}
          onRotate={({ beforeRotate, target }) => {
            if (!liveFrame.current) return;
            liveFrame.current.rotate = beforeRotate;
            applyLive(target);
          }}
          onDragEnd={commit}
          onResizeEnd={commit}
          onRotateEnd={commit}
        />
      )}
    </div>
  );
}
