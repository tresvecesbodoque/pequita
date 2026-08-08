/* ══════════════════════════════════════════════════════════════════
   LAS TRES LLAVES
   ══════════════════════════════════════════════════════════════════

   El tercer minijuego del contador, y el más duro. Se abre solo cuando
   las siete puertas (reto.js) están cruzadas, y al final está el tercer
   regalo.

       I  · el nudo       mano fría   deshacer la maraña sin un solo cruce
       II · la cerradura  deducción   cuatro figuras en orden, ocho intentos
       III· el vuelo      nervio      cuarenta segundos entre espinas

   Va aparte de reto.js a propósito: son dos juegos distintos, con dos
   memorias distintas, y el segundo ya está en manos de ella. Comparten
   el marco (reto.css) para que se vean hermanos, pero no se tocan: si
   uno se rompe, el otro sigue en pie.

   Mismas reglas de la casa que el segundo:
   - La etapa superada queda superada; al fallar se repite ESA etapa.
   - Semilla FIJA: el mismo nudo, la misma cerradura, las mismas espinas
     en cada intento. Se puede aprender.
   - Tras varios fallos, la etapa ayuda SIN DECIRLO.
   - El regalo se abre al terminar las tres, y queda abierto.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var MEM = "pequita.reto3";
  var MEM_PUERTAS = "pequita.reto";      // la llave de la puerta de entrada
  var suave = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function leer() {
    try {
      var m = JSON.parse(localStorage.getItem(MEM) || "{}") || {};
      return { etapa: Math.min(Math.max(+m.etapa || 0, 0), ETAPAS.length - 1), ganado: !!m.ganado };
    } catch (e) { return { etapa: 0, ganado: false }; }
  }
  function guardar() { try { localStorage.setItem(MEM, JSON.stringify(memoria)); } catch (e) {} }
  var memoria = { etapa: 0, ganado: false };

  // ¿Cruzó ya las siete puertas? Mientras no, este juego ni se abre.
  var abierto = false;
  function puertasCruzadas() {
    if (abierto) return true;
    try { abierto = !!(JSON.parse(localStorage.getItem(MEM_PUERTAS) || "{}") || {}).ganado; }
    catch (e) { abierto = false; }
    return abierto;
  }

  function azarSemilla(s) {
    return function () {
      s |= 0; s = (s + 0x6D2B79F5) | 0;
      var t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  var FLORES = ["🦊", "🌹", "🐰", "🤴", "🪐", "⭐"];

  // ── La pantalla ───────────────────────────────────────────────────
  var caja = document.createElement("div");
  caja.className = "reto";
  caja.id = "reto3";
  caja.setAttribute("aria-hidden", "true");
  caja.innerHTML =
    '<canvas id="r3Lienzo"></canvas>' +
    '<div class="reto-hud">' +
      '<span class="reto-etapa" id="r3Etapa"></span>' +
      '<span class="reto-marca" id="r3Marca"></span>' +
    '</div>' +
    '<button class="reto-salir" id="r3Salir" type="button">volver</button>' +
    '<div class="llave-cerradura" id="r3Cerradura" hidden>' +
      '<p class="cerradura-leyenda">● en su sitio · ○ en el grupo, mal puesta</p>' +
      '<div class="cerradura-intentos" id="r3Intentos"></div>' +
      '<div class="cerradura-fila" id="r3Fila"></div>' +
      '<div class="cerradura-flores" id="r3Flores"></div>' +
    '</div>' +
    '<button class="reto-regalo" id="r3VerRegalo" type="button" hidden>ver el regalo ✿</button>' +
    '<p class="reto-nota" id="r3Nota"></p>' +
    '<div class="reto-premio" id="r3Premio">' +
      '<p class="reto-titulo">las tres llaves</p>' +
      '<img alt="Tu tercer regalo" id="r3Foto" hidden />' +
      '<p class="reto-frase" id="r3Frase"></p>' +
      '<a class="reto-cerrar es-viaje" id="r3Viaje" href="/odisea.html">seguir el viaje ✦</a>' +
      '<button class="reto-cerrar" id="r3Cerrar" type="button">volver al conteo</button>' +
    '</div>';
  document.body.appendChild(caja);

  var lienzo = caja.querySelector("#r3Lienzo");
  var ctx = lienzo.getContext("2d");
  var elEtapa = caja.querySelector("#r3Etapa");
  var elMarca = caja.querySelector("#r3Marca");
  var elNota = caja.querySelector("#r3Nota");
  var elCerradura = caja.querySelector("#r3Cerradura");
  var elIntentos = caja.querySelector("#r3Intentos");
  var elFila = caja.querySelector("#r3Fila");
  var elFlores = caja.querySelector("#r3Flores");
  var elPremio = caja.querySelector("#r3Premio");
  var elFoto = caja.querySelector("#r3Foto");
  var elFrase = caja.querySelector("#r3Frase");
  var elVerRegalo = caja.querySelector("#r3VerRegalo");

  // ── Paleta por tokens: el juego amanece con el sitio ──────────────
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
  var transicion = false, reloj = 0;
  var TOQUE_ARRIBA = 38;

  var notaId = 0;
  function nota(texto, ms) {
    clearTimeout(notaId);
    elNota.textContent = texto || "";
    elNota.classList.toggle("viva", !!texto);
    if (texto && ms) notaId = setTimeout(function () { elNota.classList.remove("viva"); }, ms);
  }
  function reloj2(seg) {
    var s = Math.max(0, Math.ceil(seg));
    return Math.floor(s / 60) + ":" + ("0" + (s % 60)).slice(-2);
  }

  /* ════════════════════════════════════════════════════════════════
     LLAVE I — EL NUDO (mano fría)
     Ocho luces atadas por trece hilos. Los hilos están enredados y hay
     que arrastrar las luces hasta que no quede un solo cruce. Se puede:
     la maraña es un dibujo plano al que solo se le movieron los puntos.
     Los hilos que se cruzan se pintan en rojo, así que no hace falta
     adivinar QUÉ está mal — hace falta saber adónde mover.
     ════════════════════════════════════════════════════════════════ */
  var nudo = {
    num: "I", nombre: "el nudo",
    pulgar: true,
    n: 8, puntos: [], hilos: [], agarrado: -1, restante: 0, corriendo: false, tocando: false,
    cruces: 0, guia: 0,

    // El dibujo limpio: un polígono con sus diagonales, que por construcción
    // no se cruza nunca si los puntos están en rueda. Enredarlo es solo
    // repartir esos mismos puntos por la pantalla.
    tejer: function () {
      var azar = azarSemilla(313), n = this.n, hay = {}, self = this;
      this.hilos = [];
      function atar(a, b) {
        var k = Math.min(a, b) + "-" + Math.max(a, b);
        if (a === b || hay[k]) return;
        hay[k] = true; self.hilos.push([a, b]);
      }
      for (var i = 0; i < n; i++) atar(i, (i + 1) % n);       // la rueda
      (function triangular(a, b) {                             // y sus diagonales
        if (b - a < 2) return;
        var k = a + 1 + Math.floor(azar() * (b - a - 1));
        atar(a, k); atar(k, b);
        triangular(a, k); triangular(k, b);
      })(0, n - 1);
    },
    enredar: function () {
      var margen = Math.max(34, Math.min(W, H) * 0.1);
      var x0 = margen, x1 = W - margen, y0 = H * 0.16, y1 = H * 0.87;
      var mejor = null, mejorCruces = -1;
      // Varios repartos y se queda el más enredado: un nudo que casi está
      // deshecho al empezar no es un nudo.
      for (var intento = 0; intento < 24; intento++) {
        var azar = azarSemilla(9000 + intento * 31), sitios = [], i, t, x, y, libre, k;
        for (i = 0; i < this.n; i++) {
          for (t = 0; t < 60; t++) {
            x = x0 + azar() * (x1 - x0);
            y = y0 + azar() * (y1 - y0);
            libre = true;
            for (k = 0; k < sitios.length; k++) {
              if (Math.hypot(x - sitios[k].x, y - sitios[k].y) < Math.min(78, (x1 - x0) / 3)) { libre = false; break; }
            }
            if (libre) break;
          }
          sitios.push({ x: x, y: y });
        }
        this.puntos = sitios;
        var c = this.contar();
        if (c > mejorCruces) { mejorCruces = c; mejor = sitios; }
        if (c >= 9) break;
      }
      this.puntos = mejor.map(function (p) { return { x: p.x, y: p.y }; });
      this.cruces = this.contar();
    },
    // Cruce de dos segmentos, sin tocar los casos rozados: los puntos están
    // en posición general y una alineación exacta no se da.
    lado: function (p, q, r) {
      var v = (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
      return v > 0 ? 1 : (v < 0 ? -1 : 0);
    },
    seCruzan: function (a, b, c, d) {
      var d1 = this.lado(c, d, a), d2 = this.lado(c, d, b);
      var d3 = this.lado(a, b, c), d4 = this.lado(a, b, d);
      return d1 !== d2 && d3 !== d4;
    },
    contar: function () {
      var n = 0;
      for (var i = 0; i < this.hilos.length; i++) {
        for (var j = i + 1; j < this.hilos.length; j++) {
          var A = this.hilos[i], B = this.hilos[j];
          if (A[0] === B[0] || A[0] === B[1] || A[1] === B[0] || A[1] === B[1]) continue;
          if (this.seCruzan(this.puntos[A[0]], this.puntos[A[1]], this.puntos[B[0]], this.puntos[B[1]])) n++;
        }
      }
      return n;
    },
    enrojecidos: function () {
      var mal = {};
      for (var i = 0; i < this.hilos.length; i++) {
        for (var j = i + 1; j < this.hilos.length; j++) {
          var A = this.hilos[i], B = this.hilos[j];
          if (A[0] === B[0] || A[0] === B[1] || A[1] === B[0] || A[1] === B[1]) continue;
          if (this.seCruzan(this.puntos[A[0]], this.puntos[A[1]], this.puntos[B[0]], this.puntos[B[1]])) { mal[i] = true; mal[j] = true; }
        }
      }
      return mal;
    },

    preparar: function () {
      this.tejer(); this.enredar();
      this.restante = 150 + (fallos >= 3 ? 60 : 0);
      // Migaja silenciosa: con muchos fallos aparece la rueda de fondo, que
      // es exactamente donde tienen que acabar las ocho luces.
      this.guia = fallos >= 5 ? 1 : 0;
      this.agarrado = -1; this.tocando = false; this.corriendo = true;
      this.marcar();
      nota("arrastra las luces hasta que no quede ningún hilo rojo", 4200);
    },
    marcar: function () { elMarca.textContent = "✕ " + this.cruces + " · " + reloj2(this.restante); },

    latir: function (dt) {
      if (!this.corriendo) return;
      this.restante -= dt;
      this.marcar();
      if (this.restante <= 0) perder("se acabó el tiempo");
    },
    pintar: function () {
      var i, p;
      if (this.guia) {
        ctx.save();
        ctx.strokeStyle = conAlfa(P.calida, .1); ctx.lineWidth = 26;
        ctx.beginPath();
        ctx.arc(W / 2, H * 0.5, Math.min(W, H) * 0.33, 0, Math.PI * 2);
        ctx.stroke(); ctx.restore();
      }

      var mal = this.enrojecidos();
      for (i = 0; i < this.hilos.length; i++) {
        var a = this.puntos[this.hilos[i][0]], b = this.puntos[this.hilos[i][1]];
        ctx.save();
        if (mal[i]) { ctx.strokeStyle = conAlfa(P.rosa, .85); ctx.lineWidth = 1.8; conBrillo(8, P.rosa, .5); }
        else { ctx.strokeStyle = conAlfa(P.oro, .5); ctx.lineWidth = 1.2; }
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        ctx.restore();
      }
      for (i = 0; i < this.puntos.length; i++) {
        p = this.puntos[i];
        ctx.save();
        conBrillo(this.agarrado === i ? 22 : 12, P.calida, .8);
        ctx.fillStyle = this.agarrado === i ? P.calida : conAlfa(P.calida, .8);
        ctx.beginPath(); ctx.arc(p.x, p.y, this.agarrado === i ? 11 : 8, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
    },

    tocar: function (x, y) {
      var mejor = -1, dist = 40;
      for (var i = 0; i < this.puntos.length; i++) {
        var d = Math.hypot(x - this.puntos[i].x, y - this.puntos[i].y);
        if (d < dist) { dist = d; mejor = i; }
      }
      if (mejor < 0) return false;
      this.agarrado = mejor; this.tocando = true;
      return true;
    },
    mover: function (x, y) {
      if (this.agarrado < 0) return;
      var m = 18;
      this.puntos[this.agarrado].x = Math.max(m, Math.min(W - m, x));
      this.puntos[this.agarrado].y = Math.max(H * 0.11, Math.min(H * 0.92, y));
      this.cruces = this.contar();
      this.marcar();
      if (!this.cruces) { this.corriendo = false; this.agarrado = -1; ganarEtapa(); }
    },
    soltar: function () { this.agarrado = -1; }    // soltar aquí no castiga
  };

  /* ════════════════════════════════════════════════════════════════
     LLAVE II — LA CERRADURA (deducción)
     Cuatro figuras en orden, elegidas entre seis, y las figuras pueden
     repetirse. Ocho intentos. De cada intento vuelve solo cuánto hay
     bien puesto y cuánto está en el grupo pero fuera de sitio; nunca
     dónde. Con repetición son 1296 combinaciones: a ciegas no se saca.
     ════════════════════════════════════════════════════════════════ */
  var cerradura = {
    num: "II", nombre: "la cerradura",
    // No se pinta con medidas de pantalla: si la pantalla cambia (girar el
    // teléfono, esconderse la barra), esta etapa NO se reinicia y ella no
    // pierde los intentos que ya gastó.
    quieta: true,
    clave: [], puesto: [], usados: 0, tope: 8,

    preparar: function () {
      var azar = azarSemilla(1296);
      this.clave = [];
      for (var i = 0; i < 4; i++) this.clave.push(Math.floor(azar() * FLORES.length));
      this.puesto = [];
      this.usados = 0;
      this.tope = 8 + (fallos >= 3 ? 1 : 0);
      elCerradura.hidden = false;
      elIntentos.innerHTML = "";
      this.pintarFila();
      this.marcar();
      // Migaja silenciosa: tras muchos fallos, la primera figura viene puesta.
      if (fallos >= 5) { this.puesto = [this.clave[0]]; this.pintarFila(); }
      nota("cuatro figuras en orden", 2600);
    },
    salir: function () { elCerradura.hidden = true; },
    marcar: function () { elMarca.textContent = "intento " + (this.usados + 1) + " de " + this.tope; },

    pintarFila: function () {
      elFila.innerHTML = "";
      for (var i = 0; i < 4; i++) {
        var h = document.createElement("span");
        h.className = "cerradura-hueco" + (this.puesto[i] === undefined ? " vacio" : "");
        h.textContent = this.puesto[i] === undefined ? "·" : FLORES[this.puesto[i]];
        elFila.appendChild(h);
      }
    },
    poner: function (f) {
      if (this.puesto.length >= 4) return;
      this.puesto.push(f); this.pintarFila();
    },
    borrar: function () { this.puesto.pop(); this.pintarFila(); },

    // Las señales de siempre: primero lo que está en su sitio, y del resto
    // lo que existe pero está donde no va.
    señales: function (tiro) {
      var bien = 0, sueltas = 0, i;
      var quedaClave = [], quedaTiro = [];
      for (i = 0; i < 4; i++) {
        if (tiro[i] === this.clave[i]) bien++;
        else { quedaClave.push(this.clave[i]); quedaTiro.push(tiro[i]); }
      }
      for (i = 0; i < quedaTiro.length; i++) {
        var j = quedaClave.indexOf(quedaTiro[i]);
        if (j >= 0) { sueltas++; quedaClave.splice(j, 1); }
      }
      return { bien: bien, sueltas: sueltas };
    },
    probar: function () {
      if (this.puesto.length < 4) { nota("faltan figuras", 1400); return; }
      var tiro = this.puesto.slice(), s = this.señales(tiro);
      this.usados++;

      var fila = document.createElement("div");
      fila.className = "cerradura-intento";
      var flores = document.createElement("span");
      flores.className = "intento-flores";
      flores.textContent = tiro.map(function (f) { return FLORES[f]; }).join(" ");
      var marcas = document.createElement("span");
      marcas.className = "intento-marcas";
      marcas.textContent = new Array(s.bien + 1).join("●") + new Array(s.sueltas + 1).join("○") || "—";
      fila.appendChild(flores); fila.appendChild(marcas);
      elIntentos.appendChild(fila);
      elIntentos.scrollTop = elIntentos.scrollHeight;

      this.puesto = []; this.pintarFila();

      if (s.bien === 4) { ganarEtapa(); return; }
      if (this.usados >= this.tope) { perder("la cerradura no cedió"); return; }
      this.marcar();
    },

    pintar: function () {
      // Fondo quieto: aquí se piensa. Solo un anillo de figuras que gira lento.
      // globalAlpha en vez de fillStyle: las figuras ahora son emoji a color,
      // que ignoran el color de fillStyle pero sí respetan la transparencia.
      ctx.save();
      ctx.globalAlpha = .22;
      ctx.font = "16px serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      for (var i = 0; i < FLORES.length; i++) {
        var a = (i / FLORES.length) * Math.PI * 2 + reloj * 0.08;
        ctx.fillText(FLORES[i], W / 2 + Math.cos(a) * W * 0.38, H * 0.5 + Math.sin(a) * H * 0.36);
      }
      ctx.restore();
    },
    tocar: function () {}
  };

  /* ════════════════════════════════════════════════════════════════
     LLAVE III — EL VUELO (nervio)
     Cuarenta segundos con la luciérnaga en el dedo, esquivando espinas
     que caen cada vez más juntas y más rápido. Soltar el dedo es
     perder. La lluvia es siempre la misma: se puede aprender de memoria
     dónde hay hueco, y a partir de cierta velocidad es lo único que
     queda.
     ════════════════════════════════════════════════════════════════ */
  var vuelo = {
    num: "III", nombre: "el vuelo",
    pulgar: true,
    segundos: 40, espinas: [], t0: 0, restante: 0,
    luz: { x: 0, y: 0 }, corriendo: false, tocando: false,

    radio: function () { return fallos >= 5 ? 4.5 : 6.5; },

    preparar: function () {
      var total = this.segundos - (fallos >= 3 ? 8 : 0);
      var azar = azarSemilla(4040);
      var margen = 26, t = 1200, hueco = 640;
      this.espinas = [];
      while (t < total * 1000) {
        var p = t / (total * 1000);
        this.espinas.push({
          t: t,
          x: margen + azar() * (W - margen * 2),
          vx: azar() < 0.32 ? (azar() - 0.5) * 170 : 0,
          vy: 200 + azar() * 90 + 230 * p,
          r: 6 + azar() * 5,
          giro: azar() * Math.PI
        });
        t += hueco;
        hueco = Math.max(165, hueco - 9);
      }
      this.restante = total;
      this.corriendo = false; this.tocando = false;
      this.luz = { x: W / 2, y: H * 0.82 };
      elMarca.textContent = reloj2(this.restante);
      nota("pon el dedo en la luciérnaga y esquiva; si la sueltas, se apaga", 4200);
    },
    latir: function (dt) {
      if (!this.corriendo) return;
      this.restante -= dt;
      elMarca.textContent = reloj2(this.restante);
      var ahora = (Date.now() - this.t0);
      var r = this.radio();
      for (var i = 0; i < this.espinas.length; i++) {
        var e = this.espinas[i];
        var vida = (ahora - e.t) / 1000;
        if (vida < 0) break;                       // van en orden: las demás tampoco
        var y = -24 + vida * e.vy;
        if (y > H + 40) continue;
        var x = e.x + vida * e.vx;
        if (Math.hypot(x - this.luz.x, y - this.luz.y) < e.r + r) { perder("te pinchó una espina"); return; }
      }
      if (this.restante <= 0) ganarEtapa();
    },
    pintar: function () {
      var ahora = this.corriendo ? (Date.now() - this.t0) : 0;
      var i, e, vida, x, y;
      for (i = 0; i < this.espinas.length; i++) {
        e = this.espinas[i];
        vida = (ahora - e.t) / 1000;
        if (vida < 0) break;
        y = -24 + vida * e.vy;
        if (y > H + 40) continue;
        x = e.x + vida * e.vx;
        ctx.save();
        ctx.translate(x, y); ctx.rotate(e.giro + vida * 1.6);
        ctx.fillStyle = conAlfa(P.rosa, .9);
        conBrillo(8, P.rosa, .5);
        ctx.beginPath();
        ctx.moveTo(0, -e.r * 1.9); ctx.lineTo(e.r * 0.62, 0);
        ctx.lineTo(0, e.r * 1.9); ctx.lineTo(-e.r * 0.62, 0);
        ctx.closePath(); ctx.fill();
        ctx.restore();
      }

      ctx.save();
      conBrillo(20, P.calida, .95);
      ctx.fillStyle = P.calida;
      ctx.beginPath(); ctx.arc(this.luz.x, this.luz.y, this.radio() + 1.5, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      if (!this.corriendo) {
        ctx.save();
        ctx.strokeStyle = conAlfa(P.calida, .5); ctx.lineWidth = 1.4;
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        ctx.arc(this.luz.x, this.luz.y, 24 + (suave ? 0 : Math.sin(Date.now() / 400) * 3), 0, Math.PI * 2);
        ctx.stroke(); ctx.restore();
      }
    },
    tocar: function (x, y) {
      if (Math.hypot(x - this.luz.x, y - this.luz.y) > 46) {
        nota("empieza con el dedo en la luciérnaga", 1800); return false;
      }
      this.corriendo = true; this.tocando = true;
      this.t0 = Date.now();
      nota("");
      return true;
    },
    mover: function (x, y) {
      this.luz.x = Math.max(6, Math.min(W - 6, x));
      this.luz.y = Math.max(H * 0.08, Math.min(H - 6, y));
    },
    soltar: function () { if (this.corriendo) perder("soltaste la luciérnaga"); }
  };

  var ETAPAS = [nudo, cerradura, vuelo];

  /* ── Motor ───────────────────────────────────────────────────────── */
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
    elCerradura.hidden = e !== cerradura;
    reloj = 0;
    medir();
    e.preparar();
  }

  function perder(motivo) {
    if (!viva || transicion) return;
    transicion = true;
    fallos++;
    for (var k = 0; k < ETAPAS.length; k++) {
      if ("corriendo" in ETAPAS[k]) { ETAPAS[k].corriendo = false; ETAPAS[k].tocando = false; }
    }
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
      nota("llave " + e.num + " girada", 2400);
      setTimeout(function () {
        if (!viva) return;
        etapa++; transicion = false; prepararEtapa();
      }, 1800);
      return;
    }
    for (var k = 0; k < ETAPAS.length; k++) {
      if ("corriendo" in ETAPAS[k]) { ETAPAS[k].corriendo = false; ETAPAS[k].tocando = false; }
    }
    memoria.etapa = ETAPAS.length - 1;
    memoria.ganado = true;
    guardar();
    nota("");
    abrirPremio();
  }

  /* El tercer regalo: unos audífonos Noiz. La foto es `premio3.jpg` (dejar
     ese archivo junto a este; si falta, no se rompe, solo no se ve). El viaje
     del envío se cuenta como la Odisea en `odisea.html`, con datos reales. */
  var FRASE_REGALO = "De mí para tú. Sigue el viaje de tus Noiz, que vienen bajando desde el Olimpo.";
  function abrirPremio() {
    elFoto.src = "premio3.jpg";
    elFrase.textContent = FRASE_REGALO;
    elPremio.classList.add("viva");
    elVerRegalo.hidden = false;
  }
  // Si no hay foto, el hueco roto se queda escondido: mejor solo la frase.
  elFoto.addEventListener("load", function () { elFoto.hidden = false; });
  elFoto.addEventListener("error", function () { elFoto.hidden = true; });

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
    if (ev.pointerType === "touch" && ETAPAS[etapa].pulgar) y -= TOQUE_ARRIBA;
    return { x: x, y: y };
  }
  lienzo.addEventListener("pointerdown", function (ev) {
    if (!viva || elPremio.classList.contains("viva")) return;
    ev.preventDefault();
    var p = puntoDe(ev), e = ETAPAS[etapa];
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

  // El grupo de la cerradura: seis figuras, borrar y probar.
  FLORES.forEach(function (f, i) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "cerradura-flor";
    b.textContent = f;
    b.addEventListener("click", function () { if (viva) cerradura.poner(i); });
    elFlores.appendChild(b);
  });
  [["←", "borrar", "es-borrar"], ["✓", "probar", "es-va"]].forEach(function (t) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "cerradura-flor " + t[2];
    b.textContent = t[0];
    b.addEventListener("click", function () { if (viva) cerradura[t[1]](); });
    elFlores.appendChild(b);
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
    elCerradura.hidden = true;
    for (var k = 0; k < ETAPAS.length; k++) {
      if ("corriendo" in ETAPAS[k]) { ETAPAS[k].corriendo = false; ETAPAS[k].tocando = false; }
    }
  }
  caja.querySelector("#r3Salir").addEventListener("click", cerrar);
  caja.querySelector("#r3Cerrar").addEventListener("click", cerrar);
  elVerRegalo.addEventListener("click", abrirPremio);

  window.addEventListener("resize", function () {
    if (!viva) return;
    medir();
    if (ETAPAS[etapa].corriendo) perder("cambió la pantalla");
    else if (!ETAPAS[etapa].quieta) prepararEtapa();
  });

  /* ── El candado ──────────────────────────────────────────────────── */
  var boton = document.getElementById("reto3Abrir");
  var rotulo = boton ? boton.textContent : "";
  function quitarCandado() {
    if (!boton) return;
    boton.classList.remove("con-candado");
    boton.textContent = "las tres llaves ✿";
  }
  if (boton) {
    if (puertasCruzadas()) quitarCandado();
    var avisoId = 0;
    boton.addEventListener("click", function () {
      if (!puertasCruzadas()) {
        // No se abre, pero se contesta: un botón mudo parece roto.
        clearTimeout(avisoId);
        boton.textContent = "primero, las siete puertas";
        avisoId = setTimeout(function () { boton.textContent = rotulo; }, 2600);
        return;
      }
      quitarCandado();
      abrir();
    });
  }
  // Y si cruza las siete puertas ahora mismo, el candado cae sin recargar.
  window.addEventListener("reto:ganado", function () { abierto = true; quitarCandado(); });

  // Solo con ?pruebas: para poder recorrerlo entero desde un guion.
  if (/[?&]pruebas/.test(location.search)) {
    window.__reto3 = {
      abrir: function () { abierto = true; quitarCandado(); abrir(); },
      cerrar: cerrar,
      total: ETAPAS.length,
      irEtapa: function (n) { etapa = n; fallos = 0; prepararEtapa(); },
      estado: function () {
        return { etapa: etapa, fallos: fallos, premio: elPremio.classList.contains("viva"),
                 cruces: nudo.cruces, intentos: cerradura.usados,
                 vuela: vuelo.corriendo, resta: vuelo.restante };
      },
      solucion: {
        // La rueda: las ocho luces en el orden del tejido, repartidas en
        // círculo. Puestas ahí, el nudo queda deshecho por construcción.
        nudo: function () {
          var s = [], r = Math.min(W, H) * 0.33;
          for (var i = 0; i < nudo.n; i++) {
            var a = -Math.PI / 2 + (i / nudo.n) * Math.PI * 2;
            s.push({ i: i, desde: { x: nudo.puntos[i].x, y: nudo.puntos[i].y },
                     hasta: { x: W / 2 + Math.cos(a) * r, y: H * 0.5 + Math.sin(a) * r } });
          }
          return s;
        },
        cerradura: function () { return cerradura.clave.slice(); },
        vuelo: function () { return { espinas: vuelo.espinas, t0: vuelo.t0, radio: vuelo.radio() }; }
      },
      poner: function (f) { cerradura.poner(f); },
      probar: function () { cerradura.probar(); }
    };
  }
})();
