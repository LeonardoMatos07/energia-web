import { BarList } from "@/components/bar-list";
import { MonthlyChart } from "@/components/charts/monthly-chart";
import { SeriesChart, type SeriesRow } from "@/components/charts/series-chart";
import { GenerationMixPie } from "@/components/generation-mix-pie";
import { OnsAttribution } from "@/components/ons-attribution";
import { Card, DataUnavailable, StatGrid, StatTile } from "@/components/ui";
import {
  getBalance,
  getGenerationMix,
  getInterchange,
  getThermalDispatch,
} from "@/lib/api/queries";
import type { BalancePoint } from "@/lib/api/types";
import { balancePlan, type Filters, subsystemFilterLabel } from "@/lib/filters";
import { formatGWh, formatNumber, formatPercent, formatShortMonth, mwhToGwh } from "@/lib/format";
import { describePeriod } from "@/lib/period";
import { normalizeMonth } from "@/lib/series";
import {
  dailyAverage,
  interchangeByPair,
  mean,
  renewableShare,
  SOURCE_FILL,
  SOURCE_LABELS,
  SOURCE_ORDER,
  sinHourly,
  thermalByReason,
} from "@/lib/system";

const hourLabel = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)} ${iso.slice(11, 13)}h`;
const dayLabel = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
const subsystemParam = (filters: Filters) => (filters.sub === "SIN" ? undefined : filters.sub);
const periodText = (filters: Filters) =>
  describePeriod(filters.start, filters.end, formatShortMonth);

async function loadBalance(filters: Filters): Promise<BalancePoint[] | null> {
  const plan = balancePlan(filters);
  const subsystem = subsystemParam(filters);
  const requests =
    plan.kind === "recent"
      ? [{ subsystem }]
      : plan.kind === "hourly"
        ? [{ from: plan.from, to: plan.to, subsystem }]
        : plan.ranges.map((range) => ({ ...range, subsystem }));
  const results = await Promise.all(requests.map((request) => getBalance(request)));
  const ok = results.filter((result) => result.ok);
  if (ok.length === 0) return null;
  return ok.flatMap((result) => (result.ok ? result.data.points : []));
}

export async function BalanceBlock({ filters }: { filters: Filters }) {
  const points = await loadBalance(filters);
  if (!points || points.length === 0) return <DataUnavailable />;
  const plan = balancePlan(filters);
  const hours = sinHourly(points);
  const rowsSource = plan.kind === "daily" ? dailyAverage(hours) : hours;
  const loadAvg = mean(hours.map((row) => row.load));
  const genAvg = mean(hours.map((row) => row.generation));
  const totals = hours.reduce(
    (acc, row) => ({
      hydro: acc.hydro + row.hydro,
      thermal: acc.thermal + row.thermal,
      wind: acc.wind + row.wind,
      solar: acc.solar + row.solar,
    }),
    { hydro: 0, thermal: 0, wind: 0, solar: 0 },
  );
  const share = renewableShare(totals);
  const peak = Math.max(...hours.map((row) => row.load ?? 0));
  const label = plan.kind === "daily" ? dayLabel : hourLabel;
  const rows: SeriesRow[] = rowsSource.map((row) => ({
    label: label(row.hour),
    hydro: row.hydro,
    wind: row.wind,
    solar: row.solar,
    thermal: row.thermal,
    load: row.load,
  }));
  const from = label(rowsSource[0]!.hour);
  const to = label(rowsSource.at(-1)!.hour);
  const where = subsystemFilterLabel(filters.sub);
  const grain = plan.kind === "daily" ? "média diária" : "média horária";
  return (
    <>
      <StatGrid>
        <StatTile highlight label="Carga média" value={`${formatNumber(loadAvg, 0)} MW`} />
        <StatTile label="Geração média" value={`${formatNumber(genAvg, 0)} MW`} />
        <StatTile
          label="Renovável na geração"
          value={formatPercent(share, 0)}
          note="hidro, eólica e solar"
        />
        <StatTile
          label="Pico de carga"
          value={`${formatNumber(peak, 0)} MW`}
          note={`de ${from} a ${to}`}
        />
      </StatGrid>
      <div className="mt-4">
        <SeriesChart
          title={`Geração por fonte e carga (${where})`}
          unit="MW"
          rows={rows}
          series={[
            ...SOURCE_ORDER.map((source) => ({
              key: source,
              label: SOURCE_LABELS[source],
              color: SOURCE_FILL[source],
              type: "area" as const,
            })),
            {
              key: "load",
              label: "Carga",
              color: "var(--color-ink)",
              type: "line" as const,
              dashed: true,
            },
          ]}
          summary={`${where}, ${grain}, de ${from} a ${to}. As áreas empilhadas somam a geração; a linha tracejada é a carga.`}
          tickEvery={plan.kind === "hourly" ? 48 : plan.kind === "recent" ? 24 : undefined}
        />
      </div>
      <OnsAttribution dataset="Balanço de energia nos subsistemas" />
    </>
  );
}

export async function MixBlock({ filters }: { filters: Filters }) {
  const mix = await getGenerationMix({
    subsystem: filters.sub,
    from: filters.start,
    to: filters.end,
  });
  if (!mix.ok || mix.data.points.length === 0) return <DataUnavailable />;
  const rows = new Map<string, Record<string, string | number>>();
  for (const point of mix.data.points) {
    const month = normalizeMonth(point.month);
    const row = rows.get(month) ?? { month };
    row[point.source] = mwhToGwh(point.energy_mwh);
    rows.set(month, row);
  }
  const chartRows = [...rows.values()].sort((a, b) =>
    String(a.month).localeCompare(String(b.month)),
  );
  // The pie reads the "SIN" rows: hand it the selected region's rows labelled as such.
  const pieSource = mix.data.points.map((point) => ({ ...point, subsystem: "SIN" as const }));
  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <MonthlyChart
        title={`Geração mensal por fonte (${subsystemFilterLabel(filters.sub)})`}
        description={`Energia gerada em cada mês, em GWh. Período: ${periodText(filters)}.`}
        rows={chartRows as never}
        series={SOURCE_ORDER.map((source) => ({
          key: source,
          label: SOURCE_LABELS[source],
          color: SOURCE_FILL[source],
        }))}
        unit="GWh"
        kind="stacked-bar"
        digits={0}
      />
      <Card className="p-5 sm:p-6">
        <GenerationMixPie points={pieSource} />
      </Card>
      <div className="lg:col-span-2">
        <OnsAttribution dataset="Geração por fonte" />
      </div>
    </div>
  );
}

export async function InterchangeBlock({ filters }: { filters: Filters }) {
  const interchange = await getInterchange("national", { from: filters.start, to: filters.end });
  if (!interchange.ok) return <DataUnavailable />;
  const pairs = interchangeByPair(interchange.data.points, filters.sub);
  if (pairs.length === 0) {
    return (
      <p className="text-ink-2 text-sm">
        Sem dados de intercâmbio para {subsystemFilterLabel(filters.sub)} em {periodText(filters)}.
      </p>
    );
  }
  return (
    <>
      <p className="text-ink-2 mb-4 text-sm">
        Fluxo médio entre os subsistemas em {periodText(filters)}. A seta mostra o sentido
        predominante: de onde a energia sai para onde vai.
      </p>
      <BarList
        label="Intercâmbio médio entre subsistemas"
        items={pairs.map((pair) => ({
          key: pair.key,
          label: `${pair.from} → ${pair.to}`,
          value: pair.avgMw,
          display: `${formatNumber(pair.avgMw, 0)} MW médios`,
          note: `pico ${formatNumber(pair.peakMw, 0)} MW`,
        }))}
      />
      <OnsAttribution dataset="Intercâmbio de energia entre subsistemas" />
    </>
  );
}

export async function ThermalBlock({ filters }: { filters: Filters }) {
  const thermal = await getThermalDispatch({
    from: filters.start,
    to: filters.end,
    subsystem: subsystemParam(filters),
  });
  if (!thermal.ok) return <DataUnavailable />;
  const { rows } = thermalByReason(thermal.data.points);
  if (rows.length === 0) {
    return (
      <p className="text-ink-2 text-sm">
        Sem despacho térmico para {subsystemFilterLabel(filters.sub)} em {periodText(filters)}.
      </p>
    );
  }
  return (
    <>
      <p className="text-ink-2 mb-4 text-sm">
        Energia térmica verificada em {periodText(filters)} ({subsystemFilterLabel(filters.sub)}),
        por motivo do despacho.
      </p>
      <BarList
        label="Despacho térmico por motivo"
        max={rows[0]!.mwh}
        items={rows.map((row) => ({
          key: row.reason,
          label: row.label,
          value: row.mwh,
          display: formatGWh(row.mwh, 0),
          color: SOURCE_FILL.thermal,
        }))}
      />
      <OnsAttribution dataset="Despacho de usinas térmicas" />
    </>
  );
}
