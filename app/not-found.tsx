import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="text-5xl" style={{ fontFamily: "var(--font-hand)" }}>
        Pequita
      </p>
      <h1 className="mt-3 text-3xl">Aquí no hay ninguna carta</h1>
      <p className="mt-2 max-w-sm text-[var(--muted)]">
        Puede que el enlace sea incorrecto o que la carta ya no esté disponible.
      </p>
      <Link
        href="/editor"
        className="mt-6 rounded-full bg-[var(--accent)] px-6 py-2.5 text-sm font-semibold text-white"
      >
        Ir al taller
      </Link>
    </main>
  );
}
