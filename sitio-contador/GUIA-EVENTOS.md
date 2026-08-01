# GUÍA DE EVENTOS — la página del conteo

Qué puede pasar en `dossieteshastaelsiete.vercel.app`, cuándo pasa y qué dice.
Es el manual de lo construido; el porqué de cada decisión está en
`PLAN-EVENTOS.md`.

**Para verlos sin esperar**, y nada de esto existe en la visita normal:

- **`?pruebas`** — panel con un botón por evento (63), agrupados por cómo
  aparecen. Debajo de cada nombre dice **por qué saldría o no ahora mismo**
  ("pide 40 s sin tocar", "descansa 4,2 h"). Lleva interruptor de *ambiente*,
  el marcador de ración, y dos herramientas: **vaciar ración** y **borrar
  memoria**.
- **`?rapido`** — encadena los aleatorios cada 2,5 s.
- **`?evento=<id>`** — fuerza uno concreto (ids entre paréntesis más abajo).
- **Simulador de contexto**: `?hora=3`, `?dias=7`, `?racha=4`, `?fuera=5`,
  `?quieta=60`. Finge el estado para probar condiciones sin esperar días.
  Ejemplo: `…vercel.app/?dias=7` dispara el 7 mágico entero.

---

## 1. El ritmo: mucho y rápido, y luego silencio

| Regla | Valor |
|---|---|
| Entre evento y evento | **10–20 segundos** |
| Ración por sesión | **6 eventos**; el sexto trae el aviso de vuelta |
| Si vuelve antes de la hora prometida | media ración (3) |
| Descanso de cada evento | **en horas**, nunca en días: 2–4 h los comunes, 8–12 h los raros, 20 h los legendarios |
| Repetición | ninguno sale dos veces en la misma sesión |

Cuando se agota la ración, la portada se calla y aparece una de estas tres, con
**hora concreta** calculada entre 3 y 7 horas después:

> *por hoy ya te mostré bastante. vuelve como a las {hora} y traigo más* ·
> *hasta aquí llega esta tanda. a eso de las {hora} hay cosas nuevas* ·
> *me guardo el resto. vuelve a las {hora}, que no se me olvida*

Lo que **nunca se agota**: tocar estrellas, las criaturas que estén en pantalla,
el frasco, el minijuego y la música.

**Memoria.** Cada evento apunta cuándo se vio (`localStorage`). Al elegir gana
**el que lleva más tiempo sin salir**, y el azar solo desempata entre los tres
más olvidados: por eso cada sesión trae cosas distintas. El frasco muestra
**"N de 60"** para que se vea cuánto falta por descubrir.

---

## 2. La canción del día

Una canción por día, elegida por la fecha. **No se guarda dónde iba: se
calcula.** La canción "lleva sonando" desde las 00:00 aunque nadie la escuche;
al entrar se engancha en el segundo que le toca, así que recargar no la
reinicia nunca (comprobado: recarga a los 332 s → sigue en 338).

Arranca con **el primer toque** que ella dé en cualquier parte de la pantalla —
ningún navegador deja sonar audio antes, y así no hay que pedirle nada. Sube de
volumen suave en dos segundos. El **deslizador** del borde derecho recuerda el
volumen; si lo deja en cero, se queda callada hasta que ella lo suba.

Archivos en `sitio-contador/musica/`. Ahora mismo: *Morfina*, de HUMBE.

---

## 3. La portada

Arriba **Nosotros II**, la nota, y el **contador en el centro de la pantalla**.
El poema va plegado debajo, tras "leer el poema ▾": se abre a mano —y recuerda
que quedó abierto— y también **se abre solo** cuando un evento necesita
enseñarlo (el verso iluminado, el verso nº 8, el eco, la semana de los versos),
volviéndose a plegar al terminar si ella no lo había abierto.

## 4. Lo que ella toca

