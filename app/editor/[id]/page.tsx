import { notFound } from "next/navigation";
import { getLetter } from "@/lib/actions/letters";
import { getBaseUrl } from "@/lib/baseUrl";
import { LetterEditor } from "@/components/canvas/LetterEditor";

export default async function LetterEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [letter, baseUrl] = await Promise.all([getLetter(id), getBaseUrl()]);
  if (!letter) notFound();

  return (
    <LetterEditor
      baseUrl={baseUrl}
      letter={{
        id: letter.id,
        slug: letter.slug,
        title: letter.title,
        esquelaCanvas: letter.esquelaCanvas,
        sobreCanvas: letter.sobreCanvas,
        esquelaBaseImageUrl: letter.esquelaBaseImageUrl,
        sobreBaseImageUrl: letter.sobreBaseImageUrl,
        sobreColor: letter.sobreColor,
        backgroundType: letter.backgroundType,
        backgroundPresetId: letter.backgroundPresetId,
        backgroundImageUrl: letter.backgroundImageUrl,
        backgroundScale: letter.backgroundScale,
        qrInteriorDataUrl: letter.qrInteriorDataUrl,
        qrExteriorDataUrl: letter.qrExteriorDataUrl,
      }}
    />
  );
}
