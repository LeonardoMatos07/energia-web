import "server-only";
import { apiTry, withQuery } from "./client";
import type {
  AggregateSource,
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
