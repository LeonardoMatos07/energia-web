import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { MonthlyChart } from "@/components/charts/monthly-chart";
import { GERACAO_COLORS, SERIES } from "@/components/charts/palette";
import { JsonLd } from "@/components/json-ld";
import { ReasonBreakdown, sumMotivos } from "@/components/reason-breakdown";
import {
  Badge,
  Container,
  DataUnavailable,
  Notice,
  PageHeader,
  Section,
  StatGrid,
  StatTile,
} from "@/components/ui";
import { getUsina } from "@/lib/api/queries";
import type { CurtailmentMensalUsina, UsinaResumo } from "@/lib/api/types";
import {
  EMPTY,
  formatBRLCompact,
  formatData,
  formatEnergy,
  formatFonte,
  formatMesCurto,
  formatMesLongo,
  formatNumber,
  formatPercent,
} from "@/lib/format";
import { findEstado, nomeSubsistema } from "@/lib/geo";
import { pageMetadata } from "@/lib/metadata";
import { normalizeMes, pickEnergyUnit, sortByMes } from "@/lib/series";
import { datasetJsonLd, temporalCoverage } from "@/lib/structured-data";

export const revalidate = 3600;

// Thousands of plants: none are prebuilt, each page is rendered on first request and cached.
export function generateStaticParams() {
  return [];
}

type Params = { slug: string };

const BASE_PRECO_LABEL: Record<string, string> = {
  PLD: "PLD",
  CMO: "CMO",
  PLD_FILLED: "PLD (com lacunas preenchidas)",
  CMO_FILLED: "CMO (com lacunas preenchidas)",
};

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const result = await getUsina(slug);
  if (!result.ok) {
    return result.error.isNotFound
      ? { title: "Usina não encontrada", robots: { index: false } }
      : { title: "Usina", robots: { index: false } };
  }
  const { usina } = result.data;
  const estado = findEstado(usina.uf);
  const tipo = usina.tipo === "conjunto" ? "Conjunto" : "Usina";
  return pageMetadata({
    title: `${usina.nome} — curtailment ${formatFonte(usina.fonte).toLowerCase()}`,
    description: `${tipo} ${formatFonte(usina.fonte).toLowerCase()} em ${estado?.nome ?? usina.uf}: energia cortada pelo ONS mês a mês, motivos da restrição e comparação com a média do estado.`,
    path: `/usinas/${usina.slug}`,
  });
}

function Dado({ termo, children }: { termo: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:gap-4">
      <dt className="text-ink-2 text-sm sm:w-48 sm:shrink-0">{termo}</dt>
      <dd className="text-sm font-medium break-words">{children ?? EMPTY}</dd>
    </div>
  );
}

