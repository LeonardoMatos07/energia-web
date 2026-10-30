import { ENTITY_COLORS } from "@/components/charts/palette";
import { Comparator } from "@/components/compare/comparator";
import { EntityPicker, type PickerItem } from "@/components/compare/entity-picker";
import { Container, DataUnavailable, PageHeader, Section } from "@/components/ui";
import type { ApiResult } from "@/lib/api/client";
import type { StateCurtailmentResponse, SubsystemCurtailmentResponse } from "@/lib/api/types";
import {
  getGenerationMix,
  getPlant,
  getPlantGeneration,
  getStateCurtailment,
  getSubsystemCurtailment,
} from "@/lib/api/queries";
import {
  attachShare,
  mixSourceRows,
  parseEntities,
  parseView,
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
    "Compare usinas, estados e subsistemas mês a mês: geração por fonte (eólica, solar, hidrelétrica, termelétrica), participação na matriz e o curtailment de eólica e solar.",
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
      share: null,
      cf: null,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

interface Loaded {
  label: string;
  bySource: Record<SourceFilter, MonthValues[]>;
}

const SOURCE_ORDER = ["all", "wind", "solar"] as const;

const EMPTY: Record<SourceFilter, MonthValues[]> = {
  all: [],
  wind: [],
  solar: [],
  hydro: [],
  thermal: [],
  nuclear: [],
  generation: [],
};

const NO_ROWS: MonthValues[] = [];

const API_SOURCE: Record<(typeof SOURCE_ORDER)[number], "total" | "wind" | "solar"> = {
  all: "total",
  wind: "wind",
  solar: "solar",
};

async function load(ref: EntityRef): Promise<Loaded | null> {
  if (ref.kind === "plant") {
    const result = await getPlant(ref.id);
    if (!result.ok) return loadPowerPlant(ref.id);
    const { plant, series } = result.data;
    const rows = toRows(series);
    return {
      label: `${plant.name} (${plant.state})`,
      bySource: {
        ...EMPTY,
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
        ...EMPTY,
        all: toRows(all.data.series),
        wind: toRows(series(wind)),
        solar: toRows(series(solar)),
      },
    };
  }
  const [[all, wind, solar], mix] = await Promise.all([
    Promise.all(SOURCE_ORDER.map((source) => getSubsystemCurtailment(API_SOURCE[source]))),
    getGenerationMix({ subsystem: ref.id }),
  ]);
  if (!all?.ok) return null;
  const mixPoints = mix?.ok ? mix.data.points : [];
  const subsystemSeries = (result: ApiResult<SubsystemCurtailmentResponse> | undefined) =>
    result?.ok ? result.data.items.filter((item) => item.subsystem === ref.id) : [];
  return {
    label: subsystemName(ref.id),
    bySource: {
      ...EMPTY,
      all: attachShare(toRows(subsystemSeries(all)), mixPoints, ["wind", "solar"]),
      wind: attachShare(toRows(subsystemSeries(wind)), mixPoints, ["wind"]),
      solar: attachShare(toRows(subsystemSeries(solar)), mixPoints, ["solar"]),
      hydro: mixSourceRows(mixPoints, "hydro"),
      thermal: mixSourceRows(mixPoints, "thermal"),
      generation: mixSourceRows(mixPoints, "generation"),
    },
  };
}

/** Plants outside the curtailment list (hydro, thermal, nuclear): generation and capacity factor. */
async function loadPowerPlant(slug: string): Promise<Loaded | null> {
  const result = await getPlantGeneration(slug);
  if (!result.ok) return null;
  const { plant, points } = result.data;
  const rows: MonthValues[] = points
    .map((point) => ({
      month: normalizeMonth(point.month),
      verified: point.energy_mwh,
      curtailed: 0,
      pct: null,
      loss: null,
      share: null,
      cf: point.capacity_factor === null ? null : point.capacity_factor * 100,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
  const own = plant.source_type as SourceFilter;
  return {
    label: `${plant.name}${plant.state ? ` (${plant.state})` : ""}`,
    bySource: {
      ...EMPTY,
      generation: rows,
      ...(own in EMPTY && own !== "all" && own !== "generation" ? { [own]: rows } : {}),
    },
  };
}

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
      <PageHeader title="Compare usinas, estados e subsistemas">
        <p>
          Em três passos: escolha os itens (estados, subsistemas ou usinas), escolha a fonte e o que
          medir e veja o resultado em linhas, barras ou pizza. A geração vale para todas as fontes
          (por subsistema); energia cortada, perda em R$ e % de corte existem só para eólica e
          solar. O link da página guarda tudo: dá para compartilhar.
        </p>
      </PageHeader>

      <Section id="itens" title="1. Escolha o que comparar">
        <EntityPicker items={items} />
      </Section>

      {refs.length === 0 ? null : unavailable ? (
        <DataUnavailable />
      ) : (
        <Comparator entities={entities} initial={view} />
      )}
    </Container>
  );
}
