import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sin orígenes de red local: el preview de desarrollo se sirve solo en
  // localhost (127.0.0.1) para no exponer el proyecto en redes compartidas
  // (p. ej. la red de la universidad).
};

export default nextConfig;
