import type { Metadata } from "next";
import Link from "next/link";
import {
  Container,
  DataUnavailable,
  PageHeader,
  Section,
  StatGrid,
  StatTile,
} from "@/components/ui";
import { getAdminState } from "@/lib/admin-session";
import { apiTry } from "@/lib/api/client";
import type { UsageSummary } from "@/lib/api/types";
import { formatDateTime, formatNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Uso do site",
  robots: { index: false, follow: false },
};

const PERIODS = [7, 30, 90, 365] as const;
const SECTION_LABEL: Record<string, string> = {
  inicio: "Página inicial",
  cadastro: "Cadastro",
  entrar: "Login",
  painel: "Painel",
  estados: "Estados",
  usinas: "Usinas",
  comparar: "Comparar",
  relatorios: "Relatórios",
  analises: "Análises",
  conta: "Conta",
  metodologia: "Metodologia",
  privacidade: "Privacidade",
  newsletter: "Newsletter",
  outros: "Outros",
};
const ENTITY_LABEL: Record<string, string> = {
  state: "Estados mais consultados",
  plant: "Usinas mais consultadas",
  report: "Relatórios mais lidos",
};

function Table({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  if (rows.length === 0) return <p className="text-muted text-sm">Sem dados no período.</p>;
  return (
    <div className="border-grid bg-surface overflow-x-auto rounded-xl border">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-muted border-grid border-b text-left">
            {head.map((name, index) => (
              <th key={name} className={`px-3 py-2 font-medium ${index > 0 ? "text-right" : ""}`}>
                {name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-grid border-b last:border-0">
              {row.map((cell, index) => (
                <td key={index} className={`px-3 py-2 ${index > 0 ? "tabular text-right" : ""}`}>
                  {typeof cell === "number" ? formatNumber(cell, 0) : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function UsagePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const state = await getAdminState();
  if (state.kind !== "admin") {
    return (
      <Container>
        <PageHeader title="Uso do site" />
        <DataUnavailable title="Acesso restrito">
          Entre na{" "}
          <Link href="/admin" className="underline">
            área administrativa
          </Link>{" "}
          com uma conta do grupo admin para ver as estatísticas.
        </DataUnavailable>
      </Container>
    );
  }

  const raw = (await searchParams).dias;
  const requested = Number(Array.isArray(raw) ? raw[0] : raw);
  const days = PERIODS.find((value) => value === requested) ?? 30;
  const result = await apiTry<UsageSummary>(`/v1/admin/usage/summary?days=${days}`, {
    accessToken: state.accessToken,
  });

  return (
    <Container>
      <header className="pt-8 pb-4 sm:pt-10">
        <p className="text-accent text-xs font-semibold tracking-[0.14em] uppercase">
          Administração
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Uso do site</h1>
        <nav aria-label="Período" className="mt-4 flex flex-wrap items-center gap-2">
          {PERIODS.map((value) => (
            <Link
              key={value}
              href={`/admin/uso?dias=${value}`}
              aria-current={value === days ? "page" : undefined}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                value === days
                  ? "border-accent bg-accent text-on-accent"
                  : "border-line bg-surface hover:border-accent"
              }`}
            >
              {value} dias
            </Link>
          ))}
          <a
            href={`/admin/uso/export?dias=${days}`}
            className="text-accent ml-2 text-sm font-medium underline"
          >
            Baixar eventos (CSV)
          </a>
        </nav>
      </header>

      {!result.ok ? (
        <DataUnavailable title="Não foi possível carregar as estatísticas" />
      ) : (
        <div className="space-y-2 pb-12">
          <p className="text-ink-2 text-sm">
            De {formatDateTime(result.data.start)} a {formatDateTime(result.data.end)}. Robôs ficam
            de fora.
          </p>
          <Section id="totals" title="Visão geral">
            <StatGrid>
              <StatTile
                highlight
                label="Membros ativos"
                value={formatNumber(result.data.totals.members_active, 0)}
              />
              <StatTile
                label="Novos cadastros"
                value={formatNumber(result.data.totals.new_members, 0)}
              />
              <StatTile
                label="Páginas vistas"
                value={formatNumber(result.data.totals.page_views, 0)}
              />
              <StatTile
                label="Visitantes únicos"
                value={formatNumber(result.data.totals.visitors, 0)}
              />
            </StatGrid>
          </Section>

          <Section id="funnel" title="Funil de cadastro">
            <Table
              head={["Etapa", "Pessoas"]}
              rows={result.data.funnel.map((step) => [step.step, step.count])}
            />
          </Section>

          <Section id="sections" title="Menus mais usados">
            <Table
              head={["Menu", "Visualizações", "Membros"]}
              rows={result.data.sections.map((item) => [
                SECTION_LABEL[item.section] ?? item.section,
                item.views,
                item.members,
              ])}
            />
          </Section>

          <Section id="entities" title="O que consultam">
            <div className="grid gap-6 lg:grid-cols-3">
              {(["state", "plant", "report"] as const).map((type) => (
                <div key={type}>
                  <h3 className="mb-2 font-semibold">{ENTITY_LABEL[type]}</h3>
                  <Table
                    head={["Item", "Vistas", "Membros"]}
                    rows={result.data.entities
                      .filter((item) => item.entity_type === type)
                      .map((item) => [item.entity_id, item.views, item.members])}
                  />
                </div>
              ))}
            </div>
          </Section>

          <Section id="behavior" title="Buscas, comparações e interações">
            <div className="grid gap-6 lg:grid-cols-3">
              <div>
                <h3 className="mb-2 font-semibold">Buscas de usinas</h3>
                <Table
                  head={["Termo", "Vezes"]}
                  rows={result.data.searches.map((item) => [item.name, item.count])}
                />
              </div>
              <div>
                <h3 className="mb-2 font-semibold">Itens mais comparados</h3>
                <Table
                  head={["Item", "Vezes"]}
                  rows={result.data.compared.map((item) => [item.name, item.count])}
                />
              </div>
              <div>
                <h3 className="mb-2 font-semibold">Ações na tela</h3>
                <Table
                  head={["Ação", "Vezes"]}
                  rows={result.data.interactions.map((item) => [item.name, item.count])}
                />
              </div>
            </div>
          </Section>

          <Section id="roles" title="Quem usa">
            <Table
              head={["Perfil", "Segmento", "Membros", "Eventos"]}
              rows={result.data.roles.map((item) => [
                item.role ?? "—",
                item.segment ?? "—",
                item.members,
                item.events,
              ])}
            />
          </Section>

          <Section
            id="leads"
            title="Potenciais clientes ativos"
            description="Leads quentes e mornos que usaram o site no período."
          >
            <Table
              head={["Nome", "Empresa", "E-mail", "Nota", "Eventos", "Último acesso"]}
              rows={result.data.active_leads.map((lead) => [
                lead.name,
                lead.organization ?? "—",
                lead.email,
                lead.lead_score,
                lead.events,
                lead.last_seen ? formatDateTime(lead.last_seen) : "—",
              ])}
            />
          </Section>

          <Section id="daily" title="Dia a dia">
            <Table
              head={["Dia", "Páginas vistas", "Interações", "Membros"]}
              rows={result.data.daily.map((item) => [
                item.day,
                item.page_views,
                item.interactions,
                item.members,
              ])}
            />
          </Section>
        </div>
      )}
    </Container>
  );
}
