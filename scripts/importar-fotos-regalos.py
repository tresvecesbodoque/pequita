#!/usr/bin/env python3
"""Saca las fotos de la lista de deseos del .docx y las deja en public/regalos/.

Las imágenes vienen pegadas en un documento de Word con un marco crema alrededor
(el fondo de la página). Sobre el cielo azul del sitio ese marco canta, así que
se recorta: se van comiendo filas y columnas del borde mientras sean planas y
claras. Es un lote de 7 imágenes de 1000x1000 — nada pesado (ver hardware).

Uso:  python3 scripts/importar-fotos-regalos.py [ruta-al-docx]
Idempotente: vuelve a escribir los mismos archivos con el mismo resultado.
"""

import os
import sys
import zipfile

from PIL import Image, ImageStat

DOCX = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser(
    "~/Downloads/Regalitos para mi Isi preciosa.docx"
)
DESTINO = os.path.join(os.path.dirname(__file__), "..", "public", "regalos")

# El orden de word/media/ no dice nada; se mapea por el hash del archivo, que es
# estable mientras no se re-exporte el documento.
NOMBRES = {
    "c4d5242e75f159d54199d047558002f485091acd.jpg": "brillo-extreme-shine.jpg",
    "b5e33478c267b3e11579381b59a04d7a2576b2df.jpg": "what-a-tint.jpg",
    "a8ee83a36205191ccdc4b919c26d31009749bea5.jpg": "hoodie-rosado.jpg",
    "db98afa301c618dcd627c2b5ebe9dcce2a45f0b3.jpg": "pantalon-buzo-rosado.jpg",
    "ac4e8cda42883152a405c42451fd39a6d26ef7a2.jpg": "conjunto-dos-piezas.jpg",
    "5e06eddc3a3d9f202a959efd99fcc9c0be94129e.jpg": "botas-polonia-botin.jpg",
    "214b7f25b2415f1754d1eaeacf73cc120e44f113.jpg": "botas-polonia-larga.jpg",
}

# Algunas son capturas de la tienda y traen encima la interfaz del sitio (los
# puntitos del carrusel, el nombre de la marca). Tras quitar el marco se recorta
# a mano la zona del producto, en fracciones del alto/ancho ya recortados.
RECORTE_FINO = {
    "brillo-extreme-shine.jpg": (0.26, 0.0, 0.74, 0.78),
}

PLANA = 7.0      # desviación máxima para considerar una línea "sin dibujo"
CLARA = 195      # y además tiene que ser clara (el marco es crema)
MAX_RECORTE = 0.22  # nunca comerse más de un 22% por lado


def linea_de_marco(img, caja):
    franja = img.crop(caja)
    est = ImageStat.Stat(franja)
    return max(est.stddev) < PLANA and min(est.mean) > CLARA


def recortar_marco(img):
    ancho, alto = img.size
    izq, der, arr, aba = 0, ancho, 0, alto
    tope_x, tope_y = int(ancho * MAX_RECORTE), int(alto * MAX_RECORTE)

    while izq < tope_x and linea_de_marco(img, (izq, 0, izq + 1, alto)):
        izq += 1
    while der > ancho - tope_x and linea_de_marco(img, (der - 1, 0, der, alto)):
        der -= 1
    while arr < tope_y and linea_de_marco(img, (0, arr, ancho, arr + 1)):
        arr += 1
    while aba > alto - tope_y and linea_de_marco(img, (0, aba - 1, ancho, aba)):
        aba -= 1

    return img.crop((izq, arr, der, aba))


def main():
    os.makedirs(DESTINO, exist_ok=True)
    with zipfile.ZipFile(DOCX) as z:
        for interno in z.namelist():
            base = os.path.basename(interno)
            if base not in NOMBRES:
                continue
            with z.open(interno) as f:
                img = Image.open(f).convert("RGB")
            recortada = recortar_marco(img)
            fino = RECORTE_FINO.get(NOMBRES[base])
            if fino:
                a, al = recortada.size
                x0, y0, x1, y1 = fino
                recortada = recortada.crop(
                    (int(a * x0), int(al * y0), int(a * x1), int(al * y1))
                )
            salida = os.path.join(DESTINO, NOMBRES[base])
            recortada.save(salida, "JPEG", quality=88, optimize=True)
            print(
                f"{NOMBRES[base]}: {img.size[0]}x{img.size[1]} → "
                f"{recortada.size[0]}x{recortada.size[1]} "
                f"({os.path.getsize(salida) // 1024} KB)"
            )


if __name__ == "__main__":
    main()
