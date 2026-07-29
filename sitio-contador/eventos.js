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

  // ── Utilidades ───────────────────────────────────────────────────
  var capa = document.getElementById("capaEventos");
  var elSusurro = document.getElementById("susurroPortada");
  var poema = document.getElementById("poema");
  var versos = poema ? poema.getElementsByClassName("verso") : [];
  var cieloEl = document.getElementById("cielo");
  var juegoEl = document.getElementById("juego");
  var relojEl = document.getElementById("reloj");
  var notaEl = document.getElementById("nota");
  var marcaEl = document.getElementById("marca");
  var cuerpo = document.body;

  var suave = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function jugando() { return juegoEl && juegoEl.classList.contains("viva"); }
  function az(a, b) { return a + Math.random() * (b - a); }
  function uno(lista) { return lista[Math.floor(Math.random() * lista.length)]; }

  function pon(el, ms) {
    capa.appendChild(el);
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, ms);
    return el;
  }
  function ponFijo(el, ms) {
    document.body.appendChild(el);
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

  function persistir() { guardarMem(mem); }

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
    }, 4200);
    return puntos;
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
  var PALABRAS = ["quédate", "vuelve", "mírame", "otra vez", "sigo aquí",
                  "no me voy", "dilo", "sí", "tuya", "dos de siete",
                  "ya falta poco"];

  var BANDERINES = ["te amo un montonazo", "falta poco, wawa", "sigo aquí",
                    "vuelvo en un rato", "esto lo escribí pensándote"];

  var CARTAS_CORTAS = [                                              // E37
    "Encontraste esto escarbando. Así encontraste todo lo mío: sin avisar.",
    "Si estás leyendo esto es que insististe. Me gusta que insistas.",
    "Dos líneas nada más: te amo, y ya falta menos.",
    "Nadie más va a leer esto. Es tuyo, como casi todo lo que escribo.",
    "La tercera estrofa ya está escrita. No la vas a ver hoy.",
    "Siete estrofas, y todas dicen lo mismo de maneras distintas."
  ];
  // La séptima solo el día D.
  var CARTA_DEL_DIA_D = "Séptima de siete. Hoy sí: entra y lee todo lo demás.";

  // E07 — la nota se tacha y se reescribe. Cinco versiones, rotando.
  var CORRECCIONES = [
    "muchísimo cariño",
    "un cariño que no cabe aquí",
    "mucho cariño y bastante insomnio",
    "cariño y semanas de trabajo",
    "mucho cariño, y me quedo corto"
  ];

  // Cuando se agota la ración de la sesión. {hora} = hora concreta de vuelta.
  var AVISOS = [                                                     // ración
    "por hoy ya te mostré bastante. vuelve como a las {hora} y traigo más",
    "hasta aquí llega esta tanda. a eso de las {hora} hay cosas nuevas",
    "me guardo el resto. vuelve a las {hora}, que no se me olvida"
  ];

  var NOTAS_REDONDAS = {                                             // E30
    30: "Un mes. Cabe en la palma de la mano.",
    21: "Tres semanas. Ya se ve desde aquí.",
    14: "Dos semanas: lo que dura un buen libro.",
    10: "Diez. De aquí en adelante los cuento con los dedos.",
    7:  "Siete días y siete versos. No es casualidad, es cariño con calendario.",
    3:  "Tres. Ya casi no hay que esperar, solo aguantar.",
    2:  "Mañana es la víspera. Duerme temprano, wawa.",
    1:  "Hoy es el último día del año en que todavía no fue tu cumpleaños."
  };

  var CARTA_RELAMPAGO =                                              // E59
    "Te escribo esto sabiendo que va a durar diez segundos en tu pantalla y " +
    "años en mi cabeza. No hace falta que lo guardes: lo que quiero decirte " +
    "no cabe en una hoja que se cae del cielo. Te amo, y llevo semanas " +
    "preparándote algo que todavía no puedes ver.";

  var VERSOS_NUEVOS = [                                              // E58
    "divina, boca viva… llueve este cuerpo nuevo en tu noche",
    "asumo el crudo desastre… bajo este nuevo cielo",
    "dedos que amasan… el filo de ser vulnerable"
  ];

  // ══════════════════════════════════════════════════════════════════
  //  CATÁLOGO DE AMBIENTE (los que salen solos, por azar)
  // ══════════════════════════════════════════════════════════════════
  var AMBIENTE = [

    // ── Susurros de texto ────────────────────────────────────────
    { id: "susurro", peso: 8, dura: 8500, correr: function () {           // E01
        susurrar(fraseAlAzar());
      } },

    { id: "verso", peso: 7, dura: 7000, correr: function () {             // E04
        if (window.abrirPoema) window.abrirPoema(7500);
        var i = Math.floor(Math.random() * versos.length);
        poema.classList.add("enfocado");
        versos[i].classList.add("viva");
        setTimeout(function () {
          poema.classList.remove("enfocado");
          versos[i].classList.remove("viva");
        }, 6000);
      } },

    { id: "verso-extra", peso: 3, dura: 7500, correr: function () {       // E05
        if (window.abrirPoema) window.abrirPoema(8500);
        var el = document.createElement("p");
        el.className = "verso-extra";
        el.textContent = "y todavía no termino de escribirte";
        setTimeout(function () {
          var caja = poema.getBoundingClientRect();
          el.style.top = (caja.bottom + 6) + "px";
        }, 900);
        ponFijo(el, 7200);
        void el.offsetWidth;
        el.classList.add("viva");
        guardarEnFrasco("y todavía no termino de escribirte");
      } },

    { id: "margen", peso: 4, dura: 9500, correr: function () {            // E06
        var ahora = new Date();
        var el = document.createElement("div");
        el.className = "margen";
        el.textContent = "nota: te pensé a las " +
          ahora.getHours() + ":" + ("0" + ahora.getMinutes()).slice(-2) +
          ", en medio de otra cosa";
        var derecha = Math.random() < 0.5;
        el.style.top = az(18, 62) + "vh";
        if (derecha) el.style.right = "4vw"; else el.style.left = "4vw";
        ponFijo(el, 9200);
      } },

    { id: "correccion", peso: 3, dura: 6500, correr: function () {        // E07
        var span = document.getElementById("notaCarino");
        if (!span) return;
        var original = span.textContent;
        var mejor = uno(CORRECCIONES);
        span.innerHTML = '<span class="tachado">' + original + '</span>';
        setTimeout(function () {
          span.innerHTML = '<span class="tachado">' + original + '</span> ' +
            '<span class="reescrito">' + mejor + '</span>';
        }, 1100);
        setTimeout(function () { span.textContent = original; }, 6000);
      } },

    { id: "nombre", peso: 2, dura: 6500, correr: function () {            // E08
        escribirConPuntos("ISI", window.innerHeight * 0.12, 11);
      } },

    // ── Cosas que cruzan el cielo ────────────────────────────────
    { id: "fugaz", peso: 9, dura: 3000, movimiento: true, correr: function () {   // E09
        var el = document.createElement("div");
        el.className = "fugaz";
        el.style.left = (Math.random() * 30) + "vw";
        el.style.top = (4 + Math.random() * 22) + "vh";
        pon(el, 2600);
        void el.offsetWidth;
        el.classList.add("corre");
        if (Math.random() < 0.34) setTimeout(function () { susurrar("pide algo", false); }, 900);
      } },

    { id: "fugaz-lenta", peso: 3, dura: 7000, movimiento: true, correr: function () {  // E10
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

    { id: "avioneta", peso: 4, dura: 15500, movimiento: true, correr: function () {    // E11
        var el = document.createElement("div");
        el.className = "avioneta";
        el.style.top = az(10, 26) + "vh";
        el.innerHTML = DIBUJO.avioneta + '<span class="banderin">' + uno(BANDERINES) + '</span>';
        pon(el, 15200);
      } },

    { id: "zorro", peso: 2, dura: 9500, correr: function () {             // E12
        var el = document.createElement("div");
        el.className = "criatura zorro tocable";
        el.style.left = az(12, 62) + "vw";
        el.innerHTML = DIBUJO.zorro;
        el.addEventListener("click", function () {
          // Levanta la cabeza antes de irse; no se desvanece, se va andando.
          el.classList.add("mirando");
          susurrar("me domesticaste, y ahora el resto del cielo me parece igual");
          setTimeout(function () { el.classList.add("se-va"); }, 1400);
        });
        pon(el, 9200);
      } },

    { id: "rosa", peso: 2, dura: 9500, correr: function () {              // E13
        var el = document.createElement("div");
        el.className = "criatura rosa tocable";
        el.style.left = az(12, 66) + "vw";
        el.innerHTML = DIBUJO.rosa;
        el.addEventListener("click", function () {
          el.classList.add("abierta");
          var p = document.createElement("div");
          p.className = "petalo";
          p.textContent = "no me riegues, quédate";
          var caja = el.getBoundingClientRect();
          p.style.left = caja.left + "px";
          p.style.top = caja.top + "px";
          pon(p, 3400);
        });
        pon(el, 9200);
      } },

    { id: "luciernagas", peso: 4, dura: 16000, correr: function () {      // E14
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
        setTimeout(function () { document.removeEventListener("pointermove", huir); }, 15500);
      } },

    { id: "globo", peso: 3, dura: 14500, movimiento: true, correr: function () {   // E15
        var el = document.createElement("div");
        el.className = "globo tocable";
        el.style.left = az(15, 75) + "vw";
        el.innerHTML = DIBUJO.globo;
        el.addEventListener("click", function () {
          var caja = el.getBoundingClientRect();
          confeti(12, caja.left, caja.top);
          el.style.display = "none";
          susurrar("eso también era para ti");
        });
        pon(el, 14200);
      } },

    { id: "luna", peso: 3, dura: 16500, cuando: function () {             // E16
        var h = new Date().getHours(); return h >= 19 || h < 7;
      }, correr: function () {
        var el = document.createElement("div");
        el.className = "luna tocable";
        el.innerHTML = luna();
        el.addEventListener("click", function () { susurrar("también te ves de noche"); });
        pon(el, 16200);
      } },

    { id: "constelacion", peso: 2, dura: 9000, correr: function () {      // E17
        var forma = [[0,20],[14,6],[30,2],[44,10],[38,26],[22,38],[6,30]];  // corazón torcido
        var x0 = window.innerWidth / 2 - 60, y0 = window.innerHeight * 0.16, k = 2.6;
        var svgEl = document.createElement("div");
        svgEl.style.cssText = "position:absolute;left:0;top:0;right:0;bottom:0";
        var d = forma.map(function (p, i) {
          return (i ? "L" : "M") + (x0 + p[0] * k) + " " + (y0 + p[1] * k);
        }).join(" ") + " Z";
        svgEl.innerHTML = '<svg width="100%" height="100%" style="position:absolute;inset:0">' +
          '<path d="' + d + '" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="1"/>' +
          forma.map(function (p) {
            return '<circle cx="' + (x0 + p[0] * k) + '" cy="' + (y0 + p[1] * k) +
                   '" r="2.4" fill="#fff"/>';
          }).join("") + '</svg>';
        svgEl.style.opacity = "0";
        svgEl.style.transition = "opacity 1.2s ease";
        pon(svgEl, 8800);
        setTimeout(function () { svgEl.style.opacity = "1"; }, 50);
        setTimeout(function () { svgEl.style.opacity = "0"; }, 6800);
      } },

    { id: "satelite", peso: 5, dura: 17500, movimiento: true, correr: function () {   // E18
        var el = document.createElement("div");
        el.className = "satelite";
        el.style.top = (8 + Math.random() * 30) + "vh";
        pon(el, 17500);
      } },

    { id: "polvo", peso: 4, dura: 9500, correr: function () {             // E19
        pon(Object.assign(document.createElement("div"), { className: "polvo" }), 9200);
      } },

    { id: "pecas", peso: 2, dura: 7000, correr: function () {             // E20
        escribirConPuntos("PEQUITA", window.innerHeight * 0.14, 9);
      } },

    // ── El reloj se porta raro ───────────────────────────────────
    { id: "latido", peso: 6, dura: 2200, movimiento: true, correr: function () {     // E21
        var bloque = document.getElementById("s").parentNode;
        bloque.classList.add("late");
        setTimeout(function () { bloque.classList.remove("late"); }, 1800);
      } },

    { id: "infinito", peso: 2, dura: 5000, correr: function () {          // E22
        var d = document.getElementById("d"), valor = d.textContent;
        window.relojTomado = true;
        d.textContent = "∞";
        setTimeout(function () {
          d.textContent = valor;
          window.relojTomado = false;
          susurrar("el tiempo también se equivoca", false);
        }, 2000);
      } },

    { id: "marcha-atras", peso: 2, dura: 4500, correr: function () {      // E23
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

    { id: "besos", peso: 3, dura: 9000, correr: function () {             // E24
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
        }, 7200);
      } },

    { id: "etiquetas", peso: 4, dura: 7000, correr: function () {         // E25
        var labs = relojEl.querySelectorAll(".lab");
        var nuevas = ["días sin verte", "horas pensándote", "minutos tontos", "segundos"];
        var viejas = [];
        labs.forEach(function (l, i) { viejas.push(l.textContent); l.textContent = nuevas[i] || l.textContent; });
        setTimeout(function () {
          labs.forEach(function (l, i) { l.textContent = viejas[i]; });
        }, 5500);
      } },

    { id: "digito", peso: 6, dura: 3600, correr: function () {            // E26
        var nums = document.querySelectorAll("#reloj .num");
        var el = nums[Math.floor(Math.random() * nums.length)];
        el.classList.add("enamorado");
        setTimeout(function () { el.classList.remove("enamorado"); }, 3000);
      } },

    // ── Clima ────────────────────────────────────────────────────
    { id: "lluvia", peso: 3, dura: 14000, movimiento: true, correr: function () {    // E43
        for (var i = 0; i < 60; i++) {
          var g = document.createElement("div");
          g.className = "gota";
          g.style.left = az(0, 100) + "vw";
          g.style.animationDuration = az(1.1, 2.2) + "s";
          g.style.animationDelay = az(0, 9) + "s";
          pon(g, 13500);
        }
        setTimeout(function () { susurrar("que llueva; igual te pienso"); }, 2500);
      } },

    // ── Legendarios (peso mínimo: ~1 de cada 40 visitas) ─────────
    { id: "lluvia-estrellas", peso: 0.5, dura: 11000, movimiento: true, correr: function () {  // E56
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
        setTimeout(function () { susurrar("todas para ti"); }, 8200);
      } },

    { id: "planeta", peso: 0.5, dura: 12000, correr: function () {        // E57
        var el = document.createElement("div");
        el.className = "planeta";
        pon(el, 11500);
        var quien = document.createElement("div");
        quien.style.cssText = "position:absolute;left:50%;bottom:26vh;transform:translateX(-50%);opacity:0;transition:opacity 1.4s";
        quien.innerHTML = svg(40, 26, '<circle cx="13" cy="9" r="5"/><path d="M13 14v14"/><path d="M6 34l7-6 7 6"/><path d="M6 22l7 3 7-3"/>');
        pon(quien, 11500);
        setTimeout(function () { quien.style.opacity = ".85"; }, 900);
        setTimeout(function () { quien.style.opacity = "0"; }, 9000);
      } },

    { id: "eco-poema", peso: 0.5, dura: 11000, correr: function () {      // E58
        if (window.abrirPoema) window.abrirPoema(11000);
        var lista = Array.prototype.slice.call(versos);
        lista.forEach(function (v) {
          v.style.setProperty("--desvio", az(-30, 30).toFixed(0) + "px");
          v.classList.add("baila");
        });
        setTimeout(function () {
          poema.classList.add("enfocado");
          susurrar(uno(VERSOS_NUEVOS));
        }, 1200);
        setTimeout(function () {
          lista.forEach(function (v) { v.classList.remove("baila"); });
          poema.classList.remove("enfocado");
        }, 8000);
      } },

    { id: "carta-rapida", peso: 0.5, dura: 12000, correr: function () {   // E59
        var el = document.createElement("div");
        el.className = "carta-rapida";
        el.textContent = CARTA_RELAMPAGO;
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
  //  MOTOR
  // ══════════════════════════════════════════════════════════════════
  var ocupado = false, vistosSesion = [], temporizador = 0, gastados = 0;
  var forzado = (location.search.match(/[?&]evento=([\w-]+)/) || [])[1];
  var rapido = /[?&]rapido/.test(location.search);

  // La ración: la página da mucho y rápido, y después se calla. Si vuelve
  // antes de la hora prometida, arranca con media ración.
  mem.sesion = mem.sesion || {};
  var RACION = (mem.sesion.vueltaA && Date.now() < mem.sesion.vueltaA) ? 3 : 6;
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
    if (horasDesde(e.id) < (e.descanso || 3)) return false;
    return !e.cuando || e.cuando(c);
  }

  function correr(e) {
    ocupado = true;
    try { e.correr(); } catch (err) { ocupado = false; return; }
    libreEn(e.dura);
    vistosSesion.push(e.id);
    anotarVisto(e.id);
    gastados++;
  }

  function lanzar() {
    // El modo forzado es una herramienta de prueba: se salta el candado.
    if (!forzado && (ocupado || jugando() || document.hidden)) return;
    if (forzado) {
      for (var f = 0; f < AMBIENTE.length; f++) {
        if (AMBIENTE[f].id === forzado) { ocupado = true; AMBIENTE[f].correr(); libreEn(AMBIENTE[f].dura); return; }
      }
      if (FORZABLES[forzado]) { ocupado = true; FORZABLES[forzado](); libreEn(9000); return; }
      return;
    }
    if (gastados >= RACION) { avisarVuelta(); return; }

    var c = contexto();
    var lista = AMBIENTE.filter(function (e) { return califica(e, c); });
    if (!lista.length) return;

    // Lo específico manda sobre lo genérico.
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
    susurrar(uno(AVISOS).replace("{hora}", reloj), false);
  }

  function agendar() {
    clearTimeout(temporizador);
    temporizador = setTimeout(function () {
      lanzar();
      agendar();
    }, rapido ? 2500 : 10000 + Math.random() * 10000);   // entre 10 s y 20 s
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

  // Si hay palabras propias en CONFIG, salen en orden, una por toque.
  var iPalabra = 0, ultimaPalabra = "";
  function siguientePalabra() {
    var propias = CONFIG.palabrasEnOrden || [Admito que es real
  Me enseñaste que el amor es infinito y que me busque más
  Ya no duele nada, llenas de morfina mi inseguridad
  Dulce eternidad

  Hum, es verdad
  Te amará mi alma cuando mi cabeza deje de pensar
  Cuando no haya tiempo y este corazón deje de palpitar
  Deje de palpitar

  Yo quiero que me entierren junto a ti
  Bajo el sauce que sembramos
  Que nos junte la raíz
  En amor, siempre empatarnos];
    if (propias.length) {
      var p = propias[iPalabra % propias.length];
      iPalabra++;
      return p;
    }
    var p2 = uno(PALABRAS);
    while (p2 === ultimaPalabra && PALABRAS.length > 1) p2 = uno(PALABRAS);
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
      susurrar("quédate un poquito, que aquí no molestas nunca");
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
    }, 12000);
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
    susurrar("se te cayó el cielo encima", false);
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
        susurrar(CONFIG.dosSiete.revelacion || CONFIG.dosSiete.texto);
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
      var baraja = CARTAS_CORTAS.slice();
      if (restante() <= 0) baraja.push(CARTA_DEL_DIA_D);      // la séptima
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
      susurrar("aquí te espero; es lo que mejor me sale");
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
        sonido.volume = Math.min(destino, paso * i);
        if (i >= 20) clearInterval(t);
      }, 100);
    }

    mando.addEventListener("input", function () {
      volumen = mando.value / 100;
      mem.volumen = volumen; persistir();
      if (!musicaEncendida) { arrancarMusica(); return; }
      sonido.volume = volumen;
    });

    // El primer toque en cualquier parte enciende el sonido: ningún navegador
    // deja sonar audio antes, y así ella no tiene que pulsar nada aparte.
    window.arrancarMusica = function () {
      if (musicaEncendida || !sonido) return;
      if (mem.volumen === 0) return;                 // lo silenció ella
      musicaEncendida = true;
      cuadrar();
      var promesa = sonido.play();
      if (promesa && promesa.catch) promesa.catch(function () { musicaEncendida = false; });
      subirSuave(volumen);
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

  function abrirColeccion() {
    var lista = mem.coleccion.map(function (f) { return "<li>" + f + "</li>"; }).join("") ||
      "<li>todavía no has encontrado ninguna. vuelve mañana.</li>";
    var sellos = "";
    for (var i = 27; i >= 0; i--) {
      var d = fechaLocal(new Date(Date.now() - i * 86400000));
      sellos += '<span class="' + (mem.dias.indexOf(d) >= 0 ? "sellado" : "") + '">' +
        parseInt(d.slice(-2), 10) + "</span>";
    }
    panel.innerHTML = "<h2>tu frasco</h2>" +
      '<p class="cuenta">' +
      mem.coleccion.length + (mem.coleccion.length === 1 ? " encontrada · " : " encontradas · ") +
      mem.dias.length + (mem.dias.length === 1 ? " día visitado · " : " días visitados · ") +
      "racha de " + (mem.racha || 1) + "</p>" +
      "<ul>" + lista + "</ul>" +
      '<div class="calendario">' + sellos + "</div>" +
      '<button class="cerrar" type="button">cerrar</button>';
    panel.querySelector(".cerrar").addEventListener("click", function () {
      panel.classList.remove("viva");
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
      susurrar(CONFIG.dosSiete.texto);
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
        susurrar("haz un deseo", false);
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
    var frases = ["ya está", "respira", "un poco más", "casi", "ahora sí", "feliz cumpleaños, wawa"];
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
    setTimeout(function () { susurrar("siete días. siete versos. siete estrofas"); }, 8200);
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
  var SALUDOS = {                                                     // E39
    madrugada: "¿otra vez despierta? yo igual. hazme compañía un rato",
    manana:    "buenos días, mi wawa. el día ya empezó mejor",
    tarde:     "hola, pequita. pasé a dejarte algo y me quedé",
    noche:     "buenas noches, pequita. el cielo también hace guardia"
  };

  function saludo() {
    var h = new Date().getHours();
    if (h < 5) return SALUDOS.madrugada;
    if (h < 12) return SALUDOS.manana;
    if (h < 20) return SALUDOS.tarde;
    return SALUDOS.noche;
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
    for (var i = 0; i < Math.min(mem.versos || 0, versos.length); i++) {
      versos[i].classList.add("ganado");
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
      arriba.textContent = "llevamos " + dias + (dias === 1 ? " día" : " días") +
        " desde tu cumpleaños, y el contador sigue por gusto";
      var listo = document.getElementById("listo");
      if (listo) listo.appendChild(arriba);
    }

    // Los textos de entrada, en cola y sin pisarse
    var cola = [];
    cola.push(saludo());
    if (primeraDelDia) cola.push(fraseDelDia());                      // E02/E46
    if (NOTAS_REDONDAS[faltan] && primeraDelDia) cola.push(NOTAS_REDONDAS[faltan]);  // E30
    if (dia === 1) cola.push("faltan menos, y yo también");           // E41
    if (fecha === 7 && primeraDelDia) {                               // E42
      cola.push("hoy es 7: el número que nos persigue");
    }
    if (fecha === 2 && primeraDelDia) {
      cola.push("dos de siete. todavía quedan cinco por llegar");
    }
    if ((mem.racha || 0) >= 3 && primeraDelDia) cola.push("vienes todos los días… te vi");  // E44
    if (diasFuera > 3) cola.push("te fuiste un rato; el contador siguió, yo también");      // E45

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
    if (!document.hidden && !jugando()) susurrar("¿sigues ahí? yo también");
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
    "carta-corta": function () { susurrar(uno(CARTAS_CORTAS)); },
    "dias-juntos": loQueLlevamos,
    "capicua": function () { susurrar("haz un deseo", false); },
    "dos-siete": function () { susurrar(CONFIG.dosSiete.revelacion || CONFIG.dosSiete.texto); },
    "cuenta-final": cuentaFinal,
    "medianoche": medianoche,
    "confeti": function () { confeti(80, null, null); },
    "amanece": function () {
      cuerpo.classList.add("amanece");
      setTimeout(function () { cuerpo.classList.remove("amanece"); }, 3200);
    },
    "quieta": function () { cuerpo.classList.add("quieta"); susurrar("aquí te espero; es lo que mejor me sale"); },
    "coleccion": abrirColeccion,
    "sobre": function () {
      var s = document.createElement("div");
      s.className = "sobre"; s.innerHTML = DIBUJO.sobre;
      ponFijo(s, 9000);
    },

    // Saludos y textos de entrada, para poder verlos a cualquier hora
    "saludo-madrugada": function () { susurrar(SALUDOS.madrugada); },
    "saludo-manana": function () { susurrar(SALUDOS.manana); },
    "saludo-tarde": function () { susurrar(SALUDOS.tarde); },
    "saludo-noche": function () { susurrar(SALUDOS.noche); },
    "frase-dia": function () { susurrar(fraseDelDia()); },
    "susurro-tardio": function () { susurrar("¿sigues ahí? yo también"); },
    "lunes": function () { susurrar("faltan menos, y yo también"); },
    "cumplemes": function () { susurrar("hoy es 7: el número que nos persigue"); },
    "racha": function () { susurrar("vienes todos los días… te vi"); },
    "ausencia": function () { susurrar("te fuiste un rato; el contador siguió, yo también"); },
    "nota-7dias": function () { susurrar(NOTAS_REDONDAS[7]); },

    // Estados de fondo, que en la vida real duran horas o días
    "madrugada": function () { alternarClase("madrugada", 8000); },
    "domingo": function () { alternarClase("domingo", 8000); },
    "amanecer-final": function () { alternarClase("amaneciendo", 9000); },

    // Interacciones, simuladas para poder verlas sin el gesto
    "palabra": function () {
      var el = document.createElement("span");
      el.className = "palabra";
      el.textContent = uno(PALABRAS);
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
      susurrar("se te cayó el cielo encima", false);
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
      mem = { coleccion: [], dias: [], versos: 0, cartas: [], ultimos: {}, sesion: {} };
      persistir(); pintarFrasco();
      susurrar("(memoria borrada: vuelve a ser la primera visita)", false);
    },
    "siete": function () {
      var b = document.getElementById("s").parentNode;
      b.classList.add("siete");
      setTimeout(function () { b.classList.remove("siete"); }, 3000);
    },
    "versos-semana": function () {
      if (window.abrirPoema) window.abrirPoema(9000);
      for (var i = 0; i < 4; i++) versos[i].classList.add("ganado");
      setTimeout(function () {
        for (var j = 0; j < versos.length; j++) {
          if (j >= (mem.versos || 0)) versos[j].classList.remove("ganado");
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
    "borrar-memoria": "↺ Borrar memoria", "cuenta-final": "Últimos 60 segundos",
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
    { titulo: "Herramientas", ids: ["vaciar-racion", "borrar-memoria"] },
    { titulo: "Pendiente de un dato tuyo", ids: ["voz"] }
  ];

  function disparar(id) {
    ocupado = false;                       // en pruebas se puede encadenar
    for (var i = 0; i < AMBIENTE.length; i++) {
      if (AMBIENTE[i].id === id) { correr(AMBIENTE[i]); return; }
    }
    if (FORZABLES[id]) FORZABLES[id]();
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

  // ── Arranque ─────────────────────────────────────────────────────
  var retraso = alEntrar();
  despertar();
  setTimeout(agendar, rapido ? 600 : Math.min(retraso, 30000));
})();
