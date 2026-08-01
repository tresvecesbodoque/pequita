import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cabecerasCasa, esQuien } from "@/lib/corsCasa";

// Frasco — el mismo frasco desde cualquier aparato marcado.
//
// La regla del frasco es que NADA PUEDE ENCOGER: es lo único que ella va
// acumulando y perderlo no tiene arreglo. Por eso aquí no se guarda "lo
// último que llegó", se FUNDE: las listas se unen sin repetir y de lo que
// solo crece se queda lo más grande. Como la fusión nunca resta, da igual el
// orden en que lleguen dos aparatos y da igual que uno estuviera sin red:
// acaban en el mismo sitio.
//
// De ahí sale la garantía en la que se apoya el cliente: lo que devuelve esta
// respuesta SIEMPRE incluye lo que acaba de mandar, así que puede guardarla
// tal cual sin miedo a perder nada suyo.

const LIMITES = { texto: 400, coleccion: 200, dias: 400, cartas: 200, registro: 300, cuerpo: 128 * 1024 };

type Frasco = {
  coleccion?: string[];
  dias?: string[];
  cartas?: string[];
  registro?: { id?: unknown; cuando?: unknown }[];
  versos?: number;
  visitas?: number;
  racha?: number;
  creado?: number;
  juego?: { record?: number; total?: number; partidas?: number };
};

const textos = (x: unknown, tope: number) =>
  Array.isArray(x)
    ? x.filter((t): t is string => typeof t === "string" && t.length <= LIMITES.texto).slice(-tope)
    : [];

const numero = (x: unknown) => (typeof x === "number" && isFinite(x) && x >= 0 ? x : 0);

// Unión sin repetidos, conservando el orden de llegada (el viejo manda).
function unir(viejo: string[], nuevo: string[], tope: number) {
  const fuera = viejo.slice();
  for (const x of nuevo) if (fuera.indexOf(x) < 0) fuera.push(x);
  return fuera.slice(-tope);
}

function limpiar(x: unknown): Frasco {
  const f = (x ?? {}) as Frasco;
  const registro = Array.isArray(f.registro)
    ? f.registro
        .filter((r) => r && typeof r.id === "string" && typeof r.cuando === "number")
        .slice(-LIMITES.registro)
    : [];
  return {
    coleccion: textos(f.coleccion, LIMITES.coleccion),
    dias: textos(f.dias, LIMITES.dias),
    cartas: textos(f.cartas, LIMITES.cartas),
    registro,
    versos: numero(f.versos),
    visitas: numero(f.visitas),
    racha: numero(f.racha),
    creado: numero(f.creado),
    juego: {
      record: numero(f.juego?.record),
      total: numero(f.juego?.total),
      partidas: numero(f.juego?.partidas),
    },
  };
}

function fundir(viejo: Frasco, nuevo: Frasco): Frasco {
  // El registro se une por (qué pasó + cuándo), que es lo que lo hace único.
  const vistos = new Set<string>();
  const registro = [...(viejo.registro ?? []), ...(nuevo.registro ?? [])]
    .filter((r) => {
      const llave = `${r.id}@${r.cuando}`;
      if (vistos.has(llave)) return false;
      vistos.add(llave);
      return true;
    })
    .sort((a, b) => Number(a.cuando) - Number(b.cuando))
    .slice(-LIMITES.registro);

  const creados = [viejo.creado ?? 0, nuevo.creado ?? 0].filter((c) => c > 0);

  return {
    coleccion: unir(viejo.coleccion ?? [], nuevo.coleccion ?? [], LIMITES.coleccion),
    dias: unir(viejo.dias ?? [], nuevo.dias ?? [], LIMITES.dias),
    cartas: unir(viejo.cartas ?? [], nuevo.cartas ?? [], LIMITES.cartas),
    registro,
    versos: Math.max(viejo.versos ?? 0, nuevo.versos ?? 0),
    visitas: Math.max(viejo.visitas ?? 0, nuevo.visitas ?? 0),
    racha: Math.max(viejo.racha ?? 0, nuevo.racha ?? 0),
    // El frasco se abrió una vez: vale la fecha más antigua de las dos.
    creado: creados.length ? Math.min(...creados) : 0,
    juego: {
      record: Math.max(viejo.juego?.record ?? 0, nuevo.juego?.record ?? 0),
      total: Math.max(viejo.juego?.total ?? 0, nuevo.juego?.total ?? 0),
      partidas: Math.max(viejo.juego?.partidas ?? 0, nuevo.juego?.partidas ?? 0),
    },
  };
}

export async function OPTIONS(request: Request) {
  return new Response(null, { status: 204, headers: cabecerasCasa(request.headers.get("origin")) });
}

export async function POST(request: Request) {
  const headers = cabecerasCasa(request.headers.get("origin"));

  const crudo = await request.text();
  if (crudo.length > LIMITES.cuerpo) {
    return NextResponse.json({ error: "demasiado" }, { status: 413, headers });
  }

  let cuerpo: { quien?: unknown; frasco?: unknown };
  try {
    cuerpo = JSON.parse(crudo || "{}");
  } catch {
    return NextResponse.json({ error: "ilegible" }, { status: 400, headers });
  }
  if (!esQuien(cuerpo.quien)) {
    return NextResponse.json({ error: "¿quién?" }, { status: 400, headers });
  }

  const quien = cuerpo.quien;
  const mio = limpiar(cuerpo.frasco);

  try {
    const guardado = await prisma.frasco.findUnique({ where: { quien } });
    let previo: Frasco = {};
    if (guardado) {
      try {
        previo = limpiar(JSON.parse(guardado.datos));
      } catch {
        previo = {};
      }
    }
    const fundido = fundir(previo, mio);
    const datos = JSON.stringify(fundido);
    await prisma.frasco.upsert({
      where: { quien },
      create: { quien, datos },
      update: { datos, actualizado: new Date() },
    });
    return NextResponse.json({ frasco: fundido }, { headers });
  } catch {
    // Sin base no se inventa nada: se devuelve lo que llegó, para que el
    // aparato se quede exactamente como estaba.
    return NextResponse.json({ frasco: mio, sinGuardar: true }, { headers });
  }
}
