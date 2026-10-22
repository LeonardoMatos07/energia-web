"use client";

import { useEffect, useMemo, useState } from "react";
import { MonthlyChart, type ChartKind } from "@/components/charts/monthly-chart";
import { GENERATION_COLORS, SERIES } from "@/components/charts/palette";
import { PeriodFilter } from "@/components/charts/period-filter";
import type { ChartSeries } from "@/components/charts/types";
import { Section } from "@/components/ui";
import {
  applyViewParams,
  buildMetricRows,
  buildSeparateRows,
  entityToken,
  groupMetrics,
  groupUnit,
  METRIC_ORDER,
  METRICS,
  metricUnit,
  SCALE_DISPARITY_RATIO,
  scaleDisparity,
  SOURCE_FILTERS,
  withSource,
  type CompareEntity,
  type KindChoice,
  type Layout,
  type MetricKey,
  type SourceFilter,
  type ViewState,
} from "@/lib/compare";
import { formatPercent } from "@/lib/format";
import { trackEvent } from "@/lib/track";
import { defaultPeriod, filterByMonthRange } from "@/lib/series";

const LAYOUTS: { value: Layout; label: string; help: string }[] = [
  {
    value: "items",
    label: "Comparar os itens",
    help: "Um gráfico por métrica, com cada item numa cor.",
  },
  {
    value: "separate",
    label: "Cada item separado",
    help: "Um gráfico por item, com as métricas lado a lado (por exemplo, gerado × cortado).",
  },
];

const KINDS: { value: KindChoice; label: string }[] = [
  { value: "line", label: "Linhas" },
  { value: "bar", label: "Barras" },
  { value: "pie", label: "Pizza" },
];

const METRIC_COLORS: Record<MetricKey, string> = {
  verified: GENERATION_COLORS.verified,
  curtailed: GENERATION_COLORS.curtailed,
  loss: SERIES.s2,
  pct: SERIES.s4,
};

const METRIC_HELP: Record<MetricKey, string> = {
  verified: "O que a usina efetivamente entregou à rede.",
  curtailed: "A energia perdida: deixou de ser gerada por ordem do ONS.",
  loss: "O corte valorado em reais pelo PLD (estimativa).",
  pct: "Corte dividido pela geração possível, para comparar itens de tamanhos diferentes.",
};

const PIE_NOTE = " A pizza não se aplica a este gráfico; mostrando barras.";

function resolveKind(
  kind: KindChoice,
  options: { additive: boolean; seriesCount: number; stackedBars: boolean },
): { chart: ChartKind; fellBack: boolean } {
  if (kind === "line") return { chart: "line", fellBack: false };
  if (kind === "bar") {
    return { chart: options.stackedBars ? "stacked-bar" : "bar", fellBack: false };
  }
  if (options.additive && options.seriesCount >= 2) return { chart: "pie", fellBack: false };
  return { chart: "bar", fellBack: true };
}

