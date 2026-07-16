import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `Pequita — ${SITE.inviteTitle}`,
  description: SITE.inviteSubtitle,
};

// Portada maximalista en clave bosquejo + cartoon 40s (ver DESIGN.md):
// cartel de feria, garabatos, estrellas y abundancia con jerarquía.
export default function Home() {
  return (
    <main className="maximal-tile min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-4 py-12 text-center">
        <div className="sketch-card sketch-card--gira relative w-full px-6 py-12 sm:px-14">
          {/* esquinas garabateadas */}
          <CornerDoodle className="absolute left-3 top-3 h-8 w-8" />
          <CornerDoodle className="absolute right-3 top-3 h-8 w-8 -scale-x-100" />
          <CornerDoodle className="absolute bottom-3 left-3 h-8 w-8 -scale-y-100" />
          <CornerDoodle className="absolute bottom-3 right-3 h-8 w-8 -scale-100" />

          {/* estrella fugaz garabateada */}
          <svg viewBox="0 0 160 44" className="mx-auto h-11 w-40" aria-hidden>
            <path
              d="M6 38 C30 30 52 18 76 16 C58 24 44 30 30 40 C60 30 92 18 120 12"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <path
              d="M136 6l2.6 6.2 6.2 2.6-6.2 2.6-2.6 6.2-2.6-6.2-6.2-2.6 6.2-2.6z"
              fill="var(--gold)"
              stroke="var(--foreground)"
              strokeWidth="1.4"
            />
          </svg>

          <span
            className="mt-4 block text-sm uppercase tracking-[0.5em] text-[var(--accent)]"
            style={{ fontFamily: "var(--font-deco)" }}
          >
            para
          </span>
          <p
            className="doodle-underline mx-auto mt-1 w-fit text-6xl text-[var(--accent)] sm:text-7xl"
            style={{ fontFamily: "var(--font-sketch)" }}
          >
            {SITE.recipientName}
          </p>
          <h1 className="mt-6 text-3xl sm:text-4xl">{SITE.inviteTitle}</h1>
          <p className="mx-auto mt-4 max-w-md leading-relaxed text-[var(--muted)]">
            {SITE.inviteSubtitle}
          </p>

          <div className="mt-9">
            <Link href="/escribir">
              <Button className="px-9 py-4 text-base">Escribir mi carta ✍</Button>
            </Link>
          </div>

          {/* divisor ornamental */}
          <div className="mx-auto mt-10 flex max-w-xs items-center gap-3">
            <div className="hairline flex-1" />
            <Estrellita />
            <Estrellita grande />
            <Estrellita />
            <div className="hairline flex-1" />
          </div>

          {/* Hub: todos los caminos salen de aquí */}
          <div className="mx-auto mt-7 grid max-w-md gap-3 sm:grid-cols-3">
            <HubCard href="/saber-mas" emoji="📖" titulo="Saber más" nota="¿Qué es este regalo?" />
            <HubCard href="/para-ella" emoji="🌙" titulo="El álbum" nota="El cielo de Isidora" />
            <HubCard href="/editor" emoji="🗝" titulo="El taller" nota="Solo con llave" />
          </div>
        </div>
      </div>
    </main>
  );
}

function HubCard({
  href,
  emoji,
  titulo,
  nota,
}: {
  href: string;
  emoji: string;
  titulo: string;
  nota: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border-2 border-[var(--foreground)]/60 bg-[var(--surface)] px-4 py-3.5 text-center shadow-[3px_4px_0_rgba(124,27,34,0.25)] transition-all hover:-translate-y-0.5 hover:border-[var(--accent)]"
    >
      <span className="text-xl" aria-hidden>
        {emoji}
      </span>
      <p className="mt-1 text-sm font-semibold text-[var(--foreground)] group-hover:text-[var(--accent)]">
        {titulo}
      </p>
      <p className="text-[0.68rem] text-[var(--muted)]">{nota}</p>
    </Link>
  );
}

function Estrellita({ grande = false }: { grande?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={grande ? "h-5 w-5" : "h-3.5 w-3.5"} aria-hidden>
      <path
        d="M12 3l2.2 5.4 5.8.5-4.4 3.8 1.3 5.7L12 15.9l-4.9 2.5 1.3-5.7L4 8.9l5.8-.5z"
        fill="var(--gold)"
        stroke="var(--foreground)"
        strokeWidth="1.2"
      />
    </svg>
  );
}

function CornerDoodle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <path
        d="M4 36 C6 18 18 6 36 4 M10 36 C12 24 24 12 36 10"
        fill="none"
        stroke="var(--accent)"
        strokeOpacity="0.5"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
