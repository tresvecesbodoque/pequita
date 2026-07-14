import type { Metadata } from "next";
import { Cormorant_Garamond, Nunito, Caveat } from "next/font/google";
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
      className={`${cormorant.variable} ${nunito.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