function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label={label}>
      <span className="text-ink-2 text-sm font-medium">{label}</span>
      <div className="border-line bg-surface inline-flex flex-wrap gap-1 rounded-lg border p-1">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={option.value === value}
            onClick={() => onChange(option.value)}
            className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
              option.value === value ? "bg-accent text-on-accent" : "text-ink-2 hover:bg-surface-2"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Comparator({
  entities: allEntities,
  initial,
}: {
  entities: CompareEntity[];
  initial: ViewState;
}) {
  const [metrics, setMetrics] = useState<MetricKey[]>(initial.metrics);
  const [layoutChoice, setLayoutChoice] = useState<Layout | null>(initial.layout);
  const [kind, setKind] = useState<KindChoice>(initial.kind);
  const [source, setSource] = useState<SourceFilter>(initial.source);
  const [range, setRange] = useState<{ start: string; end: string } | null>(null);
  const sourced = useMemo(
    () => allEntities.map((entity) => withSource(entity, source)),
    [allEntities, source],
  );
  const entities = useMemo(() => sourced.filter((entity) => entity.rows.length > 0), [sourced]);
  const withoutData = sourced.filter((entity) => entity.rows.length === 0);
  const sourceLabel = SOURCE_FILTERS.find((option) => option.value === source)?.label ?? "";
  const titleSuffix = source === "all" ? "" : ` (só ${sourceLabel.toLowerCase()})`;
  const layout: Layout = layoutChoice ?? (entities.length >= 2 ? "items" : "separate");

  useEffect(() => {
    const params = applyViewParams(new URLSearchParams(window.location.search), {
      metrics,
      layout: layoutChoice,
      kind,
      source,
    });
    const query = params.toString();
    window.history.replaceState(
      window.history.state,
      "",
      query ? `${window.location.pathname}?${query}` : window.location.pathname,
    );
  }, [metrics, layoutChoice, kind, source]);

  const entityTokens = useMemo(
    () => allEntities.map((entity) => entityToken({ kind: entity.kind, id: entity.id })),
    [allEntities],
  );
  useEffect(() => {
    const timer = setTimeout(() => {
      trackEvent("compare.configure", {
        entities: entityTokens,
        metrics,
        layout: layoutChoice,
        kind,
        source,
      });
    }, 1200);
    return () => clearTimeout(timer);
  }, [entityTokens, metrics, layoutChoice, kind, source]);

  const months = useMemo(
    () => [...new Set(entities.flatMap((entity) => entity.rows.map((row) => row.month)))].sort(),
    [entities],
  );
  const first = months[0] ?? "";
  const last = months[months.length - 1] ?? "";
  const wantedStart = range ? range.start : defaultPeriod(first, last).start;
  const clampedStart = wantedStart > first ? wantedStart : first;
  const clampedEnd = range && range.end < last ? range.end : last;
  const validRange = clampedStart <= clampedEnd;
  const start = validRange ? clampedStart : first;
  const end = validRange ? clampedEnd : last;

  const visible = useMemo(
    () =>
      entities.map((entity) => ({
        ...entity,
        rows: filterByMonthRange(entity.rows, start, end),
      })),
    [entities, start, end],
  );

  const disparity = useMemo(() => scaleDisparity(entities), [entities]);
  const unbalanced =
    layout === "items" &&
    disparity > SCALE_DISPARITY_RATIO &&
    metrics.some((metric) => METRICS[metric].additive) &&
    !metrics.includes("pct");

  function toggleMetric(metric: MetricKey) {
    setMetrics((current) => {
      if (!current.includes(metric)) {
        return METRIC_ORDER.filter((key) => key === metric || current.includes(key));
      }
      return current.length > 1 ? current.filter((key) => key !== metric) : current;
    });
  }

  function changeSource(next: SourceFilter) {
    setSource(next);
    setRange(null);
  }

  const sourceControl = (
    <Segmented label="Fonte" options={SOURCE_FILTERS} value={source} onChange={changeSource} />
  );
  const sourceNote =
    source === "solar" ? (
      <p className="text-muted text-sm">
        Os dados de usinas solares só existem a partir de abril de 2024.
      </p>
    ) : null;
  const missingNote =
    withoutData.length > 0 ? (
      <p className="bg-accent-soft text-ink rounded-xl px-4 py-3 text-sm">
        Sem dados de fonte {sourceLabel.toLowerCase()} para:{" "}
        <strong>{withoutData.map((entity) => entity.label).join(", ")}</strong>. Esses itens ficam
        de fora dos gráficos; escolha outra fonte para vê-los.
      </p>
    ) : null;

  if (months.length === 0) {
    return (
      <Section id="metricas" title="2. O que medir">
        <div className="space-y-4">
          {sourceControl}
          {sourceNote}
          {missingNote}
          <p className="text-ink-2 text-sm">
            Não há dados mensais para os itens escolhidos nesta fonte. Tente outra fonte ou outros
            itens.
          </p>
        </div>
      </Section>
    );
  }

  const layoutHelp = LAYOUTS.find((option) => option.value === layout)?.help;

  return (
    <>
      <Section id="metricas" title="2. O que medir">
        <div className="space-y-5">
          <div className="space-y-2">
            {sourceControl}
            {sourceNote}
          </div>

          <fieldset className="space-y-2">
            <legend className="text-ink-2 mb-1 text-sm font-medium">
              Métricas (escolha uma ou várias)
            </legend>
            <div className="flex flex-wrap gap-2">
              {METRIC_ORDER.map((metric) => {
                const on = metrics.includes(metric);
                return (
                  <button
                    key={metric}
                    type="button"
                    aria-pressed={on}
                    title={METRIC_HELP[metric]}
                    onClick={() => toggleMetric(metric)}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                      on
                        ? "border-accent bg-accent-soft text-ink"
                        : "border-line bg-surface text-ink-2 hover:border-accent"
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`inline-flex size-4 items-center justify-center rounded border text-[10px] leading-none ${
                        on ? "border-accent bg-accent text-on-accent" : "border-line"
                      }`}
                    >
                      {on ? "✓" : ""}
                    </span>
                    {METRICS[metric].label}
                  </button>
                );
              })}
            </div>
            <ul className="text-muted space-y-0.5 text-xs">
              {metrics.map((metric) => (
                <li key={metric}>
                  <strong className="text-ink-2 font-medium">{METRICS[metric].label}:</strong>{" "}
                  {METRIC_HELP[metric]}
                </li>
              ))}
            </ul>
          </fieldset>

          <div className="space-y-2">
            <Segmented
              label="Organizar"
              options={LAYOUTS}
              value={layout}
              onChange={(value) => setLayoutChoice(value)}
            />
            <p className="text-muted text-sm">{layoutHelp}</p>
          </div>

          <Segmented label="Gráfico" options={KINDS} value={kind} onChange={setKind} />

          <PeriodFilter
            first={first}
            last={last}
            start={start}
            end={end}
            onChange={(nextStart, nextEnd) =>
              setRange(
                nextStart > nextEnd
                  ? { start: nextStart, end: nextStart }
                  : { start: nextStart, end: nextEnd },
              )
            }
          />
        </div>
      </Section>

      <Section id="resultado" title="3. Resultado">
        {missingNote ? <div className="mb-5">{missingNote}</div> : null}
        {unbalanced ? (
          <p className="bg-accent-soft text-ink mb-5 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl px-4 py-3 text-sm">
            <span>
              Os itens têm tamanhos muito diferentes (o maior corta cerca de {Math.round(disparity)}
              × mais que o menor), e o menor some nos gráficos. Para comparar de forma justa, inclua
              o percentual.
            </span>
            <button
              type="button"
              onClick={() => toggleMetric("pct")}
              className="text-accent font-semibold underline"
            >
              Adicionar % de corte
            </button>
          </p>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-2">
          {layout === "items"
            ? metrics.map((metric) => {
                const unit = metricUnit(entities, metric);
                const series: ChartSeries[] = entities.map((entity) => ({
                  key: entity.key,
                  label: entity.label,
                  color: entity.color,
                }));
                const resolved = resolveKind(kind, {
                  additive: METRICS[metric].additive,
                  seriesCount: entities.length,
                  stackedBars: false,
                });
                const base =
                  resolved.chart === "pie"
                    ? "Cada fatia é a soma do período escolhido."
                    : "Um item por cor, mês a mês.";
                return (
                  <MonthlyChart
                    key={metric}
                    title={`${METRICS[metric].label}: comparação${titleSuffix}`}
                    description={resolved.fellBack ? `${base}${PIE_NOTE}` : base}
                    rows={buildMetricRows(visible, metric, unit.divisor)}
                    series={series}
                    unit={unit.unit}
                    digits={unit.digits}
                    kind={resolved.chart}
                    periodFilter={false}
                  />
                );
              })
            : visible.flatMap((entity, index) => {
                const full = entities[index] ?? entity;
                return groupMetrics(metrics).map(({ group, metrics: grouped }) => {
                  const unit = groupUnit(full, grouped);
                  const series: ChartSeries[] = grouped.map((metric) => ({
                    key: metric,
                    label: METRICS[metric].label,
                    color: METRIC_COLORS[metric],
                  }));
                  const resolved = resolveKind(kind, {
                    additive: group !== "percent",
                    seriesCount: grouped.length,
                    stackedBars: group === "energy" && grouped.length > 1,
                  });
                  const both = grouped.includes("verified") && grouped.includes("curtailed");
                  const verified = entity.rows.reduce((sum, row) => sum + row.verified, 0);
                  const curtailed = entity.rows.reduce((sum, row) => sum + row.curtailed, 0);
                  const share =
                    verified + curtailed > 0 ? (curtailed / (verified + curtailed)) * 100 : null;
                  const title = `${
                    both
                      ? `${entity.label}: gerado × cortado`
                      : `${entity.label}: ${METRICS[grouped[0] ?? "verified"].label.toLowerCase()}`
                  }${titleSuffix}`;
                  const base =
                    both && share !== null
                      ? `No período, ${formatPercent(share)} da geração possível foi cortada por ordem do ONS.`
                      : "";
                  const description = `${base}${resolved.fellBack ? PIE_NOTE : ""}`.trim();
                  return (
                    <MonthlyChart
                      key={`${entity.key}-${group}`}
                      title={title}
                      description={description || undefined}
                      rows={buildSeparateRows(entity, grouped, unit.divisor)}
                      series={series}
                      unit={unit.unit}
                      digits={unit.digits}
                      kind={resolved.chart}
                      periodFilter={false}
                    />
                  );
                });
              })}
        </div>
      </Section>
    </>
  );
}
