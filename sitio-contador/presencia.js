/* ══════════════════════════════════════════════════════════════════
   Presencia — la luz de encontrarse.

   Este sitio es estático: dos navegadores abiertos en la misma página no
   pueden verse. Por eso hay un único lugar común, un endpoint de la app
   (que sí tiene base de datos), donde cada uno deja su latido y pregunta
   por el del otro. Ni chat ni historial: dos filas con una hora.

   QUIÉN ES QUIÉN. No hay contraseñas. Se entra UNA vez con ?soy=zorro (él)
   o ?soy=rosa (ella); la marca se guarda en la memoria del sitio —la misma
   del frasco, con sus dos copias y su rescate por enlace— y la dirección se
   limpia, para que un enlace compartido no convierta a nadie en otra
   persona. Sin marca no se late ni se pregunta: quien pase por aquí de
   rebote no enciende nada y no aparece en ninguna parte.
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
  var enLaUrl = /[?&]soy=([a-z]+)/i.exec(location.search);
  if (enLaUrl && QUIENES[enLaUrl[1].toLowerCase()]) {
    quien = enLaUrl[1].toLowerCase();
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
    try { quien = enMemoria().quien || ""; } catch (e3) { quien = ""; }
  }
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
  var ultimoTexto = "";

  function esDeDia() { return document.documentElement.classList.contains("dia"); }
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
    if (esDeDia()) { caja.hidden = true; return; }

    var edad = edadAhora();
    // Todavía no sabemos nada, o el otro no ha entrado nunca: no se dice nada.
    if (!hayRespuesta || edad === null) { caja.hidden = true; return; }

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
    if (pidiendo || esDeDia() || !seVe()) return;
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

  // Volver a la pestaña cuenta como llegar: se late enseguida, sin esperar turno.
  document.addEventListener("visibilitychange", function () {
    if (seVe()) latir();
  });

  // El día D se apaga todo, como el cielo y los eventos (ver DESIGN.md).
  var vigilaElDia = setInterval(function () {
    if (!esDeDia()) return;
    clearInterval(relojLatido);
    clearInterval(relojPintura);
    clearInterval(vigilaElDia);
    caja.hidden = true;
  }, 1000);
})();
