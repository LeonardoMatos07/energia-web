import type { Metadata } from "next";
import Link from "next/link";
import { Card, Container, DataUnavailable, PageHeader } from "@/components/ui";
import { NewsAttribution } from "@/components/news/news-attribution";
import { getAdminState } from "@/lib/admin-session";
import { apiTry, withQuery } from "@/lib/api/client";
import type { AdminNewsList, NewsStatus } from "@/lib/api/types";
import { ModerationForm } from "./moderation-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Moderação de notícias",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const STATUSES: NewsStatus[] = ["published", "hidden", "removed_on_request"];

export default async function AdminNewsPage({ searchParams }: { searchParams: SearchParams }) {
  const state = await getAdminState();
  if (state.kind !== "admin") {
    return (
      <Container>
        <PageHeader title="Moderação de notícias">
          <p>
            Área restrita à equipe. <Link href="/admin">Entrar na administração</Link>.
          </p>
        </PageHeader>
      </Container>
    );
  }

  const params = await searchParams;
  const rawStatus = Array.isArray(params.status) ? params.status[0] : params.status;
  const status = STATUSES.find((s) => s === rawStatus);
  const q = (Array.isArray(params.q) ? params.q[0] : params.q)?.trim() || undefined;
  const news = await apiTry<AdminNewsList>(withQuery("/v1/admin/news", { status, q, limit: 30 }), {
    accessToken: state.accessToken,
  });

  return (
    <Container>
      <PageHeader title="Moderação de notícias">
        <p>
          Esconda um item, escreva a nota do Spillway ou ligue páginas do site. O texto da fonte
          nunca é editado aqui.
        </p>
      </PageHeader>
      <p className="mb-4 text-sm">
        <Link href="/admin" className="underline">
          Voltar à administração
        </Link>
      </p>

      <form method="get" className="mb-6 flex flex-wrap items-end gap-3" role="search">
        <label className="text-sm">
          <span className="text-ink-2 block">Situação</span>
          <select
            name="status"
            defaultValue={status ?? ""}
            className="border-grid bg-surface mt-1 rounded-md border px-3 py-2"
          >
            <option value="">Todas</option>
            <option value="published">Publicado</option>
            <option value="hidden">Escondido</option>
            <option value="removed_on_request">Removido a pedido</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="text-ink-2 block">Busca</span>
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            className="border-grid bg-surface mt-1 rounded-md border px-3 py-2"
          />
        </label>
        <button
          type="submit"
          className="bg-accent text-on-accent hover:bg-accent-strong rounded-md px-4 py-2 font-semibold"
        >
          Filtrar
        </button>
      </form>

      {!news.ok ? (
        <DataUnavailable title="Não foi possível carregar as notícias">
          {news.error.detail}
        </DataUnavailable>
      ) : (
        <div className="space-y-4">
          {news.data.items.map((item) => (
            <Card key={item.id} as="section" className="p-5">
              <h2 className="font-semibold">{item.title}</h2>
              <div className="mt-2">
                <NewsAttribution item={item} />
              </div>
              <ModerationForm item={item} />
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
}
