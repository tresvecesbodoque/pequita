/* ══════════════════════════════════════════════════════════════════
   Eventos de la portada — catálogo completo (E01–E60).

   Reglas que no se rompen: nunca dos a la vez, nada tapa el contador,
   nada exige reacción, ninguno se repite mientras esté entre los últimos
   vistos, y el azar decide CUÁL aparece, nunca SI aparece.

   Modo de prueba: ?rapido encadena eventos cada 2,5 s y ?evento=<id>
   fuerza uno concreto (los ids son los de la lista AMBIENTE y los de
   FORZABLES, al final del archivo).
   ══════════════════════════════════════════════════════════════════ */
(function () {

  // ── LO QUE SOLO PUEDE RELLENAR ÉL ────────────────────────────────
  // Mientras estén vacíos, los eventos que dependen de ellos quedan
  // dormidos en vez de inventarse un dato que no me consta.
  var CONFIG = {
    // El "2/7" de la portada NO es una fecha: es la segunda entrega de un
    // poema de siete estrofas, y lo que se lee abajo es esa segunda estrofa.
    dosSiete: {
      hora: 2, minuto: 7,     // el reloj marca 2:07 → guiño a la cifra
      texto: "2:07. dos de siete, como el poema",
      revelacion: "segunda de siete estrofas. las otras te van a llegar"
    },
    // Empezamos el 7 de marzo de 2026 a las 21:00 (Chile, UTC−3 en marzo).
    juntosDesde: "2026-03-07T21:00:00-03:00",
    audio: "",                // mp3 corto de su voz → enciende E60
    // Palabras que sueltan las estrellas al tocarlas. Si esta lista tiene
    // algo, se usan EN ORDEN (una por toque) en vez de las de por defecto:
    // pega aquí las que quieras, una por línea.
    palabrasEnOrden: [],
    // La canción del día: se elige una por fecha y suena como si nunca se
    // hubiera detenido desde la medianoche.
    canciones: ["musica/01-morfina.mp3"]
  };

  // ══════════════════════════════════════════════════════════════════
  //  TEXTOS
  //  Todo lo que dice el sitio vive en textos.txt, para poder reescribirlo
  //  sin tocar código. Lo de aquí abajo es solo la copia de fábrica: si el
  //  archivo trae un bloque, pisa a esta; si no, esta sigue en pie.
  // ══════════════════════════════════════════════════════════════════
  var TEXTOS = {
    "saludo.madrugada": ["¿otra vez despierta? yo igual. hazme compañía un rato"],
    "saludo.manana":    ["buenos días, mi wawa. el día ya empezó mejor"],
    "saludo.tarde":     ["hola, pequita. pasé a dejarte algo y me quedé"],
    "saludo.noche":     ["buenas noches, pequita. el cielo también hace guardia"],
    palabras: ["quédate", "vuelve", "mírame", "otra vez", "sigo aquí",
               "no me voy", "dilo", "sí", "tuya", "dos de siete", "ya falta poco"],
    avisos: ["por hoy ya te mostré bastante. vuelve como a las {hora} y traigo más",
             "hasta aquí llega esta tanda. a eso de las {hora} hay cosas nuevas",
             "me guardo el resto. vuelve a las {hora}, que no se me olvida"],
    zorro: ["me domesticaste, y ahora el resto del cielo me parece igual"],
    rosa: ["no me riegues, quédate"],
    globo: ["eso también era para ti"],
    planeta: ["este mundo es nuestro"],
    luna: ["también te ves de noche"],
    fugaz: ["pide algo"],
    "luciernagas.fin": [],
    infinito: ["el tiempo también se equivoca"],
    capicua: ["haz un deseo"],
    "dosSiete.hora": ["2:07. dos de siete, como el poema"],
    "dosSiete.marca": ["segunda de siete estrofas. las otras te van a llegar"],
    sietes: ["siete días. siete versos. siete estrofas"],
    lunes: ["faltan menos, y yo también"],
    dia7: ["hoy es 7: el número que nos persigue"],
    dia2: ["dos de siete. todavía quedan cinco por llegar"],
    racha: ["vienes todos los días… te vi"],
    ausencia: ["te fuiste un rato; el contador siguió, yo también"],
    tardio: ["¿sigues ahí? yo también"],
    inactividad: ["aquí te espero; es lo que mejor me sale"],
    pulsacion: ["quédate un poquito, que aquí no molestas nunca"],
    giro: ["se te cayó el cielo encima"],
    lluvia: ["que llueva; igual te pienso"],
    margen: ["nota: te pensé a las {hora}, en medio de otra cosa"],
    verso8: ["y todavía no termino de escribirte"],
    "segunda-vida": ["llevamos {dias} desde tu cumpleaños, y el contador sigue por gusto"],
    correcciones: ["muchísimo cariño", "un cariño que no cabe aquí",
                   "mucho cariño y bastante insomnio", "cariño y semanas de trabajo",
                   "mucho cariño, y me quedo corto"],
    banderines: ["te amo un montonazo", "falta poco, wawa", "sigo aquí",
                 "vuelvo en un rato", "esto lo escribí pensándote"],
    cartas: ["Encontraste esto escarbando. Así encontraste todo lo mío: sin avisar.",
             "Si estás leyendo esto es que insististe. Me gusta que insistas.",
             "Dos líneas nada más: te amo, y ya falta menos.",
             "Nadie más va a leer esto. Es tuyo, como casi todo lo que escribo.",
             "La tercera estrofa ya está escrita. No la vas a ver hoy.",
             "Siete estrofas, y todas dicen lo mismo de maneras distintas."],
    "carta.diad": ["Séptima de siete. Hoy sí: entra y lee todo lo demás."],
    "dias.30": ["Un mes. Cabe en la palma de la mano."],
    "dias.21": ["Tres semanas. Ya se ve desde aquí."],
    "dias.14": ["Dos semanas: lo que dura un buen libro."],
    "dias.10": ["Diez. De aquí en adelante los cuento con los dedos."],
    "dias.7": ["Siete días y siete versos. No es casualidad, es cariño con calendario."],
    "dias.3": ["Tres. Ya casi no hay que esperar, solo aguantar."],
    "dias.2": ["Mañana es la víspera. Duerme temprano, wawa."],
    "dias.1": ["Hoy es el último día del año en que todavía no fue tu cumpleaños."],
    "lluvia-estrellas": ["todas para ti"],
    eco: ["divina, boca viva… llueve este cuerpo nuevo en tu noche",
          "asumo el crudo desastre… bajo este nuevo cielo",
          "dedos que amasan… el filo de ser vulnerable"],
    "carta-relampago": ["Te escribo esto sabiendo que va a durar diez segundos en tu " +
      "pantalla y años en mi cabeza. No hace falta que lo guardes: lo que quiero " +
      "decirte no cabe en una hoja que se cae del cielo. Te amo, y llevo semanas " +
      "preparándote algo que todavía no puedes ver."],
    "cuenta-final": ["ya está", "respira", "un poco más", "casi", "ahora sí",
                     "feliz cumpleaños, wawa"],
    "juego.piques": ["más rápido, wawa", "eso, eso", "no se te escapan",
                     "esto ya es tuyo", "ahora sí que corren"],
    "juego.cierres": ["no atrapaste ninguna, y da igual: viniste, que es lo que quería",
                      "las estrellas son difíciles; yo tampoco te atrapé a la primera",
                      "eso ha sido rapidísimo. te amo un montonazo"]
  };
  window.TEXTOS = TEXTOS;

  function TL(clave) { return TEXTOS[clave] || []; }          // la lista entera
  function T(clave) { return TL(clave)[0] || ""; }            // la primera línea

  // Lee textos.txt: [etiqueta] abre bloque, # es comentario, el resto son
  // líneas de texto. Un bloque vacío deja en pie el texto de fábrica.
  function leerTextos(crudo) {
    var bloques = {}, clave = null;
    crudo.split("\n").forEach(function (linea) {
      var l = linea.trim();
      if (!l || l.charAt(0) === "#") return;
      var m = l.match(/^\[([\w.-]+)\]$/);
      if (m) { clave = m[1]; bloques[clave] = []; return; }
      if (clave) bloques[clave].push(l);
    });
    Object.keys(bloques).forEach(function (k) {
      if (bloques[k].length) TEXTOS[k] = bloques[k];
    });
    if (bloques.banco && bloques.banco.length && window.reemplazarBanco) {
      window.reemplazarBanco(bloques.banco);
    }
  }

  // ── Utilidades ───────────────────────────────────────────────────
  var capa = document.getElementById("capaEventos");
  var elSusurro = document.getElementById("susurroPortada");
  var poema = document.getElementById("poema");
  var versos = poema ? poema.getElementsByClassName("verso") : [];
  // Los versos que la última semana enciende PARA SIEMPRE (E50) son los de la
  // segunda estrofa: son los que ella lleva ganando desde cuando el poema era
  // solo esa. Contarlos desde el principio de los veintiuno le movería el oro
  // a otros versos y le borraría lo ganado.
  var estrofas = poema ? poema.getElementsByClassName("estrofa") : [];
  var versosSemana = estrofas.length > 1
    ? estrofas[1].getElementsByClassName("verso")
    : versos;
  var cieloEl = document.getElementById("cielo");
  var juegoEl = document.getElementById("juego");
  var relojEl = document.getElementById("reloj");
  var notaEl = document.getElementById("nota");
  var marcaEl = document.getElementById("marca");
  var cuerpo = document.body;
  var ETIQUETAS = relojEl ? Array.prototype.map.call(relojEl.querySelectorAll(".lab"),
    function (l) { return l.textContent; }) : [];
  var NOTA_CARINO = (document.getElementById("notaCarino") || {}).textContent || "";

  var suave = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function jugando() { return juegoEl && juegoEl.classList.contains("viva"); }
  function az(a, b) { return a + Math.random() * (b - a); }
  function uno(lista) { return lista[Math.floor(Math.random() * lista.length)]; }

  // Todo lo que aparece se queda un poco más de lo que pedía cada evento, por
  // si mira tarde. Poco: a los 15 segundos la pantalla vuelve a ser solo el
  // contador (ver TOPE), y es preferible que cada cosa se apague sola antes de
  // que la barra el reloj.
  var MAS = 4000;

  // Nada dura más de esto en pantalla. Antes cada evento se quedaba lo suyo
  // más quince segundos, así que se solapaba con el siguiente y el cielo
  // acababa lleno de cosas a la vez.
  var TOPE = 15000;

  // Los primeros quince segundos son para leer: está el texto y está el
  // contador, y no sale ni un evento. Cumplidos, el texto se retira —sin
  // moverse de sitio, para que el contador no dé un salto— y a partir de ahí
  // la pantalla es el contador, el frasco y lo que traiga el cielo.
  var CALMA = 15000;
  var ARRANQUE = Date.now();
  function enCalma() { return Date.now() - ARRANQUE < CALMA; }
  function despejar() { if (!enCalma()) cuerpo.classList.add("despejado"); }
  function volverElTexto() { cuerpo.classList.remove("despejado"); }
  // Con el del navegador a propósito: aquí arriba el setTimeout de la casa
  // todavía no tiene a quién llamar (_plazo se asigna más abajo).
  window.setTimeout(despejar, CALMA);

  // ══════════════════════════════════════════════════════════════════
  //  LA ESCENA
  //  Solo puede haber un evento en pantalla. Todo lo que crea (nodos y
  //  temporizadores) queda apuntado en su escena, así que empezar otro
  //  —o darle a detener— lo retira entero. Sin esto, repetir el avión
  //  siete veces dejaba siete aviones volando a la vez.
  // ══════════════════════════════════════════════════════════════════
  var escenaActual = null;   // a quién se apuntan los plazos en este instante
  var escenaViva = null;     // la que está en pantalla y hay que poder retirar
  var _plazo = window.setTimeout.bind(window);
  var _intervalo = window.setInterval.bind(window);

  function conEscena(esc, fn) {
    return function () {
      var previa = escenaActual;
      escenaActual = esc;
      try { fn.apply(this, arguments); } finally { escenaActual = previa; }
    };
  }

  // Estos dos tapan a los del navegador SOLO dentro de este archivo: si hay
  // escena en marcha, el temporizador se apunta en ella y muere con ella.
  function setTimeout(fn, ms) {
    var esc = escenaActual;
    var id = _plazo(esc ? conEscena(esc, fn) : fn, ms);
    if (esc) esc.plazos.push(id);
    return id;
  }
  function setInterval(fn, ms) {
    var esc = escenaActual;
    var id = _intervalo(esc ? conEscena(esc, fn) : fn, ms);
    if (esc) esc.intervalos.push(id);
    return id;
  }

  function apuntarNodo(el) {
    if (escenaActual) escenaActual.nodos.push(el);
    return el;
  }

  function pon(el, ms) {
    ms += MAS;
    capa.appendChild(el);
    apuntarNodo(el);
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, ms);
    return el;
  }
  function ponFijo(el, ms) {
    ms += MAS;
    document.body.appendChild(el);
    apuntarNodo(el);
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, ms);
    return el;
  }
  function svg(alto, ancho, contenido) {
    return '<svg width="' + ancho + '" height="' + alto + '" viewBox="0 0 ' + ancho + ' ' + alto +
      '" fill="none" stroke="#d9a83f" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
      contenido + '</svg>';
  }

  // Un susurro también alimenta la colección del frasco (E48).
  function susurrar(texto, coleccionable) {
    elSusurro.textContent = texto;
    elSusurro.classList.remove("viva");
    void elSusurro.offsetWidth;
    elSusurro.classList.add("viva");
    if (coleccionable !== false) guardarEnFrasco(texto);
  }

  // ── Memoria ──────────────────────────────────────────────────────
  var mem = leerMem();
  mem.coleccion = mem.coleccion || [];
  mem.dias = mem.dias || [];
  mem.versos = mem.versos || 0;
  mem.cartas = mem.cartas || [];
  mem.registro = mem.registro || [];      // lo que ha ido pasando, para revivirlo

  // Guarda MEZCLANDO con lo que ya hay en disco. Si escribiéramos nuestra
  // copia entera, borraríamos lo que hayan guardado mientras tanto el
  // minijuego (récord y partidas) o el poema plegable, porque ellos leen y
  // escriben por su cuenta. Ese era el modo de perder el frasco.
  function persistir() {
    var disco = leerMem();
    for (var k in mem) if (Object.prototype.hasOwnProperty.call(mem, k)) disco[k] = mem[k];
    guardarMem(disco);
  }

  function guardarEnFrasco(texto) {
    if (mem.coleccion.indexOf(texto) < 0) {
      mem.coleccion.push(texto);
      persistir();
      pintarFrasco();
    }
  }

  var hoy = fechaLocal();
  var ayer = fechaLocal(new Date(Date.now() - 86400000));
  var primeraDelDia = mem.ultimaVisita !== hoy;                    // E46
  var diasFuera = 0;
  if (mem.ultimaVisita) {
    diasFuera = Math.round((new Date(hoy) - new Date(mem.ultimaVisita)) / 86400000);
  }
  if (primeraDelDia) {
    mem.racha = mem.ultimaVisita === ayer ? (mem.racha || 0) + 1 : 1;
    if (mem.dias.indexOf(hoy) < 0) mem.dias.push(hoy);             // E49
  }
  mem.visitas = (mem.visitas || 0) + 1;
  mem.visitasHoy = primeraDelDia ? 1 : (mem.visitasHoy || 0) + 1;
  mem.ultimaVisita = hoy;
  persistir();

  function restante() { return (window.OBJETIVO || 0) - Date.now(); }
  function diasQueFaltan() { return Math.floor(restante() / 86400000); }

  // ── Tipografía de estrellas (E08, E20) ───────────────────────────
  var GLIFOS = {
    I: ["111", "010", "010", "010", "111"],
    S: ["111", "100", "111", "001", "111"],
    P: ["111", "101", "111", "100", "100"],
    E: ["111", "100", "110", "100", "111"],
    Q: ["111", "101", "101", "111", "011"],
    U: ["101", "101", "101", "101", "111"],
    T: ["111", "010", "010", "010", "010"],
    A: ["111", "101", "111", "101", "101"]
  };

  function escribirConPuntos(palabra, arriba, paso) {
    var letras = palabra.toUpperCase().split("");
    var ancho = letras.length * 4 * paso;
    var x0 = (window.innerWidth - ancho) / 2;
    var puntos = [];
    letras.forEach(function (letra, i) {
      var g = GLIFOS[letra];
      if (!g) return;
      for (var f = 0; f < 5; f++) {
        for (var c = 0; c < 3; c++) {
          if (g[f][c] !== "1") continue;
          var el = document.createElement("div");
          el.className = "punto-fino";
          el.style.left = (x0 + (i * 4 + c) * paso) + "px";
          el.style.top = (arriba + f * paso) + "px";
          capa.appendChild(el);
          apuntarNodo(el);   // si no, al detener la escena PEQUITA se queda pegada
          puntos.push(el);
        }
      }
    });
    puntos.forEach(function (p, i) {
      setTimeout(function () { p.classList.add("viva"); }, i * 18);
    });
    setTimeout(function () {
      puntos.forEach(function (p) { p.classList.remove("viva"); });
      setTimeout(function () {
        puntos.forEach(function (p) { if (p.parentNode) p.parentNode.removeChild(p); });
      }, 900);
    }, 4200 + MAS);
    return puntos;
  }

  // Coloca un texto flotante junto al poema sin taparlo ni tapar los botones.
  // Primero prueba debajo; si ahí no cabe —en un iPhone con el poema abierto,
  // "debajo" se sale de la pantalla—, lo pone encima; y si tampoco, lo mete a
  // la fuerza dentro del borde. Nunca se queda pisando un botón.
  function colocarJuntoAlPoema(el) {
    var caja = (document.getElementById("poemaCaja") || poema);
    if (!caja) return;
    var r = caja.getBoundingClientRect();
    var alto = el.offsetHeight || 26;
    var aire = 10, borde = 12;
    var estorbos = [];
    ["poemaAbrir", "juegoAbrir"].forEach(function (id) {
      var n = document.getElementById(id);
      if (n && n.offsetParent !== null) estorbos.push(n.getBoundingClientRect());
    });
    function cabe(y) {
      if (y < borde || y + alto > window.innerHeight - borde) return false;
      for (var i = 0; i < estorbos.length; i++) {
        if (!(y + alto < estorbos[i].top - 4 || y > estorbos[i].bottom + 4)) return false;
      }
      return true;
    }
    var debajo = r.bottom + aire, encima = r.top - alto - aire, y;
    if (cabe(debajo)) y = debajo;
    else if (cabe(encima)) y = encima;
    else y = Math.max(borde, Math.min(debajo, window.innerHeight - alto - borde));
    el.style.top = y + "px";
  }

  // ── Dibujos ──────────────────────────────────────────────────────
  var DIBUJO = {
    // El zorro va por partes para poder animarlo: cola que barre, orejas que
    // giran, párpados que bajan. Entra caminando y se va caminando.
    // Zorro sentado de perfil, mirando a la izquierda: hocico en punta,
    // orejas altas, lomo que baja y cola gruesa enroscada detrás.
    zorro: '<svg class="zorro-svg" width="104" height="78" viewBox="0 0 104 78" fill="none" ' +
      'stroke="#d9a83f" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
      '<g class="cola"><path d="M72 70c16 3 26 -8 23 -22 -2 -11 -13 -14 -18 -6 -3 5 -1 10 4 11"/></g>' +
      '<path class="cuerpo" d="M45 40c9 2 17 10 22 20 3 6 4 10 4 10H44c-3 -10 -2 -22 1 -30z"/>' +
      '<path class="pata" d="M47 54c-1 6 -1 12 0 16"/>' +
      '<g class="cabeza">' +
      '<g class="oreja izq"><path d="M25 30 L26 11 L39 23"/></g>' +
      '<g class="oreja der"><path d="M44 25 L53 12 L55 30"/></g>' +
      '<path d="M25 30c-2 8 2 15 10 18 10 3 18 -3 20 -14 1 -5 0 -7 -2 -9"/>' +
      '<path d="M25 33 L9 41"/>' +
      '<path d="M9 41c5 4 11 6 18 5"/>' +
      '<circle class="ojo" cx="31" cy="35" r="1.8" fill="#d9a83f" stroke="none"/>' +
      '<path class="parpados" d="M28 35h6" stroke-width="2.4"/>' +
      '<circle cx="9.5" cy="41" r="2" fill="#d9a83f" stroke="none"/>' +
      '</g></svg>',

    // La rosa abre en tres tiempos y luego se mece.
    rosa: '<svg class="rosa-svg" width="60" height="104" viewBox="0 0 60 104" fill="none" ' +
      'stroke="#d9a83f" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' +
      '<path class="tallo" d="M30 100V46"/>' +
      '<path class="hoja izq" d="M30 74c-10 0 -15 -5 -16 -13 9 -1 14 4 16 13z"/>' +
      '<path class="hoja der" d="M30 62c10 -1 15 -6 15 -14 -9 -1 -14 4 -15 14z"/>' +
      '<g class="flor">' +
      '<path class="capa3" d="M30 46c-10 0 -16 -8 -16 -16 0 -9 7 -16 16 -16 9 0 16 7 16 16 0 8 -6 16 -16 16z"/>' +
      '<path class="capa2" d="M21 27c1 -7 5 -11 9 -11 4 0 8 4 9 11 -1 6 -5 9 -9 9 -4 0 -8 -3 -9 -9z"/>' +
      '<path class="capa1" d="M26 27c0 -3 2 -5 4 -5 2 0 4 2 4 5 0 3 -2 4 -4 4 -2 0 -4 -1 -4 -4z"/>' +
      '</g></svg>',
    avioneta: svg(34, 58, '<path d="M4 20h30l14-8-6 8h12l-8 6H10z"/><path d="M20 26l-4 6"/><circle cx="46" cy="20" r="2"/>'),
    globo: svg(64, 42, '<path d="M21 34c-9-7-17-12-17-20 0-6 5-10 10-10 3 0 6 2 7 5 1-3 4-5 7-5 5 0 10 4 10 10 0 8-8 13-17 20z" stroke="#c96b74"/>' +
      '<path d="M21 34v26" stroke="rgba(217,168,63,.6)"/>'),
    // Luciérnaga: dos alas que baten y el abdomen encendido.
    luciernaga: '<svg width="24" height="16" viewBox="0 0 24 16" fill="none">' +
      '<g class="ala izq"><ellipse cx="9" cy="6" rx="6" ry="3.2" ' +
      'fill="rgba(246,227,200,.18)" stroke="rgba(246,227,200,.55)" stroke-width=".7"/></g>' +
      '<g class="ala der"><ellipse cx="15" cy="6" rx="6" ry="3.2" ' +
      'fill="rgba(246,227,200,.18)" stroke="rgba(246,227,200,.55)" stroke-width=".7"/></g>' +
      '<path d="M12 7v5" stroke="rgba(246,227,200,.7)" stroke-width="1.2" stroke-linecap="round"/>' +
      '<circle class="panza" cx="12" cy="12" r="3.1" fill="#f6e3c8"/></svg>',

    sobre: svg(30, 42, '<rect x="2" y="4" width="38" height="24" rx="2"/><path d="M2 6l19 13L40 6"/>')
  };

  // Fase real: días transcurridos desde una luna nueva conocida.
  // 0 = nueva, 0,5 = llena.
  function faseLunar() {
    var sinodico = 29.530588853;
    var nueva = Date.UTC(2000, 0, 6, 18, 14) / 86400000;
    return (((Date.now() / 86400000) - nueva) % sinodico) / sinodico;
  }

  function luna() {
    var fase = faseLunar();
    var r = 26, desvio = Math.cos(fase * Math.PI * 2) * r * 1.05;
    return '<svg width="64" height="64" viewBox="0 0 64 64">' +
      '<circle cx="32" cy="32" r="' + r + '" fill="#f6e3c8" opacity=".92"/>' +
      '<circle cx="' + (32 + desvio) + '" cy="32" r="' + r + '" fill="#0a1020"/></svg>';
  }

  // ── Textos ───────────────────────────────────────────────────────








  // ══════════════════════════════════════════════════════════════════
  //  CATÁLOGO DE AMBIENTE (los que salen solos, por azar)
  // ══════════════════════════════════════════════════════════════════
  var AMBIENTE = [

    // ── Susurros de texto ────────────────────────────────────────
    { id: "susurro", peso: 8, dura: 23500, correr: function () {           // E01
        susurrar(fraseAlAzar());
      } },

    { id: "verso", peso: 7, dura: 22000, correr: function () {             // E04
        if (window.abrirPoema) window.abrirPoema(7500);
        var i = Math.floor(Math.random() * versos.length);
        // Con tres estrofas, el verso elegido puede estar en otra: no sirve de
        // nada encenderlo donde ella no lo está mirando.
        if (window.mostrarVerso) window.mostrarVerso(versos[i]);
        poema.classList.add("enfocado");
        versos[i].classList.add("viva");
        setTimeout(function () {
          poema.classList.remove("enfocado");
          versos[i].classList.remove("viva");
        }, 6000 + MAS);
      } },

    { id: "verso-extra", peso: 3, dura: 22500, correr: function () {       // E05
        if (window.abrirPoema) window.abrirPoema(8500);
        var el = document.createElement("p");
        el.className = "verso-extra";
        el.textContent = T("verso8");
        ponFijo(el, 7200);
        // Se coloca cuando el poema ya terminó de desplegarse; si no, se mide
        // una caja a medio abrir y el verso acaba encima de los otros siete.
        setTimeout(function () { colocarJuntoAlPoema(el); }, 900);
        setTimeout(function () { colocarJuntoAlPoema(el); }, 1800);
        void el.offsetWidth;
        el.classList.add("viva");
        guardarEnFrasco(T("verso8"));
      } },

    { id: "margen", peso: 4, dura: 24500, correr: function () {            // E06
        var ahora = new Date();
        var el = document.createElement("div");
        el.className = "margen";
        el.textContent = T("margen").replace("{hora}",
          ahora.getHours() + ":" + ("0" + ahora.getMinutes()).slice(-2));
        var derecha = Math.random() < 0.5;
        el.style.top = az(18, 62) + "vh";
        if (derecha) el.style.right = "4vw"; else el.style.left = "4vw";
        ponFijo(el, 9200);
      } },

    { id: "correccion", peso: 3, dura: 21500, correr: function () {        // E07
        var span = document.getElementById("notaCarino");
        if (!span) return;
        volverElTexto();   // este evento se escribe encima de la nota
        var original = span.textContent;
        var mejor = uno(TL("correcciones"));
        span.innerHTML = '<span class="tachado">' + original + '</span>';
        setTimeout(function () {
          span.innerHTML = '<span class="tachado">' + original + '</span> ' +
            '<span class="reescrito">' + mejor + '</span>';
        }, 1100);
        setTimeout(function () { span.textContent = original; }, 6000 + MAS);
      } },

    { id: "nombre", peso: 2, dura: 21500, correr: function () {            // E08
        escribirConPuntos("ISI", window.innerHeight * 0.12, 11);
      } },

    // ── Cosas que cruzan el cielo ────────────────────────────────
    { id: "fugaz", peso: 9, dura: 18000, movimiento: true, correr: function () {   // E09
        var el = document.createElement("div");
        el.className = "fugaz";
        el.style.left = (Math.random() * 30) + "vw";
        el.style.top = (4 + Math.random() * 22) + "vh";
        pon(el, 2600);
        void el.offsetWidth;
        el.classList.add("corre");
        if (Math.random() < 0.34) setTimeout(function () { susurrar(T("fugaz"), false); }, 900);
      } },

    { id: "fugaz-lenta", peso: 3, dura: 22000, movimiento: true, correr: function () {  // E10
        var el = document.createElement("div");
        el.className = "fugaz-lenta";
        el.style.left = az(10, 40) + "vw";
        el.style.top = az(8, 20) + "vh";
        pon(el, 6800);
        var destino = document.getElementById("d").getBoundingClientRect();
        setTimeout(function () {
          el.style.transform = "translate(" + az(20, 40) + "vw, " + az(10, 18) + "vh)";
        }, 60);
        setTimeout(function () { el.classList.add("tiembla"); }, 1400);
        setTimeout(function () {
          el.classList.remove("tiembla");
          var caja = el.getBoundingClientRect();
          el.style.transform = "translate(" +
            (destino.left + destino.width / 2 - caja.left) + "px," +
            (destino.top + destino.height / 2 - caja.top) + "px)";
        }, 2600);
        setTimeout(function () {
          el.style.opacity = "0";
          document.getElementById("d").parentNode.classList.add("siete");
          setTimeout(function () {
            document.getElementById("d").parentNode.classList.remove("siete");
          }, 1200);
        }, 4200);
      } },

    { id: "avioneta", peso: 4, dura: 30500, movimiento: true, correr: function () {    // E11
        var el = document.createElement("div");
        el.className = "avioneta";
        el.style.top = az(10, 26) + "vh";
        el.innerHTML = '<span class="banderin">' + uno(TL("banderines")) + '</span>' +
          '<span class="cuerda"></span>' + DIBUJO.avioneta;
        pon(el, 15200);
      } },

    { id: "zorro", peso: 2, dura: 24500, correr: function () {             // E12
        var el = document.createElement("div");
        el.className = "criatura zorro tocable";
        el.style.left = az(12, 62) + "vw";
        el.innerHTML = DIBUJO.zorro;
        el.addEventListener("click", function () {
          // Levanta la cabeza antes de irse; no se desvanece, se va andando.
          el.classList.add("mirando");
          susurrar(T("zorro"));
          setTimeout(function () { el.classList.add("se-va"); }, 1400 + MAS);
        });
        pon(el, 9200);
      } },

    { id: "rosa", peso: 2, dura: 24500, correr: function () {              // E13
        var el = document.createElement("div");
        el.className = "criatura rosa tocable";
        el.style.left = az(12, 66) + "vw";
        el.innerHTML = DIBUJO.rosa;
        el.addEventListener("click", function () {
          el.classList.add("abierta");
          var p = document.createElement("div");
          p.className = "petalo";
          p.textContent = T("rosa");
          var caja = el.getBoundingClientRect();
          p.style.left = caja.left + "px";
          p.style.top = caja.top + "px";
          pon(p, 3400);
        });
        pon(el, 9200);
      } },

    { id: "luciernagas", peso: 4, dura: 31000, correr: function () {      // E14
        var bichos = [];
        var cuantas = Math.round(az(5, 9));
        for (var i = 0; i < cuantas; i++) {
          var el = document.createElement("div");
          el.className = "luciernaga";
          el.innerHTML = DIBUJO.luciernaga;
          el.style.left = az(10, 90) + "vw";
          el.style.top = az(20, 80) + "vh";
          el.style.setProperty("--aleteo", az(.16, .26).toFixed(2) + "s");
          bichos.push(pon(el, 15500));
        }
        function huir(e) {
          bichos.forEach(function (b) {
            var c = b.getBoundingClientRect();
            var dx = c.left - e.clientX, dy = c.top - e.clientY;
            if (dx * dx + dy * dy < 9000) {
              b.style.transform = "translate(" + (dx > 0 ? 60 : -60) + "px," + (dy > 0 ? 40 : -40) + "px)";
            }
          });
        }
        document.addEventListener("pointermove", huir);
        setTimeout(function () { document.removeEventListener("pointermove", huir); }, 15500 + MAS);
      } },

    { id: "globo", peso: 3, dura: 29500, movimiento: true, correr: function () {   // E15
        var el = document.createElement("div");
        el.className = "globo tocable";
        el.style.left = az(15, 75) + "vw";
        el.innerHTML = DIBUJO.globo;
        el.addEventListener("click", function () {
          var caja = el.getBoundingClientRect();
          confeti(12, caja.left, caja.top);
          el.style.display = "none";
          susurrar(T("globo"));
        });
        pon(el, 14200);
      } },

    { id: "luna", peso: 3, dura: 31500, cuando: function () {             // E16
        var h = new Date().getHours(); return h >= 19 || h < 7;
      }, correr: function () {
        var el = document.createElement("div");
        el.className = "luna tocable";
        el.innerHTML = luna();
        el.addEventListener("click", function () { susurrar(T("luna")); });
        pon(el, 16200);
      } },

    { id: "constelacion", peso: 2, dura: 24000, correr: function () {      // E17
        // Siete estrellas que dibujan un SIETE: tres en el palo de arriba y
        // cuatro bajando en diagonal. La línea no cierra —un 7 no se cierra— y
        // se traza sola de la primera a la última, como si alguien lo apuntara.
        var forma = [[0,0],[15,0],[30,0],[25,12],[20,24],[15,36],[10,48]];
        // Se dibuja en el trozo de cielo que queda LIBRE encima del texto, y
        // se encoge si hace falta: antes bajaba hasta el título y se lo comía.
        var arriba = 34;
        var cabecera = document.getElementById("marca") || document.querySelector(".wrap");
        var abajo = cabecera ? cabecera.getBoundingClientRect().top - 14
                             : window.innerHeight * 0.45;
        var libre = Math.max(70, abajo - arriba);
        var k = Math.min(2.6, libre / 48);
        var ancho = 30 * k;
        var x0 = window.innerWidth / 2 - ancho / 2;
        var y0 = arriba + (libre - 48 * k) / 2;
        var punto = function (p) {
          return { x: x0 + p[0] * k, y: y0 + p[1] * k };
        };
        var d = forma.map(function (p, i) {
          var q = punto(p);
          return (i ? "L" : "M") + q.x + " " + q.y;
        }).join(" ");

        // Largo aproximado del trazo, para animarlo con el guion del trazo.
        var largo = 0;
        for (var i = 1; i < forma.length; i++) {
          var a = punto(forma[i - 1]), b = punto(forma[i]);
          largo += Math.sqrt((b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y));
        }

        var svgEl = document.createElement("div");
        svgEl.style.cssText = "position:absolute;left:0;top:0;right:0;bottom:0";
        svgEl.innerHTML = '<svg width="100%" height="100%" style="position:absolute;inset:0">' +
          '<path d="' + d + '" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="1"' +
          ' stroke-linecap="round" stroke-linejoin="round"' +
          ' stroke-dasharray="' + largo + '" stroke-dashoffset="' + largo + '">' +
          '<animate attributeName="stroke-dashoffset" from="' + largo + '" to="0"' +
          ' dur="2.2s" begin="0.4s" fill="freeze" calcMode="spline"' +
          ' keySplines="0.4 0 0.2 1" keyTimes="0;1"/></path>' +
          forma.map(function (p, j) {
            var q = punto(p);
            return '<circle cx="' + q.x + '" cy="' + q.y + '" r="2.4" fill="#fff" opacity="0">' +
              '<animate attributeName="opacity" from="0" to="1" dur="0.5s" begin="' +
              (0.4 + j * 0.3).toFixed(2) + 's" fill="freeze"/></circle>';
          }).join("") + '</svg>';
        svgEl.style.opacity = "0";
        svgEl.style.transition = "opacity 1.2s ease";
        pon(svgEl, 8800);
        setTimeout(function () { svgEl.style.opacity = "1"; }, 50);
        setTimeout(function () { svgEl.style.opacity = "0"; }, 6800 + MAS);
      } },

    { id: "satelite", peso: 5, dura: 32500, movimiento: true, correr: function () {   // E18
        var el = document.createElement("div");
        el.className = "satelite";
        el.style.top = (8 + Math.random() * 30) + "vh";
        pon(el, 17500);
      } },

    { id: "polvo", peso: 4, dura: 24500, correr: function () {             // E19
        pon(Object.assign(document.createElement("div"), { className: "polvo" }), 9200);
      } },

    { id: "pecas", peso: 2, dura: 22000, correr: function () {             // E20
        escribirConPuntos("PEQUITA", window.innerHeight * 0.14, 9);
      } },

    // ── El reloj se porta raro ───────────────────────────────────
    { id: "latido", peso: 6, dura: 17200, movimiento: true, correr: function () {     // E21
        var bloque = document.getElementById("s").parentNode;
        bloque.classList.add("late");
        setTimeout(function () { bloque.classList.remove("late"); }, 1800 + MAS);
      } },

    { id: "infinito", peso: 2, dura: 20000, correr: function () {          // E22
        var d = document.getElementById("d"), valor = d.textContent;
        window.relojTomado = true;
        d.textContent = "∞";
        setTimeout(function () {
          d.textContent = valor;
          window.relojTomado = false;
          susurrar(T("infinito"), false);
        }, 2000 + MAS);
      } },

    { id: "marcha-atras", peso: 2, dura: 19500, correr: function () {      // E23
        var s = document.getElementById("s");
        var valor = parseInt(s.textContent, 10) || 0;
        window.relojTomado = true;
        var i = 0;
        var t = setInterval(function () {
          i++;
          s.textContent = ("0" + ((valor + i) % 60)).slice(-2);
          if (i >= 6) { clearInterval(t); window.relojTomado = false; }
        }, 500);
      } },

    { id: "besos", peso: 3, dura: 24000, correr: function () {             // E24
        var bloque = document.createElement("div");
        bloque.className = "bloque extra";
        bloque.innerHTML = '<div class="num" id="numBesos">0</div><div class="lab">besos</div>';
        relojEl.appendChild(bloque);
        var num = bloque.querySelector("#numBesos"), v = Math.round(az(4000, 9000));
        var t = setInterval(function () { v += Math.round(az(3, 40)); num.textContent = v; }, 220);
        setTimeout(function () {
          clearInterval(t);
          bloque.style.transition = "opacity .8s"; bloque.style.opacity = "0";
          setTimeout(function () { if (bloque.parentNode) relojEl.removeChild(bloque); }, 800);
        }, 7200 + MAS);
      } },

    { id: "etiquetas", peso: 4, dura: 22000, correr: function () {         // E25
        var labs = relojEl.querySelectorAll(".lab");
        var nuevas = ["días sin verte", "horas pensándote", "minutos tontos", "segundos"];
        var viejas = [];
        labs.forEach(function (l, i) { viejas.push(l.textContent); l.textContent = nuevas[i] || l.textContent; });
        setTimeout(function () {
          labs.forEach(function (l, i) { l.textContent = viejas[i]; });
        }, 5500 + MAS);
      } },

    { id: "digito", peso: 6, dura: 18600, correr: function () {            // E26
        var nums = document.querySelectorAll("#reloj .num");
        var el = nums[Math.floor(Math.random() * nums.length)];
        el.classList.add("enamorado");
        setTimeout(function () { el.classList.remove("enamorado"); }, 3000 + MAS);
      } },

    // ── Clima ────────────────────────────────────────────────────
    { id: "lluvia", peso: 3, dura: 29000, movimiento: true, correr: function () {    // E43
        for (var i = 0; i < 60; i++) {
          var g = document.createElement("div");
          g.className = "gota";
          g.style.left = az(0, 100) + "vw";
          g.style.animationDuration = az(1.1, 2.2) + "s";
          g.style.animationDelay = az(0, 9) + "s";
          pon(g, 13500);
        }
        setTimeout(function () { susurrar(T("lluvia")); }, 2500);
      } },

    // ── Legendarios (peso mínimo: ~1 de cada 40 visitas) ─────────
    { id: "lluvia-estrellas", peso: 0.5, dura: 26000, movimiento: true, correr: function () {  // E56
        for (var i = 0; i < 20; i++) {
          (function (k) {
            setTimeout(function () {
              var el = document.createElement("div");
              el.className = "fugaz";
              el.style.left = az(-10, 60) + "vw";
              el.style.top = az(0, 55) + "vh";
              pon(el, 2600);
              void el.offsetWidth;
              el.classList.add("corre");
            }, k * 380);
          })(i);
        }
        setTimeout(function () { susurrar(T("lluvia-estrellas")); }, 8200);
      } },

    { id: "planeta", peso: 0.5, dura: 27000, correr: function () {        // E57
        var el = document.createElement("div");
        el.className = "planeta";
        pon(el, 11500);
        // Antes se sentaba una sola figura a mirar el planeta. Ahora son dos:
        // se inclinan la una hacia la otra, se dan un beso y lo dicen.
        var quien = document.createElement("div");
        quien.className = "pareja";
        quien.style.cssText = "position:absolute;left:34%;bottom:19vh;transform:translateX(-50%);opacity:0;transition:opacity 1.4s";
        quien.innerHTML = svg(44, 74,
          '<g class="izq">' +
            '<circle cx="27" cy="13" r="5"/>' +
            '<path d="M27 18v12"/>' +
            '<path d="M27 30l-5 9M27 30l4 9"/>' +
            '<path d="M27 22l8 3"/>' +
          '</g>' +
          '<g class="der">' +
            '<circle cx="47" cy="13" r="5"/>' +
            '<path d="M47 18v12"/>' +
            '<path d="M47 30l5 9M47 30l-4 9"/>' +
            '<path d="M47 22l-8 3"/>' +
          '</g>' +
          '<path class="beso" d="M37 3c-1.5-1.9-4.3-.7-4.3 1.4 0 2.1 2.8 3.5 4.3 4.8 1.5-1.3 4.3-2.7 4.3-4.8C41.3 2.3 38.5 1.1 37 3z"/>');
        pon(quien, 11500);
        setTimeout(function () { quien.style.opacity = ".9"; }, 900);
        setTimeout(function () { susurrar(T("planeta")); }, 3400);
        setTimeout(function () { quien.style.opacity = "0"; }, 9000 + MAS);
      } },

    { id: "eco-poema", peso: 0.5, dura: 26000, correr: function () {      // E58
        if (window.abrirPoema) window.abrirPoema(11000);
        var lista = Array.prototype.slice.call(versos);
        lista.forEach(function (v) {
          v.style.setProperty("--desvio", az(-30, 30).toFixed(0) + "px");
          v.classList.add("baila");
        });
        setTimeout(function () {
          poema.classList.add("enfocado");
          susurrar(uno(TL("eco")));
        }, 1200);
        setTimeout(function () {
          lista.forEach(function (v) { v.classList.remove("baila"); });
          poema.classList.remove("enfocado");
        }, 8000 + MAS);
      } },

    { id: "carta-rapida", peso: 0.5, dura: 27000, correr: function () {   // E59
        var el = document.createElement("div");
        el.className = "carta-rapida";
        el.textContent = T("carta-relampago");
        ponFijo(el, 11500);
        guardarEnFrasco("(la carta que cayó del cielo)");
      } }
  ];

  // ══════════════════════════════════════════════════════════════════
  //  CUÁNDO APARECE CADA UNO
  //  nivel "momento" = tiene su instante y gana a los de fondo.
  //  descanso = horas mínimas antes de repetirlo (nunca días: si se le
  //  pasa algo, tiene que poder verlo otra vez el mismo día).
  // ══════════════════════════════════════════════════════════════════
  var REGLAS = {
    // Susurros
    susurro:            { nivel: "fondo",   descanso: 3,  cuando: function (c) { return c.segundosEnPagina > 30; } },
    verso:              { nivel: "fondo",   descanso: 6 },
    "verso-extra":      { nivel: "momento", descanso: 12, cuando: function () { return vistosSesion.indexOf("verso") >= 0; } },
    margen:             { nivel: "fondo",   descanso: 10 },
    correccion:         { nivel: "fondo",   descanso: 8 },
    nombre:             { nivel: "momento", descanso: 12, cuando: function (c) { return c.visitasHoy >= 2; } },

    // Cielo
    fugaz:              { nivel: "fondo",   descanso: 2 },
    "fugaz-lenta":      { nivel: "momento", descanso: 12, cuando: function (c) { return c.diasRestantes % 10 === 9; } },
    avioneta:           { nivel: "momento", descanso: 10, cuando: function (c) { return c.segundosEnPagina > 120; } },
    zorro:              { nivel: "momento", descanso: 12, cuando: function (c) { return c.segundosSinTocar > 40; } },
    rosa:               { nivel: "fondo",   descanso: 12 },
    luciernagas:        { nivel: "fondo",   descanso: 8 },
    globo:              { nivel: "fondo",   descanso: 8 },
    luna:               { nivel: "momento", descanso: 10, cuando: function (c) {
                            return (c.hora >= 19 || c.hora < 7) && Math.abs(c.faseLunar - 0.5) < 0.06; } },
    constelacion:       { nivel: "momento", descanso: 12, cuando: function (c) { return c.hora < 5; } },
    satelite:           { nivel: "fondo",   descanso: 4 },
    polvo:              { nivel: "fondo",   descanso: 6 },
    pecas:              { nivel: "momento", descanso: 12, cuando: function (c) { return c.toques >= 8; } },

    // El reloj
    latido:             { nivel: "fondo",   descanso: 4,  cuando: function (c) { return c.segundosEnPagina > 30; } },
    infinito:           { nivel: "momento", descanso: 12, cuando: function (c) { return c.diasRestantes > 20; } },
    "marcha-atras":     { nivel: "momento", descanso: 12, cuando: function (c) { return c.diasRestantes <= 5; } },
    besos:              { nivel: "momento", descanso: 10, cuando: function (c) { return c.racha >= 2; } },
    etiquetas:          { nivel: "momento", descanso: 8,  cuando: function (c) { return c.diasRestantes <= 7; } },
    digito:             { nivel: "fondo",   descanso: 3 },

    // Clima
    lluvia:             { nivel: "momento", descanso: 10, cuando: function (c) { return c.esInvierno && c.hora >= 14 && c.hora < 21; } },

    // Legendarios
    "lluvia-estrellas": { nivel: "momento", descanso: 20, cuando: function (c) { return c.primeraDelDia; } },
    planeta:            { nivel: "momento", descanso: 20, cuando: function (c) { return c.hora < 5 && c.segundosSinTocar > 60; } },
    "eco-poema":        { nivel: "momento", descanso: 20, cuando: function () { return (mem.versos || 0) >= 3; } },
    "carta-rapida":     { nivel: "momento", descanso: 20, cuando: function (c) { return c.diasFuera >= 3; } }
  };

  AMBIENTE.forEach(function (e) {
    var r = REGLAS[e.id] || {};
    e.nivel = r.nivel || "fondo";
    e.descanso = r.descanso || 4;
    e.cuando = r.cuando || null;        // pisa cualquier condición vieja
  });

  // ══════════════════════════════════════════════════════════════════
  //  LA RECTA FINAL
  //  A cinco días ya no hay tiempo de esperar a la luna llena ni a que el
  //  contador vuelva a marcar 19 días: lo que ella NO haya visto todavía
  //  deja de hacerse de rogar —ni descanso, ni esperar el momento—, para
  //  que le dé tiempo a verlo todo antes de su cumpleaños.
  //
  //  Solo se relaja lo que ella no puede provocar. Lo que depende de ella
  //  —quedarse quieta, volver dos veces el mismo día, tocar estrellas— se
  //  queda igual: ahí está el juego, y las pistas hablan de eso.
  // ══════════════════════════════════════════════════════════════════
  var RELAJADO = {
    luna:               function (c) { return c.hora >= 19 || c.hora < 7; },   // de noche, sea cual sea la fase
    constelacion:       function (c) { return c.hora >= 21 || c.hora < 7; },   // ya no hace falta trasnochar
    planeta:            function (c) { return c.segundosSinTocar > 60; },      // sin la madrugada
    lluvia:             function (c) { return c.hora >= 12; },
    // Pedía dos minutos enteros sin cerrar, y muchas visitas no llegan: en la
    // recta final basta con uno. La pista sigue diciendo "un par de minutos",
    // que sigue siendo verdad y de sobra.
    avioneta:           function (c) { return c.segundosEnPagina > 60; },
    // Pedía ser la primera visita del día: una sola oportunidad diaria, y si
    // no le tocaba en ese rato, el día estaba perdido. Quedan pocos días.
    "lluvia-estrellas": null,
    "carta-rapida":     null,   // pedía tres días fuera, justo lo contrario de lo que queremos
    infinito:           null,   // pedía que faltaran más de 20 días: ya no van a faltar
    "fugaz-lenta":      null    // pedía 9, 19 o 29 días exactos
  };

  // La última semana entera: hoy mismo ya cuenta. Con cinco días la ventana
  // se abría mañana, y mañana es tarde para lo que hay que enseñar.
  var DIAS_RECTA = 7;
  function rectaFinal() {
    var falta = restante();
    return falta > 0 && falta <= DIAS_RECTA * 86400000;
  }
  // "Visto alguna vez" es de ELLA, no de este aparato: el registro viaja entre
  // sus aparatos (ver frasco.js) y `ultimos` no —ese es el reloj de descansos
  // de aquí—. Mirando solo `ultimos`, en su computador todo parecería nuevo y
  // las pistas le ofrecerían cosas que ya consiguió en el teléfono.
  var vistosJamas = {};
  function refrescarVistos() {
    (mem.registro || []).forEach(function (r) { vistosJamas[r.id] = true; });
    var u = mem.ultimos || {};
    for (var id in u) if (Object.prototype.hasOwnProperty.call(u, id)) vistosJamas[id] = true;
  }
  refrescarVistos();
  function nuncaVisto(id) { return !vistosJamas[id]; }

  // ══════════════════════════════════════════════════════════════════
  //  MOTOR
  // ══════════════════════════════════════════════════════════════════
  var ocupado = false, vistosSesion = [], temporizador = 0, gastados = 0;
  var forzado = (location.search.match(/[?&]evento=([\w-]+)/) || [])[1];
  var rapido = /[?&]rapido/.test(location.search);

  // La ración: la página da mucho y rápido, y después se calla. Si vuelve
  // antes de la hora prometida, arranca con media ración. En la recta final
  // la ración es doble: quedan pocas visitas para enseñarlo todo.
  mem.sesion = mem.sesion || {};
  var media = mem.sesion.vueltaA && Date.now() < mem.sesion.vueltaA;
  var RACION = rectaFinal() ? (media ? 6 : 12) : (media ? 3 : 6);
  var avisado = false;

  function libreEn(ms) { setTimeout(function () { ocupado = false; }, ms); }

  // Simulador de contexto: ?hora=3&dias=7&racha=4&fuera=5&quieta=60 finge el
  // estado para poder probar condiciones sin esperar días.
  function fingido(nombre) {
    var m = location.search.match(new RegExp("[?&]" + nombre + "=(-?\\d+)"));
    return m ? parseInt(m[1], 10) : null;
  }
  function conFinta(nombre, real) {
    var f = fingido(nombre);
    return f === null ? real : f;
  }

  var abiertaEn = Date.now();
  var ultimoToqueEn = Date.now();
  var toquesEnLaVisita = 0;

  function contexto() {
    var d = new Date();
    var mes = d.getMonth() + 1;
    return {
      hora: conFinta("hora", d.getHours()),
      diaSemana: d.getDay(),
      diaDelMes: d.getDate(),
      diasRestantes: conFinta("dias", diasQueFaltan()),
      primeraDelDia: primeraDelDia,
      visitasHoy: mem.visitasHoy || 1,
      racha: conFinta("racha", mem.racha || 1),
      diasFuera: conFinta("fuera", diasFuera),
      segundosEnPagina: (Date.now() - abiertaEn) / 1000,
      segundosSinTocar: conFinta("quieta", (Date.now() - ultimoToqueEn) / 1000),
      toques: toquesEnLaVisita,
      faseLunar: faseLunar(),
      esInvierno: mes >= 5 && mes <= 8,      // invierno chileno
      suave: suave
    };
  }

  // Descansos en HORAS, nunca en días: si se le pasa algo, tiene que poder
  // volver a verlo el mismo día.
  function horasDesde(id) {
    var t = (mem.ultimos || {})[id];
    return t ? (Date.now() - t) / 3600000 : 99999;
  }
  function anotarVisto(id) {
    mem.ultimos = mem.ultimos || {};
    mem.ultimos[id] = Date.now();
    persistir();
  }

  function califica(e, c) {
    if (suave && e.movimiento) return false;
    if (vistosSesion.indexOf(e.id) >= 0) return false;         // uno por sesión
    // Estreno en la recta final: ni descanso ni esperar el momento.
    var estreno = rectaFinal() && nuncaVisto(e.id);
    if (!estreno && horasDesde(e.id) < (e.descanso || 3)) return false;
    var condicion = e.cuando;
    if (estreno && Object.prototype.hasOwnProperty.call(RELAJADO, e.id)) {
      condicion = RELAJADO[e.id];
    }
    return !condicion || condicion(c);
  }

  // Deja constancia en el frasco de que esto pasó, con su hora.
  function anotarEnRegistro(id) {
    mem.registro = mem.registro || [];
    mem.registro.push({ id: id, cuando: Date.now() });
    vistosJamas[id] = true;
    if (mem.registro.length > 80) mem.registro.shift();
    persistir();
    pintarFrasco();
  }

  // Arranca una escena limpia: lo que hubiera en pantalla se retira.
  function iniciarEscena(id, ms) {
    detenerEscena();
    var esc = { id: id, nodos: [], plazos: [], intervalos: [] };
    escenaViva = esc;
    escenaActual = esc;
    mostrarDetener(true);
    // A los 15 segundos la pantalla queda como estaba: el contador y el
    // frasco, nada más. Antes se iba con lo que pidiera cada evento (hasta
    // media hora entre unos y otros) y se amontonaban. Se apaga con un
    // fundido para que no desaparezca de golpe lo que se estaba mirando.
    _plazo(function () { if (escenaViva === esc) apagarEscena(esc); }, TOPE - 700);
    _plazo(function () { if (escenaViva === esc) detenerEscena(true); }, TOPE);
    return esc;
  }

  // El fundido previo al barrido: se apaga lo que el evento haya puesto.
  function apagarEscena(esc) {
    esc.nodos.forEach(function (n) {
      if (!n || !n.style) return;
      n.style.transition = "opacity .7s ease";
      n.style.opacity = "0";
    });
    if (elSusurro) elSusurro.classList.remove("viva");
  }

  // Retira todo lo del evento en curso y deja la página como estaba.
  // Con `automatico` (el barrido de los 15 segundos) NO se levanta el candado:
  // el siguiente evento sigue esperando su turno como estaba previsto. Solo
  // cuando ella pulsa detener se da paso libre a lo siguiente.
  function detenerEscena(automatico) {
    var esc = escenaViva;
    escenaViva = null;
    escenaActual = null;
    if (esc) {
      esc.plazos.forEach(function (t) { clearTimeout(t); });
      esc.intervalos.forEach(function (t) { clearInterval(t); });
      esc.nodos.forEach(function (n) { if (n && n.parentNode) n.parentNode.removeChild(n); });
    }
    // Lo que los eventos tocan de la propia página y hay que devolver.
    if (poema) poema.classList.remove("enfocado");
    Array.prototype.forEach.call(document.querySelectorAll(".verso.viva"),
      function (v) { v.classList.remove("viva"); });
    Array.prototype.forEach.call(document.querySelectorAll(".verso.baila"),
      function (v) { v.classList.remove("baila"); });
    Array.prototype.forEach.call(document.querySelectorAll(".num.enamorado"),
      function (n) { n.classList.remove("enamorado"); });
    Array.prototype.forEach.call(document.querySelectorAll(".bloque.late"),
      function (b) { b.classList.remove("late"); });
    Array.prototype.forEach.call(document.querySelectorAll("#reloj .bloque.extra"),
      function (b) { if (b.parentNode) b.parentNode.removeChild(b); });
    Array.prototype.forEach.call(cieloEl.children, function (s) { s.style.transform = ""; });
    if (relojEl) {
      var labs = relojEl.querySelectorAll(".lab");
      for (var i = 0; i < labs.length && i < ETIQUETAS.length; i++) labs[i].textContent = ETIQUETAS[i];
    }
    var carino = document.getElementById("notaCarino");
    if (carino && NOTA_CARINO) carino.textContent = NOTA_CARINO;
    cuerpo.classList.remove("amanece");
    window.relojTomado = false;
    mostrarDetener(false);
    despejar();
    if (!automatico) ocupado = false;
  }
  window.detenerEscena = detenerEscena;

  // Botón de detener: solo está mientras hay algo en pantalla.
  var botonDetener = null;
  function mostrarDetener(si) {
    if (!botonDetener) {
      botonDetener = document.createElement("button");
      botonDetener.className = "detener";
      botonDetener.type = "button";
      botonDetener.innerHTML = "&#9632; detener";
      botonDetener.addEventListener("click", function (e) {
        e.stopPropagation();
        detenerEscena();
      });
      document.body.appendChild(botonDetener);
    }
    botonDetener.classList.toggle("viva", !!si);
  }

  function correr(e) {
    ocupado = true;
    iniciarEscena(e.id, e.dura);
    try { e.correr(); } catch (err) { ocupado = false; return; }
    escenaActual = null;   // los plazos ya creados siguen apuntando a su escena
    anotarEnRegistro(e.id);
    libreEn(e.dura);
    vistosSesion.push(e.id);
    anotarVisto(e.id);
    gastados++;
  }

  function lanzar() {
    // Con la puerta cerrada no se gasta nada: la pantalla está tapada y un
    // evento que corriera ahí se daría por visto sin que ella lo viera.
    if (document.documentElement.classList.contains("sin-entrar")) return;
    // El modo forzado es una herramienta de prueba: se salta el candado.
    if (!forzado && (ocupado || jugando() || document.hidden || enCalma())) return;
    if (forzado) {
      revivir(forzado);
      return;
    }
    if (gastados >= RACION) { avisarVuelta(); return; }

    var c = contexto();
    var lista = AMBIENTE.filter(function (e) { return califica(e, c); });
    if (!lista.length) return;

    // En la recta final manda lo que no ha visto nunca: quedan pocos días y
    // la gracia es que no se quede nada dentro sin enseñar.
    var estrenos = rectaFinal() ? lista.filter(function (e) { return nuncaVisto(e.id); }) : [];
    // Entre estrenos se sortea PAREJO, sin pesos: los legendarios pesan 0.5 y
    // con el reparto de siempre no les llegaba el turno hasta el final, que es
    // como no llegarles. Aquí lo que importa es que salgan todos.
    if (estrenos.length) { correr(uno(estrenos)); return; }

    // Fuera de la recta final, lo específico manda sobre lo genérico.
    var momentos = lista.filter(function (e) { return e.nivel === "momento"; });
    var pozo = momentos.length ? momentos : lista;

    // Gana el más olvidado; el azar solo desempata entre los tres primeros.
    pozo.sort(function (a, b) { return horasDesde(b.id) - horasDesde(a.id); });
    var cabeza = pozo.slice(0, 3);
    var total = 0, i;
    for (i = 0; i < cabeza.length; i++) total += cabeza[i].peso;
    var tirada = Math.random() * total, acumulado = 0, elegido = cabeza[0];
    for (i = 0; i < cabeza.length; i++) {
      acumulado += cabeza[i].peso;
      if (tirada <= acumulado) { elegido = cabeza[i]; break; }
    }
    correr(elegido);
  }

  // Se acabó la tanda: se le dice cuándo vale la pena volver, con hora concreta.
  function avisarVuelta() {
    if (avisado) return;
    avisado = true;
    clearTimeout(temporizador);
    var cuando = new Date(Date.now() + (3 + Math.random() * 4) * 3600000);
    var reloj = cuando.getHours() + ":" + ("0" + (Math.round(cuando.getMinutes() / 15) * 15 % 60)).slice(-2);
    mem.sesion = { vueltaA: cuando.getTime() };
    persistir();
    susurrar(uno(TL("avisos")).replace("{hora}", reloj), false);
  }

  function agendar() {
    clearTimeout(temporizador);
    var espera = rapido ? 2500 : 10000 + Math.random() * 10000;   // entre 10 s y 20 s
    var falta = CALMA - (Date.now() - ARRANQUE);
    if (falta > 0) espera = Math.max(espera, falta + 600);        // primero, la calma
    temporizador = setTimeout(function () {
      lanzar();
      agendar();
    }, espera);
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) clearTimeout(temporizador); else agendar();
  });

  // ══════════════════════════════════════════════════════════════════
  //  INTERACCIÓN
  // ══════════════════════════════════════════════════════════════════

  // E31 — cada estrella del cielo suelta una palabra
  function estrellaCercana(x, y) {
    var hijas = cieloEl.children, mejor = null, mejorD = 30 * 30;
    for (var i = 0; i < hijas.length; i++) {
      var r = hijas[i].getBoundingClientRect();
      var dx = r.left + r.width / 2 - x, dy = r.top + r.height / 2 - y;
      var d = dx * dx + dy * dy;
      if (d < mejorD) { mejorD = d; mejor = hijas[i]; }
    }
    return mejor;
  }

  // Las palabras propias se leen de palabras.txt (una por línea, sin comillas
  // ni comas: así no hay forma de romper el archivo al pegarlas). Si el
  // archivo no existe o está vacío, siguen saliendo las once por defecto.
  (function () {
    if (!window.fetch) return;
    fetch("palabras.txt", { cache: "no-store" })
      .then(function (r) { return r.ok ? r.text() : ""; })
      .then(function (texto) {
        var lineas = texto.split("\n").map(function (l) { return l.trim(); })
          .filter(function (l) { return l && l.charAt(0) !== "#"; });
        if (lineas.length) CONFIG.palabrasEnOrden = lineas;
      })
      .catch(function () {});
  })();

  // Si hay palabras propias, salen en orden, una por toque.
  var iPalabra = 0, ultimaPalabra = "";
  function siguientePalabra() {
    var propias = CONFIG.palabrasEnOrden || [];
    if (propias.length) {
      var p = propias[iPalabra % propias.length];
      iPalabra++;
      return p;
    }
    var lista = TL("palabras");
    var p2 = uno(lista);
    while (p2 === ultimaPalabra && lista.length > 1) p2 = uno(lista);
    ultimaPalabra = p2;
    return p2;
  }

  function tocarCielo(e) {
    if (jugando()) return;
    if (e.target.closest && e.target.closest("button, a, .tocable")) return;
    var estrella = estrellaCercana(e.clientX, e.clientY);
    if (!estrella) return;
    estrella.classList.remove("estrella-viva");
    void estrella.offsetWidth;
    estrella.classList.add("estrella-viva");
    var el = document.createElement("span");
    el.className = "palabra";
    el.textContent = siguientePalabra();
    el.style.left = e.clientX + "px";
    el.style.top = (e.clientY - 14) + "px";
    pon(el, 2400);
  }

  // E35 — rastro de polvo al arrastrar
  var pulsando = false, ultimoRastro = 0, rastros = 0;
  function rastro(e) {
    if (!pulsando || jugando() || suave) return;
    var ahora = Date.now();
    if (ahora - ultimoRastro < 45 || rastros > 28) return;
    ultimoRastro = ahora;
    var el = document.createElement("div");
    el.className = "rastro";
    el.style.left = e.clientX + "px";
    el.style.top = e.clientY + "px";
    rastros++;
    capa.appendChild(el);
    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
      rastros--;
    }, 1300);
  }

  // E32 — mantener pulsado: amanece un momento. El dedo tiene que estar
  // QUIETO: si se mueve, es un rastro, no una pulsación.
  var pulsacion = 0, origenPulsacion = null;
  function empezarPulsacion(e) {
    if (jugando()) return;
    origenPulsacion = { x: e.clientX, y: e.clientY };
    pulsacion = setTimeout(function () {
      cuerpo.classList.add("amanece");
      susurrar(T("pulsacion"));
      setTimeout(function () { cuerpo.classList.remove("amanece"); }, 3200);
    }, 2000);
  }
  function soltarPulsacion() { clearTimeout(pulsacion); origenPulsacion = null; }
  function vigilarPulsacion(e) {
    if (!origenPulsacion) return;
    var dx = e.clientX - origenPulsacion.x, dy = e.clientY - origenPulsacion.y;
    if (dx * dx + dy * dy > 100) soltarPulsacion();       // más de 10 px: ya no cuenta
  }

  document.addEventListener("pointerdown", function (e) {
    pulsando = true;
    ultimoToqueEn = Date.now();
    toquesEnLaVisita++;
    despertar(); arrancarMusica(); tocarCielo(e); empezarPulsacion(e);
  });
  document.addEventListener("pointermove", function (e) {
    rastro(e); despertar(); vigilarPulsacion(e);
  });
  window.addEventListener("pointerup", function () { pulsando = false; soltarPulsacion(); });
  window.addEventListener("pointercancel", function () { pulsando = false; soltarPulsacion(); });

  // E33 — SIETE toques en el reloj: aparece un quinto bloque que no cuenta
  // hacia atrás sino hacia delante, desde que empezamos.
  var toquesReloj = 0, ventanaReloj = 0, marcador7 = null;
  if (relojEl) {
    relojEl.addEventListener("pointerdown", function () {
      toquesReloj++;
      clearTimeout(ventanaReloj);
      ventanaReloj = setTimeout(function () { toquesReloj = 0; pintarMarcador7(); }, 900);
      if (toquesReloj >= 7) {
        toquesReloj = 0;
        clearTimeout(ventanaReloj);
        pintarMarcador7();
        loQueLlevamos();
      } else {
        pintarMarcador7();
      }
    });
  }

  // Un indicador mínimo (1…7) para que se entienda que está pasando algo.
  function pintarMarcador7() {
    if (!marcador7) {
      marcador7 = document.createElement("div");
      marcador7.className = "marcador-siete";
      relojEl.parentNode.insertBefore(marcador7, relojEl.nextSibling);
    }
    marcador7.textContent = toquesReloj ? "· ".repeat(toquesReloj).trim() : "";
    marcador7.classList.toggle("viva", toquesReloj > 0);
  }

  function loQueLlevamos() {
    if (!CONFIG.juntosDesde) return;
    var bloque = document.getElementById("bloqueJuntos");
    if (bloque) return;                              // ya está en pantalla
    bloque = document.createElement("div");
    bloque.className = "bloque extra juntos";
    bloque.id = "bloqueJuntos";
    bloque.innerHTML = '<div class="num" id="numJuntos">—</div><div class="lab">juntos</div>';
    relojEl.appendChild(bloque);

    var desde = new Date(CONFIG.juntosDesde).getTime();
    var num = bloque.querySelector("#numJuntos");
    function pinta() {
      var s = Math.floor((Date.now() - desde) / 1000);
      var d = Math.floor(s / 86400);
      num.innerHTML = d + '<span class="detalle">d ' +
        ("0" + Math.floor((s % 86400) / 3600)).slice(-2) + ":" +
        ("0" + Math.floor((s % 3600) / 60)).slice(-2) + ":" +
        ("0" + (s % 60)).slice(-2) + "</span>";
    }
    pinta();
    var t = setInterval(pinta, 1000);
    setTimeout(function () {
      clearInterval(t);
      bloque.style.transition = "opacity .8s";
      bloque.style.opacity = "0";
      setTimeout(function () { if (bloque.parentNode) bloque.parentNode.removeChild(bloque); }, 800);
    }, 12000 + MAS);
  }

  // E34 — girar el teléfono a horizontal: el cielo se cae. No pide permisos,
  // que es lo que mataba a la versión de "sacudir" en iPhone.
  var ultimoGiro = 0;
  function cieloQueCae() {
    if (Date.now() - ultimoGiro < 6000 || jugando() || suave) return;
    ultimoGiro = Date.now();
    var hijas = cieloEl.children;
    for (var i = 0; i < hijas.length; i++) {
      (function (el) {
        el.style.transition = "transform 1.6s cubic-bezier(.4,0,.9,.6)";
        el.style.transform = "translateY(" + az(20, 80) + "vh)";
        setTimeout(function () { el.style.transform = ""; }, 2600);
      })(hijas[i]);
    }
    susurrar(T("giro"), false);
  }
  if (window.matchMedia) {
    var apaisado = window.matchMedia("(orientation: landscape)");
    var oyente = function (e) { if (e.matches) cieloQueCae(); };
    if (apaisado.addEventListener) apaisado.addEventListener("change", oyente);
    else if (apaisado.addListener) apaisado.addListener(oyente);
  }

  // E36 — mantener pulsado el "2/7"
  if (marcaEl) {
    var pulsaMarca = 0;
    marcaEl.addEventListener("pointerdown", function () {
      pulsaMarca = setTimeout(function () {
        susurrar(T("dosSiete.marca"));
      }, 900);
    });
    marcaEl.addEventListener("pointerup", function () { clearTimeout(pulsaMarca); });
    marcaEl.addEventListener("pointerleave", function () { clearTimeout(pulsaMarca); });
  }

  // E37 — tres toques en la nota: una carta corta que no se repite
  if (notaEl) {
    var toques = 0, ventana = 0;
    notaEl.addEventListener("pointerdown", function () {
      toques++;
      clearTimeout(ventana);
      ventana = setTimeout(function () { toques = 0; }, 900);
      if (toques < 3) return;
      toques = 0;
      var baraja = TL("cartas").slice();
      if (restante() <= 0) baraja.push(T("carta.diad"));      // la séptima
      var quedan = baraja.filter(function (c) { return mem.cartas.indexOf(c) < 0; });
      if (!quedan.length) { mem.cartas = []; quedan = baraja; }
      var carta = uno(quedan);
      mem.cartas.push(carta); persistir();
      susurrar(carta);
    });
  }

  // E38 — dos minutos quieta: el cielo baja la voz
  var reposo = 0;
  function despertar() {
    cuerpo.classList.remove("quieta");
    clearTimeout(reposo);
    reposo = setTimeout(function () {
      if (jugando()) return;
      cuerpo.classList.add("quieta");
      susurrar(T("inactividad"));
    }, 120000);
  }

  // ══════════════════════════════════════════════════════════════════
  //  LA CANCIÓN DEL DÍA
  //  No se guarda dónde iba: se calcula. La canción "lleva sonando" desde
  //  la medianoche, así que recargar no la reinicia nunca.
  // ══════════════════════════════════════════════════════════════════
  var sonido = null, musicaEncendida = false;

  function cancionDeHoy() {
    var lista = CONFIG.canciones || [];
    if (!lista.length) return null;
    var clave = fechaLocal(), suma = 0;
    for (var i = 0; i < clave.length; i++) suma = (suma * 31 + clave.charCodeAt(i)) % 100000;
    return lista[suma % lista.length];
  }

  function segundosDesdeMedianoche() {
    var d = new Date();
    return d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
  }

  function montarMusica() {
    var pista = cancionDeHoy();
    if (!pista) return;

    sonido = document.createElement("audio");
    sonido.src = pista;
    sonido.loop = true;
    sonido.preload = "metadata";
    sonido.volume = 0;

    var guardado = mem.volumen;
    var volumen = (guardado === undefined || guardado === null) ? 0.35 : guardado;

    // En el iPhone, sonido.volume es de SOLO LECTURA: mover el deslizador no
    // hacía nada. La única forma de mandar sobre el volumen ahí es meter el
    // audio por un nodo de ganancia; y al llegar a cero, además, se pausa.
    //
    // PERO eso tiene un precio en iOS: lo que pasa por WebAudio cuenta como
    // sonido "de ambiente", y el interruptor de silencio del teléfono lo
    // apaga —el mismo audio suelto, no—. Por eso ella no oía nada. Safari
    // 16.4+ deja declarar que esto es reproducción de verdad; donde no se
    // pueda declarar, se renuncia al deslizador antes que a la canción.
    function sesionDeReproduccion() {
      try {
        if (navigator.audioSession) { navigator.audioSession.type = "playback"; return true; }
      } catch (e) {}
      return false;
    }

    // ¿Obedece `volume` en este navegador? En iOS no.
    function volumenObedece() {
      try {
        var antes = sonido.volume;
        sonido.volume = 0.5;
        var manda = Math.abs(sonido.volume - 0.5) < 0.01;
        sonido.volume = antes;
        return manda;
      } catch (e) { return false; }
    }

    var contexto = null, ganancia = null;
    function conectarGanancia() {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (contexto || !Ctx) return;
      // Donde el volumen ya obedece, WebAudio no aporta nada y solo puede
      // quitar: se deja el audio suelto, que es lo que mejor suena en todas.
      if (volumenObedece()) return;
      // Aquí estamos en iOS: sin poder declarar la sesión, meterlo por
      // WebAudio es condenarlo a callar con el teléfono en silencio.
      if (!sesionDeReproduccion()) return;
      try {
        contexto = new Ctx();
        var fuente = contexto.createMediaElementSource(sonido);
        ganancia = contexto.createGain();
        fuente.connect(ganancia);
        ganancia.connect(contexto.destination);
        ganancia.gain.value = volumen;
      } catch (e) { contexto = null; ganancia = null; }
    }

    function ponerVolumen(v) {
      try { sonido.volume = v; } catch (e) {}          // sirve en escritorio
      if (ganancia) ganancia.gain.value = v;           // lo único que sirve en iOS
      sonido.muted = v <= 0.001;
      if (v <= 0.001) { sonido.pause(); musicaEncendida = false; }
    }

    document.body.appendChild(sonido);

    var caja = document.createElement("div");
    caja.className = "volumen";
    caja.innerHTML = '<span class="nota-musical">♪</span>' +
      '<input type="range" min="0" max="100" value="' + Math.round(volumen * 100) +
      '" aria-label="volumen de la música" />';
    document.body.appendChild(caja);
    var mando = caja.querySelector("input");

    // Engancha la canción en el segundo que le tocaría si nunca se hubiera
    // detenido; si la pestaña estuvo dormida, vuelve a cuadrarla al despertar.
    function cuadrar() {
      if (!sonido.duration || !isFinite(sonido.duration)) return;
      var donde = segundosDesdeMedianoche() % sonido.duration;
      if (Math.abs(sonido.currentTime - donde) > 2) sonido.currentTime = donde;
    }
    sonido.addEventListener("loadedmetadata", cuadrar);
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden && musicaEncendida) cuadrar();
    });

    function subirSuave(destino) {
      var paso = destino / 20, i = 0;
      var t = setInterval(function () {
        i++;
        ponerVolumen(Math.min(destino, paso * i));
        if (i >= 20) clearInterval(t);
      }, 100);
    }

    mando.addEventListener("input", function () {
      volumen = mando.value / 100;
      mem.volumen = volumen; persistir();
      if (volumen <= 0.001) { ponerVolumen(0); caja.classList.remove("sonando"); return; }
      if (!musicaEncendida) { arrancarMusica(); return; }
      ponerVolumen(volumen);
    });

    // El primer toque en cualquier parte enciende el sonido: ningún navegador
    // deja sonar audio antes, y así ella no tiene que pulsar nada aparte.
    var avisadoSilencio = false;
    // Lo único que no se puede arreglar desde aquí es el interruptor de
    // silencio del teléfono. Si tras dos segundos la canción no ha avanzado
    // ni un segundo, se lo decimos en vez de dejarla pensando que está rota.
    function comprobarQueSuena() {
      if (avisadoSilencio) return;
      var desde = sonido.currentTime;
      setTimeout(function () {
        if (!musicaEncendida || sonido.paused) return;
        if (sonido.currentTime > desde + 0.3) return;      // suena: nada que decir
        avisadoSilencio = true;
        susurrar("¿no la oyes? mira el interruptor de silencio del teléfono", false);
      }, 2200);
    }

    window.arrancarMusica = function () {
      if (musicaEncendida || !sonido) return;
      if (volumen <= 0.001) return;                  // lo dejó en silencio
      musicaEncendida = true;
      sesionDeReproduccion();
      conectarGanancia();
      if (contexto && contexto.state === "suspended") contexto.resume();
      sonido.muted = false;
      cuadrar();
      var promesa = sonido.play();
      if (promesa && promesa.catch) promesa.catch(function () { musicaEncendida = false; });
      subirSuave(volumen);
      comprobarQueSuena();
      caja.classList.add("sonando");
    };
  }
  window.arrancarMusica = function () {};            // hasta que se monte
  montarMusica();

  // ══════════════════════════════════════════════════════════════════
  //  FRASCO DE LUCIÉRNAGAS (E48) Y SELLOS (E49)
  // ══════════════════════════════════════════════════════════════════
  var frasco = document.createElement("button");
  frasco.className = "frasco";
  frasco.type = "button";
  var panel = document.createElement("div");
  panel.className = "coleccion";

  function pintarFrasco() {
    frasco.innerHTML = '<span class="luz"></span>' + mem.coleccion.length + " de 60";
  }

  // El frasco puede crecer mientras la página está abierta, si llega lo que
  // ella juntó en otro aparato (ver frasco.js). Se vuelve a leer del disco y
  // se repinta lo que esté a la vista; si no, lo de fuera no aparecería hasta
  // la siguiente visita y parecería que no ha llegado.
  window.recargarFrasco = function () {
    mem = leerMem();
    mem.coleccion = mem.coleccion || [];
    mem.dias = mem.dias || [];
    mem.cartas = mem.cartas || [];
    mem.registro = mem.registro || [];
    mem.versos = mem.versos || 0;
    // Lo que consiguió en otro aparato ya cuenta como visto aquí: las pistas
    // dejan de ofrecerlo en cuanto llega.
    refrescarVistos();
    pintarFrasco();
    for (var v = 0; v < Math.min(mem.versos, versosSemana.length); v++) {
      versosSemana[v].classList.add("ganado");
    }
    if (panel.classList.contains("viva")) abrirColeccion();
  };

  // Pistas de lo que aún no le ha salido. No dicen el nombre: dicen qué
  // hacer o cuándo mirar. Es la diferencia entre una lista y un juego.
  // EN ORDEN, y el orden importa: primero lo que depende de ella y puede
  // hacer ahora mismo, y al final lo que hay que esperar. Cada pista dice el
  // dato exacto —cuántos toques, cuántos minutos, a qué hora— pero nunca qué
  // va a aparecer: eso es lo que se descubre.
  //
  // No se barajan. La misma pista se queda hasta que lo consigue, y solo
  // entonces sube la siguiente: una pista que cambia sola no es una pista.
  var PISTAS = [
    ["pecas", "toca ocho estrellas seguidas y el cielo te contesta"],
    ["zorro", "quédate quieta, sin tocar nada, tres cuartos de minuto: algo se acerca despacio"],
    ["avioneta", "deja la página abierta dos minutos enteros y mira el cielo de lado a lado"],
    ["rosa", "abajo del todo crece algo si esperas; tócalo y se deshoja"],
    ["globo", "algo sube muy despacio y revienta si lo tocas"],
    ["luciernagas", "si aparecen bichos de luz, persíguelos con el dedo: huyen"],
    ["nombre", "vuelve una segunda vez el mismo día y mira el cielo"],
    ["margen", "a veces dejo un papelito pegado en el margen con la hora exacta"],
    ["correccion", "de vez en cuando me corrijo a mí mismo en la nota de arriba"],
    ["verso-extra", "cuando el poema se ilumine, quédate: a veces hay un verso de más"],
    ["besos", "entra dos días seguidos y en el reloj aparece un bloque que no debería estar"],
    ["eco-poema", "con tres versos ya ganados, el poema se desordena solo"],
    ["lluvia-estrellas", "la primera visita de cada día es la que tiene premio gordo"],
    ["etiquetas", "esta última semana el reloj deja de llamar a las cosas por su nombre"],
    ["marcha-atras", "estos últimos cinco días el reloj se pone nervioso y va al revés"],
    ["lluvia", "las tardes de invierno, de la dos a las nueve, se mojan"],
    ["constelacion", "de noche, siete estrellas se ponen de acuerdo"],
    ["luna", "de noche, arriba a la derecha, asoma algo redondo"],
    ["planeta", "de noche, un minuto entero sin tocar nada, y alguien se sienta a mirar contigo"],
    ["fugaz-lenta", "cuando al contador le cambia la decena de días, una estrella baja a mirarlo"],
    ["infinito", "el contador se equivoca a propósito de vez en cuando"],
    ["carta-rapida", "del cielo cae una hoja escrita para quien vuelve después de días"]
  ];

  function pistasPendientes(cuantas) {
    var fuera = [];
    for (var i = 0; i < PISTAS.length && fuera.length < cuantas; i++) {
      if (nuncaVisto(PISTAS[i][0])) fuera.push(PISTAS[i][1]);
    }
    return fuera;
  }

  function cuandoFue(t) {
    var d = new Date(t), hoy = fechaLocal(), suyo = fechaLocal(d);
    var hora = d.getHours() + ":" + ("0" + d.getMinutes()).slice(-2);
    if (suyo === hoy) return "hoy " + hora;
    if (suyo === fechaLocal(new Date(Date.now() - 86400000))) return "ayer " + hora;
    return d.getDate() + "/" + (d.getMonth() + 1) + " " + hora;
  }

  function abrirColeccion() {
    var vividos = (mem.registro || []).slice().reverse().map(function (r) {
      return '<li class="revivible"><span>' + (NOMBRES[r.id] || r.id) +
        '<em>' + cuandoFue(r.cuando) + '</em></span>' +
        '<button class="revivir" type="button" data-revivir="' + r.id + '">▶</button></li>';
    }).join("") || "<li>todavía no ha pasado nada. dale tiempo.</li>";

    var lista = mem.coleccion.map(function (f) { return "<li>" + f + "</li>"; }).join("") ||
      "<li>todavía no has encontrado ninguna. vuelve mañana.</li>";
    // Antes del cumpleaños, el calendario es la cuenta atrás: un hueco por
    // cada día que queda, y se van sellando al pasar. Después, el mes entero.
    var sellos = "", fecha, d;
    if (restante() > 0) {
      // Del día de hoy al día D, ambos incluidos: se cuenta por fechas, no
      // por milisegundos, para que el 7 no se caiga por redondeo.
      var diaD = fechaLocal(new Date(window.OBJETIVO));
      fecha = new Date();
      for (var i = 0; i < 60; i++) {
        d = fechaLocal(fecha);
        sellos += '<span class="' + (mem.dias.indexOf(d) >= 0 ? "sellado" : "") +
          (d === diaD ? " diaD" : "") + '">' + fecha.getDate() + "</span>";
        if (d === diaD) break;
        fecha = new Date(fecha.getTime() + 86400000);
      }
    } else {
      var hoyD = new Date(), ultimo = new Date(hoyD.getFullYear(), hoyD.getMonth() + 1, 0).getDate();
      for (var j = 1; j <= ultimo; j++) {
        fecha = new Date(hoyD.getFullYear(), hoyD.getMonth(), j);
        d = fechaLocal(fecha);
        sellos += '<span class="' + (mem.dias.indexOf(d) >= 0 ? "sellado" : "") + '">' + j + "</span>";
      }
    }
    panel.innerHTML = "<h2>tu frasco</h2>" +
      '<p class="cuenta">' +
      mem.coleccion.length + (mem.coleccion.length === 1 ? " encontrada · " : " encontradas · ") +
      mem.dias.length + (mem.dias.length === 1 ? " día visitado · " : " días visitados · ") +
      "racha de " + (mem.racha || 1) +
      (mem.creado ? " · frasco abierto el " + new Date(mem.creado).getDate() + "/" +
        (new Date(mem.creado).getMonth() + 1) : "") + "</p>" +
      '<p class="apartado">pistas — lo que todavía no te ha salido' +
      (rectaFinal() ? " · estos días se dejan ver más" : "") + "</p>" +
      '<ul class="pistas">' + (pistasPendientes(3).map(function (p) {
        return "<li>" + p + "</li>";
      }).join("") || "<li>ya te ha salido de todo. y aun así vuelve.</li>") + "</ul>" +
      '<p class="apartado">lo que ha pasado — dale al ▶ y lo vuelves a ver</p>' +
      '<ul class="vividos">' + vividos + "</ul>" +
      '<p class="apartado">lo que te he dicho</p>' +
      "<ul>" + lista + "</ul>" +
      '<div class="calendario">' + sellos + "</div>" +
      '<button class="cerrar" type="button">cerrar</button>';
    panel.querySelector(".cerrar").addEventListener("click", function () {
      panel.classList.remove("viva");
    });
    // El play cierra el frasco y lo vuelve a poner en pantalla.
    panel.addEventListener("click", function (e) {
      var b = e.target.closest && e.target.closest("[data-revivir]");
      if (!b) return;
      panel.classList.remove("viva");
      setTimeout(function () { revivir(b.dataset.revivir); }, 450);
    });
    panel.classList.add("viva");
  }

  frasco.addEventListener("click", abrirColeccion);
  document.body.appendChild(frasco);
  document.body.appendChild(panel);
  pintarFrasco();

  // ══════════════════════════════════════════════════════════════════
  //  VIGILANTE DEL RELOJ (E28, E29, E50–E55)
  // ══════════════════════════════════════════════════════════════════
  var yaCapicua = "", ya207 = "", finalMontado = false, medianocheHecha = false;

  function vigilar() {
    var ms = restante();
    var ahora = new Date();

    // E29 — las 2:07 (y las 14:07)
    var marcaHora = ahora.getHours() + ":" + ahora.getMinutes();
    if (ahora.getMinutes() === CONFIG.dosSiete.minuto &&
        (ahora.getHours() === CONFIG.dosSiete.hora || ahora.getHours() === CONFIG.dosSiete.hora + 12) &&
        ya207 !== marcaHora) {
      ya207 = marcaHora;
      susurrar(T("dosSiete.hora"));
    }

    if (ms <= 0) {
      if (!medianocheHecha) { medianocheHecha = true; medianoche(); }
      return;
    }

    // E28 — capicúa o dígitos iguales en el contador
    var h = document.getElementById("h").textContent;
    var m = document.getElementById("m").textContent;
    var s = document.getElementById("s").textContent;
    var cadena = h + m + s;
    if (/^\d{6}$/.test(cadena)) {
      var alReves = cadena.split("").reverse().join("");
      if ((cadena === alReves || (h === m && m === s)) && yaCapicua !== cadena) {
        yaCapicua = cadena;
        susurrar(T("capicua"), false);
      }
    }

    // E52 — la última hora amanece de a poco
    if (ms < 3600000) cuerpo.classList.add("amaneciendo");

    // E53 — los últimos sesenta segundos
    if (ms < 60000 && !finalMontado) { finalMontado = true; cuentaFinal(); }
  }
  setInterval(vigilar, 1000);

  function cuentaFinal() {                                            // E53
    var caja = document.createElement("div");
    caja.className = "cuenta-final";
    caja.innerHTML = '<div class="seg">60</div><div class="dice">ya está</div>';
    document.body.appendChild(caja);
    var seg = caja.querySelector(".seg"), dice = caja.querySelector(".dice");
    var frases = TL("cuenta-final");
    var t = setInterval(function () {
      var quedan = Math.max(0, Math.ceil(restante() / 1000));
      seg.textContent = quedan;
      dice.textContent = frases[Math.min(frases.length - 1, Math.floor((60 - quedan) / 10))];
      if (quedan <= 0) { clearInterval(t); caja.parentNode.removeChild(caja); }
    }, 200);
  }

  function medianoche() {                                             // E54
    confeti(120, null, null);
    var listos = document.querySelectorAll("#listo .verso");
    listos.forEach(function (v, i) {
      v.style.opacity = ".25";
      setTimeout(function () { v.style.transition = "opacity 1s"; v.style.opacity = "1"; }, 400 + i * 700);
    });
  }

  // 77 sietes dorados cayendo. Ocurre exactamente un día del año.
  function lluviaDeSietes() {
    for (var i = 0; i < 77; i++) {
      (function (k) {
        setTimeout(function () {
          var el = document.createElement("span");
          el.className = "siete-cae";
          el.textContent = "7";
          el.style.left = az(2, 96) + "vw";
          el.style.fontSize = az(0.8, 2.4).toFixed(2) + "rem";
          el.style.animationDuration = az(3.2, 6) + "s";
          pon(el, 7000);
        }, k * 95);
      })(i);
    }
    setTimeout(function () { susurrar(T("sietes")); }, 8200);
  }

  function confeti(cuantos, x, y) {
    var colores = ["#d9a83f", "#c96b74", "#f6e3c8", "#e0745a"];
    for (var i = 0; i < cuantos; i++) {
      var el = document.createElement("div");
      el.className = "confeti";
      el.style.background = uno(colores);
      el.style.left = (x !== null && x !== undefined ? x + az(-40, 40) : az(0, window.innerWidth)) + "px";
      el.style.top = (y !== null && y !== undefined ? y + "px" : "0");
      el.style.animationDuration = az(2.2, 4.5) + "s";
      el.style.animationDelay = az(0, 1.6) + "s";
      pon(el, 7000);
    }
  }

  // ══════════════════════════════════════════════════════════════════
  //  AL ENTRAR: lo que depende del día, la hora y la historia
  // ══════════════════════════════════════════════════════════════════

  function saludo() {
    var h = new Date().getHours();
    if (h < 5) return T("saludo.madrugada");
    if (h < 12) return T("saludo.manana");
    if (h < 20) return T("saludo.tarde");
    return T("saludo.noche");
  }

  function alEntrar() {
    var h = new Date().getHours(), dia = new Date().getDay(), fecha = new Date().getDate();
    if (h < 5) cuerpo.classList.add("madrugada");                     // E47
    if (dia === 0) cuerpo.classList.add("domingo");                   // E40

    var faltan = conFinta("dias", diasQueFaltan());

    // El 7 mágico, en grande: el día que faltan siete, el reloj late a 77 bpm
    // toda la jornada y, al entrar, llueven setenta y siete sietes.
    if (faltan === 7) {
      cuerpo.classList.add("siete-dias");
      setTimeout(lluviaDeSietes, 3500);
    }

    // E50 — la semana de los versos: cada día enciende uno, para siempre
    if (faltan <= 6 && primeraDelDia) {
      mem.versos = Math.min(7, (mem.versos || 0) + 1);
      persistir();
    }
    for (var i = 0; i < Math.min(mem.versos || 0, versosSemana.length); i++) {
      versosSemana[i].classList.add("ganado");
    }

    // E51 — sobres dormidos en los últimos tres días
    if (faltan <= 2 && faltan >= 0) {
      var sobre = document.createElement("div");
      sobre.className = "sobre";
      sobre.innerHTML = DIBUJO.sobre;
      document.body.appendChild(sobre);
    }

    // E55 — segunda vida: pasado el día, cuenta hacia arriba
    if (restante() <= 0) {
      var arriba = document.createElement("p");
      arriba.className = "nota";
      arriba.style.marginTop = "18px";
      var dias = Math.floor((Date.now() - window.OBJETIVO) / 86400000);
      arriba.textContent = T("segunda-vida").replace("{dias}",
        dias + (dias === 1 ? " día" : " días"));
      var listo = document.getElementById("listo");
      if (listo) listo.appendChild(arriba);
    }

    // Los textos de entrada, en cola y sin pisarse
    var cola = [];
    cola.push(saludo());
    if (primeraDelDia) cola.push(fraseDelDia());                      // E02/E46
    if (T("dias." + faltan) && primeraDelDia) cola.push(T("dias." + faltan));  // E30
    if (dia === 1) cola.push(T("lunes"));           // E41
    if (fecha === 7 && primeraDelDia) {                               // E42
      cola.push(T("dia7"));
    }
    if (fecha === 2 && primeraDelDia) {
      cola.push(T("dia2"));
    }
    if ((mem.racha || 0) >= 3 && primeraDelDia) cola.push(T("racha"));  // E44
    if (diasFuera > 3) cola.push(T("ausencia"));      // E45

    cola.forEach(function (texto, i) {
      setTimeout(function () {
        ocupado = true;
        susurrar(texto);
        libreEn(8600);
      }, 2500 + i * 10500);
    });
    return 2500 + cola.length * 10500;
  }

  // E03 — susurro tardío: si sigue ahí a los 90 segundos
  setTimeout(function () {
    if (!document.hidden && !jugando()) susurrar(T("tardio"));
  }, 90000);

  // E60 — tu voz, solo si él deja un audio. Nunca suena sola.
  if (CONFIG.audio) {
    var boton = document.createElement("button");
    boton.className = "voz";
    boton.type = "button";
    boton.textContent = "▷ un segundo de mi voz";
    boton.addEventListener("click", function () {
      new Audio(CONFIG.audio).play();
      boton.textContent = "▷ otra vez";
    });
    setTimeout(function () { ponFijo(boton, 30000); }, 20000);
  }

  // ── Los que no son de ambiente, disparables uno a uno ────────────
  var FORZABLES = {
    "carta-corta": function () { susurrar(uno(TL("cartas"))); },
    "dias-juntos": loQueLlevamos,
    "capicua": function () { susurrar(T("capicua"), false); },
    "dos-siete": function () { susurrar(T("dosSiete.marca")); },
    "cuenta-final": cuentaFinal,
    "medianoche": medianoche,
    "confeti": function () { confeti(80, null, null); },
    "amanece": function () {
      cuerpo.classList.add("amanece");
      setTimeout(function () { cuerpo.classList.remove("amanece"); }, 3200);
    },
    "quieta": function () { cuerpo.classList.add("quieta"); susurrar(T("inactividad")); },
    "coleccion": abrirColeccion,
    "sobre": function () {
      var s = document.createElement("div");
      s.className = "sobre"; s.innerHTML = DIBUJO.sobre;
      ponFijo(s, 9000);
    },

    // Saludos y textos de entrada, para poder verlos a cualquier hora
    "saludo-madrugada": function () { susurrar(T("saludo.madrugada")); },
    "saludo-manana": function () { susurrar(T("saludo.manana")); },
    "saludo-tarde": function () { susurrar(T("saludo.tarde")); },
    "saludo-noche": function () { susurrar(T("saludo.noche")); },
    "frase-dia": function () { susurrar(fraseDelDia()); },
    "susurro-tardio": function () { susurrar(T("tardio")); },
    "lunes": function () { susurrar(T("lunes")); },
    "cumplemes": function () { susurrar(T("dia7")); },
    "racha": function () { susurrar(T("racha")); },
    "ausencia": function () { susurrar(T("ausencia")); },
    "nota-7dias": function () { susurrar(T("dias.7")); },

    // Estados de fondo, que en la vida real duran horas o días
    "madrugada": function () { alternarClase("madrugada", 8000); },
    "domingo": function () { alternarClase("domingo", 8000); },
    "amanecer-final": function () { alternarClase("amaneciendo", 9000); },

    // Interacciones, simuladas para poder verlas sin el gesto
    "palabra": function () {
      var el = document.createElement("span");
      el.className = "palabra";
      el.textContent = siguientePalabra();
      el.style.left = "50%";
      el.style.top = "42%";
      pon(el, 2400);
    },
    "sacudida": function () {
      var hijas = cieloEl.children;
      for (var i = 0; i < hijas.length; i++) {
        (function (el) {
          el.style.transition = "transform 1.6s cubic-bezier(.4,0,.9,.6)";
          el.style.transform = "translateY(" + az(20, 80) + "vh)";
          setTimeout(function () { el.style.transform = ""; }, 2600);
        })(hijas[i]);
      }
      susurrar(T("giro"), false);
    },
    "lluvia-sietes": lluviaDeSietes,
    "77bpm": function () {
      cuerpo.classList.add("siete-dias");
      setTimeout(function () { cuerpo.classList.remove("siete-dias"); }, 9000);
    },
    "vaciar-racion": function () {
      gastados = 0; avisado = false; vistosSesion = [];
      mem.ultimos = {}; mem.sesion = {}; persistir();
      susurrar("(ración vaciada y descansos borrados)", false);
      agendar();
    },
    "borrar-memoria": function () {
      // Dos toques: el primero avisa, el segundo borra. Y siempre queda
      // respaldo, así que "recuperar frasco" lo devuelve.
      if (!confirmarBorrado) {
        confirmarBorrado = true;
        susurrar("(vuelve a pulsar BORRAR MEMORIA para confirmar)", false);
        setTimeout(function () { confirmarBorrado = false; }, 8000);
        return;
      }
      confirmarBorrado = false;
      if (window.borrarMemoriaDeVerdad) window.borrarMemoriaDeVerdad();
      mem = { coleccion: [], dias: [], versos: 0, cartas: [], ultimos: {}, sesion: {}, registro: [] };
      pintarFrasco();
      susurrar("(memoria borrada; se puede recuperar con Recuperar frasco)", false);
    },
    "recuperar-frasco": function () {
      if (window.recuperarMemoria && window.recuperarMemoria()) {
        mem = leerMem();
        mem.coleccion = mem.coleccion || [];
        mem.dias = mem.dias || [];
        mem.registro = mem.registro || [];
        pintarFrasco();
        susurrar("(frasco recuperado del respaldo)", false);
      } else {
        susurrar("(no hay respaldo que recuperar)", false);
      }
    },
    "diagnostico": mostrarDiagnostico,
    "siete": function () {
      var b = document.getElementById("s").parentNode;
      b.classList.add("siete");
      setTimeout(function () { b.classList.remove("siete"); }, 3000);
    },
    "versos-semana": function () {
      if (window.abrirPoema) window.abrirPoema(9000);
      if (window.mostrarVerso && versosSemana[0]) window.mostrarVerso(versosSemana[0]);
      for (var i = 0; i < 4; i++) versosSemana[i].classList.add("ganado");
      setTimeout(function () {
        for (var j = 0; j < versosSemana.length; j++) {
          if (j >= (mem.versos || 0)) versosSemana[j].classList.remove("ganado");
        }
      }, 8000);
    },
    "voz": function () {
      if (!CONFIG.audio) { susurrar("(dormido: falta el audio en CONFIG)", false); return; }
      var boton = document.createElement("button");
      boton.className = "voz";
      boton.type = "button";
      boton.textContent = "▷ un segundo de mi voz";
      boton.addEventListener("click", function () { new Audio(CONFIG.audio).play(); });
      ponFijo(boton, 12000);
    }
  };

  function alternarClase(clase, ms) {
    cuerpo.classList.add(clase);
    setTimeout(function () { cuerpo.classList.remove(clase); }, ms);
  }

  // ══════════════════════════════════════════════════════════════════
  //  PANEL DE PRUEBAS  (solo con ?pruebas — no existe en la visita normal)
  // ══════════════════════════════════════════════════════════════════
  var NOMBRES = {
    susurro: "Susurro", verso: "Verso solo", "verso-extra": "Verso nº 8",
    margen: "Nota al margen", correccion: "Corrección en vivo", nombre: "Tu nombre (ISI)",
    fugaz: "Estrella fugaz", "fugaz-lenta": "Fugaz que se arrepiente", avioneta: "Avioneta",
    zorro: "El zorro", rosa: "La rosa", luciernagas: "Luciérnagas", globo: "Globo",
    luna: "La luna", constelacion: "Constelación", satelite: "Satélite", polvo: "Polvo dorado",
    pecas: "Lluvia de pecas", latido: "Latido", infinito: "Días = ∞",
    "marcha-atras": "Marcha atrás", besos: "Bloque de besos", etiquetas: "Etiquetas cariñosas",
    digito: "Dígito enamorado", lluvia: "Lluvia",
    "lluvia-estrellas": "Lluvia de estrellas ✦", planeta: "El planeta ✦",
    "eco-poema": "Eco del poema ✦", "carta-rapida": "Carta relámpago ✦",
    "saludo-madrugada": "Saludo madrugada", "saludo-manana": "Saludo mañana",
    "saludo-tarde": "Saludo tarde", "saludo-noche": "Saludo noche",
    "frase-dia": "Frase del día", "susurro-tardio": "Susurro tardío (90 s)",
    lunes: "Lunes", cumplemes: "Cumplemés", racha: "Racha de días", ausencia: "Vuelve tras días",
    "nota-7dias": "Nota de los 7 días", madrugada: "Fondo de madrugada", domingo: "Fondo de domingo",
    palabra: "Palabra al tocar", "carta-corta": "Carta corta (3 toques)",
    "dias-juntos": "Lo que llevamos (7 toques)", amanece: "Amanece (pulsación larga)",
    quieta: "Inactividad (2 min)", sacudida: "Sacudir el teléfono",
    "dos-siete": "El 2/7", siete: "El 7 mágico", capicua: "Capicúa",
    coleccion: "Frasco de luciérnagas", sobre: "Sobre dormido", "versos-semana": "Semana de los versos",
    "amanecer-final": "Amanece (última hora)", "lluvia-sietes": "Llueven 7 (a 7 días)",
    "77bpm": "Reloj a 77 bpm", "vaciar-racion": "↺ Vaciar ración",
    "borrar-memoria": "↺ Borrar memoria (2 toques)",
    "recuperar-frasco": "↺ Recuperar frasco",
    "diagnostico": "· Diagnóstico", "cuenta-final": "Últimos 60 segundos",
    medianoche: "Medianoche", confeti: "Confeti", voz: "Tu voz"
  };

  var GRUPOS = [
    { titulo: "Aparecen solos · frecuentes", ids: ["fugaz", "susurro", "verso", "latido", "digito", "satelite"] },
    { titulo: "Aparecen solos · habituales", ids: ["margen", "luciernagas", "avioneta", "etiquetas", "polvo", "verso-extra", "correccion", "fugaz-lenta", "globo", "luna", "besos", "lluvia"] },
    { titulo: "Aparecen solos · raros", ids: ["nombre", "pecas", "zorro", "rosa", "constelacion", "infinito", "marcha-atras"] },
    { titulo: "Legendarios", ids: ["lluvia-estrellas", "planeta", "eco-poema", "carta-rapida"] },
    { titulo: "Al tocar", ids: ["palabra", "carta-corta", "amanece", "dias-juntos", "sacudida", "dos-siete", "coleccion"] },
    { titulo: "Hora, día e historia", ids: ["saludo-madrugada", "saludo-manana", "saludo-tarde", "saludo-noche", "frase-dia", "susurro-tardio", "lunes", "cumplemes", "racha", "ausencia", "madrugada", "domingo", "quieta"] },
    { titulo: "El contador", ids: ["siete", "77bpm", "lluvia-sietes", "capicua", "nota-7dias", "versos-semana", "sobre", "amanecer-final", "cuenta-final", "medianoche", "confeti"] },
    { titulo: "Herramientas", ids: ["diagnostico", "vaciar-racion", "recuperar-frasco", "borrar-memoria"] },
    { titulo: "Pendiente de un dato tuyo", ids: ["voz"] }
  ];

  function revivir(id) {
    for (var i = 0; i < AMBIENTE.length; i++) {
      if (AMBIENTE[i].id === id) {
        ocupado = true;
        iniciarEscena(id, AMBIENTE[i].dura);
        try { AMBIENTE[i].correr(); } catch (e) {}
        escenaActual = null;
        libreEn(AMBIENTE[i].dura);
        return;
      }
    }
    if (FORZABLES[id]) {
      iniciarEscena(id, 12000);
      try { FORZABLES[id](); } catch (e) {}
      escenaActual = null;
    }
  }
  window.revivir = revivir;

  function disparar(id) { revivir(id); }

  var confirmarBorrado = false;

  // Diagnóstico de la memoria: qué hay guardado y, sobre todo, DESDE QUÉ
  // DIRECCIÓN, que es lo que decide dónde vive el frasco.
  function mostrarDiagnostico() {
    var e = window.estadoMemoria ? window.estadoMemoria() : null;
    var viejo = document.querySelector(".diagnostico");
    if (viejo) viejo.parentNode.removeChild(viejo);
    var caja = document.createElement("div");
    caja.className = "diagnostico";
    caja.innerHTML = e
      ? "<b>" + e.origen.replace(/^https?:\/\//, "") + "</b>" +
        "<span>guarda: " + (e.guardaBien ? "sí" : "NO") + " · frasco: " + e.frases +
        " frases · " + e.eventos + " eventos · " + e.dias + " días</span>" +
        "<span>desde: " + e.desde + " · respaldo: " + e.respaldo + "</span>" +
        "<span>toca para cerrar</span>"
      : "<b>sin diagnóstico</b>";
    caja.addEventListener("click", function () {
      if (caja.parentNode) caja.parentNode.removeChild(caja);
    });
    document.body.appendChild(caja);
  }

  function montarPanel() {
    var panelP = document.createElement("div");
    panelP.className = "pruebas";
    var pestana = document.createElement("button");
    pestana.className = "pruebas-pestana";
    pestana.type = "button";
    pestana.textContent = "pruebas";

    var html = '<div class="pruebas-cabecera">' +
      "<strong>panel de pruebas</strong>" +
      '<span class="pruebas-racion"></span>' +
      '<label class="pruebas-ambiente"><input type="checkbox" id="pruebasAmbiente" checked /> ambiente</label>' +
      '<button type="button" class="pruebas-ocultar">ocultar</button></div>';
    html += '<div class="pruebas-cuerpo">';
    GRUPOS.forEach(function (g) {
      html += '<p class="pruebas-titulo">' + g.titulo + "</p><div class=\"pruebas-rejilla\">";
      g.ids.forEach(function (id) {
        html += '<button type="button" data-id="' + id + '">' + (NOMBRES[id] || id) +
          '<em class="estado" data-estado="' + id + '"></em></button>';
      });
      html += "</div>";
    });
    html += "</div>";
    panelP.innerHTML = html;

    panelP.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b) return;
      if (b.classList.contains("pruebas-ocultar")) {
        panelP.classList.remove("viva"); cuerpo.classList.remove("con-pruebas"); return;
      }
      if (!b.dataset.id) return;
      disparar(b.dataset.id);
      b.classList.add("recien");
      setTimeout(function () { b.classList.remove("recien"); }, 600);
    });
    panelP.querySelector("#pruebasAmbiente").addEventListener("change", function (e) {
      if (e.target.checked) agendar(); else clearTimeout(temporizador);
    });
    pestana.addEventListener("click", function () {
      panelP.classList.add("viva"); cuerpo.classList.add("con-pruebas");
    });

    document.body.appendChild(pestana);
    document.body.appendChild(panelP);
    panelP.classList.add("viva");
    cuerpo.classList.add("con-pruebas");

    // Por qué cada evento saldría o no saldría ahora mismo. Es lo que permite
    // revisar la CONDICIÓN y no solo el dibujo.
    function refrescarEstados() {
      var c = contexto();
      panelP.querySelectorAll("[data-estado]").forEach(function (marca) {
        var id = marca.dataset.estado, ev = null;
        for (var i = 0; i < AMBIENTE.length; i++) if (AMBIENTE[i].id === id) ev = AMBIENTE[i];
        if (!ev) { marca.textContent = "a mano"; marca.className = "estado libre"; return; }
        var texto = "sale ya", clase = "estado listo";
        if (suave && ev.movimiento) { texto = "sin movimiento"; clase = "estado no"; }
        else if (vistosSesion.indexOf(id) >= 0) { texto = "ya salió hoy aquí"; clase = "estado no"; }
        else if (horasDesde(id) < ev.descanso) {
          texto = "descansa " + (ev.descanso - horasDesde(id)).toFixed(1) + " h"; clase = "estado no";
        } else if (ev.cuando && !ev.cuando(c)) { texto = (PORQUE[id] || "espera su momento"); clase = "estado no"; }
        marca.textContent = texto;
        marca.className = clase;
      });
      var cab = panelP.querySelector(".pruebas-racion");
      if (cab) cab.textContent = "ración " + gastados + "/" + RACION;
    }
    refrescarEstados();
    setInterval(function () { if (panelP.classList.contains("viva")) refrescarEstados(); }, 2000);
  }

  // En castellano, para leerlo de un vistazo en el panel.
  var PORQUE = {
    susurro: "espera 30 s en página",
    "verso-extra": "pide que salga antes el verso",
    nombre: "pide 2ª visita del día",
    "fugaz-lenta": "solo el día que baja de decena",
    avioneta: "pide 2 min en página",
    zorro: "pide 40 s sin tocar",
    luna: "solo de noche y con luna llena",
    constelacion: "solo de madrugada",
    pecas: "pide 8 estrellas tocadas",
    latido: "espera 30 s en página",
    infinito: "solo si faltan más de 20 días",
    "marcha-atras": "solo en los últimos 5 días",
    besos: "pide racha de 2 días",
    etiquetas: "solo en la última semana",
    lluvia: "solo en invierno, por la tarde",
    "lluvia-estrellas": "solo en la 1ª visita del día",
    planeta: "madrugada y 60 s sin tocar",
    "eco-poema": "pide 3 versos ganados",
    "carta-rapida": "solo al volver tras 3 días"
  };

  if (/[?&]pruebas/.test(location.search)) montarPanel();

  // ?diag — dice en pantalla qué memoria hay y desde qué dirección, para
  // poder averiguar por qué se vacía un frasco.
  if (/[?&]diag/.test(location.search)) _plazo(mostrarDiagnostico, 900);

  // ── Arranque ─────────────────────────────────────────────────────
  function arrancar() {
    var retraso = alEntrar();
    despertar();
    setTimeout(agendar, rapido ? 600 : Math.min(retraso, 30000));
  }

  if (window.fetch) {
    fetch("textos.txt", { cache: "no-store" })
      .then(function (r) { return r.ok ? r.text() : ""; })
      .then(function (t) { if (t) leerTextos(t); })
      .catch(function () {})
      .then(arrancar);            // pase lo que pase, la página arranca
  } else {
    arrancar();
  }
})();
