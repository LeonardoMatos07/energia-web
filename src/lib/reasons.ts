export const REASONS = [
  {
    key: "rel",
    field: "curtailed_rel_mwh",
    abbreviation: "REL",
    name: "Confiabilidade elétrica",
    explanation:
      "O ONS reduziu a geração para manter a rede segura: limites de transmissão, estabilidade ou tensão em uma região, mesmo com todos os equipamentos funcionando.",
  },
  {
    key: "cnf",
    field: "curtailed_cnf_mwh",
    abbreviation: "CNF",
    name: "Indisponibilidade externa",
    explanation:
      "A energia não tinha como ser escoada porque uma linha, transformador ou subestação fora da usina estava desligado (manutenção ou falha).",
  },
  {
    key: "ene",
    field: "curtailed_ene_mwh",
    abbreviation: "ENE",
    name: "Razão energética",
    explanation:
      "Havia mais oferta de energia do que consumo no sistema naquele momento; o ONS cortou geração para equilibrar carga e geração.",
  },
  {
    key: "other",
    field: "curtailed_other_mwh",
    abbreviation: "Outros",
    name: "Outros motivos",
    explanation:
      "Restrições sem classificação nas três categorias acima ou com motivo não informado pelo ONS.",
  },
] as const;

export type ReasonKey = (typeof REASONS)[number]["key"];
export type ReasonField = (typeof REASONS)[number]["field"];
