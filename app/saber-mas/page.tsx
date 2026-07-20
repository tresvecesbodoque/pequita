import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { CornerDoodle } from "@/components/ui/CornerDoodle";
import { NavBar } from "@/components/layout/NavBar";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Saber más — ¿Qué es este regalo?",
  description: `Cómo funciona el álbum sorpresa de ${SITE.recipientName}.`,
};

// Explica el regalo a los familiares, con el tono del Principito.
export default function SaberMasPage() {
  return (
    <main className="maximal-tile min-h-screen">
      <NavBar />
      <div className="mx-auto max-w-2xl px-4 pb-16 pt-20">
        <div className="sketch-card sketch-card--v2 sketch-card--gira2 relative p-7 sm:p-10">
          <CornerDoodle className="absolute left-3 top-3 h-7 w-7" />
          <CornerDoodle className="absolute right-3 top-3 h-7 w-7 -scale-x-100" />
          <CornerDoodle className="absolute bottom-3 left-3 h-7 w-7 -scale-y-100" />
          <CornerDoodle className="absolute bottom-3 right-3 h-7 w-7 -scale-100" />
          <p
            className="text-center text-4xl text-[var(--accent)]"
            style={{ fontFamily: "var(--font-sketch)" }}
          >
            ¿Qué es esto?
          </p>

          <div className="mx-auto mt-5 flex max-w-[220px] items-center gap-3">
            <div className="hairline flex-1" />
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
              <path
                d="M12 3l2.2 5.4 5.8.5-4.4 3.8 1.3 5.7L12 15.9l-4.9 2.5 1.3-5.7L4 8.9l5.8-.5z"
                fill="var(--gold)"
                stroke="var(--foreground)"
                strokeWidth="1.2"
              />
            </svg>
            <div className="hairline flex-1" />
          </div>

          <div className="mt-6 flex flex-col gap-4 leading-relaxed text-[var(--foreground)]">
            <p>
              Es un regalo de cumpleaños para <strong>{SITE.recipientName}</strong>:
              un álbum secreto de cartas escritas por las personas que la quieren.
              Tú escribes la tuya aquí; nosotros la guardamos en un sobre cerrado.
            </p>
            <p>
              El día de su cumpleaños, {SITE.recipientName} recibirá la clave de un
              cielo estrellado donde vive un sobre por cada carta. Al abrir cada
              uno, la hoja sale del sobre, se despliega y ahí está tu mensaje —
              con tu letra elegida, tu firma dibujada y hasta tu voz si la grabas.
            </p>
            <p>
              Cada carta que lea encenderá una estrella. Cuando las haya leído
              todas, las estrellas se unirán en una constelación. «Lo esencial es
              invisible a los ojos», decía el zorro — pero esta vez va a poder
              leerlo, escucharlo y guardarlo para siempre.
            </p>
            <p className="text-sm text-[var(--muted)]">
              Consejos: escribe como hablas, no necesita ser largo. Puedes añadir
              una foto, firmar con el dedo y decorar la carta con stickers en el
              estudio. Tu carta pasa por una revisión antes de entrar al álbum
              (para cuidar la sorpresa).
            </p>
          </div>

          <div className="mt-8 text-center">
            <Link href="/escribir">
              <Button className="px-8 py-3.5">Escribir mi carta ✍</Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
