import { analysisDownloadHref, type DownloadFilters } from "@/lib/downloads";

const linkClass =
  "text-accent-strong hover:bg-surface-2 block rounded px-3 py-2 text-sm font-medium underline-offset-2 hover:underline";
const groupClass = "text-muted px-3 pt-2 text-xs font-semibold uppercase";

export function AnalysisDownloads({ filters }: { filters: DownloadFilters }) {
  return (
    <details className="relative inline-block">
      <summary className="border-line bg-surface text-ink hover:bg-surface-2 cursor-pointer list-none rounded-md border px-4 py-2 text-sm font-semibold">
        Baixar
      </summary>
      <div className="border-line bg-surface absolute right-0 z-10 mt-2 w-64 rounded-md border p-2 shadow-lg">
        <p className={groupClass}>Relatório</p>
        <a className={linkClass} href={analysisDownloadHref("pdf", filters)} download>
          PDF
        </a>
        <p className={groupClass}>Dados completos</p>
        <a className={linkClass} href={analysisDownloadHref("xlsx", filters)} download>
          Excel (.xlsx)
        </a>
        <a className={linkClass} href={analysisDownloadHref("csv", filters)} download>
          CSV (.zip)
        </a>
      </div>
    </details>
  );
}

export function ReportDownload({ slug }: { slug: string }) {
  return (
    <a
      href={`/api/baixar/relatorio/${slug}`}
      download
      className="border-line bg-surface text-ink hover:bg-surface-2 inline-block rounded-md border px-4 py-2 text-sm font-semibold"
    >
      Baixar em PDF
    </a>
  );
}
