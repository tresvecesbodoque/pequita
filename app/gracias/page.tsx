import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "¡Gracias por tu carta!" };

export default function GraciasPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-4 py-10 text-center">
      <div className="paper-texture rounded-3xl border border-[var(--border)] p-8 shadow-[0_24px_70px_-40px_rgba(58,46,38,0.55)] sm:p-10">
        <div className="text-5xl">💌</div>
        <h1 className="mt-4 text-3xl">¡Gracias por tu carta!</h1>
        <p className="mt-3 text-[var(--muted)]">
          La guardamos con mucho cariño. Aparecerá en el álbum sorpresa de{" "}
          {SITE.recipientName} cuando sea revisada.
        </p>
        <div className="mt-7">
          <Link href="/escribir">
            <Button variant="outline">Escribir otra carta</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
