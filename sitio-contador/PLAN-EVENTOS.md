# PLAN — Eventos aleatorios tiernos en la página del conteo

Objetivo: que revisar el contador deje de ser "mirar un número" y pase a ser
"ver qué me encuentro hoy". Cada visita tiene que devolver algo: una frase, un
bicho que cruza el cielo, un número que se porta raro, un secreto que solo
aparece si toca donde no sabía que se podía tocar.

Ámbito: `sitio-contador/index.html` (HTML único, sin build, sin dependencias,
desplegado solo en Vercel). Todo lo de aquí se hace en vanilla JS + CSS dentro
del mismo archivo, o como mucho partido en `eventos.js` + `eventos.css`.

---

## 1. Reglas de oro (lo que NO se hace)

Son restricciones de diseño, no adornos: si una idea las rompe, se descarta.

1. **Nunca dos eventos a la vez.** Un evento visible como máximo. Cola, no solapamiento.
2. **Nada de ruido sin permiso.** Cero autoplay de audio. Si hay sonido, se toca a mano.
3. **Nada que tape el contador.** Los eventos viven alrededor: cielo, márgenes,
   bajo el reloj. El número siempre legible.
4. **Nada que exija reacción.** Sin modales, sin "haz clic para continuar", sin
   nada que se quede esperando. Todo se desvanece solo.
5. **Nada de repetir.** Los últimos 10 eventos vistos quedan vetados; las frases
   no se repiten hasta agotar el banco.
6. **Nada de permisos del navegador.** Sin geolocalización, sin micrófono, sin
   notificaciones. Solo `localStorage`.
7. **Respeto de `prefers-reduced-motion`.** Con la preferencia activa, el evento
   sigue apareciendo pero estático (aparece y se desvanece, sin recorridos).
8. **Pausa con la pestaña oculta** (`visibilitychange`): no gastar batería ni
   "gastar" eventos que ella no va a ver.
9. **Presupuesto de peso:** +25 KB como techo sobre el HTML actual. Cero librerías.
10. **Cero azar cruel.** El primer evento de cada día está garantizado; el azar
    decide *cuál*, nunca *si hay*.

---

## 2. Arquitectura

### 2.1 Forma de un evento

```js
{
  id: 'fugaz-deseo',
  rareza: 'comun',        // comun | poco-comun | raro | legendario
  peso: 8,                // probabilidad relativa dentro de su rareza
  cooldown: 45000,        // ms mínimos antes de que este mismo pueda repetirse
  cuando: (ctx) => true,  // condición (hora, días restantes, racha, etc.)
  correr: (ctx) => { /* pinta, anima, se limpia solo */ }
}
```

`ctx` es un objeto único que se calcula una vez por tick y contiene: `msRestantes`,
`dias/horas/min/seg`, `hora` local, `franja` (madrugada/mañana/tarde/noche),
`diaSemana`, `esPrimeraVisitaDelDia`, `visitasTotales`, `rachaDias`,
`diasDesdeUltimaVisita`, `vistos[]`, `reducirMovimiento`, `esMovil`.

### 2.2 Capas visuales (z-index de abajo a arriba)

| Capa | Qué vive ahí | Ya existe |
|---|---|---|
| `.cielo` | estrellas titilando, fugaces, constelaciones | sí (60 spans) |
| `.criaturas` | zorro, avioneta, rosa, luciérnagas, globo | no |
| contenido | marca, nota, poema, reloj | sí |
| `.susurros` | texto que aparece y se desvanece bajo el reloj | no |
| `.margen` | notas al margen, sellos, frasco | no |

Las capas nuevas son `position: fixed; inset: 0; pointer-events: none`, y solo
los elementos concretos que deben ser tocables activan `pointer-events: auto`.

### 2.3 Motor

- **Al cargar:** a los 2,5 s dispara el *evento de bienvenida* (garantizado).
- **Ambiente:** después, un `setTimeout` con intervalo aleatorio de 25–75 s
  elige un evento elegible por peso. Si la pestaña está oculta, no cuenta.
- **Reactivos:** los de interacción (toques, mantener pulsado) no pasan por el
  reloj: se disparan al instante, pero respetan la regla de "uno a la vez".
