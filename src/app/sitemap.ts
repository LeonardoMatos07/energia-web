import type { MetadataRoute } from "next";
import { getPlants, getReports } from "@/lib/api/queries";
import { STATES } from "@/lib/geo";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 3600;

const PAGE_SIZE = 100;
const MAX_PAGES = 400;

type Entry = MetadataRoute.Sitemap[number];

async function plantEntries(): Promise<Entry[]> {
  const entries: Entry[] = [];
  try {
    for (let page = 1; page <= MAX_PAGES; page++) {
      const result = await getPlants({ page, pageSize: PAGE_SIZE });
      if (!result.ok) return [];
      entries.push(
        ...result.data.items.map((plant) => ({
          url: absoluteUrl(`/usinas/${plant.slug}`),
          changeFrequency: "monthly" as const,
          priority: 0.5,
        })),
      );
      if (result.data.items.length < PAGE_SIZE || entries.length >= result.data.total) break;
    }
  } catch {
    return [];
  }
  return entries;
}

async function reportEntries(): Promise<Entry[]> {
  try {
    const result = await getReports();
    if (!result.ok) return [];
    return result.data.items.map((report) => ({
      url: absoluteUrl(`/relatorios/${report.slug}`),
      lastModified: report.published_at ?? undefined,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    }));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const fixedPages: Entry[] = [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/painel"), changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/estados"), changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/usinas"), changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/relatorios"), changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/metodologia"), changeFrequency: "yearly", priority: 0.5 },
    { url: absoluteUrl("/cadastro"), changeFrequency: "yearly", priority: 0.6 },
    { url: absoluteUrl("/privacidade"), changeFrequency: "yearly", priority: 0.2 },
  ];
  const states: Entry[] = STATES.map((state) => ({
    url: absoluteUrl(`/estados/${state.state.toLowerCase()}`),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));
  const [reports, plants] = await Promise.all([reportEntries(), plantEntries()]);
  return [...fixedPages, ...states, ...reports, ...plants];
}
