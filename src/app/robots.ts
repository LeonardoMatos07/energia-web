import type { MetadataRoute } from "next";
import { absoluteUrl, getSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/api/",
          "/newsletter/confirmar",
          "/newsletter/descadastrar",
          "/painel",
          "/estados",
          "/usinas",
          "/relatorios",
          "/comparar",
          "/analises",
          "/previsao",
          "/conta",
        ],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: getSiteUrl(),
  };
}
