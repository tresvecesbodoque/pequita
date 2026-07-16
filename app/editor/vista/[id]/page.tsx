import { notFound } from "next/navigation";
import Link from "next/link";
import { getLetter } from "@/lib/actions/letters";
import { EnvelopePresenter } from "@/components/envelope/EnvelopePresenter";
import { SITE } from "@/lib/site";

// Vista previa (protegida) de cómo se verá una carta en el presentador, aunque
// todavía no esté publicada. Útil para revisar las cartas de familiares antes
// de aprobarlas.
export default async function PreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const letter = await getLetter(id);
  if (!letter) notFound();

  return (
    <div>
      <div className="mx-auto max-w-lg px-6 pt-6">
        <Link
          href="/editor"
          className="text-sm text-[var(--muted)] underline-offset-4 hover:underline"
        >
          ← Volver al taller
        </Link>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Vista previa — así la verá {SITE.recipientName}.
        </p>
      </div>

      <EnvelopePresenter
        title={letter.title}
        esquelaCanvas={letter.esquelaCanvas}
        sobreCanvas={letter.sobreCanvas}
        sobreColor={letter.sobreColor}
        sobreBaseImageUrl={letter.sobreBaseImageUrl}
        esquelaBaseImageUrl={letter.esquelaBaseImageUrl}
        background={{
          backgroundType: letter.backgroundType,
          backgroundPresetId: letter.backgroundPresetId,
          backgroundImageUrl: letter.backgroundImageUrl,
          backgroundScale: letter.backgroundScale,
        }}
        qrInterior={letter.qrInteriorDataUrl}
        audioUrl={letter.audioUrl}
      />
    </div>
  );
}
