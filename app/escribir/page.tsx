import type { Metadata } from "next";
import { EscribirForm } from "./EscribirForm";
import { NavBar } from "@/components/layout/NavBar";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `Escribe una carta para ${SITE.recipientName}`,
  description: SITE.inviteSubtitle,
};

export default function EscribirPage() {
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
          <h1 className="mt-2 text-3xl sm:text-4xl">{SITE.inviteTitle}</h1>
          <p className="mx-auto mt-3 max-w-md leading-relaxed text-[var(--muted)]">
            {SITE.inviteSubtitle}
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

        <EscribirForm recipientName={SITE.recipientName} />
      </div>
    </main>
  );
}
