#!/usr/bin/env python3
"""Convierte «Siete noches de sed.md» en los datos que usa el sitio.

El .md es la fuente de la verdad del poema y de sus explicaciones; este script
lo lee y escribe `sitio-contador/poema-datos.js`. Nada se copia a mano: cuando
él revise una estrofa, se vuelve a correr y ya está.

    python3 scripts/generar-explicaciones.py [ruta-al-md]

Solo se exportan las estrofas REVISADAS. El .md marca dónde se acaba lo bueno
con una línea entre corchetes ("Hasta aquí llega la versión revisada"); de ahí
en adelante son borradores y no se publican.
"""
import html
import re
import sys
from pathlib import Path

MD = Path(sys.argv[1] if len(sys.argv) > 1 else
          "/Users/juangajardoandrades/Desktop/Siete noches de sed.md")
SALIDA = Path(__file__).resolve().parent.parent / "sitio-contador" / "poema-datos.js"

# La entrega: una estrofa por jueves, a las 00:00 de Santiago (UTC−4 en
# invierno). La I se entregó el jueves 16 de julio de 2026.
JUEVES = ["2026-07-16", "2026-07-23", "2026-07-30", "2026-08-06",
          "2026-08-13", "2026-08-20", "2026-08-27"]

# La vía alquímica de cada estrofa no está en el .md: la puso él aparte.
VIAS = ["Nigredo · Calcinatio", "Solutio · Sublimatio · Precipitatio",
        "Coagulatio", "Separatio", "Putrefactio", "Ablutio", "Coniunctio"]

ROMANOS = ["I", "II", "III", "IV", "V", "VI", "VII"]


def enriquecer(t):
    """Markdown mínimo a HTML: cursivas, negritas y comillas de código."""
    t = html.escape(t, quote=False)
    t = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", t)
    t = re.sub(r"\*(.+?)\*", r"<em>\1</em>", t)
    t = re.sub(r"`(.+?)`", r"<em>\1</em>", t)
    return t


def js(x, sangria=0):
    """Vuelca a literal de JavaScript, legible y sin dependencias."""
    pad = "  " * sangria
    if isinstance(x, str):
        return '"' + x.replace("\\", "\\\\").replace('"', '\\"') + '"'
    if isinstance(x, list):
        if not x:
            return "[]"
        dentro = ",\n".join(pad + "  " + js(i, sangria + 1) for i in x)
        return "[\n" + dentro + "\n" + pad + "]"
    if isinstance(x, dict):
        dentro = ",\n".join(pad + "  " + k + ": " + js(v, sangria + 1)
                            for k, v in x.items())
        return "{\n" + dentro + "\n" + pad + "}"
    raise TypeError(type(x))


def main():
    texto = MD.read_text(encoding="utf-8")

    # 1. El poema: cada "### N. Título" seguido de sus siete versos.
    poema, versos_de = texto.split("# Lo que quise decir")[0], {}
    for m in re.finditer(r"^### ([IVX]+)\. (.+?)$\n(.*?)(?=^###|\Z)",
                         poema, re.M | re.S):
        romano, titulo, cuerpo = m.group(1), m.group(2).strip(), m.group(3)
        versos_de[romano] = [l.strip() for l in cuerpo.strip().splitlines() if l.strip()]

    # 2. La entrada de "Lo que quise decir": todo hasta la primera raya.
    tras = texto.split("# Lo que quise decir", 1)[1]
    intro = [enriquecer(p.strip()) for p in tras.split("\n---", 1)[0].strip().split("\n\n")
             if p.strip()]

    # 3. Las explicaciones, solo hasta donde llega lo revisado.
    revisado = tras.split("Hasta aquí llega la versión revisada")[0]

    estrofas = []
    for m in re.finditer(r"^## ([IVX]+)\. (.+?) — (.+?)$\n(.*?)(?=^## |\Z)",
                         revisado, re.M | re.S):
        romano, titulo, cuando, cuerpo = (m.group(1), m.group(2).strip(),
                                          m.group(3).strip(), m.group(4))
        i = ROMANOS.index(romano)
        versos = []
        for v in re.finditer(r"^> (.+?)$\n(.*?)(?=^> |\Z)", cuerpo, re.M | re.S):
            parrafos = [enriquecer(p.strip()) for p in v.group(2).strip().split("\n\n")
                        if p.strip() and not p.strip().startswith(("---", "**["))]
            versos.append({"texto": v.group(1).strip(), "parrafos": parrafos})

        del versos_de[romano][:]   # marca que esta estrofa ya se usó
        estrofas.append({
            "num": romano,
            "titulo": titulo,
            "via": VIAS[i],
            "cuando": cuando,
            "desde": JUEVES[i] + "T00:00:00-04:00",
            "versos": versos,
        })

    if not estrofas:
        sys.exit("No se encontró ninguna estrofa revisada en el .md")

    for e in estrofas:
        if len(e["versos"]) != 7:
            print(f"  aviso: la estrofa {e['num']} tiene {len(e['versos'])} versos, no 7")

    cabecera = (
        "/* GENERADO por scripts/generar-explicaciones.py — NO editar a mano.\n"
        "   La fuente es «Siete noches de sed.md»; se vuelve a correr el script\n"
        "   cada vez que él revisa una estrofa.\n\n"
        "   `desde` es el jueves en que se entrega cada estrofa, a las 00:00 de\n"
        "   Santiago: hasta esa hora, la estrofa no existe para el sitio. */\n"
    )
    SALIDA.write_text(
        cabecera + "window.POEMA = " + js({"intro": intro, "estrofas": estrofas}) + ";\n",
        encoding="utf-8")

    print(f"{SALIDA.name}: {len(estrofas)} estrofas revisadas "
          f"({', '.join(e['num'] for e in estrofas)}), "
          f"{sum(len(e['versos']) for e in estrofas)} versos explicados, "
          f"{len(intro)} párrafos de entrada.")


if __name__ == "__main__":
    main()
