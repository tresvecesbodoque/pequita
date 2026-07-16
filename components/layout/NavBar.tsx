"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

// Barra mínima de navegación: Inicio + Volver, presente en cada apartado.
// `claro` la adapta a fondos oscuros (cielo nocturno).

export function NavBar({ claro = false }: { claro?: boolean }) {
  const router = useRouter();
  const base =
    "flex items-center gap-1.5 rounded-full border-2 px-3.5 py-1.5 text-xs font-medium backdrop-blur transition-all hover:-translate-y-0.5";
  const estilo = claro
    ? `${base} border-[var(--night-ink)]/30 bg-white/10 text-[var(--night-ink)] hover:border-[var(--gold)]/70`
    : `${base} border-[var(--foreground)]/50 bg-[var(--surface)]/80 text-[var(--foreground)] shadow-[2px_3px_0_rgba(124,27,34,0.2)] hover:border-[var(--accent)]`;

  return (
    <nav className="pointer-events-none fixed left-3 top-3 z-50 flex gap-2 sm:left-5 sm:top-5">
      <button type="button" onClick={() => router.back()} className={`${estilo} pointer-events-auto`}>
        ← Volver
      </button>
      <Link href="/" className={`${estilo} pointer-events-auto`}>
        ⌂ Inicio
      </Link>
    </nav>
  );
}
