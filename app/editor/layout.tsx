import Link from "next/link";
import { requireAuth } from "@/lib/auth/session";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { PageTransition } from "@/components/layout/PageTransition";

export default async function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verificación criptográfica real de la sesión (el middleware solo mira presencia de cookie).
  await requireAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[var(--border)] bg-[var(--background)]/85 px-6 py-3 backdrop-blur">
        <Link href="/editor" className="flex items-baseline gap-2">
          <span
            className="text-2xl text-[var(--accent)]"
            style={{ fontFamily: "var(--font-hand)" }}
          >
            Pequita
          </span>
          <span className="text-xs uppercase tracking-widest text-[var(--muted)]">
            taller
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link href="/" className="rounded-full px-3 py-1.5 hover:bg-black/5">
            ⌂ Inicio
          </Link>
          <Link
            href="/editor"
            className="rounded-full px-3 py-1.5 hover:bg-black/5"
          >
            Mis cartas
          </Link>
          <Link
            href="/editor/stickers"
            className="rounded-full px-3 py-1.5 hover:bg-black/5"
          >
            Stickers
          </Link>
          <LogoutButton />
        </nav>
      </header>
      <main className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  );
}
