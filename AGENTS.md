<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# Dónde está cada cosa (SOP)

Este archivo es un índice; el detalle vive en archivos dedicados que se leen
solo cuando tocan:

- **Estética / diseño** → `DESIGN.md` (fuente de la verdad; leer antes de tocar UI).
- **Trabajo por lotes o repetitivo** (scraping, conversión, generación de
  imágenes, imports) → escribir un script en `scripts/` y correrlo, no hacerlo
  paso a paso en el chat. Imágenes con IA: skill central `gen-imagenes`.
- **Verificación visual** → dev server SOLO en `127.0.0.1` + Playwright
  (carta con contenido real: slug `pzjDPC-PyM` en `dev.db`; clave del álbum:
  `Morfina`, la de `lib/site.ts`).
- **El álbum va ESPEJADO en el contador** → `sitio-contador/vercel.json` reenvía
  `/para-ella`, `/carta/*`, `/pelicula` y `/_next/*` a la app. Ella entra por
  misiete y nunca ve el dominio de la app, porque allí está `/lista-de-deseos`
  y el regalo es sorpresa. Por eso: **no enlazar a `ishibonita` desde el
  contador**, y si se añade una página al álbum, añadirla también al reenvío.
  Los orígenes del contador van en `serverActions.allowedOrigins`
  (`next.config.ts`) o el candado del álbum deja de abrir.
- **Insumos externos pesados** (PDF/Word) → convertir a `.txt` con script y
  leer el `.txt`, nunca el original.
<!-- END:nextjs-agent-rules -->

# Memoria (loop de auto-mejora)

Leer `memoria/APRENDIZAJES.md` al inicio de una tarea. Cuando el usuario corrija una
preferencia **reutilizable** (tono, formato, prioridad, decisión de diseño o de flujo que
valdrá en futuras tareas), anotarla ahí de inmediato, sin pedir permiso. No guardar hechos
puntuales de una tarea ni resúmenes de conversación. Si una preferencia se vuelve estable,
moverla a `AGENTS.md` o `DESIGN.md` y retirarla de la memoria.
