import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { IDS_REGALOS } from "@/lib/regalos";

// Lista de deseos — el tablero compartido de quién regala qué.
//
// La página /escribir es pública (cualquier familiar con el enlace entra), así
// que aquí no hay sesión: la única llave es el nombre que cada uno escribe. Es
// a propósito — esto no guarda nada delicado, solo evita que dos personas le
// compren lo mismo. Quien apartó algo es el único que puede soltarlo.
//
// El catálogo vive en `lib/regalos.ts`; la tabla solo tiene las filas de lo
// apartado. Sin fila = libre.

const MAX_NOMBRE = 40;

/** Rate-limit suave por instancia, igual que en el envío de cartas. */
const golpes: number[] = [];
function demasiado(): boolean {
  const ahora = Date.now();
  while (golpes.length && ahora - golpes[0] > 60_000) golpes.shift();
  if (golpes.length >= 40) return true;
  golpes.push(ahora);
  return false;
}

function limpiarNombre(valor: unknown): string | null {
  if (typeof valor !== "string") return null;
  const nombre = valor
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_NOMBRE);
  return nombre.length >= 2 ? nombre : null;
}

/** Dos nombres son la misma persona si coinciden sin tildes ni mayúsculas. */
function mismaPersona(a: string, b: string): boolean {
  const plano = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  return plano(a) === plano(b);
}

type Fila = { regaloId: string; quien: string; tomadoEn: Date };

function comoJson(tomados: Fila[], extra: Record<string, unknown> = {}) {
  return NextResponse.json({
    tomados: tomados.map((t) => ({
      regaloId: t.regaloId,
      quien: t.quien,
      tomadoEn: t.tomadoEn.getTime(),
    })),
    ...extra,
  });
}

async function listar(): Promise<Fila[]> {
  return prisma.regaloTomado.findMany({ orderBy: { tomadoEn: "asc" } });
}

export async function GET() {
  try {
    return comoJson(await listar());
  } catch {
    // Si la tabla aún no existe en producción, la lista se ve igual: solo se
    // queda sin los "check". Mejor eso que una página rota.
    return comoJson([], { sinBase: true });
  }
}

export async function POST(request: Request) {
  if (demasiado()) {
    return NextResponse.json({ error: "Demasiadas veces seguidas." }, { status: 429 });
  }

  let cuerpo: { regaloId?: unknown; quien?: unknown; accion?: unknown };
  try {
    cuerpo = (await request.json()) as typeof cuerpo;
  } catch {
    return NextResponse.json({ error: "Nada que leer." }, { status: 400 });
  }

  const regaloId = typeof cuerpo.regaloId === "string" ? cuerpo.regaloId : "";
  if (!IDS_REGALOS.has(regaloId)) {
    return NextResponse.json({ error: "Ese regalo no está en la lista." }, { status: 400 });
  }

  const quien = limpiarNombre(cuerpo.quien);
  if (!quien) {
    return NextResponse.json({ error: "Escribe tu nombre primero." }, { status: 400 });
  }

  const soltar = cuerpo.accion === "soltar";

  try {
    const actual = await prisma.regaloTomado.findUnique({ where: { regaloId } });

    if (soltar) {
      // Solo lo suelta quien lo apartó: nadie borra el compromiso de otro.
      if (actual && !mismaPersona(actual.quien, quien)) {
        return comoJson(await listar(), { ajeno: true });
      }
      if (actual) await prisma.regaloTomado.delete({ where: { regaloId } });
      return comoJson(await listar());
    }

    if (actual) {
      // Ya estaba: si es de otro, se avisa (dos personas a la vez); si es suyo,
      // no pasa nada y el "check" se queda como está.
      return comoJson(await listar(), {
        ajeno: !mismaPersona(actual.quien, quien),
      });
    }

    await prisma.regaloTomado.create({ data: { regaloId, quien } });
    return comoJson(await listar());
  } catch {
    return NextResponse.json(
      { error: "No se pudo guardar. Inténtalo de nuevo en un momento." },
      { status: 500 },
    );
  }
}