| Qué toca | Qué pasa | Qué dice |
|---|---|---|
| Una **estrella** | Destella y sube una palabra | *quédate · vuelve · mírame · otra vez · sigo aquí · no me voy · dilo · sí · tuya · dos de siete · ya falta poco*. **Si rellenas `CONFIG.palabrasEnOrden` en `eventos.js`, salen las tuyas y en orden**, una por toque |
| **El zorro** (`zorro`) | Levanta la cabeza y se va andando | *"me domesticaste, y ahora el resto del cielo me parece igual"* |
| **La rosa** (`rosa`) | Se abre un poco más y suelta un pétalo | *"no me riegues, quédate"* |
| **El globo** (`globo`) | Revienta en confeti | *"eso también era para ti"* |
| **La luna** (`luna`) | Parpadea | *"también te ves de noche"* |
| **Mantener pulsado** 2 s, con el dedo quieto | El fondo amanece 3 s | *"quédate un poquito, que aquí no molestas nunca"* |
| **Tres toques** en la nota (`carta-corta`) | Una carta corta que no se repite | Seis escritas + una séptima que solo aparece el día D |
| **Siete toques en el reloj** (`dias-juntos`) | Aparece un quinto bloque contando **hacia delante** desde el 7 de marzo de 2026 a las 21:00, con días, horas, minutos y segundos en vivo | — |
| **Pulsar "Nosotros II"** (`dos-siete`) | Revela qué es | *"segunda de siete estrofas. las otras te van a llegar"* |
| **Arrastrar el dedo** | Polvo dorado | — |
| **Girar el teléfono** a horizontal | El cielo se cae | *"se te cayó el cielo encima"* |
| **El frasco** | Abre la colección y el calendario de días | — |
| **"leer el poema ▾"** | Despliega el poema bajo el contador y recuerda si lo dejó abierto | — |

---

## 5. Lo que aparece solo, y cuándo

**Fondo** = puede salir en cualquier momento. **Momento** = tiene su instante, y
cuando lo tiene gana a los de fondo.

| Evento | id | Cuándo | Descanso |
|---|---|---|---|
| Estrella fugaz | `fugaz` | fondo | 2 h |
| Susurro del banco | `susurro` | fondo, tras 30 s en página | 3 h |
| Verso solo | `verso` | fondo | 6 h |
| Dígito enamorado | `digito` | fondo | 3 h |
| Satélite | `satelite` | fondo | 4 h |
| Latido | `latido` | fondo, tras 30 s | 4 h |
| Polvo dorado | `polvo` | fondo | 6 h |
| Nota al margen | `margen` | fondo | 10 h |
| Corrección en vivo | `correccion` | fondo — **cinco reescrituras distintas** | 8 h |
| La rosa | `rosa` | fondo, a cualquier hora | 12 h |
| Luciérnagas | `luciernagas` | fondo, a cualquier hora — con alas que baten y la panza encendiéndose | 8 h |
| Globo | `globo` | fondo, a cualquier hora | 8 h |
| Verso nº 8 | `verso-extra` | momento: después de que salga el verso solo | 12 h |
| Tu nombre (ISI) | `nombre` | momento: segunda visita del día | 12 h |
| Fugaz que se arrepiente | `fugaz-lenta` | momento: el día que el contador baja de decena | 12 h |
| Avioneta | `avioneta` | momento: 2 min en la página | 10 h |
| El zorro | `zorro` | momento: **40 s sin tocar nada** — se acerca porque está quieta | 12 h |
| La luna | `luna` | momento: de noche y con luna llena | 10 h |
| Constelación | `constelacion` | momento: madrugada | 12 h |
| Lluvia de pecas | `pecas` | momento: tras tocar 8 estrellas | 12 h |
| Días = ∞ | `infinito` | momento: faltan más de 20 días | 12 h |
| Marcha atrás | `marcha-atras` | momento: últimos 5 días | 12 h |
| Bloque de besos | `besos` | momento: racha de 2 días | 10 h |
| Etiquetas cariñosas | `etiquetas` | momento: última semana | 8 h |
| Lluvia | `lluvia` | momento: invierno, por la tarde | 10 h |
| Lluvia de estrellas ✦ | `lluvia-estrellas` | momento: primera visita del día | 20 h |
| El planeta ✦ | `planeta` | momento: madrugada y 60 s sin tocar | 20 h |
| Eco del poema ✦ | `eco-poema` | momento: con 3 versos ya ganados | 20 h |
| Carta relámpago ✦ | `carta-rapida` | momento: al volver tras 3 días fuera | 20 h |

### La recta final (última semana)