- **Programados:** los hitos del contador (7 días, última hora, medianoche) tienen
  prioridad absoluta y se saltan la cola.

### 2.4 Persistencia (`localStorage`, una sola clave `pequita.contador`)

```json
{ "visitas": 12, "ultimaVisita": "2026-07-28", "racha": 4,
  "vistos": ["fugaz-deseo", "zorro"], "frasesUsadas": [3, 17, 9],
  "coleccion": ["zorro", "rosa"], "diasSellados": ["2026-07-26", "..."] }
```

Si `localStorage` falla (modo privado), todo degrada a "primera visita siempre":
la página funciona igual, solo pierde memoria.

### 2.5 Economía de aparición

| Rareza | Prob. por tirada | Sensación buscada |
|---|---|---|
| Común | 60 % | "siempre pasa algo" |
| Poco común | 28 % | "mira, esto no lo había visto" |
| Raro | 10 % | "tengo que contarle" |
| Legendario | 2 % | ~1 de cada 40 visitas: premio real |

---

## 3. Catálogo de eventos (60)

**Estado (2026-07-29):** construidos y verificados en navegador los trece de la
Fase 1 — E01, E02, E04, E09, E18, E21, E26, E27, E31, E35, E39, E46 y el motor
completo (pesos, cooldown, veto de repetición, pausa con pestaña oculta,
memoria compartida con el minijuego). El resto sigue siendo plan.

Esfuerzo: **S** = menos de 30 min · **M** = 1–2 h · **L** = medio día.
✱ = necesita un dato personal tuyo (§5).

### A. Susurros de texto

| # | Nombre | Qué pasa | Disparador | Rareza | Esf. |
|---|---|---|---|---|---|
| E01 | Susurro de bienvenida | Una frase del banco se escribe letra a letra bajo el reloj y se desvanece a los 8 s | al cargar, +2,5 s | garantizado | S |
| E02 | Frase del día | Frase fija para toda la jornada (hash de la fecha): si vuelve a entrar, la reconoce | primera visita del día | garantizado | S |
| E03 | Susurro tardío | Si lleva 90 s con la página abierta, llega una segunda frase más íntima: "¿sigues ahí? yo también" | tiempo en página | poco común | S |
| E04 | Verso solo | Uno de los 7 versos del poema se ilumina y los otros seis bajan al 20 % durante 6 s | ambiente | común | S |
| E05 | Verso número ocho | Aparece al final del poema un verso que no existe y se borra: *"y todavía no termino de escribirte"* | ambiente | raro | S |
| E06 | Nota al margen | Post-it manuscrito e inclinado al costado: "nota: hoy te pensé a las 14:32" (hora real de la visita) | ambiente | poco común | M |
| E07 | Corrección en vivo | En la nota principal, "te amo" se tacha y se reescribe como "te amo un montonazo" | ambiente | raro | M |
| E08 | Tu nombre en el cielo | Las estrellas del fondo se reordenan y forman "Isi" 4 s, luego se dispersan | ambiente | raro | M |

### B. Cosas que cruzan el cielo

| # | Nombre | Qué pasa | Disparador | Rareza | Esf. |
|---|---|---|---|---|---|
| E09 | Estrella fugaz | Cruza en diagonal con estela; una de cada tres deja escrito "pide algo" | ambiente | común | S |
| E10 | Fugaz que se arrepiente | La estrella frena a mitad de camino, tiembla y baja a posarse sobre el número de días | ambiente | poco común | M |
| E11 | La avioneta | Cruza lenta arrastrando un banderín de tela con una frase corta (Principito, aviador) | ambiente | poco común | M |
| E12 | El zorro | Asoma por el borde inferior, mira, parpadea, se esconde. Si ella lo toca a tiempo: *"me domesticaste"* | ambiente + toque | raro | M |
| E13 | La rosa | Crece desde el borde, abre y se queda hasta que la toque; al tocarla suelta un pétalo con una frase | ambiente | raro | M |
| E14 | Luciérnagas | 5–9 puntos cálidos flotan 15 s y huyen suavemente del dedo | ambiente | poco común | M |
| E15 | Globo | Un globo-corazón sube despacio; si lo toca, revienta en confeti mínimo y una frase | ambiente | poco común | M |
| E16 | La luna | Aparece en una esquina con su fase real de esa noche (calculada, sin API); al tocarla: "también te ves de noche" | franja noche | raro | M |
| E17 | Constelación | Siete estrellas se unen con líneas finas y dibujan un corazón, un 7 o una peca | ambiente | raro | M |
| E18 | Satélite | Un punto cruza en línea recta, lentísimo, sin texto. Solo belleza | ambiente | común | S |
| E19 | Polvo dorado | Se levanta desde el borde inferior y vuelve a caer; deja el fondo un punto más cálido 20 s | ambiente | poco común | S |
| E20 | Lluvia de pecas | Puntitos caen y se posan; al posarse forman un segundo la palabra "Pequita" | ambiente | raro | M |

