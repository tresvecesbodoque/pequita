"use client";

import { useEffect } from "react";

// Marca la carta como leída en ESTE dispositivo (localStorage). Es la base de
// la constelación del álbum: cada carta leída enciende una estrella. No hay
// servidor de por medio: la magia es local, en el teléfono de Isidora.

export const LEIDAS_KEY = "pequita-leidas";

export function leerLeidas(): string[] {
  try {
    const raw = localStorage.getItem(LEIDAS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter((s) => typeof s === "string") : [];
  } catch {
    return [];
  }
}

export function MarcarLeida({ slug }: { slug: string }) {
  useEffect(() => {
    const leidas = leerLeidas();
    if (!leidas.includes(slug)) {
      try {
        localStorage.setItem(LEIDAS_KEY, JSON.stringify([...leidas, slug]));
      } catch {
        // sin almacenamiento disponible: la constelación simplemente no avanza
      }
    }
  }, [slug]);
  return null;
}
