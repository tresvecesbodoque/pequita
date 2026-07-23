# Aprendizajes — memoria de preferencias

Memoria auto-mejorante del proyecto. La IA lee este archivo al inicio de una tarea y
escribe aquí cuando el usuario corrige una preferencia **reutilizable**. Cada corrección
guardada evita repetir el mismo error en sesiones futuras.

## Qué se guarda (automático, sin pedir permiso)
- Correcciones de preferencia recurrente: tono, formato, prioridades, decisiones de
  diseño o de flujo que valdrán también en tareas futuras.

## Qué NO se guarda
- Hechos puntuales de una tarea (un slug concreto, el contenido de una carta específica).
- Resúmenes de conversación (solo si el usuario lo pide).
- Lo que ya vive en `AGENTS.md`, `DESIGN.md` u otra especificación: si una preferencia se
  vuelve estable, moverla allí y retirarla de aquí.

## Formato
Una línea por aprendizaje, más reciente arriba:
`- [YYYY-MM-DD] <preferencia en imperativo> — por qué / alcance`

## Aprendizajes
- [2026-07-23] VÍDEO: los familiares graban/suben un clip breve (15–20s) junto a su
  carta, y el "vídeo final" es un MONTAJE que se reproduce solo (un reproductor pasa los
  clips uno tras otro), NO un único MP4 re-codificado. Se descartó el archivo único por
  el costo/peso (ni Vercel ni el MacBook Air pueden transcodificar; ver [[hardware-liviano]]).
- [2026-07-23] Cumpleaños de Isidora ("Isi"): día D = 2026-08-07T00:00:01-04:00 (00:00:01
  hora Santiago; Chile en agosto está en UTC−4). Está en SITE.revealDate. Antes del día,
  cuenta regresiva (portada y álbum) y sobres dormidos; el día D, confeti en la portada.
- [2026-07-23] Las fotos van a MÁXIMA CALIDAD: guardar el archivo original sin
  recomprimir ni redimensionar (nada de reducir a 1400px ni pasar a WebP). Excepción:
  formatos no mostrables en navegador (HEIC/TIFF) → JPEG calidad 100. El proyecto guarda
  medios en Cloudflare R2 (bucket `ishibonita`, cliente S3 en `lib/uploadServer.ts`; vars
  R2_ACCOUNT_ID/R2_ACCESS_KEY_ID/R2_SECRET_ACCESS_KEY/R2_BUCKET/R2_PUBLIC_URL en Vercel).
  Se eligió R2 por 10 GB gratis y sin cargo por descarga, pensando en soportar VÍDEO más
  adelante. En dev sigue escribiendo en public/uploads.
- [2026-07-20] Evitar procesos pesados en local (conversión/generación de imágenes por
  lote, upscaling): el equipo es un MacBook Air M2 de 8 GB y se calienta. Delegar a APIs/
  herramientas online o, si hace falta, automatizar el navegador con las cuentas logueadas
  del usuario. Regla promovida a `~/CLAUDE/AGENTS.md` (Hardware del usuario).
