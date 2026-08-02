// Rótulo de la v3: versalitas espaciadas en oro (ver DESIGN.md, «Se habla en
// cursiva»). Es la voz de todas las etiquetas de formulario y de panel, para
// que las opciones de diseño suenen igual que el resto del sitio y no a
// formulario genérico.

export function Rotulo({
  children,
  className = "",
  as = "span",
}: {
  children: React.ReactNode;
  className?: string;
  /** `legend` dentro de un fieldset; `span` en cualquier otro sitio */
  as?: "span" | "legend" | "h3";
}) {
  const Tag = as;
  return (
    <Tag
      className={`text-[0.7rem] uppercase tracking-[0.22em] text-[var(--gold)] ${className}`}
    >
      {children}
    </Tag>
  );
}
