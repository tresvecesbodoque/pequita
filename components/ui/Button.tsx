"use client";

import { forwardRef } from "react";
import { clsx } from "clsx";
import { motion, type HTMLMotionProps } from "framer-motion";

type Variant = "primary" | "ghost" | "outline";

type Props = HTMLMotionProps<"button"> & {
  variant?: Variant;
};

// Botones v3: oro sobre la noche. El primario es oro macizo con halo, el
// contorno es el mismo cristal que los bloques del reloj, y el fantasma solo
// habla en espaciado. Nada de sombras duras (ver DESIGN.md).
const styles: Record<Variant, string> = {
  primary:
    "border-[1.5px] border-[var(--gold)] bg-[var(--gold)] text-[var(--fondo)] shadow-[0_0_20px_-6px_var(--halo-oro)] hover:brightness-110 disabled:opacity-45 disabled:shadow-none",
  outline:
    "border-[1.5px] border-[var(--borde)] bg-[var(--cristal)] text-[var(--ink)] backdrop-blur-[4px] hover:border-[var(--borde-vivo)] hover:shadow-[0_0_20px_-6px_var(--halo-oro)] disabled:opacity-45",
  ghost:
    "border-[1.5px] border-transparent tracking-[0.14em] text-[var(--ink-tenue)] hover:text-[var(--gold)]",
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "primary", className, children, ...props },
  ref
) {
  return (
    <motion.button
      ref={ref}
      whileTap={{ scale: 0.97 }}
      whileHover={{ y: -1 }}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed",
        styles[variant],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
});
