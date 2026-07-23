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
};

export default nextConfig;
