import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { getSessionSecret } from "./secrets";
import { SESSION_COOKIE } from "./constants";

export { SESSION_COOKIE };
const MAX_AGE = 60 * 60 * 24 * 30; // 30 días (uso personal)

/** Firma un token de sesión. Al ser un solo usuario, el payload es mínimo. */
export async function createSessionToken(): Promise<string> {
  return new SignJWT({ role: "editor" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(getSessionSecret());
}

export async function verifySessionToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, getSessionSecret());
    return true;
  } catch {
    return false;
  }
}

/** Setea la cookie de sesión (llamar tras validar la contraseña). */
export async function startSession() {
  const token = await createSessionToken();
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function endSession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function isAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  return verifySessionToken(token);
}

/** Usar al inicio de cada server action / layout protegido. Redirige a /login si no hay sesión. */
export async function requireAuth() {
  if (!(await isAuthenticated())) {
    redirect("/login");
  }
}