La tabla de arriba es la de siempre. En los **últimos 7 días** cambia para lo
que ella **todavía no haya visto nunca**, y solo para eso:

- **Sin descanso y sin esperar su momento**: un estreno no hace cola.
- **Sorteo parejo entre estrenos**, sin pesos: los legendarios pesan 0,5 y con
  el reparto normal no les llegaba el turno hasta que ya era tarde.
- **Ración doble** (12 por sesión en vez de 6).
- Se relaja lo que ella **no puede provocar** — luna llena → cualquier noche;
  madrugada → de noche; *faltan más de 20 días*, *bajar de decena* y *3 días
  fuera* dejan de pedirse (eran imposibles de cumplir a estas alturas).
- **NO se relaja lo que depende de ella**: quedarse quieta, volver dos veces el
  mismo día, tocar ocho estrellas, dejar la página abierta dos minutos. Ahí
  está el juego, y de eso hablan las pistas.

### Las pistas

Van **en orden fijo** (`PISTAS`, un array): primero lo que puede hacer ahora
mismo, al final lo que hay que esperar. **No se barajan**: la misma pista se
queda hasta que lo consigue y solo entonces sube la siguiente — una pista que
cambia sola no es una pista. Se muestran tres, y "ya visto" se mira en
`mem.ultimos`, que no se poda nunca (el registro sí se recorta a 80).

---

## 6. El 7 mágico

1. **Siempre**: la caja de los segundos se enciende cuando asoma un 7.
2. **El día que faltan 7**: el reloj late a **77 bpm** toda la jornada
   (`?evento=77bpm` para verlo).
3. **Ese mismo día, al entrar**: **llueven 77 sietes** dorados durante ocho
   segundos y luego: *"siete días. siete versos. siete estrofas"*
   (`?evento=lluvia-sietes`, o `?dias=7` para el conjunto).

---

## 7. Hora, día e historia

| Cuándo | Qué |
|---|---|
| Antes de las 5:00 | *"¿otra vez despierta? yo igual…"* + cielo más hondo y estrellas más grandes |
| 5:00–12:00 | *"buenos días, mi wawa. el día ya empezó mejor"* |
| 12:00–20:00 | *"hola, pequita. pasé a dejarte algo y me quedé"* |
| Después de las 20:00 | *"buenas noches, pequita. el cielo también hace guardia"* |
| Primera visita del día | La frase del día, fija por fecha |
| Domingo / lunes | Fondo más cálido / *"faltan menos, y yo también"* |
| Día 7 del mes | *"hoy es 7: el número que nos persigue"* |
| Día 2 del mes | *"dos de siete. todavía quedan cinco por llegar"* |
| Racha de 3 días | *"vienes todos los días… te vi"* |
| Vuelve tras 3 días | *"te fuiste un rato; el contador siguió, yo también"* |
| 90 s en página | *"¿sigues ahí? yo también"* |
| 2 min sin tocar | *"aquí te espero; es lo que mejor me sale"* |

Y por el contador: capicúa → *"haz un deseo"* · 02:07 y 14:07 → *"2:07. dos de
siete, como el poema"* · notas propias al bajar a 30/21/14/10/7/3/2/1 días ·
última semana, un verso encendido para siempre cada día · últimos 3 días, sobre
dormido · última hora, amanece · último minuto, los segundos enormes ·
medianoche, confeti · después, cuenta hacia arriba.

---

## 8. Sigue dormido

| Qué | Falta |
|---|---|
| **Tu voz** (E60) | un audio corto tuyo en `CONFIG.audio` |
| **Séptima carta corta** | la escribes tú (aparece solo el día D) |
| **Las otras seis estrofas** | si existen, la última semana debería entregar una por día en vez de encender un verso |

---

## 9. Las reglas que ninguno rompe

1. Nunca dos eventos a la vez.
2. Nada tapa el contador ni mueve el texto de sitio.
3. Nada exige reacción: todo se desvanece solo.
4. Ningún audio suena sin que ella toque la pantalla.
5. Con `prefers-reduced-motion`, lo que se mueve no sale; lo de texto sí.
6. Con la pestaña oculta el motor se detiene.
7. Mientras juega a atrapar estrellas, la portada se calla del todo.
