"use client";

import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";

// Transición de página global: la saliente se desvanece y la entrante llega con
// un leve deslizamiento de tinta (ease "papel"). Usa framer-motion (ya en el
// proyecto) en vez del API experimental de View Transitions de React, que no
// está disponible en esta versión de React. Respeta prefers-reduced-motion.
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();

  return (
    <motion.div
      key={pathname}
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="flex min-h-screen flex-1 flex-col"
    >
      {children}
    </motion.div>
  );
}
