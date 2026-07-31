# DESIGN.md — fuente de la verdad estética de Pequita

Estética vigente (2026-07-31, **v3**): **una sola noche azul para todos los
sitios**, con el papel cálido reservado para el día del cumpleaños. Sustituye a
la v2 (bosquejo + maximalismo + paleta roja), que queda archivada como el
**mundo diurno** de la revelación. Ante cualquier duda de estilo, manda este
archivo; las fichas visuales viven en el proyecto **Pequita** de claude.ai/design
(bundle local en `design-system/`).

## Espíritu

- **Una sola noche.** El contador y la app comparten cielo: azul profundo con
  halo arriba, estrellas blancas y alguna dorada. Nadie llega a un sitio y siente
  que cambió de regalo.
- **Cristal sobre el cielo.** Todo lo que contiene algo —tarjetas, bloques del
  reloj, paneles— es el mismo bloque de cristal: borde de oro tenue, lavado
  blanco al 4%, desenfoque detrás. Nada de papel ni de sombras duras.
- **El oro es la voz.** Títulos, bordes, estrellas y la acción principal. Es el
  único color que sube el tono, así que se gasta poco: **un solo elemento
  encendido por vista** (el bloque del siete, la carta sin leer).
- **Se habla en cursiva.** Los versos, los susurros y las palabras que suben del
  cielo van en cursiva dorada. La interfaz va en redonda; los rótulos, en
  versalitas espaciadas.
- **Principito, sin disfraz.** Estrellas, planeta, rosa, zorro y avioneta siguen,
  pero dibujados con luz sobre la noche, no a lápiz sobre papel.

## Paleta

Tokens canónicos en `design-system/tokens.css`, copiados a cada sitio por
`scripts/sync-tokens.py`. **Nunca escribir un hex a mano en un componente.**

| Token | Valor | Uso |
|---|---|---|
| `--halo` | `#1b2748` | resplandor superior del cielo |
| `--cielo` | `#0e1730` | azul nocturno principal |
| `--fondo` | `#0a1020` | base del degradado |
| `--ink` | `#eae4d6` | texto principal sobre la noche |
| `--ink-calida` | `#f6e3c8` | versos, notas al margen, títulos de carta |
| `--gold` | `#d9a83f` | oro: títulos, bordes, estrellas, CTA |
| `--rose` | `#c96b74` | rosa: el número enamorado, guiños |

Los secundarios **siempre como alfa de la tinta**, no como hex propio:
`rgba(234,228,214,.45)` para texto apagado, `rgba(217,168,63,.4)` para bordes en
reposo y `.85` para bordes encendidos.

### Revelación — solo el día del cumpleaños

| Token | Valor | Uso |
|---|---|---|
| `--papel` | `#f6e8d6` | papel antiguo del mundo revelado |
| `--tinta-dia` | `#4d2126` | tinta granate sobre papel |
| `--bermellon` | `#b3282d` | énfasis y CTA del mundo diurno |

Se activan con la clase `dia` en `<html>`; ver «La revelación» abajo. Fuera de
ese momento no aparecen en ninguna pantalla.

## Tipografías

- **Interfaz entera → Cormorant Garamond** (`--font-serif`), en tres registros:
  - **versalitas** (`font-variant: small-caps`, `letter-spacing: .2em`, en oro)
    para títulos y rótulos;
  - **redonda** para cuerpo, botones, avisos y formularios;
  - **cursiva** para versos, susurros y notas.
- **Manuscritas — solo dentro de las cartas**, nunca en interfaz: `--font-hand`
  Caveat (por defecto), `--font-hand2` Dancing Script, `--font-hand3` Patrick Hand.
- `--font-display` (Amatic SC) y `--font-sans` (Nunito) **se siguen cargando**
  aunque no se ofrezcan al escribir: hay cartas ya guardadas que las eligieron y
  sin la variable se romperían. No quitarlas de `layout.tsx`.
- Fuente nueva ⇒ registrarla también en `ALLOWED_FONTS` (`lib/actions/guest.ts`)
  y `FONTS` (`EscribirForm`).

Fuera de la interfaz: Fredericka the Great y Limelight (rotulado v2), archivadas
con el mundo diurno.

## Utilidades

- `.cielo-noche` — el degradado de fondo; `.estrellas` — la capa de puntos.
- `.bloque-cristal` — borde oro al 40%, fondo blanco al 4%, `backdrop-filter`.
  Molde único de tarjetas y bloques del reloj.
- `.bloque-cristal--brilla` — borde al 85% + halo. Uno por vista, no más.
- `.margen` — papelito pegado: borde discontinuo, rotado −3°, tinta cálida.
- `.susurro` — cursiva dorada con halo suave.
- `.hairline` (trazo fino discontinuo en oro) y `.doodle-underline` (garabato,
  ahora dorado).

Archivadas hasta la revelación: `.sketch-card` y variantes, `.sketch-mini`,
`.paper-texture`, `.maximal-tile`, `.starfield` granate.

## La revelación

El día D (`SITE.revealDate`, 2026-08-07T00:00:01−04:00) el contador deja de
contar y **el mundo pasa de noche a día**: se añade la clase `dia` en `<html>`,
los tokens viran a papel/granate/bermellón, el cielo y la capa de eventos se
apagan, y aparece el saludo con el enlace a la app.

- Es una **transición, no un corte**: el viraje se hace con `transition` sobre
  los colores, nunca con un cambio instantáneo.
- Con `prefers-reduced-motion` el cambio es directo, sin animación.
- La capa de eventos (`.capa-eventos`) no corre en modo día: el regalo ya llegó.

## Reglas técnicas que no se negocian

- Animaciones con ease "papel" `[0.22, 1, 0.36, 1]`; los objetos físicos se
  mueven, no se funden (la carta SALE del sobre).
- La solapa 3D nunca gira 180° completos (la proyección CSS la espeja):
  ~150° y desvanecer (`EnvelopePresenter`).
- Los lienzos (`CanvasStage`) traen `z-index` internos ⇒ toda cara que los
  envuelva lleva `isolation: isolate`.
- SVG: jamás atributos duplicados (stroke/stroke-width) en un elemento.

## Stickers

Bosquejo de línea granate `#4d2126` con acentos rojo/coral/oro, fondo
transparente. Generador: `scripts/generar-stickers-svg.mjs` (+ prompts IA en
`scripts/stickers-prompts.txt`); importar con `scripts/importar-stickers.mjs`.

Pendiente de v3: esa línea granate se hunde sobre el cielo azul. Al repintar la
app hay que decidir entre una variante de línea en tinta cálida para el mundo
nocturno o dejarlos solo dentro de las cartas, que siguen siendo de papel.

## Estado de la migración

Los dos sitios están en v3 (2026-07-31), revelación incluida en ambos: el día D
el contador amanece y la app también, así que quien pulse «Entrar» no cambia de
mundo.

El repintado de la app se hizo con **puentes en `globals.css`**, no renombrando
47 archivos: los tokens viejos (`--background`, `--foreground`, `--accent`…) y
las clases viejas (`.sketch-card`, `.paper-texture`, `.maximal-tile`,
`.starfield`) siguen existiendo, pero apuntan al cristal y a la noche. Eso deja
nombres que mienten sobre lo que dibujan.

Pendiente, sin prisa:

- Renombrar esos puentes a los nombres de v3 (`.bloque-cristal`, `--cielo`,
  `--ink`, `--gold`) y borrar los alias. Al escribir código nuevo usar ya los
  nombres nuevos.
- Los stickers: ver la sección de arriba.
