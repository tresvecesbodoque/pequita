/* ══════════════════════════════════════════════════════════════════
   Presencia — la luz de encontrarse.

   Este sitio es estático: dos navegadores abiertos en la misma página no
   pueden verse. Por eso hay un único lugar común, un endpoint de la app
   (que sí tiene base de datos), donde cada uno deja su latido y pregunta
   por el del otro. Ni chat ni historial: dos filas con una hora.

   QUIÉN ES QUIÉN. Lo pregunta la puerta (ver index.html): ningún aparato ve
   el contador sin decir antes si es zorro o rosa, así que aquí siempre se
   sabe con quién se habla. No se supone nada de nadie: sin nombre guardado,
   este guion no hace nada.

   El nombre también se puede dejar puesto de una vez con ?soy=zorro /
   ?soy=rosa, que además se salta la puerta. Se guarda en la memoria del
   sitio —la misma del frasco, con sus dos copias y su rescate por enlace— y
   la dirección se limpia después, para que un enlace compartido no convierta
   a nadie en otra persona.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var QUIENES = { zorro: "rosa", rosa: "zorro" };
  var PRONOMBRE = { zorro: "él", rosa: "ella" };   // el del OTRO

  var LATIDO = 20000;   // cada cuánto se dice "sigo aquí"
  var JUNTOS = 55000;   // margen: dos latidos perdidos y la luz se apaga sola
  var PINTAR = 5000;    // cada cuánto se repinta con el reloj de casa

  var FRASE_ENCUENTRO = "estás mirando esto al mismo tiempo que yo";
  var FRASE_JUNTOS = "los dos, aquí, ahora";
  var ENCUENTRO_DURA = 9000;

  // Al marcar un aparato hay que VER que quedó marcado; si no, no hay forma de
  // saber si la luz calla porque no hay nadie o porque la marca no prendió.
  // El de ella no habla de marcas: dice para qué sirve la línea.
  var CONFIRMA = { zorro: "este aparato eres tú", rosa: "aquí sabrás cuándo está él" };
  var CONFIRMA_DURA = 6000;

  // Mientras el otro no haya pasado ni una vez no hay "hace cuánto" que dar,
  // pero callarse es peor: desde fuera, no tener noticias y estar roto se ven
  // exactamente igual. Así que la línea lo dice.
  var NUNCA = { zorro: "él todavía no ha pasado por aquí", rosa: "ella todavía no ha pasado por aquí" };

  // En local (probando) se habla con el servidor de al lado; en producción,
  // con la app.
  var API = /^(localhost|127\.0\.0\.1)$/.test(location.hostname)
    ? "http://127.0.0.1:3000/api/presencia"
    : "https://ishibonita.vercel.app/api/presencia";

  if (!window.fetch) return;

  // ── Quién soy ──────────────────────────────────────────────────
  var enMemoria = typeof leerMem === "function" ? leerMem : function () { return {}; };
  var aMemoria = typeof guardarMem === "function" ? guardarMem : function () {};

  var quien = "";
  var marcadoAhora = false;
  var enLaUrl = /[?&]soy=([a-z]+)/i.exec(location.search);
  if (enLaUrl && QUIENES[enLaUrl[1].toLowerCase()]) {
    quien = enLaUrl[1].toLowerCase();
    marcadoAhora = true;
    try {
      var datos = enMemoria();
      datos.quien = quien;
      aMemoria(datos);
    } catch (e) {}
    // La dirección se queda limpia: nadie hereda un nombre por compartir el enlace.
    if (window.history && history.replaceState) {
      try { history.replaceState(null, "", location.pathname + location.hash); } catch (e2) {}
    }
  } else {
    try {
      var guardado = enMemoria();
      quien = guardado.quien || "";
      // Acaba de pasar por la puerta: se la saluda igual que a un enlace marcado.
      if (guardado.recienEntrado) {
        marcadoAhora = true;
        delete guardado.recienEntrado;
        guardado.recienEntrado = false;
        aMemoria(guardado);
      }
    } catch (e3) { quien = ""; }
  }
  // Sin nombre no se late ni se pregunta. Ya no hay "por defecto es ella":
  // desde que existe la puerta, todo aparato dice quién es antes de entrar.
  if (!QUIENES[quien]) return;

  var caja = document.getElementById("presencia");
  var texto = document.getElementById("presenciaTexto");
  if (!caja || !texto) return;

  var otro = QUIENES[quien];
  var pronombre = PRONOMBRE[otro];

  // ── Estado ─────────────────────────────────────────────────────
  // La edad se mide en el servidor (evita relojes descuadrados) y luego se le
  // suma lo que lleva pasado aquí. Así, si se cae la red, la luz se apaga sola
  // en vez de quedarse encendida mintiendo.
  var edadOtro = null;    // ms desde el último latido del otro, al medirlo
  var medidoEn = 0;
  var hayRespuesta = false;
  var pidiendo = false;
  var juntosAntes = false;
  var encuentroHasta = 0;
  var confirmaHasta = marcadoAhora ? Date.now() + CONFIRMA_DURA : 0;
  var ultimoTexto = "";

  function seVe() { return document.visibilityState !== "hidden"; }

  function edadAhora() {
    if (edadOtro === null) return null;
    return edadOtro + (Date.now() - medidoEn);
  }

  function hace(ms) {
    var min = Math.floor(ms / 60000);
    if (min < 2) return "hace un momento";
    if (min < 60) return "hace " + min + " minutos";
    var h = Math.floor(min / 60);
    if (h < 2) return "hace una hora";
    if (h < 24) return "hace " + h + " horas";
    var d = Math.floor(h / 24);
    if (d < 2) return "ayer";
    if (d < 8) return "hace " + d + " días";
    return "hace mucho";
  }

  function decir(frase) {
    if (frase === ultimoTexto) return;
    ultimoTexto = frase;
    texto.textContent = frase;
  }

  function pintar() {
    // Acaba de marcarse este aparato: primero se dice, y luego ya se mira si
    // hay alguien. Es el único momento en que la línea habla de sí misma.
    if (Date.now() < confirmaHasta) {
      caja.hidden = false;
      caja.classList.remove("juntos");
      decir(CONFIRMA[quien]);
      return;
    }

    // Sin respuesta todavía (o sin red): no se inventa nada.
    if (!hayRespuesta) { caja.hidden = true; return; }

    var edad = edadAhora();
    if (edad === null) {          // el otro no ha pasado nunca
      caja.hidden = false;
      caja.classList.remove("juntos");
      decir(NUNCA[otro]);
      return;
    }

    var juntos = edad < JUNTOS;
    if (juntos && !juntosAntes) encuentroHasta = Date.now() + ENCUENTRO_DURA;
    juntosAntes = juntos;

    caja.hidden = false;
    caja.classList.toggle("juntos", juntos);
    if (juntos) {
      decir(Date.now() < encuentroHasta ? FRASE_ENCUENTRO : FRASE_JUNTOS);
    } else {
      decir(pronombre + " pasó por aquí " + hace(edad));
    }
  }

  // ── El latido ──────────────────────────────────────────────────
  function latir() {
    if (pidiendo || !seVe()) return;
    pidiendo = true;
    fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quien: quien }),
      cache: "no-store"
    })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (!d) return;
        hayRespuesta = true;
        edadOtro = d.otro ? Math.max(0, d.ahora - d.otro) : null;
        medidoEn = Date.now();
        pintar();
      })
      .catch(function () {})   // sin red no hay aviso de error: solo no hay luz
      .then(function () { pidiendo = false; });
  }

  var relojLatido = setInterval(latir, LATIDO);
  var relojPintura = setInterval(pintar, PINTAR);
  latir();
  if (confirmaHasta) {
    pintar();
    setTimeout(pintar, CONFIRMA_DURA + 50);   // que el aviso se retire a su hora
  }

  // Volver a la pestaña cuenta como llegar: se late enseguida, sin esperar turno.
  document.addEventListener("visibilitychange", function () {
    if (seVe()) latir();
  });
})();
