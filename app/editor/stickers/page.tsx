import { listStickers } from "@/lib/actions/stickers";
import { StickerManager } from "@/components/stickers/StickerManager";

export default async function StickersPage() {
  const stickers = await listStickers();

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-4xl">Stickers</h1>
      <p className="mt-1 text-[var(--muted)]">
        Tu librería de esquelas, decoraciones, fotos y escaneos reutilizables.
      </p>
      <div className="mt-8">
        <StickerManager
          initial={stickers.map((s) => ({
            id: s.id,
            type: s.type,
            imageUrl: s.imageUrl,
            name: s.name,
            width: s.width,
            height: s.height,
          }))}
        />
      </div>
    </div>
  );
}
