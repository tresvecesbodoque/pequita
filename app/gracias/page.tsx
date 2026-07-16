import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { SITE } from "@/lib/site";
import { NavBar } from "@/components/layout/NavBar";

export const metadata: Metadata = { title: "¡Gracias por tu carta!" };

export default async function GraciasPage({
  searchParams,
}: {
  searchParams: Promise<{ editar?: string }>;
}) {
  const { editar } = await searchParams;

  return (
    <main className="maximal-tile flex min-h-screen flex-col items-center justify-center px-4 py-10 text-center">
      <NavBar />
      <div className="sketch-card sketch-card--gira max-w-lg p-8 sm:p-10">
        <svg viewBox="0 0 24 24" className="mx-auto h-10 w-10" aria-hidden>
          <path
            d="M12 3l2.2 5.4 5.8.5-4.4 3.8 1.3 5.7L12 15.9l-4.9 2.5 1.3-5.7L4 8.9l5.8-.5z"
            fill="var(--gold)"
            stroke="var(--foreground)"
            strokeWidth="1.2"
          />
        </svg>
        <h1 className="mt-4 text-3xl">¡Gracias por tu carta!</h1>
        <p className="mt-3 leading-relaxed text-[var(--muted)]">
          La guardamos con mucho cariño. Aparecerá en el álbum sorpresa de{" "}
          {SITE.recipientName} cuando sea revisada.
        </p>

        {editar && (
          <div className="mt-6 rounded-xl border-2 border-dashed border-[var(--border)] p-4">
            <p className="text-sm text-[var(--muted)]">
              ¿Se te olvidó algo? Puedes corregir tu mensaje mientras no lo hayamos
              revisado. Guarda este enlace:
            </p>
            <Link
              href={`/corregir/${editar}`}
              className="mt-2 inline-block text-sm font-semibold text-[var(--accent)] hover:underline"
            >
              ✎ Corregir mi carta
            </Link>
          </div>
        )}

        <div className="mt-7">
          <Link href="/escribir">
            <Button variant="outline">Escribir otra carta</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
