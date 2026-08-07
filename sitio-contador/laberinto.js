/* ══════════════════════════════════════════════════════════════════
   EL LABERINTO DE LA ROSA — cuatro puertas
   ══════════════════════════════════════════════════════════════════

   Segundo minijuego del contador. Se lleva un brote con el dedo desde
   abajo hasta la rosa de arriba sin rozar las paredes y antes de que se
   acabe el tiempo. Cuatro puertas, cada una más grande y más apretada:

       I  · la semilla   4×6    28 s
       II · el tallo     5×8    34 s
       III· la espina    6×10   40 s
       IV · la rosa      7×12   48 s

   Reglas de la casa (decididas con él):
   - Es DIFÍCIL, pero la puerta superada queda superada: al fallar se
     repite ESA puerta, nunca desde la primera. Se guarda en el aparato.
   - Cada laberinto es SIEMPRE EL MISMO (semilla fija por puerta): se
     puede aprender, y aprenderlo es justo lo que se le pide.
   - Tras varios intentos fallidos, el laberinto ayuda sin decirlo: el
     camino se insinúa un instante al empezar, y más tarde regala holgura
     y segundos. Nunca se anuncia; ella solo nota que le sale.
   - Al pasar la cuarta puerta se abre el regalo (premio.jpg) y queda
     abierto para siempre.

   Sin dependencias. El dibujo va con los TOKENS del sitio, así que la
   partida amanece con el resto el día del cumpleaños.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var MEM = "pequita.laberinto";
  var PUERTAS = [
    { num: "I",   nombre: "la semilla", cols: 4, filas: 6,  tiempo: 28 },
    { num: "II",  nombre: "el tallo",   cols: 5, filas: 8,  tiempo: 34 },
    { num: "III", nombre: "la espina",  cols: 6, filas: 10, tiempo: 40 },
    { num: "IV",  nombre: "la rosa",    cols: 7, filas: 12, tiempo: 48 }
  ];

  var suave = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ── Memoria: hasta qué puerta llegó y si ya tiene el regalo ───────
  function leer() {
    try {
      var m = JSON.parse(localStorage.getItem(MEM) || "{}") || {};
      return { puerta: Math.min(+m.puerta || 0, PUERTAS.length - 1), ganado: !!m.ganado };
    } catch (e) { return { puerta: 0, ganado: false }; }
  }
  function guardar(m) {
    try { localStorage.setItem(MEM, JSON.stringify(m)); } catch (e) {}
  }
  var memoria = leer();

  // ── Azar con semilla: el mismo laberinto en cada intento ──────────
  function azarSemilla(s) {
    return function () {
      s |= 0; s = (s + 0x6D2B79F5) | 0;
      var t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // ── El laberinto: excavado con vuelta atrás sobre una rejilla ─────
  // Cada celda guarda sus cuatro paredes; se derriban al pasar. Así el
  // camino de la entrada a la salida existe siempre.
  function cavar(cols, filas, semilla) {
    var azar = azarSemilla(semilla);
    var celdas = [];
    for (var i = 0; i < cols * filas; i++) celdas.push({ n: true, e: true, s: true, o: true, visto: false });
    var idx = function (c, f) { return f * cols + c; };

    var pila = [{ c: 0, f: filas - 1 }];
    celdas[idx(0, filas - 1)].visto = true;
    while (pila.length) {
      var a = pila[pila.length - 1];
      var vecinos = [];
      if (a.f > 0 && !celdas[idx(a.c, a.f - 1)].visto) vecinos.push({ c: a.c, f: a.f - 1, mio: "n", suyo: "s" });
      if (a.c < cols - 1 && !celdas[idx(a.c + 1, a.f)].visto) vecinos.push({ c: a.c + 1, f: a.f, mio: "e", suyo: "o" });
      if (a.f < filas - 1 && !celdas[idx(a.c, a.f + 1)].visto) vecinos.push({ c: a.c, f: a.f + 1, mio: "s", suyo: "n" });
      if (a.c > 0 && !celdas[idx(a.c - 1, a.f)].visto) vecinos.push({ c: a.c - 1, f: a.f, mio: "o", suyo: "e" });
      if (!vecinos.length) { pila.pop(); continue; }
      var v = vecinos[Math.floor(azar() * vecinos.length)];
      celdas[idx(a.c, a.f)][v.mio] = false;
      celdas[idx(v.c, v.f)][v.suyo] = false;
      celdas[idx(v.c, v.f)].visto = true;
      pila.push({ c: v.c, f: v.f });
    }

    // Entrada abajo y salida arriba, en columnas opuestas para que el
    // recorrido cruce el laberinto entero y no se resuelva por el borde.
    var cEntra = 0, cSale = cols - 1;
    celdas[idx(cEntra, filas - 1)].s = false;
    celdas[idx(cSale, 0)].n = false;
    return { cols: cols, filas: filas, celdas: celdas, cEntra: cEntra, cSale: cSale, idx: idx };
  }

  // El camino bueno, en celdas: sirve para la ayuda que no se anuncia.
  function resolver(lab) {
    var origen = lab.idx(lab.cEntra, lab.filas - 1);
    var destino = lab.idx(lab.cSale, 0);
    var previo = {}, cola = [origen], vistos = {};
    vistos[origen] = true;
    while (cola.length) {
      var actual = cola.shift();
      if (actual === destino) break;
      var c = actual % lab.cols, f = Math.floor(actual / lab.cols), cel = lab.celdas[actual];
      var pasos = [];
      if (!cel.n && f > 0) pasos.push(lab.idx(c, f - 1));
      if (!cel.e && c < lab.cols - 1) pasos.push(lab.idx(c + 1, f));
      if (!cel.s && f < lab.filas - 1) pasos.push(lab.idx(c, f + 1));
      if (!cel.o && c > 0) pasos.push(lab.idx(c - 1, f));
      for (var p = 0; p < pasos.length; p++) {
        if (vistos[pasos[p]]) continue;
        vistos[pasos[p]] = true; previo[pasos[p]] = actual; cola.push(pasos[p]);
      }
    }
    var camino = [], nodo = destino;
    while (nodo !== undefined && nodo !== origen) { camino.unshift(nodo); nodo = previo[nodo]; }
    camino.unshift(origen);
    return camino;
  }

  // ── La pantalla ───────────────────────────────────────────────────
  var caja = document.createElement("div");
  caja.className = "laberinto";
  caja.id = "laberinto";
  caja.setAttribute("aria-hidden", "true");
  caja.innerHTML =
    '<canvas id="labLienzo"></canvas>' +
    '<div class="lab-hud"><span class="lab-hud-puerta" id="labPuerta"></span>' +
    '<span class="lab-hud-reloj" id="labReloj"></span></div>' +
    '<button class="lab-salir" id="labSalir" type="button">volver</button>' +
    // Solo para quien ya lo ganó: la foto está a un toque, sin repetir el
    // camino. Quien no ha llegado nunca lo ve, y así no se destripa nada.
    '<button class="lab-regalo" id="labVerRegalo" type="button" hidden>ver el regalo ✿</button>' +
    '<p class="lab-nota" id="labNota"></p>' +
    '<div class="lab-premio" id="labPremio">' +
      '<p class="lab-titulo">las cuatro puertas</p>' +
      '<img alt="Tu otro regalo" id="labFoto" />' +
      '<p class="lab-frase" id="labFrase"></p>' +
      '<button class="lab-cerrar" id="labCerrar" type="button">volver al conteo</button>' +
    '</div>';
  document.body.appendChild(caja);

  var lienzo = caja.querySelector("#labLienzo");
  var ctx = lienzo.getContext("2d");
  var elPuerta = caja.querySelector("#labPuerta");
  var elReloj = caja.querySelector("#labReloj");
  var elNota = caja.querySelector("#labNota");
  var elPremio = caja.querySelector("#labPremio");
  var elFoto = caja.querySelector("#labFoto");
  var elFrase = caja.querySelector("#labFrase");

  // ── Paleta de tokens, como en el otro juego ───────────────────────
  var P = { dia: false, oro: "#d9a83f", rosa: "#c96b74", calida: "#f6e3c8", tenue: "rgba(234,228,214,.45)" };
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
    P.tenue = tomar("--ink-tenue", "rgba(234,228,214,.45)");
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

  // ── Estado de la partida ──────────────────────────────────────────
  var W = 0, H = 0, t = 0, ox = 0, oy = 0;      // medidas y origen del tablero
  var puerta = 0, lab = null, camino = [], paredes = [];
  var jugando = false, tocando = false, ganada = false;
  var restante = 0, ultimo = 0, rafId = 0;
  var dedo = { x: 0, y: 0 }, rastro = [];
  var fallos = 0, pistaHasta = 0, holgura = 0, tiempoExtra = 0;

  var TOQUE_ARRIBA = 38;   // el brote va por encima del dedo, o no se ve

  function medir() {
    leerPaleta();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = caja.clientWidth; H = caja.clientHeight;
    lienzo.width = Math.round(W * dpr);
    lienzo.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var p = PUERTAS[puerta];
    var margen = 18;
    var arriba = 58, abajo = 92;            // cabecera y sitio del brote
    t = Math.min((W - margen * 2) / p.cols, (H - arriba - abajo) / p.filas);
    ox = (W - t * p.cols) / 2;
    oy = arriba + (H - arriba - abajo - t * p.filas) / 2;
  }

  // Las paredes, ya en píxeles: se calculan una vez por puerta.
  function trazarParedes() {
    paredes = [];
    var añadir = function (x1, y1, x2, y2) { paredes.push({ x1: x1, y1: y1, x2: x2, y2: y2 }); };
    for (var f = 0; f < lab.filas; f++) {
      for (var c = 0; c < lab.cols; c++) {
        var cel = lab.celdas[lab.idx(c, f)];
        var x = ox + c * t, y = oy + f * t;
        if (cel.n) añadir(x, y, x + t, y);
        if (cel.o) añadir(x, y, x, y + t);
        if (c === lab.cols - 1 && cel.e) añadir(x + t, y, x + t, y + t);
        if (f === lab.filas - 1 && cel.s) añadir(x, y + t, x + t, y + t);
      }
    }
  }

  // Distancia de un punto a un segmento: es todo el detector de choques.
  function distancia(px, py, s) {
    var dx = s.x2 - s.x1, dy = s.y2 - s.y1;
    var largo = dx * dx + dy * dy;
    var u = largo ? ((px - s.x1) * dx + (py - s.y1) * dy) / largo : 0;
    u = Math.max(0, Math.min(1, u));
    var qx = s.x1 + u * dx, qy = s.y1 + u * dy;
    return Math.hypot(px - qx, py - qy);
  }

  function centro(indice) {
    return { x: ox + (indice % lab.cols) * t + t / 2, y: oy + Math.floor(indice / lab.cols) * t + t / 2 };
  }
  function bocaEntrada() { return { x: ox + lab.cEntra * t + t / 2, y: oy + lab.filas * t }; }
  function bocaSalida() { return { x: ox + lab.cSale * t + t / 2, y: oy }; }

  // ── Preparar una puerta ───────────────────────────────────────────
  function preparar() {
    var p = PUERTAS[puerta];
    lab = cavar(p.cols, p.filas, 7 * (puerta + 1));
    camino = resolver(lab);
    medir();
    trazarParedes();
    restante = p.tiempo + tiempoExtra;
    jugando = false; tocando = false; ganada = false;
    rastro = [];
    dedo = bocaEntrada();
    elPuerta.textContent = p.num + " · " + p.nombre;
    elReloj.textContent = Math.ceil(restante) + "s";
    // La ayuda que no se anuncia: a partir del tercer fallo, el camino se
    // insinúa un momento al empezar. Ella nunca lee que se le está ayudando.
    pistaHasta = fallos >= 3 ? Date.now() + 1600 : 0;
    holgura = fallos >= 5 ? t * 0.05 : 0;
    nota(puerta === 0 && !memoria.puerta
      ? "lleva el brote hasta la rosa sin rozar las paredes"
      : "");
    pintar();
  }

  var notaId = 0;
  function nota(texto, msVisible) {
    clearTimeout(notaId);
    elNota.textContent = texto || "";
    elNota.classList.toggle("viva", !!texto);
    if (texto && msVisible) notaId = setTimeout(function () { elNota.classList.remove("viva"); }, msVisible);
  }

  // ── El dibujo ─────────────────────────────────────────────────────
  function pintar() {
    ctx.clearRect(0, 0, W, H);
    var brillo = !suave && !P.dia;

    // El camino bueno, insinuado (solo durante la ayuda).
    if (Date.now() < pistaHasta) {
      ctx.save();
      ctx.strokeStyle = conAlfa(P.calida, .16);
      ctx.lineWidth = Math.max(2, t * 0.42);
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.beginPath();
      var boca = bocaEntrada();
      ctx.moveTo(boca.x, boca.y);
      for (var k = 0; k < camino.length; k++) {
        var pc = centro(camino[k]);
        ctx.lineTo(pc.x, pc.y);
      }
      var sal = bocaSalida();
      ctx.lineTo(sal.x, sal.y);
      ctx.stroke();
      ctx.restore();
    }

    // Las paredes, con luz de estrella sobre la noche y tinta plana de día.
    ctx.save();
    ctx.strokeStyle = conAlfa(P.oro, .75);
    ctx.lineWidth = 1.6;
    ctx.lineCap = "round";
    if (brillo) { ctx.shadowBlur = 8; ctx.shadowColor = conAlfa(P.oro, .5); }
    ctx.beginPath();
    for (var i = 0; i < paredes.length; i++) {
      ctx.moveTo(paredes[i].x1, paredes[i].y1);
      ctx.lineTo(paredes[i].x2, paredes[i].y2);
    }
    ctx.stroke();
    ctx.restore();

    // Los cruces, como estrellitas del dibujo.
    ctx.save();
    ctx.fillStyle = conAlfa(P.oro, .35);
    for (var f = 0; f <= lab.filas; f++) {
      for (var c = 0; c <= lab.cols; c++) {
        ctx.beginPath();
        ctx.arc(ox + c * t, oy + f * t, 1.1, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    // La rosa de la salida.
    var sal2 = bocaSalida();
    dibujarRosa(sal2.x, sal2.y - 16, Math.min(13, t * 0.3));

    // El rastro de por dónde ha ido.
    if (rastro.length > 1) {
      ctx.save();
      ctx.strokeStyle = conAlfa(P.calida, .3);
      ctx.lineWidth = 2; ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(rastro[0].x, rastro[0].y);
      for (var r = 1; r < rastro.length; r++) ctx.lineTo(rastro[r].x, rastro[r].y);
      ctx.stroke();
      ctx.restore();
    }

    // El brote que ella lleva.
    ctx.save();
    if (brillo) { ctx.shadowBlur = 14; ctx.shadowColor = conAlfa(P.calida, .9); }
    ctx.fillStyle = P.calida;
    ctx.beginPath();
    ctx.arc(dedo.x, dedo.y, radioBrote(), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // La boca de entrada, mientras no ha empezado: dónde poner el dedo.
    if (!jugando) {
      var boca2 = bocaEntrada();
      ctx.save();
      ctx.strokeStyle = conAlfa(P.calida, .5);
      ctx.lineWidth = 1.4;
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.arc(boca2.x, boca2.y, radioBrote() + 9 + (suave ? 0 : Math.sin(Date.now() / 400) * 2), 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  function radioBrote() { return Math.max(4, t * 0.15 - holgura); }

  function dibujarRosa(x, y, r) {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = P.rosa;
    ctx.lineWidth = 1.4;
    ctx.fillStyle = conAlfa(P.rosa, .22);
    if (!suave && !P.dia) { ctx.shadowBlur = 12; ctx.shadowColor = conAlfa(P.rosa, .6); }
    for (var i = 3; i >= 1; i--) {
      ctx.beginPath();
      ctx.arc(0, 0, r * (i / 3), 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
    }
    ctx.restore();
  }

  // ── El pulso de la partida ────────────────────────────────────────
  function paso(ahora) {
    if (!caja.classList.contains("viva")) return;
    rafId = requestAnimationFrame(paso);
    var dt = Math.min((ahora - ultimo) / 1000, 0.05);
    ultimo = ahora;
    if (jugando && !ganada) {
      restante -= dt;
      elReloj.textContent = Math.max(0, Math.ceil(restante)) + "s";
      if (restante <= 0) { perder("se acabó el tiempo"); return; }
    }
    pintar();
  }

  function dentroDelTablero(x, y) {
    return x > ox - t && x < ox + lab.cols * t + t && y > oy - t * 1.2 && y < oy + lab.filas * t + t;
  }

  function mover(x, y) {
    dedo.x = x; dedo.y = y;
    if (!jugando || ganada) return;

    // ¿Rozó una pared?
    var r = radioBrote();
    for (var i = 0; i < paredes.length; i++) {
      if (distancia(x, y, paredes[i]) < r) { perder("rozaste la pared"); return; }
    }
    if (!dentroDelTablero(x, y)) { perder("te saliste"); return; }

    var ult = rastro[rastro.length - 1];
    if (!ult || Math.hypot(x - ult.x, y - ult.y) > 3) rastro.push({ x: x, y: y });

    // ¿Llegó a la rosa?
    var sal = bocaSalida();
    if (y <= sal.y + 2 && Math.abs(x - sal.x) < t / 2) ganar();
  }

  function empezar(x, y) {
    var boca = bocaEntrada();
    if (Math.hypot(x - boca.x, y - boca.y) > t * 0.6) {
      nota("empieza desde el brote, abajo", 1800);
      return false;
    }
    jugando = true; tocando = true; ganada = false;
    rastro = [{ x: boca.x, y: boca.y }];
    dedo = { x: x, y: y };
    nota("");
    return true;
  }

  function perder(motivo) {
    if (!jugando || ganada) return;
    jugando = false; tocando = false;
    fallos++;
    rastro = [];
    nota(motivo + " — otra vez", 2200);
    // Al quinto fallo, además de holgura, unos segundos más. En silencio.
    if (fallos === 5) tiempoExtra = 8;
    setTimeout(function () { if (caja.classList.contains("viva")) preparar(); }, 900);
  }

  function ganar() {
    if (ganada) return;
    ganada = true; jugando = false; tocando = false;
    fallos = 0; tiempoExtra = 0;

    if (puerta + 1 < PUERTAS.length) {
      memoria.puerta = Math.max(memoria.puerta, puerta + 1);
      guardar(memoria);
      nota("puerta " + PUERTAS[puerta].num + " superada", 2400);
      puerta++;
      setTimeout(function () { if (caja.classList.contains("viva")) preparar(); }, 1700);
      return;
    }

    // La cuarta: el regalo.
    memoria.puerta = PUERTAS.length - 1;
    memoria.ganado = true;
    guardar(memoria);
    nota("");
    abrirPremio();
  }

  // ── El regalo ─────────────────────────────────────────────────────
  // La foto no se carga hasta que hace falta: así no viaja por la red
  // antes de tiempo y el regalo no se destripa mirando lo que descarga.
  function abrirPremio() {
    elFoto.src = "premio.jpg";
    elFrase.textContent = "Cuatro puertas para esto: el 30 de octubre te llevo a escuchar a Morfina en vivo.";
    elPremio.classList.add("viva");
  }

  // ── Entradas ──────────────────────────────────────────────────────
  function puntoDe(ev) {
    var r = lienzo.getBoundingClientRect();
    var x = ev.clientX - r.left;
    var y = ev.clientY - r.top;
    // Con el dedo, el brote va un poco por encima: si no, la mano lo tapa
    // justo cuando más falta hace verlo.
    if (ev.pointerType === "touch") y -= TOQUE_ARRIBA;
    return { x: x, y: y };
  }

  lienzo.addEventListener("pointerdown", function (ev) {
    if (elPremio.classList.contains("viva")) return;
    ev.preventDefault();
    var p = puntoDe(ev);
    if (!jugando) { if (empezar(p.x, p.y)) lienzo.setPointerCapture(ev.pointerId); }
  });
  lienzo.addEventListener("pointermove", function (ev) {
    if (!tocando) return;
    ev.preventDefault();
    var p = puntoDe(ev);
    mover(p.x, p.y);
  });
  function soltar() {
    if (jugando && !ganada) perder("soltaste el brote");
  }
  lienzo.addEventListener("pointerup", soltar);
  lienzo.addEventListener("pointercancel", soltar);

  // ── Abrir y cerrar ────────────────────────────────────────────────
  function abrir() {
    memoria = leer();
    puerta = memoria.puerta || 0;
    fallos = 0; tiempoExtra = 0;
    caja.classList.add("viva");
    caja.setAttribute("aria-hidden", "false");
    elPremio.classList.remove("viva");
    preparar();
    ultimo = performance.now();
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(paso);
    caja.querySelector("#labVerRegalo").hidden = !memoria.ganado;
  }
  function cerrar() {
    jugando = false; tocando = false;
    cancelAnimationFrame(rafId);
    caja.classList.remove("viva");
    caja.setAttribute("aria-hidden", "true");
    elPremio.classList.remove("viva");
  }

  caja.querySelector("#labSalir").addEventListener("click", cerrar);
  caja.querySelector("#labVerRegalo").addEventListener("click", abrirPremio);
  caja.querySelector("#labCerrar").addEventListener("click", cerrar);

  window.addEventListener("resize", function () {
    if (!caja.classList.contains("viva")) return;
    medir(); trazarParedes();
    if (jugando) perder("cambió la pantalla");
  });

  var boton = document.getElementById("labAbrir");
  if (boton) boton.addEventListener("click", abrir);

  // Solo para probar (?pruebas): abrir por dónde se quiera y ver el camino.
  if (/[?&]pruebas/.test(location.search)) {
    window.__laberinto = {
      abrir: abrir, cerrar: cerrar,
      puertaEn: function (n) { puerta = n; preparar(); },
      caminoPx: function () {
        var salida = [bocaEntrada()];
        for (var k = 0; k < camino.length; k++) salida.push(centro(camino[k]));
        salida.push(bocaSalida());
        return salida;
      },
      estado: function () {
        return { puerta: puerta, jugando: jugando, ganada: ganada, fallos: fallos,
                 premio: elPremio.classList.contains("viva") };
      }
    };
  }
})();
