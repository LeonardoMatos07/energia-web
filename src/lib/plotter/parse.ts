export type DecimalSeparator = "auto" | "," | ".";

export const MAX_FILE_BYTES = 5 * 1024 * 1024;
export const MAX_ROWS = 50_000;

const NUMBER_PATTERN = /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/;

function clean(cell: string): string {
  return cell.replace(/[\s ]/g, "");
}

/** Which separator does one cell vote for? `null` when it cannot tell. */
function vote(cell: string): "," | "." | null {
  const text = clean(cell).replace(/[eE][+-]?\d+$/, "");
  const lastComma = text.lastIndexOf(",");
  const lastDot = text.lastIndexOf(".");
  if (lastComma >= 0 && lastDot >= 0) return lastComma > lastDot ? "," : ".";
  if (lastComma >= 0) {
    const thousands = /^[+-]?\d{1,3}(,\d{3}){2,}$/.test(text);
    return thousands ? "." : ",";
  }
  if (lastDot >= 0) {
    if (/^[+-]?\d{1,3}(\.\d{3}){2,}$/.test(text)) return ",";
    return /^[+-]?\d*\.\d+$/.test(text) && !/^[+-]?\d{1,3}\.\d{3}$/.test(text) ? "." : null;
  }
  return null;
}

/** The decimal separator of a whole column, decided by majority; Brazilian comma wins ties. */
export function detectDecimal(cells: readonly string[]): "," | "." {
  let comma = 0;
  let dot = 0;
  for (const cell of cells) {
    const result = vote(cell);
    if (result === ",") comma += 1;
    else if (result === ".") dot += 1;
  }
  if (comma === 0 && dot === 0) return ".";
  return comma >= dot ? "," : ".";
}

export function parseNumber(cell: string | undefined, decimal: "," | "."): number | null {
  if (cell === undefined) return null;
  let text = clean(cell);
  if (text === "") return null;
  const parts = text.split(decimal);
  if (parts.length > 2) return null;
  const [integer = "", fraction] = parts;
  const thousands = decimal === "," ? "." : ",";
  const grouped = decimal === "," ? /^[+-]?\d{1,3}(\.\d{3})+$/ : /^[+-]?\d{1,3}(,\d{3})+$/;
  let whole = integer;
  if (integer.includes(thousands)) {
    if (!grouped.test(integer)) return null;
    whole = integer.split(thousands).join("");
  }
  text = fraction === undefined ? whole : `${whole}.${fraction}`;
  if (!NUMBER_PATTERN.test(text)) return null;
  const value = Number(text);
  return Number.isFinite(value) ? value : null;
}

export interface ParsedColumn {
  values: (number | null)[];
  /** Non-empty cells that are not numbers: they are left out of the chart. */
  ignored: number;
  decimal: "," | ".";
}

export function parseColumn(cells: readonly string[], setting: DecimalSeparator): ParsedColumn {
  const decimal = setting === "auto" ? detectDecimal(cells) : setting;
  let ignored = 0;
  const values = cells.map((cell) => {
    const value = parseNumber(cell, decimal);
    if (value === null && clean(cell) !== "") ignored += 1;
    return value;
  });
  return { values, ignored, decimal };
}

export function detectDelimiter(text: string): "\t" | ";" | "," | " " {
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");
  if (lines.some((line) => line.includes("\t"))) return "\t";
  if (lines.some((line) => line.includes(";"))) return ";";
  const spaced = lines.every((line) => line.trim().split(/\s+/).length >= 2);
  if (spaced && lines.length > 0) return " ";
  return ",";
}

function splitQuoted(line: string, delimiter: string): string[] {
  const cells: string[] = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]!;
    if (quoted) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else if (char === '"') quoted = false;
      else current += char;
    } else if (char === '"') quoted = true;
    else if (char === delimiter) {
      cells.push(current);
      current = "";
    } else current += char;
  }
  cells.push(current);
  return cells;
}

export interface ParsedTable {
  rows: string[][];
  delimiter: string;
  truncated: boolean;
}

/** Pasted text or a CSV/TSV file to a rectangular table of strings. */
export function parseTable(text: string, delimiter?: string): ParsedTable {
  const chosen = delimiter ?? detectDelimiter(text);
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");
  const truncated = lines.length > MAX_ROWS;
  const rows = lines
    .slice(0, MAX_ROWS)
    .map((line) =>
      chosen === " "
        ? line.trim().split(/\s+/)
        : splitQuoted(line, chosen).map((cell) => cell.trim()),
    );
  const width = Math.max(0, ...rows.map((row) => row.length));
  return {
    rows: rows.map((row) => [...row, ...Array<string>(width - row.length).fill("")]),
    delimiter: chosen,
    truncated,
  };
}

/** Is the first row a header? True when it has text where the next row has numbers. */
export function detectHeader(rows: readonly string[][]): boolean {
  const [first, second] = rows;
  if (!first || !second) return false;
  const decimal = detectDecimal(rows.slice(1).flat());
  let textOverNumber = 0;
  let numbers = 0;
  first.forEach((cell, index) => {
    const isNumber = parseNumber(cell, decimal) !== null;
    if (isNumber) numbers += 1;
    if (!isNumber && cell.trim() !== "" && parseNumber(second[index], decimal) !== null) {
      textOverNumber += 1;
    }
  });
  return textOverNumber > 0 && numbers === 0;
}

export interface FileReadResult {
  tables: { name: string; rows: string[][] }[];
  truncated: boolean;
}

export class FileTooLargeError extends Error {}

/** CSV, TSV and TXT are read as text; XLSX is read with SheetJS, loaded on demand. */
export async function readFile(file: File): Promise<FileReadResult> {
  if (file.size > MAX_FILE_BYTES) {
    throw new FileTooLargeError("O arquivo passa de 5 MB.");
  }
  if (/\.xlsx$/i.test(file.name)) {
    const XLSX = await import("xlsx");
    const book = XLSX.read(await file.arrayBuffer(), { type: "array" });
    let truncated = false;
    const tables = book.SheetNames.map((name) => {
      const sheet = book.Sheets[name];
      const all = sheet
        ? (XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: "" }) as unknown[][])
        : [];
      if (all.length > MAX_ROWS) truncated = true;
      return {
        name,
        rows: all.slice(0, MAX_ROWS).map((row) => row.map((cell) => String(cell ?? ""))),
      };
    });
    return { tables, truncated };
  }
  const parsed = parseTable(await file.text());
  return { tables: [{ name: file.name, rows: parsed.rows }], truncated: parsed.truncated };
}
