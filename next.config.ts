import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sin orígenes de red local: el preview de desarrollo se sirve solo en
  // localhost (127.0.0.1) para no exponer el proyecto en redes compartidas
  // (p. ej. la red de la universidad).

  // Las fotos/medios viven en Cloudflare R2 (dominio público r2.dev). Sin esto,
  // next/image lanza un error de servidor al recibir un `src` de host externo.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.r2.dev" },
    ],
  },

  // El álbum se sirve ESPEJADO desde el contador (misiete), que reenvía
  // /para-ella, /carta/* y /pelicula a esta app. Ella nunca ve el dominio de
  // la app, y así tampoco la lista de deseos: el regalo sigue siendo sorpresa.
  // Para el candado del álbum (server action) esos reenvíos llegan con el
  // Origin del contador y Next los rechazaría como CSRF si no van declarados.
  experimental: {
    serverActions: {
      allowedOrigins: [
        "misiete.vercel.app",
        "dossieteshastaelsiete.vercel.app",
        "ishibonita.vercel.app",
      ],
    },
  },
};

export default nextConfig;
