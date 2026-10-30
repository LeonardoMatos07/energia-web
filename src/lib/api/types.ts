export type Source = "wind" | "solar";
export type AggregateSource = Source | "total";
export type Subsystem = "N" | "NE" | "S" | "SE";
export type SubsystemOrSin = Subsystem | "SIN";
export type PlantKind = "plant" | "cluster";
export type PriceBasis = "PLD" | "CMO" | "PLD_FILLED" | "CMO_FILLED";
export type LoadRunStatus = "running" | "success" | "failed";

export type Month = string;
export type Timestamp = string;

export interface CurtailmentAggregateBase {
  source: AggregateSource;
  month: Month;
  verified_generation_mwh: number;
  curtailed_mwh: number;
  curtailment_pct: number | null;
  curtailed_rel_mwh: number;
  curtailed_cnf_mwh: number;
  curtailed_ene_mwh: number;
  curtailed_other_mwh: number;
  estimated_loss_brl: number | null;
  affected_plants: number;
  updated_at: Timestamp;
}

export interface CurtailmentSummary {
  scope: string;
  source: AggregateSource;
  start: Month | null;
  end: Month | null;
  months: number;
  verified_generation_mwh: number;
  curtailed_mwh: number;
  curtailed_rel_mwh: number;
  curtailed_cnf_mwh: number;
  curtailed_ene_mwh: number;
  curtailed_other_mwh: number;
  curtailment_pct: number | null;
  estimated_loss_brl: number | null;
  affected_plants: number;
}

export interface StateMonthlyCurtailment extends CurtailmentAggregateBase {
  state: string;
}

export interface SubsystemMonthlyCurtailment extends CurtailmentAggregateBase {
  subsystem: SubsystemOrSin | (string & {});
}

export interface PlantMonthlyCurtailment {
  plant_id: string;
  month: Month;
  verified_generation_mwh: number;
  curtailed_mwh: number;
  curtailment_pct: number | null;
  curtailed_rel_mwh: number;
  curtailed_cnf_mwh: number;
  curtailed_ene_mwh: number;
  curtailed_other_mwh: number;
  estimated_loss_brl: number | null;
  price_basis: PriceBasis | (string & {}) | null;
  restricted_hours: number;
  state_avg_curtailment_pct: number | null;
  national_rank: number | null;
  state_rank: number | null;
  updated_at: Timestamp;
}

export interface PlantSummary {
  id: string;
  kind: PlantKind;
  name: string;
  slug: string;
  source: Source;
  state: string;
  subsystem: Subsystem | (string & {});
  capacity_mw: number | null;
}

export interface Plant extends PlantSummary {
  cluster_id: string | null;
  ceg: string | null;
  connection_point: string | null;
  operator: string | null;
  updated_at: Timestamp;
}

export interface RankedPlant extends PlantSummary {
  rank: number;
  curtailed_mwh: number;
  curtailment_pct: number | null;
  estimated_loss_brl: number | null;
}

export interface ReportSummary {
  month: Month;
  title: string;
  slug: string;
  summary: string | null;
  published_at: Timestamp | null;
}

export interface Report extends ReportSummary {
  content: string;
}

export interface LoadRun {
  id: number;
  dataset: string;
  period: Month | null;
  source_file: string | null;
  checksum: string | null;
  row_count: number | null;
  started_at: Timestamp;
  finished_at: Timestamp | null;
  status: LoadRunStatus;
  detail: string | null;
}

export interface SubsystemCurtailmentResponse {
  items: SubsystemMonthlyCurtailment[];
}

export interface StateCurtailmentResponse {
  series: StateMonthlyCurtailment[];
  ranking: RankedPlant[];
  ranking_month: Month | null;
}

export interface PlantListResponse {
  items: PlantSummary[];
  total: number;
  page: number;
  page_size: number;
}

export interface PlantDetailResponse {
  plant: Plant;
  cluster: PlantSummary | null;
  cluster_plants: PlantSummary[];
  series: PlantMonthlyCurtailment[];
}

