import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `Pequita — ${SITE.inviteTitle}`,
  description: SITE.inviteSubtitle,
};

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-4 py-12 text-center">
      <div className="mb-4 text-4xl" aria-hidden>
        ✉
      </div>
      <span className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">
        para
      </span>
      <p
        className="mt-2 text-5xl text-[var(--accent)] sm:text-6xl"
        style={{ fontFamily: "var(--font-hand)" }}
      >
        {SITE.recipientName}
      </p>
      <h1 className="mt-4 text-3xl sm:text-4xl">{SITE.inviteTitle}</h1>
      <p className="mx-auto mt-4 max-w-md text-lg text-[var(--muted)]">
        {SITE.inviteSubtitle}
      </p>

      <div className="mt-8">
        <Link href="/escribir">
          <Button className="px-8 py-3.5 text-base">Escribir mi carta ✍</Button>
        </Link>
      </div>

      <Link
        href="/editor"
        className="mt-12 text-xs text-[var(--muted)] underline-offset-4 hover:underline"
      >
        Entrar al taller
      </Link>
    </main>
  );
}
