import Link from "next/link";
import { shade, readableInk } from "@/lib/color";

// Sobre cerrado del álbum. Enlaza al presentador (/carta/[slug]) donde se abre
// con la animación. Es un Server Component; el hover se hace con CSS (sin JS).
export function AlbumEnvelope({
  slug,
  label,
  sobreColor,
}: {
  slug: string;
  label: string;
  sobreColor: string;
}) {
  const color = sobreColor || "#d6c7a1";
  const ink = readableInk(color);

  return (
    <Link href={`/carta/${slug}`} className="group block">
      <div
        className="relative aspect-[3/2] overflow-hidden rounded-xl shadow-[0_16px_40px_-20px_rgba(0,0,0,0.5)] ring-1 ring-black/10 transition-transform duration-300 group-hover:-translate-y-1.5"
        style={{ backgroundColor: color }}
      >
        {/* solapa triangular */}
        <div
          className="absolute inset-x-0 top-0 h-[58%]"
          style={{
            clipPath: "polygon(0 0, 100% 0, 50% 100%)",
            background: `linear-gradient(180deg, ${shade(color, -10)}, ${shade(color, -18)})`,
          }}
        />
        {/* sello */}
        <div
          className="absolute left-1/2 top-[54%] h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-90 ring-1 ring-black/10"
          style={{ backgroundColor: shade(color, -28) }}
        />
        {/* autor */}
        <div className="absolute inset-x-0 bottom-4 px-3 text-center">
          <span
            className="text-lg leading-tight"
            style={{ fontFamily: "var(--font-serif)", color: ink }}
          >
            {label}
          </span>
        </div>
      </div>
      <p className="mt-2 text-center text-xs text-[var(--muted)] opacity-0 transition-opacity group-hover:opacity-100">
        Toca para abrir ✉
      </p>
    </Link>
  );
}
