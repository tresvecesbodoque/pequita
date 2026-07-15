import Link from "next/link";
import { shade, readableInk } from "@/lib/color";

// Sobre cerrado del álbum. Enlaza al presentador (/carta/[slug]) donde se abre
// con la animación. Es un Server Component; el hover se hace con CSS (sin JS).
export function AlbumEnvelope({
  slug,
  label,
  sobreColor,
  tilt = 0,
}: {
  slug: string;
  label: string;
  sobreColor: string;
  /** inclinación en grados: los sobres del álbum quedan traviesos, no en fila */
  tilt?: number;
}) {
  const color = sobreColor || "#e7d8b5";
  const ink = readableInk(color);

  return (
    <Link href={`/carta/${slug}`} className="group block" style={{ transform: `rotate(${tilt}deg)` }}>
      <div
        className="relative aspect-[3/2] overflow-hidden rounded-lg border-2 border-[var(--foreground)]/70 shadow-[4px_5px_0_rgba(124,27,34,0.3)] transition-all duration-300 ease-out group-hover:-translate-y-1.5 group-hover:shadow-[6px_8px_0_rgba(124,27,34,0.35)]"
        style={{ backgroundColor: color }}
      >
        {/* solapa triangular */}
        <div
          className="absolute inset-x-0 top-0 h-[56%]"
          style={{
            clipPath: "polygon(0 0, 100% 0, 50% 100%)",
            background: `linear-gradient(180deg, ${shade(color, -8)}, ${shade(color, -16)})`,
          }}
        />
        {/* sello: pequeña estrella dorada en la punta de la solapa */}
        <div
          className="absolute left-1/2 top-[56%] flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full ring-1 ring-black/10 transition-transform duration-300 group-hover:scale-110"
          style={{
            background: `radial-gradient(circle at 35% 30%, ${shade("#d9a83f", 18)}, #d9a83f 60%, ${shade("#d9a83f", -16)})`,
          }}
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden>
            <path
              d="M12 3l2.2 5.4 5.8.5-4.4 3.8 1.3 5.7L12 15.9l-4.9 2.5 1.3-5.7L4 8.9l5.8-.5z"
              fill="#fffdf8"
              fillOpacity="0.92"
            />
          </svg>
        </div>
        {/* autor */}
        <div className="absolute inset-x-0 bottom-3.5 px-3 text-center">
          <span
            className="text-lg leading-tight"
            style={{ fontFamily: "var(--font-serif)", color: ink }}
          >
            {label}
          </span>
        </div>
      </div>
      <p className="mt-2.5 text-center text-xs text-[var(--muted)] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        Toca para abrir ✉
      </p>
    </Link>
  );
}
