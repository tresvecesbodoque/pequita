"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.replace(next || "/editor");
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "No se pudo iniciar sesión.");
      }
    } catch {
      setError("Error de conexión.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="sketch-card sketch-card--v2 sketch-card--gira2 w-full max-w-sm p-8"
    >
      <div className="mb-6 text-center">
        {/* la llavecita del taller, dibujada a tinta */}
        <svg viewBox="0 0 64 32" className="mx-auto h-8 w-16" aria-hidden>
          <g fill="none" stroke="var(--foreground)" strokeWidth="2" strokeLinecap="round">
            <circle cx="14" cy="16" r="7.5" />
            <circle cx="14" cy="16" r="2.6" fill="var(--gold)" stroke="none" />
            <path d="M21.5 16h30" />
            <path d="M44 16v6M51 16v8" />
          </g>
        </svg>
        <p className="mt-2 text-3xl text-[var(--accent)]" style={{ fontFamily: "var(--font-hand)" }}>
          Pequita
        </p>
        <h1 className="mt-1 text-2xl">El taller de cartas</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Un rincón privado. Escribe tu clave para entrar.
        </p>
      </div>

      <Input
        type="password"
        label="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        autoFocus
        required
      />

      {error && (
        <p className="mt-3 text-sm text-[var(--accent)]">{error}</p>
      )}

      <Button type="submit" disabled={loading} className="mt-6 w-full">
        {loading ? "Entrando…" : "Entrar"}
      </Button>
    </motion.form>
  );
}
