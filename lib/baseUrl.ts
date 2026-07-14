import "server-only";
import { headers } from "next/headers";

// Deriva la URL base del request entrante. Así los links y QR funcionan tanto
// en localhost como accediendo por la IP de la red (ej. desde el celular),
// sin depender de una variable de entorno.
export async function getBaseUrl(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  if (host) return `${proto}://${host}`;
  return process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
}
