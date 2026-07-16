import { listLetters } from "@/lib/actions/letters";
import { getBaseUrl } from "@/lib/baseUrl";
import { LetterCard } from "@/components/letters/LetterCard";
import { PendingCard } from "@/components/letters/PendingCard";
import { NewLetterButton } from "@/components/letters/NewLetterButton";

export default async function EditorHome() {
  const [letters, baseUrl] = await Promise.all([listLetters(), getBaseUrl()]);

  // Cartas de familiares aún sin aprobar → cola de moderación.
  const pending = letters.filter((l) => l.authorName && !l.isPublished);
  const rest = letters.filter((l) => !(l.authorName && !l.isPublished));

  // Panel de estado del regalo.
  const publicadas = letters.filter((l) => l.isPublished);
  const deFamiliares = letters.filter((l) => l.authorName);
  const conVoz = letters.filter((l) => l.audioUrl).length;
  const autores = Array.from(
    new Set(deFamiliares.map((l) => l.authorName!).filter(Boolean))
  );

  const stats: [string, number, string][] = [
    ["En el álbum", publicadas.length, "🌟"],
    ["Por revisar", pending.length, "✉"],
    ["Familiares", autores.length, "👪"],
    ["Con voz", conVoz, "🎙"],
  ];

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl">El taller</h1>
          <p className="mt-1 text-[var(--muted)]">
            Aprueba las cartas de los familiares y crea las tuyas.
          </p>
        </div>
        <NewLetterButton />
      </div>

      {/* Panel de estado del regalo */}
      <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map(([label, n, emoji]) => (
          <div
            key={label}
            className="flex items-center gap-3 rounded-2xl border-2 border-[var(--foreground)]/60 bg-[var(--surface)] px-4 py-3 shadow-[3px_4px_0_rgba(124,27,34,0.2)]"
          >
            <span className="text-2xl" aria-hidden>
              {emoji}
            </span>
            <div>
              <p className="text-2xl leading-none text-[var(--accent)]">{n}</p>
              <p className="text-xs text-[var(--muted)]">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {autores.length > 0 && (
        <p className="mt-3 text-sm text-[var(--muted)]">
          <span className="font-medium">Han escrito:</span> {autores.join(", ")}.
        </p>
      )}

      {pending.length > 0 && (
        <section className="mt-10">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl">Pendientes de aprobar</h2>
            <span className="rounded-full bg-[var(--accent)] px-2.5 py-0.5 text-xs font-semibold text-white">
              {pending.length}
            </span>
          </div>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Cartas que enviaron los familiares. Apruébalas para que aparezcan en el
            álbum.
          </p>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {pending.map((l) => (
              <PendingCard
                key={l.id}
                id={l.id}
                authorName={l.authorName ?? ""}
                message={l.authorMessage ?? ""}
                createdAt={l.createdAt.toISOString()}
              />
            ))}
          </div>
        </section>
      )}

      <section className="mt-12">
        {pending.length > 0 && <h2 className="mb-5 text-2xl">Todas las cartas</h2>}
        {rest.length === 0 ? (
          <div className="paper-texture rounded-3xl border border-dashed border-[var(--border)] p-16 text-center">
            <p className="text-lg text-[var(--muted)]">
              Aún no hay cartas aquí. Las cartas de los familiares aparecerán arriba
              para que las apruebes, o crea una con{" "}
              <span className="font-semibold text-[var(--accent)]">✦ Nueva carta</span>.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((letter) => (
              <LetterCard
                key={letter.id}
                id={letter.id}
                slug={letter.slug}
                title={letter.title}
                authorName={letter.authorName}
                isPublished={letter.isPublished}
                updatedAt={letter.updatedAt.toISOString()}
                baseUrl={baseUrl}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
