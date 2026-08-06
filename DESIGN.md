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
- `.velo` — apaga el escenario para que algo se ponga delante (el sobrecito de
  fotos al abrirse). Se tiñe del mundo vigente con `color-mix` sobre `--fondo`,
  así que el día D vira solo. Nunca escribir el velo con un rgba en el componente.

Rótulos: hay un componente único, `components/ui/Rotulo.tsx` (versalitas
espaciadas en oro). Toda etiqueta de formulario o de panel pasa por él —
incluido el `label` de `Input`—, en vez de `text-sm font-medium text-[--muted]`.
Así las opciones de diseño suenan igual que el resto del sitio.

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

## El correo: dos sobres, no uno

La carta lleva **su** sobre; las fotos llevan **el suyo**. Por defecto (desde
2026-08-02) las fotos de un familiar no se pegan sobre la hoja escrita —allí le
robaban sitio al mensaje y encogían la letra—: viajan en un sobrecito propio
(`Letter.photosJson`, componente `PhotoPocket`) que aparece junto a la carta ya
abierta y se abre aparte, soltando las copias en abanico. Quien prefiera lo de
antes lo elige al escribir ("Pegadas en la hoja").

- El sobrecito es del **mismo papel** que el sobre grande (su color, su solapa,
  su estrella de lacre), a escala. No es un bloque de cristal: es un objeto.
- Respira (sube y baja despacio) para que se vea que se puede abrir.
- Su rótulo va en pastilla: detrás no está el fondo del sitio sino el del TEMA
  de la carta, que puede ser oscuro o claro.
- En el libro impreso no hay sobre que abrir: las copias se pegan bajo la hoja.

## Reglas técnicas que no se negocian

- Animaciones con ease "papel" `[0.22, 1, 0.36, 1]`; los objetos físicos se
  mueven, no se funden (la carta SALE del sobre).
- **La apertura no frena**: cada gesto arranca cuando el anterior va por la
  mitad (la hoja sale con la solapa aún cayendo, se despliega mientras llega al
  centro). Un `await` por paso encadenaba cuatro paradas en seco.
- **El sonido es grabado, no sintetizado** (`lib/paperSound.ts` +
  `public/sonidos/`). Hubo dos intentos con WebAudio —ruido filtrado, que sonaba
  a viento; y microcrujidos granulares, que ya sonaban a papel pero seguían
  siendo una imitación— y los dos quedaron atrás el 2026-08-06, con dos
  grabaciones de medio segundo. Los tres gestos de papel salen del mismo
  archivo cambiando `playbackRate`: menos papel suena más agudo y más corto.
- **Nada de WebAudio para esto.** En el iPhone, WebAudio hace que el
  interruptor de silencio apague el sonido y deja de obedecer a `volume`. Con
  `<audio>` corriente manda el sistema, que es lo que se quiere. Cada toque usa
  un clon del elemento precargado: la apertura encadena dos roces que se
  solapan, y un mismo elemento se cortaría a sí mismo al reiniciarse.
- Todo editor de lienzo tiene **deshacer y rehacer** (botones a la izquierda de
  la barra, separados de lo que añade cosas, más ⌘Z/⇧⌘Z). Los cambios seguidos
  del mismo control se funden en un paso.
- La solapa 3D nunca gira 180° completos (la proyección CSS la espeja):
  ~150° y desvanecer (`EnvelopePresenter`).
- **El papel se toca.** La solapa del sobre y el pliegue de la hoja se agarran
  con el dedo y suenan al moverse (`playRoce`, con su propio freno). Su ángulo
  vive en un `MotionValue` —no en una animación por clase—, porque si no el
  arrastre y la secuencia se pelean por el mismo `transform`. Tirar de la
  solapa más de un tercio abre la carta; menos, y vuelve sola.
- **Un elemento invisible sigue recibiendo el dedo.** Las piezas del sobre que
  se van con `opacity: 0` quedan encima de la hoja y se comen el arrastre del
  pliegue: al abrirse hay que apagarlas con `pointer-events: none`.
- **Nada de `filter` dentro de un `preserve-3d`**: aplana la escena y deja de
  respetarse `backface-visibility`, así que al girar la solapa asomaban sus dos
  caras a la vez. Las sombras de las piezas 3D, con degradado.
- **El pliegue de la hoja abierta es una RAYA, no una franja.** Cada mitad
  ponía un degradado de 12 px contra el doblez y juntos hacían una banda oscura
  de 24 px cruzando la carta por encima del texto. Un pelo de tinta y 4 px de
  degradado bastan (`CREASE_LINE` en `FoldedLetter`).
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
