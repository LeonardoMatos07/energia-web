import type { DataSourceInfo } from "@/lib/api/types";
import { formatDate } from "@/lib/format";

/**
 * Credit for a public dataset: who publishes it, under which license and where it came from.
 * Shown under every chart or table that uses the data (CC BY and ODbL require the attribution).
 */
export function DataAttribution({ source, note }: { source: DataSourceInfo; note?: string }) {
  return (
    <p className="text-muted mt-3 text-xs leading-5" data-testid="data-attribution">
      {source.attribution_text}{" "}
      <a
        className="underline underline-offset-2"
        href={source.license_url}
        target="_blank"
        rel="noopener noreferrer"
      >
        Licença {source.license_code}
      </a>
      {" · "}
      <a
        className="underline underline-offset-2"
        href={source.dataset_url}
        target="_blank"
        rel="noopener noreferrer"
      >
        Conjunto de dados de {source.publisher_name}
      </a>
      {` · licença conferida em ${formatDate(`${source.license_verified_at}T12:00:00-03:00`)}`}
      {note ? ` · ${note}` : ""}
    </p>
  );
}
