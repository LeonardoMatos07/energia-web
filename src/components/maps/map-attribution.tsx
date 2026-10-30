import { DataAttribution } from "@/components/data-attribution";
import { OnsAttribution } from "@/components/ons-attribution";
import type { DataSourceInfo } from "@/lib/api/types";

/** The outlines of the states: IBGE, Malha Territorial 2025 (see public/geo/*.source.json). */
export const IBGE_MESH_2025: DataSourceInfo = {
  slug: "ibge-malha-territorial-2025",
  publisher_name: "Instituto Brasileiro de Geografia e Estatística (IBGE)",
  dataset_name: "Malha Territorial 2025",
  dataset_url:
    "https://geoftp.ibge.gov.br/organizacao_do_territorio/malhas_territoriais/malhas_municipais/municipio_2025/",
  license_code: "dado público (Lei 12.527/2011)",
  license_url: "https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2011/lei/l12527.htm",
  license_verified_at: "2026-10-30",
  attribution_text:
    "Limites: IBGE, Malha Territorial 2025, simplificados para visualização (não servem para medir áreas ou fronteiras); uso conforme a Nota Metodológica do IBGE.",
  update_frequency: "Anual",
};

export function MapAttribution({ dataset }: { dataset: string }) {
  return (
    <div>
      <OnsAttribution dataset={dataset} />
      <DataAttribution source={IBGE_MESH_2025} />
    </div>
  );
}
