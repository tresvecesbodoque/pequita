"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/Button";

// Telón de entrada del enlace PRINCIPAL (la portada `/`, que se comparte con la
// familia). La primera vez que alguien llega, un emoji que pide silencio recuerda
// que todo esto es una sorpresa para Isidora. Se muestra una sola vez por
// dispositivo (localStorage) y NUNCA en `/para-ella` — el enlace de ella — porque
// este componente solo se monta en la portada. Con `?intro` se puede volver a ver
// para previsualizar.
const SEEN_KEY = "pequita:intro-sorpresa:v1";

export function SurpriseIntro() {
  const reduce = useReducedMotion();
  // Empieza en false: en servidor e hidratación no se pinta nada (sin parpadeo
  // ni desajuste). Al montar, solo se activa si toca mostrarla; así la cortina
  // entra con su animación en lugar de estar ya presente al primer pintado.
  const [show, setShow] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const force = params.has("intro"); // ?intro → previsualizar de nuevo
    const seen = window.localStorage.getItem(SEEN_KEY);
    // Lectura única del store externo al montar: un solo re-render, no cascada.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (force || !seen) setShow(true);
  }, []);

  // Auto-cierre generoso: si nadie toca, entra solo tras unos segundos.
  useEffect(() => {
    if (!show) return;
    const t = window.setTimeout(dismiss, 6000);
    return () => window.clearTimeout(t);
  }, [show]);

  function dismiss() {
    try {
      window.localStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* modo privado: no pasa nada, solo se mostrará de nuevo */
    }
    setShow(false);
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Aviso: esto es una sorpresa"
          className="fixed inset-0 z-[120] flex items-center justify-center px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          onClick={dismiss}
        >
          {/* Cortina cálida con desenfoque, como un secreto antes de abrirse */}
          <div className="absolute inset-0 bg-[var(--background)]/92 backdrop-blur-sm" />

          <motion.div
            className="relative flex flex-col items-center text-center"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            // El clic en el contenido no debe cerrar sin querer al leer.
            onClick={(e) => e.stopPropagation()}
          >
            {/* Anillos que se expanden en silencio detrás del emoji */}
            {!reduce && (
              <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
                {[0, 0.9, 1.8].map((delay) => (
                  <motion.span
                    key={delay}
                    className="absolute h-40 w-40 rounded-full border-2 border-[var(--accent)]/30"
                    initial={{ scale: 0.4, opacity: 0.5 }}
                    animate={{ scale: 2.1, opacity: 0 }}
                    transition={{ duration: 2.7, delay, repeat: Infinity, ease: "easeOut" }}
                  />
                ))}
              </div>
            )}

            {/* El emoji que hace silencio */}
            <motion.div
              className="select-none text-8xl sm:text-9xl"
              style={{ filter: "drop-shadow(3px 5px 0 rgba(124,27,34,0.25))" }}
              initial={reduce ? { scale: 1 } : { scale: 0.3, rotate: -12 }}
              animate={
                reduce
                  ? { scale: 1 }
                  : { scale: [0.3, 1.12, 1, 1.05, 1], rotate: [-12, 4, -2, 1, 0] }
              }
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], times: [0, 0.5, 0.7, 0.85, 1] }}
              aria-hidden
            >
              🤫
            </motion.div>

            <motion.p
              className="mt-4 text-6xl text-[var(--accent)] sm:text-7xl"
              style={{ fontFamily: "var(--font-sketch)" }}
              initial={reduce ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Shhh…
            </motion.p>

            <motion.p
              className="mx-auto mt-3 max-w-sm text-lg leading-relaxed text-[var(--foreground)]"
              initial={reduce ? { opacity: 1 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              Lo que estás a punto de ver es una{" "}
              <span className="text-[var(--accent)]">sorpresa</span>.
            </motion.p>

            <motion.p
              className="mt-1 text-sm text-[var(--muted)]"
              initial={reduce ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.95, duration: 0.5 }}
            >
              Guárdame el secreto: es para Isidora.
            </motion.p>

            <motion.div
              className="mt-8"
              initial={reduce ? { opacity: 1 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.15, duration: 0.5 }}
            >
              <Button className="px-8 py-3.5 text-base" onClick={dismiss}>
                Entrar en silencio →
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
