import { BarList } from "@/components/bar-list";
import { SUBSYSTEM_COLORS } from "@/components/charts/palette";
import { SeriesChart, type SeriesRow } from "@/components/charts/series-chart";
import { OnsAttribution } from "@/components/ons-attribution";
import { DataUnavailable, StatGrid, StatTile } from "@/components/ui";
import { getHydroSubsystems, getReservoirs, getSpilledEnergy } from "@/lib/api/queries";
import type { HydroSubsystemPoint, Subsystem } from "@/lib/api/types";
import { formatDate, formatGWh, formatLongMonth, formatPercent } from "@/lib/format";
import { SUBSYSTEMS } from "@/lib/geo";
import { normalizeMonth } from "@/lib/series";

const HISTORY_DAYS = 400;
const SUBSYSTEM_IDS = SUBSYSTEMS.map((item) => item.id);

const isoDay = (date: Date) => date.toISOString().slice(0, 10);
const dayLabel = (day: string) => `${day.slice(8, 10)}/${day.slice(5, 7)}/${day.slice(2, 4)}`;

export async function loadHydro() {
  const now = new Date();
  const from = isoDay(new Date(now.getTime() - HISTORY_DAYS * 86_400_000));
  const results = await Promise.all(
    SUBSYSTEM_IDS.map((id) => getHydroSubsystems(id, from, isoDay(now))),
  );
  const points: HydroSubsystemPoint[] = [];
  for (const result of results) if (result.ok) points.push(...result.data.points);
  return points;
}

function chartRows(
  points: readonly HydroSubsystemPoint[],
  pick: "storage_pct" | "ena_storable_pct_mlt",
) {
  const byDay = new Map<string, SeriesRow>();
  for (const point of points) {
    const row = byDay.get(point.day) ?? { label: dayLabel(point.day), day: point.day };
    row[point.subsystem] = point[pick];
    byDay.set(point.day, row);
  }
  return [...byDay.values()].sort((a, b) => String(a.day).localeCompare(String(b.day)));
}

const subsystemSeries = SUBSYSTEMS.map((item) => ({
  key: item.id,
  label: item.name,
  color: SUBSYSTEM_COLORS[item.id as Subsystem],
  type: "line" as const,
}));

export async function StorageBlock() {
  const points = await loadHydro();
  if (points.length === 0) return <DataUnavailable />;
  const lastDay = points
    .map((point) => point.day)
    .sort()
    .at(-1)!;
  const latest = (id: string) =>
    points.find((point) => point.day === lastDay && point.subsystem === id);
  return (
    <>
      <StatGrid>
        {SUBSYSTEMS.map((item) => (
          <StatTile
            key={item.id}
            highlight={item.id === "SE"}
            label={item.name}
            value={formatPercent(latest(item.id)?.storage_pct ?? null, 1)}
            note="energia armazenada"
          />
        ))}
      </StatGrid>
      <p className="text-muted mt-2 text-xs">
        Posição em {formatDate(`${lastDay}T12:00:00-03:00`)}.
      </p>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <SeriesChart
          title="Energia armazenada (EAR) por subsistema"
          unit="% da capacidade"
          rows={chartRows(points, "storage_pct")}
          series={subsystemSeries}
          summary="Porcentagem da capacidade máxima de armazenamento, por dia, no último ano."
          height={280}
        />
        <SeriesChart
          title="Energia natural afluente (ENA) armazenável"
          unit="% da média histórica"
          rows={chartRows(points, "ena_storable_pct_mlt")}
          series={subsystemSeries}
          summary="Quanta água chega aos reservatórios, em relação à média de longo termo (100% é a média)."
          height={280}
        />
      </div>
      <OnsAttribution dataset="Dados hidrológicos dos subsistemas (EAR e ENA)" />
    </>
  );
}

export async function ReservoirsBlock() {
  const result = await getReservoirs();
  if (!result.ok) return <DataUnavailable />;
  const items = result.data.items
    .filter((item) => item.storage_pct !== null)
    .sort((a, b) => (b.useful_volume_hm3 ?? 0) - (a.useful_volume_hm3 ?? 0))
    .slice(0, 12);
  if (items.length === 0) return <DataUnavailable />;
  return (
    <>
      <p className="text-ink-2 mb-4 text-sm">
        Os 12 maiores reservatórios por volume útil, com o quanto cada um está cheio
        {result.data.latest_day
          ? ` em ${formatDate(`${result.data.latest_day}T12:00:00-03:00`)}`
          : ""}
        .
      </p>
      <BarList
        label="Volume armazenado nos maiores reservatórios"
        max={100}
        items={items.map((item) => ({
          key: item.id,
          label: item.name,
          value: item.storage_pct ?? 0,
          display: formatPercent(item.storage_pct, 1),
          note: [item.subsystem, item.basin].filter(Boolean).join(" · "),
          color: "var(--color-series-2)",
        }))}
      />
      <OnsAttribution dataset="Reservatórios" />
    </>
  );
}

export async function SpilledBlock() {
  const result = await getSpilledEnergy();
  if (!result.ok) return <DataUnavailable />;
  const month = result.data.points
    .map((point) => normalizeMonth(point.month))
    .sort()
    .at(-1);
  if (!month) return <DataUnavailable />;
  const items = result.data.points
    .filter((point) => normalizeMonth(point.month) === month && point.spilled_energy_mwh > 0)
    .sort((a, b) => b.spilled_energy_mwh - a.spilled_energy_mwh)
    .slice(0, 10);
  return (
    <>
      <p className="text-ink-2 mb-4 text-sm">
        Vertimento é a água que passa pela usina sem gerar energia. A parte turbinável poderia ter
        virado eletricidade. Maiores volumes em {formatLongMonth(month)}.
      </p>
      <BarList
        label="Energia vertida por usina"
        items={items.map((item) => ({
          key: item.plant_code,
          label: item.plant_name,
          value: item.spilled_energy_mwh,
          display: formatGWh(item.spilled_energy_mwh, 0),
          note: `turbinável ${formatGWh(item.spilled_turbinable_energy_mwh, 0)}${item.subsystem ? ` · ${item.subsystem}` : ""}`,
          color: "var(--color-series-3)",
        }))}
      />
      <OnsAttribution dataset="Energia vertida turbinável" />
    </>
  );
}
