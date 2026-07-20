import type { Metadata } from "next";
import { PageTransition } from "@/components/layout/PageTransition";
import {
  Cormorant_Garamond,
  Nunito,
  Caveat,
  Dancing_Script,
  Patrick_Hand,
  Amatic_SC,
  Fredericka_the_Great,
  Limelight,
} from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/site";

// Serif decorativa para títulos y branding
const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Sans limpia para la interfaz
const nunito = Nunito({
  variable: "--font-sans",
  subsets: ["latin"],
});

// Manuscrita para el contenido de las cartas
const caveat = Caveat({
  variable: "--font-hand",
  subsets: ["latin"],
});

// Manuscrita elegante, de pluma
const dancing = Dancing_Script({
  variable: "--font-hand2",
  subsets: ["latin"],
});

// Manuscrita redonda e infantil, muy legible
const patrick = Patrick_Hand({
  variable: "--font-hand3",
  subsets: ["latin"],
  weight: "400",
});

// Display de trazos finos, como letrero dibujado a mano
const amatic = Amatic_SC({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "700"],
});

// Rotulado a lápiz (bosquejo) para títulos grandes
const fredericka = Fredericka_the_Great({
  variable: "--font-sketch",
  subsets: ["latin"],
  weight: "400",
});

// Cartel de feria años 40 para rótulos cortos
const limelight = Limelight({
  variable: "--font-deco",
  subsets: ["latin"],
  weight: "400",
});

// URL base para que las imágenes OG y los enlaces se resuelvan absolutos al
// compartir (WhatsApp, etc.). En Vercel se usa el dominio de producción.
const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: `Pequita — ${SITE.inviteTitle}`,
    template: "%s · Pequita",
  },
  description: SITE.inviteSubtitle,
  // Regalo privado: fuera de los índices de búsqueda (refuerza a app/robots.ts).
  robots: { index: false, follow: false },
  openGraph: {
    title: `Una carta para ${SITE.recipientName}`,
    description: SITE.inviteSubtitle,
    type: "website",
    locale: "es_ES",
    siteName: "Pequita",
  },
  twitter: {
    card: "summary_large_image",
    title: `Una carta para ${SITE.recipientName}`,
    description: SITE.inviteSubtitle,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${cormorant.variable} ${nunito.variable} ${caveat.variable} ${dancing.variable} ${patrick.variable} ${amatic.variable} ${fredericka.variable} ${limelight.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
