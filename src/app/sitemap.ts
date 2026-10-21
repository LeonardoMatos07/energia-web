import type { MetadataRoute } from "next";
import { getRelatorios, getUsinas } from "@/lib/api/queries";
import { ESTADOS } from "@/lib/geo";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 86400;

const PAGE_SIZE = 100; // API maximum for `tamanho`
const MAX_PAGES = 400; // safety cap (40k plants, under the 50k sitemap limit)

async function allPlantSlugs(): Promise<string[]> {
  const slugs: string[] = [];
  for (let pagina = 1; pagina <= MAX_PAGES; pagina++) {
    const result = await getUsinas({ pagina, tamanho: PAGE_SIZE });
    if (!result.ok) break; // tolerate API failure: keep what we have
    slugs.push(...result.data.itens.map((u) => u.slug));
    if (result.data.itens.length < PAGE_SIZE || slugs.length >= result.data.total) break;
  }
  return slugs;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/estados"), changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/usinas"), changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/relatorios"), changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/metodologia"), changeFrequency: "yearly", priority: 0.5 },
    { url: absoluteUrl("/privacidade"), changeFrequency: "yearly", priority: 0.2 },
  ];

  const estados: MetadataRoute.Sitemap = ESTADOS.map((e) => ({
    url: absoluteUrl(`/estados/${e.uf.toLowerCase()}`),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const [slugs, relatorios] = await Promise.all([allPlantSlugs(), getRelatorios()]);

  const usinas: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: absoluteUrl(`/usinas/${slug}`),
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  const reports: MetadataRoute.Sitemap = relatorios.ok
    ? relatorios.data.itens.map((r) => ({
        url: absoluteUrl(`/relatorios/${r.slug}`),
        lastModified: r.publicado_em ?? undefined,
        changeFrequency: "yearly" as const,
        priority: 0.6,
      }))
    : [];

  return [...staticPages, ...estados, ...reports, ...usinas];
}