### C. El contador se porta raro

| # | Nombre | Qué pasa | Disparador | Rareza | Esf. |
|---|---|---|---|---|---|
| E21 | Latido | El bloque de segundos late como corazón, tres pulsos | ambiente | común | S |
| E22 | El tiempo se equivoca | El número de días parpadea a "∞" 2 s y vuelve: *"el tiempo también se equivoca"* | ambiente | raro | M |
| E23 | Marcha atrás | Los segundos suben en vez de bajar durante 3 s y se corrigen solos | ambiente | raro | S |
| E24 | Bloque de más | Aparece un quinto bloque etiquetado "besos" con un número absurdo y creciente | ambiente | poco común | M |
| E25 | Etiquetas cariñosas | "días / horas / min / seg" se vuelven 5 s "días sin verte / horas pensándote / minutos tontos / segundos" | ambiente | poco común | S |
| E26 | Dígito enamorado | Un dígito cualquiera se pone rosa y se inclina un momento | ambiente | común | S |
| E27 | El 7 mágico | Cada vez que los segundos muestran un 7 (07, 17, 27…), la caja emite un brillo tenue. Nunca texto: solo luz | continuo | común | S |
| E28 | Capicúa | Cuando los dígitos del reloj son todos iguales o forman capicúa: "haz un deseo" | condicional | poco común | M |
| E29 | Las 2:07 | A las 02:07 y a las 14:07, o cuando el contador marque 2 h 07 min, una frase reservada solo para esa cifra ✱ | condicional | raro | S |
| E30 | Días redondos | Al bajar a 30, 21, 14, 10, 7, 3, 2 y 1 día, la primera visita de esa jornada trae una nota escrita para ese número exacto | programado | garantizado | M |

### D. Interacción (lo que premia curiosear)

| # | Nombre | Qué pasa | Disparador | Rareza | Esf. |
|---|---|---|---|---|---|
| E31 | Estrellas tocables | Cada estrella del fondo se puede tocar: brilla y suelta una palabra suelta ("tuya", "wawa", "siempre") | toque | común | M |
| E32 | Quédate | Mantener pulsado 2 s en cualquier parte: el fondo aclara como un amanecer y aparece "quédate un poquito" | pulsación larga | poco común | M |
| E33 | El reloj al revés | Doble toque en el reloj: se voltea y durante 4 s cuenta los días que llevan juntos en vez de los que faltan ✱ | doble toque | poco común | M |
| E34 | Sacudir | En móvil, agitar el teléfono agita el cielo y las estrellas caen al borde inferior | `devicemotion` | raro | M |
| E35 | Rastro | Arrastrar el dedo deja un reguero de polvo dorado que se apaga en 2 s | arrastre | común | M |
| E36 | El 2/7 | Mantener pulsada la marca "2/7" revela qué es esa fecha y una frase suya ✱ | pulsación larga | poco común | S |
| E37 | Carta corta | Tres toques seguidos sobre la nota principal desbloquean dos líneas escritas que no se repiten nunca | triple toque | raro | M |
| E38 | Aquí te espero | Dos minutos sin tocar nada: el cielo se atenúa y queda "aquí te espero" hasta que vuelva a moverse | inactividad | poco común | S |

### E. Hora, calendario y contexto

