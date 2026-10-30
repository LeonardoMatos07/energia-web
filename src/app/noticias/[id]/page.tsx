import Link from "next/link";
import { notFound } from "next/navigation";
import { NewsAttribution } from "@/components/news/news-attribution";
import { Card, Container, PageHeader } from "@/components/ui";
import { getNewsItem } from "@/lib/api/queries";
import { formatDate } from "@/lib/format";
import { pageMetadata } from "@/lib/metadata";
import { topicLabel } from "@/lib/news";

type Params = Promise<{ id: string }>;

/** Only items with a Spillway note have a page of their own; the others link to the source. */
async function loadItem(rawId: string) {
  if (!/^\d+$/.test(rawId)) return null;
  const result = await getNewsItem(Number(rawId));
  if (!result.ok || !result.data.has_editor_note || !result.data.editor_note) return null;
  return result.data;
}

export async function generateMetadata({ params }: { params: Params }) {
  const item = await loadItem((await params).id);
  if (!item) return pageMetadata({ title: "Notícia", description: "Notícia", path: "/noticias" });
  return pageMetadata({
    title: item.title,
    description: item.editor_note?.slice(0, 160) ?? item.title,
    path: `/noticias/${item.id}`,
  });
}

export default async function NewsItemPage({ params }: { params: Params }) {
  const item = await loadItem((await params).id);
  if (!item) notFound();

  return (
    <Container>
      <PageHeader eyebrow="Notícia" title={item.title} />

      <Card as="section" className="p-5">
        {item.summary ? <p className="text-ink-2 text-base leading-7">{item.summary}</p> : null}
        <div className="mt-3">
          <NewsAttribution item={item} />
        </div>
        <p className="mt-3 text-sm">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline"
          >
            Ler a matéria completa na fonte
          </a>
        </p>
      </Card>

      <aside
        aria-label="Nota do Spillway"
        className="border-accent bg-accent-soft/40 mt-6 rounded-2xl border-l-4 p-5"
      >
        <p className="text-accent text-xs font-semibold tracking-[0.14em] uppercase">
          Nota do Spillway
        </p>
        <p className="mt-2 text-base leading-7 whitespace-pre-line">{item.editor_note}</p>
        <p className="text-muted mt-3 text-xs">
          Comentário nosso, não faz parte do texto da fonte
          {item.editor_note_at ? ` · ${formatDate(item.editor_note_at)}` : ""}.
        </p>
        {item.related_links.length > 0 ? (
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
            {item.related_links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
        <ul className="mt-3 flex flex-wrap gap-2 text-xs" aria-label="Temas">
          {item.topics.map((slug) => (
            <li key={slug} className="bg-surface-2 text-ink-2 rounded-full px-3 py-1">
              {topicLabel(slug)}
            </li>
          ))}
        </ul>
      </aside>
    </Container>
  );
}
