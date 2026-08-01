/* ══════════════════════════════════════════════════════════════════
   El frasco, en todos sus aparatos.

   Hasta ahora el frasco vivía en el almacenamiento del navegador, que es
   por aparato Y por dominio: cambiar de teléfono lo dejaba atrás, y cambiar
   de dirección también (de ahí el puente y el rescate por enlace). Aquí se
   guarda además en la app, una fila por persona.

   SOLO APARATOS MARCADOS. Sin marca no se sube ni se baja nada: el frasco es
   lo único que ella va juntando y no puede quedar a merced de quien pase por
   la dirección. Un aparato suyo sin marcar guarda el suyo en local y no
   pierde nada: el día que abra su enlace, los dos frascos se funden.

   Cómo no se pierde nada: se manda SIEMPRE lo que hay aquí y se guarda lo que
   contesta el servidor, que es la fusión de lo suyo con lo de allá. Como
   fundir nunca resta, la respuesta contiene todo lo de este aparato; por eso
   se puede guardar tal cual.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var API = /^(localhost|127\.0\.0\.1)$/.test(location.hostname)
    ? "http://127.0.0.1:3000/api/frasco"
    : "https://ishibonita.vercel.app/api/frasco";

  var VIGILA = 30000;    // cada cuánto se mira si hay algo nuevo que subir
  // Subir solo cuando cambia algo aquí no basta: si ella encuentra una
  // luciérnaga en el teléfono, el computador abierto no se enteraría nunca.
  // Así que, aunque no haya novedades propias, se pregunta cada tantos.
  var REPESCA = 120000;
  var TESORO = ["coleccion", "dias", "cartas", "registro", "versos", "visitas", "racha", "creado", "juego"];

  if (!window.fetch) return;

  var enMemoria = typeof leerMem === "function" ? leerMem : null;
  var aMemoria = typeof guardarMem === "function" ? guardarMem : null;
  if (!enMemoria || !aMemoria) return;

  // Solo aparatos marcados: la marca la pone ?soy=zorro / ?soy=rosa una vez.
  // Lo demás que llegue a esta dirección se cuenta como ella para la luz de
  // presencia, pero NO toca el frasco.
  var quien = "";
  try { quien = enMemoria().quien || ""; } catch (e) { return; }
  if (quien !== "zorro" && quien !== "rosa") return;

  // Solo el tesoro. Fuera se quedan `ultimos` y `sesion` —los descansos de los
  // eventos en ESTE aparato; si viajaran, entrar en el computador dejaría el
  // teléfono mudo un rato— y la marca del aparato.
  function tesoro() {
    var m = enMemoria(), t = {}, k;
    for (var i = 0; i < TESORO.length; i++) {
      k = TESORO[i];
      if (m[k] !== undefined) t[k] = m[k];
    }
    return t;
  }

  var ultimoEnviado = "";
  var ultimaVez = 0;
  var pidiendo = false;

  function sincronizar(forzar) {
    if (pidiendo) return;
    var t = tesoro();
    var texto = JSON.stringify(t);
    // Nada nuevo aquí y hace poco que se preguntó: no se molesta a nadie.
    if (!forzar && texto === ultimoEnviado && Date.now() - ultimaVez < REPESCA) return;
    pidiendo = true;

    fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quien: quien, frasco: t }),
      cache: "no-store"
    })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (!d || !d.frasco) return;
        // guardarMem funde con lo que haya en disco, así que lo que se haya
        // guardado mientras tanto (una luciérnaga nueva, una partida) sigue ahí.
        aMemoria(d.frasco);
        if (window.recargarFrasco) window.recargarFrasco();
        // La huella se toma DESPUÉS de guardar: si el servidor trajo cosas de
        // otro aparato, lo de aquí ya es otra cosa y sin esto se volvería a
        // subir en la vuelta siguiente sin necesidad.
        ultimoEnviado = JSON.stringify(tesoro());
        ultimaVez = Date.now();
      })
      .catch(function () {})   // sin red, el frasco sigue entero aquí; ya subirá
      .then(function () { pidiendo = false; });
  }

  setTimeout(function () { sincronizar(true); }, 1500);   // al llegar, sin pelearse con la portada
  setInterval(function () { sincronizar(false); }, VIGILA);
  // Volver a la pestaña es justo cuando quiere estar al día: se pregunta sin excusas.
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState !== "hidden") sincronizar(true);
  });

  // Al cerrar la pestaña no da tiempo a una petición normal. El beacon va como
  // texto plano a propósito: así el navegador lo manda sin preguntar permiso
  // antes (sin preflight), que es lo único que llega a tiempo.
  window.addEventListener("pagehide", function () {
    if (!navigator.sendBeacon) return;
    var t = tesoro();
    if (JSON.stringify(t) === ultimoEnviado) return;
    try {
      navigator.sendBeacon(API, new Blob([JSON.stringify({ quien: quien, frasco: t })],
        { type: "text/plain;charset=UTF-8" }));
    } catch (e) {}
  });
})();