| # | Nombre | Qué pasa | Disparador | Rareza | Esf. |
|---|---|---|---|---|---|
| E39 | Saludo por franja | Frase distinta para madrugada, mañana, tarde y noche. La de madrugada es la más tierna: "¿otra vez despierta?" | al cargar | garantizado | S |
| E40 | Domingo lento | Los domingos el fondo va un punto más cálido y la frase habla de descansar | día de semana | poco común | S |
| E41 | Lunes | Frase de aguante para el peor día: "faltan menos, y yo también" | día de semana | común | S |
| E42 | Cumplemés | Los días 7 de cada mes (y los 2, por el 2/7) tienen evento propio ✱ | fecha | poco común | S |
| E43 | Que llueva | Modo lluvia por azar puro (nada de geolocalización): gotas suaves y "que llueva; igual te pienso" | ambiente | poco común | M |
| E44 | Te vi | Tercera visita en días consecutivos: "vienes todos los días… te vi" | racha | poco común | M |
| E45 | Volviste | Más de 3 días sin entrar: "te fuiste un rato; el contador siguió, yo también" | ausencia | poco común | S |
| E46 | Primera del día | La primera visita de cada jornada recibe siempre el evento mejor de la baraja disponible | diario | garantizado | S |
| E47 | Guardia nocturna | Entre 00:00 y 04:00 el cielo se hace más profundo, las estrellas más grandes, y la frase es de insomnio compartido | franja | poco común | S |

### F. Colección y progresión (la razón para volver)

| # | Nombre | Qué pasa | Disparador | Rareza | Esf. |
|---|---|---|---|---|---|
| E48 | Frasco de luciérnagas | Icono discreto abajo: cada evento nuevo añade una luz. Al tocarlo, muestra las frases ya encontradas | permanente | — | L |
| E49 | Sellos del calendario | Cada día visitado deja un sellito en un calendario minúsculo dentro del frasco | permanente | — | M |
| E50 | La semana de los versos | Últimos 7 días: cada jornada enciende para siempre uno de los 7 versos del poema, hasta completarlo el día D | programado | — | M |
| E51 | Sobres dormidos | Últimos 3 días: un sobrecito cerrado aparece en la esquina y se mueve solo (guiño al álbum) | programado | — | M |

### G. Víspera y día D

| # | Nombre | Qué pasa | Disparador | Rareza | Esf. |
|---|---|---|---|---|---|
| E52 | Amanece | Última hora: el fondo empieza a amanecer con un gradiente que sube lentísimo | programado | — | M |
| E53 | Los últimos sesenta | Último minuto: desaparece todo salvo los segundos, enormes, con una frase cada diez | programado | — | M |
| E54 | Medianoche | Al llegar a 0: confeti dorado, los 7 versos se encienden uno a uno y aparece el saludo | programado | — | M |
| E55 | Segunda vida | Pasado el día D la página no muere: cuenta hacia arriba ("llevamos…") y sigue soltando eventos | posterior | — | M |

### H. Legendarios (≈1 de cada 40 visitas)

| # | Nombre | Qué pasa | Esf. |
|---|---|---|---|
| E56 | Lluvia de estrellas | Veinte fugaces en ocho segundos, sin una sola palabra | M |
| E57 | El planeta | Entra por abajo un horizonte curvo con una silueta pequeña sentada, mirando. Dura 10 s | M |
| E58 | Eco del poema | Los 7 versos se desordenan, forman un verso nuevo y vuelven a su sitio | M |
| E59 | Carta relámpago | Cae una hoja doblada, se despliega sola, muestra un párrafo escrito para ese momento y se va | L |
| E60 | Tu voz | Aparece un botón mínimo de play con un audio tuyo de 5 s. Nunca suena solo ✱ | M |

---

## 4. Banco de frases (estilo Bodoque)

Escritas siguiendo la guía canónica: claridad culta sin barroquismo, ritmo por
paralelismo y tríada, metáforas de oficio y de luz, y **dosificación** — la
sentencia densa va al cierre y aparece una de cada varias, nunca encadenada.
Por eso el banco es mayoritariamente llano y concreto: lo lapidario funciona
porque es escaso.

### 4.1 Llanas y concretas (las que más rotan)

