/** Brazilian Portuguese formatting. Every value is shown with its unit. */

export const EMPTY = "—";

const MESES_CURTOS = [
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
const MESES_LONGOS = [
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

/** `1234.5` → `1.234,5` */
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

/** Picks MWh below 1 GWh and GWh above, so small plants don't show "0,0 GWh". */
export function formatEnergy(mwh: number | null | undefined) {
  if (!isNumber(mwh)) return EMPTY;
  return Math.abs(mwh) >= 1000 ? formatGWh(mwh) : formatMWh(mwh);
}

/** Percentages come from the API on a 0–100 scale. */
/** Pass `minDigits` in table columns so `70%` lines up as `70,0%` next to `70,2%`. */
export function formatPercent(value: number | null | undefined, maxDigits = 1, minDigits = 0) {
  return isNumber(value) ? `${formatNumber(value, maxDigits, minDigits)}%` : EMPTY;
}

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

/** `1234567` → `R$ 1.234.567` */
export function formatBRL(value: number | null | undefined) {
  return isNumber(value) ? brl.format(value) : EMPTY;
}

/**
 * `12345678` → `R$ 12,3 milhões`, `7712` → `R$ 7,7 mil`; values under R$ 1.000 fall back
 * to `formatBRL`. One scale per magnitude keeps columns of values comparable at a glance.
 */
export function formatBRLCompact(value: number | null | undefined) {
  if (!isNumber(value)) return EMPTY;
  const abs = Math.abs(value);
  if (abs >= 1e9) return `R$ ${formatNumber(value / 1e9, 1)} ${abs >= 2e9 ? "bilhões" : "bilhão"}`;
  if (abs >= 1e6) return `R$ ${formatNumber(value / 1e6, 1)} ${abs >= 2e6 ? "milhões" : "milhão"}`;
  if (abs >= 1e3) return `R$ ${formatNumber(value / 1e3, abs >= 1e5 ? 0 : 1)} mil`;
  return formatBRL(value);
}

function parseMes(mes: string): { year: number; month: number } | null {
  const match = /^(\d{4})-(\d{2})/.exec(mes);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12) return null;
  return { year, month };
}

/** `2026-09` → `set/2026` */
export function formatMesCurto(mes: string | null | undefined) {
  const parsed = mes ? parseMes(mes) : null;
  return parsed ? `${MESES_CURTOS[parsed.month - 1]}/${parsed.year}` : EMPTY;
}

/** `2026-09` → `setembro de 2026` */
export function formatMesLongo(mes: string | null | undefined) {
  const parsed = mes ? parseMes(mes) : null;
  return parsed ? `${MESES_LONGOS[parsed.month - 1]} de ${parsed.year}` : EMPTY;
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

/** ISO timestamp → `20/10/2026, 14:05` (Brasília time). */
export function formatDataHora(iso: string | null | undefined) {
  if (!iso) return EMPTY;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? EMPTY : dateTime.format(d);
}

/** ISO timestamp → `20 de outubro de 2026` (Brasília time). */
export function formatData(iso: string | null | undefined) {
  if (!iso) return EMPTY;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? EMPTY : dateOnly.format(d);
}

export function formatFonte(fonte: string) {
  switch (fonte) {
    case "eolica":
      return "Eólica";
    case "solar":
      return "Solar";
    case "total":
      return "Eólica + solar";
    default:
      return fonte;
  }
}
