import Link from "next/link";
import { NewsAttribution } from "@/components/news/news-attribution";
import { Card, DataUnavailable } from "@/components/ui";
import { getNews } from "@/lib/api/queries";

/** The latest headlines, each with the attribution the news section always shows. */
export async function NewsBlock({ limit = 5 }: { limit?: number }) {
  const news = await getNews({ limit });
  if (!news.ok) return <DataUnavailable title="Notícias indisponíveis" />;
  if (news.data.items.length === 0) {
    return (
      <p className="text-ink-2 text-sm">
        Sem notícias recentes.{" "}
        <Link href="/noticias/fontes" className="text-accent underline">
          Veja as fontes que acompanhamos
        </Link>
        .
      </p>
    );
  }
  return (
    <ul className="space-y-3">
      {news.data.items.slice(0, limit).map((item) => (
        <li key={item.id}>
          <Card className="p-4">
            <h3 className="leading-snug font-semibold">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent"
              >
                {item.title}
              </a>
            </h3>
            <div className="mt-2">
              <NewsAttribution item={item} />
            </div>
            {item.has_editor_note ? (
              <p className="mt-2 text-sm">
                <Link href={`/noticias/${item.id}`} className="text-accent underline">
                  Nota do Spillway
                </Link>
              </p>
            ) : null}
          </Card>
        </li>
      ))}
    </ul>
  );
}