1. Vine a ver el contador y me quedé pensando en ti. Otra vez.
2. Faltan menos días de los que llevo queriéndote.
3. No cuento para que pase rápido; cuento para no perderme ninguno.
4. Cada número que baja es una promesa que se acerca.
5. Guardé la sorpresa como se guarda el fuego: tapada, para que no se apague.
6. No sé escribir corto cuando escribo de ti.
7. Hoy el día estuvo pesado y aun así te pensé sin esfuerzo.
8. Te amo un montonazo. Así, sin métrica.
9. Lo mejor del año todavía no pasa, y ya me tiene contento.
10. Si te aburres de esperar, acuérdate de que yo espero contigo.
11. Ojalá supieras cuánto de mi día ocupas sin enterarte.
12. Estoy contando los días con la paciencia de quien ya sabe el final.
13. Falta poco, wawa. Y falta menos cada vez que miras.
14. Cuando llegue el 7, quiero verte la cara antes que nada.
15. Te escribo poco y te pienso mucho; este contador es mi manera de decirlo seguido.

### 4.2 De ternura simple (para franjas horarias y regresos)

16. Buenas noches, pequita. El cielo también hace guardia.
17. ¿Otra vez despierta? Yo igual. Hazme compañía un rato.
18. Volviste a entrar. Yo también estaba aquí.
19. Quédate un poquito, que aquí no molestas nunca.
20. Aquí te espero; es lo que mejor me sale.
21. Buenos días, mi wawa. El día ya empezó mejor.

### 4.3 De juego (para eventos con bicho o con toque)

22. Me domesticaste, y ahora el resto del cielo me parece igual.
23. Pide algo. Si es conmigo, ya está pedido.
24. Esa estrella era mía; ahora es tuya.
25. Toca otra vez, que se me quedó algo por decir.

### 4.4 Densas, de cierre (una cada tanto, jamás dos seguidas)

26. Te amo con la terquedad de lo que se hace todos los días.
27. Hay amores que se anuncian; el nuestro se repite. Prefiero el nuestro.
28. Contigo el tiempo dejó de ser trámite y se volvió lugar.
29. Aprendí a querer despacio para que durara. Está durando.
30. No te extraño en abstracto: extraño cosas exactas.
31. Te elegiría de nuevo, con la misma torpeza y más ganas.
32. Aquí no hay magia; hay alguien que te piensa todos los días.

### 4.5 Ecos del poema (para E04, E05, E58)

33. Del crudo desastre de ser barro, tú eres la parte que vale.
34. Sigo amasando este lodo, y sigue teniendo tu forma.
35. Y todavía no termino de escribirte.
36. Bajo este cielo nuevo, mi nombre importa menos.

### 4.6 Palabras sueltas (E31, estrellas tocables)

tuya · wawa · siempre · pequita · mía · aquí · vuelve · siete · sí · contigo · ya

### 4.7 Notas para los días redondos (E30)

- **30:** Un mes. Cabe en la palma de la mano.
- **21:** Tres semanas. Ya se ve desde aquí.
- **14:** Dos semanas: lo que dura un buen libro.
- **10:** Diez. De aquí en adelante los cuento con los dedos.
- **7:** Siete días y siete versos. No es casualidad, es cariño con calendario.
- **3:** Tres. Ya casi no hay que esperar, solo aguantar.
- **2:** Mañana es la víspera. Duerme temprano, wawa.
- **1:** Hoy es el último día del año en que todavía no fue tu cumpleaños.

---

## 5. Huecos que solo puedes rellenar tú ✱

El banco de arriba es seguro: no inventa hechos vuestros. Estas son las ranuras
donde el sistema se vuelve *vuestro* en vez de bonito y genérico. Con que
contestes en una línea cada una, quedan enchufadas:

1. **Qué es el "2/7"** de la marca superior (E29, E36, E42). Lo he tratado como
   fecha vuestra, sin afirmar cuál.
2. **Fecha desde la que "llevan juntos"**, para el reloj al revés (E33).
3. **Tres o cuatro referencias internas**: un apodo más, un chiste repetido, una
   canción, un lugar, algo que ella diga siempre. Cada una da 2–3 eventos.
4. **Un audio tuyo de 5 segundos** para E60, si lo quieres.
5. **Un párrafo tuyo** para la carta relámpago (E59) o lo escribo yo y lo corriges.

---

## 5 bis. Minijuego "atrapar estrellas" — YA IMPLEMENTADO

