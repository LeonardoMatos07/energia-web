import type { Metadata } from "next";
import Link from "next/link";
import { Container, DataUnavailable, PageHeader, Section } from "@/components/ui";
import { getAdminState } from "@/lib/admin-session";
import { apiTry } from "@/lib/api/client";
import type { AdminReportListResponse, LoadRunListResponse, LoadRunStatus } from "@/lib/api/types";
import { formatDateTime, formatShortMonth, formatNumber } from "@/lib/format";
import { loginAction, logoutAction, revalidateAction, saveReportAction } from "./actions";
import { ReportForm, RevalidateForm } from "./admin-forms";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Administração",
  robots: { index: false, follow: false },
};

const STATUS_LABEL: Record<LoadRunStatus, string> = {
  success: "✓ Sucesso",
  failed: "✕ Falha",
  running: "… Em andamento",
};

function Button({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="submit"
      className="bg-accent text-on-accent hover:bg-accent-strong rounded-md px-4 py-2 font-semibold"
    >
      {children}
    </button>
  );
}

function previousMonth(): string {
  const now = new Date();
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  return d.toISOString().slice(0, 7);
}

export default async function AdminPage() {
  const state = await getAdminState();

  if (state.kind === "not-configured") {
    return (
      <Container>
        <PageHeader title="Administração" />
        <DataUnavailable title="Autenticação não configurada">
          Este ambiente não tem as variáveis do Cognito (AUTH_SECRET, AUTH_COGNITO_ID,
          AUTH_COGNITO_SECRET, AUTH_COGNITO_ISSUER). Configure-as no <code>.env.local</code> para
          usar a área administrativa. O portal público funciona normalmente sem elas.
        </DataUnavailable>
      </Container>
    );
  }

  if (state.kind === "anonymous" || state.kind === "expired") {
    return (
      <Container>
        <PageHeader title="Administração">
          <p>
            {state.kind === "expired"
              ? "Sua sessão expirou. Entre novamente."
              : "Área restrita à equipe. Entre com sua conta (login com MFA)."}
          </p>
        </PageHeader>
        <form action={loginAction}>
          <Button>Entrar com Cognito</Button>
        </form>
      </Container>
    );
  }

  if (state.kind === "forbidden") {
    return (
      <Container>
        <PageHeader title="Administração">
          <p>
            A conta {state.email ?? ""} não pertence ao grupo <code>admin</code>.
          </p>
        </PageHeader>
        <form action={logoutAction}>
          <Button>Sair</Button>
        </form>
      </Container>
    );
  }

  const [loadRuns, reports] = await Promise.all([
    apiTry<LoadRunListResponse>("/v1/admin/load-runs?limit=50", { accessToken: state.accessToken }),
    apiTry<AdminReportListResponse>("/v1/admin/reports", { accessToken: state.accessToken }),
  ]);

  return (
    <Container>
      <PageHeader title="Administração">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span>Conectado como {state.email}</span>
          <Link href="/admin/uso" className="underline">
            Uso do site
          </Link>
          <Link href="/admin/noticias" className="underline">
            Moderação de notícias
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="underline">
              Sair
            </button>
          </form>
        </div>
      </PageHeader>

      <Section id="cache" title="Cache">
        <RevalidateForm action={revalidateAction} />
      </Section>

      <Section id="load-runs" title="Cargas do pipeline" description="Últimas 50 execuções.">
        {!loadRuns.ok ? (
          <DataUnavailable title="Não foi possível carregar as cargas">
            {loadRuns.error.detail}
          </DataUnavailable>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-[var(--color-grid)] bg-[var(--color-surface)]">
            <table className="tabular w-full min-w-[720px] text-left text-sm">
              <caption className="sr-only">Execuções do pipeline</caption>
              <thead>
                <tr className="border-b border-[var(--color-line)]">
                  {["Início", "Dataset", "Período", "Status", "Linhas", "Fim", "Detalhe"].map(
                    (h) => (
                      <th key={h} scope="col" className="px-3 py-2 font-semibold">
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {loadRuns.data.items.map((c) => (
                  <tr key={c.id} className="border-b border-[var(--color-grid)] align-top">
                    <td className="px-3 py-2 whitespace-nowrap">{formatDateTime(c.started_at)}</td>
                    <td className="px-3 py-2">{c.dataset}</td>
                    <td className="px-3 py-2">{formatShortMonth(c.period)}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {STATUS_LABEL[c.status] ?? c.status}
                    </td>
                    <td className="px-3 py-2 text-right">{formatNumber(c.row_count, 0)}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{formatDateTime(c.finished_at)}</td>
                    <td className="max-w-xs px-3 py-2 break-words text-[var(--color-ink-2)]">
                      {c.detail}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <Section id="reports" title="Relatórios">
        {!reports.ok ? (
          <DataUnavailable title="Não foi possível carregar os relatórios">
            {reports.error.detail}
          </DataUnavailable>
        ) : reports.data.items.length === 0 ? (
          <p className="text-sm text-[var(--color-ink-2)]">Nenhum relatório ainda.</p>
        ) : (
          <ul className="divide-y divide-[var(--color-grid)] rounded-lg border border-[var(--color-grid)] bg-[var(--color-surface)]">
            {reports.data.items.map((r) => (
              <li
                key={r.slug}
                className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-2 text-sm"
              >
                <span>
                  <strong>{r.title}</strong>{" "}
                  <span className="text-[var(--color-muted)]">
                    ({formatShortMonth(r.month)} · {r.slug})
                  </span>
                </span>
                {r.published_at ? (
                  <Link
                    href={`/relatorios/${r.slug}`}
                    className="text-[var(--color-accent)] underline"
                  >
                    Publicado em {formatDateTime(r.published_at)}
                  </Link>
                ) : (
                  <span className="text-[var(--color-muted)]">Rascunho</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section
        id="new-report"
        title="Criar ou atualizar relatório"
        description="Salvar com um slug existente atualiza aquele relatório. Sem slug, ele é gerado a partir do título."
      >
        <ReportForm action={saveReportAction} defaultMonth={previousMonth()} />
      </Section>
    </Container>
  );
}
