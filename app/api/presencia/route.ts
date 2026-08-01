import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Presencia — el lugar común de los dos sitios.
//
// El contador (otro dominio, estático, sin servidor propio) no puede saber si
// alguien más está mirando la misma página. Aquí deja su latido y pregunta por
// el del otro; con eso enciende su luz. La respuesta trae también la hora del
// servidor, para que el navegador mida "hace cuánto" sin fiarse de su reloj.

const QUIENES = ["zorro", "rosa"] as const;
type Quien = (typeof QUIENES)[number];

const OTRO: Record<Quien, Quien> = { zorro: "rosa", rosa: "zorro" };

// Solo responde a los sitios de casa. En desarrollo, a cualquier localhost.
const CASAS = ["https://misiete.vercel.app", "https://dossieteshastaelsiete.vercel.app"];
const LOCAL = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

function cabeceras(origen: string | null) {
  const permitido = origen && (CASAS.includes(origen) || LOCAL.test(origen)) ? origen : CASAS[0];
  return {
    "Access-Control-Allow-Origin": permitido,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
    "Cache-Control": "no-store",
  };
}

export async function OPTIONS(request: Request) {
  return new Response(null, { status: 204, headers: cabeceras(request.headers.get("origin")) });
}

export async function POST(request: Request) {
  const headers = cabeceras(request.headers.get("origin"));

  let quien = "";
  try {
    const cuerpo = (await request.json()) as { quien?: unknown };
    quien = String(cuerpo?.quien ?? "");
  } catch {
    quien = "";
  }

  if (!(QUIENES as readonly string[]).includes(quien)) {
    return NextResponse.json({ error: "¿quién?" }, { status: 400, headers });
  }

  const ahora = new Date();

  try {
    await prisma.presencia.upsert({
      where: { quien },
      create: { quien, vistoEn: ahora },
      update: { vistoEn: ahora },
    });
    const otro = await prisma.presencia.findUnique({
      where: { quien: OTRO[quien as Quien] },
    });
    return NextResponse.json(
      { ahora: ahora.getTime(), otro: otro ? otro.vistoEn.getTime() : null },
      { headers },
    );
  } catch {
    // Si la base no contesta (o la tabla aún no existe en producción), el
    // contador no debe enterarse: se queda sin luz, que es su estado normal.
    return NextResponse.json({ ahora: ahora.getTime(), otro: null }, { headers });
  }
}
