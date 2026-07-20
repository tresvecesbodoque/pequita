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
- [2026-07-20] Evitar procesos pesados en local (conversión/generación de imágenes por
  lote, upscaling): el equipo es un MacBook Air M2 de 8 GB y se calienta. Delegar a APIs/
  herramientas online o, si hace falta, automatizar el navegador con las cuentas logueadas
  del usuario. Regla promovida a `~/CLAUDE/AGENTS.md` (Hardware del usuario).
