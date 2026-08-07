"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { leerLeidas } from "./MarcarLeida";

// El horizonte del pequeño planeta, con lo que crece en él. La planta NO es un
// adorno fijo: es la misma cuenta que la constelación, dicha de otra manera.
// Con el álbum sin abrir es un brote de nada; cada carta leída la levanta un
// poco (tallo, hojas, capullo) y, al leerlas todas, el capullo se abre en la
// rosa. Nadie se lo explica: se descubre al volver y ver que creció.
//
// Lo leído vive en localStorage (ver MarcarLeida), así que la planta crece en
// el aparato donde ella lee, y crece igual entre por el contador o por la app:
// la página es la misma, solo cambia la puerta.

type Props = { slugs: string[] };

// El horizonte pasa por (200, 64) y la planta sube desde ahí hacia el cielo
// (y menor = más alto). Se dibuja SIEMPRE a tamaño completo y se escala desde
// el suelo: crecer es agrandarse, como crece una planta de verdad. El lienzo
// deja 64 de aire encima del horizonte porque la rosa abierta ocupa 44: con el
// alto de antes se le cortaba la flor justo el día que se ganaba.
const SUELO_X = 200;
const SUELO_Y = 64;

export function BroteRosa({ slugs }: Props) {
  const [leidas, setLeidas] = useState<string[] | null>(null);

  useEffect(() => {
    setLeidas(leerLeidas());
  }, []);

  // Antes de hidratar se dibuja el brote recién nacido (p = 0): así el servidor
  // y el navegador pintan lo mismo y no hay parpadeo; si ella ya había leído,
  // la planta crece sola al llegar. Es la mejor bienvenida que sabe dar.
  const total = slugs.length;
  const leidasAqui = leidas ? slugs.filter((s) => leidas.includes(s)).length : 0;
  const p = total > 0 ? leidasAqui / total : 0;
  const completa = total > 0 && leidasAqui === total;

  // Tamaño: un brote apenas visible al principio, la planta entera al final.
  const escala = 0.3 + 0.7 * p;
  // Las hojas se despliegan en el camino; el capullo se forma en el último
  // tercio. Cada una entra sola, no todas de golpe.
  const hojaIzq = tramo(p, 0.12, 0.38);
  const hojaDer = tramo(p, 0.4, 0.66);
  const capullo = tramo(p, 0.62, 0.9);

  const suave = { duration: 1.6, ease: [0.22, 1, 0.36, 1] as const };
  const origen = `${SUELO_X}px ${SUELO_Y}px`;

  return (
    <div className="pointer-events-none relative z-10 mx-auto mt-12 max-w-md" aria-hidden>
      <svg viewBox="0 0 400 128" fill="none" className="w-full">
        {/* horizonte del planeta */}
        <path
          d="M8 124c48-38 118-60 192-60s144 22 192 60"
          stroke="var(--gold)"
          strokeOpacity="0.65"
          strokeWidth="1.6"
          strokeLinecap="round"
        />

        {/* Lo que crece en el planeta: brote → tallo con hojas → capullo → rosa */}
        <motion.g
          initial={false}
          animate={{ scale: escala }}
          transition={suave}
          style={{ transformBox: "view-box", transformOrigin: origen }}
          stroke="var(--rose)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* tallo */}
          <path d={`M${SUELO_X} ${SUELO_Y}V${SUELO_Y - 24}`} />

          {/* hoja izquierda */}
          <motion.path
            d={`M${SUELO_X} ${SUELO_Y - 10}c-6 0 -9 -3 -9.5 -7.5 5.5 -0.5 8.5 2.5 9.5 7.5z`}
            fill="var(--rose)"
            fillOpacity="0.22"
            initial={false}
            animate={{ opacity: hojaIzq, scale: 0.5 + 0.5 * hojaIzq }}
            transition={suave}
            style={{ transformBox: "view-box", transformOrigin: `${SUELO_X}px ${SUELO_Y - 10}px` }}
          />

          {/* hoja derecha */}
          <motion.path
            d={`M${SUELO_X} ${SUELO_Y - 16}c6 -0.5 9 -3.5 9 -8 -5.5 -0.5 -8.5 2.5 -9 8z`}
            fill="var(--rose)"
            fillOpacity="0.22"
            initial={false}
            animate={{ opacity: hojaDer, scale: 0.5 + 0.5 * hojaDer }}
            transition={suave}
            style={{ transformBox: "view-box", transformOrigin: `${SUELO_X}px ${SUELO_Y - 16}px` }}
          />

          {/* capullo: dos sépalos cerrados sobre la punta del tallo. Se va
              formando y desaparece justo cuando la flor lo abre. */}
          <motion.g
            initial={false}
            animate={{ opacity: completa ? 0 : capullo }}
            transition={suave}
            style={{ transformBox: "view-box", transformOrigin: `${SUELO_X}px ${SUELO_Y - 24}px` }}
          >
            <path
              d={`M${SUELO_X} ${SUELO_Y - 24}c-3 -1 -4.5 -4 -4 -7 3 0.5 5 3 4 7z`}
              fill="var(--rose)"
              fillOpacity="0.3"
            />
            <path
              d={`M${SUELO_X} ${SUELO_Y - 24}c3 -1.5 4 -4.5 3.5 -7.5 -3 0.5 -4.5 3.5 -3.5 7.5z`}
              fill="var(--rose)"
              fillOpacity="0.3"
            />
          </motion.g>

          {/* La rosa abierta: solo cuando están todas leídas. Tres capas, la
              misma rosa que asoma en el contador, y un halo tenue detrás.
              Después se mece despacio, como si respirara. */}
          {completa && (
            <motion.g
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: 1, scale: 1, rotate: [0, -2.5, 0, 2.5, 0] }}
              transition={{
                opacity: { duration: 1.2, ease: "easeOut", delay: 0.4 },
                scale: { duration: 1.6, ease: [0.22, 1, 0.36, 1], delay: 0.4 },
                rotate: { duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 },
              }}
              style={{ transformBox: "view-box", transformOrigin: `${SUELO_X}px ${SUELO_Y - 24}px` }}
            >
              <circle
                cx={SUELO_X}
                cy={SUELO_Y - 29}
                r="10"
                fill="var(--rose)"
                fillOpacity="0.1"
                stroke="none"
              />
              <path
                d={`M${SUELO_X} ${SUELO_Y - 24}c-6.5 0 -10 -5 -10 -10 0 -5.5 4.5 -10 10 -10 5.5 0 10 4.5 10 10 0 5 -3.5 10 -10 10z`}
                fill="var(--rose)"
                fillOpacity="0.2"
              />
              <path
                d={`M${SUELO_X - 5.5} ${SUELO_Y - 35.5}c0.5 -4.5 3 -7 5.5 -7 2.5 0 5 2.5 5.5 7 -0.5 4 -3 5.5 -5.5 5.5 -2.5 0 -5 -1.5 -5.5 -5.5z`}
                fill="var(--rose)"
                fillOpacity="0.28"
              />
              <path
                d={`M${SUELO_X - 2.5} ${SUELO_Y - 35.5}c0 -2 1 -3 2.5 -3 1.5 0 2.5 1 2.5 3 0 2 -1 2.5 -2.5 2.5 -1.5 0 -2.5 -0.5 -2.5 -2.5z`}
                fill="var(--rose)"
                fillOpacity="0.45"
              />
            </motion.g>
          )}
        </motion.g>

        {/* estrellas cercanas */}
        <g fill="var(--night-ink)" fillOpacity="0.8">
          <path d="M96 62l1.6 3.8 3.8 1.6-3.8 1.6L96 73l-1.6-4-3.8-1.6 3.8-1.6z" />
          <circle cx="306" cy="58" r="1.6" />
          <circle cx="132" cy="46" r="1.2" />
        </g>
      </svg>
    </div>
  );
}

// 0 antes de `desde`, 1 pasado `hasta`, y el camino suave entre medio.
function tramo(p: number, desde: number, hasta: number): number {
  return Math.max(0, Math.min(1, (p - desde) / (hasta - desde)));
}
