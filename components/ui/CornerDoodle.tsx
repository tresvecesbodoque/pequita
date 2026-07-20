// Garabato de esquina (dos arcos a lápiz). Ornamento maximalista compartido:
// se coloca en las esquinas de las sketch-cards con clases absolute + scale.
export function CornerDoodle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <path
        d="M4 36 C6 18 18 6 36 4 M10 36 C12 24 24 12 36 10"
        fill="none"
        stroke="var(--accent)"
        strokeOpacity="0.5"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
