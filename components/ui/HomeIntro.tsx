"use client";

import { useEffect, useState } from "react";
import { SurpriseIntro } from "@/components/ui/SurpriseIntro";
import { BirthdayConfetti } from "@/components/ui/BirthdayConfetti";

// Portada: decide qué recibimiento mostrar según la fecha del cumpleaños.
//   - ANTES del día D → telón "shhh, es una sorpresa".
//   - EL DÍA D (o después) → confeti de cumpleaños.
// La decisión se toma en el cliente (usa la hora local) para no desajustar la
// hidratación; hasta entonces no pinta nada.

export function HomeIntro({ isoDate }: { isoDate: string | null }) {
  const [mode, setMode] = useState<"pending" | "before" | "after">("pending");

  useEffect(() => {
    if (!isoDate) {
      setMode("before");
      return;
    }
    setMode(Date.now() >= new Date(isoDate).getTime() ? "after" : "before");
  }, [isoDate]);

  if (mode === "pending") return null;
  return mode === "after" ? <BirthdayConfetti /> : <SurpriseIntro />;
}
