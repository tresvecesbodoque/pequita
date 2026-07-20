import type { MetadataRoute } from "next";

// Regalo íntimo: nada de esto debe aparecer en buscadores. El acceso es
// siempre por enlace compartido en persona/WhatsApp, nunca por búsqueda.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", disallow: "/" },
  };
}