Vive en el mismo `index.html`, detrás del botón *atrapar estrellas ✦* bajo el
contador. Sesenta segundos, sin forma de perder: lo que se escapa se escapa, y
el reloj es el único final.

- **Acelera por dos vías**, que es lo que se pidió: un escalón cada nueve
  segundos (seis niveles) y un empujón pequeño por cada acierto. Medido en el
  navegador: 191 px/s al empezar → 332 a mitad → 445 al final (×2,3). La
  cadencia de aparición baja de 700 ms a 250 ms, así que la pantalla mantiene
  6–7 objetos: no se llena, se vuelve rápida.
- **Tres cosas caen:** estrella (1 punto), corazón (3 puntos, más lento y
  escaso) y luciérnaga (1 punto, deriva de lado).
- **Se atrapa tocando o barriendo el dedo**: a alta velocidad, barrer es más
  justo que picotear.
- **Cada 7 atrapadas** (guiño al 7 de agosto) aparece una frase del banco, sin
  repetir hasta agotarlo. Cada escalón de velocidad suelta un pique tierno
  ("más rápido, wawa").
- **Récord y total** en `localStorage`, bajo la misma clave `pequita.contador`
  que usará el motor de eventos. Si `localStorage` está bloqueado, se juega igual.
- Respeta `prefers-reduced-motion` (menos velocidad, sin partículas) y pausa la
  partida si se va a otra pestaña.
- El fondo del juego es semitransparente a propósito: el cielo titilante de la
  portada se sigue viendo detrás.

Pendiente de tu decisión: conectarlo al **frasco de luciérnagas** (E48) para que
las estrellas atrapadas alimenten la colección, y decidir si el día D el juego
se sustituye por el enlace al álbum.

## 6. Fases de implementación

**Fase 1 — HECHA.** Capas nuevas, motor con pesos y cooldown, persistencia, y
los eventos E01, E02, E04, E09, E18, E21, E26, E27, E31, E35, E39 y E46. Notas
de implementación:

- El ambiente dispara un evento cada 25–75 s; ninguno se repite mientras esté
  entre los tres últimos vistos; nunca hay dos a la vez.
- Al entrar: saludo según la franja horaria a los 2,5 s y, si es la primera
  visita del día, la frase reservada para hoy a los 13 s.
- Banco de frases único (26) compartido con el minijuego, barajado sin
  repetición hasta agotarlo. La frase del día es determinista por fecha.
- El poema pasó a llevar cada verso en su propio `<span class="verso">`; el
  `<br>` y el `nowrap` siguen igual, así que los 7 versos siguen en una línea.
- `body` lleva `user-select: none`: arrastrar el dedo deja polvo dorado y ya no
  selecciona el poema ni saca la lupa de iOS.
- **Modo de prueba:** `?rapido` encadena eventos cada 2,5 s y `?evento=<id>`
  fuerza uno concreto (`fugaz`, `satelite`, `latido`, `digito`, `verso`,
  `susurro`). Sin parámetros, la página se comporta normal.

**Fase 2 — carácter (≈3–4 h).** Criaturas (E11–E17, E20), rarezas del contador
(E22–E25, E28), interacción (E32, E33, E37, E38), contexto (E40–E45, E47).

**Fase 3 — memoria y final (≈3–4 h).** Frasco y sellos (E48, E49), semana de los
versos (E50), sobres (E51), víspera y día D (E52–E55), legendarios (E56–E60).

Cada fase es desplegable por sí sola: si nos quedamos en la 1, la página ya
cumple el objetivo.

---

## 7. Verificación

- Dev server **solo en `127.0.0.1`** (regla del proyecto) y prueba con Playwright.
- Modo "acelerado": parámetro `?t=` en la URL para simular una fecha y poder ver
  los eventos programados (7 días, última hora, medianoche) sin esperar.
- Parámetro `?evento=<id>` para forzar uno concreto y revisarlo en móvil.
- Comprobar: iPhone en vertical (es donde ella lo va a ver), `prefers-reduced-motion`,
  pestaña en segundo plano, y `localStorage` bloqueado.
- Nada de generación de imágenes ni assets pesados en local: todo es CSS y SVG
  inline dibujado a mano.
