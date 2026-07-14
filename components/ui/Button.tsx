"use client";

import { forwardRef } from "react";
import { clsx } from "clsx";
import { motion, type HTMLMotionProps } from "framer-motion";

type Variant = "primary" | "ghost" | "outline";

type Props = HTMLMotionProps<"button"> & {
  variant?: Variant;
};

const styles: Record<Variant, string> = {
  primary:
    "bg-[var(--accent)] text-white shadow-sm hover:brightness-110 disabled:opacity-50",
  outline:
    "border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:border-[var(--accent-soft)]",
  ghost: "text-[var(--foreground)] hover:bg-black/5",
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
