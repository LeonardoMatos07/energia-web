import Link from "next/link";
import { BarList } from "@/components/bar-list";
import { DataUnavailable, StatGrid, StatTile } from "@/components/ui";
import {
  getBalance,
  getGenerationMix,
  getHydroSubsystems,
  getInterchange,
} from "@/lib/api/queries";
import { formatLongMonth, formatNumber, formatPercent } from "@/lib/format";
import { SUBSYSTEMS } from "@/lib/geo";
import { normalizeMonth } from "@/lib/series";
import { currentMonth } from "@/lib/filters";
import { shiftMonth } from "@/lib/series";
import {
  interchangeByPair,
  renewableShare,
  SOURCE_FILL,
  SOURCE_LABELS,
  SOURCE_ORDER,
  sinHourly,
} from "@/lib/system";

const DAY_MS = 86_400_000;
const isoDay = (date: Date) => date.toISOString().slice(0, 10);

function MoreLink({ href, children }: { href: string; children: string }) {
  return (
    <p className="mt-3 text-sm">
      <Link href={href} className="text-accent underline">
        {children}
      </Link>
    </p>
  );
}

/** Summary numbers of the grid: current load, renewable share and the leading source. */
export async function SystemSummary() {
  const [balance, mix] = await Promise.all([getBalance(), getGenerationMix()]);
  const hours = balance.ok ? sinHourly(balance.data.points) : [];
  const last = hours.at(-1);
  const day = last ? hours.filter((row) => row.hour.startsWith(last.hour.slice(0, 10))) : [];
  const totals = day.reduce(
    (acc, row) => ({
      hydro: acc.hydro + row.hydro,
      thermal: acc.thermal + row.thermal,
      wind: acc.wind + row.wind,
      solar: acc.solar + row.solar,
    }),
    { hydro: 0, thermal: 0, wind: 0, solar: 0 },
  );
  const share = day.length ? renewableShare(totals) : null;

  let leader: { label: string; pct: number; month: string } | null = null;
  if (mix.ok) {
    const sin = mix.data.points.filter((point) => point.subsystem === "SIN");
    const month = sin
      .map((point) => normalizeMonth(point.month))
      .sort()
      .at(-1);
    const top = sin
      .filter((point) => normalizeMonth(point.month) === month)
      .sort((a, b) => b.energy_mwh - a.energy_mwh)[0];
    if (month && top && top.share_pct !== null) {
      leader = { label: SOURCE_LABELS[top.source], pct: top.share_pct, month };
    }
  }

  if (!last && !leader) return <DataUnavailable />;
  return (
    <>
      <StatGrid>
        {last?.load != null ? (
          <StatTile
            highlight
            label="Carga agora"
            value={`${formatNumber(last.load, 0)} MW`}
            note={`última hora com dados, ${last.hour.slice(8, 10)}/${last.hour.slice(5, 7)}`}
          />
        ) : null}
        {share !== null ? (
          <StatTile
            label="Renovável na geração"
            value={formatPercent(share, 0)}
            note="no último dia"
          />
        ) : null}
        {leader ? (
          <StatTile
            label="Fonte líder"
            value={leader.label}
            note={`${formatPercent(leader.pct, 0)} em ${formatLongMonth(leader.month)}`}
          />
        ) : null}
      </StatGrid>
      <MoreLink href="/sistema">Ver detalhes no Sistema</MoreLink>
    </>
  );
}

/** Summary of the reservoirs: stored energy (EAR) and inflow (ENA) per subsystem. */
export async function WaterSummary() {
  const now = Date.now();
  const from = isoDay(new Date(now - 45 * DAY_MS));
  const results = await Promise.all(
    SUBSYSTEMS.map((item) => getHydroSubsystems(item.id, from, isoDay(new Date(now)))),
  );
  const rows = SUBSYSTEMS.map((item, index) => {
    const result = results[index];
    const points = result?.ok ? result.data.points : [];
    const last = points
      .filter((point) => point.storage_pct !== null)
      .sort((a, b) => a.day.localeCompare(b.day))
      .at(-1);
    return { item, last };
  }).filter((row) => row.last);
  if (rows.length === 0) return <DataUnavailable />;
  return (
    <>
      <StatGrid>
        {rows.map(({ item, last }) => (
          <StatTile
            key={item.id}
            highlight={item.id === "SE"}
            label={`EAR ${item.name}`}
            value={formatPercent(last!.storage_pct, 1)}
            note={
              last!.ena_storable_pct_mlt !== null
                ? `ENA ${formatPercent(last!.ena_storable_pct_mlt, 0)} da média`
                : undefined
            }
          />
        ))}
      </StatGrid>
      <MoreLink href="/agua">Ver detalhes na Água</MoreLink>
    </>
  );
}

/** Highest instant output of each source in the latest month of the mix (not shown on the home page). */
export async function PeaksSummary() {
  const mix = await getGenerationMix();
  if (!mix.ok) return <DataUnavailable />;
  const sin = mix.data.points.filter((point) => point.subsystem === "SIN");
  const month = sin
    .map((point) => normalizeMonth(point.month))
    .sort()
    .at(-1);
  const rows = sin.filter((point) => normalizeMonth(point.month) === month);
  if (!month || rows.length === 0) return <DataUnavailable />;
  return (
    <>
      <StatGrid>
        {SOURCE_ORDER.map((source) => {
          const row = rows.find((item) => item.source === source);
          return row ? (
            <StatTile
              key={source}
              label={`Pico de ${SOURCE_LABELS[source].toLowerCase()}`}
              value={`${formatNumber(row.peak_mw, 0)} MW`}
              note={`média ${formatNumber(row.avg_mw, 0)} MW em ${formatLongMonth(month)}`}
            />
          ) : null;
        })}
      </StatGrid>
      <MoreLink href="/sistema#matriz">Ver a geração por fonte mês a mês</MoreLink>
    </>
  );
}

/** The biggest energy flows between subsystems in the latest month with data. */
export async function InterchangeSummary() {
  const last = currentMonth();
  const result = await getInterchange("national", { from: shiftMonth(last, -2), to: last });
  if (!result.ok) return <DataUnavailable />;
  const month = result.data.points
    .map((point) => normalizeMonth(point.month))
    .sort()
    .at(-1);
  const pairs = interchangeByPair(
    result.data.points.filter((point) => normalizeMonth(point.month) === month),
    "SIN",
  ).slice(0, 4);
  if (!month || pairs.length === 0) return <DataUnavailable />;
  return (
    <>
      <p className="text-ink-2 mb-4 text-sm">
        Maiores fluxos entre os subsistemas em {formatLongMonth(month)}, do que sai para onde vai.
      </p>
      <BarList
        label="Maiores fluxos de intercâmbio"
        items={pairs.map((pair) => ({
          key: pair.key,
          label: `${pair.from} → ${pair.to}`,
          value: pair.avgMw,
          display: `${formatNumber(pair.avgMw, 0)} MW médios`,
          color: SOURCE_FILL.hydro,
        }))}
      />
      <MoreLink href="/sistema#intercambio">Ver o intercâmbio no Sistema</MoreLink>
    </>
  );
}
