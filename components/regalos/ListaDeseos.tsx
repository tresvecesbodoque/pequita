"use client";

/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  CATEGORIAS_REGALOS,
  NOTAS_ENVIO,
  PLAZOS,
  PRESUPUESTOS,
  REGALOS,
  enlaceRegalo,
  precioLegible,
  type Presupuesto,
  type Regalo,
} from "@/lib/regalos";
import { Rotulo } from "@/components/ui/Rotulo";

// El cuerpo de /lista-de-deseos: las cosas que ella lleva tiempo queriendo, con
// su enlace de compra y un "check" que ven todos, para que dos familiares no
// aparezcan el mismo día con el mismo brillo de labios. El título y la frase de
// bienvenida los pone la página; esto es la lista y nada más.
//
// El "check" no es privado ni tiene contraseña: se firma con el nombre que cada
// uno escriba, y solo quien apartó algo puede soltarlo. Es un acuerdo entre
// familia, no un candado.

const CLAVE_NOMBRE = "pequita-quien-regala";
const CLAVE_BORRADOR = "pequita-borrador";

type Tomado = { quien: string; tomadoEn: number };
type Tomados = Record<string, Tomado>;

const sinTildes = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

function indexar(filas: { regaloId: string; quien: string; tomadoEn: number }[]): Tomados {
  const out: Tomados = {};
  for (const f of filas) out[f.regaloId] = { quien: f.quien, tomadoEn: f.tomadoEn };
  return out;
}

// De las diecinueve cosas, solo siete traen foto. Rellenar las otras doce con
// un marco vacío llenaba la página de cajas iguales: el paquete dibujado va
// pequeño, en la esquina, como el sello de una tarjeta.
function PaqueteDibujado() {
  return (
    <svg viewBox="0 0 120 100" className="h-9 w-11 opacity-45" aria-hidden>
      <g fill="none" stroke="var(--gold)" strokeWidth="3" strokeLinecap="round">
        <rect x="18" y="38" width="84" height="52" rx="4" />
        <path d="M14 30h92v10H14z" />
        <path d="M60 30v60" />
        <path d="M60 30c-6-8-20-14-24-8s6 8 24 8zM60 30c6-8 20-14 24-8s-6 8-24 8z" />
      </g>
    </svg>
  );
}

