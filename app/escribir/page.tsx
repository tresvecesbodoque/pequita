import type { Metadata } from "next";
import { EscribirForm } from "./EscribirForm";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `Escribe una carta para ${SITE.recipientName}`,
  description: SITE.inviteSubtitle,
};

export default function EscribirPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-4 py-10">
      <header className="mb-6 text-center">
        <p
          className="text-3xl text-[var(--accent)]"
          style={{ fontFamily: "var(--font-hand)" }}
        >
          Pequita
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl">{SITE.inviteTitle}</h1>
        <p className="mx-auto mt-3 max-w-md text-[var(--muted)]">
          {SITE.inviteSubtitle}
        </p>
      </header>

      <EscribirForm recipientName={SITE.recipientName} />
    </main>
  );
}