export interface RankingResponse {
  month: Month | null;
  items: RankedPlant[];
}

export interface MonthsResponse {
  months: Month[];
}

export interface ReportListResponse {
  items: ReportSummary[];
}

export interface MessageResponse {
  message: string;
}

export interface NewsletterSignup {
  email: string;
  consent: true;
  source?: string;
}

export interface ConfirmedResponse {
  confirmed: boolean;
}

export interface UnsubscribedResponse {
  unsubscribed: boolean;
}

export interface LoadRunListResponse {
  items: LoadRun[];
}

export interface AdminReport extends Report {
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface AdminReportListResponse {
  items: AdminReport[];
}

export interface ReportInput {
  month: Month;
  title: string;
  slug?: string;
  summary?: string | null;
  content: string;
  publish: boolean;
}

export interface RevalidateInput {
  tags?: CacheTag[];
}

export interface RevalidateResponse {
  tags: CacheTag[];
  cache_cleared: boolean;
  entries_removed: number;
  web_revalidated: boolean;
  detail: string | null;
}

export interface ApiErrorBody {
  detail: string | unknown;
}

export const CACHE_TAGS = ["curtailment", "plants", "reports", "forecast", "news"] as const;
export type CacheTag = (typeof CACHE_TAGS)[number];

export type MemberRole =
  "researcher" | "student" | "professional" | "journalist" | "public_sector" | "investor" | "other";

export interface MemberProfile {
  id: string;
  email: string;
  name: string;
  role: MemberRole;
  organization: string | null;
  job_title: string | null;
  segment: string | null;
  institution: string | null;
  regions: string[];
  plants: string[];
  interests: string[];
  marketing_opt_in: boolean;
  created_at: Timestamp;
}

export interface LoginResponse {
  session_token: string;
  expires_at: Timestamp;
  member: MemberProfile;
}

export interface SignupPayload {
  email: string;
  password: string;
  name: string;
  role: MemberRole;
  organization?: string | null;
  job_title?: string | null;
  segment?: string | null;
  company_size?: string | null;
  institution?: string | null;
  study_level?: string | null;
  regions: string[];
  plants: string[];
  interests: string[];
  phone?: string | null;
  referral?: string | null;
  marketing_opt_in: boolean;
  consent: true;
  source?: string | null;
}

export interface RankedGroup {
  rank: number;
  name: string;
  state: string | null;
  plants: number;
  affected_plants: number;
  verified_generation_mwh: number;
  curtailed_mwh: number;
  curtailment_pct: number | null;
  estimated_loss_brl: number | null;
  compensable_mwh: number;
}

export interface GroupRankingResponse {
  group: "operator" | "connection_point";
  source: AggregateSource;
  start: Month | null;
  end: Month | null;
  items: RankedGroup[];
}

export type DayType = "weekday" | "weekend";

export interface HourlyPoint {
  day_type: DayType;
  hour: number;
  avg_curtailed_mwh: number;
  avg_generation_mwh: number;
  curtailment_pct: number | null;
}

export interface HourlyProfileResponse {
  scope: string;
  source: AggregateSource;
  start: Month | null;
  end: Month | null;
  months: number;
  points: HourlyPoint[];
}

export interface UsageTotals {
  events: number;
  page_views: number;
  members_active: number;
  visitors: number;
  sessions: number;
  new_members: number;
}

export interface UsageSummary {
  start: Timestamp;
  end: Timestamp;
  days: number;
  include_bots: boolean;
  totals: UsageTotals;
  daily: { day: string; page_views: number; interactions: number; members: number }[];
  sections: { section: string; views: number; members: number }[];
  entities: { entity_type: string; entity_id: string; views: number; members: number }[];
  searches: { name: string; count: number }[];
  interactions: { name: string; count: number }[];
  compared: { name: string; count: number }[];
  funnel: { step: string; count: number }[];
  roles: { role: string | null; segment: string | null; members: number; events: number }[];
  active_leads: {
    member_id: string;
    name: string;
    email: string;
    organization: string | null;
    role: string;
    lead_tier: string;
    lead_score: number;
    events: number;
    last_seen: Timestamp | null;
  }[];
}

export interface SignupResponse {
  message: string;
  dev_code: string | null;
}

export type ForecastLevel = "baixo" | "medio" | "alto";

export interface ForecastPoint {
  ts: string;
  risk_probability: number;
  expected_curtailment_pct: number;
  level: ForecastLevel;
  applicable: boolean;
}

export interface ForecastResponse {
  scope: string;
  source: Source;
  risk_definition: string;
  origin_ts: string;
  valid_from: string;
  valid_to: string;
  generated_at: string;
  data_through: string;
  stale_days: number;
  model_version: string;
  model_trained_at: string;
  points: ForecastPoint[];
}

export interface ForecastScope {
  scope: string;
  source: Source;
}

/** Metrics of one model on the untouched test period. `mae_pp` is in percentage points. */
export interface ForecastModelMetrics {
  mae_pp: number;
  rmse_pp: number;
  roc_auc: number;
  pr_auc: number;
  brier: number;
  ece: number;
  brier_skill?: number;
}

export interface ForecastInterval {
  delta: number;
  ci_low: number;
  ci_high: number;
}

export interface ForecastCalibrationBin {
  mean_pred: number;
  obs: number;
  n: number;
}

export interface ForecastModelMeta {
  model_version: string;
  trained_at: string;
  data_period: Record<string, { start: string; end: string; n_series: number }>;
  n_series: number;
  n_rows: number;
  metrics: {
    test?: Record<string, ForecastModelMetrics>;
    test_bootstrap_vs_baseline?: Record<
      string,
      { abs_error?: ForecastInterval; brier?: ForecastInterval }
    >;
    test_start?: string;
    test_rows?: number;
    test_base_rate?: number;
  };
  calibration: { bins?: Record<string, ForecastCalibrationBin[]> };
  feature_importance: Record<string, number>;
  model_card: { limitations?: string[]; protocol?: string };
  last_run_at: string | null;
  last_data_through: string | null;
}

export type NewsStatus = "published" | "hidden" | "removed_on_request";

export interface RelatedLink {
  label: string;
  href: string;
}

export interface NewsSource {
  slug: string;
  publisher_name: string;
  homepage_url: string;
  fetch_method: string;
  license_code: string;
  license_url: string;
  license_verified_at: string | null;
  license_evidence_url: string | null;
  active: boolean;
}

export interface NewsSourceListResponse {
  items: NewsSource[];
}

export interface NewsItem {
  id: number;
  source: string;
  publisher_name: string;
  license_code: string;
  license_url: string;
  url: string;
  title: string;
  summary: string | null;
  published_at: string;
  source_updated_at: string | null;
  topics: string[];
  has_editor_note: boolean;
}

export interface NewsItemDetail extends NewsItem {
  editor_note: string | null;
  editor_note_by: string | null;
  editor_note_at: string | null;
  related_links: RelatedLink[];
}

export interface NewsListResponse {
  items: NewsItem[];
  next_cursor: string | null;
}

export interface AdminNewsItem extends NewsItemDetail {
  status: NewsStatus;
}

export interface AdminNewsList {
  items: AdminNewsItem[];
  next_cursor: string | null;
}

export interface RegulatoryAct {
  id: number;
  organ: string;
  act_type: string;
  act_number: string | null;
  act_date: string | null;
  title: string;
  summary: string | null;
  dou_date: string;
  dou_section: number | null;
  dou_edition: string | null;
  dou_page: string | null;
  dou_url: string;
  topics: string[];
}

export interface RegulatoryActDetail extends RegulatoryAct {
  body: string | null;
}

export interface RegulatoryActListResponse {
  items: RegulatoryAct[];
  next_cursor: string | null;
}
