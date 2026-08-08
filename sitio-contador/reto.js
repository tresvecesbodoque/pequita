/* ══════════════════════════════════════════════════════════════════
   EL RETO DE LAS SIETE PUERTAS
   ══════════════════════════════════════════════════════════════════

   Un solo desafío, siete etapas seguidas, y al final el segundo regalo.
   Cada etapa pide una cosa distinta, para que no se gane con un solo
   talento:

       I  · la constelación    memoria    repetir la secuencia
       II · los siete sietes   cabeza     tres cifras que ella sabe
       III· dueño del cielo    ritmo      dar en la línea a tiempo
       IV · el laberinto       pulso      el brote hasta la rosa
       V  · el cielo cambiado  ojo        ver qué se movió
       VI · las siete lámparas cabeza fría encenderlas todas
       VII· el pulso de la rosa nervio    seguirla mientras huye

   Las tres últimas se añadieron después y van AL FINAL a propósito:
   así quien ya cruzó las cuatro primeras no las vuelve a cruzar (la
   memoria guarda un número de etapa, y ese número sigue valiendo).

   Reglas de la casa:
   - DIFÍCIL, pero la etapa superada queda superada: al fallar se repite
     ESA etapa, nunca desde la primera. Se guarda en el aparato.
   - Todo va con semilla FIJA: la misma secuencia, las mismas preguntas,
     el mismo laberinto en cada intento. Se puede aprender, y aprenderlo
     es justo lo que se le pide.
   - Tras varios fallos seguidos, la etapa ayuda SIN DECIRLO. Nunca se
     anuncia: ella solo nota que de pronto le sale.
   - El regalo se abre al terminar las siete, y queda abierto.

   Sin dependencias. Se pinta con los TOKENS del sitio, así que el reto
   amanece con el resto el día del cumpleaños.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var MEM = "pequita.reto";
  var suave = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ── Memoria ───────────────────────────────────────────────────────
  function leer() {
    try {
      var m = JSON.parse(localStorage.getItem(MEM) || "{}") || {};
      // El tope se lee de ETAPAS, no de un 3 escrito a mano: al añadir una
      // puerta más, esta línea no hay que tocarla (y si se olvidara, dejaría
      // a quien va avanzado encerrado en la etapa cuatro para siempre).
      var etapaGuardada = Math.min(Math.max(+m.etapa || 0, 0), ETAPAS.length - 1);
      // Si ya vio el regalo con una versión más corta del reto, la etapa
      // guardada es la última puerta de ESA versión, que ya cruzó: que no
      // la vuelva a cruzar, que arranque en la puerta nueva de al lado.
      if (m.ganado && etapaGuardada < ETAPAS.length - 1) etapaGuardada++;
      return { etapa: etapaGuardada, ganado: !!m.ganado };
    } catch (e) { return { etapa: 0, ganado: false }; }
  }
  function guardar() { try { localStorage.setItem(MEM, JSON.stringify(memoria)); } catch (e) {} }
  // No se lee aquí: `leer()` mira ETAPAS, que todavía no existe a esta altura
  // del archivo. Lo que vale se lee al abrir, que es cuando importa.
  var memoria = { etapa: 0, ganado: false };

  // ── Azar con semilla: lo mismo en cada intento ────────────────────
  function azarSemilla(s) {
    return function () {
      s |= 0; s = (s + 0x6D2B79F5) | 0;
      var t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // ── La pantalla ───────────────────────────────────────────────────
  var caja = document.createElement("div");
  caja.className = "reto";
  caja.id = "reto";
  caja.setAttribute("aria-hidden", "true");
  caja.innerHTML =
    '<canvas id="retoLienzo"></canvas>' +
    '<div class="reto-hud">' +
      '<span class="reto-etapa" id="retoEtapa"></span>' +
      '<span class="reto-marca" id="retoMarca"></span>' +
    '</div>' +
    '<button class="reto-salir" id="retoSalir" type="button">volver</button>' +
    '<div class="reto-cifras" id="retoCifras" hidden>' +
      '<p class="reto-acertijo" id="retoAcertijo"></p>' +
      '<p class="reto-marcador" id="retoMarcador">_</p>' +
      '<div class="reto-teclas" id="retoTeclas"></div>' +
    '</div>' +
    '<button class="reto-regalo" id="retoVerRegalo" type="button" hidden>ver el regalo ✿</button>' +
    '<p class="reto-nota" id="retoNota"></p>' +
    '<div class="reto-premio" id="retoPremio">' +
      '<p class="reto-titulo">las siete puertas</p>' +
      '<img alt="Tu otro regalo" id="retoFoto" />' +
      '<p class="reto-frase" id="retoFrase"></p>' +
      '<button class="reto-cerrar" id="retoCerrar" type="button">volver al conteo</button>' +
    '</div>';
  document.body.appendChild(caja);

  var lienzo = caja.querySelector("#retoLienzo");
  var ctx = lienzo.getContext("2d");
  var elEtapa = caja.querySelector("#retoEtapa");
  var elMarca = caja.querySelector("#retoMarca");
  var elNota = caja.querySelector("#retoNota");
  var elCifras = caja.querySelector("#retoCifras");
  var elAcertijo = caja.querySelector("#retoAcertijo");
  var elMarcador = caja.querySelector("#retoMarcador");
  var elTeclas = caja.querySelector("#retoTeclas");
  var elPremio = caja.querySelector("#retoPremio");
  var elFoto = caja.querySelector("#retoFoto");
  var elFrase = caja.querySelector("#retoFrase");
  var elVerRegalo = caja.querySelector("#retoVerRegalo");

  // ── Paleta leída de los tokens (vira al papel el día D) ───────────
  var P = { dia: false, oro: "#d9a83f", rosa: "#c96b74", calida: "#f6e3c8" };
  function leerPaleta() {
    var raiz = getComputedStyle(document.documentElement);
    function tomar(nombre, porDefecto) {
      var v = (raiz.getPropertyValue(nombre) || "").trim();
      return /^(#|rgb)/.test(v) ? v : porDefecto;
    }
    P.dia = document.documentElement.classList.contains("dia");
    P.oro = tomar("--gold", "#d9a83f");
    P.rosa = tomar("--rose", "#c96b74");
    P.calida = tomar("--ink-calida", "#f6e3c8");
  }
  function conAlfa(color, a) {
    var hex = color.match(/^#([0-9a-fA-F]{6})$/);
    if (hex) {
      var n = parseInt(hex[1], 16);
      return "rgba(" + ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")";
    }
    var trio = color.match(/(\d+)[,\s]+(\d+)[,\s]+(\d+)/);
    return trio ? "rgba(" + trio[1] + "," + trio[2] + "," + trio[3] + "," + a + ")" : color;
  }
  function conBrillo(radio, color, alfa) {
    if (suave || P.dia) return;
    ctx.shadowBlur = radio; ctx.shadowColor = conAlfa(color, alfa);
  }

  // ── Estado común ──────────────────────────────────────────────────
  var W = 0, H = 0;
  var etapa = 0, fallos = 0, viva = false, ultimo = 0, rafId = 0;
  // Cuánto se sube el punto en las etapas de arrastre, para que el dedo no
  // tape lo que hay que mirar. Solo con el dedo: con el ratón se ve todo.
  var TOQUE_ARRIBA = 38;
  // Entre una etapa y la siguiente hay un respiro (se lee «etapa superada»).
  // Durante ese hueco NADIE late ni pinta: la etapa que viene todavía no está
  // preparada, y pintarla sería pintar el vacío.
  var transicion = false;
  var reloj = 0;                       // segundos desde que abrió la etapa

  var notaId = 0;
  function nota(texto, ms) {
    clearTimeout(notaId);
    elNota.textContent = texto || "";
    elNota.classList.toggle("viva", !!texto);
    if (texto && ms) notaId = setTimeout(function () { elNota.classList.remove("viva"); }, ms);
  }

  function estrella(x, y, r, giro) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(giro || 0); ctx.beginPath();
    for (var i = 0; i < 10; i++) {
      var rad = i % 2 ? r * 0.42 : r;
      var a = (Math.PI / 5) * i - Math.PI / 2;
      ctx[i ? "lineTo" : "moveTo"](Math.cos(a) * rad, Math.sin(a) * rad);
    }
    ctx.closePath(); ctx.fill(); ctx.restore();
  }
  function rosa(x, y, r) {
    ctx.save(); ctx.translate(x, y);
    ctx.strokeStyle = P.rosa; ctx.lineWidth = 1.4; ctx.fillStyle = conAlfa(P.rosa, .22);
    conBrillo(12, P.rosa, .6);
    for (var i = 3; i >= 1; i--) {
      ctx.beginPath(); ctx.arc(0, 0, r * (i / 3), 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }
    ctx.restore();
  }

  /* ════════════════════════════════════════════════════════════════
     ETAPA I — LA CONSTELACIÓN (memoria)
     Siete estrellas. Se encienden en un orden y hay que repetirlo.
     Cinco rondas: 3, 4, 5, 6 y 7 encendidos. La secuencia es SIEMPRE
     la misma, así que la memoria de verdad sirve.
     ════════════════════════════════════════════════════════════════ */
  var uno = {
    num: "I", nombre: "la constelación",
    estrellas: [], orden: [], ronda: 0, paso: 0,
    mostrando: false, iMostrar: 0, hasta: 0, encendida: -1, esperaHasta: 0,

    preparar: function () {
      var azar = azarSemilla(7);
      // Siete estrellas repartidas sin amontonarse, en el alto útil.
      this.estrellas = [];
      var margen = Math.min(W, H) * 0.13;
      for (var i = 0; i < 7; i++) {
        var fila = Math.floor(i / 2), col = i % 2;
        this.estrellas.push({
          x: margen + (W - margen * 2) * (col ? 0.66 : 0.24) + (azar() - 0.5) * W * 0.14,
          y: H * 0.20 + (H * 0.56) * (fila / 3) + (azar() - 0.5) * H * 0.05
        });
      }
      // El orden: una permutación fija de las siete.
      this.orden = [0, 1, 2, 3, 4, 5, 6];
      for (var k = this.orden.length - 1; k > 0; k--) {
        var j = Math.floor(azar() * (k + 1));
        var t = this.orden[k]; this.orden[k] = this.orden[j]; this.orden[j] = t;
      }
      this.ronda = 0;
      this.arrancarRonda();
    },
    largoRonda: function () { return 3 + this.ronda; },     // 3,4,5,6,7
    arrancarRonda: function () {
      this.paso = 0; this.mostrando = true; this.iMostrar = 0;
      this.encendida = -1;
      this.hasta = Date.now() + 700;                        // respiro antes de empezar
      elMarca.textContent = "ronda " + (this.ronda + 1) + " de 5";
      nota(this.ronda === 0 ? "mira el orden y repítelo" : "", 2600);
    },
    // Con muchos fallos, los destellos se alargan: no se dice, se nota.
    duracion: function () { return fallos >= 3 ? 620 : 430; },
    hueco: function () { return fallos >= 3 ? 250 : 170; },

    latir: function () {
      if (!this.mostrando) {
        // Sin tocar durante mucho rato: se pierde la ronda.
        if (this.esperaHasta && Date.now() > this.esperaHasta) perder("se te fue el hilo");
        return;
      }
      var ahora = Date.now();
      if (ahora < this.hasta) return;
      if (this.encendida >= 0) {                            // apagar y seguir
        this.encendida = -1;
        this.iMostrar++;
        this.hasta = ahora + this.hueco();
        if (this.iMostrar >= this.largoRonda()) {
          this.mostrando = false;
          this.esperaHasta = ahora + 9000;
        }
        return;
      }
      this.encendida = this.orden[this.iMostrar];
      this.hasta = ahora + this.duracion();
    },

    pintar: function () {
      for (var i = 0; i < this.estrellas.length; i++) {
        var e = this.estrellas[i];
        var on = this.encendida === i;
        // Migaja silenciosa: con muchos fallos, la que toca se insinúa.
        var pista = !this.mostrando && fallos >= 5 && this.orden[this.paso] === i;
        ctx.save();
        if (on) conBrillo(26, P.calida, .95);
        else if (pista) conBrillo(14, P.calida, .5);
        ctx.fillStyle = on ? P.calida : (pista ? conAlfa(P.calida, .5) : conAlfa(P.oro, .38));
        estrella(e.x, e.y, on ? 20 : 13, 0);
        ctx.restore();
      }
      // Los aciertos de la ronda, como puntos que se van llenando.
      ctx.save();
      for (var k = 0; k < this.largoRonda(); k++) {
        ctx.fillStyle = k < this.paso ? P.oro : conAlfa(P.oro, .25);
        ctx.beginPath();
        ctx.arc(W / 2 - (this.largoRonda() - 1) * 7 + k * 14, H * 0.9, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    },

    tocar: function (x, y) {
      if (this.mostrando) return;
      for (var i = 0; i < this.estrellas.length; i++) {
        var e = this.estrellas[i];
        if (Math.hypot(x - e.x, y - e.y) > 34) continue;
        if (this.orden[this.paso] !== i) { perder("esa no era"); return; }
        this.paso++;
        this.encendida = i;
        this.hasta = Date.now() + 160;
        var self = this;
        setTimeout(function () { if (!self.mostrando) self.encendida = -1; }, 160);
        this.esperaHasta = Date.now() + 9000;
        if (this.paso >= this.largoRonda()) {
          this.esperaHasta = 0;
          if (this.ronda >= 4) { ganarEtapa(); return; }
          this.ronda++;
          var s2 = this;
          nota("bien", 1200);
          setTimeout(function () { if (viva && etapa === 0) s2.arrancarRonda(); }, 900);
        }
        return;
      }
    }
  };

  /* ════════════════════════════════════════════════════════════════
     ETAPA II — LOS SIETE SIETES (cabeza)
     Tres cifras que ella puede sacar de lo que ya tiene delante: el
     poema y su propio cumpleaños. Nada de cultura general.
     ════════════════════════════════════════════════════════════════ */
  var dos = {
    num: "II", nombre: "los siete sietes",
    // Esta etapa no vive del tamaño de la pantalla, así que un cambio de
    // pantalla no la reinicia: girar el teléfono le borraba lo respondido.
    quieta: true,
    preguntas: [
      { texto: "cada verso del poema tiene las mismas palabras. ¿cuántas?", clave: 7 },
      { texto: "los años que cumples hoy", clave: 23 },
      { texto: "siete estrofas, siete versos cada una: ¿cuántos versos tiene el poema entero?", clave: 49 }
    ],
    i: 0, tecleado: "", errores: 0,

    preparar: function () {
      this.i = 0; this.tecleado = ""; this.errores = 0;
      elCifras.hidden = false;
      elMarca.textContent = "1 de 3";
      this.pintarPregunta();
      nota("");
    },
    salir: function () { elCifras.hidden = true; },

    pintarPregunta: function () {
      elAcertijo.textContent = this.preguntas[this.i].texto;
      elMarcador.textContent = this.tecleado || "_";
      elMarca.textContent = (this.i + 1) + " de 3";
    },
    teclear: function (t) {
      if (t === "borrar") this.tecleado = this.tecleado.slice(0, -1);
      else if (t === "va") return this.comprobar();
      else if (this.tecleado.length < 3) this.tecleado += t;
      this.pintarPregunta();
    },
    comprobar: function () {
      if (!this.tecleado) return;
      if (+this.tecleado === this.preguntas[this.i].clave) {
        this.tecleado = ""; this.errores = 0;
        if (this.i >= this.preguntas.length - 1) { ganarEtapa(); return; }
        this.i++;
        nota("esa es", 1200);
        this.pintarPregunta();
        return;
      }
      this.errores++;
      this.tecleado = "";
      elCifras.classList.remove("tiembla");
      void elCifras.offsetWidth;                    // reiniciar la animación
      elCifras.classList.add("tiembla");
      // Ayuda que no se anuncia: primero cuántas cifras, luego la primera.
      var clave = String(this.preguntas[this.i].clave);
      if (this.errores >= 5) nota("empieza por " + clave[0], 3000);
      else if (this.errores >= 3) nota(clave.length === 1 ? "es una sola cifra" : "son " + clave.length + " cifras", 3000);
      else nota("no es esa", 1600);
      this.pintarPregunta();
    },
    pintar: function () {
      // Fondo quieto: aquí se piensa, no se corre. Solo el cielo de siempre.
      ctx.save();
      ctx.fillStyle = conAlfa(P.oro, .3);
      for (var i = 0; i < 7; i++) {
        var a = (i / 7) * Math.PI * 2 + reloj * 0.1;
        estrella(W / 2 + Math.cos(a) * W * 0.36, H * 0.22 + Math.sin(a) * H * 0.06, 4, a);
      }
      ctx.restore();
    },
    tocar: function () {}
  };

  /* ════════════════════════════════════════════════════════════════
     ETAPA III — DUEÑO DEL CIELO (ritmo)
     Tres columnas y una línea. Cada nota se toca justo cuando la cruza.
     El compás se acelera; cuatro perdidas y se repite la etapa.
     ════════════════════════════════════════════════════════════════ */
  var tres = {
    num: "III", nombre: "dueño del cielo",
    notas: [], siguiente: 0, perdidas: 0, empezado: 0, total: 26,

    preparar: function () {
      var azar = azarSemilla(30);          // 30 de octubre, ya que estamos
      this.notas = [];
      var t = 1400, hueco = 720;
      for (var i = 0; i < this.total; i++) {
        this.notas.push({ carril: Math.floor(azar() * 3), t: t, dada: false, fallada: false });
        t += hueco;
        hueco = Math.max(360, hueco - 14);   // el compás se aprieta
      }
      this.siguiente = 0; this.perdidas = 0;
      this.empezado = Date.now();
      elMarca.textContent = "0 / " + this.total;
      nota("toca la columna cuando la nota cruce la línea", 3200);
    },
    linea: function () { return H * 0.78; },
    caida: function () { return H * 0.62; },   // desde dónde cae, en píxeles
    tolerancia: function () { return fallos >= 3 ? 34 : 24; },
    velocidad: function () { return 1700; },   // ms que tarda en caer

    latir: function () {
      var ahora = Date.now() - this.empezado;
      for (var i = this.siguiente; i < this.notas.length; i++) {
        var n = this.notas[i];
        if (n.dada || n.fallada) continue;
        if (ahora > n.t + 260) {                 // se le pasó
          n.fallada = true; this.perdidas++;
          elMarca.textContent = this.contadas() + " / " + this.total;
          if (this.perdidas >= 4) { perder("se te escaparon cuatro"); return; }
        }
      }
      if (this.contadas() >= this.total) {
        if (this.perdidas < 4) ganarEtapa();
      }
    },
    contadas: function () {
      var c = 0;
      for (var i = 0; i < this.notas.length; i++) if (this.notas[i].dada || this.notas[i].fallada) c++;
      return c;
    },
    yDe: function (n, ahora) {
      var falta = n.t - ahora;                   // ms para que cruce la línea
      return this.linea() - (falta / this.velocidad()) * this.caida();
    },

    pintar: function () {
      var ahora = Date.now() - this.empezado;
      var anchoCarril = W / 3;

      // Los tres carriles y la línea.
      ctx.save();
      ctx.strokeStyle = conAlfa(P.oro, .18); ctx.lineWidth = 1;
      for (var c = 1; c < 3; c++) {
        ctx.beginPath(); ctx.moveTo(c * anchoCarril, H * 0.12); ctx.lineTo(c * anchoCarril, H * 0.9); ctx.stroke();
      }
      ctx.strokeStyle = conAlfa(P.oro, .7); ctx.lineWidth = 1.8;
      conBrillo(10, P.oro, .5);
      ctx.beginPath(); ctx.moveTo(0, this.linea()); ctx.lineTo(W, this.linea()); ctx.stroke();
      ctx.restore();

      // Las notas.
      for (var i = 0; i < this.notas.length; i++) {
        var n = this.notas[i];
        if (n.dada) continue;
        var y = this.yDe(n, ahora);
        if (y < H * 0.06 || y > H) continue;
        var x = n.carril * anchoCarril + anchoCarril / 2;
        ctx.save();
        if (n.fallada) { ctx.globalAlpha = .25; ctx.fillStyle = conAlfa(P.rosa, .8); }
        else { conBrillo(16, P.oro, .8); ctx.fillStyle = P.oro; }
        estrella(x, y, 13, 0);
        ctx.restore();
      }
    },

    tocar: function (x) {
      var carril = Math.max(0, Math.min(2, Math.floor(x / (W / 3))));
      var ahora = Date.now() - this.empezado;
      var mejor = -1, mejorDist = Infinity;
      for (var i = 0; i < this.notas.length; i++) {
        var n = this.notas[i];
        if (n.dada || n.fallada || n.carril !== carril) continue;
        var d = Math.abs(this.yDe(n, ahora) - this.linea());
        if (d < mejorDist) { mejorDist = d; mejor = i; }
      }
      if (mejor < 0 || mejorDist > this.tolerancia()) {
        this.perdidas++;
        nota("", 0);
        if (this.perdidas >= 4) perder("cuatro fuera de sitio");
        return;
      }
      this.notas[mejor].dada = true;
      elMarca.textContent = this.contadas() + " / " + this.total;
    }
  };

  /* ════════════════════════════════════════════════════════════════
     ETAPA IV — EL LABERINTO DE LA ROSA (pulso)
     El brote, con el dedo, de abajo hasta la rosa, sin rozar y con el
     reloj encima. La más grande y la más apretada de las cuatro primeras.
     ════════════════════════════════════════════════════════════════ */
  var cuatro = {
    num: "IV", nombre: "el laberinto de la rosa",
    pulgar: true,                       // se juega arrastrando: el dedo estorba
    cols: 7, filas: 12, segundos: 48,
    lab: null, camino: [], paredes: [], t: 0, ox: 0, oy: 0,
    dedo: { x: 0, y: 0 }, rastro: [], corriendo: false, tocando: false,
    restante: 0, pistaHasta: 0, holgura: 0, extra: 0,

    cavar: function () {
      var cols = this.cols, filas = this.filas, azar = azarSemilla(7 * 4);
      var celdas = [], i;
      for (i = 0; i < cols * filas; i++) celdas.push({ n: true, e: true, s: true, o: true, visto: false });
      var idx = function (c, f) { return f * cols + c; };
      var pila = [{ c: 0, f: filas - 1 }];
      celdas[idx(0, filas - 1)].visto = true;
      while (pila.length) {
        var a = pila[pila.length - 1], vec = [];
        if (a.f > 0 && !celdas[idx(a.c, a.f - 1)].visto) vec.push({ c: a.c, f: a.f - 1, mio: "n", suyo: "s" });
        if (a.c < cols - 1 && !celdas[idx(a.c + 1, a.f)].visto) vec.push({ c: a.c + 1, f: a.f, mio: "e", suyo: "o" });
        if (a.f < filas - 1 && !celdas[idx(a.c, a.f + 1)].visto) vec.push({ c: a.c, f: a.f + 1, mio: "s", suyo: "n" });
        if (a.c > 0 && !celdas[idx(a.c - 1, a.f)].visto) vec.push({ c: a.c - 1, f: a.f, mio: "o", suyo: "e" });
        if (!vec.length) { pila.pop(); continue; }
        var v = vec[Math.floor(azar() * vec.length)];
        celdas[idx(a.c, a.f)][v.mio] = false;
        celdas[idx(v.c, v.f)][v.suyo] = false;
        celdas[idx(v.c, v.f)].visto = true;
        pila.push({ c: v.c, f: v.f });
      }
      celdas[idx(0, filas - 1)].s = false;
      celdas[idx(cols - 1, 0)].n = false;
      this.lab = { cols: cols, filas: filas, celdas: celdas, cEntra: 0, cSale: cols - 1, idx: idx };
    },
    resolver: function () {
      var L = this.lab, origen = L.idx(L.cEntra, L.filas - 1), destino = L.idx(L.cSale, 0);
      var previo = {}, cola = [origen], vistos = {};
      vistos[origen] = true;
      while (cola.length) {
        var actual = cola.shift();
        if (actual === destino) break;
        var c = actual % L.cols, f = Math.floor(actual / L.cols), cel = L.celdas[actual], pasos = [];
        if (!cel.n && f > 0) pasos.push(L.idx(c, f - 1));
        if (!cel.e && c < L.cols - 1) pasos.push(L.idx(c + 1, f));
        if (!cel.s && f < L.filas - 1) pasos.push(L.idx(c, f + 1));
        if (!cel.o && c > 0) pasos.push(L.idx(c - 1, f));
        for (var p = 0; p < pasos.length; p++) {
          if (vistos[pasos[p]]) continue;
          vistos[pasos[p]] = true; previo[pasos[p]] = actual; cola.push(pasos[p]);
        }
      }
      var camino = [], nodo = destino;
      while (nodo !== undefined && nodo !== origen) { camino.unshift(nodo); nodo = previo[nodo]; }
      camino.unshift(origen);
      this.camino = camino;
    },
    encajar: function () {
      var margen = 18, arriba = 58, abajo = 92;
      this.t = Math.min((W - margen * 2) / this.cols, (H - arriba - abajo) / this.filas);
      this.ox = (W - this.t * this.cols) / 2;
      this.oy = arriba + (H - arriba - abajo - this.t * this.filas) / 2;
      this.paredes = [];
      var self = this, añadir = function (x1, y1, x2, y2) { self.paredes.push({ x1: x1, y1: y1, x2: x2, y2: y2 }); };
      for (var f = 0; f < this.filas; f++) {
        for (var c = 0; c < this.cols; c++) {
          var cel = this.lab.celdas[this.lab.idx(c, f)];
          var x = this.ox + c * this.t, y = this.oy + f * this.t;
          if (cel.n) añadir(x, y, x + this.t, y);
          if (cel.o) añadir(x, y, x, y + this.t);
          if (c === this.cols - 1 && cel.e) añadir(x + this.t, y, x + this.t, y + this.t);
          if (f === this.filas - 1 && cel.s) añadir(x, y + this.t, x + this.t, y + this.t);
        }
      }
    },
    entrada: function () { return { x: this.ox + this.lab.cEntra * this.t + this.t / 2, y: this.oy + this.filas * this.t }; },
    salida: function () { return { x: this.ox + this.lab.cSale * this.t + this.t / 2, y: this.oy }; },
    centro: function (i) { return { x: this.ox + (i % this.cols) * this.t + this.t / 2, y: this.oy + Math.floor(i / this.cols) * this.t + this.t / 2 }; },
    radio: function () { return Math.max(4, this.t * 0.15 - this.holgura); },

    preparar: function () {
      this.cavar(); this.resolver(); this.encajar();
      this.extra = fallos >= 5 ? 8 : 0;
      this.restante = this.segundos + this.extra;
      this.corriendo = false; this.tocando = false;
      this.rastro = [];
      this.dedo = this.entrada();
      this.pistaHasta = fallos >= 3 ? Date.now() + 1600 : 0;
      this.holgura = fallos >= 5 ? this.t * 0.05 : 0;
      elMarca.textContent = Math.ceil(this.restante) + "s";
      nota("lleva el brote hasta la rosa sin rozar las paredes", 3400);
    },
    latir: function (dt) {
      if (!this.corriendo) return;
      this.restante -= dt;
      elMarca.textContent = Math.max(0, Math.ceil(this.restante)) + "s";
      if (this.restante <= 0) perder("se acabó el tiempo");
    },
    pintar: function () {
      var i;
      if (Date.now() < this.pistaHasta) {
        ctx.save();
        ctx.strokeStyle = conAlfa(P.calida, .16);
        ctx.lineWidth = Math.max(2, this.t * 0.42);
        ctx.lineCap = "round"; ctx.lineJoin = "round";
        ctx.beginPath();
        var e = this.entrada(); ctx.moveTo(e.x, e.y);
        for (i = 0; i < this.camino.length; i++) { var pc = this.centro(this.camino[i]); ctx.lineTo(pc.x, pc.y); }
        var s = this.salida(); ctx.lineTo(s.x, s.y);
        ctx.stroke(); ctx.restore();
      }

      ctx.save();
      ctx.strokeStyle = conAlfa(P.oro, .75); ctx.lineWidth = 1.6; ctx.lineCap = "round";
      conBrillo(8, P.oro, .5);
      ctx.beginPath();
      for (i = 0; i < this.paredes.length; i++) {
        ctx.moveTo(this.paredes[i].x1, this.paredes[i].y1);
        ctx.lineTo(this.paredes[i].x2, this.paredes[i].y2);
      }
      ctx.stroke(); ctx.restore();

      var sal = this.salida();
      rosa(sal.x, sal.y - 16, Math.min(13, this.t * 0.3));

      if (this.rastro.length > 1) {
        ctx.save();
        ctx.strokeStyle = conAlfa(P.calida, .3); ctx.lineWidth = 2;
        ctx.lineCap = "round"; ctx.lineJoin = "round";
        ctx.beginPath(); ctx.moveTo(this.rastro[0].x, this.rastro[0].y);
        for (i = 1; i < this.rastro.length; i++) ctx.lineTo(this.rastro[i].x, this.rastro[i].y);
        ctx.stroke(); ctx.restore();
      }

      ctx.save();
      conBrillo(14, P.calida, .9);
      ctx.fillStyle = P.calida;
      ctx.beginPath(); ctx.arc(this.dedo.x, this.dedo.y, this.radio(), 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      if (!this.corriendo) {
        var b = this.entrada();
        ctx.save();
        ctx.strokeStyle = conAlfa(P.calida, .5); ctx.lineWidth = 1.4;
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        ctx.arc(b.x, b.y, this.radio() + 9 + (suave ? 0 : Math.sin(Date.now() / 400) * 2), 0, Math.PI * 2);
        ctx.stroke(); ctx.restore();
      }
    },
    distancia: function (px, py, s) {
      var dx = s.x2 - s.x1, dy = s.y2 - s.y1, largo = dx * dx + dy * dy;
      var u = largo ? ((px - s.x1) * dx + (py - s.y1) * dy) / largo : 0;
      u = Math.max(0, Math.min(1, u));
      return Math.hypot(px - (s.x1 + u * dx), py - (s.y1 + u * dy));
    },
    tocar: function (x, y) {
      var b = this.entrada();
      if (Math.hypot(x - b.x, y - b.y) > this.t * 0.6) { nota("empieza desde el brote, abajo", 1800); return false; }
      this.corriendo = true; this.tocando = true;
      this.rastro = [{ x: b.x, y: b.y }];
      this.dedo = { x: x, y: y };
      nota("");
      return true;
    },
    mover: function (x, y) {
      this.dedo.x = x; this.dedo.y = y;
      if (!this.corriendo) return;
      var r = this.radio();
      for (var i = 0; i < this.paredes.length; i++) {
        if (this.distancia(x, y, this.paredes[i]) < r) { perder("rozaste la pared"); return; }
      }
      if (x < this.ox - this.t || x > this.ox + this.cols * this.t + this.t ||
          y < this.oy - this.t * 1.2 || y > this.oy + this.filas * this.t + this.t) {
        perder("te saliste"); return;
      }
      var ult = this.rastro[this.rastro.length - 1];
      if (!ult || Math.hypot(x - ult.x, y - ult.y) > 3) this.rastro.push({ x: x, y: y });
      var sal = this.salida();
      if (y <= sal.y + 2 && Math.abs(x - sal.x) < this.t / 2) ganarEtapa();
    },
    soltar: function () { if (this.corriendo) perder("soltaste el brote"); }
  };

  /* ════════════════════════════════════════════════════════════════
     ETAPA V — EL CIELO CAMBIADO (ojo)
     El mismo cielo dos veces, con un parpadeo en medio, y una sola
     estrella que se corre de sitio. El parpadeo es lo cruel: sin él,
     el ojo caza el movimiento solo; con él, hay que MIRAR.
     Cinco rondas, cada una con más estrellas. Tres dedos en la estrella
     equivocada y se repite la etapa.
     ════════════════════════════════════════════════════════════════ */
  var cinco = {
    num: "V", nombre: "el cielo cambiado",
    cuantas: [10, 14, 18, 22, 26],
    estrellas: [], cual: -1, salto: { x: 0, y: 0 },
    ronda: 0, fase: 0, hasta: 0, limite: 0, errores: 0,

    preparar: function () {
      this.ronda = 0; this.errores = 0;
      this.armar();
    },
    // Con fallos, el cielo se queda quieto más rato y el parpadeo se acorta:
    // la misma prueba, con más luz para mirarla.
    verCuanto: function () { return fallos >= 3 ? 1050 : 800; },
    veloCuanto: function () { return fallos >= 3 ? 150 : 200; },
    plazo: function () { return fallos >= 5 ? 32000 : 24000; },

    armar: function () {
      var azar = azarSemilla(505 + this.ronda * 17);
      var n = this.cuantas[this.ronda];
      var margen = Math.min(W, H) * 0.11;
      var x = 0, y = 0, i, k, t, libre;
      this.estrellas = [];
      for (i = 0; i < n; i++) {
        // Repartidas sin amontonarse: si cae pegada a otra, se reintenta.
        // Dos estrellas juntas harían imposible saber cuál de las dos saltó.
        for (t = 0; t < 60; t++) {
          x = margen + azar() * (W - margen * 2);
          y = H * 0.15 + azar() * (H * 0.68);
          libre = true;
          for (k = 0; k < this.estrellas.length; k++) {
            if (Math.hypot(x - this.estrellas[k].x, y - this.estrellas[k].y) < 52) { libre = false; break; }
          }
          if (libre) break;
        }
        this.estrellas.push({ x: x, y: y, r: 5 + azar() * 4 });
      }
      // La que salta: una que tenga sitio para saltar sin salirse del cielo.
      var d = Math.max(17, Math.min(W, H) * 0.045);
      for (t = 0; t < 80; t++) {
        i = Math.floor(azar() * this.estrellas.length);
        var a = azar() * Math.PI * 2;
        var sx = this.estrellas[i].x + Math.cos(a) * d;
        var sy = this.estrellas[i].y + Math.sin(a) * d;
        if (sx > margen && sx < W - margen && sy > H * 0.14 && sy < H * 0.85) {
          this.cual = i; this.salto = { x: Math.cos(a) * d, y: Math.sin(a) * d };
          break;
        }
      }
      this.fase = 0;
      this.hasta = Date.now() + this.verCuanto();
      this.limite = Date.now() + this.plazo();
      elMarca.textContent = "ronda " + (this.ronda + 1) + " de 5";
      nota(this.ronda === 0 ? "una estrella se cambia de sitio: tócala" : "", 3400);
    },

    latir: function () {
      var ahora = Date.now();
      if (ahora > this.limite) { perder("el cielo se cansó de esperar"); return; }
      if (ahora < this.hasta) return;
      // 0 y 2 son cielo (el de antes y el de después); 1 y 3, el parpadeo.
      this.fase = (this.fase + 1) % 4;
      this.hasta = ahora + (this.fase % 2 ? this.veloCuanto() : this.verCuanto());
    },

    pintar: function () {
      if (this.fase % 2) return;                    // el parpadeo: cielo en blanco
      var corrido = this.fase === 2;
      // Migaja silenciosa: si lleva mucho rato mirando, la que salta respira.
      var soplo = fallos >= 5 && Date.now() > this.limite - this.plazo() + 13000;
      for (var i = 0; i < this.estrellas.length; i++) {
        var e = this.estrellas[i];
        var x = e.x + (corrido && i === this.cual ? this.salto.x : 0);
        var y = e.y + (corrido && i === this.cual ? this.salto.y : 0);
        ctx.save();
        if (soplo && i === this.cual) conBrillo(16, P.calida, .45);
        ctx.fillStyle = conAlfa(P.oro, .62);
        estrella(x, y, e.r + 6, 0);
        ctx.restore();
      }
    },

    tocar: function (px, py) {
      for (var i = 0; i < this.estrellas.length; i++) {
        var e = this.estrellas[i];
        var cerca = Math.hypot(px - e.x, py - e.y) < 32 ||
          (i === this.cual && Math.hypot(px - e.x - this.salto.x, py - e.y - this.salto.y) < 32);
        if (!cerca) continue;
        if (i !== this.cual) {
          // Solo cuenta como error tocar una estrella: el cielo vacío es libre.
          this.errores++;
          if (this.errores >= 3) { perder("tres veces la estrella quieta"); return; }
          nota("esa no se movió", 1500);
          return;
        }
        if (this.ronda >= this.cuantas.length - 1) { ganarEtapa(); return; }
        this.ronda++;
        nota("esa era", 1200);
        var self = this;
        this.fase = 1; this.hasta = Date.now() + 900;   // un respiro a oscuras
        this.limite = Infinity;      // el reloj de la ronda no corre en el respiro
        setTimeout(function () { if (viva && ETAPAS[etapa] === self) self.armar(); }, 900);
        return;
      }
    }
  };

  /* ════════════════════════════════════════════════════════════════
     ETAPA VI — LAS SIETE LÁMPARAS (cabeza fría)
     Siete lámparas en rueda. Tocar una la cambia a ella Y a sus dos
     vecinas, y hay que dejarlas las siete encendidas. Siendo siete
     (y no seis, ni nueve) cada tablero tiene UNA sola salida: aquí no
     se llega probando, se llega pensando.
     Tres tableros, y un tope de jugadas que casi no perdona.
     ════════════════════════════════════════════════════════════════ */
  var seis = {
    num: "VI", nombre: "las siete lámparas",
    hondura: [3, 4, 5],                 // cuántos toques esconde cada tablero
    luz: [], ronda: 0, jugadas: 0, tope: 0, sol: [], desde: 0,

    preparar: function () { this.ronda = 0; this.armar(); },

    vecinas: function (i) { return [(i + 6) % 7, i, (i + 1) % 7]; },
    dar: function (luz, i) {
      var v = this.vecinas(i);
      for (var k = 0; k < 3; k++) luz[v[k]] = !luz[v[k]];
    },
    // Las 128 combinaciones posibles, probadas todas: la más corta que deja
    // el candelabro entero encendido. Con siete lámparas hay una y solo una.
    resolver: function () {
      var mejor = null;
      for (var m = 0; m < 128; m++) {
        var luz = this.luz.slice(), toques = [], i, todas = true;
        for (i = 0; i < 7; i++) if (m & (1 << i)) { this.dar(luz, i); toques.push(i); }
        for (i = 0; i < 7; i++) if (!luz[i]) { todas = false; break; }
        if (todas && (!mejor || toques.length < mejor.length)) mejor = toques;
      }
      return mejor || [];
    },
    armar: function () {
      var azar = azarSemilla(1717 + this.ronda * 23), i;
      // Se parte del candelabro entero encendido y se apaga «al revés»:
      // así el tablero SIEMPRE tiene salida, y la salida es de la hondura
      // que se le pidió.
      var libres = [0, 1, 2, 3, 4, 5, 6];
      this.luz = [true, true, true, true, true, true, true];
      for (i = 0; i < this.hondura[this.ronda]; i++) {
        this.dar(this.luz, libres.splice(Math.floor(azar() * libres.length), 1)[0]);
      }
      this.sol = this.resolver();
      this.jugadas = 0;
      this.tope = this.sol.length + (fallos >= 3 ? 3 : 2);
      this.desde = Date.now();
      this.marcar();
      nota(this.ronda === 0
        ? "enciéndelas todas; cada toque cambia la que tocas y sus dos vecinas"
        : "", 4200);
    },
    marcar: function () {
      elMarca.textContent = "candelabro " + (this.ronda + 1) + " de 3 · " +
        this.jugadas + "/" + this.tope;
    },
    donde: function (i) {
      var r = Math.min(W, H) * 0.29, a = -Math.PI / 2 + (i / 7) * Math.PI * 2;
      return { x: W / 2 + Math.cos(a) * r, y: H * 0.47 + Math.sin(a) * r };
    },

    pintar: function () {
      var i, p, q;
      // La rueda: se dibuja para que se vea QUIÉN es vecina de quién.
      ctx.save();
      ctx.strokeStyle = conAlfa(P.oro, .16); ctx.lineWidth = 1;
      ctx.beginPath();
      for (i = 0; i < 7; i++) {
        p = this.donde(i); q = this.donde((i + 1) % 7);
        ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
      }
      ctx.stroke(); ctx.restore();

      // Migaja silenciosa: tras un rato largo, la lámpara que toca respira.
      var soplo = fallos >= 5 && Date.now() - this.desde > 15000 ? this.sol[0] : -1;
      for (i = 0; i < 7; i++) {
        p = this.donde(i);
        ctx.save();
        if (this.luz[i]) { conBrillo(22, P.calida, .85); ctx.fillStyle = P.calida; }
        else if (i === soplo) { conBrillo(12, P.oro, .5); ctx.fillStyle = conAlfa(P.oro, .55); }
        else ctx.fillStyle = conAlfa(P.oro, .28);
        estrella(p.x, p.y, this.luz[i] ? 19 : 13, 0);
        ctx.restore();
      }
    },

    tocar: function (x, y) {
      for (var i = 0; i < 7; i++) {
        var p = this.donde(i);
        if (Math.hypot(x - p.x, y - p.y) > 38) continue;
        this.dar(this.luz, i);
        this.jugadas++;
        this.sol = this.resolver();
        this.marcar();
        if (!this.sol.length) {                       // ya no falta ninguna
          if (this.ronda >= this.hondura.length - 1) { ganarEtapa(); return; }
          this.ronda++;
          nota("ese candelabro ya está", 1400);
          var self = this;
          setTimeout(function () { if (viva && ETAPAS[etapa] === self) self.armar(); }, 1100);
          return;
        }
        if (this.jugadas >= this.tope) perder("te quedaste sin jugadas");
        return;
      }
    }
  };

  /* ════════════════════════════════════════════════════════════════
     ETAPA VII — EL PULSO DE LA ROSA (nervio)
     La última puerta. La rosa echa a andar y hay que seguirla con el
     dedo sin que el hilo se estire de más, mientras el hilo se acorta
     y ella corre cada vez más. No hay nada que aprenderse: hay que
     aguantar. Soltar el dedo es perder.
     ════════════════════════════════════════════════════════════════ */
  var siete = {
    num: "VII", nombre: "el pulso de la rosa",
    pulgar: true,                       // el dedo tapa la rosa: se toca más arriba
    segundos: 26,
    u: 0, total: 26, restante: 0, fuera: 0,
    brote: { x: 0, y: 0 }, dedo: { x: 0, y: 0 },
    corriendo: false, tocando: false,

    preparar: function () {
      this.total = this.segundos - (fallos >= 5 ? 10 : fallos >= 3 ? 6 : 0);
      this.restante = this.total;
      this.u = 0; this.fuera = 0;
      this.corriendo = false; this.tocando = false;
      this.brote = this.donde(0);
      this.dedo = { x: this.brote.x, y: this.brote.y };
      elMarca.textContent = Math.ceil(this.restante) + "s";
      nota("pon el dedo en la rosa y no la sueltes: va a huir", 3800);
    },
    // Un vaivén que no se repite pronto: dos ondas que no encajan entre sí.
    donde: function (u) {
      return {
        x: W / 2 + W * 0.31 * Math.sin(u + 0.6) + W * 0.07 * Math.sin(u * 2.7),
        y: H * 0.48 + H * 0.27 * Math.sin(u * 1.43) + H * 0.05 * Math.sin(u * 3.1)
      };
    },
    andado: function () { return 1 - this.restante / this.total; },
    // Corre más según avanza, y da dos tirones en sitios fijos: los mismos
    // en cada intento, para que se puedan ver venir.
    paso: function () {
      var p = this.andado();
      var tiron = (p > 0.34 && p < 0.42) || (p > 0.68 && p < 0.76) ? 2.1 : 1;
      return (0.85 + p * 1.45) * tiron;
    },
    // Lo que aguanta el hilo antes de romperse: al principio holgado, al
    // final del largo del dedo.
    hilo: function () {
      return (56 - 27 * this.andado()) * (Math.min(W, H) < 420 ? 0.9 : 1) +
        (fallos >= 3 ? 11 : 0);
    },

    latir: function (dt) {
      if (this.corriendo) { this.u += dt * this.paso(); this.restante -= dt; }
      this.brote = this.donde(this.u);
      if (!this.corriendo) return;
      elMarca.textContent = Math.max(0, Math.ceil(this.restante)) + "s";
      var d = Math.hypot(this.dedo.x - this.brote.x, this.dedo.y - this.brote.y);
      if (d > this.hilo()) {
        // Un respiro cortísimo antes de romper: un tirón se perdona, dos no.
        this.fuera += dt;
        if (this.fuera > 0.3) { perder("se te soltó el hilo"); return; }
      } else this.fuera = Math.max(0, this.fuera - dt * 2);
      if (this.restante <= 0) ganarEtapa();
    },

    pintar: function () {
      var d = Math.hypot(this.dedo.x - this.brote.x, this.dedo.y - this.brote.y);
      var largo = this.hilo();
      var tirante = Math.min(1, d / largo);

      // El cerco: hasta dónde se puede estirar. Se aprieta a la vista.
      ctx.save();
      ctx.strokeStyle = conAlfa(tirante > .75 ? P.rosa : P.oro, .35 + tirante * .4);
      ctx.lineWidth = 1.3; ctx.setLineDash([4, 5]);
      ctx.beginPath(); ctx.arc(this.brote.x, this.brote.y, largo, 0, Math.PI * 2);
      ctx.stroke(); ctx.restore();

      if (this.corriendo) {                       // el hilo, que se pone rojo
        ctx.save();
        ctx.strokeStyle = conAlfa(tirante > .75 ? P.rosa : P.calida, .25 + tirante * .55);
        ctx.lineWidth = 1 + (1 - tirante) * 1.6;
        ctx.beginPath();
        ctx.moveTo(this.dedo.x, this.dedo.y); ctx.lineTo(this.brote.x, this.brote.y);
        ctx.stroke(); ctx.restore();
      }

      rosa(this.brote.x, this.brote.y, 13);

      ctx.save();
      conBrillo(12, P.calida, .8);
      ctx.fillStyle = conAlfa(P.calida, this.corriendo ? .9 : .4);
      ctx.beginPath(); ctx.arc(this.dedo.x, this.dedo.y, 5, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      // Lo andado, en una línea abajo: se ve el final acercarse.
      ctx.save();
      ctx.strokeStyle = conAlfa(P.oro, .2); ctx.lineWidth = 2.5; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(W * 0.18, H * 0.93); ctx.lineTo(W * 0.82, H * 0.93); ctx.stroke();
      ctx.strokeStyle = P.oro;
      conBrillo(8, P.oro, .5);
      ctx.beginPath(); ctx.moveTo(W * 0.18, H * 0.93);
      ctx.lineTo(W * 0.18 + W * 0.64 * this.andado(), H * 0.93); ctx.stroke();
      ctx.restore();

      if (!this.corriendo) {
        ctx.save();
        ctx.strokeStyle = conAlfa(P.calida, .5); ctx.lineWidth = 1.4;
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        ctx.arc(this.brote.x, this.brote.y, 26 + (suave ? 0 : Math.sin(Date.now() / 400) * 3), 0, Math.PI * 2);
        ctx.stroke(); ctx.restore();
      }
    },

    tocar: function (x, y) {
      if (Math.hypot(x - this.brote.x, y - this.brote.y) > this.hilo()) {
        nota("empieza con el dedo en la rosa", 1800); return false;
      }
      this.corriendo = true; this.tocando = true;
      this.dedo = { x: x, y: y };
      this.fuera = 0;
      nota("");
      return true;
    },
    mover: function (x, y) { this.dedo.x = x; this.dedo.y = y; },
    soltar: function () { if (this.corriendo) perder("soltaste la rosa"); }
  };

  var ETAPAS = [uno, dos, tres, cuatro, cinco, seis, siete];

  /* ── Motor común ─────────────────────────────────────────────────── */
  function medir() {
    leerPaleta();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = caja.clientWidth; H = caja.clientHeight;
    lienzo.width = Math.round(W * dpr);
    lienzo.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function prepararEtapa() {
    var e = ETAPAS[etapa];
    for (var i = 0; i < ETAPAS.length; i++) if (ETAPAS[i].salir && i !== etapa) ETAPAS[i].salir();
    elEtapa.textContent = e.num + " · " + e.nombre;
    elCifras.hidden = e !== dos;
    reloj = 0;
    medir();
    e.preparar();
  }

  function perder(motivo) {
    if (!viva || transicion) return;
    transicion = true;
    fallos++;
    nota(motivo + " — otra vez", 2200);
    setTimeout(function () { if (viva) { transicion = false; prepararEtapa(); } }, 1000);
  }

  function ganarEtapa() {
    if (transicion) return;
    var e = ETAPAS[etapa];
    fallos = 0;
    if (etapa < ETAPAS.length - 1) {
      transicion = true;
      memoria.etapa = Math.max(memoria.etapa, etapa + 1);
      guardar();
      nota("etapa " + e.num + " superada", 2400);
      setTimeout(function () {
        if (!viva) return;
        etapa++; transicion = false; prepararEtapa();
      }, 1800);
      return;
    }
    // Que ningún reloj siga corriendo por detrás del regalo.
    for (var k = 0; k < ETAPAS.length; k++) {
      if ("corriendo" in ETAPAS[k]) { ETAPAS[k].corriendo = false; ETAPAS[k].tocando = false; }
    }
    memoria.etapa = ETAPAS.length - 1;
    memoria.ganado = true;
    guardar();
    nota("");
    abrirPremio();
  }

  // La foto no se pide hasta que hace falta: así no viaja por la red antes
  // de tiempo y el regalo no se destripa mirando lo que descarga la página.
  function abrirPremio() {
    elFoto.src = "premio.jpg";
    elFrase.textContent = "Siete puertas para esto: el 30 de octubre te llevo a escuchar a Morfina en vivo.";
    elPremio.classList.add("viva");
    elVerRegalo.hidden = false;
    // Aviso para el tercer juego, que hasta aquí estaba con candado. Va por
    // evento y no por llamada directa: si reto3.js no estuviera cargado, esto
    // no se entera y no rompe nada.
    try { window.dispatchEvent(new CustomEvent("reto:ganado")); } catch (e) {}
  }

  function paso(ahora) {
    if (!viva) return;
    rafId = requestAnimationFrame(paso);
    var dt = Math.min((ahora - ultimo) / 1000, 0.05);
    ultimo = ahora; reloj += dt;
    ctx.clearRect(0, 0, W, H);
    if (transicion || elPremio.classList.contains("viva")) return;
    var e = ETAPAS[etapa];
    if (e.latir) e.latir(dt);
    e.pintar(dt);
  }

  /* ── Entradas ────────────────────────────────────────────────────── */
  function puntoDe(ev) {
    var r = lienzo.getBoundingClientRect();
    var x = ev.clientX - r.left, y = ev.clientY - r.top;
    // En las etapas que se juegan arrastrando, lo que hay que mirar va por
    // encima del dedo, o la mano tapa justo eso. En las de tocar, se toca
    // donde se ve.
    if (ev.pointerType === "touch" && ETAPAS[etapa].pulgar) y -= TOQUE_ARRIBA;
    return { x: x, y: y };
  }
  lienzo.addEventListener("pointerdown", function (ev) {
    if (!viva || elPremio.classList.contains("viva")) return;
    ev.preventDefault();
    var p = puntoDe(ev), e = ETAPAS[etapa];
    // Las de arrastre agarran el puntero: si el dedo se sale del lienzo, los
    // eventos siguen llegando y la etapa se entera de que lo soltó.
    if (e.mover) { if (e.tocar(p.x, p.y)) lienzo.setPointerCapture(ev.pointerId); }
    else if (e.tocar) e.tocar(p.x, p.y);
  });
  lienzo.addEventListener("pointermove", function (ev) {
    var e = viva ? ETAPAS[etapa] : null;
    if (!e || !e.mover || !e.tocando) return;
    ev.preventDefault();
    var p = puntoDe(ev);
    e.mover(p.x, p.y);
  });
  function soltar() {
    var e = viva ? ETAPAS[etapa] : null;
    if (e && e.mover && e.tocando) { e.tocando = false; e.soltar(); }
  }
  lienzo.addEventListener("pointerup", soltar);
  lienzo.addEventListener("pointercancel", soltar);

  // El teclado de la etapa de las cifras.
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "borrar", "0", "va"].forEach(function (t) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "reto-tecla" + (t === "va" ? " es-va" : "") + (t === "borrar" ? " es-borrar" : "");
    b.textContent = t === "borrar" ? "←" : (t === "va" ? "✓" : t);
    b.addEventListener("click", function () { if (viva) dos.teclear(t); });
    elTeclas.appendChild(b);
  });

  /* ── Abrir y cerrar ──────────────────────────────────────────────── */
  function abrir() {
    memoria = leer();
    etapa = memoria.etapa || 0;
    fallos = 0; viva = true;
    caja.classList.add("viva");
    caja.setAttribute("aria-hidden", "false");
    elPremio.classList.remove("viva");
    elVerRegalo.hidden = !memoria.ganado;
    prepararEtapa();
    ultimo = performance.now();
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(paso);
  }
  function cerrar() {
    viva = false;
    cancelAnimationFrame(rafId);
    caja.classList.remove("viva");
    caja.setAttribute("aria-hidden", "true");
    elPremio.classList.remove("viva");
    elCifras.hidden = true;
  }
  caja.querySelector("#retoSalir").addEventListener("click", cerrar);
  caja.querySelector("#retoCerrar").addEventListener("click", cerrar);
  elVerRegalo.addEventListener("click", abrirPremio);

  window.addEventListener("resize", function () {
    if (!viva) return;
    medir();
    if (ETAPAS[etapa] === cuatro) { cuatro.encajar(); if (cuatro.corriendo) perder("cambió la pantalla"); }
    else if (ETAPAS[etapa] === siete) { if (siete.corriendo) perder("cambió la pantalla"); }
    else if (!ETAPAS[etapa].quieta) prepararEtapa();
  });

  var boton = document.getElementById("retoAbrir");
  if (boton) boton.addEventListener("click", abrir);

  // Solo con ?pruebas: para poder recorrerlo entero desde un guion.
  if (/[?&]pruebas/.test(location.search)) {
    window.__reto = {
      abrir: abrir, cerrar: cerrar,
      irEtapa: function (n) { etapa = n; fallos = 0; prepararEtapa(); },
      total: ETAPAS.length,
      estado: function () {
        return { etapa: etapa, fallos: fallos, premio: elPremio.classList.contains("viva"),
                 ronda: uno.ronda, mostrando: uno.mostrando, pregunta: dos.i,
                 notas: tres.contadas(), perdidas: tres.perdidas,
                 ojoRonda: cinco.ronda, ojoFase: cinco.fase, ojoErrores: cinco.errores,
                 lamparas: seis.ronda, jugadas: seis.jugadas, tope: seis.tope,
                 pulsoResta: siete.restante, pulsoAnda: siete.corriendo };
      },
      solucion: {
        constelacion: function () {
          return uno.orden.slice(0, 3 + uno.ronda).map(function (i) { return uno.estrellas[i]; });
        },
        cifras: function () { return dos.preguntas.map(function (p) { return p.clave; }); },
        ritmo: function () {
          return { notas: tres.notas, empezado: tres.empezado, linea: tres.linea(),
                   ancho: W / 3, velocidad: tres.velocidad(), caida: tres.caida() };
        },
        laberinto: function () {
          var s = [cuatro.entrada()];
          for (var i = 0; i < cuatro.camino.length; i++) s.push(cuatro.centro(cuatro.camino[i]));
          s.push(cuatro.salida());
          return s;
        },
        cielo: function () {
          var e = cinco.estrellas[cinco.cual];
          return e ? { x: e.x, y: e.y, fase: cinco.fase } : null;
        },
        lamparas: function () {
          return { toques: seis.sol.slice(), donde: seis.sol.map(function (i) { return seis.donde(i); }) };
        },
        pulso: function () { return { brote: siete.brote, hilo: siete.hilo(), resta: siete.restante }; }
      },
      teclear: function (t) { dos.teclear(t); }
    };
  }
})();
