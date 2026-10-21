import { absoluteUrl, SITE_NAME } from "./site";

const ONS_SOURCE = {
  "@type": "Dataset",
  name: "Dados abertos do ONS — restrição de operação por constrained-off de usinas eólicas e fotovoltaicas",
  url: "https://dados.ons.org.br/",
  creator: { "@type": "Organization", name: "Operador Nacional do Sistema Elétrico (ONS)" },
};

export function publisher() {
  return { "@type": "Organization", name: SITE_NAME, url: absoluteUrl("/") };
}

export function datasetJsonLd(opts: {
  name: string;
  description: string;
  path: string;
  temporalCoverage?: string;
  spatialCoverage?: string;
  keywords?: string[];
}) {
  return {
    "@type": "Dataset",
    name: opts.name,
    description: opts.description,
    url: absoluteUrl(opts.path),
    inLanguage: "pt-BR",
    isAccessibleForFree: true,
    creator: publisher(),
    isBasedOn: ONS_SOURCE,
    keywords: ["curtailment", "constrained-off", "energia eólica", "energia solar", "ONS", ...(opts.keywords ?? [])],
    variableMeasured: [
      { "@type": "PropertyValue", name: "Energia cortada", unitText: "MWh" },
      { "@type": "PropertyValue", name: "Geração verificada", unitText: "MWh" },
      { "@type": "PropertyValue", name: "Percentual de corte", unitText: "%" },
      { "@type": "PropertyValue", name: "Perda estimada", unitText: "BRL" },
    ],
    ...(opts.temporalCoverage ? { temporalCoverage: opts.temporalCoverage } : {}),
    ...(opts.spatialCoverage
      ? { spatialCoverage: { "@type": "Place", name: opts.spatialCoverage } }
      : {}),
  };
}

export function temporalCoverage(meses: string[]): string | undefined {
  if (meses.length === 0) return undefined;
  const sorted = [...meses].sort();
  return `${sorted[0]}/${sorted.at(-1)}`;
}
