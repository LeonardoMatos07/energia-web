export interface ChartSeries {
  key: string;
  label: string;
  color: string;
}

export type ChartRow = { month: string } & Record<string, number | string | null | undefined>;
