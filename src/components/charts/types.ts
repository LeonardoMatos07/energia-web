export interface ChartSeries {
  key: string;
  label: string;
  color: string;
}

/** One row per month (`mes` = `YYYY-MM`); series values already in the chart's unit. */
export type ChartRow = { mes: string } & Record<string, number | string | null | undefined>;
