#!/usr/bin/env python3
"""Copia design-system/tokens.css a los sitios que lo consumen.

El canónico es `design-system/tokens.css` (ver DESIGN.md). Los sitios se
despliegan por separado —la app en Vercel, el contador en su propio proyecto—
así que no pueden compartir un archivo servido: cada uno lleva su copia y este
script las regenera.

Idempotente: si una copia ya está al día, no la reescribe.

    python3 scripts/sync-tokens.py
"""

from pathlib import Path
import sys

RAIZ = Path(__file__).resolve().parent.parent
CANONICO = RAIZ / "design-system" / "tokens.css"
COPIAS = [
    RAIZ / "sitio-contador" / "tokens.css",
    RAIZ / "app" / "tokens.css",
]

AVISO = (
    "/* GENERADO por scripts/sync-tokens.py — NO editar a mano.\n"
    "   Editar design-system/tokens.css y volver a correr el script. */\n"
)


def main() -> int:
    if not CANONICO.exists():
        print(f"falta el canónico: {CANONICO}", file=sys.stderr)
        return 1

    contenido = AVISO + CANONICO.read_text(encoding="utf-8")

    for destino in COPIAS:
        if destino.exists() and destino.read_text(encoding="utf-8") == contenido:
            print(f"  = {destino.relative_to(RAIZ)}")
            continue
        destino.parent.mkdir(parents=True, exist_ok=True)
        destino.write_text(contenido, encoding="utf-8")
        print(f"  → {destino.relative_to(RAIZ)}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
