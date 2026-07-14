import { NextResponse } from "next/server";
import { getPasswordHash, hasPassword } from "@/lib/auth/secrets";
import { verifyPassword } from "@/lib/auth/password";
import { startSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  const { password } = (await request.json().catch(() => ({}))) as {
    password?: string;
  };

  if (!password) {
    return NextResponse.json({ error: "Falta la contraseña." }, { status: 400 });
  }

  if (!hasPassword()) {
    return NextResponse.json(
      {
        error:
          "No hay contraseña configurada todavía. Ejecuta: npm run set-password -- \"tuClave\"",
      },
      { status: 409 }
    );
  }

  const hash = getPasswordHash()!;
  const ok = await verifyPassword(password, hash);

  if (!ok) {
    return NextResponse.json({ error: "Contraseña incorrecta." }, { status: 401 });
  }

  await startSession();
  return NextResponse.json({ ok: true });
}
