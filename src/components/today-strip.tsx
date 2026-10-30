import Link from "next/link";
import {
  getBalance,
  getHydroSubsystems,
  getNews,
  getPld,
  getSubsystemCurtailment,
  getTariffFlags,
} from "@/lib/api/queries";
import {
  formatBRL,
  formatBRLCompact,
  formatGWh,
  formatLongMonth,
  formatNumber,
  formatPercent,
} from "@/lib/format";
import { SUBSYSTEMS } from "@/lib/geo";
import { latest, normalizeMonth } from "@/lib/series";
import { mean, renewableShare, sinHourly } from "@/lib/system";

interface Tile {
  key: string;
  label: string;
  value: string;
  note?: string;
  href: string;
  external?: boolean;
}

const DAY_MS = 86_400_000;
const isoDay = (date: Date) => date.toISOString().slice(0, 10);
const shortDay = (day: string) => `${day.slice(8, 10)}/${day.slice(5, 7)}`;

interface Curtailment {
  month: string;
  items: { label: string; value: string }[];
}

/** Curtailment of the latest month (wind + solar, whole country), shown next to the other numbers. */
async function loadCurtailment(): Promise<Curtailment | null> {
  const total = await getSubsystemCurtailment("total");
  const row = total.ok ? latest(total.data.items.filter((item) => item.subsystem === "SIN")) : null;
  if (!row) return null;
  return {
    month: normalizeMonth(row.month),
    items: [
      { label: "Energia cortada", value: formatGWh(row.curtailed_mwh) },
      { label: "% de corte", value: formatPercent(row.curtailment_pct) },
      { label: "Perda estimada", value: formatBRLCompact(row.estimated_loss_brl) },
      { label: "Usinas afetadas", value: formatNumber(row.affected_plants, 0) },
    ],
  };
}

async function loadTiles(): Promise<Tile[]> {
  const now = Date.now();
  const from = isoDay(new Date(now - 45 * DAY_MS));
  const [pld, balance, flags, news, ...hydro] = await Promise.all([
    getPld("daily", { from: isoDay(new Date(now - 14 * DAY_MS)) }, "SE"),
    getBalance(),
    getTariffFlags(),
    getNews({ limit: 1 }),
    ...SUBSYSTEMS.map((item) => getHydroSubsystems(item.id, from, isoDay(new Date(now)))),
  ]);
  const tiles: Tile[] = [];

  if (pld.ok) {
    const last = [...pld.data.points].sort((a, b) => a.period.localeCompare(b.period)).at(-1);
    if (last) {
      tiles.push({
        key: "pld",
        label: "PLD do dia (Sudeste/CO)",
        value: `${formatBRL(last.pld_avg_brl_per_mwh)}/MWh`,
        note: `média de ${shortDay(last.period.slice(0, 10))}`,
        href: "/mercado/pld",
      });
    }
  }

  const storage = SUBSYSTEMS.map((item, index) => {
    const result = hydro[index];
    const points = result?.ok ? result.data.points : [];
    const last = points
      .filter((point) => point.storage_pct !== null)
      .sort((a, b) => a.day.localeCompare(b.day))
      .at(-1);
    return { id: item.id, pct: last?.storage_pct ?? null };
  });
  const se = storage.find((item) => item.id === "SE")?.pct ?? null;
  if (se !== null) {
    tiles.push({
      key: "ear",
      label: "Reservatórios (Sudeste/CO)",
      value: formatPercent(se, 1),
      note: storage
        .filter((item) => item.id !== "SE" && item.pct !== null)
        .map((item) => `${item.id} ${formatPercent(item.pct, 0)}`)
        .join(" · "),
      href: "/agua",
    });
  }

  if (balance.ok && balance.data.points.length > 0) {
    const hours = sinHourly(balance.data.points);
    const lastDay = hours.at(-1)!.hour.slice(0, 10);
    const day = hours.filter((row) => row.hour.startsWith(lastDay));
    const load = mean(day.map((row) => row.load));
    const totals = day.reduce(
      (acc, row) => ({
        hydro: acc.hydro + row.hydro,
        thermal: acc.thermal + row.thermal,
        wind: acc.wind + row.wind,
        solar: acc.solar + row.solar,
      }),
      { hydro: 0, thermal: 0, wind: 0, solar: 0 },
    );
    const share = renewableShare(totals);
    if (load !== null) {
      tiles.push({
        key: "load",
        label: "Carga média do SIN",
        value: `${formatNumber(load, 0)} MW`,
        note: `dia ${shortDay(lastDay)}`,
        href: "/sistema",
      });
    }
    if (share !== null) {
      tiles.push({
        key: "renewable",
        label: "Renovável na geração",
        value: formatPercent(share, 0),
        note: "hidro, eólica e solar",
        href: "/sistema",
      });
    }
  }

  if (flags.ok && flags.data.items.length > 0) {
    const last = [...flags.data.items].sort((a, b) => a.month.localeCompare(b.month)).at(-1)!;
    tiles.push({
      key: "flag",
      label: "Bandeira tarifária",
      value: last.flag,
      note: formatLongMonth(normalizeMonth(last.month)),
      href: "/tarifas",
    });
  }

  const headline = news.ok ? news.data.items[0] : undefined;
  if (headline) {
    tiles.push({
      key: "news",
      label: "Manchete",
      value: headline.title,
      note: headline.publisher_name,
      href: headline.url,
      external: true,
    });
  }
  return tiles;
}

/** "Hoje no setor": the numbers people check first, each one a way into its area. */
export async function TodayStrip() {
  const [tiles, curtailment] = await Promise.all([loadTiles(), loadCurtailment()]);
  if (tiles.length === 0 && !curtailment) return null;
  return (
    <div className="space-y-3">
      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {tiles.map((tile) => {
          const body = (
            <>
              <p className="text-ink-2 text-sm">{tile.label}</p>
              <p
                className={`font-display mt-1 font-bold tracking-tight ${
                  tile.key === "news"
                    ? "line-clamp-3 text-base leading-snug"
                    : "tabular text-xl whitespace-nowrap sm:text-2xl"
                }`}
              >
                {tile.value}
              </p>
              {tile.note ? <p className="text-muted mt-1 text-xs">{tile.note}</p> : null}
            </>
          );
          const className =
            "border-grid bg-surface shadow-card hover:border-accent block h-full rounded-2xl border p-4 transition-colors sm:p-5";
          return (
            <li key={tile.key} className={tile.key === "news" ? "col-span-2 lg:col-span-1" : ""}>
              {tile.external ? (
                <a href={tile.href} target="_blank" rel="noopener noreferrer" className={className}>
                  {body}
                </a>
              ) : (
                <Link href={tile.href} className={className}>
                  {body}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
      {curtailment ? (
        <Link
          href="/curtailment"
          className="border-grid bg-surface shadow-card hover:border-accent block rounded-2xl border p-4 transition-colors sm:p-5"
        >
          <p className="text-ink-2 text-sm">
            Curtailment em {formatLongMonth(curtailment.month)}{" "}
            <span className="text-muted">(eólica e solar, Brasil)</span>
          </p>
          <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-3 lg:grid-cols-4">
            {curtailment.items.map((item) => (
              <div key={item.label}>
                <dt className="text-muted text-xs">{item.label}</dt>
                <dd className="font-display tabular text-xl font-bold tracking-tight sm:text-2xl">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </Link>
      ) : null}
    </div>
  );
}
