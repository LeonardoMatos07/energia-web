import type { MetadataRoute } from "next";
import { getReports, getPlants } from "@/lib/api/queries";
import { STATES } from "@/lib/geo";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 86400;

const PAGE_SIZE = 100;
const MAX_PAGES = 400;

async function allPlantSlugs(): Promise<string[]> {
  const slugs: string[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const result = await getPlants({ page, pageSize: PAGE_SIZE });
    if (!result.ok) break;
    slugs.push(...result.data.items.map((u) => u.slug));
    if (result.data.items.length < PAGE_SIZE || slugs.length >= result.data.total) break;
  }
  return slugs;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/painel"), changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/estados"), changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/usinas"), changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/comparar"), changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/relatorios"), changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/metodologia"), changeFrequency: "yearly", priority: 0.5 },
    { url: absoluteUrl("/privacidade"), changeFrequency: "yearly", priority: 0.2 },
  ];

  const brazilianStates: MetadataRoute.Sitemap = STATES.map((e) => ({
    url: absoluteUrl(`/estados/${e.state.toLowerCase()}`),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const [slugs, reports] = await Promise.all([allPlantSlugs(), getReports()]);

  const plants: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: absoluteUrl(`/usinas/${slug}`),
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  const reportPages: MetadataRoute.Sitemap = reports.ok
    ? reports.data.items.map((r) => ({
        url: absoluteUrl(`/relatorios/${r.slug}`),
        lastModified: r.published_at ?? undefined,
        changeFrequency: "yearly" as const,
        priority: 0.6,
      }))
    : [];

  return [...staticPages, ...brazilianStates, ...reportPages, ...plants];
}
