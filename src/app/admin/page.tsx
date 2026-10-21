import type { Metadata } from "next";
import Link from "next/link";
import { Container, DataUnavailable, PageHeader, Section } from "@/components/ui";
import { getAdminState } from "@/lib/admin-session";
import { apiTry } from "@/lib/api/client";
import type { AdminRelatoriosResposta, CargasResposta, StatusCarga } from "@/lib/api/types";
import { formatDataHora, formatMesCurto, formatNumber } from "@/lib/format";
import { loginAction, logoutAction, revalidarAction, saveRelatorioAction } from "./actions";
import { RelatorioForm, RevalidarForm } from "./admin-forms";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Administração",
  robots: { index: false, follow: false },
};

const STATUS_LABEL: Record<StatusCarga, string> = {
  sucesso: "✓ Sucesso",
  falha: "✕ Falha",
  em_andamento: "… Em andamento",
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

  const [cargas, relatorios] = await Promise.all([
    apiTry<CargasResposta>("/v1/admin/cargas?limite=50", { accessToken: state.accessToken }),
    apiTry<AdminRelatoriosResposta>("/v1/admin/relatorios", { accessToken: state.accessToken }),
  ]);

  return (
    <Container>
      <PageHeader title="Administração">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span>Conectado como {state.email}</span>
          <form action={logoutAction}>
            <button type="submit" className="underline">
              Sair
            </button>
          </form>
        </div>
      </PageHeader>

      <Section id="cache" title="Cache">
        <RevalidarForm action={revalidarAction} />
      </Section>

      <Section id="cargas" title="Cargas do pipeline" description="Últimas 50 execuções.">
        {!cargas.ok ? (
          <DataUnavailable title="Não foi possível carregar as cargas">
            {cargas.error.detail}
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
                {cargas.data.itens.map((c) => (
                  <tr key={c.id} className="border-b border-[var(--color-grid)] align-top">
                    <td className="px-3 py-2 whitespace-nowrap">{formatDataHora(c.inicio)}</td>
                    <td className="px-3 py-2">{c.dataset}</td>
                    <td className="px-3 py-2">{formatMesCurto(c.periodo)}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {STATUS_LABEL[c.status] ?? c.status}
                    </td>
                    <td className="px-3 py-2 text-right">{formatNumber(c.linhas, 0)}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{formatDataHora(c.fim)}</td>
                    <td className="max-w-xs px-3 py-2 break-words text-[var(--color-ink-2)]">
                      {c.detalhe}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <Section id="relatorios" title="Relatórios">
        {!relatorios.ok ? (
          <DataUnavailable title="Não foi possível carregar os relatórios">
            {relatorios.error.detail}
          </DataUnavailable>
        ) : relatorios.data.itens.length === 0 ? (
          <p className="text-sm text-[var(--color-ink-2)]">Nenhum relatório ainda.</p>
        ) : (
          <ul className="divide-y divide-[var(--color-grid)] rounded-lg border border-[var(--color-grid)] bg-[var(--color-surface)]">
            {relatorios.data.itens.map((r) => (
              <li
                key={r.slug}
                className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-2 text-sm"
              >
                <span>
                  <strong>{r.titulo}</strong>{" "}
                  <span className="text-[var(--color-muted)]">
                    ({formatMesCurto(r.mes)} · {r.slug})
                  </span>
                </span>
                {r.publicado_em ? (
                  <Link
                    href={`/relatorios/${r.slug}`}
                    className="text-[var(--color-accent)] underline"
                  >
                    Publicado em {formatDataHora(r.publicado_em)}
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
        id="novo-relatorio"
        title="Criar ou atualizar relatório"
        description="Salvar com um slug existente atualiza aquele relatório. Sem slug, ele é gerado a partir do título."
      >
        <RelatorioForm action={saveRelatorioAction} defaultMes={previousMonth()} />
      </Section>
    </Container>
  );
}
