"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";

// Confeti del DÍA D: al entrar a la portada el día del cumpleaños, en vez del
// telón "shhh, es sorpresa" cae una lluvia de confeti. Se dispara una vez al
// montar. Respeta "reduce motion": si el usuario lo pide, no lanza nada.

export function BirthdayConfetti() {
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const colors = ["#d9a83f", "#7c1b22", "#e7d8b5", "#c94f4f", "#f4ede0"];
    const end = Date.now() + 2200;

    // Dos surtidores laterales que se cruzan, más una ráfaga central inicial.
    confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 }, colors });

    (function frame() {
      confetti({ particleCount: 5, angle: 60, spread: 60, origin: { x: 0 }, colors });
      confetti({ particleCount: 5, angle: 120, spread: 60, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }, []);

  return null;
}
