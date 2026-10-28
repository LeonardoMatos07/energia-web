import "server-only";
import { apiTry, withQuery } from "./client";
import type {
  AggregateSource,
  CurtailmentSummary,
  ForecastModelMeta,
  ForecastResponse,
  ForecastScope,
  GroupRankingResponse,
  HourlyProfileResponse,
  MonthsResponse,
  PlantDetailResponse,
  PlantKind,
  PlantListResponse,
  Report,
  ReportListResponse,
  Source,
  StateCurtailmentResponse,
  SubsystemCurtailmentResponse,
} from "./types";

export function getSubsystemCurtailment(
  source: AggregateSource = "total",
  start?: string,
  end?: string,
) {
  return apiTry<SubsystemCurtailmentResponse>(
    withQuery("/v1/curtailment/subsystems", { source, start, end }),
    { tags: ["curtailment"] },
  );
}

export function getCurtailmentSummary(
  scope: string,
  start?: string,
  end?: string,
  source: AggregateSource = "total",
) {
  return apiTry<CurtailmentSummary>(
    withQuery("/v1/curtailment/summary", { scope, source, start, end }),
    { tags: ["curtailment", "plants"] },
  );
}

export function getGroupRanking(
  group: "operators" | "connection-points",
  options: { source?: AggregateSource; start?: string; end?: string; limit?: number } = {},
) {
  return apiTry<GroupRankingResponse>(withQuery(`/v1/rankings/${group}`, options), {
    tags: ["curtailment", "plants"],
  });
}

export function getHourlyProfile(
  scope: string,
  source: AggregateSource = "total",
  start?: string,
  end?: string,
) {
  return apiTry<HourlyProfileResponse>(
    withQuery("/v1/curtailment/hourly", { scope, source, start, end }),
    { tags: ["curtailment"] },
  );
}

export function getStateCurtailment(
  state: string,
  source: AggregateSource = "total",
  month?: string,
) {
  return apiTry<StateCurtailmentResponse>(
    withQuery(`/v1/curtailment/states/${encodeURIComponent(state)}`, { source, month }),
    { tags: ["curtailment", "plants"] },
  );
}

export interface PlantFilters {
  search?: string;
  state?: string;
  source?: Source;
  kind?: PlantKind;
  page?: number;
  pageSize?: number;
}

export function getPlants({ pageSize, ...filters }: PlantFilters = {}) {
  return apiTry<PlantListResponse>(withQuery("/v1/plants", { ...filters, page_size: pageSize }), {
    tags: ["plants"],
  });
}

export function getPlant(slug: string) {
  return apiTry<PlantDetailResponse>(`/v1/plants/${encodeURIComponent(slug)}`, {
    tags: ["plants", "curtailment"],
  });
}

export function getMonths() {
  return apiTry<MonthsResponse>("/v1/months", { tags: ["curtailment"] });
}

export function getReports() {
  return apiTry<ReportListResponse>("/v1/reports", { tags: ["reports"] });
}

export function getReport(slug: string) {
  return apiTry<Report>(`/v1/reports/${encodeURIComponent(slug)}`, {
    tags: ["reports"],
  });
}

// The forecast is published in batches (at most daily), so a short fixed cache is enough.
const FORECAST_REVALIDATE_SECONDS = 1_800;

export function getForecast(scope: string, source: Source = "wind", days = 7) {
  return apiTry<ForecastResponse>(withQuery("/v1/forecast", { scope, source, days }), {
    revalidate: FORECAST_REVALIDATE_SECONDS,
  });
}

export function getForecastScopes() {
  return apiTry<ForecastScope[]>("/v1/forecast/scopes", {
    revalidate: FORECAST_REVALIDATE_SECONDS,
  });
}

export function getForecastModel() {
  return apiTry<ForecastModelMeta>("/v1/forecast/model", {
    revalidate: FORECAST_REVALIDATE_SECONDS,
  });
}
