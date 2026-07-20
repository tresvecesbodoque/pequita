import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { NavBar } from "@/components/layout/NavBar";

// 404 en el mismo mundo que el resto del sitio: papel maximalista, tarjeta
// bosquejo y caminos útiles. (Un familiar con un enlace roto NO debe acabar
// en el taller con clave: se le ofrece el inicio y el álbum.)
export default function NotFound() {
  return (
    <main className="maximal-tile flex min-h-screen flex-col items-center justify-center px-4 py-10 text-center">
      <NavBar />
      <div className="sketch-card sketch-card--gira max-w-lg p-8 sm:p-10">
        {/* estrella fugaz que se perdió del cielo */}
        <svg viewBox="0 0 160 44" className="mx-auto h-11 w-40" aria-hidden>
          <path
            d="M154 38 C130 30 108 18 84 16 C102 24 116 30 130 40 C100 30 68 18 40 12"
            fill="none"
            stroke="var(--accent)"
            strokeOpacity="0.6"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeDasharray="6 7"
          />
          <path
            d="M24 6l2.6 6.2 6.2 2.6-6.2 2.6-2.6 6.2-2.6-6.2-6.2-2.6 6.2-2.6z"
            fill="var(--gold)"
            stroke="var(--foreground)"
            strokeWidth="1.4"
          />
        </svg>

        <h1 className="mt-4 text-3xl">Aquí no hay ninguna carta</h1>
        <p className="mx-auto mt-3 max-w-sm leading-relaxed text-[var(--muted)]">
          Puede que el enlace sea incorrecto o que la carta ya no esté
          disponible. Pero el cielo sigue en su sitio.
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link href="/">
            <Button>Volver al inicio</Button>
          </Link>
          <Link href="/para-ella">
            <Button variant="outline">Ver el álbum 🌙</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
