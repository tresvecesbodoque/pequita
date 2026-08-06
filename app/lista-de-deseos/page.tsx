import type { Metadata } from "next";
import { ListaDeseos } from "@/components/regalos/ListaDeseos";
import { NavBar } from "@/components/layout/NavBar";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `Lista de deseos — qué regalarle a ${SITE.recipientName}`,
  description: `Las cosas que ${SITE.recipientName} lleva tiempo queriendo, con su enlace y una marca para que dos personas no le regalen lo mismo.`,
};

// La cuarta parada del hub. Vive aparte de /escribir a propósito: quien solo
// quiere ver qué regalarle no tiene por qué cruzar un formulario que no va a
// rellenar, y quien viene a escribir no se encuentra la tienda debajo de su carta.
export default function ListaDeseosPage() {
  return (
    <main className="maximal-tile min-h-screen">
      <NavBar />
      <div className="mx-auto max-w-5xl px-4 pb-10 pt-20">
        <header className="mb-8 text-center">
          <p
            className="text-4xl text-[var(--accent)]"
            style={{ fontFamily: "var(--font-sketch)" }}
          >
            Pequita
          </p>
          <h1 className="mt-2 text-3xl sm:text-4xl">Lista de deseos</h1>
          <p className="mx-auto mt-3 max-w-lg leading-relaxed text-[var(--muted)]">
            Si aún no sabes qué regalarle, aquí hay algunas cosas que quiere hace
            tiempo, para todos los presupuestos. Si eliges una, márcala: el resto
            de la familia lo verá y así nadie llega con el mismo regalo.
          </p>
          <div className="mx-auto mt-6 flex max-w-[240px] items-center gap-3">
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
        </header>

        <ListaDeseos />
      </div>
    </main>
  );
}
