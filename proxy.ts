import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/constants";

// Proxy (lo que en Next < 16 se llamaba "middleware"). Corre en el edge runtime
// (sin acceso a fs), así que aquí solo hacemos un gate barato: si no hay cookie
// de sesión, redirige a /login. La verificación criptográfica real (jose contra
// el secreto) ocurre en el layout del editor y en cada server action mediante
// requireAuth().
export function proxy(request: NextRequest) {
  const hasCookie = request.cookies.has(SESSION_COOKIE);
  if (!hasCookie) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/editor/:path*"],
};
