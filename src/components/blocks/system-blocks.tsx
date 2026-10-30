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
import {
  formatDate,
  formatGWh,
  formatLongMonth,
  formatNumber,
  formatPercent,
  mwhToGwh,
} from "@/lib/format";
import { normalizeMonth } from "@/lib/series";
import {
  mean,
  renewableShare,
  SOURCE_FILL,
  SOURCE_LABELS,
  SOURCE_ORDER,
  sinHourly,
  thermalByReason,
} from "@/lib/system";

const hourLabel = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)} ${iso.slice(11, 13)}h`;

export async function BalanceBlock() {
  const balance = await getBalance();
  if (!balance.ok || balance.data.points.length === 0) return <DataUnavailable />;
  const hours = sinHourly(balance.data.points);
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
  const rows: SeriesRow[] = hours.map((row) => ({
    label: hourLabel(row.hour),
    hydro: row.hydro,
    wind: row.wind,
    solar: row.solar,
    thermal: row.thermal,
    load: row.load,
  }));
  const from = formatDate(`${balance.data.date_from}T12:00:00-03:00`);
  const to = formatDate(`${balance.data.date_to}T12:00:00-03:00`);
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
          title="Geração por fonte e carga, hora a hora"
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
          summary={`Média horária do SIN, de ${from} a ${to}. As áreas empilhadas somam a geração; a linha tracejada é a carga.`}
          tickEvery={24}
        />
      </div>
      <OnsAttribution dataset="Balanço de energia nos subsistemas" />
    </>
  );
}

export async function MixBlock() {
  const mix = await getGenerationMix();
  if (!mix.ok || mix.data.points.length === 0) return <DataUnavailable />;
  const rows = new Map<string, Record<string, string | number>>();
  for (const point of mix.data.points) {
    if (point.subsystem !== "SIN") continue;
    const month = normalizeMonth(point.month);
    const row = rows.get(month) ?? { month };
    row[point.source] = mwhToGwh(point.energy_mwh);
    rows.set(month, row);
  }
  const chartRows = [...rows.values()].sort((a, b) =>
    String(a.month).localeCompare(String(b.month)),
  );
  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <MonthlyChart
        title="Geração mensal por fonte"
        description="Energia gerada no SIN em cada mês, em GWh."
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
        <GenerationMixPie points={mix.data.points} />
      </Card>
      <div className="lg:col-span-2">
        <OnsAttribution dataset="Geração por fonte (SIN)" />
      </div>
    </div>
  );
}

export async function InterchangeBlock() {
  const interchange = await getInterchange("national");
  if (!interchange.ok) return <DataUnavailable />;
  const month = interchange.data.points
    .map((point) => normalizeMonth(point.month))
    .sort()
    .at(-1);
  if (!month) return <DataUnavailable />;
  const items = interchange.data.points
    .filter((point) => normalizeMonth(point.month) === month)
    .map((point) => {
      const forward = point.avg_mw >= 0;
      const from = forward ? point.origin : point.destination;
      const to = forward ? point.destination : point.origin;
      return {
        key: `${point.origin}-${point.destination}`,
        label: `${from} → ${to}`,
        value: Math.abs(point.avg_mw),
        display: `${formatNumber(Math.abs(point.avg_mw), 0)} MW médios`,
        note: `pico ${formatNumber(point.peak_mw, 0)} MW`,
      };
    })
    .sort((a, b) => b.value - a.value);
  return (
    <>
      <p className="text-ink-2 mb-4 text-sm">
        Fluxo médio de energia entre os subsistemas em {formatLongMonth(month)}. A seta mostra o
        sentido predominante: de onde a energia sai para onde vai.
      </p>
      <BarList items={items} label="Intercâmbio médio entre subsistemas" />
      <OnsAttribution dataset="Intercâmbio de energia entre subsistemas" />
    </>
  );
}

export async function ThermalBlock() {
  const thermal = await getThermalDispatch();
  if (!thermal.ok) return <DataUnavailable />;
  const result = thermalByReason(thermal.data.points);
  if (!result || result.rows.length === 0) return <DataUnavailable />;
  const max = result.rows[0]!.mwh;
  return (
    <>
      <p className="text-ink-2 mb-4 text-sm">
        Energia térmica verificada em {formatLongMonth(result.month)}, por motivo do despacho.
      </p>
      <BarList
        label="Despacho térmico por motivo"
        max={max}
        items={result.rows.map((row) => ({
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
