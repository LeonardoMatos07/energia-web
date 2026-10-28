import { Notice } from "@/components/ui";
import type { ForecastPoint, ForecastResponse } from "@/lib/api/types";
import {
  formatDay,
  freshnessLabel,
  groupByDay,
  scopeLabel,
  SOURCE_LABEL,
  summarize,
} from "@/lib/forecast";
import { formatPercent } from "@/lib/format";
import { ForecastChart } from "./forecast-chart";

const HOURS = Array.from({ length: 24 }, (_, hour) => hour);
const LEVEL_LABEL = { baixo: "baixo", medio: "médio", alto: "alto" } as const;
const STALE_AFTER_DAYS = 3;
/** The ONS publishes monthly, so data older than this means the publication itself is late. */
export const VERY_STALE_AFTER_DAYS = 45;

function cellStyle(point: ForecastPoint | undefined) {
  if (!point || !point.applicable) return { background: "transparent" };
  const alpha = 0.08 + 0.92 * Math.min(1, Math.max(0, point.risk_probability));
  return {
    background: `color-mix(in srgb, var(--color-series-3) ${Math.round(alpha * 100)}%, transparent)`,
  };
}

export function ForecastView({
  forecast,
  now = Date.now(),
}: {
  forecast: ForecastResponse;
  now?: number;
}) {
  const days = groupByDay(forecast.points);
  const { applicableHours, highHours, peak, meanExpectedPct } = summarize(forecast.points);
  const place = `${SOURCE_LABEL[forecast.source].toLowerCase()}, ${scopeLabel(forecast.scope)}`;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-accent text-on-accent rounded-2xl p-5 sm:p-6">
          <p className="text-sm opacity-85">Horas com risco alto</p>
          <p className="font-display mt-1 text-3xl font-bold tracking-tight">{highHours}</p>
          <p className="mt-1 text-sm opacity-90">
            de {applicableHours} horas previstas ({place})
          </p>
        </div>
        <div className="border-grid bg-surface shadow-card rounded-2xl border p-5 sm:p-6">
          <p className="text-ink-2 text-sm">Pico de risco</p>
          <p className="font-display mt-1 text-3xl font-bold tracking-tight">
            {peak ? formatPercent(peak.risk_probability * 100, 0) : "—"}
          </p>
          <p className="text-ink-2 mt-1 text-sm">
            {peak
              ? `${formatDay(peak.ts)} às ${peak.ts.slice(11, 13)}h, corte esperado de ${formatPercent(peak.expected_curtailment_pct, 0)}`
              : "Sem horas aplicáveis"}
          </p>
        </div>
        <div className="border-grid bg-surface shadow-card rounded-2xl border p-5 sm:p-6">
          <p className="text-ink-2 text-sm">Corte esperado médio</p>
          <p className="font-display mt-1 text-3xl font-bold tracking-tight">
            {meanExpectedPct === null ? "—" : formatPercent(meanExpectedPct, 0)}
          </p>
          <p className="text-ink-2 mt-1 text-sm">da geração possível, nas horas com geração</p>
        </div>
      </div>

      <figure className="border-grid bg-surface shadow-card rounded-2xl border p-4 sm:p-6">
        <figcaption className="text-ink-2 mb-3 text-sm">
          Risco de corte por hora (hora em que pelo menos 10% da geração possível é cortada). Quanto
          mais forte a cor, maior a probabilidade.
        </figcaption>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-separate border-spacing-0.5 text-xs">
            <caption className="sr-only">
              Risco de corte por dia e hora, {place}, a partir de {formatDay(forecast.origin_ts)}
            </caption>
            <thead>
              <tr>
                <th className="text-muted w-20 text-left font-medium">Dia</th>
                {HOURS.map((hour) => (
                  <th key={hour} scope="col" className="text-muted font-normal">
                    {hour % 3 === 0 ? `${hour}h` : ""}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map(([day, hours]) => (
                <tr key={day}>
                  <th scope="row" className="text-ink-2 pr-2 text-left font-medium">
                    {formatDay(day)}
                  </th>
                  {HOURS.map((hour) => {
                    const point = hours.get(hour);
                    const label = point?.applicable
                      ? `${formatDay(day)} ${hour}h: risco ${LEVEL_LABEL[point.level]} (${formatPercent(point.risk_probability * 100, 0)})`
                      : `${formatDay(day)} ${hour}h: não se aplica`;
                    return (
                      <td
                        key={hour}
                        title={label}
                        aria-label={label}
                        className="border-grid h-7 rounded-sm border"
                        style={cellStyle(point)}
                      />
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </figure>

      <ForecastChart points={forecast.points} />

      <p className="text-ink-2 text-sm">
        <strong>Dados do ONS até {formatDay(forecast.data_through, "full")}.</strong> Previsão{" "}
        {freshnessLabel(forecast.generated_at, now)}.
      </p>
      {forecast.stale_days > VERY_STALE_AFTER_DAYS ? (
        <Notice>
          Os dados do ONS estão atrasados: o último dia disponível é{" "}
          {formatDay(forecast.data_through, "full")}, há {forecast.stale_days} dias. O ONS publica
          os dados uma vez por mês, com defasagem, por isso a previsão começa em{" "}
          {formatDay(forecast.origin_ts)} e pode não refletir o que mudou desde então. Ela é
          atualizada sozinha assim que novos dados chegam.
        </Notice>
      ) : forecast.stale_days > STALE_AFTER_DAYS ? (
        <Notice>
          Os dados mais recentes do ONS usados nesta previsão vão até{" "}
          {formatDay(forecast.data_through, "full")} ({forecast.stale_days} dias atrás), então a
          previsão começa em {formatDay(forecast.origin_ts)} e não reflete o que aconteceu depois.
          Os dados são publicados uma vez por mês.
        </Notice>
      ) : null}
      <p className="text-muted max-w-3xl text-xs leading-5">
        Modelo {forecast.model_version}. É um indicador de risco, não uma garantia.
      </p>
    </div>
  );
}
