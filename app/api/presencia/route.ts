import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cabecerasCasa, esQuien, OTRO, type Quien } from "@/lib/corsCasa";

// Presencia — el lugar común de los dos sitios.
//
// El contador (otro dominio, estático, sin servidor propio) no puede saber si
// alguien más está mirando la misma página. Aquí deja su latido y pregunta por
// el del otro; con eso enciende su luz. La respuesta trae también la hora del
// servidor, para que el navegador mida "hace cuánto" sin fiarse de su reloj.

export async function OPTIONS(request: Request) {
  return new Response(null, { status: 204, headers: cabecerasCasa(request.headers.get("origin")) });
}

export async function POST(request: Request) {
  const headers = cabecerasCasa(request.headers.get("origin"));

  let quien: unknown = "";
  try {
    quien = ((await request.json()) as { quien?: unknown })?.quien;
  } catch {
    quien = "";
  }

  if (!esQuien(quien)) {
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