function Foto({ regalo }: { regalo: Regalo }) {
  const [i, setI] = useState(0);
  const fotos = regalo.fotos ?? [];

  if (fotos.length === 0) return null;

  return (
    <div className="relative">
      <div
        className="flex aspect-[5/4] items-center justify-center overflow-hidden rounded-xl p-1.5 ring-1 ring-[var(--borde)]"
        style={{ backgroundColor: "#fffdf8" }}
      >
        <img
          src={fotos[i]}
          alt={regalo.nombre}
          loading="lazy"
          className="max-h-full max-w-full object-contain"
        />
      </div>
      {fotos.length > 1 && (
        <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5">
          {fotos.map((f, j) => (
            <button
              key={f}
              type="button"
              onClick={() => setI(j)}
              aria-label={`Foto ${j + 1} de ${regalo.nombre}`}
              aria-pressed={j === i}
              className={`h-2 w-2 rounded-full ring-1 ring-black/25 transition-all ${
                j === i ? "scale-110 bg-[var(--gold)]" : "bg-black/20 hover:bg-black/35"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function ListaDeseos() {
  const [tomados, setTomados] = useState<Tomados>({});
  const [sinBase, setSinBase] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [enVuelo, setEnVuelo] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  // Quién marca. Se recuerda entre visitas y, si es la primera, se hereda del
  // nombre con que firmó su carta (que es la misma persona).
  const [nombre, setNombre] = useState("");
  const [pideNombre, setPideNombre] = useState(false);
  const nombreRef = useRef<HTMLInputElement>(null);

  const [cat, setCat] = useState<string>("todo");
  const [pres, setPres] = useState<Presupuesto | "todo">("todo");
  const [soloLibres, setSoloLibres] = useState(false);

  const yo = nombre.trim().slice(0, 40);

  useEffect(() => {
    try {
      const guardado = localStorage.getItem(CLAVE_NOMBRE);
      if (guardado) {
        setNombre(guardado);
        return;
      }
      // Sin nombre propio: el del borrador de la carta sirve igual.
      const raw = localStorage.getItem(CLAVE_BORRADOR);
      if (raw) {
        const d = JSON.parse(raw);
        if (typeof d.authorName === "string" && d.authorName.trim()) setNombre(d.authorName);
      }
    } catch {
      // sin almacenamiento: se escribe el nombre a mano cada vez
    }
  }, []);

  useEffect(() => {
    if (!nombre.trim()) return;
    try {
      localStorage.setItem(CLAVE_NOMBRE, nombre.trim());
    } catch {
      /* noop */
    }
  }, [nombre]);

  const cargar = useCallback(async () => {
    try {
      const res = await fetch("/api/regalos", { cache: "no-store" });
      const data = await res.json();
      setTomados(indexar(data.tomados ?? []));
      setSinBase(Boolean(data.sinBase));
    } catch {
      setSinBase(true);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  // Otra persona puede estar apuntándose ahora mismo desde su casa: al volver a
  // la pestaña se relee, que es cuando importa ver lo de los demás.
  useEffect(() => {
    const refrescar = () => {
      if (document.visibilityState === "visible") void cargar();
    };
    window.addEventListener("focus", refrescar);
    document.addEventListener("visibilitychange", refrescar);
    return () => {
      window.removeEventListener("focus", refrescar);
      document.removeEventListener("visibilitychange", refrescar);
    };
  }, [cargar]);

  const esMio = useCallback(
    (quien: string) => Boolean(yo) && sinTildes(quien) === sinTildes(yo),
    [yo],
  );

  async function alternar(regalo: Regalo) {
    const firma = yo.trim();
    if (firma.length < 2) {
      setPideNombre(true);
      nombreRef.current?.focus();
      nombreRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const actual = tomados[regalo.id];
    if (actual && !esMio(actual.quien)) return; // de otra persona: no se toca

    const soltar = Boolean(actual);
    setError(null);
    setAviso(null);
    setEnVuelo((p) => new Set(p).add(regalo.id));

    // Optimista: el check responde al toque y se corrige con lo que diga el
    // servidor (que además trae lo que hayan hecho los demás).
    setTomados((p) => {
      const copia = { ...p };
      if (soltar) delete copia[regalo.id];
      else copia[regalo.id] = { quien: firma, tomadoEn: Date.now() };
      return copia;
    });

    try {
      const res = await fetch("/api/regalos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          regaloId: regalo.id,
          quien: firma,
          accion: soltar ? "soltar" : "tomar",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "No se pudo guardar.");
        await cargar();
      } else {
        setTomados(indexar(data.tomados ?? []));
        if (data.ajeno) {
          setAviso(
            soltar
              ? "Eso lo apartó otra persona, así que se queda como está."
              : "Alguien se te adelantó por un pelo con ese regalo.",
          );
        }
      }
    } catch {
      setError("Sin conexión: no se pudo guardar tu marca.");
      await cargar();
    } finally {
      setEnVuelo((p) => {
        const copia = new Set(p);
        copia.delete(regalo.id);
        return copia;
      });
    }
  }

  const visibles = useMemo(
    () =>
      CATEGORIAS_REGALOS.map((c) => ({
        ...c,
        items: c.items.filter(
          (r) =>
            (cat === "todo" || cat === c.id) &&
            (pres === "todo" || r.presupuesto === pres) &&
            (!soloLibres || !tomados[r.id]),
        ),
      })).filter((c) => c.items.length > 0),
    [cat, pres, soloLibres, tomados],
  );

  const apartados = Object.keys(tomados).length;

  const chipActivo =
    "border-[var(--gold)] bg-[var(--gold)]/12 text-[var(--gold)] shadow-[0_0_20px_-6px_var(--halo-oro)]";
  const chipInactivo =
    "border-[var(--borde)] bg-[var(--cristal)] text-[var(--ink)] backdrop-blur-[4px] hover:border-[var(--borde-vivo)]";

  return (
    <section className="sketch-card sketch-card--v3 p-5 sm:p-7" id="regalos">
      {/* El título y la explicación los pone la página: aquí empieza la lista.
          Tampoco hay ya botón de cerrar — en su propia página, cerrar la lista
          es salirse de ella. */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Quién firma las marcas */}
        <div
          className={`flex flex-wrap items-center gap-3 rounded-2xl border-[1.5px] p-3.5 backdrop-blur-[4px] transition-colors ${
            pideNombre && yo.trim().length < 2
              ? "border-[var(--rose)]/60 bg-[var(--rose)]/10"
              : "border-[var(--borde)] bg-[var(--cristal)]"
          }`}
        >
          <label className="flex flex-1 flex-col gap-1.5">
            <Rotulo>Marcas como</Rotulo>
            <input
              ref={nombreRef}
              value={nombre}
              onChange={(e) => {
                setNombre(e.target.value);
                setPideNombre(false);
              }}
              placeholder="Tu nombre"
              maxLength={40}
              className="w-full max-w-xs rounded-xl border-[1.5px] border-[var(--borde)] bg-[var(--cristal)] px-3.5 py-2 text-sm text-[var(--ink)] outline-none transition-colors placeholder:text-[var(--ink-tenue)] focus:border-[var(--borde-vivo)]"
            />
          </label>
          <p className="flex-1 text-xs italic text-[var(--ink-tenue)]">
            {yo.trim().length >= 2
              ? `Lo que marques aparecerá como “lo regala ${yo.trim()}”.`
              : "Escribe tu nombre para poder marcar lo que vas a regalar."}
          </p>
        </div>

        {/* Filtros */}
        <div className="mt-4 flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Rotulo className="mr-1">Qué</Rotulo>
            {[{ id: "todo", titulo: "Todo" }, ...CATEGORIAS_REGALOS].map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCat(c.id)}
                aria-pressed={cat === c.id}
                className={`rounded-full border-[1.5px] px-3 py-1.5 text-xs transition-all ${
                  cat === c.id ? chipActivo : chipInactivo
                }`}
              >
                {c.titulo}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Rotulo className="mr-1">Cuánto</Rotulo>
            {[{ id: "todo" as const, label: "Cualquiera", pista: "" }, ...PRESUPUESTOS].map(
              (p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPres(p.id as Presupuesto | "todo")}
                  aria-pressed={pres === p.id}
                  title={p.pista || undefined}
                  className={`rounded-full border-[1.5px] px-3 py-1.5 text-xs transition-all ${
                    pres === p.id ? chipActivo : chipInactivo
                  }`}
                >
                  {p.label}
                  {p.pista && (
                    <span className="ml-1.5 opacity-60">{p.pista}</span>
                  )}
                </button>
              ),
            )}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setSoloLibres((v) => !v)}
              aria-pressed={soloLibres}
              className={`rounded-full border-[1.5px] px-3 py-1.5 text-xs transition-all ${
                soloLibres ? chipActivo : chipInactivo
              }`}
            >
              {soloLibres ? "✓ " : ""}Esconder lo que ya tiene dueño
            </button>
            <p className="text-xs italic text-[var(--ink-tenue)]">
              {cargando
                ? "Viendo qué hay tomado…"
                : sinBase
                  ? "Las marcas no están disponibles ahora mismo."
                  : apartados === 0
                    ? "Todavía nadie ha apartado nada."
                    : `${apartados} de ${REGALOS.length} ya tienen quién los regale.`}
            </p>
          </div>
        </div>

        {(error || aviso) && (
          <p
            className={`mt-4 rounded-xl border-[1.5px] px-4 py-2.5 text-sm ${
              error
                ? "border-[var(--rose)]/50 bg-[var(--rose)]/10 text-[var(--rose)]"
                : "border-[var(--borde)] bg-[var(--cristal)] text-[var(--ink)]"
            }`}
          >
            {error ?? aviso}
          </p>
        )}

        {/* Las cosas */}
        {visibles.length === 0 ? (
          <p className="mt-8 text-center text-sm italic text-[var(--ink-tenue)]">
            Con esos filtros no queda nada. Prueba a soltar alguno.
          </p>
        ) : (
          visibles.map((c) => (
            <div key={c.id} className="mt-8">
              <h3 className="text-xl text-[var(--gold)]">{c.titulo}</h3>
              <p className="mt-1 text-xs italic text-[var(--ink-tenue)]">{c.resumen}</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {c.items.map((r) => {
                  const tomado = tomados[r.id];
                  const mio = tomado ? esMio(tomado.quien) : false;
                  const ajeno = Boolean(tomado) && !mio;
                  const ocupado = enVuelo.has(r.id);
                  const enlace = enlaceRegalo(r);
                  const precio = precioLegible(r);
                  const banda = PRESUPUESTOS.find((p) => p.id === r.presupuesto);

                  return (
                    <article
                      key={r.id}
                      className={`relative flex flex-col gap-3 rounded-2xl border-[1.5px] p-3.5 backdrop-blur-[4px] transition-all ${
                        mio
                          ? "border-[var(--gold)] bg-[var(--gold)]/[0.07]"
                          : "border-[var(--borde)] bg-[var(--cristal)]"
                      } ${ajeno ? "opacity-60" : ""}`}
                    >
                      <Foto regalo={r} />

                      <div className="flex flex-1 flex-col gap-1.5">
                        <h4 className="pr-12 text-lg leading-tight text-[var(--ink)]">
                          {r.nombre}
                        </h4>
                        {!r.fotos?.length && (
                          <span className="absolute right-3 top-3">
                            <PaqueteDibujado />
                          </span>
                        )}
                        {r.marca && (
                          <p className="text-xs uppercase tracking-[0.14em] text-[var(--ink-tenue)]">
                            {r.marca}
                          </p>
                        )}
                        <p className="text-sm leading-relaxed text-[var(--ink)]/80">
                          {r.detalle}
                        </p>
                        {r.aviso && (
                          <p className="mt-0.5 text-xs italic leading-relaxed text-[var(--ink-calida)]/85">
                            ⚠ {r.aviso}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {precio && (
                          <span className="rounded-full border border-[var(--borde)] px-2.5 py-1 text-xs text-[var(--ink)]">
                            {precio}
                          </span>
                        )}
                        {banda && (
                          <span className="text-xs italic text-[var(--ink-tenue)]">
                            {banda.label}
                          </span>
                        )}
                        {/* Lo que se consigue hoy va encendido; lo que hay que
                            esperar, apagado. El cumpleaños es el que manda. */}
                        {r.plazo && (
                          <span
                            className={`ml-auto text-xs italic ${
                              r.plazo === "hoy"
                                ? "text-[var(--ink-calida)]"
                                : "text-[var(--ink-tenue)]"
                            }`}
                          >
                            {PLAZOS[r.plazo]}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {enlace && (
                          <a
                            href={enlace}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 rounded-full border-[1.5px] border-[var(--borde)] bg-[var(--cristal)] px-3 py-2 text-center text-xs text-[var(--ink)] transition-colors hover:border-[var(--borde-vivo)] hover:text-[var(--gold)]"
                          >
                            {r.url ? `Ver en ${r.tienda ?? "la tienda"}` : "Buscarlo"} ↗
                          </a>
                        )}
                        {!enlace && r.tienda && (
                          <span className="flex-1 px-1 py-2 text-center text-xs italic text-[var(--ink-tenue)]">
                            En {r.tienda}
                          </span>
                        )}
                      </div>

                      {/* El check compartido */}
                      <button
                        type="button"
                        onClick={() => alternar(r)}
                        disabled={ajeno || ocupado || sinBase}
                        aria-pressed={Boolean(tomado)}
                        className={`flex items-center justify-center gap-2 rounded-full border-[1.5px] px-3 py-2 text-xs transition-all ${
                          mio
                            ? "border-[var(--gold)] bg-[var(--gold)]/15 text-[var(--gold)]"
                            : ajeno
                              ? "cursor-default border-[var(--borde)] text-[var(--ink-tenue)]"
                              : "border-[var(--borde)] text-[var(--ink)] hover:border-[var(--borde-vivo)] hover:text-[var(--gold)]"
                        } ${ocupado ? "opacity-50" : ""}`}
                      >
                        <span
                          aria-hidden
                          className={`flex h-4 w-4 items-center justify-center rounded-[4px] border ${
                            tomado
                              ? "border-[var(--gold)] bg-[var(--gold)]/25 text-[var(--gold)]"
                              : "border-[var(--borde)]"
                          }`}
                        >
                          {tomado ? "✓" : ""}
                        </span>
                        {mio
                          ? "Lo regalas tú — soltar"
                          : ajeno
                            ? `Lo regala ${tomado!.quien}`
                            : "Esto lo regalo yo"}
                      </button>
                    </article>
                  );
                })}
              </div>
            </div>
          ))
        )}

        {/* Despacho */}
        <div className="mt-8 flex flex-col gap-2 rounded-2xl border-[1.5px] border-dashed border-[var(--borde)] p-4">
          <Rotulo>Si lo mandas por encomienda</Rotulo>
          {NOTAS_ENVIO.map((n) => (
            <p key={n.tienda} className="text-xs leading-relaxed text-[var(--ink)]/75">
              <span className="text-[var(--ink-calida)]">{n.tienda}:</span> {n.texto}
            </p>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
