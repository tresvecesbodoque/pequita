# DESIGN.md — fuente de la verdad estética de Pequita

Estética vigente (2026-07-15, v2): **bosquejo a mano + El Principito +
cartoon Disney años 40 + MAXIMALISMO + paleta roja**. Sustituye por completo
al minimalismo escandinavo anterior. Ante cualquier duda de estilo, manda
este archivo.

## Espíritu

- **Bosquejo**: todo parece dibujado a lápiz/tinta con pulso humano — bordes
  irregulares (`.sketch-card`), líneas discontinuas, subrayados garabateados,
  tramas de rayado suave. Nada de geometría perfecta ni esquinas clínicas.
- **Cartoon 40s** (Pinocho/Dumbo/Fantasía): formas redondas y rebotonas,
  contornos gruesos, sombras duras desplazadas (`box-shadow: 3px 3px 0`),
  rótulos tipo cartel de feria.
- **Maximalismo**: las páginas se LLENAN — ornamentos en esquinas, divisores
  con estrellas, cintas, motivos repetidos de fondo, varias capas decorativas.
  El aire en blanco ya no es virtud; la abundancia con jerarquía sí.
- **Principito**: estrellas, planeta, la rosa, el zorro, avioneta — ahora en
  clave roja y dibujados como bosquejo.

## Paleta (tokens en `app/globals.css`)

| Token | Valor | Uso |
|---|---|---|
| `--background` | `#f6e8d6` | papel antiguo cálido |
| `--surface` | `#fcf3e4` | tarjetas/papel claro |
| `--foreground` | `#4d2126` | tinta granate oscura |
| `--muted` | `#9a6b5f` | secundarios |
| `--border` | `#d9b9a3` | líneas suaves |
| `--accent` | `#b3282d` | ROJO bermellón: CTA, títulos, énfasis |
| `--accent-deep` | `#7c1b22` | granate: sombras duras, hover |
| `--coral` | `#e0745a` | rosados/corales de apoyo |
| `--gold` | `#d9a83f` | estrellas y dorados |
| `--night` / `--night-deep` | `#3a1420` / `#260d15` | cielo nocturno granate |
| `--night-ink` | `#f6e3c8` | tinta clara sobre cielo |

Utilidades: `.starfield` (cielo granate con estrellas), `.sketch-card`
(borde irregular a mano + sombra dura), `.maximal-tile` (papel con motivos
repetidos), `.hairline` (ahora discontinua), `.paper-texture`.

## Tipografías (variables en `app/layout.tsx`)

- Títulos grandes → `--font-sketch` **Fredericka the Great** (rotulado a lápiz).
- Rótulos/carteles 40s → `--font-deco` **Limelight**.
- Serif de apoyo → `--font-serif` Cormorant Garamond. UI → `--font-sans` Nunito.
- Cartas (elige el familiar): `--font-hand` Caveat, `--font-hand2` Dancing
  Script, `--font-hand3` Patrick Hand, `--font-display` Amatic SC.
- Fuente nueva ⇒ registrarla también en `ALLOWED_FONTS` (`lib/actions/guest.ts`)
  y `FONTS` (`EscribirForm`).

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
