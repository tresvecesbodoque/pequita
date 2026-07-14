import "server-only";
import { cookies } from "next/headers";
import { SITE } from "@/lib/site";

// Acceso con clave (suave) al álbum sorpresa. No es seguridad fuerte: solo evita
// que se descubra antes de tiempo. La clave sale de ALBUM_CODE (env) o de
// SITE.albumCode. Si está vacía, el álbum es abierto.

export const ALBUM_COOKIE = "pequita_album";

export function getAlbumCode(): string {
  return (process.env.ALBUM_CODE ?? SITE.albumCode ?? "").trim();
}

function tokenFor(code: string): string {
  // Marcador para la cookie; cambiar la clave invalida las cookies viejas.
  return Buffer.from(`pequita:${code}`).toString("base64url");
}

export async function isAlbumUnlocked(): Promise<boolean> {
  const code = getAlbumCode();
  if (!code) return true; // sin clave configurada → álbum abierto
  const jar = await cookies();
  return jar.get(ALBUM_COOKIE)?.value === tokenFor(code);
}

export async function setAlbumUnlocked(): Promise<void> {
  const jar = await cookies();
  jar.set(ALBUM_COOKIE, tokenFor(getAlbumCode()), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 120, // ~4 meses
  });
}