function UsinaLinkList({ usinas }: { usinas: UsinaResumo[] }) {
  return (
    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {usinas.map((u) => (
        <li key={u.id}>
          <Link
            href={`/usinas/${u.slug}`}
            className="group border-grid bg-surface hover:border-accent flex items-center justify-between gap-3 rounded-xl border px-4 py-3"
          >
            <span>
              <span className="group-hover:text-accent font-medium">{u.nome}</span>
              <span className="text-muted block text-xs">
                {u.potencia_mw !== null
                  ? `${formatNumber(u.potencia_mw, 1)} MW`
                  : "Potência não informada"}
              </span>
            </span>
            <span aria-hidden className="text-muted group-hover:text-accent">
              →
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function comparacaoTexto(ultimo: CurtailmentMensalUsina, uf: string): string | null {
  const usina = ultimo.percentual_corte;
  const media = ultimo.percentual_corte_medio_uf;
  if (usina === null || media === null) return null;
  const diff = usina - media;
  if (Math.abs(diff) < 0.5) return `Em linha com a média das usinas da mesma fonte em ${uf}.`;
  return diff > 0
    ? `${formatNumber(diff, 1)} pontos percentuais acima da média das usinas da mesma fonte em ${uf}.`
    : `${formatNumber(-diff, 1)} pontos percentuais abaixo da média das usinas da mesma fonte em ${uf}.`;
}

export default async function UsinaPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const result = await getUsina(slug);

  if (!result.ok) {
    if (result.error.isNotFound) notFound();
    return (
      <Container>
        <PageHeader
          eyebrow={
            <Link href="/usinas" className="underline">
              Usinas
            </Link>
          }
          title="Usina"
        >
          <p>Não foi possível carregar os dados desta usina agora.</p>
        </PageHeader>
        <DataUnavailable />
      </Container>
    );
  }

  const { usina, conjunto, usinas_do_conjunto } = result.data;
  const serie = sortByMes(result.data.serie);
  const ultimo = serie.at(-1);
  const estado = findEstado(usina.uf);
  const isConjunto = usina.tipo === "conjunto";

  const energy = pickEnergyUnit(
    Math.max(0, ...serie.map((r) => r.geracao_verificada_mwh + r.energia_cortada_mwh)),
  );
  const geracaoRows = serie.map((r) => ({
    mes: normalizeMes(r.mes),
    verificada: r.geracao_verificada_mwh / energy.divisor,
    cortada: r.energia_cortada_mwh / energy.divisor,
  }));
  const comparacaoRows = serie.map((r) => ({
    mes: normalizeMes(r.mes),
    usina: r.percentual_corte,
    media_uf: r.percentual_corte_medio_uf,
  }));
  const totalCortado = serie.reduce((s, r) => s + r.energia_cortada_mwh, 0);
  const totalPerda = serie.reduce((s, r) => s + (r.perda_estimada_brl ?? 0), 0);
  const temPerda = serie.some((r) => r.perda_estimada_brl !== null);

  return (
    <Container>
      <JsonLd
        data={datasetJsonLd({
          name: `Curtailment mensal — ${usina.nome}`,
          description: `Geração verificada, energia cortada por restrição do ONS e perda estimada, por mês, ${isConjunto ? "do conjunto" : "da usina"} ${usina.nome} (${usina.uf}).`,
          path: `/usinas/${usina.slug}`,
          temporalCoverage: temporalCoverage(serie.map((r) => normalizeMes(r.mes))),
          spatialCoverage: `${estado?.nome ?? usina.uf}, Brasil`,
          keywords: [usina.nome, usina.uf],
        })}
      />
      <PageHeader
        eyebrow={
          <>
            <Link href="/usinas" className="hover:underline">
              Usinas
            </Link>{" "}
            /{" "}
            <Link href={`/estados/${usina.uf.toLowerCase()}`} className="hover:underline">
              {estado?.nome ?? usina.uf}
            </Link>
          </>
        }
        title={usina.nome}
      >
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Badge>{isConjunto ? "Conjunto de usinas" : "Usina"}</Badge>
          <Badge>{formatFonte(usina.fonte)}</Badge>
          <Badge>{usina.uf}</Badge>
          <Badge>Subsistema {nomeSubsistema(usina.subsistema)}</Badge>
        </div>
        {conjunto ? (
          <p className="text-ink-2 mt-3 text-sm">
            Faz parte do conjunto{" "}
            <Link
              href={`/usinas/${conjunto.slug}`}
              className="text-[var(--color-accent)] underline"
            >
              {conjunto.nome}
            </Link>
            . O corte desta usina é uma parte do corte oficial do conjunto.
          </p>
        ) : null}
      </PageHeader>

      {!ultimo ? (
        <DataUnavailable title="Sem histórico de corte">
          Ainda não há registros mensais de restrição para{" "}
          {isConjunto ? "este conjunto" : "esta usina"}.
        </DataUnavailable>
      ) : (
        <>
          <Section id="ultimo-mes" title={`Último mês com dados: ${formatMesLongo(ultimo.mes)}`}>
            <StatGrid>
              <StatTile
                highlight
                label="Energia cortada"
                value={formatEnergy(ultimo.energia_cortada_mwh)}
              />
              <StatTile
                label="% de corte"
                value={formatPercent(ultimo.percentual_corte)}
                note={`média ${formatFonte(usina.fonte).toLowerCase()} ${usina.uf}: ${formatPercent(ultimo.percentual_corte_medio_uf)}`}
              />
              <StatTile
                label="Perda estimada"
                value={formatBRLCompact(ultimo.perda_estimada_brl)}
                note={
                  ultimo.base_preco
                    ? `base: ${BASE_PRECO_LABEL[ultimo.base_preco] ?? ultimo.base_preco}`
                    : "estimativa"
                }
              />
              <StatTile
                label="Horas com restrição"
                value={`${formatNumber(ultimo.horas_restritas, 1)} h`}
                note={
                  ultimo.posicao_nacional
                    ? `${ultimo.posicao_nacional}º no Brasil · ${ultimo.posicao_uf ?? EMPTY}º em ${usina.uf}`
                    : undefined
                }
              />
            </StatGrid>
            <p className="text-ink-2 mt-3 text-sm">
              No período todo: {formatEnergy(totalCortado)} cortados
              {temPerda ? `, perda estimada de ${formatBRLCompact(totalPerda)}` : ""}.
            </p>
          </Section>

          <Section
            id="historico"
            title="Histórico mensal"
            description="Geração verificada é o que a usina efetivamente entregou; energia cortada é o que ela deixou de gerar por ordem do ONS."
          >
            <MonthlyChart
              title={`Geração verificada e energia cortada por mês (${energy.unit})`}
              rows={geracaoRows}
              unit={energy.unit}
              digits={energy.digits}
              series={[
                {
                  key: "verificada",
                  label: "Geração verificada",
                  color: GERACAO_COLORS.verificada,
                },
                { key: "cortada", label: "Energia cortada", color: GERACAO_COLORS.cortada },
              ]}
            />
          </Section>

          <Section
            id="comparacao"
            title={`Comparação com a média de ${estado?.nome ?? usina.uf}`}
            description={comparacaoTexto(ultimo, usina.uf) ?? undefined}
          >
            <MonthlyChart
              title="% de corte por mês: esta usina × média do estado (%)"
              description={`Média das usinas ${usina.fonte === "solar" ? "solares" : "eólicas"} de ${usina.uf} no mês.`}
              kind="line"
              rows={comparacaoRows}
              unit="%"
              digits={1}
              height={260}
              series={[
                {
                  key: "usina",
                  label: isConjunto ? "Este conjunto" : "Esta usina",
                  color: SERIES.s1,
                },
                { key: "media_uf", label: `Média ${usina.uf}`, color: SERIES.s2 },
              ]}
            />
          </Section>

          <Section id="motivos" title="Por que a energia foi cortada">
            <ReasonBreakdown
              periodo={sumMotivos(serie)}
              ultimoMes={sumMotivos([ultimo])}
              ultimoMesLabel={formatMesCurto(ultimo.mes)}
            />
          </Section>
        </>
      )}

      {isConjunto && usinas_do_conjunto.length > 0 ? (
        <Section
          id="usinas-do-conjunto"
          title={`Usinas deste conjunto (${usinas_do_conjunto.length})`}
          description="O ONS informa o corte do conjunto; nós o distribuímos entre as usinas proporcionalmente à perda estimada de cada uma. A soma das usinas é igual ao total do conjunto."
        >
          <UsinaLinkList usinas={usinas_do_conjunto} />
        </Section>
      ) : null}

      {!isConjunto && conjunto && usinas_do_conjunto.length > 0 ? (
        <Section id="vizinhas" title={`Outras usinas do conjunto ${conjunto.nome}`}>
          <UsinaLinkList usinas={usinas_do_conjunto.filter((u) => u.id !== usina.id)} />
        </Section>
      ) : null}

      <Section id="cadastro" title="Dados cadastrais">
        <dl className="divide-grid border-grid bg-surface shadow-card divide-y rounded-2xl border px-5">
          <Dado termo="Código ONS">{usina.id}</Dado>
          <Dado termo="Tipo">{isConjunto ? "Conjunto de usinas" : "Usina"}</Dado>
          <Dado termo="Fonte">{formatFonte(usina.fonte)}</Dado>
          <Dado termo="Estado">{estado ? `${estado.nome} (${usina.uf})` : usina.uf}</Dado>
          <Dado termo="Subsistema">{nomeSubsistema(usina.subsistema)}</Dado>
          <Dado termo="Potência">
            {usina.potencia_mw !== null ? `${formatNumber(usina.potencia_mw, 1)} MW` : null}
          </Dado>
          <Dado termo="CEG (ANEEL)">{usina.ceg}</Dado>
          <Dado termo="Ponto de conexão">{usina.ponto_conexao}</Dado>
          <Dado termo="Agente operador">{usina.agente_operador}</Dado>
          <Dado termo="Atualizado em">{formatData(usina.atualizado_em)}</Dado>
        </dl>
      </Section>

      <Notice>
        {conjunto
          ? "Os números desta usina são estimados a partir do corte oficial do conjunto a que ela pertence."
          : isConjunto
            ? "Os números do conjunto são os oficiais do ONS."
            : "Esta usina é despachada individualmente pelo ONS; os números são os oficiais."}{" "}
        A perda em R$ é uma estimativa pelo PLD, não o prejuízo contábil da usina.{" "}
        <Link href="/metodologia" className="underline">
          Veja a metodologia
        </Link>
        .
      </Notice>
    </Container>
  );
}
