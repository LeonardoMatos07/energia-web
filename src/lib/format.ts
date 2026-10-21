export const EMPTY = "—";

const SHORT_MONTHS = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];
const LONG_MONTHS = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

const numberFormatters = new Map<string, Intl.NumberFormat>();

function nf(min: number, max: number): Intl.NumberFormat {
  const key = `${min}-${max}`;
  let f = numberFormatters.get(key);
  if (!f) {
    f = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: min, maximumFractionDigits: max });
    numberFormatters.set(key, f);
  }
  return f;
}

function isNumber(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function formatNumber(value: number | null | undefined, maxDigits = 1, minDigits = 0) {
  return isNumber(value) ? nf(minDigits, maxDigits).format(value) : EMPTY;
}

export function formatMWh(mwh: number | null | undefined, maxDigits = 1) {
  return isNumber(mwh) ? `${formatNumber(mwh, maxDigits)} MWh` : EMPTY;
}

export function mwhToGwh(mwh: number): number {
  return mwh / 1000;
}

export function formatGWh(mwh: number | null | undefined, maxDigits = 1) {
  return isNumber(mwh) ? `${formatNumber(mwhToGwh(mwh), maxDigits)} GWh` : EMPTY;
}

export function formatEnergy(mwh: number | null | undefined) {
  if (!isNumber(mwh)) return EMPTY;
  return Math.abs(mwh) >= 1000 ? formatGWh(mwh) : formatMWh(mwh);
}

export function formatPercent(value: number | null | undefined, maxDigits = 1, minDigits = 0) {
  return isNumber(value) ? `${formatNumber(value, maxDigits, minDigits)}%` : EMPTY;
}

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

export function formatBRL(value: number | null | undefined) {
  return isNumber(value) ? brl.format(value) : EMPTY;
}

export function formatBRLCompact(value: number | null | undefined) {
  if (!isNumber(value)) return EMPTY;
  const abs = Math.abs(value);
  if (abs >= 1e9) return `R$ ${formatNumber(value / 1e9, 1)} ${abs >= 2e9 ? "bilhões" : "bilhão"}`;
  if (abs >= 1e6) return `R$ ${formatNumber(value / 1e6, 1)} ${abs >= 2e6 ? "milhões" : "milhão"}`;
  if (abs >= 1e3) return `R$ ${formatNumber(value / 1e3, abs >= 1e5 ? 0 : 1)} mil`;
  return formatBRL(value);
}

function parseMonth(month: string): { year: number; month: number } | null {
  const match = /^(\d{4})-(\d{2})/.exec(month);
  if (!match) return null;
  const year = Number(match[1]);
  const monthNumber = Number(match[2]);
  if (monthNumber < 1 || monthNumber > 12) return null;
  return { year, month: monthNumber };
}

export function formatShortMonth(month: string | null | undefined) {
  const parsed = month ? parseMonth(month) : null;
  return parsed ? `${SHORT_MONTHS[parsed.month - 1]}/${parsed.year}` : EMPTY;
}

export function formatLongMonth(month: string | null | undefined) {
  const parsed = month ? parseMonth(month) : null;
  return parsed ? `${LONG_MONTHS[parsed.month - 1]} de ${parsed.year}` : EMPTY;
}

const dateTime = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
});
const dateOnly = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "long",
  timeZone: "America/Sao_Paulo",
});

export function formatDateTime(iso: string | null | undefined) {
  if (!iso) return EMPTY;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? EMPTY : dateTime.format(d);
}

export function formatDate(iso: string | null | undefined) {
  if (!iso) return EMPTY;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? EMPTY : dateOnly.format(d);
}

export function formatSource(source: string) {
  switch (source) {
    case "wind":
      return "Eólica";
    case "solar":
      return "Solar";
    case "total":
      return "Eólica + solar";
    default:
      return source;
  }
}
