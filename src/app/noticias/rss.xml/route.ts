import { getNews } from "@/lib/api/queries";
import { buildRss } from "@/lib/news";
import { getSiteUrl } from "@/lib/site";

export const revalidate = 600;

export async function GET() {
  const news = await getNews({ limit: 50 });
  if (!news.ok) {
    return new Response("Notícias indisponíveis no momento.", { status: 503 });
  }
  return new Response(buildRss(news.data.items, getSiteUrl()), {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=600",
    },
  });
}
