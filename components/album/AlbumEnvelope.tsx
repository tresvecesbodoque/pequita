import Link from "next/link";
import { shade, readableInk } from "@/lib/color";

// Sobre cerrado del álbum. Enlaza al presentador (/carta/[slug]) donde se abre
// con la animación. Es un Server Component; el hover se hace con CSS (sin JS).
export function AlbumEnvelope({
  slug,
  label,
  sobreColor,
  tilt = 0,
  locked = false,
  stampEmoji = "⭐",
  dateLabel,
  featured = false,
}: {
  slug: string;
  label: string;
  sobreColor: string;
  /** inclinación en grados: los sobres del álbum quedan traviesos, no en fila */
  tilt?: number;
  /** sin clave: el sobre se ve atenuado, con candado, y lleva al formulario */
  locked?: boolean;
  /** motivo de la estampilla (emoji del tema de la carta) */
  stampEmoji?: string;
  /** fecha corta para el matasellos */
  dateLabel?: string;
  /** carta destacada "empieza por aquí": brilla */
  featured?: boolean;
}) {
  const color = sobreColor || "#e7d8b5";
  const ink = readableInk(color);

  return (
    <Link
      href={locked ? "#candado" : `/carta/${slug}`}
      className={`group block ${locked ? "opacity-55 saturate-[0.6]" : ""}`}
      style={{ transform: `rotate(${tilt}deg)` }}
      aria-label={locked ? "Carta bloqueada: escribe la clave arriba" : undefined}
    >
      {featured && !locked && (
        <p
          className="mb-1 text-center text-xs font-semibold text-[var(--accent)]"
          style={{ fontFamily: "var(--font-hand2, cursive)" }}
        >
          ✦ empieza por aquí ✦
        </p>
      )}
      <div
        className={`relative aspect-[3/2] overflow-hidden rounded-lg border-2 transition-all duration-300 ease-out group-hover:-translate-y-1.5 ${
          featured && !locked
            ? "border-[var(--gold)] shadow-[0_0_0_3px_rgba(217,168,63,0.35),4px_5px_0_rgba(124,27,34,0.3)] group-hover:shadow-[0_0_0_4px_rgba(217,168,63,0.45),6px_8px_0_rgba(124,27,34,0.35)]"
            : "border-[var(--foreground)]/70 shadow-[4px_5px_0_rgba(124,27,34,0.3)] group-hover:shadow-[6px_8px_0_rgba(124,27,34,0.35)]"
        }`}
        style={{ backgroundColor: color }}
      >
        {/* Estampilla postal: marco blanco doble sobre fondo del tema, con el
            motivo centrado. (El dentado por máscara perforaba TODA la
            superficie y de cerca parecía tela de lunares.) */}
        {!locked && (
          <div
            className="absolute right-2.5 top-2 flex h-9 w-8 items-center justify-center text-sm"
            style={{
              background: shade(color, 22),
              border: "2.5px solid rgba(255,253,248,0.9)",
              outline: `1.5px solid ${shade(color, -30)}`,
              transform: "rotate(3deg)",
              borderRadius: "1px",
            }}
          >
            <span aria-hidden>{stampEmoji}</span>
          </div>
        )}
        {/* matasellos: anillo con la fecha que MUERDE la esquina de la
            estampilla, como un sello de correos de verdad */}
        {!locked && dateLabel && (
          <div
            className="absolute right-8 top-6 flex h-9 w-9 items-center justify-center rounded-full text-[7px] font-bold uppercase leading-tight"
            style={{
              color: ink,
              border: `1.5px solid ${ink}`,
              opacity: 0.5,
              transform: "rotate(-14deg)",
              textAlign: "center",
            }}
          >
            {dateLabel}
          </div>
        )}

        {/* solapa triangular */}
        <div
          className="absolute inset-x-0 top-0 h-[56%]"
          style={{
            clipPath: "polygon(0 0, 100% 0, 50% 100%)",
            background: `linear-gradient(180deg, ${shade(color, -8)}, ${shade(color, -16)})`,
          }}
        />
        {/* sello: estrella dorada — o candado si aún no hay clave */}
        <div
          className="absolute left-1/2 top-[56%] flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full ring-1 ring-black/10 transition-transform duration-300 group-hover:scale-110"
          style={{
            background: locked
              ? `radial-gradient(circle at 35% 30%, ${shade("#8a7968", 14)}, #8a7968 60%, ${shade("#8a7968", -16)})`
              : `radial-gradient(circle at 35% 30%, ${shade("#d9a83f", 18)}, #d9a83f 60%, ${shade("#d9a83f", -16)})`,
          }}
        >
          {locked ? (
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden>
              <path
                d="M7 10V8a5 5 0 0 1 10 0v2h1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1h1zm2 0h6V8a3 3 0 0 0-6 0v2z"
                fill="#fffdf8"
                fillOpacity="0.92"
              />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden>
              <path
                d="M12 3l2.2 5.4 5.8.5-4.4 3.8 1.3 5.7L12 15.9l-4.9 2.5 1.3-5.7L4 8.9l5.8-.5z"
                fill="#fffdf8"
                fillOpacity="0.92"
              />
            </svg>
          )}
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
        {locked ? "Necesita la clave 🔒" : "Toca para abrir ✉"}
      </p>
    </Link>
  );
}
