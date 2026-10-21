import Link from "next/link";
import { ENTITY_COLORS } from "@/components/charts/palette";
import { Comparator } from "@/components/compare/comparator";
import { EntityPicker, type PickerItem } from "@/components/compare/entity-picker";
import { Card, Container, DataUnavailable, PageHeader, Section } from "@/components/ui";
import type { ApiResult } from "@/lib/api/client";
import type { StateCurtailmentResponse, SubsystemCurtailmentResponse } from "@/lib/api/types";
import { getPlant, getStateCurtailment, getSubsystemCurtailment } from "@/lib/api/queries";
import {
  parseEntities,
  parseView,
  serializeEntities,
  type CompareEntity,
  type EntityRef,
  type MonthValues,
  type SourceFilter,
} from "@/lib/compare";
import { findState, subsystemName } from "@/lib/geo";
import { pageMetadata } from "@/lib/metadata";
import { normalizeMonth } from "@/lib/series";

export const metadata = pageMetadata({
  title: "Comparar usinas, estados e subsistemas",
  description:
    "Compare quanta energia eólica e solar foi gerada e cortada em usinas, estados e subsistemas, mês a mês, em linhas, barras ou pizza.",
  path: "/comparar",
});

type SearchParams = Record<string, string | string[] | undefined>;

interface MonthlyLike {
  month: string;
  verified_generation_mwh: number;
  curtailed_mwh: number;
  curtailment_pct: number | null;
  estimated_loss_brl: number | null;
}

function toRows(series: readonly MonthlyLike[]): MonthValues[] {
  return series
    .map((row) => ({
      month: normalizeMonth(row.month),
      verified: row.verified_generation_mwh,
      curtailed: row.curtailed_mwh,
      pct: row.curtailment_pct,
      loss: row.estimated_loss_brl,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

interface Loaded {
  label: string;
  bySource: Record<SourceFilter, MonthValues[]>;
}

const SOURCE_ORDER: SourceFilter[] = ["all", "wind", "solar"];

const NO_ROWS: MonthValues[] = [];

const API_SOURCE: Record<SourceFilter, "total" | "wind" | "solar"> = {
  all: "total",
  wind: "wind",
  solar: "solar",
};

async function load(ref: EntityRef): Promise<Loaded | null> {
  if (ref.kind === "plant") {
    const result = await getPlant(ref.id);
    if (!result.ok) return null;
    const { plant, series } = result.data;
    const rows = toRows(series);
    return {
      label: `${plant.name} (${plant.state})`,
      bySource: {
        all: rows,
        wind: plant.source === "wind" ? rows : NO_ROWS,
        solar: plant.source === "solar" ? rows : NO_ROWS,
      },
    };
  }
  if (ref.kind === "state") {
    const [all, wind, solar] = await Promise.all(
      SOURCE_ORDER.map((source) => getStateCurtailment(ref.id, API_SOURCE[source])),
    );
    if (!all?.ok) return null;
    const series = (result: ApiResult<StateCurtailmentResponse> | undefined) =>
      result?.ok ? result.data.series : [];
    return {
      label: findState(ref.id)?.name ?? ref.id,
      bySource: {
        all: toRows(all.data.series),
        wind: toRows(series(wind)),
        solar: toRows(series(solar)),
      },
    };
  }
  const [all, wind, solar] = await Promise.all(
    SOURCE_ORDER.map((source) => getSubsystemCurtailment(API_SOURCE[source])),
  );
  if (!all?.ok) return null;
  const subsystemSeries = (result: ApiResult<SubsystemCurtailmentResponse> | undefined) =>
    result?.ok ? result.data.items.filter((item) => item.subsystem === ref.id) : [];
  return {
    label: subsystemName(ref.id),
    bySource: {
      all: toRows(subsystemSeries(all)),
      wind: toRows(subsystemSeries(wind)),
      solar: toRows(subsystemSeries(solar)),
    },
  };
}

const EXAMPLES = [
  { label: "Bahia × Rio Grande do Norte", refs: "e:BA,e:RN" },
  { label: "Nordeste × Sul", refs: "s:NE,s:S" },
  { label: "Eólica no RN × todo o Brasil", refs: "e:RN,s:SIN" },
];

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);
  const refs = parseEntities(first(params.itens));
  const view = parseView({
    metricas: first(params.metricas),
    modo: first(params.modo),
    grafico: first(params.grafico),
    fonte: first(params.fonte),
  });
  const loaded = await Promise.all(refs.map(load));

  const items: PickerItem[] = refs.map((ref, index) => ({
    ref,
    label: loaded[index]?.label ?? `${ref.id} (indisponível)`,
    color: ENTITY_COLORS[index] ?? ENTITY_COLORS[0]!,
  }));
  const entities: CompareEntity[] = [];
  refs.forEach((ref, index) => {
    const data = loaded[index];
    if (!data) return;
    entities.push({
      ...ref,
      key: `k${index}`,
      label: data.label,
      color: ENTITY_COLORS[index] ?? ENTITY_COLORS[0]!,
      rows: data.bySource.all,
      bySource: data.bySource,
    });
  });
  const unavailable = refs.length > 0 && loaded.every((data) => data === null);

  return (
    <Container>
      <PageHeader eyebrow="Comparar" title="Compare usinas, estados e subsistemas">
        <p>
          Em três passos: escolha os itens (estados, subsistemas ou usinas), escolha o que medir
          (geração, energia cortada, perda em R$ ou % de corte) e veja o resultado em linhas, barras
          ou pizza. O link da página guarda tudo: dá para compartilhar.
        </p>
      </PageHeader>

      <Section id="itens" title="1. Escolha o que comparar">
        <EntityPicker items={items} />
      </Section>

      {refs.length === 0 ? (
        <Section id="exemplos" title="Comece por um exemplo">
          <ul className="grid gap-3 sm:grid-cols-3">
            {EXAMPLES.map((example) => (
              <li key={example.refs}>
                <Link
                  href={`/comparar?itens=${encodeURIComponent(serializeEntities(parseEntities(example.refs)))}`}
                  className="block"
                >
                  <Card className="hover:border-accent p-4 font-medium">{example.label}</Card>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      ) : unavailable ? (
        <DataUnavailable />
      ) : (
        <Comparator entities={entities} initial={view} />
      )}
    </Container>
  );
}
