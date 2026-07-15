"use client";

import { forwardRef } from "react";
import { clsx } from "clsx";
import { motion, type HTMLMotionProps } from "framer-motion";

type Variant = "primary" | "ghost" | "outline";

type Props = HTMLMotionProps<"button"> & {
  variant?: Variant;
};

// Botones cartoon 40s: contorno de tinta y sombra dura desplazada.
const styles: Record<Variant, string> = {
  primary:
    "border-2 border-[var(--accent-deep)] bg-[var(--accent)] text-[var(--night-ink,#f6e3c8)] shadow-[3px_4px_0_var(--accent-deep)] hover:brightness-110 disabled:opacity-50",
  outline:
    "border-2 border-[var(--foreground)] bg-[var(--surface)] text-[var(--foreground)] shadow-[3px_4px_0_rgba(124,27,34,0.3)] hover:border-[var(--accent)]",
  ghost: "text-[var(--foreground)] hover:bg-[var(--accent)]/10",
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
